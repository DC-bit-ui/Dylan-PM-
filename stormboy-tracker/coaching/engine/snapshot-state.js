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

// Pipeline ID for the HORIZON Snapshot ticket pipeline. We don't have
// it via API today (schema endpoint requires custom-object-read scope
// which is also missing). The pipeline name is matched once the scope
// is enabled and we can read pipelines. Until then we treat ANY
// ticket associated to a Stormboy contact as a probable snapshot
// ticket (the AgriProve org doesn't run other ticket workflows for
// these contacts, so the false-positive rate is acceptably low).
let _ticketScopeAvailable = null; // tri-state: null=unknown, true=accessible, false=403
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

// Soft-fail variant that returns null on 403 (missing-scope) so callers
// can degrade gracefully. Logs once per process when the scope-missing
// pattern is detected.
async function hubspotPostSoft(token, urlPath, body, { scopeKey } = {}) {
  const res = await hubspotFetch(HUBSPOT_BASE + urlPath, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.status === 403 && scopeKey) {
    if (scopeKey === 'tickets' && _ticketScopeAvailable !== false) {
      console.warn('[snapshot-state] HubSpot tickets scope missing — falling back to association-only detection');
      _ticketScopeAvailable = false;
    }
    return null;
  }
  if (!res.ok) {
    console.warn(`[snapshot-state] HubSpot ${urlPath} → ${res.status}`);
    return null;
  }
  if (scopeKey === 'tickets' && _ticketScopeAvailable !== true) {
    console.log('[snapshot-state] HubSpot tickets scope is available — full detection enabled');
    _ticketScopeAvailable = true;
  }
  return res.json();
}

async function hubspotGetSoft(token, urlPath, { scopeKey } = {}) {
  const res = await hubspotFetch(HUBSPOT_BASE + urlPath, {
    headers: { Authorization: 'Bearer ' + token },
  });
  if (res.status === 403 && scopeKey === 'tickets') {
    _ticketScopeAvailable = false;
    return null;
  }
  if (!res.ok) return null;
  return res.json();
}

// Batch lookup of contact → ticket associations. Always 200 even
// without the `tickets` scope — associations API is gated on the
// SOURCE object's scope (contacts), not the target.
// Returns { contactId: [ticketId, ...] }.
async function fetchTicketAssociations(token, contactIds) {
  if (!contactIds.length) return {};
  const map = {};
  for (let i = 0; i < contactIds.length; i += 100) {
    const batch = contactIds.slice(i, i + 100);
    try {
      const data = await hubspotPost(token, '/crm/v4/associations/contacts/tickets/batch/read', {
        inputs: batch.map(id => ({ id: String(id) })),
      });
      (data.results || []).forEach(r => {
        const fromId = r.from && r.from.id;
        if (!fromId) return;
        map[fromId] = (r.to || []).map(t => String(t.toObjectId));
      });
    } catch (e) {
      console.warn('[snapshot-state] ticket association batch failed:', e.message);
    }
  }
  return map;
}

// Try to batch-read ticket properties. Returns null if scope unavailable.
// When the `tickets` scope is granted to the Private App, this lights up
// automatically and per-ticket pipeline/stage gets used for richer state
// classification (REQUESTED vs IN_PRODUCTION vs SENT).
async function fetchTicketsIfAccessible(token, ticketIds) {
  if (!ticketIds.length) return null;
  if (_ticketScopeAvailable === false) return null; // remembered from earlier 403
  const map = {};
  for (let i = 0; i < ticketIds.length; i += 100) {
    const batch = ticketIds.slice(i, i + 100);
    const data = await hubspotPostSoft(token, '/crm/v3/objects/tickets/batch/read', {
      properties: ['subject', 'hs_pipeline', 'hs_pipeline_stage', 'hs_lastmodifieddate',
                   'hs_pipeline_stage_label', 'createdate'],
      inputs: batch.map(id => ({ id: String(id) })),
    }, { scopeKey: 'tickets' });
    if (data === null) return null;          // scope missing — bail
    (data.results || []).forEach(t => { map[t.id] = t; });
  }
  return map;
}

// One-time discovery of the HORIZON Snapshot ticket pipeline. Once
// scope is granted we cache the pipeline ID + stage labels so we can
// match per-ticket. If scope is missing, returns null.
let _horizonPipelineCache = null;
async function discoverHorizonPipeline(token) {
  if (_horizonPipelineCache) return _horizonPipelineCache;
  if (_ticketScopeAvailable === false) return null;
  const data = await hubspotGetSoft(token, '/crm/v3/pipelines/tickets', { scopeKey: 'tickets' });
  if (!data) return null;
  // Match by label — common patterns: "HORIZON Snapshot", "Horizon Snapshot Pipeline"
  const match = (data.results || []).find(p => /horizon\s*snapshot|snapshot/i.test(p.label || ''));
  if (!match) {
    _horizonPipelineCache = { found: false };
    return _horizonPipelineCache;
  }
  _horizonPipelineCache = {
    found: true,
    id: match.id,
    label: match.label,
    stages: (match.stages || []).map(s => ({ id: s.id, label: s.label, display_order: s.displayOrder })),
  };
  console.log('[snapshot-state] HORIZON pipeline discovered:', _horizonPipelineCache.label, '(', _horizonPipelineCache.stages.length, 'stages )');
  return _horizonPipelineCache;
}

// Classify a ticket's pipeline-stage label into one of our snapshot
// states. Heuristic — adapts to whatever stage names the org uses.
function classifyTicketStage(ticket, pipeline) {
  if (!ticket || !ticket.properties) return null;
  const props = ticket.properties;
  const stageId = props.hs_pipeline_stage;
  const stageLabel = (props.hs_pipeline_stage_label || '').toLowerCase();
  // Try to derive a label from the pipeline metadata if not embedded
  let label = stageLabel;
  if (!label && pipeline && pipeline.stages) {
    const match = pipeline.stages.find(s => s.id === stageId);
    if (match) label = (match.label || '').toLowerCase();
  }
  if (!label) return { stage: 'UNKNOWN', stage_label: stageId };
  if (/sent|delivered|complete|closed|done/.test(label)) return { stage: 'SENT', stage_label: label };
  if (/production|in progress|working|drafting|building/.test(label)) return { stage: 'IN_PRODUCTION', stage_label: label };
  if (/request|new|backlog|queue|pending/.test(label)) return { stage: 'REQUESTED', stage_label: label };
  return { stage: 'UNKNOWN', stage_label: label };
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

function classifyState(contact, emails, lastNote, ticketSignal, teamsSignal) {
  // ticketSignal can be:
  //   null                                       — scope missing, no info
  //   { count: N, ticket_ids: [...] }            — association-only mode
  //   { count: N, latest_stage: 'REQUESTED'      — full-read mode (scope OK)
  //                            | 'IN_PRODUCTION' | 'SENT' | 'UNKNOWN',
  //     latest_stage_label: '...', latest_modified: iso }
  // teamsSignal can be:
  //   null                                       — Teams not configured
  //   { mentions: [{message_id, posted_at, snippet, posted_by}] } — has signals
  //   { mentions: [] }                           — checked, none found
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
  // Ticket signal — either association-only or full-read
  if (ticketSignal && ticketSignal.count > 0) {
    if (ticketSignal.latest_stage) {
      evidence.push({
        source: 'hubspot_ticket',
        kind: 'ticket_' + ticketSignal.latest_stage.toLowerCase(),
        detail: `HORIZON Snapshot ticket · stage "${ticketSignal.latest_stage_label}" · ${ticketSignal.count} ticket(s) associated`,
      });
    } else {
      evidence.push({
        source: 'hubspot_ticket',
        kind: 'ticket_exists',
        detail: `${ticketSignal.count} ticket(s) associated (ticket scope missing — cannot read stage; likely HORIZON Snapshot)`,
      });
    }
  }
  // Teams signal
  if (teamsSignal && teamsSignal.mentions && teamsSignal.mentions.length) {
    const latest = teamsSignal.mentions[0];
    evidence.push({
      source: 'teams_channel',
      kind: 'teams_mention',
      detail: `Mentioned in Operation Stormboy > Deals · "${latest.snippet}" · ${latest.posted_by} · ${latest.posted_at.slice(0, 10)}`,
    });
  }

  // ====== State decision tree ======
  // Convenience: any signal that snapshot was discussed somewhere
  const anyEvidenceOfSnapshot = !!(
    lastOutboundSnapshot ||
    snapshotProp === 'Yes' ||
    (ticketSignal && ticketSignal.count > 0) ||
    (teamsSignal && teamsSignal.mentions && teamsSignal.mentions.length)
  );

  // 1) Cold — disengage path (preserve existing semantics)
  const isCold = (visitAge != null && visitAge >= COLD_DAYS) &&
                 (lastContactAge == null || lastContactAge >= COLD_DAYS);
  if (isCold && !anyEvidenceOfSnapshot) {
    return {
      state: 'COLD',
      next_step_short: 'Disengage politely',
      next_step: `No snapshot evidence (email/ticket/Teams) and ${lastContactAge ?? '∞'}d since last contact. Send "we're here when you're ready" close and stop active outreach.`,
      evidence,
    };
  }

  // 1b) Ticket in PRODUCTION (scope-enabled mode)
  if (ticketSignal && ticketSignal.latest_stage === 'IN_PRODUCTION' && !lastOutboundSnapshot) {
    return {
      state: 'IN_PRODUCTION',
      next_step_short: 'Snapshot in production · Ben drafting',
      next_step: `Snapshot ticket is in stage "${ticketSignal.latest_stage_label}". No outbound email yet — Ben (or whoever owns the ticket) is drafting it. Check ticket status; no rep action needed until ready.`,
      evidence,
    };
  }

  // 1c) Ticket REQUESTED but not yet in production (queue)
  if (ticketSignal && ticketSignal.latest_stage === 'REQUESTED' && !lastOutboundSnapshot) {
    return {
      state: 'REQUESTED',
      next_step_short: 'Snapshot requested · queued',
      next_step: `Snapshot ticket exists in stage "${ticketSignal.latest_stage_label}". Sitting in the queue — nudge Ben if it's been there >3d.`,
      evidence,
    };
  }

  // 1c-bis) Ticket exists in association-only mode (scope missing). We
  // know a ticket is linked to the contact but can't read its stage.
  // Strong signal nonetheless — far better than saying NOT_REQUESTED.
  if (ticketSignal && ticketSignal.count > 0 && !ticketSignal.latest_stage && !lastOutboundSnapshot && snapshotProp !== 'Yes') {
    return {
      state: 'TICKET_EXISTS_STAGE_UNKNOWN',
      next_step_short: 'Snapshot ticket exists · check stage in HubSpot',
      next_step: `Contact has ${ticketSignal.count} associated ticket(s) — likely HORIZON Snapshot. Stage not readable here (enable HubSpot Private App ticket scope to surface it). Open the contact in HubSpot to see ticket status; act based on stage.`,
      evidence,
    };
  }

  // 1d) Teams mention but no email yet (probably discussed but not sent)
  if (teamsSignal && teamsSignal.mentions && teamsSignal.mentions.length && !lastOutboundSnapshot && snapshotProp !== 'Yes') {
    return {
      state: 'DISCUSSED_NOT_SENT',
      next_step_short: 'Teams mention · confirm if snapshot exists',
      next_step: `Discussed in Operation Stormboy > Deals on ${teamsSignal.mentions[0].posted_at.slice(0,10)} but no outbound email or ticket found. Confirm whether a snapshot was actually produced and sent.`,
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
// Helper: build a per-contact ticket signal from associations + (when
// scope is enabled) per-ticket properties.
function buildTicketSignal(ticketIds, ticketMap, pipeline) {
  if (!ticketIds || !ticketIds.length) return null;
  if (!ticketMap) {
    // Scope missing — return association-only signal
    return { count: ticketIds.length, ticket_ids: ticketIds };
  }
  // Pick the most recently modified ticket (likely the active one)
  const tickets = ticketIds.map(id => ticketMap[id]).filter(Boolean);
  if (!tickets.length) return null;
  const sorted = tickets.slice().sort((a, b) => {
    const aT = Date.parse(a.properties.hs_lastmodifieddate || a.properties.createdate || 0);
    const bT = Date.parse(b.properties.hs_lastmodifieddate || b.properties.createdate || 0);
    return bT - aT;
  });
  const latest = sorted[0];
  // If we have a HORIZON pipeline match, only count tickets in it
  if (pipeline && pipeline.found && latest.properties.hs_pipeline !== pipeline.id) {
    const inPipeline = sorted.filter(t => t.properties.hs_pipeline === pipeline.id);
    if (!inPipeline.length) return null;
    const target = inPipeline[0];
    const classified = classifyTicketStage(target, pipeline);
    return {
      count: inPipeline.length,
      ticket_ids: inPipeline.map(t => t.id),
      latest_stage: classified ? classified.stage : 'UNKNOWN',
      latest_stage_label: classified ? classified.stage_label : '',
      latest_modified: target.properties.hs_lastmodifieddate,
      subject: target.properties.subject,
    };
  }
  const classified = classifyTicketStage(latest, pipeline);
  return {
    count: tickets.length,
    ticket_ids: tickets.map(t => t.id),
    latest_stage: classified ? classified.stage : 'UNKNOWN',
    latest_stage_label: classified ? classified.stage_label : '',
    latest_modified: latest.properties.hs_lastmodifieddate,
    subject: latest.properties.subject,
  };
}

async function enrichContactsWithSnapshotState(token, contacts) {
  // Only do this for Farm Visit completed contacts
  const targets = contacts.filter(c =>
    c.properties && c.properties.contact_lead_stage_storm_boy === 'Farm Visit completed'
  );
  if (!targets.length) return;

  const contactIds = targets.map(c => c.id);

  // Parallel: emails + tickets + Teams mentions
  const [emailAssoc, ticketAssoc, teamsByContact] = await Promise.all([
    fetchEmailAssociations(token, contactIds),
    fetchTicketAssociations(token, contactIds),
    fetchTeamsSignals(targets), // graceful no-op when MS Graph not configured
  ]);

  const allEmailIds = Array.from(new Set(Object.values(emailAssoc).flat()));
  const allTicketIds = Array.from(new Set(Object.values(ticketAssoc).flat()));

  const [emailMap, ticketMap, pipeline] = await Promise.all([
    fetchEmails(token, allEmailIds),
    fetchTicketsIfAccessible(token, allTicketIds),    // null if scope missing
    discoverHorizonPipeline(token),                    // null if scope missing
  ]);

  for (const c of targets) {
    const emailIds = emailAssoc[c.id] || [];
    const emails = emailIds.map(id => emailMap[id]).filter(Boolean);
    const ticketIds = ticketAssoc[c.id] || [];
    const ticketSignal = buildTicketSignal(ticketIds, ticketMap, pipeline);
    const teamsSignal = teamsByContact[c.id] || null;
    const lastNote = c.__snapshot_last_note || null;
    const stateResult = classifyState(c, emails, lastNote, ticketSignal, teamsSignal);
    c.__snapshot_state = stateResult;
  }
}

// Pull Teams signals for a batch of contacts. Returns an empty map if
// Teams integration isn't configured (graceful degradation). When
// configured, returns { contactId: { mentions: [...] } }.
async function fetchTeamsSignals(contacts) {
  try {
    const teams = require('./teams-graph');
    if (!teams.isConfigured()) return {};
    return await teams.findContactMentions(contacts, {
      keywords: ['snapshot', 'horizon'],
    });
  } catch (e) {
    if (!/cannot find module/i.test(e.message)) {
      console.warn('[snapshot-state] Teams signal fetch failed:', e.message);
    }
    return {};
  }
}

// Coverage status is recomputed per request so the caveat banner
// reflects current capability. Lights up automatically when scopes
// are granted or env vars are set.
function getCoverageStatus() {
  const items = [];
  items.push({
    channel: 'HubSpot emails',
    state: 'enabled',
    note: 'Outbound + inbound email matching /snapshot|horizon report/i via contact → emails associations.',
  });
  items.push({
    channel: 'HubSpot custom flags',
    state: 'enabled',
    note: 'storm_boy__horizon_snapshot_created + storm_boy__proceed_to_kct_stage properties.',
  });
  items.push({
    channel: 'HubSpot HORIZON ticket pipeline',
    state: _ticketScopeAvailable === true
            ? 'enabled'
            : (_ticketScopeAvailable === false ? 'partial' : 'unknown'),
    note: _ticketScopeAvailable === true
            ? 'Full per-ticket stage detection (REQUESTED · IN_PRODUCTION · SENT).'
            : (_ticketScopeAvailable === false
                ? 'Ticket associations ARE accessible (we see which contacts have tickets), but ticket properties (pipeline/stage/subject) require the `tickets` scope on the HubSpot Private App. Enable in: HubSpot Settings → Integrations → Private Apps → AgriProve app → Scopes tab → toggle Tickets read.'
                : 'Will be probed on first request.'),
  });
  let teamsState = 'disabled';
  let teamsNote = 'Set MS_GRAPH_TENANT_ID, MS_GRAPH_CLIENT_ID, MS_GRAPH_CLIENT_SECRET env vars + grant the Azure AD app `ChannelMessage.Read.All` Application permission to enable.';
  try {
    const teams = require('./teams-graph');
    if (teams.isConfigured()) {
      teamsState = 'enabled';
      teamsNote = 'Operation Stormboy > Deals channel scanned for contact-name + snapshot-keyword matches via Microsoft Graph (client-credentials).';
    }
  } catch (_) { /* module not present yet — leave disabled */ }
  items.push({ channel: 'Microsoft Teams · Operation Stormboy > Deals', state: teamsState, note: teamsNote });

  return items;
}

// Back-compat: the old COVERAGE_CAVEATS array is still imported by
// stormboy-detail. Return a string list derived from getCoverageStatus.
const COVERAGE_CAVEATS_FALLBACK = [
  'Subject matching is case-insensitive regex /snapshot|horizon report/. False positives possible if a non-snapshot email uses these words.',
  '"Customer replied" only checks email direction. A phone reply logged as a note won\'t trigger SENT_REPLIED — the positive-sentiment keyword scan over the latest note catches it for WILLING_TO_PROGRESS.',
];

module.exports = {
  enrichContactsWithSnapshotState,
  getCoverageStatus,
  COVERAGE_CAVEATS: COVERAGE_CAVEATS_FALLBACK,
};
