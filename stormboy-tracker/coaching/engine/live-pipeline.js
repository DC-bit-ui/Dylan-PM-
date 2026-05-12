/**
 * Live coaching pipeline. Reads real HubSpot data, calls Anthropic with the
 * versioned prompts, writes real outputs to the cache.
 *
 * Three jobs implemented in this initial wire-up:
 *   - A1 friction: real medians + Sonnet friction analysis
 *   - B2 twins:    heuristic twin selection in code + Haiku narration per active deal
 *   - B1 active:   composed from A1 + B2 + deterministic risk score; Haiku for coaching message
 *
 * Deferred (need distillates from Cowork pipeline):
 *   - A2 counter-objection library
 *   - Pass 0 farm-visit / email distillation
 *
 * The shaping logic mirrors what `dashboard.js` does for the live UI — same
 * stage IDs, same era classification — so coaching reasons over the same
 * world the rep sees.
 */

const fs = require('fs');
const path = require('path');
const cache = require('./cache');
const { callJson, callText } = require('./anthropic');
const bus = require('./shared-bus');

const STG = [
  { id: '64066367',   n: 'Qualified Account' },
  { id: '2929183214', n: 'Discovery Call' },
  { id: '64066368',   n: 'Strategy Call' },
  { id: '64066369',   n: 'SLA/KCT Mapping' },
  { id: '1026535686', n: 'KCT Issued' },
  { id: '231921676',  n: 'Closed Won' }
];
const STG_BY_ID = Object.fromEntries(STG.map(s => [s.id, s]));
const DEAL_PROPS = [
  'dealname', 'dealstage', 'pipeline', 'createdate', 'closedate', 'amount',
  'closed_lost_reason', 'closed_won_reason', 'hubspot_owner_id',
  ...STG.flatMap(s => ['hs_v2_date_entered_' + s.id, 'hs_v2_cumulative_time_in_' + s.id])
];
const MS_PER_DAY = 86_400_000;
const STORMBOY_LAUNCH = new Date('2026-01-13');

// ============================================================================
// Helpers
// ============================================================================

async function hubspotSearch(body) {
  const port = process.env.PORT || 3000;
  const resp = await fetch(`http://localhost:${port}/api/hubspot/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!resp.ok) throw new Error(`HubSpot search ${resp.status}`);
  return resp.json();
}

async function fetchAllDealsAtStage(stageId, limit = 200) {
  const all = [];
  let after = null;
  while (true) {
    const r = await hubspotSearch({
      objectType: 'DEAL',
      filterGroups: [{ filters: [
        { propertyName: 'pipeline', operator: 'EQ', value: 'default' },
        { propertyName: 'dealstage', operator: 'EQ', value: stageId }
      ]}],
      properties: DEAL_PROPS,
      limit,
      after
    });
    all.push(...(r.results || []));
    if (!r.offset || all.length >= (r.total || 0)) break;
    after = r.offset;
    if (all.length >= 1000) break; // safety
  }
  return all;
}

function processDeal(raw) {
  const p = raw.properties || {};
  const stages = {};
  STG.forEach(s => {
    const ent = p['hs_v2_date_entered_' + s.id];
    const ms = parseInt(p['hs_v2_cumulative_time_in_' + s.id] || '0');
    stages[s.id] = { entered: ent ? new Date(ent) : null, days: ms > 0 ? ms / MS_PER_DAY : 0 };
  });
  const created = p.createdate ? new Date(p.createdate) : null;
  const closed = p.closedate ? new Date(p.closedate) : null;
  const first = stages['64066367'].entered || created;

  // Era classification — same logic as dashboard.js eraOf()
  let era;
  if (stages['1026535686'].entered && first && first < STORMBOY_LAUNCH) era = 'KCT Process';
  else if (first && first < STORMBOY_LAUNCH) era = 'Legacy';
  else if (stages['2929183214'].entered) era = 'Stormboy v2';
  else era = 'Stormboy v1';

  let totalDays = null;
  if (['231921676', 'closedlost'].includes(p.dealstage) && closed && first) totalDays = Math.round((closed - first) / MS_PER_DAY);
  else if (first) totalDays = Math.round((Date.now() - first) / MS_PER_DAY);

  const attribution = (p.closed_won_reason || '').toLowerCase().includes('lawrieco') ? 'lawrieco' : 'direct';

  return {
    id: String(raw.id),
    name: (p.dealname || 'Unnamed').trim(),
    stage: p.dealstage,
    created, closed, era, attribution,
    closed_lost_reason: p.closed_lost_reason || null,
    closed_won_reason: p.closed_won_reason || null,
    owner: p.hubspot_owner_id || null,
    stages, totalDays
  };
}

function median(arr) {
  const sorted = arr.filter(x => x != null && x > 0).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const m = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[m] : Math.round((sorted[m - 1] + sorted[m]) / 2);
}

function computeStageMedians(deals, fromStageId, toStageId) {
  // Time in fromStage for deals that progressed (entered toStage) vs deals that didn't.
  const won = [];
  const lost = [];
  deals.forEach(d => {
    const days = d.stages[fromStageId]?.days || 0;
    if (days <= 0) return;
    if (d.stage === '231921676' && d.stages[toStageId]?.entered) won.push(days);
    else if (d.stage === 'closedlost') lost.push(days);
  });
  return {
    median_days_won: median(won) || 0,
    median_days_lost: median(lost) || 0,
    n_won: won.length,
    n_lost: lost.length
  };
}

// ============================================================================
// A1 — Stage Friction
// ============================================================================

async function runA1Friction(allDeals) {
  // Build per-transition aggregates from real data
  const transitions = [];
  for (let i = 0; i < STG.length - 1; i++) {
    const from = STG[i], to = STG[i + 1];
    const stats = computeStageMedians(allDeals, from.id, to.id);
    transitions.push({ from: from.n, to: to.n, ...stats });
  }

  // Loss reason distribution (the dominant signal we found in MCP inspection)
  const lostDeals = allDeals.filter(d => d.stage === 'closedlost');
  const reasonCounts = {};
  lostDeals.forEach(d => {
    const r = d.closed_lost_reason || '(unspecified)';
    reasonCounts[r] = (reasonCounts[r] || 0) + 1;
  });
  const topReasons = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Era breakdown
  const eraCounts = {};
  allDeals.forEach(d => { eraCounts[d.era] = (eraCounts[d.era] || 0) + 1; });

  const system = `You are a sales operations analyst working with AgriProve, a soil carbon measurement platform serving Australian landholders.

AgriProve sells participation in 25-year soil carbon projects under Australia's ERF. Revenue split: AgriProve 25% / customer 75% (alternative: fee-for-service). Customer pays upfront baseline-sampling costs.

Pipeline: Qualified Account → Discovery Call → Strategy Call → SLA/KCT Mapping → KCT Issued → Closed Won. Domain language: ACCU, KCT, ERF, NRM region, 25-year project, 25/75 revenue split.

The structured closed_lost_reason enum is heavily skewed: "Insufficient commitment to implement" and "Cold" together account for ~85% of losses. Treat these as catch-alls — the actual why-signal lives in email/transcript distillates, which are a separate input.

OUTPUT RULES:
- Plays must be SPECIFIC and TACTICAL. "Improve discovery" is wrong. "Send 24h NRM-region-matched 25-year ACCU projection after Discovery Call" is right.
- Confidence calibration: [high] = ≥30 each side AND >2x gap. [moderate] = ≥15 AND >1.5x gap. [low] = thin signal.
- Use AgriProve language. Never generic sales-talk.
- Output strict JSON. No prose outside the JSON. No markdown code fences.`;

  const userMsg = `Analyse this real AgriProve pipeline. For each stage transition, identify the dominant friction pattern and recommend one tactical play.

REAL STAGE TRANSITION DATA:
${JSON.stringify(transitions, null, 2)}

TOP CLOSED_LOST REASONS (real distribution):
${JSON.stringify(topReasons, null, 2)}

ERA BREAKDOWN:
${JSON.stringify(eraCounts, null, 2)}

OUTPUT SCHEMA:
{
  "version": "a1.1",
  "generated_at": "<ISO8601 UTC>",
  "data_window": "live pipeline as of <today>",
  "stage_transitions": [
    {
      "from": "<stage name>",
      "to": "<stage name>",
      "median_days_won": <number>,
      "median_days_lost": <number>,
      "friction_pattern": "<≤200 chars>",
      "evidence": "<≤400 chars; cite numbers from the data>",
      "play": "<≤250 chars; tactical, executable next week, AgriProve-specific>",
      "play_priority": "high|medium|low",
      "confidence": "high|moderate|low"
    }
  ],
  "top_systemic_friction": "<≤300 chars>",
  "era_lift_observation": "<≤250 chars>"
}

Include one entry per transition in the input. Use the actual numbers from the data — don't invent. Output strict JSON only.`;

  const result = await callJson({ model: 'sonnet', system, user: userMsg, maxTokens: 4096 });
  result.generated_at = new Date().toISOString();
  return result;
}

// ============================================================================
// B2 — Comparable Twins (per active deal)
// ============================================================================

function stagePathJaccard(a, b) {
  const setA = new Set(STG.filter(s => a.stages[s.id]?.entered).map(s => s.id));
  const setB = new Set(STG.filter(s => b.stages[s.id]?.entered).map(s => s.id));
  const inter = [...setA].filter(x => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union ? inter / union : 0;
}

function durationCosine(a, b) {
  const va = STG.map(s => a.stages[s.id]?.days || 0);
  const vb = STG.map(s => b.stages[s.id]?.days || 0);
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < va.length; i++) { dot += va[i] * vb[i]; na += va[i] * va[i]; nb += vb[i] * vb[i]; }
  return (na && nb) ? dot / Math.sqrt(na * nb) : 0;
}

function selectTwins(active, pool, k = 5) {
  // Restrict pool to same attribution channel (lawrieco vs direct)
  const eligible = pool.filter(d => d.attribution === active.attribution || !active.attribution);

  const scored = eligible.map(d => {
    const era_match = d.era === active.era ? 1 : 0;
    const stage_jaccard = stagePathJaccard(active, d);
    const dur_cosine = durationCosine(active, d);
    const score = 0.25 * stage_jaccard + 0.20 * dur_cosine + 0.15 * era_match;
    // (region + size weights would go here once postcode→NRM rollup lands)
    return { d, score, era_match, stage_jaccard, dur_cosine };
  }).sort((a, b) => b.score - a.score);

  // Force won + lost mix
  const won = scored.filter(s => s.d.stage === '231921676').slice(0, 3);
  const lost = scored.filter(s => s.d.stage === 'closedlost').slice(0, 2);
  return [...won, ...lost].slice(0, k);
}

async function runB2TwinsForDeal(active, twinSelections, frictionForStage) {
  const stageName = STG_BY_ID[active.stage]?.n || active.stage;
  const daysInStage = active.stages[active.stage] ? Math.round((Date.now() - active.stages[active.stage].entered) / MS_PER_DAY) : null;

  const twinsInput = twinSelections.map(t => ({
    deal_id: t.d.id,
    deal_name: t.d.name,
    outcome: t.d.stage === '231921676' ? 'won' : 'lost',
    attribution: t.d.attribution,
    era: t.d.era,
    similarity_score: Math.round(t.score * 100) / 100,
    stage_path: STG.filter(s => t.d.stages[s.id]?.entered).map(s => s.n),
    total_days: t.d.totalDays,
    closed_lost_reason: t.d.closed_lost_reason,
    closed_won_reason: t.d.closed_won_reason
  }));

  const system = `You are a sales coach for AgriProve. Help a rep understand a current deal by analogy — show how historical "twin" deals progressed, and extract lessons.

AgriProve: 25-year soil carbon projects under Australia's ERF. 25/75 revenue split. Pipeline: Qualified → Discovery → Strategy → SLA/KCT Mapping → KCT Issued → Won.

OUTPUT RULES:
- Concrete, not platitudinous. "Engage earlier" is wrong. "Book SLA Mapping within 5 days — the won twin (#deal_id) did this" is right.
- Every next_best_action must reference a twin's deal_id.
- Don't invent details not in the data.
- AgriProve language. Don't say "demo", say "Strategy Call".
- Output strict JSON only. No markdown fences.`;

  const userMsg = `ACTIVE DEAL:
${JSON.stringify({ id: active.id, name: active.name, current_stage: stageName, days_in_current_stage: daysInStage, era: active.era, attribution: active.attribution, owner: active.owner }, null, 2)}

FRICTION AT THIS STAGE (from A1):
${JSON.stringify(frictionForStage || { friction_pattern: 'unknown', play: null }, null, 2)}

TWINS (selected by similarity in code; mix of won + lost):
${JSON.stringify(twinsInput, null, 2)}

OUTPUT SCHEMA:
{
  "version": "b2.1",
  "active_deal": { "id": "<echo>", "name": "<echo>", "current_stage": "<echo>", "days_in_current_stage": <number> },
  "twins": [
    {
      "deal_id": "<echo>",
      "deal_name": "<echo>",
      "outcome": "won|lost",
      "attribution": "<echo>",
      "similarity_basis": "<≤200 chars>",
      "what_happened": "<≤300 chars; the inflection, not the timeline>",
      "lesson": "<≤200 chars; applied to the active deal>"
    }
  ],
  "synthesis": "<≤400 chars; cross-twin pattern>",
  "next_best_actions": [
    {
      "action": "<≤200 chars; tactical, executable, AgriProve-specific>",
      "rationale": "<≤200 chars; cite twin deal_id(s)>",
      "priority": "high|medium|low"
    }
  ]
}`;

  return callJson({ model: 'haiku', system, user: userMsg, maxTokens: 2048 });
}

// ============================================================================
// B1 — Risk Coach (composed from A1 + B2 + heuristic risk score)
// ============================================================================

function computeRiskScore(daysInStage, medianWon, medianLost) {
  if (!daysInStage || !medianWon || !medianLost) return { class: 'amber', score: 50 };
  if (daysInStage <= medianWon) {
    return { class: 'green', score: Math.round(50 * daysInStage / medianWon) };
  }
  if (daysInStage <= medianLost) {
    return { class: 'amber', score: 50 + Math.round(40 * (daysInStage - medianWon) / (medianLost - medianWon)) };
  }
  // Past lost-median — extreme risk
  const score = Math.min(100, 90 + Math.round(10 * (daysInStage - medianLost) / medianLost));
  return { class: 'red', score };
}

async function runB1ForDeal(active, twinResult, frictionForStage, riskInfo) {
  const stageName = STG_BY_ID[active.stage]?.n || active.stage;
  const daysInStage = active.stages[active.stage] ? Math.round((Date.now() - active.stages[active.stage].entered) / MS_PER_DAY) : null;

  // Single combined call: coaching message + primary action + ready-to-use draft.
  // Enables the "system shouldn't add work" principle — the rep reviews a draft,
  // doesn't draft from scratch.
  const system = `You are a sales coach speaking peer-to-peer to an AgriProve rep about one of their active deals. Direct, not preachy.

AgriProve sells 25-year soil carbon projects under Australia's ERF. 25/75 revenue split. For Stormboy contacts, the conversion path is: Call (Ben) → On-farm visit (Hobbs, grazier-in-residence) → HORIZON Snapshot → Soft-sell conversion.

CRITICAL: The system's job is to ENABLE the rep, not add work. For every action you recommend, also produce the artifact ready-for-review — a draft email, a draft Teams message, a draft talking-point set, whichever fits. The rep reviews and sends in 3 minutes instead of drafting from scratch in 30.

Output strict JSON only. No markdown fences, no preamble.`;

  const userMsg = `DEAL: ${active.name} (#${active.id})
Stage: ${stageName}, ${daysInStage}d in stage
Era: ${active.era}, Attribution: ${active.attribution}
Owner: ${active.owner || 'unknown'}
Risk: ${riskInfo.class.toUpperCase()} ${riskInfo.score}/100

FRICTION AT THIS STAGE:
${frictionForStage ? frictionForStage.friction_pattern : '(no friction data)'}

TWINS:
${(twinResult.twins || []).map(t => `- ${t.deal_name} (#${t.deal_id}) [${t.outcome}]: ${t.lesson}`).join('\n')}

CANDIDATE ACTIONS:
${(twinResult.next_best_actions || []).map((a, i) => `${i + 1}. [${a.priority}] ${a.action}`).join('\n')}

OUTPUT SCHEMA (strict JSON):
{
  "coaching_message": "<3-4 sentence peer-to-peer message, citing twins by deal_id, ending with the ONE recommended action. ≤600 chars.>",
  "primary_action": "<verbatim text from candidate actions — pick the one your message recommends>",
  "inline_draft": {
    "type": "email" | "teams_message" | "talking_points",
    "subject": "<email subject; only if type=email>",
    "body": "<the actual artifact. For email: 150-280 words, customer's first name in greeting, customer-facing language, peer-to-peer Australian tone. Reference AgriProve in third-person when warranted. End with a clear ask + deadline. Don't sign with placeholder; use 'Ben' since he's the primary rep. For teams_message: brief internal share. For talking_points: 3-5 bullets the rep can use on a call.>",
    "length_words": <approximate word count>,
    "tone": "<one-line tone description, e.g. 'direct, peer-to-peer, gives customer agency'>"
  },
  "cowork_task": {
    "type": "draft_email" | "draft_one_pager" | "generate_horizon_snapshot" | "prepare_call_brief" | "compile_case_study_set",
    "description": "<one-sentence brief for Cowork to delegate this further if the rep wants something more substantial than the inline draft. e.g. 'Generate fresh HORIZON Snapshot + full one-pager comparison; deliver to Outlook drafts.'>",
    "estimated_minutes_saved": <number>,
    "delivery": "<where the artifact lands; e.g. 'Outlook drafts (PDF + email)'>"
  }
}

Output the JSON only. The draft body is the highest-value field — make it genuinely usable.`;

  const result = await callJson({ model: 'haiku', system, user: userMsg, maxTokens: 2048 });
  return result;
}

// ============================================================================
// Orchestrator
// ============================================================================

async function runAllLive() {
  const ranAt = new Date().toISOString();
  const ran = [];

  console.log('[live-pipeline] Fetching all deals from HubSpot...');
  const stageIds = STG.map(s => s.id).concat(['closedlost']);
  const rawByStage = {};
  for (const sid of stageIds) {
    rawByStage[sid] = await fetchAllDealsAtStage(sid);
  }
  const allDeals = Object.values(rawByStage).flat().map(processDeal);
  console.log(`[live-pipeline] Loaded ${allDeals.length} deals total`);

  // ----- A1 Friction -----
  console.log('[live-pipeline] Running A1 friction analysis...');
  const friction = await runA1Friction(allDeals);
  cache.write('friction', friction);
  ran.push('friction');
  console.log(`[live-pipeline] A1 done — ${(friction.stage_transitions || []).length} transitions analysed`);

  // ----- B2 Twins per active deal -----
  console.log('[live-pipeline] Running B2 twin matching for active deals...');
  const activeDeals = allDeals.filter(d => !['231921676', 'closedlost'].includes(d.stage));
  const closedPool = allDeals.filter(d => ['231921676', 'closedlost'].includes(d.stage));

  // Limit to top-12 highest-risk active deals to control cost on first run
  const activeRanked = activeDeals
    .map(d => ({ d, days_in_stage: d.stages[d.stage] ? Math.round((Date.now() - d.stages[d.stage].entered) / MS_PER_DAY) : 0 }))
    .sort((a, b) => b.days_in_stage - a.days_in_stage)
    .slice(0, 12);

  const twinsResults = [];
  const activeResults = [];

  const frictionByFrom = Object.fromEntries((friction.stage_transitions || []).map(t => [t.from, t]));

  // Anthropic rate limit: 4,000 output tokens/min on Haiku for this org.
  // Each B2 call produces ~1.5K tokens; each B1 ~300 tokens. ~1.8K tokens
  // per deal. 30-second throttle = 2 deals/min × 1.8K = 3.6K/min, under
  // the 4K limit with safety margin.
  const THROTTLE_MS = 30_000;
  let dealIdx = 0;

  for (const { d: active } of activeRanked) {
    if (dealIdx > 0) await new Promise(r => setTimeout(r, THROTTLE_MS));
    dealIdx++;
    try {
      const stageName = STG_BY_ID[active.stage]?.n || active.stage;
      const frictionForStage = frictionByFrom[stageName];
      const twinSelections = selectTwins(active, closedPool, 5);
      const twinResult = await runB2TwinsForDeal(active, twinSelections, frictionForStage);
      twinsResults.push(twinResult);

      // B1 — risk score (deterministic) + coaching message (Haiku)
      const daysInStage = active.stages[active.stage] ? Math.round((Date.now() - active.stages[active.stage].entered) / MS_PER_DAY) : null;
      const medianWon = frictionForStage?.median_days_won;
      const medianLost = frictionForStage?.median_days_lost;
      const risk = computeRiskScore(daysInStage, medianWon, medianLost);
      const b1Out = await runB1ForDeal(active, twinResult, frictionForStage, risk);

      activeResults.push({
        deal_id: active.id,
        deal_name: active.name,
        attribution: active.attribution,
        current_stage: stageName,
        current_stage_friction_from: stageName,
        days_in_current_stage: daysInStage,
        median_won_at_stage: medianWon,
        median_lost_at_stage: medianLost,
        risk_class: risk.class,
        risk_score: risk.score,
        coaching_message: b1Out.coaching_message || null,
        primary_action: b1Out.primary_action || (twinResult.next_best_actions || [])[0]?.action || null,
        supporting_twin_ids: (twinResult.twins || []).slice(0, 3).map(t => t.deal_id),
        enablement: (b1Out.inline_draft || b1Out.cowork_task) ? { inline_draft: b1Out.inline_draft, cowork_task: b1Out.cowork_task } : null
      });
      console.log(`[live-pipeline]   ✓ ${active.name} (${active.id}) — ${risk.class.toUpperCase()} ${risk.score}`);
    } catch (e) {
      console.error(`[live-pipeline]   ✗ ${active.name}: ${e.message}`);
    }
  }

  cache.write('twins', { version: 'b2.1', generated_at: ranAt, deals: twinsResults });
  ran.push('twins');
  cache.write('active', { version: 'b1.1', generated_at: ranAt, deals: activeResults });
  ran.push('active');

  // Bidirectional bus write — every coached deal lands a deal-signal in the
  // shared-growth-memory layer so Claudia's tool can read the same state.
  let busWrites = 0;
  for (const dealOut of activeResults) {
    try {
      bus.writeDealSignal({
        deal_id: dealOut.deal_id,
        deal_name: dealOut.deal_name,
        as_of: ranAt,
        attribution: dealOut.attribution,
        current_stage: dealOut.current_stage,
        days_in_current_stage: dealOut.days_in_current_stage,
        signals: dealOut.signals || null,  // present when multi-signal output is wired
        coaching_mode: dealOut.coaching_mode || null,
        active_probes: dealOut.active_probes || [],
        what_we_dont_know: dealOut.what_we_dont_know || [],
        supporting_twin_ids: dealOut.supporting_twin_ids || [],
        next_recommended_action: dealOut.primary_action || null
      });
      busWrites++;
    } catch (e) {
      console.error(`[live-pipeline]   shared-bus write failed for ${dealOut.deal_name}: ${e.message}`);
    }
  }
  console.log(`[live-pipeline] Bus: wrote ${busWrites} deal-signals to shared-growth-memory`);

  console.log(`[live-pipeline] Done. Wrote ${ran.length} caches. ${activeResults.length} active deals coached.`);
  return { mode: 'live', ranAt, ran, active_deal_count: activeResults.length, bus_writes: busWrites };
}

module.exports = { runAllLive };
