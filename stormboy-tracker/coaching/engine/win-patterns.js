/**
 * Win patterns — for each recently won deal, derive WHY it closed and what
 * pattern is replicable. LLM-grounded (Claude Haiku) over the real engagement
 * timeline. Cached per deal_id (wins don't change post-close).
 *
 * Output shape per win:
 *   {
 *     deal_id, deal_name, closedate, createdate, days_to_close,
 *     partner, total_property_hectares, hubspot_url,
 *     analysis: {
 *       one_line_why: "single-sentence central reason",
 *       replicable_pattern: ["bullet 1", "bullet 2", "bullet 3"],
 *       key_moment: "the most pivotal moment in the timeline",
 *       generated_at: ISO,
 *       n_engagements_used: number
 *     }
 *   }
 */

const fs = require('fs');
const path = require('path');
const { create: createBundle, readResult: readBundleResult, readMeta: readBundleMeta } = require('./intelligence-bundles');
const engagementTimeline = require('./engagement-timeline');

// Migrated from direct Anthropic API to bundle-based subscription compute
// per Cadel directive 2026-05-18. First run for each deal writes a bundle
// to <bus>/intelligence-bundles/ and caches a "pending" stub; subsequent
// runs check the bundle's result file and replace pending entries with
// the completed analysis when ready.

const { hubspotFetch } = require('./hubspot-client');

const HUBSPOT_BASE = 'https://api.hubapi.com';
const CACHE_PATH = path.join(__dirname, '..', 'cache', 'win-patterns.json');
// Fetch a wider window so Stormboy wins still surface if they fall outside the
// 5 most-recent overall. Channel-classification is cheap (one batch contacts
// read); only the displayed subset runs the LLM analysis.
const FETCH_N = 12;
const DISPLAY_N = 6;

function readCache() {
  try {
    if (!fs.existsSync(CACHE_PATH)) return {};
    return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')) || {};
  } catch (_) { return {}; }
}
function writeCache(obj) {
  try {
    fs.writeFileSync(CACHE_PATH, JSON.stringify(obj, null, 2));
  } catch (e) {
    console.error('win-patterns cache write failed:', e.message);
  }
}

async function fetchRecentWins(token) {
  const body = {
    filterGroups: [{
      filters: [{ propertyName: 'dealstage', operator: 'EQ', value: '231921676' }]
    }],
    properties: ['dealname', 'closedate', 'createdate', 'partner', 'lead_source',
                 'total_property_hectares', 'estimated_project_ha', 'deal_stage_before_close',
                 'hubspot_owner_id'],
    sorts: [{ propertyName: 'closedate', direction: 'DESCENDING' }],
    limit: FETCH_N,
  };
  const res = await hubspotFetch(HUBSPOT_BASE + '/crm/v3/objects/deals/search', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('HubSpot deals search ' + res.status);
  const data = await res.json();
  return data.results || [];
}

// Batch deal → contact associations. Returns { dealId: [contactId, ...] }
async function fetchDealContacts(token, dealIds) {
  if (!dealIds.length) return {};
  const res = await hubspotFetch(HUBSPOT_BASE + '/crm/v4/associations/deals/contacts/batch/read', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputs: dealIds.map(id => ({ id })) }),
  });
  if (!res.ok) {
    console.error('win-patterns associations fetch failed', res.status);
    return {};
  }
  const data = await res.json();
  const map = {};
  (data.results || []).forEach(r => {
    const fromId = r.from && r.from.id;
    if (!fromId) return;
    map[fromId] = (r.to || []).map(t => String(t.toObjectId));
  });
  return map;
}

// Batch contacts read for storm_boy_campaign_member flag.
// Returns { contactId: 'Yes' | other }.
async function fetchContactsStormboyFlag(token, contactIds) {
  if (!contactIds.length) return {};
  const res = await hubspotFetch(HUBSPOT_BASE + '/crm/v3/objects/contacts/batch/read', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      properties: ['storm_boy_campaign_member'],
      inputs: contactIds.map(id => ({ id })),
    }),
  });
  if (!res.ok) {
    console.error('win-patterns contacts batch fetch failed', res.status);
    return {};
  }
  const data = await res.json();
  const map = {};
  (data.results || []).forEach(c => {
    map[c.id] = c.properties && c.properties.storm_boy_campaign_member;
  });
  return map;
}

// Classify each deal's channel:
//   stormboy = any associated contact has storm_boy_campaign_member='Yes'
//   partner  = deal.partner (e.g. 'LawrieCo') — orthogonal to stormboy
//   direct   = neither
function classifyChannels(deals, dealContacts, contactFlags) {
  return deals.map(d => {
    const contactIds = dealContacts[d.id] || [];
    const isStormboy = contactIds.some(cid => contactFlags[cid] === 'Yes');
    const partner = (d.properties && d.properties.partner) || null;
    return {
      stormboy: isStormboy,
      partner,
      direct: !isStormboy && !partner,
    };
  });
}

function daysBetween(a, b) {
  if (!a || !b) return null;
  return Math.round((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));
}

function formatTimelineForPrompt(timeline) {
  const entries = (timeline.engagements || []).slice(0, 20);
  if (!entries.length) return '(no engagements recorded)';
  return entries.map(e => {
    const ts = e.timestamp ? new Date(e.timestamp).toISOString().slice(0, 10) : '?';
    const head = `[${ts}] ${e.kind || '?'}: ${e.title || ''}`;
    const sub = e.subline ? `  meta: ${e.subline}` : '';
    const body = e.body ? `  body: ${e.body.slice(0, 400)}` : '  (no body)';
    return [head, sub, body].filter(Boolean).join('\n');
  }).join('\n\n');
}

// Build the LLM prompt for one win. Used by queueWin() to create a bundle.
async function buildWinPrompt(deal) {
  const dealId = deal.id;
  const p = deal.properties || {};

  let timeline = { engagements: [], last_contact_date: null, engagements_returned: 0 };
  try {
    timeline = await engagementTimeline.run('deal', dealId);
  } catch (e) {
    console.error('win-patterns timeline fetch failed for', dealId, e.message);
  }

  const timelineText = formatTimelineForPrompt(timeline);
  const dealCtx = [
    `Deal: ${p.dealname || '(no name)'}`,
    `Closed: ${p.closedate} (created ${p.createdate}) — ${daysBetween(p.createdate, p.closedate)} days to close`,
    p.partner ? `Channel: via ${p.partner}` : 'Channel: direct',
    p.lead_source ? `Lead source: ${p.lead_source}` : null,
    p.total_property_hectares ? `Property: ${Math.round(parseFloat(p.total_property_hectares)).toLocaleString()} ha` : null,
    p.estimated_project_ha ? `Project area: ${Math.round(parseFloat(p.estimated_project_ha)).toLocaleString()} ha enrolled` : null,
  ].filter(Boolean).join('\n');

  const system = `You are an analyst studying which sales patterns at AgriProve produce closed-won soil-carbon project registrations. Your job: read a deal's real engagement timeline and identify WHY this specific deal closed, in a way the team can replicate on similar prospects. Be honest — if the timeline doesn't reveal much, say so. Never invent specifics that aren't in the timeline.`;

  const userPrompt = `${dealCtx}

ENGAGEMENT TIMELINE (most recent first):
${timelineText}

Return strict JSON only, no preamble:
{
  "one_line_why": "single sentence — the central reason this closed. Specific to this deal, not generic.",
  "replicable_pattern": ["pattern bullet 1 (replicable action / approach)", "pattern bullet 2", "pattern bullet 3"],
  "key_moment": "single sentence — the most pivotal moment in the timeline (or 'no clear inflection visible' if not)",
  "confidence": "high | moderate | low — based on how much signal the timeline gave you"
}`;

  return { system, userPrompt, timelineLen: (timeline.engagements || []).length, dealCtx };
}

// Create a bundle for this win, return the pending stub. Cowork (or interactive
// Claude Code) processes the bundle later and writes the result file. Subsequent
// runs of win-patterns pick up the completed result via refreshPendingResults.
async function queueWin(deal) {
  const { system, userPrompt, timelineLen } = await buildWinPrompt(deal);
  const p = deal.properties || {};
  const meta = createBundle({
    purpose: 'win-pattern-extraction',
    system_prompt: system,
    input_data: userPrompt,
    output_spec: 'Strict JSON matching: { "one_line_why": "...", "replicable_pattern": [...up to 5...], "key_moment": "...", "confidence": "high|moderate|low" }',
    output_schema: 'json',
    model_hint: 'haiku',
    target_kind: 'win-pattern',
    target_file: `coaching/cache/win-patterns.json#${deal.id}`,
    input_summary: `Win analysis · deal ${deal.id} · ${(p.dealname || '').slice(0, 60)}`,
    created_by: 'win-patterns.js',
  });
  return {
    one_line_why: '(pending — Cowork or Claude Code will process this bundle)',
    replicable_pattern: [],
    key_moment: null,
    confidence: 'pending',
    generated_at: new Date().toISOString(),
    n_engagements_used: timelineLen,
    bundle_id: meta.id,
    bundle_status: 'queued',
  };
}

function safeParseJson(s) {
  if (typeof s !== 'string') return s;
  try { return JSON.parse(s); }
  catch (_) {
    // Try to extract JSON from text — bundles may return Claude's response
    // wrapped with preamble/postamble.
    const m = s.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]); } catch (_) {} }
    return null;
  }
}

// Walk the cache; for any entry whose analysis is `pending` with a bundle_id,
// check if the result file exists. If yes, replace the pending stub with the
// completed analysis. Returns the number of entries upgraded.
function refreshPendingResults(cache) {
  let upgraded = 0;
  for (const dealId of Object.keys(cache)) {
    const entry = cache[dealId];
    const a = entry && entry.analysis;
    if (!a || a.confidence !== 'pending' || !a.bundle_id) continue;
    const result = readBundleResult(a.bundle_id);
    if (!result || result.result == null) continue;
    const parsed = safeParseJson(result.result);
    if (!parsed) {
      console.error('win-patterns: bundle', a.bundle_id, 'completed but result unparseable');
      continue;
    }
    entry.analysis = {
      one_line_why: parsed.one_line_why || '(no analysis)',
      replicable_pattern: Array.isArray(parsed.replicable_pattern) ? parsed.replicable_pattern.slice(0, 5) : [],
      key_moment: parsed.key_moment || null,
      confidence: parsed.confidence || 'moderate',
      generated_at: result.completed_at,
      n_engagements_used: a.n_engagements_used || 0,
      from_bundle: a.bundle_id,
    };
    upgraded++;
  }
  return upgraded;
}

async function run({ force = false } = {}) {
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error('HUBSPOT_TOKEN not set');

  // 1) Fetch a wider window of recent wins (cheap)
  const wins = await fetchRecentWins(token);
  if (!wins.length) return { generated_at: new Date().toISOString(), wins: [] };

  // 2) Cheap channel classification via batch associations + contacts read
  const dealIds = wins.map(w => w.id);
  const dealContacts = await fetchDealContacts(token, dealIds);
  const allContactIds = Array.from(new Set(Object.values(dealContacts).flat()));
  const contactFlags = await fetchContactsStormboyFlag(token, allContactIds);
  const channels = classifyChannels(wins, dealContacts, contactFlags);

  // 3) Sort: Stormboy first, then by closedate DESC. Take top N for display.
  //    Stormboy is the team's primary motion — surface those wins above all else.
  const indexed = wins.map((deal, i) => ({ deal, channel: channels[i] }));
  indexed.sort((a, b) => {
    const aS = a.channel.stormboy ? 1 : 0;
    const bS = b.channel.stormboy ? 1 : 0;
    if (aS !== bS) return bS - aS;
    return new Date(b.deal.properties.closedate) - new Date(a.deal.properties.closedate);
  });
  const top = indexed.slice(0, DISPLAY_N);

  // 4) Bundle-based analysis (cached per deal_id) on the displayed subset only.
  //    Step (i): pull cache and try to upgrade any pending bundles whose
  //              results have landed since last run.
  //    Step (ii): for each displayed win, either use the cached analysis
  //              (completed) or queue a new bundle (pending stub).
  const cache = readCache();
  const upgraded = refreshPendingResults(cache);
  let dirty = upgraded > 0;
  const out = [];

  for (const { deal, channel } of top) {
    const p = deal.properties || {};
    const cached = cache[deal.id];
    const cacheValid = !force && cached
      && cached.cached_for_closedate === p.closedate
      && cached.analysis
      && cached.analysis.confidence !== 'pending';   // pending = still queued
    let analysis;
    if (cacheValid) {
      analysis = cached.analysis;
    } else if (!force && cached && cached.analysis && cached.analysis.confidence === 'pending') {
      // Bundle is in flight — don't re-queue, just return the pending stub.
      analysis = cached.analysis;
    } else {
      try {
        analysis = await queueWin(deal);
        cache[deal.id] = { cached_for_closedate: p.closedate, analysis };
        dirty = true;
      } catch (e) {
        console.error('win-patterns queue failed for', deal.id, e.message);
        analysis = {
          one_line_why: '(queueing failed: ' + e.message.slice(0, 100) + ')',
          replicable_pattern: [],
          key_moment: null,
          confidence: 'low',
          generated_at: new Date().toISOString(),
          n_engagements_used: 0,
        };
      }
    }
    out.push({
      deal_id: deal.id,
      deal_name: p.dealname,
      closedate: p.closedate,
      createdate: p.createdate,
      days_to_close: daysBetween(p.createdate, p.closedate),
      partner: p.partner || null,
      lead_source: p.lead_source || null,
      channel,
      total_property_hectares: p.total_property_hectares ? parseFloat(p.total_property_hectares) : null,
      estimated_project_ha: p.estimated_project_ha ? parseFloat(p.estimated_project_ha) : null,
      hubspot_url: `https://app.hubspot.com/contacts/24224559/record/0-3/${deal.id}`,
      analysis,
      from_cache: cacheValid,
    });
  }

  if (dirty) writeCache(cache);

  return {
    generated_at: new Date().toISOString(),
    fetched_n: wins.length,
    displayed_n: out.length,
    stormboy_n: out.filter(w => w.channel.stormboy).length,
    wins: out,
  };
}

module.exports = { run };
