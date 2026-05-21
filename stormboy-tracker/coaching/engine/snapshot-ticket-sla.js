/**
 * Snapshot ticket SLA — distribution of how long tickets dwell in
 * each HORIZON Snapshot pipeline stage. Surfaces drafting bottlenecks
 * (Ben sitting on tickets) and reply-wait stalls.
 *
 * Pipeline stages (discovered dynamically; defaults here for AgriProve):
 *   - New HORIZON Snapshot Request    (open)
 *   - Snapshot In Progress            (open)
 *   - Complete & Sent                 (closed)
 *
 * For each stage:
 *   - count of tickets currently there
 *   - median / p75 / p90 age (open: from creation; closed: from creation to last-mod)
 *   - oldest currently-stuck tickets surfaced as call-outs
 *
 * For closed tickets:
 *   - total cycle time distribution (creation → complete)
 *   - week-over-week trend of completion times
 *
 * Honest about precision: HubSpot ticket properties don't expose
 * stage-history out-of-the-box for non-Marketplace apps, so "time
 * in current stage" uses `hs_lastmodifieddate` as a proxy — accurate
 * for the common case (a property update on stage transition) but
 * could under-count for tickets that get touched without stage move.
 *
 * 30-min disk cache; ?force=1 refreshes.
 */

const fs = require('fs');
const path = require('path');
const { hubspotFetch } = require('./hubspot-client');

const HUBSPOT_BASE = 'https://api.hubapi.com';
const CACHE_PATH = path.join(__dirname, '..', 'cache', 'snapshot-ticket-sla.json');
const CACHE_TTL_MS = 30 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

async function hubspotGet(token, urlPath) {
  const res = await hubspotFetch(HUBSPOT_BASE + urlPath, {
    headers: { Authorization: 'Bearer ' + token },
  });
  if (!res.ok) throw new Error(`HubSpot ${urlPath} → ${res.status}`);
  return res.json();
}
async function hubspotPost(token, urlPath, body) {
  const res = await hubspotFetch(HUBSPOT_BASE + urlPath, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HubSpot ${urlPath} → ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

async function discoverPipeline(token) {
  const data = await hubspotGet(token, '/crm/v3/pipelines/tickets');
  const p = (data.results || []).find(p => /horizon/i.test(p.label || ''));
  if (!p) throw new Error('HORIZON pipeline not found');
  return {
    id: p.id, label: p.label,
    stages: (p.stages || []).map(s => ({
      id: s.id, label: s.label,
      open: !(s.metadata && s.metadata.ticketState === 'CLOSED'),
      display_order: s.displayOrder,
    })).sort((a, b) => a.display_order - b.display_order),
  };
}

async function fetchAllTickets(token, pipelineId) {
  const all = [];
  let after;
  while (all.length < 10000) {
    const body = {
      filterGroups: [{ filters: [{ propertyName: 'hs_pipeline', operator: 'EQ', value: pipelineId }] }],
      properties: ['subject', 'hs_pipeline_stage', 'createdate', 'hs_lastmodifieddate', 'hubspot_owner_id'],
      sorts: [{ propertyName: 'createdate', direction: 'DESCENDING' }],
      limit: 100,
    };
    if (after) body.after = after;
    const page = await hubspotPost(token, '/crm/v3/objects/tickets/search', body);
    all.push(...(page.results || []));
    after = page.paging && page.paging.next && page.paging.next.after;
    if (!after) break;
  }
  return all;
}

function pct(arr, p) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  const i = Math.floor(p * (s.length - 1));
  return s[i];
}
function median(arr) { return pct(arr, 0.5); }

function readCache() {
  try {
    if (!fs.existsSync(CACHE_PATH)) return null;
    const c = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
    if (Date.now() - Date.parse(c.generated_at) > CACHE_TTL_MS) return null;
    return c;
  } catch (_) { return null; }
}
function writeCache(obj) {
  try {
    const tmp = CACHE_PATH + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
    fs.renameSync(tmp, CACHE_PATH);
  } catch (e) { console.error('[snapshot-ticket-sla] cache write failed:', e.message); }
}

async function run({ force = false } = {}) {
  if (!force) {
    const c = readCache();
    if (c) return { ...c, from_cache: true };
  }
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error('HUBSPOT_TOKEN not set');

  const pipeline = await discoverPipeline(token);
  const tickets = await fetchAllTickets(token, pipeline.id);
  console.log(`[snapshot-ticket-sla] pipeline "${pipeline.label}" — ${tickets.length} tickets`);

  const now = Date.now();
  const stageData = pipeline.stages.map(s => ({
    ...s,
    tickets: [],
    ages_d: [],          // total age (since createdate)
    since_mod_d: [],     // time since last modified
  }));
  // Map stageId → reference into stageData
  const byStageId = {};
  stageData.forEach(s => { byStageId[s.id] = s; });

  // Cycle times for completed tickets
  const completionDays = [];
  const completionByWeek = {};   // ISO week → [days]

  tickets.forEach(t => {
    const p = t.properties;
    const stageId = p.hs_pipeline_stage;
    const ref = byStageId[stageId];
    if (!ref) return;
    const created = Date.parse(p.createdate || 0);
    const lastMod = Date.parse(p.hs_lastmodifieddate || 0);
    if (!created || !lastMod) return;
    const ageD = (now - created) / DAY_MS;
    const sinceModD = (now - lastMod) / DAY_MS;
    const cycleD = (lastMod - created) / DAY_MS;

    ref.tickets.push({
      id: t.id,
      subject: p.subject,
      age_d: Math.round(ageD * 10) / 10,
      since_mod_d: Math.round(sinceModD * 10) / 10,
      cycle_d: ref.open ? null : Math.round(cycleD * 10) / 10,
      hubspot_url: `https://app.hubspot.com/contacts/24224559/ticket/${t.id}`,
    });
    if (ref.open) {
      ref.ages_d.push(ageD);
      ref.since_mod_d.push(sinceModD);
    } else {
      // Closed: cycle time = lastMod - created (lastMod ≈ time entered the closed stage)
      completionDays.push(cycleD);
      // Bucket by ISO week of completion
      const d = new Date(lastMod);
      const day = d.getUTCDay();
      const diff = day === 0 ? -6 : 1 - day;
      d.setUTCDate(d.getUTCDate() + diff);
      d.setUTCHours(0, 0, 0, 0);
      const wk = d.toISOString().slice(0, 10);
      if (!completionByWeek[wk]) completionByWeek[wk] = [];
      completionByWeek[wk].push(cycleD);
    }
  });

  // Aggregate per stage
  const stagesOut = stageData.map(s => ({
    stage_id: s.id,
    stage_label: s.label,
    is_open: s.open,
    count: s.tickets.length,
    median_age_d: median(s.ages_d) ? Math.round(median(s.ages_d) * 10) / 10 : null,
    p75_age_d: pct(s.ages_d, 0.75) ? Math.round(pct(s.ages_d, 0.75) * 10) / 10 : null,
    p90_age_d: pct(s.ages_d, 0.90) ? Math.round(pct(s.ages_d, 0.90) * 10) / 10 : null,
    max_age_d: s.ages_d.length ? Math.round(Math.max(...s.ages_d) * 10) / 10 : null,
    // Oldest 3 currently-stuck tickets in this stage
    oldest_stuck: s.tickets
      .filter(t => s.open)
      .sort((a, b) => b.age_d - a.age_d)
      .slice(0, 3)
      .map(t => ({ id: t.id, subject: t.subject, age_d: t.age_d, hubspot_url: t.hubspot_url })),
  }));

  // Weekly completion trend (last 12 weeks)
  const weeklyTrend = Object.entries(completionByWeek)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-12)
    .map(([wk, days]) => ({
      week_start: wk,
      completed: days.length,
      median_cycle_d: median(days) ? Math.round(median(days) * 10) / 10 : null,
    }));

  // Headline narrative
  const openStuck = stagesOut.filter(s => s.is_open).reduce((sum, s) => sum + s.count, 0);
  const newStage = stagesOut.find(s => /new|request/i.test(s.stage_label));
  const prodStage = stagesOut.find(s => /progress|production/i.test(s.stage_label));
  let headline;
  if (newStage && newStage.median_age_d > 7) {
    headline = `New requests sitting median ${newStage.median_age_d}d before being picked up — drafter queue is the bottleneck.`;
  } else if (prodStage && prodStage.median_age_d > 5) {
    headline = `Tickets in production for median ${prodStage.median_age_d}d — drafting is the bottleneck.`;
  } else if (openStuck > 20) {
    headline = `${openStuck} open snapshot tickets — backlog growing.`;
  } else {
    headline = `Snapshot pipeline cycling — ${openStuck} open · median completion ${median(completionDays) ? Math.round(median(completionDays)*10)/10+'d' : '?'}.`;
  }

  const result = {
    generated_at: new Date().toISOString(),
    pipeline,
    total_tickets: tickets.length,
    open_total: openStuck,
    closed_total: tickets.length - openStuck,
    stages: stagesOut,
    completion: {
      count: completionDays.length,
      median_d: median(completionDays) ? Math.round(median(completionDays) * 10) / 10 : null,
      p75_d: pct(completionDays, 0.75) ? Math.round(pct(completionDays, 0.75) * 10) / 10 : null,
      p90_d: pct(completionDays, 0.90) ? Math.round(pct(completionDays, 0.90) * 10) / 10 : null,
      max_d: completionDays.length ? Math.round(Math.max(...completionDays) * 10) / 10 : null,
    },
    weekly_completion_trend: weeklyTrend,
    headline,
    caveats: [
      'Stage age uses createdate (total ticket age) — for accurate "time in current stage", HubSpot needs the property history endpoint, which isn\'t exposed without an additional scope. Stage age ≈ total ticket age for tickets that haven\'t bounced between stages, which is the common case.',
      'Completion cycle time = createdate → hs_lastmodifieddate for tickets in a CLOSED stage. Same caveat: assumes the close event is the last modification, which is typically true.',
    ],
    from_cache: false,
  };
  writeCache(result);
  return result;
}

module.exports = { run };
