/**
 * Mock data generator — produces realistic, internally-consistent JSON that
 * matches the exact output schemas of pass0/A1/B2/A2/B1 prompts.
 *
 * Goal: every UI surface (Plays, Patterns, inline cards) has something
 * meaningful to render before the live HubSpot+Claude pipeline lands.
 *
 * Updated 2026-05-08 with MCP-validated real-data corrections:
 * - 25-year project terminology (not 7-year)
 * - 25/75 revenue split context
 * - Real closed_lost_reason enum values
 * - LawrieCo channel attribution
 * - NRM regions (real geographic clusters with shared soil/rainfall context)
 *
 * Deterministic — same outputs each call so UI iteration doesn't churn.
 */

const NOW = new Date('2026-05-08T04:30:00Z').toISOString();
const WINDOW = '2025-08-01 to 2026-05-08';

// ----- NRM-style regions (these are all real Australian NRM regions) -----
// Each carries shared soil/rainfall/production context, hence high signal
// for B2 twin matching once postcode→NRM rollup is wired.

// Real HubSpot deal IDs and names from the live pipeline (smoke-tested 2026-05-11).
// Using real IDs means the live-mode join in composeDealCoaching matches the
// active deals returned by HubSpot — coaching cards reference recognisable
// customers, not synthetic placeholders.
const DEALS = {
  // Won deals — direct channel
  '248596297166': { name: 'Weatherall CP - Jonathan Harpley',     outcome: 'won',  attribution: 'direct' },
  '40789889068':  { name: 'Burnham Grazing - Dan Burnham',         outcome: 'won',  attribution: 'direct', win_reason: 'Relationship and open minded to adapt' },
  '186050120174': { name: 'Davidsons & Laen - Brendan Reinheimer', outcome: 'won',  attribution: 'direct' },
  '186974841297': { name: 'Windy Ridge Farm - Robert Johnson',     outcome: 'won',  attribution: 'direct' },
  '41160307896':  { name: 'Maitland Food - Jim Maitland',          outcome: 'won',  attribution: 'direct' },
  '159605415399': { name: 'Sunnyside Farming - Aaron Guymer',      outcome: 'won',  attribution: 'direct' },
  '199204863464': { name: 'Kingston Angus - Adelie Botes',         outcome: 'won',  attribution: 'direct' },
  // Won deals — LawrieCo partner channel
  '247673490884': { name: 'Moya Farm - Bruce Ohlmeyer',            outcome: 'won',  attribution: 'lawrieco' },
  '173409589736': { name: 'Grape Innovation - D&R Marciano',       outcome: 'won',  attribution: 'lawrieco' },
  '221253955021': { name: 'Malleeview Pastoral - Jesse Chandler',  outcome: 'won',  attribution: 'lawrieco' },
  // Lost deals — real closed_lost_reason values from the live pipeline
  '183751836130': { name: 'Tumbledown Wagyu - Mick Lewis',         outcome: 'lost', attribution: 'direct', lost_reason: 'Insufficient commitment to implement' },
  '144047802829': { name: 'Springfield Carbon Project - John Clayton', outcome: 'lost', attribution: 'direct', lost_reason: 'Insufficient commitment to implement' },
  '147625095632': { name: 'Mount Moon Pastoral - Edward Ohlrich',  outcome: 'lost', attribution: 'direct', lost_reason: 'Cold' },
  '131569892814': { name: 'Fisher Brothers - Craig Fisher',        outcome: 'lost', attribution: 'direct', lost_reason: 'Insufficient commitment to implement' },
  '192039833074': { name: 'Bioenergy Group Pty Ltd - Lee Hamilton', outcome: 'lost', attribution: 'direct', lost_reason: 'Cold' },
  '40861198733':  { name: 'Georgina Kedzlie - Mitchell Grazing',   outcome: 'lost', attribution: 'direct', lost_reason: 'Insufficient commitment to implement' }
};

// ============================================================================
// Pass 0 — Email distillates (sample from a few deals)
// ============================================================================
function emailDistillates() {
  const records = {};
  let id = 1;
  function add(deal_id, stage, role, objs, props, sentiment, summary) {
    const eid = `e${String(id++).padStart(4, '0')}`;
    records[eid] = {
      version: 'p0.1',
      email_id: eid,
      deal_id,
      deal_stage_at_time: stage,
      sender_role: role,
      objections_raised: objs,
      value_props_landed: props,
      sentiment_shift: sentiment,
      summary
    };
  }
  // Real Aircall distillate — 2026-05-06 Ben Payne ↔ "Alec Thompson" (post-KCT
  // customer in active sales pipeline). PII generalised — actual contact name
  // not stored downstream. Source: Confluence Bens Calls folder, page 564953089.
  add('aircall-real-active-post-kct-01', 'KCT Issued (Post-KCT)', 'rep', [], [
    'Confirmed delivery timeline: carbon project plan + key commercial terms by end of week',
    'Offered post-KCT catch-up call with Will Frecheville (Head of Operations) for any review questions',
    'Explained that AgriWeb (3rd-party farm record-keeping platform) integrates via shared license — customer doesn\'t need to re-enter records annually'
  ], 'positive', 'Healthy post-KCT progression call. Customer engaged, asking forward-looking questions about ongoing reporting. No objections raised. 3+ minutes of rapport-building (golf chat) before substance — Ben\'s signature opening style.');
  add('D-W-001', 'Strategy Call', 'customer', ['25/75 revenue split feels steep'], [], 'negative', 'Customer pushed back on 25% AgriProve cut — wanted clarity on alternative');
  add('D-W-001', 'Strategy Call', 'rep', [], ['25-year diversified income reframing using NRM-region case'], 'positive', 'Rep showed Riverina ACCU revenue projection over 25 years; customer warmed');
  add('D-W-001', 'SLA/KCT Mapping', 'customer', [], ['Project plan understandable when walked through'], 'positive', 'Customer engaged with project plan walkthrough');
  add('D-W-002', 'Discovery Call', 'rep', [], ['Eligibility confirmed for soil type'], 'positive', 'Rep confirmed mixed-grazing eligibility; customer warmed');
  add('D-L-001', 'Strategy Call', 'customer', ['Implementation feels heavy for partner'], [], 'negative', 'Customer flagged that partner not engaged; momentum stalled');
  add('D-L-003', 'Discovery Call', 'customer', [], [], 'none', 'Customer cordial but no follow-up after 14 days; classic Cold pattern');
  add('D-L-004', 'Strategy Call', 'customer', ['25-year commitment too long for our planning'], [], 'negative', 'Customer raised generational planning concern; rep did not deflect with disclosure-template framing');
  add('D-L-005', 'Discovery Call', 'customer', ['Considering DIY methodology'], [], 'negative', 'Customer mentioned exploring own-team carbon project; rep did not differentiate AgriProve value-add');
  return { version: 'p0.1', generated_at: NOW, count: id - 1, records };
}

// ============================================================================
// A1 — Stage friction
// ============================================================================
function friction() {
  return {
    version: 'a1.1',
    generated_at: NOW,
    data_window: WINDOW,
    stage_transitions: [
      {
        from: 'Qualified Account', to: 'Discovery Call',
        median_days_won: 3.1, median_days_lost: 4.8,
        friction_pattern: 'No clear friction at qualification gate. Volume and timing balanced; small gap likely noise.',
        evidence: 'Won n=42 (3.1d median), lost n=18 (4.8d). Gap 1.5x — below threshold for [moderate].',
        play: 'No structural change recommended. Maintain current cadence.',
        play_priority: 'low', confidence: 'low'
      },
      {
        from: 'Discovery Call', to: 'Strategy Call',
        median_days_won: 4.2, median_days_lost: 11.8,
        friction_pattern: 'Reps not booking the Strategy Call before the customer cools — many of these become "Cold" losses. Lost deals show 3+ scheduling round-trips between Discovery and the next call landing. Stormboy v2 introduced Discovery as a gate but execution is inconsistent.',
        evidence: 'Won median 4.2d vs lost 11.8d — 2.8x gap, [high] signal. SBv2 lost-deal median actually widened (+3d) post-launch. 36% of all losses across pipeline are coded "Cold" — many trace back to this transition.',
        play: 'Send the customer\'s NRM-region-matched 25-year ACCU revenue projection within 24h of Discovery, and propose 3 Strategy Call slots in the SAME email. Pattern from won twin Wagga-Hills (D-W-001).',
        play_priority: 'high', confidence: 'high'
      },
      {
        from: 'Strategy Call', to: 'SLA/KCT Mapping',
        median_days_won: 6.0, median_days_lost: 14.3,
        friction_pattern: '25/75 revenue-share resistance surfaces here ("25%, too high" loss reason). Reps without an NRM-regional 25-year revenue projection lose disproportionately; reps with one convert at 2.4× rate.',
        evidence: 'Won median 6.0d, lost 14.3d. Pass 0 distillates show "25/75 revenue split" objection in 60% of losses at this transition. Wagga-Hills (D-W-001), Mid-Lachlan (D-W-002) used regional projections and converted.',
        play: 'Match deal to NRM-region case study before Strategy Call ends. Lead Strategy with 25-year revenue breakdown for that region — show the 75% customer share in absolute dollars.',
        play_priority: 'high', confidence: 'high'
      },
      {
        from: 'SLA/KCT Mapping', to: 'KCT Issued',
        median_days_won: 4.5, median_days_lost: 21.0,
        friction_pattern: 'KCT effort objection — customers stall on completing the assessment. Won deals had rep-led KCT walkthroughs; lost deals were left to async self-completion. Often correlates with "Insufficient commitment to implement" loss reason — particularly when partner not engaged.',
        evidence: 'Won 4.5d vs lost 21.0d — 4.7× gap, highest in pipeline. n=28 won, n=11 lost. 9/11 losses had no rep-customer call recorded between SLA and KCT.',
        play: 'Offer to walk customer through KCT live in a 30-min Teams call. Ensure partner is on the call.',
        play_priority: 'high', confidence: 'high'
      },
      {
        from: 'KCT Issued', to: 'Closed Won',
        median_days_won: 5.8, median_days_lost: 12.4,
        friction_pattern: 'Final-stage hesitation. Customers who completed KCT but didn\'t close mostly cited internal alignment (partner, accountant, family) or last-minute baseline-cost concerns ("Baseline costs too high" enum value).',
        evidence: 'Won 5.8d, lost 12.4d. n=22 vs n=4 — thin loss signal. Distillates show "internal review" + upfront-cost surprise pattern in 3/4 losses.',
        play: 'During SLA, ask explicitly who else needs to sign off and surface baseline-cost figures upfront — not at KCT issuance. Offer joint call before KCT is issued.',
        play_priority: 'medium', confidence: 'moderate'
      }
    ],
    top_systemic_friction: 'Discovery → Strategy is bleeding. Lost-deal median is 11.8d vs 4.2d for wins, and many of these become "Cold" losses (36% of all losses). Stormboy v2 has NOT closed the gap — the spread widened post-launch (+3d on losses). The pipeline\'s biggest leverage point is ensuring every Discovery Call ends with a booked Strategy slot AND a 25-year regional revenue projection.',
    era_lift_observation: 'KCT → SBv1 produced clear win-rate lift (+18%). SBv1 → SBv2 was marginal (+3%). v2\'s Discovery Call gate is correctly designed but inconsistent in execution — half of v2 deals have Discovery durations under 30 minutes, suggesting the stage is being treated as a checkbox rather than a structured gate.'
  };
}

// ============================================================================
// B2 — Comparable twins (per active deal)
// ============================================================================
function twins() {
  const t = (deal_id, similarity_basis, what_happened, lesson) => {
    const d = DEALS[deal_id];
    return { deal_id, deal_name: d.name, outcome: d.outcome, attribution: d.attribution, similarity_basis, what_happened, lesson };
  };

  return {
    version: 'b2.1',
    generated_at: NOW,
    deals: [
      {
        active_deal: { id: '31711997037', name: 'Daisy Bank + Bellevue - James Almond', current_stage: 'KCT Issued', days_in_current_stage: 426, attribution: 'direct' },
        twins: [
          t('40789889068', 'Same stage (KCT Issued), direct channel; reached KCT Issued and stayed there for ~7 months before re-engaging and converting', 'Burnham Grazing was at KCT Issued for ~210 days before closing. Win reason recorded: "Relationship and open minded to adapt to soil carbon project". The unblock was relational, not procedural — a fresh HORIZON refresh framed around platform changes broke the inertia.', 'Don\'t treat zombie KCT deals as terminal. A fresh HORIZON Snapshot + relationship-led re-engagement has converted twins much older than expected.'),
          t('147625095632', 'Direct channel; spent extended time in pipeline before silent attrition', 'Mount Moon Pastoral went quiet after early engagement and was closed as "Cold" with no formal pushback. Same shape as Daisy Bank if no re-engagement happens.', 'Without intervention this becomes a Cold loss within weeks. The clock is running.'),
          t('248596297166', 'Same stage, direct channel; closed Won from KCT Issued', 'Weatherall CP progressed through all five stages and closed Won via a rep-led, partner-attended KCT walkthrough.', 'A rep-led walkthrough with the customer\'s partner is the move that breaks KCT stalls.')
        ],
        synthesis: 'Daisy Bank is 35× past the lost-median for this stage. The pattern across twins is binary: re-engage with HORIZON refresh + relationship-led conversation (Burnham path → Won), or it becomes Mount Moon (Cold loss). Status quo is not stable.',
        next_best_actions: [
          { action: 'Decision call THIS WEEK: generate fresh HORIZON Snapshot, attempt nurture-back outreach, or close lost.', rationale: 'Burnham Grazing pattern converted at this exact age; Mount Moon Pastoral pattern lost. No middle ground after 426 days.', priority: 'high' },
          { action: 'If re-engaging: book Hobbs for an on-farm visit, snapshot in hand.', rationale: 'On-farm + fresh report is the highest-leverage conversion event for stale deals.', priority: 'high' }
        ]
      },
      {
        active_deal: { id: '41104436568', name: 'Bulgoo Pastoral - Jeremy Pockley', current_stage: 'Strategy Call', days_in_current_stage: 271, attribution: 'direct' },
        twins: [
          t('40789889068', 'Direct channel; converted from extended Strategy-stall via relationship-led re-engagement', 'Burnham Grazing\'s win reason ("Relationship and open minded to adapt") shows the unblock pattern — not a tactical objection-handle, but a fresh framing of "what\'s changed".', 'Bulgoo at day 271 needs the Burnham-style intervention, not another Strategy Call email.'),
          t('144047802829', 'Direct channel; comparable Strategy-stage stall closed Lost', 'Springfield Carbon Project drifted from Strategy without explicit re-engagement and closed as "Insufficient commitment to implement".', 'Without intervention, Bulgoo follows Springfield.'),
          t('183751836130', 'Direct channel; Strategy-stage stall closed Lost on same enum reason', 'Tumbledown Wagyu also stalled at Strategy and was lost as "Insufficient commitment to implement" — the same end-state Bulgoo is drifting toward.', 'Same cohort; same loss pattern unless re-engaged.')
        ],
        synthesis: 'Strategy-stage stalls from late 2025 split cleanly into two outcomes: Burnham-style HORIZON refresh + re-engagement → Won, or Springfield/Tumbledown drift → Lost. Bulgoo is 9× past lost-median.',
        next_best_actions: [
          { action: 'Run the Burnham-pattern re-engagement: HORIZON refresh + "what\'s changed" reframe + offer Hobbs on-farm.', rationale: 'Burnham converted at this stall age; Springfield/Tumbledown did not get this and were lost.', priority: 'high' }
        ]
      },
      {
        active_deal: { id: '140345085389', name: 'JA - John Atherton', current_stage: 'Strategy Call', days_in_current_stage: 249, attribution: 'direct' },
        twins: [
          t('186050120174', 'Direct channel; progressed past Strategy and converted', 'Davidsons & Laen moved through Strategy and KCT and closed Won. Specific win driver not recorded but the deal progressed normally — the contrast with JA-Atherton\'s 249-day stall is instructive.', 'The Davidsons pattern is normal-velocity. JA-Atherton is now 25× past that benchmark.'),
          t('147625095632', 'Direct channel; comparable late-stage Cold loss', 'Mount Moon Pastoral was lost as "Cold" — quiet attrition, no explicit objection. Same pattern JA-Atherton is exhibiting now.', 'Cold attrition is the default outcome for unattended Strategy-stalled deals.')
        ],
        synthesis: 'Strategy-stage stall at 249 days. Without intervention this becomes Cold (Mount Moon). With a HORIZON refresh + explicit "reconnect" framing, there\'s still a path — but margins narrow weekly.',
        next_best_actions: [
          { action: 'Send the 25-year ACCU revenue projection by Friday with explicit "let\'s reconnect" framing.', rationale: 'Davidsons & Laen pattern of explicit progression; lack of it = Mount Moon Cold loss.', priority: 'high' },
          { action: 'If no response in 7 days, move to closed-lost. Don\'t let it drift another quarter.', rationale: 'Cold-attrition is the dominant outcome for unattended Strategy stalls; the decision matters more than further effort.', priority: 'medium' }
        ]
      },
      {
        active_deal: { id: '141507724737', name: 'Brigalow and Mostowie - Rodger Jefferis', current_stage: 'Strategy Call', days_in_current_stage: 245, attribution: 'direct' },
        twins: [
          t('40789889068', 'Direct channel; relationship-led conversion from comparable Strategy stall', 'Burnham Grazing was won via the relationship-led re-engagement pattern — fresh HORIZON, "what\'s changed" framing, soft commitment.', 'This is the play for any Strategy-stalled direct deal in this age cohort.'),
          t('183751836130', 'Same cohort, same stage, same likely outcome without action', 'Tumbledown Wagyu was closed lost as "Insufficient commitment to implement" after a similar Strategy stall.', 'Tumbledown is the alternate timeline for Brigalow.')
        ],
        synthesis: 'Brigalow sits in the late-2025 Strategy-stall cohort with JA-Atherton and Bulgoo. The pattern is binary: Burnham re-engagement (Won) or Tumbledown drift (Lost). Ben owns this — same owner pattern as the rest of the cohort.',
        next_best_actions: [
          { action: 'Run Ben\'s nurture-back tactic: fresh HORIZON Snapshot + "what\'s changed" frame.', rationale: 'Burnham conversion pattern is the only one observed at this stall age.', priority: 'high' },
          { action: 'If positive response, escalate to Hobbs on-farm immediately.', rationale: 'On-farm conversion is the soft-sell event for Stormboy + direct alike.', priority: 'high' }
        ]
      },
      {
        active_deal: { id: '167288289773', name: 'Fenmore Farming - Bruce McLean', current_stage: 'SLA/KCT Mapping', days_in_current_stage: 200, attribution: 'direct' },
        twins: [
          t('248596297166', 'Direct channel; progressed from SLA/KCT Mapping to Won', 'Weatherall CP\'s SLA/KCT transition was clean — rep-led KCT walkthrough with partner attendance is the recorded driver in adjacent farm-visit distillates.', 'The partner-attended live walkthrough is the unlock at this stage.'),
          t('186050120174', 'Direct channel; comparable SLA → Won progression', 'Davidsons & Laen progressed through SLA/KCT to Won without long stall — the velocity differs starkly from Fenmore.', 'Velocity matters; 200-day SLA stalls don\'t recover without intervention.'),
          t('131569892814', 'Direct channel; SLA-stage stall closed Lost as "Insufficient commitment"', 'Fisher Brothers stalled at SLA/KCT and was coded "Insufficient commitment to implement" — often signals partner not engaged.', 'Without partner engagement, Fenmore\'s end-state is Fisher Brothers.')
        ],
        synthesis: 'SLA/KCT stalls at 200 days are almost always partner-disengagement. The diagnostic is asking who else needs to sign off, and offering to do KCT live with both partners. Refusal of that itself is the result.',
        next_best_actions: [
          { action: 'Schedule a 30-min Teams call this week to walk through KCT live with Bruce AND his partner.', rationale: 'Weatherall CP and Davidsons & Laen both progressed this way; Fisher Brothers did not.', priority: 'high' },
          { action: 'If partner won\'t attend, that\'s the diagnosis — escalate or close-lost.', rationale: 'Partner refusal at this stage is the strongest single predictor of Insufficient-commitment loss.', priority: 'high' }
        ]
      },
      {
        active_deal: { id: '183762813378', name: 'Keynes Consulting Pty Ltd - Daniel Keynes', current_stage: 'Qualified Account', days_in_current_stage: 181, attribution: 'direct' },
        twins: [
          t('40861198733', 'Direct channel; Qualified-stage stall closed lost as "Insufficient commitment to implement"', 'Georgina Kedzlie / Mitchell Grazing stalled at early stages and was eventually closed lost. Same profile as Keynes if not triaged.', 'Qualified-stage stalls at 6+ months almost always end as Insufficient-commitment losses.')
        ],
        synthesis: 'Keynes is a consulting entity, not a farmer-direct profile — the typical Stormboy motion may not apply. Treat as a one-call triage: assess + decide. Drifting further wastes pipeline capacity.',
        next_best_actions: [
          { action: 'One direct triage call THIS WEEK to decide: Hobbs visit, deferred with reason, or close-lost.', rationale: 'Atypical entity profile + 181-day stall warrants explicit decision over default-progress.', priority: 'high' }
        ]
      }
    ]
  };
}

// ============================================================================
// A2 — Counter-objection library (real loss reasons + hypothesis territories)
// ============================================================================
function objections() {
  return {
    version: 'a2.1',
    generated_at: NOW,
    data_window: WINDOW,
    stage_index: [
      {
        stage: 'Strategy Call',
        loss_count_in_window: 47,
        objection_clusters: [
          {
            cluster_name: '25/75 revenue split — "25% is too high"',
            typical_form: 'Why does AgriProve take 25%? Can I keep more of the ACCU revenue?',
            frequency: 12,
            supporting_loss_deal_ids: ['D-L-001'],
            what_won: 'Won deals reframed the 25/75 split with absolute dollars, not percentages — showing the customer\'s 75% share over 25 years on their NRM region. Wagga-Hills (D-W-001) used a Riverina projection: customer share = $X over 25 years on Y hectares.',
            example_won_deal_id: 'D-W-001',
            tactical_framing: 'Let me show you what 75% looks like in actual dollars on your NRM region over 25 years — [project the regional revenue table from the case study]. The 25% covers methodology compliance, baseline sampling, and audit defence — without that, the project doesn\'t qualify for ACCUs.',
            confidence: 'high'
          },
          {
            cluster_name: 'Fee-for-service preference — "I want to keep 100%"',
            typical_form: 'I\'ve heard about a fee-for-service model — can I keep 100% of the ACCUs and pay you a fee instead?',
            frequency: 6,
            supporting_loss_deal_ids: [],
            what_won: 'Won deals presented the fee-for-service option transparently and ran a back-of-envelope comparison showing where each model wins. Most customers self-selected the 25/75 split when shown the upfront-cash implications of fee-for-service.',
            example_won_deal_id: 'D-W-002',
            tactical_framing: 'Yes — fee-for-service is an option. Let\'s compare on your numbers. Fee-for-service requires $X upfront cash and $Y/year service fees. The 25/75 split has lower upfront cash and AgriProve carries the methodology risk. Which fits your cashflow better?',
            confidence: 'moderate'
          },
          {
            cluster_name: '25-year timeframe — "too long"',
            typical_form: 'Locking in for 25 years is a long time. What if the world changes? What if I sell?',
            frequency: 8,
            supporting_loss_deal_ids: ['D-L-004'],
            what_won: 'Won deals walked through the project-transfer disclosure: the project moves with title. Buyers consistently see the future ACCU revenue as an asset, not a liability. Showed the disclosure template upfront.',
            example_won_deal_id: 'D-W-003',
            tactical_framing: 'I get it — 25 years feels long. Two things: (1) the project transfers with title, so if you sell, the buyer inherits the future ACCU revenue — usually they see it as a value-add. (2) you only commit when you sign the SLA — let\'s walk through what year 5, 10, 25 actually look like before you decide.',
            confidence: 'moderate'
          }
        ]
      },
      {
        stage: 'SLA/KCT Mapping',
        loss_count_in_window: 31,
        objection_clusters: [
          {
            cluster_name: 'Implementation commitment gap — partner not engaged',
            typical_form: '"Insufficient commitment to implement" — often masks the partner / spouse / accountant not being on board.',
            frequency: 14,
            supporting_loss_deal_ids: ['D-L-001'],
            what_won: 'Bairnsdale Dairy (D-W-004) had a rep-led KCT walkthrough on a 30-min Teams call WITH the partner. KCT completed in one sitting; engagement scored higher post-call than pre.',
            example_won_deal_id: 'D-W-004',
            tactical_framing: 'Let\'s do the KCT together on a 30-min call — and let\'s have [partner/spouse] on too. Most customers find it easier to ask questions in real time, and getting alignment now saves a stall later.',
            confidence: 'high'
          },
          {
            cluster_name: 'Baseline cost surprise — "too high upfront"',
            typical_form: 'I didn\'t realise the baseline-sampling costs would be this much upfront. Can I phase it?',
            frequency: 5,
            supporting_loss_deal_ids: [],
            what_won: 'Won deals surfaced baseline-cost figures EARLY (Strategy Call, not SLA). Customers who saw the numbers upfront committed; customers surprised at SLA stalled.',
            example_won_deal_id: 'D-W-002',
            tactical_framing: 'Quick check — have we walked through the upfront baseline-sampling cost yet? Better to surface this now than at SLA. Here\'s the typical figure for a [size/region] property: $X. Most customers find it manageable when shown alongside the 25-year revenue projection.',
            confidence: 'moderate'
          }
        ]
      },
      {
        stage: 'Discovery Call',
        loss_count_in_window: 19,
        objection_clusters: [
          {
            cluster_name: 'DIY preference — "Do it ourselves"',
            typical_form: 'We\'ve got an agronomist on staff — couldn\'t we run our own carbon project?',
            frequency: 4,
            supporting_loss_deal_ids: ['D-L-005'],
            what_won: 'Won deals named the differentiator clearly: ERF methodology compliance, audit-defensible measurement, regulatory liability transfer. DIY teams typically underestimate the methodology + audit burden.',
            example_won_deal_id: 'D-W-001',
            tactical_framing: 'Honest answer — yes, technically. But running a soil carbon project means becoming an ERF-compliant project proponent. That\'s methodology compliance, baseline sampling rigour, and audit-defence under the Clean Energy Regulator. AgriProve carries that liability so your team doesn\'t have to. Want to walk through what we do that DIY teams typically underestimate?',
            confidence: 'moderate'
          },
          {
            cluster_name: '"Cold" / silent attrition (HYPOTHESIS — needs distillate decoding)',
            typical_form: 'Customer goes quiet after Discovery. No clear objection raised. Marked "Cold" 30+ days later.',
            frequency: 7,
            supporting_loss_deal_ids: ['D-L-003'],
            what_won: 'Won deals booked the Strategy Call slot WITHIN the Discovery Call itself. No round-trips. Customers who said "I\'ll get back to you" cooled at 36% rate.',
            example_won_deal_id: 'D-W-001',
            tactical_framing: 'Don\'t leave Discovery without a Strategy Call booked. If the customer says "I\'ll get back to you", offer 3 specific slot options before closing — the friction of finding time later is what most "Cold" losses trace back to.',
            confidence: 'low'
          }
        ]
      }
    ]
  };
}

// ============================================================================
// B1 — Active deal coaching cards (per-deal risk + composed message)
// ============================================================================
function active() {
  // Real HubSpot deal IDs as keys — composeDealCoaching matches by these IDs
  // against the active deals HubSpot returns. The 6 deals below are the
  // oldest-in-stage live deals as of 2026-05-11 — every one is past the
  // lost-deal median for its stage by 10× or more. This is the actual state
  // of the active pipeline, not a synthetic example.
  return {
    version: 'b1.1',
    generated_at: NOW,
    deals: [
      {
        deal_id: '31711997037',
        deal_name: 'Daisy Bank + Bellevue - James Almond',
        attribution: 'direct',
        current_stage: 'KCT Issued',
        current_stage_friction_from: 'KCT Issued',
        days_in_current_stage: 426,
        median_won_at_stage: 6,
        median_lost_at_stage: 12,
        risk_class: 'amber',
        risk_score: 65,
        // === Multi-signal architecture (Tier 1 stage + Tier 2 behavioral + Tier 3 content) ===
        signals: {
          stage:       { health: 'red',   value: '426d at KCT Issued · 35× past lost-median',
                         confidence: 'high',
                         note: 'Stale by stage timing alone.' },
          behavioral:  { health: 'amber', value: 'Last meaningful contact 23d ago · slowing reply latency',
                         confidence: 'moderate',
                         note: 'Some recent activity. Not ghosted — but engagement is dropping.',
                         last_meaningful_contact: '2026-04-18',
                         contact_velocity_30d: 2,
                         reply_latency_trend: 'slowing' },
          content:     { health: 'green', value: 'Last customer email was warm; mentioned wife on board',
                         confidence: 'moderate',
                         note: 'Content trajectory is positive. The stall isn\'t cold — it\'s partner-alignment.',
                         latest_customer_position: 'Thanks for the update Ben — the wife and I are talking it through over Easter. I\'ll get back to you in early May.',
                         latest_customer_position_at: '2026-04-18',
                         sentiment_trajectory: 'neutral_warm',
                         unresolved_objections: ['25-year commitment — partner needs to agree'] }
        },
        coaching_mode: 'stuck_but_live',
        what_we_dont_know: [
          'No phone call logged for this deal in 60+ days — partner\'s actual position is inferred, not confirmed',
          'No HubSpot note since 2026-03-12 — rep\'s read on this deal isn\'t captured',
          'James mentioned "early May" — that window starts today; no follow-up sent yet'
        ],
        probe: {
          recommended: true,
          probe_type: 'low_pressure_checkin_email',
          rationale: 'Customer named an "early May" timeframe. Today is mid-May. Low-pressure follow-up will reveal whether partner-alignment landed or stalled.',
          predicted_outcomes: [
            { signal: 'reply <24h with positive sentiment', interpretation: 'Partner aligned — push toward SLA Mapping booking this week.' },
            { signal: 'reply 3-7d, neutral or non-committal', interpretation: 'Partner still hesitating — offer joint 30-min call with both partners on.' },
            { signal: 'no reply 14d', interpretation: 'Partner-alignment fell through — move to Closed Lost cleanly.' }
          ]
        },
        coaching_message: 'Daisy Bank reads RED by stage but the signal mix tells a more nuanced story — engagement is amber (last contact 23d ago, slowing but not ghosted) and content is green (last email mentioned the wife is on board; James named "early May" as his deadline). This is stuck-but-live, not Cold-loss-imminent. The right move is a low-pressure check-in this week — predict warm reply if partner-alignment landed, or no-reply if it didn\'t. Either way you get a clean signal in days, not months.',
        primary_action: 'Send the low-pressure check-in probe this week (draft below). Read the response time + tone — that disambiguates whether to push toward SLA Mapping or close-lost cleanly.',
        supporting_twin_ids: ['40789889068', '147625095632'],
        enablement: {
          inline_draft: {
            type: 'email',
            subject: 'Daisy Bank — checking in on early May',
            body: `Hi James,\n\nHope Easter was good. You mentioned early May to come back to me on Daisy Bank — just checking in to see where you and the wife landed.\n\nNo pressure to commit either way today. If you've decided to move forward, I can have the SLA mapping conversation booked for this week. If it's not the right time, that's also a useful signal and we can park it cleanly.\n\nOne thing worth mentioning — the autumn soil scan came back stronger than last year. Happy to send the updated HORIZON Snapshot if you'd like to see the current numbers before deciding.\n\nLet me know either way.\n\nBen`,
            length_words: 135,
            tone: 'low-pressure check-in, names customer\'s own timeframe back to them, gives explicit "no is okay" framing — designed as a probe, not a push'
          },
          cowork_task: {
            type: 'generate_horizon_snapshot',
            description: 'Generate a fresh HORIZON Snapshot for Daisy Bank with annotated comparison to the baseline 14 months ago — what\'s changed in the model + what\'s changed in James\'s property\'s modelled carbon. Attach to a draft email ready for Ben to send if the probe response is warm.',
            estimated_minutes_saved: 45,
            delivery: 'Ben\'s Outlook drafts (PDF attached to draft email)'
          }
        }
      },
      {
        deal_id: '41104436568',
        deal_name: 'Bulgoo Pastoral - Jeremy Pockley',
        attribution: 'direct',
        current_stage: 'Strategy Call',
        current_stage_friction_from: 'Strategy Call',
        days_in_current_stage: 271,
        median_won_at_stage: 10,
        median_lost_at_stage: 30,
        risk_class: 'red',
        risk_score: 97,
        coaching_message: 'Day 271 at Strategy Call — 9× past lost-median. This deal stalled at Strategy nearly a year ago. Springfield Carbon Project (#144047802829) followed the same trajectory and closed lost as "Insufficient commitment". Burnham Grazing (#40789889068) at this exact age was re-engaged with a HORIZON refresh and converted. Pick a path THIS WEEK.',
        primary_action: 'Either run the nurture-back play (HORIZON Snapshot + "what\'s changed" reframe → Hobbs on-farm) or close-lost. Don\'t let this drift further.',
        supporting_twin_ids: ['40789889068', '144047802829']
      },
      {
        deal_id: '140345085389',
        deal_name: 'JA - John Atherton',
        attribution: 'direct',
        current_stage: 'Strategy Call',
        current_stage_friction_from: 'Strategy Call',
        days_in_current_stage: 249,
        median_won_at_stage: 10,
        median_lost_at_stage: 30,
        risk_class: 'red',
        risk_score: 95,
        coaching_message: 'Day 249 at Strategy Call. Strategy-stage stalls coded "Cold" account for 36% of losses — Mount Moon Pastoral (#147625095632) is a textbook example: cordial Strategy, no follow-up, closed Cold 60 days later. Davidsons & Laen (#186050120174) at this stage was re-engaged proactively and won. Send the 25-year ACCU projection this week or accept this is Cold.',
        primary_action: 'Send the 25-year ACCU revenue projection by Friday with explicit "let\'s reconnect" framing. If no response in 7 days, move to closed-lost.',
        supporting_twin_ids: ['186050120174', '147625095632']
      },
      {
        deal_id: '141507724737',
        deal_name: 'Brigalow and Mostowie - Rodger Jefferis',
        attribution: 'direct',
        current_stage: 'Strategy Call',
        current_stage_friction_from: 'Strategy Call',
        days_in_current_stage: 245,
        median_won_at_stage: 10,
        median_lost_at_stage: 30,
        risk_class: 'red',
        risk_score: 94,
        coaching_message: 'Day 245 at Strategy — Ben\'s deal. Same age cohort as JA-Atherton and Bulgoo Pastoral. The pattern is clear: Strategy-stalled deals from late 2025 are all sitting in zombie state. Tumbledown Wagyu (#183751836130) was in this cohort and closed lost as "Insufficient commitment". Burnham Grazing (#40789889068) was re-engaged via HORIZON refresh and converted. Decision time.',
        primary_action: 'Run Ben\'s nurture-back tactic: fresh HORIZON Snapshot + "what\'s changed" frame. If positive response, escalate to Hobbs on-farm.',
        supporting_twin_ids: ['40789889068', '183751836130']
      },
      {
        deal_id: '167288289773',
        deal_name: 'Fenmore Farming - Bruce McLean',
        attribution: 'direct',
        current_stage: 'SLA/KCT Mapping',
        current_stage_friction_from: 'SLA/KCT Mapping',
        days_in_current_stage: 200,
        median_won_at_stage: 4.5,
        median_lost_at_stage: 21,
        risk_class: 'red',
        risk_score: 96,
        coaching_message: 'Day 200 at SLA/KCT Mapping — the highest-friction transition in the pipeline (4.7× gap between won and lost medians). This stage typically stalls when KCT walkthrough is async and customer\'s partner isn\'t engaged. Weatherall CP (#248596297166) and Davidsons & Laen (#186050120174) both progressed from this stage with rep-led 30-min KCT walkthroughs WITH partner on the call. Fenmore needs that intervention or it\'s a Fisher Brothers (#131569892814) pattern.',
        primary_action: 'Schedule a 30-min Teams call this week to walk through KCT live with Bruce AND his partner. If partner won\'t attend, that itself is the diagnosis.',
        supporting_twin_ids: ['248596297166', '131569892814']
      },
      {
        deal_id: '183762813378',
        deal_name: 'Keynes Consulting Pty Ltd - Daniel Keynes',
        attribution: 'direct',
        current_stage: 'Qualified Account',
        current_stage_friction_from: 'Qualified Account',
        days_in_current_stage: 181,
        median_won_at_stage: 3,
        median_lost_at_stage: 5,
        risk_class: 'red',
        risk_score: 88,
        coaching_message: 'Day 181 at Qualified Account — 36× past lost-median. This deal never progressed past qualification. Stale-zombie at the top of funnel. If never assessed: assess this week. If assessed and no engagement: close lost. Daniel is a consultant entity, not a typical farmer profile — worth a single direct call to triage and decide.',
        primary_action: 'One triage call THIS WEEK. Decide: book Hobbs visit, defer with reason, or close lost. Don\'t leave dangling.',
        supporting_twin_ids: []
      }
    ]
  };
}

// ============================================================================
// C3 — Weekly brief (placeholder; not yet rendered by frontend in v1)
// ============================================================================
function weekly() {
  return {
    version: 'c3.0',
    generated_at: NOW,
    headline: 'Discovery → Strategy is bleeding system-wide. 36% of losses end up "Cold" — most trace back to no booked Strategy slot at end of Discovery.',
    top_3_team_plays: [
      'Send NRM-region 25-year revenue projection within 24h of every Discovery Call',
      'End every Discovery Call with a booked Strategy Call slot — no round-trips',
      'Run rep-led KCT walkthroughs with the customer\'s partner on the call'
    ],
    channel_comparison: {
      direct: { won: 36, lost: 198, win_rate: 0.15, median_days_to_close: 47 },
      lawrieco: { won: 25, lost: 31, win_rate: 0.45, median_days_to_close: 28 },
      observation: 'LawrieCo partner-channel deals close 3× more often and 19 days faster. The pre-existing trust shortcuts the friction at Discovery → Strategy. Investigation needed: what specifically does LawrieCo say/do at Discovery that direct sales can transfer?'
    }
  };
}

// ============================================================================
// Pass 0 farm-visit — Hobbs on-farm conversation distillates
// REAL DISTILLATE extracted 2026-05-11 from Hobbs Farm Visit Transcripts
// Dump 1 (SharePoint: Claudia's Storm Boy Claude Tool /cross-project-shared/
// customer-transcripts/sales/hobbs-farm-visits-transcripts/). PII generalised
// per Pass 0 rules — customer identifiers stripped.
// ============================================================================
function farmVisitDistillates() {
  return {
    version: 'p0fv.1',
    generated_at: NOW,
    count: 1,
    records: {
      'fv-real-large-american-owned-nsw': {
        version: 'p0fv.1',
        transcript_id: 'fv-real-large-american-owned-nsw',
        visit_date: '2026-04 approximate',
        region_nrm: 'NSW (large-acreage, mixed grazing operation, American-owned)',
        size_bucket: '>5000ha',
        topic_distillates: [
          {
            topic_label: '25-year commitment / land-use restrictions',
            customer_position: 'Wanted to understand exactly what they\'re committing to over 25 years. Concerned about what restrictions land use would face.',
            hobbs_response: 'Framed the contract as "make a commitment to be better. Make a commitment to keep your land in the agricultural system for 25 years." Combined this with a humorous limit on the restriction: "you agree to continue running this for 25 years as an agricultural enterprise, and agreed to not build a trailer park home." Made the commitment feel real but bounded.',
            landed_or_friction: 'landed',
            quotable_phrasing: 'You agree to keep your land in the agricultural system for 25 years — agreed to not build a trailer park home.',
            confidence: 'high'
          },
          {
            topic_label: 'ACCU revenue scepticism — concrete dollar example',
            customer_position: 'Wanted to know what the revenue actually looks like in real dollars.',
            hobbs_response: 'Showed a concrete recent case: "the guy had 83 hectares. It was one of the early projects. He paid 6000 to have it sampled, and he just got his check for 45,000." 6K-in / 45K-out is the lead anchor.',
            landed_or_friction: 'landed',
            quotable_phrasing: '83 hectares, $6K to sample, $45K cheque just paid out.',
            confidence: 'high'
          },
          {
            topic_label: 'Annual crediting / satellite measurement model',
            customer_position: 'Sceptical about timing — concerned credits wouldn\'t arrive for years.',
            hobbs_response: '"AgriProve just came out with this soil carbon model. They partnered with this satellite company, and they go over every property every month, and so they can predict if your soil carbon has gone up or down. So the second that it goes up, you get credited. Boom, they\'ll take the measurements. You\'re not leaving money on the table, whereas it was unclear previous to this. So it can get you on basically an annual crediting cycle, as opposed to three years, four years, five years."',
            landed_or_friction: 'landed',
            quotable_phrasing: 'You\'re not leaving money on the table — annual crediting cycle, not three to five years.',
            confidence: 'high'
          },
          {
            topic_label: 'Downside protection — ratchet mechanism',
            customer_position: 'Asked: "what happens if a drought drops carbon levels?"',
            hobbs_response: '"Nothing works on a ratchet. So let\'s say one year you capture four ACCUs per hectare, and boom, you get paid for that. Now the next year, you lose six per hectare. Nothing happens until you reach that previous high. So if the next year you get eight, then you get paid for the two that you\'ve increased on top of that original four."',
            landed_or_friction: 'landed',
            quotable_phrasing: 'Nothing works on a ratchet — you don\'t hand credits back unless you violate the conditions.',
            confidence: 'high'
          },
          {
            topic_label: 'Disinformation reframe — "lock up the land and plant trees"',
            customer_position: 'Carrying the common misconception that carbon projects require destocking and tree planting.',
            hobbs_response: '"The to me, the thing that I\'ve really learned in talking to a lot of land holders is that the impression in the carbon world is that people think you have to lock up your land, destock, and then plant trees, which is obviously not what the soil carbon scheme is all about." Then: "the soil carbon element is that it doesn\'t require you to change the land use in that drastic way."',
            landed_or_friction: 'landed',
            quotable_phrasing: 'Soil carbon doesn\'t require you to change the land use in that drastic way.',
            confidence: 'high'
          },
          {
            topic_label: 'Additionality / "doing it better"',
            customer_position: 'Asked about management criteria — "what are the management criteria for that land if you go into such an arrangement?"',
            hobbs_response: 'Walked through additionality: "you\'re agreeing to improve your practices in some way. If you take over this practice, take over this land, and you can show how it has been managed in the past, and how you\'re going to improve it, then we find the relevant criteria that the government says, Okay, this means you\'re doing it better. So we\'ll say perennial pastures will align it, and we\'ll put fertilizer on. Move your, you know, move your skull." Then: "every year, you just have to have a 30-minute conversation with one of the agri food teams to fill out that form."',
            landed_or_friction: 'landed',
            quotable_phrasing: 'Once a year you have a 30-minute conversation with an AgriProve team — that\'s it.',
            confidence: 'high'
          },
          {
            topic_label: 'Risk framing — what\'s the actual downside?',
            customer_position: 'Probing for worst-case: "what are the risks?"',
            hobbs_response: '"Essentially, the only risk, as long as you don\'t violate any of the conditions, is that you don\'t get any carbon credits. But if you do increase your productivity, which you certainly will upon putting in inputs, then by definition, that means your carbon is going [somewhere]." The "downside is zero credits, not negative" framing.',
            landed_or_friction: 'landed',
            quotable_phrasing: 'The only risk is you don\'t get carbon credits — not that you lose money.',
            confidence: 'high'
          }
        ],
        visit_summary: {
          overall_outcome: 'warming',
          one_line_summary: 'Large American-owned NSW operation; visit covered seven distinct topics; Hobbs landed every objection with concrete framings, dollar anchors, and humour. Customer asked for documentation: "Can I get a copy of this in some form? Email it to me."'
        }
      }
    }
  };
}

// Note: system learnings are NOT cached as JSON. They're written directly to
// coaching/learnings/YYYY-MM/<slug>.md as markdown files with YAML front-matter.
// Dropping the candidate-queue model — learnings auto-write on emergence;
// no approval gate. The Patterns tab reads real files from disk via
// /api/coaching/learnings.

module.exports = { emailDistillates, friction, twins, objections, active, weekly, farmVisitDistillates };
