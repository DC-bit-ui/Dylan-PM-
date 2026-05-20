/**
 * Snapshot state detector — per-Stormboy-contact, "has a HORIZON
 * Snapshot been requested / produced / sent / followed up on?"
 *
 * Replaces the static-template "Send KCT or contract draft now"
 * next-step text in the WORK tab Farm Visit completed list with an
 * evidence-driven progression. Each state is justified by the actual
 * signals found, surfaced in the UI so the team can verify.
 *
 * SIGNAL SOURCES + COVERAGE:
 *   1. HubSpot email engagements — outbound emails to the contact
 *      with subject matching /snapshot|horizon snapshot/i.
 *      Also picks up customer replies (incoming emails) to gauge
 *      whether the snapshot has been engaged with.
 *      → COVERED via /crm/v4/objects/contacts/{id}/associations/emails
 *
 *   2. HubSpot custom property `storm_boy__horizon_snapshot_created`
 *      (manual Yes/No flag on the contact).
 *      → COVERED — already pulled by stormboy-detail
 *
 *   3. HubSpot custom property `storm_boy__proceed_to_kct_stage`
 *      (manual Yes/No flag indicating customer has expressed they
 *      are willing to progress to KCT).
 *      → COVERED — already pulled
 *
 *   4. HubSpot HORIZON Snapshot ticket pipeline
 *      → NOT COVERED — Private App token lacks
 *      crm.objects.tickets.read scope (verified 2026-05-20 via direct
 *      probe, 403 "scope needed for this API call isn't available").
 *      The state detector flags this gap in its caveats output.
 *
 *   5. Operation Stormboy Teams Channel > Deals
 *      → NOT COVERED — server has no Microsoft Graph integration.
 *      The state detector flags this gap.
 *
 * STATE MACHINE (per contact, Farm Visit completed):
 *
 *   NOT_REQUESTED  — no outbound snapshot email AND custom flag != 'Yes'
 *     → "Request HORIZON Snapshot — none sent yet"
 *
 *   REQUESTED_NO_EMAIL — custom flag = 'Yes' but no outbound snapshot
 *     email found (snapshot produced internally but never sent to
 *     customer, OR sent via a channel we can't see — Teams/etc.)
 *     → "Confirm snapshot was sent to customer — internal flag set but no email evidence"
 *
 *   SENT_AWAITING_REPLY — outbound snapshot email exists, no customer
 *     reply since, age <= AWAIT_DAYS
 *     → "Follow up on snapshot in X days if no reply"
 *
 *   SENT_NO_REPLY_STALE — outbound snapshot email > AWAIT_DAYS old,
 *     no customer reply
 *     → "Snapshot sent Xd ago, no reply — re-engage with phone call"
 *
 *   SENT_REPLIED — outbound snapshot + at least one incoming email
 *     since. Customer engaged but no clear progression signal.
 *     → "Customer replied — confirm intent + propose KCT next step"
 *
 *   WILLING_TO_PROGRESS — storm_boy__proceed_to_kct_stage = 'Yes' OR
 *     positive sentiment in last note since snapshot sent
 *     → "Progress to KCT pipeline · hand to ops"
 *
 *   COLD — visit + last contact both >= COLD_DAYS regardless of
 *     snapshot state (existing logic preserved)
 *     → existing "Disengage politely" message
 *
 * Each state output carries an `evidence[]` array — concrete sources
 * the detector used. Renders in the expanded card so reps can verify.
 */

const { hubspotFetch } = require('./hubspot-client');

const HUBSPOT_BASE = 'https://api.hubapi.com';
const AWAIT_DAYS = 7;          // window to wait before chasing a sent snapshot
const COLD_DAYS = 28;
const POSITIVE_KEYWORDS = [
  'yes', 'sign', 'proceed', 'next step', 'ready', 'keen', 'happy',
  'agreed', 'go ahead', 'let\'s', 'lets do', 'sound good', 'sounds good',
  'when can we', 'how do we'
];

async function hubspotPost(token, urlPath, body) {
  const res = await hubspotFetch(HUBSPOT_BASE + urlPath, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HubSpot ${urlPath} → ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

// Batch lookup of contact → email associations. Returns { contactId: [emailId, ...] }.
async function fetchEmailAssociations(token, contactIds) {
  if (!contactIds.length) return {};
  const map = {};
  for (let i = 0; i < contactIds.length; i += 100) {
    const batch = contactIds.slice(i, i + 100);
    try {
      const data = await hubspotPost(token, '/crm/v4/associations/contacts/emails/batch/read', {
        inputs: batch.map(id => ({ id: String(id) })),
      });
      (data.results || []).forEach(r => {
        const fromId = r.from && r.from.id;
        if (!fromId) return;
        map[fromId] = (r.to || []).map(t => String(t.toObjectId));
      });
    } catch (e) {
      console.warn('[snapshot-state] email association batch failed:', e.message);
    }
  }
  return map;
}

// Batch-read emails with snapshot-relevant properties.
async function fetchEmails(token, emailIds) {
  if (!emailIds.length) return {};
  const map = {};
  const props = ['hs_email_subject', 'hs_email_direction', 'hs_timestamp',
                 'hs_email_from_email', 'hs_email_to_email'];
  for (let i = 0; i < emailIds.length; i += 100) {
    const batch = emailIds.slice(i, i + 100);
    try {
      const data = await hubspotPost(token, '/crm/v3/objects/emails/batch/read', {
        properties: props,
        inputs: batch.map(id => ({ id: String(id) })),
      });
      (data.results || []).forEach(e => { map[e.id] = e; });
    } catch (e) {
      console.warn('[snapshot-state] email read batch failed:', e.message);
    }
  }
  return map;
}

function isSnapshotEmail(email) {
  const subj = (email.properties.hs_email_subject || '').toLowerCase();
  // Subject must mention snapshot — not just "horizon" (matches scholarships,
  // generic mentions). Also accept "horizon report" as a fallback variant.
  return /snapshot|horizon report/.test(subj);
}

function isOutbound(email) {
  // HubSpot direction values: 'EMAIL' (outbound from rep), 'INCOMING_EMAIL',
  // 'FORWARDED_EMAIL'. Treat EMAIL as outbound.
  return email.properties.hs_email_direction === 'EMAIL';
}

function isInbound(email) {
  return email.properties.hs_email_direction === 'INCOMING_EMAIL';
}

function daysSince(iso) {
  if (!iso) return null;
  const ms = Date.parse(iso);
  if (!ms) return null;
  return Math.floor((Date.now() - ms) / (24 * 60 * 60 * 1000));
}

function classifyState(contact, emails, lastNote) {
  // Sort emails ascending by timestamp
  const sorted = emails
    .map(e => ({
      id: e.id,
      subject: e.properties.hs_email_subject || '',
      direction: e.properties.hs_email_direction || '',
      timestamp: e.properties.hs_timestamp,
      from: e.properties.hs_email_from_email,
    }))
    .filter(e => e.timestamp)
    .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));

  const snapshotEmails = sorted.filter(e => /snapshot|horizon report/i.test(e.subject));
  const outboundSnapshots = snapshotEmails.filter(e => e.direction === 'EMAIL');
  const inboundSnapshots = snapshotEmails.filter(e => e.direction === 'INCOMING_EMAIL');
  const lastOutboundSnapshot = outboundSnapshots[outboundSnapshots.length - 1] || null;
  const lastInboundSnapshot = inboundSnapshots[inboundSnapshots.length - 1] || null;

  const snapshotProp = contact.properties.storm_boy__horizon_snapshot_created;
  const proceedProp = contact.properties.storm_boy__proceed_to_kct_stage;
  const noteText = lastNote ? (lastNote.body || '').toLowerCase() : '';
  const noteHasPositive = POSITIVE_KEYWORDS.some(k => noteText.includes(k));

  const visitAge = daysSince(contact.properties.storm_boy__meeting_date);
  const lastContactAge = daysSince(contact.properties.notes_last_contacted);

  const evidence = [];

  // Track what each signal told us
  if (lastOutboundSnapshot) {
    evidence.push({
      source: 'hubspot_email',
      kind: 'snapshot_sent',
      detail: `Outbound snapshot email sent ${daysSince(lastOutboundSnapshot.timestamp)}d ago: "${lastOutboundSnapshot.subject}" from ${lastOutboundSnapshot.from || '?'}`,
      ref: `email:${lastOutboundSnapshot.id}`,
    });
  }
  if (lastInboundSnapshot && (!lastOutboundSnapshot || Date.parse(lastInboundSnapshot.timestamp) > Date.parse(lastOutboundSnapshot.timestamp))) {
    evidence.push({
      source: 'hubspot_email',
      kind: 'customer_replied',
      detail: `Customer replied ${daysSince(lastInboundSnapshot.timestamp)}d ago: "${lastInboundSnapshot.subject}"`,
      ref: `email:${lastInboundSnapshot.id}`,
    });
  }
  if (snapshotProp === 'Yes') {
    evidence.push({
      source: 'hubspot_property',
      kind: 'flag_set',
      detail: 'storm_boy__horizon_snapshot_created = Yes (manual flag)',
    });
  }
  if (proceedProp === 'Yes') {
    evidence.push({
      source: 'hubspot_property',
      kind: 'kct_willing',
      detail: 'storm_boy__proceed_to_kct_stage = Yes',
    });
  }
  if (noteHasPositive) {
    evidence.push({
      source: 'note_keyword',
      kind: 'positive_sentiment',
      detail: 'Last note contains positive-progression keyword',
    });
  }

  // ====== State decision tree ======
  // 1) Cold — disengage path (preserve existing semantics)
  const isCold = (visitAge != null && visitAge >= COLD_DAYS) &&
                 (lastContactAge == null || lastContactAge >= COLD_DAYS);
  if (isCold && !lastOutboundSnapshot && snapshotProp !== 'Yes') {
    return {
      state: 'COLD',
      next_step_short: 'Disengage politely',
      next_step: `No snapshot evidence and ${lastContactAge ?? '∞'}d since last contact. Send "we're here when you're ready" close and stop active outreach.`,
      evidence,
    };
  }

  // 2) Willing to progress — explicit signal
  if (proceedProp === 'Yes' || (lastOutboundSnapshot && noteHasPositive && lastNote &&
      Date.parse(lastNote.timestamp || 0) > Date.parse(lastOutboundSnapshot.timestamp))) {
    return {
      state: 'WILLING_TO_PROGRESS',
      next_step_short: 'Progress to KCT · hand to ops',
      next_step: 'Customer has signalled willingness to progress (proceed-to-KCT flag set or positive note since snapshot). Create KCT deal in HubSpot Deals pipeline and hand to ops.',
      evidence,
    };
  }

  // 3) Sent + customer replied (no explicit progress signal yet)
  if (lastOutboundSnapshot && lastInboundSnapshot &&
      Date.parse(lastInboundSnapshot.timestamp) > Date.parse(lastOutboundSnapshot.timestamp)) {
    return {
      state: 'SENT_REPLIED',
      next_step_short: 'Customer replied · confirm intent on KCT',
      next_step: `Customer replied to snapshot ${daysSince(lastInboundSnapshot.timestamp)}d ago. Read their response and confirm intent — if positive, propose KCT next step. If hesitant, address the objection directly.`,
      evidence,
    };
  }

  // 4) Sent, no reply, recent — wait window
  if (lastOutboundSnapshot) {
    const age = daysSince(lastOutboundSnapshot.timestamp);
    if (age != null && age <= AWAIT_DAYS) {
      return {
        state: 'SENT_AWAITING_REPLY',
        next_step_short: `Wait ${AWAIT_DAYS - age}d · then chase`,
        next_step: `Snapshot sent ${age}d ago. Standard wait window is ${AWAIT_DAYS}d before chasing. If no reply by then, phone follow-up with specific question about a topic from the snapshot.`,
        evidence,
      };
    }
    // 5) Sent, no reply, stale
    return {
      state: 'SENT_NO_REPLY_STALE',
      next_step_short: `Re-engage · snapshot sent ${age}d ago no reply`,
      next_step: `Snapshot sent ${age}d ago with no customer reply. Phone follow-up with a specific question about a topic from the snapshot — generic "did you get it" check-ins don't convert.`,
      evidence,
    };
  }

  // 6) Custom flag says snapshot exists but no outbound email evidence
  if (snapshotProp === 'Yes' && !lastOutboundSnapshot) {
    return {
      state: 'REQUESTED_NO_EMAIL',
      next_step_short: 'Confirm snapshot was sent · no email evidence',
      next_step: 'Flag says snapshot created but no outbound email visible in HubSpot. Either it was sent via Teams/another channel (verify with Ben) or it was produced but never sent. Send it now if needed.',
      evidence,
    };
  }

  // 7) Default — no snapshot evidence at all
  return {
    state: 'NOT_REQUESTED',
    next_step_short: 'Request HORIZON Snapshot',
    next_step: `No snapshot email found in HubSpot and internal flag is not set. Request a HORIZON Snapshot from Ben (or whoever produces them) for this contact${visitAge != null ? ` — farm visit was ${visitAge}d ago` : ''}.`,
    evidence,
  };
}

/**
 * Mutate a list of stormboy-detail contact objects (Farm Visit
 * completed) with snapshot_state + override next_step / next_step_short
 * fields. Returns void.
 */
async function enrichContactsWithSnapshotState(token, contacts) {
  // Only do this for Farm Visit completed contacts
  const targets = contacts.filter(c =>
    c.properties && c.properties.contact_lead_stage_storm_boy === 'Farm Visit completed'
  );
  if (!targets.length) return;

  const contactIds = targets.map(c => c.id);
  const emailAssoc = await fetchEmailAssociations(token, contactIds);
  const allEmailIds = Array.from(new Set(Object.values(emailAssoc).flat()));
  const emailMap = await fetchEmails(token, allEmailIds);

  for (const c of targets) {
    const emailIds = emailAssoc[c.id] || [];
    const emails = emailIds.map(id => emailMap[id]).filter(Boolean);
    // For state detection we also need the last note text. The caller's
    // stormboy-detail already fetched it — we pass through via a side
    // channel: stash it on the contact object as __snapshot_last_note.
    const lastNote = c.__snapshot_last_note || null;
    const stateResult = classifyState(c, emails, lastNote);
    // Stash on contact for downstream merge
    c.__snapshot_state = stateResult;
  }
}

const COVERAGE_CAVEATS = [
  'Snapshot detection uses HubSpot emails + custom properties. The HORIZON Snapshot TICKET pipeline is NOT checked (HubSpot Private App token lacks ticket scope — would need `crm.objects.tickets.read` added).',
  'Microsoft Teams channel "Operation Stormboy > Deals" is NOT checked (no MS Graph integration in this server). Snapshots discussed in Teams but never emailed will appear as NOT_REQUESTED.',
  'Subject matching is case-insensitive regex /snapshot|horizon report/. False positives possible if a non-snapshot email uses these words.',
  '"Customer replied" only checks email direction. A phone reply that\'s logged as a note won\'t trigger SENT_REPLIED — but the positive-sentiment keyword scan over the latest note will catch it for WILLING_TO_PROGRESS.',
];

module.exports = { enrichContactsWithSnapshotState, COVERAGE_CAVEATS };
