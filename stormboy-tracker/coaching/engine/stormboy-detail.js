/**
 * Storm Boy detail enrichment — per-contact synthesis for the WORK tab.
 *
 * Two consumer surfaces:
 *   - Farm visits completed: the decision-making linchpin (pursue hot vs disengage cold)
 *   - Call queue: stalled "In Conversation" contacts with last-contact context
 *
 * For each contact this module pulls:
 *   - HubSpot last note (engagement) text + timestamp
 *   - Match to Aircall call distillate by name (Hobbs's call summaries)
 *   - Rule-based heat score (HOT / WARM / COLD) with reasoning
 *   - Templated next-step recommendation
 *
 * Heat scoring is heuristic and clearly labelled as such. Phase 2 will
 * replace with LLM-driven synthesis pulling Teams + email + transcripts.
 */

const fs = require('fs');
const path = require('path');

const { hubspotFetch } = require('./hubspot-client');

const HUBSPOT_BASE = 'https://api.hubapi.com';
const NOTE_TRUNCATE = 320;
const HOT_DAYS = 7;
const COLD_DAYS = 14;

// Lazy-load + cache the Hobbs call distillates so name matching is fast.
let _callDistillates = null;
function loadCallDistillates() {
  if (_callDistillates) return _callDistillates;
  try {
    const p = path.join(__dirname, '..', 'cache', 'hobbs-calls-distillates.json');
    const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
    const calls = raw.calls || [];
    // Build a name lookup: lowercased "firstname lastname" -> call data
    const byName = {};
    calls.forEach(c => {
      const id = c.transcript_id || '';
      // transcript_id format: call-YYYY-MM-DD-firstname-lastname[-suffix]
      const m = id.match(/^call-\d{4}-\d{2}-\d{2}-(.+)$/);
      if (!m) return;
      const slugParts = m[1].split('-').filter(p => p && !/^[a-z]+\d+$/.test(p));
      if (slugParts.length >= 2) {
        const key = (slugParts[0] + ' ' + slugParts[1]).toLowerCase();
        byName[key] = c;
      }
      // Also index by single name for cases like "tim" or "gwendolyn"
      if (slugParts.length >= 1) {
        byName[slugParts[0].toLowerCase()] = byName[slugParts[0].toLowerCase()] || c;
      }
    });
    _callDistillates = byName;
  } catch (e) {
    console.warn('[stormboy-detail] could not load call distillates:', e.message);
    _callDistillates = {};
  }
  return _callDistillates;
}

function matchCallDistillate(firstname, lastname) {
  const dist = loadCallDistillates();
  const fn = (firstname || '').toLowerCase().trim();
  const ln = (lastname || '').toLowerCase().trim();
  const key = (fn + ' ' + ln).trim();
  return dist[key] || dist[fn] || dist[ln] || null;
}

async function hubspotPost(token, urlPath, body) {
  const res = await hubspotFetch(HUBSPOT_BASE + urlPath, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('HubSpot ' + urlPath + ' failed: ' + res.status);
  return res.json();
}

async function hubspotGet(token, urlPath) {
  const res = await hubspotFetch(HUBSPOT_BASE + urlPath, {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token },
  });
  if (!res.ok) {
    // 404 on associations is common; treat as empty
    if (res.status === 404) return null;
    throw new Error('HubSpot ' + urlPath + ' failed: ' + res.status);
  }
  return res.json();
}

async function fetchContactsForStage(token, stage) {
  const body = {
    filterGroups: [{
      filters: [
        { propertyName: 'storm_boy_campaign_member', operator: 'EQ', value: 'Yes' },
        { propertyName: 'contact_lead_stage_storm_boy', operator: 'EQ', value: stage },
      ]
    }],
    properties: [
      'firstname', 'lastname', 'hs_full_name_or_email',
      'contact_lead_stage_storm_boy', 'hs_lead_status',
      'notes_last_contacted', 'createdate', 'lastmodifieddate',
      'hubspot_owner_id', 'phone', 'mobilephone',
      'storm_boy__meeting_date', 'storm_boy__call_outcome', 'storm_boy__date_called',
      'storm_boy__horizon_snapshot_created', 'storm_boy__proceed_to_kct_stage',
    ],
    sorts: [{ propertyName: 'storm_boy__meeting_date', direction: 'DESCENDING' }],
    limit: 100,
  };
  return hubspotPost(token, '/crm/v3/objects/contacts/search', body);
}

/**
 * Fetch the most recent NOTE engagement for a contact. HubSpot returns
 * an association list, we pick the most recent by id (notes are issued
 * sequentially), then fetch its body.
 */
async function fetchLastNote(token, contactId) {
  const assoc = await hubspotGet(token, `/crm/v4/objects/contacts/${contactId}/associations/notes?limit=20`);
  if (!assoc || !assoc.results || !assoc.results.length) return null;
  // Highest id ≈ most recent
  const noteIds = assoc.results.map(r => r.toObjectId).filter(Boolean);
  if (!noteIds.length) return null;
  const latestId = noteIds.sort((a, b) => Number(b) - Number(a))[0];
  try {
    const body = {
      inputs: [{ id: String(latestId) }],
      properties: ['hs_note_body', 'hs_timestamp', 'hs_createdate'],
    };
    const data = await hubspotPost(token, '/crm/v3/objects/notes/batch/read', body);
    const note = (data.results || [])[0];
    if (!note) return null;
    return {
      id: note.id,
      body: note.properties.hs_note_body || '',
      timestamp: note.properties.hs_timestamp || note.properties.hs_createdate,
    };
  } catch (e) {
    return null;
  }
}

function stripHtml(s) {
  if (!s) return '';
  return s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

function truncate(s, n) {
  if (!s) return '';
  s = s.trim();
  return s.length > n ? s.slice(0, n).trimEnd() + '…' : s;
}

function daysSince(iso) {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Heat scoring — heuristic, transparent. Returns { heat, reasoning[], next_step }.
 *
 * Rules (in priority order):
 *   1. HOT if last contact within HOT_DAYS AND positive signal in note OR meeting recent
 *   2. COLD if visit/last-contact older than COLD_DAYS AND no follow-up
 *   3. WARM otherwise
 *
 * The reasoning array is shown verbatim in the UI so the rep can see WHY.
 */
function scoreHeat(contact, lastNote, visitStage) {
  const reasons = [];
  const noteAge = lastNote ? daysSince(lastNote.timestamp) : null;
  const visitDate = contact.properties.storm_boy__meeting_date;
  const visitAge = visitDate ? daysSince(visitDate) : null;
  const lastContactAge = daysSince(contact.properties.notes_last_contacted);
  const recentAge = Math.min(...[noteAge, lastContactAge].filter(x => x !== null && x !== undefined));
  const noteText = lastNote ? stripHtml(lastNote.body).toLowerCase() : '';

  const positiveKeywords = ['yes', 'sign', 'proceed', 'next step', 'ready', 'keen', 'happy', 'agreed', 'go ahead', 'lets do', 'let\'s do', 'sound good'];
  const negativeKeywords = ['not interested', 'pass', 'no thanks', 'declined', 'too busy', 'maybe later', 'not now', 'not the right time'];
  const stallKeywords  = ['talk to wife', 'partner', 'think about', 'no rush', 'consider', 'come back'];

  const hasPositive = positiveKeywords.some(k => noteText.includes(k));
  const hasNegative = negativeKeywords.some(k => noteText.includes(k));
  const hasStall    = stallKeywords.some(k => noteText.includes(k));

  if (hasNegative) {
    reasons.push('Last note contains decline-language signal.');
  } else if (hasPositive) {
    reasons.push('Last note contains positive-signal language ("yes", "proceed", "ready", etc.).');
  } else if (hasStall) {
    reasons.push('Last note contains stall-pattern language (deferring decision).');
  }

  let heat = 'WARM';

  // Apply rules
  if (hasNegative) {
    heat = 'COLD';
  } else if (visitStage === 'Farm Visit completed') {
    if (visitAge !== null && visitAge <= HOT_DAYS && (hasPositive || (lastContactAge !== null && lastContactAge <= 3))) {
      heat = 'HOT';
      reasons.push(`Visit ${visitAge}d ago with recent contact — momentum window.`);
    } else if (visitAge !== null && visitAge >= COLD_DAYS && (lastContactAge === null || lastContactAge >= COLD_DAYS)) {
      heat = 'COLD';
      reasons.push(`Visit ${visitAge}d ago, no contact in ${lastContactAge ?? '∞'}d. Cooling.`);
    } else if (hasPositive) {
      heat = 'HOT';
      reasons.push('Positive note signal even without recent visit.');
    }
  } else if (visitStage === 'In Conversation') {
    if (lastContactAge !== null && lastContactAge <= 3 && hasPositive) {
      heat = 'HOT';
    } else if (lastContactAge !== null && lastContactAge >= 7) {
      heat = lastContactAge >= 14 ? 'COLD' : 'WARM';
      reasons.push(`In conversation but ${lastContactAge}d since last contact.`);
    }
  }

  // Next step recommendation (templated by heat + stage).
  // next_step_short = tight imperative for collapsed-card view (<= 8 words).
  // next_step      = full rationale for expanded view.
  let nextStep, nextStepShort;
  if (visitStage === 'Farm Visit completed') {
    if (heat === 'HOT') {
      nextStepShort = 'Send KCT or contract draft now';
      nextStep = 'Pursue: send KCT or contract draft within 48h. Ride the momentum — every day of silence costs conversion probability.';
    } else if (heat === 'COLD') {
      nextStepShort = 'Disengage politely';
      nextStep = 'Disengage politely: send a final "we\'re here when you\'re ready" message and stop active outreach. Free up time for warmer prospects.';
    } else {
      nextStepShort = 'Send specific artifact, not a check-in';
      nextStep = 'Re-engage with specific question or artifact (HORIZON snapshot, neighbour comparison). Don\'t send generic check-in — give them a reason to reply.';
    }
  } else if (visitStage === 'In Conversation') {
    if (heat === 'HOT') {
      nextStepShort = 'Book the farm visit now';
      nextStep = 'Book the farm visit now. They\'re ready and waiting.';
    } else if (heat === 'COLD') {
      nextStepShort = 'One last attempt, then drop';
      nextStep = 'One last attempt, then defer 30d or remove from active list.';
    } else {
      nextStepShort = 'Follow up with a value-add';
      nextStep = `Follow up with a value-add (case study, regional precedent, or specific question about their operation). ${lastContactAge ?? '?'}d since last contact.`;
    }
  } else {
    nextStepShort = 'Review manually';
    nextStep = 'Review with rep manually.';
  }

  return { heat, reasoning: reasons, next_step: nextStep, next_step_short: nextStepShort };
}

function displayName(c) {
  const fn = (c.properties.firstname || '').trim();
  const ln = (c.properties.lastname || '').trim();
  if (fn || ln) return [fn, ln].filter(Boolean).join(' ');
  return c.properties.hs_full_name_or_email || ('contact #' + c.id);
}

function summariseDistillate(d) {
  if (!d) return null;
  const summary = d.visit_summary || {};
  const tds = (d.topic_distillates || []).slice(0, 2).map(t => ({
    topic: t.topic_label,
    customer_position: t.customer_position,
    hobbs_response: t.hobbs_response,
  }));
  return {
    transcript_id: d.transcript_id,
    visit_date: d.visit_date,
    call_type: d.call_type,
    outcome: summary.overall_outcome,
    one_line: summary.one_line_summary,
    top_topics: tds,
  };
}

async function enrichContact(token, c) {
  const firstname = c.properties.firstname;
  const lastname = c.properties.lastname;
  const stage = c.properties.contact_lead_stage_storm_boy;

  // Reuse the last-note fetch if snapshot-state stashed it (avoids a
  // duplicate HubSpot call when both code paths ran on this contact)
  const lastNote = c.__snapshot_last_note || await fetchLastNote(token, c.id);
  const callDistillate = summariseDistillate(matchCallDistillate(firstname, lastname));
  const heat = scoreHeat(c, lastNote, stage);

  // For Farm Visit completed: prefer evidence-driven snapshot state
  // next-step over heat-based template. Heat reasoning is still
  // shown — it's complementary, not redundant.
  let nextStep = heat.next_step;
  let nextStepShort = heat.next_step_short;
  let snapshotState = null;
  if (c.__snapshot_state) {
    snapshotState = c.__snapshot_state;
    nextStep = snapshotState.next_step;
    nextStepShort = snapshotState.next_step_short;
  }

  return {
    id: c.id,
    name: displayName(c),
    owner_id: c.properties.hubspot_owner_id,
    stage,
    lead_status: c.properties.hs_lead_status,
    meeting_date: c.properties.storm_boy__meeting_date,
    days_since_visit: daysSince(c.properties.storm_boy__meeting_date),
    last_contacted: c.properties.notes_last_contacted,
    days_since_contact: daysSince(c.properties.notes_last_contacted),
    horizon_snapshot_created: c.properties.storm_boy__horizon_snapshot_created,
    proceed_to_kct: c.properties.storm_boy__proceed_to_kct_stage,
    last_note: lastNote ? {
      text: truncate(stripHtml(lastNote.body), NOTE_TRUNCATE),
      timestamp: lastNote.timestamp,
      days_since: daysSince(lastNote.timestamp),
    } : null,
    call_distillate: callDistillate,
    heat: heat.heat,
    heat_reasoning: heat.reasoning,
    next_step: nextStep,
    next_step_short: nextStepShort,
    snapshot_state: snapshotState ? {
      state: snapshotState.state,
      evidence: snapshotState.evidence,
    } : null,
    hubspot_url: 'https://app.hubspot.com/contacts/24224559/contact/' + c.id,
  };
}

async function run(stage) {
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error('HUBSPOT_TOKEN not set');
  if (!stage) throw new Error('stage query param required');

  const contactsPage = await fetchContactsForStage(token, stage);
  const contacts = contactsPage.results || [];

  // For Farm Visit completed: pre-compute snapshot-state across HubSpot
  // emails + custom properties so the next-step text reflects ACTUAL
  // state (snapshot sent? customer replied? willing to progress?)
  // rather than a heat-based template. Adds ~2 batch API calls total
  // — much faster than per-contact queries.
  const cappedContacts = contacts.slice(0, 12);
  let snapshotCoverage = null;
  if (stage === 'Farm Visit completed') {
    try {
      const { enrichContactsWithSnapshotState, COVERAGE_CAVEATS } = require('./snapshot-state');
      // Fetch last notes in parallel so snapshot-state can read them for sentiment
      await Promise.all(cappedContacts.map(async c => {
        const ln = await fetchLastNote(token, c.id);
        c.__snapshot_last_note = ln;
      }));
      await enrichContactsWithSnapshotState(token, cappedContacts);
      snapshotCoverage = { caveats: COVERAGE_CAVEATS };
    } catch (e) {
      console.warn('[stormboy-detail] snapshot-state enrichment failed:', e.message);
    }
  }

  const enriched = [];
  for (const c of cappedContacts) {
    try {
      enriched.push(await enrichContact(token, c));
    } catch (e) {
      console.warn('enrichContact failed for ' + c.id, e.message);
    }
  }

  // Sort: HOT first, then by recency
  const order = { HOT: 0, WARM: 1, COLD: 2 };
  enriched.sort((a, b) => {
    if (order[a.heat] !== order[b.heat]) return order[a.heat] - order[b.heat];
    return (b.days_since_visit ?? -1) - (a.days_since_visit ?? -1);
  });

  return {
    generated_at: new Date().toISOString(),
    stage,
    total_in_stage: contactsPage.total || contacts.length,
    returned: enriched.length,
    contacts: enriched,
    heat_scoring: {
      method: 'heuristic',
      rules: 'HOT/COLD/WARM derived from time since visit + last-contact age + keyword signals in last note. Transparent and editable per rep override. Phase 2: LLM-driven cross-source synthesis (Teams + email + transcripts).',
    },
    snapshot_coverage: snapshotCoverage,
  };
}

module.exports = { run };
