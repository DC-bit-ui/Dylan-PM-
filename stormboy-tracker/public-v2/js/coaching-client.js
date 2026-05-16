/* ======================================================================
   Coaching client — fetches precomputed insights from the server cache.
   The server reads coaching/cache/*.json (written by scheduled jobs) and
   exposes via /api/coaching/*. The frontend never calls Claude directly.
   In-memory cache prevents redundant fetches when switching tabs.
   ====================================================================== */

const coachCache = { friction: null, twins: null, objections: null, active: null, weekly: null, farm_visits: null, learnings: null };
let coachLoadedAt = null;
let coachLoadPromise = null;

async function loadCoachingCache(force = false) {
  if (coachLoadPromise && !force) return coachLoadPromise;
  if (coachLoadedAt && !force && (Date.now() - coachLoadedAt) < 60_000) return coachCache;

  coachLoadPromise = (async () => {
    const endpoints = [
      ['friction',            '/api/coaching/friction'],
      ['twins',               '/api/coaching/twins'],
      ['objections',          '/api/coaching/objections'],
      ['active',              '/api/coaching/active'],
      ['weekly',              '/api/coaching/weekly'],
      ['farm_visits',         '/api/coaching/farm-visits'],
      ['learnings',           '/api/coaching/learnings']
    ];
    await Promise.all(endpoints.map(async ([key, url]) => {
      try {
        const r = await fetch(url);
        if (r.ok) coachCache[key] = await r.json();
        else coachCache[key] = null;
      } catch (e) {
        coachCache[key] = null;
      }
    }));
    coachLoadedAt = Date.now();
    return coachCache;
  })();
  const result = await coachLoadPromise;
  coachLoadPromise = null;
  return result;
}

async function refreshCoachingCache() {
  try {
    const r = await fetch('/api/coaching/refresh', { method: 'POST' });
    if (!r.ok) throw new Error('Refresh failed: ' + r.status);
    return await loadCoachingCache(true);
  } catch (e) {
    console.warn('Coaching refresh failed:', e);
    return coachCache;
  }
}

function coachStaleLabel() {
  if (!coachLoadedAt) return '';
  const ageMins = Math.round((Date.now() - coachLoadedAt) / 60_000);
  if (ageMins < 1) return 'Just now';
  if (ageMins < 60) return ageMins + ' min ago';
  return Math.round(ageMins / 60) + 'h ago';
}

// ----- Compose composite views from raw caches -----

/**
 * Compose a per-deal coaching package from the active.json + twins.json + friction caches.
 * Returns { riskClass, riskScore, message, primaryAction, twins, friction } or null.
 */
function composeDealCoaching(dealId) {
  if (!coachCache.active || !coachCache.active.deals) return null;
  const active = coachCache.active.deals.find(d => d.deal_id === dealId);
  if (!active) return null;

  const twins = coachCache.twins && coachCache.twins.deals
    ? (coachCache.twins.deals.find(d => d.active_deal && d.active_deal.id === dealId) || null)
    : null;

  const friction = coachCache.friction && coachCache.friction.stage_transitions
    ? coachCache.friction.stage_transitions.find(t => t.from === active.current_stage_friction_from)
    : null;

  return {
    dealId: active.deal_id,
    dealName: active.deal_name,
    region: active.region,
    sizeBucket: active.size_bucket,
    currentStage: active.current_stage,
    daysInStage: active.days_in_current_stage,
    riskClass: active.risk_class,
    riskScore: active.risk_score,
    message: active.coaching_message,
    primaryAction: active.primary_action,
    benchWon: active.median_won_at_stage,
    benchLost: active.median_lost_at_stage,
    twins: twins ? twins.twins : [],
    friction: friction
  };
}

/**
 * Compute the Top-3 Plays panel for a rep — heuristic synthesis from friction
 * + active deals + objection clusters. Falls back to friction-only if active
 * cache thin.
 */
function composeTopPlays(activeDealsForRep) {
  if (!coachCache.friction || !coachCache.friction.stage_transitions) return [];

  // Score each friction transition by (a) high confidence, (b) play priority,
  // (c) how many of this rep's active deals sit at the "from" stage.
  const transitions = coachCache.friction.stage_transitions
    .filter(t => t.confidence === 'high' || t.confidence === 'moderate')
    .map(t => {
      const repDealsAtStage = activeDealsForRep.filter(d => d.currentStageName === t.from).length;
      const priorityScore = { high: 3, medium: 2, low: 1 }[t.play_priority] || 1;
      const confScore = t.confidence === 'high' ? 2 : 1;
      return { ...t, score: priorityScore * confScore + repDealsAtStage * 0.5, repDealsAtStage };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return transitions.map(t => ({
    play: t.play,
    meta: t.repDealsAtStage > 0
      ? t.repDealsAtStage + ' of your active deals stuck waiting on this'
      : 'System-wide friction at ' + t.from + ' → ' + t.to
  }));
}

/**
 * Compute a "what changed since last visit" diff for the Plays surface.
 * Uses the previous active.json snapshot stored as active.previous in cache.
 */
function composeDiff() {
  const cur = coachCache.active && coachCache.active.deals;
  const prev = coachCache.active && coachCache.active.previous_deals;
  if (!cur || !prev) return null;

  const prevById = Object.fromEntries(prev.map(d => [d.deal_id, d]));
  const changes = { riskMoves: [], actionChanges: [], newDeals: [], closed: [] };

  cur.forEach(d => {
    const p = prevById[d.deal_id];
    if (!p) { changes.newDeals.push(d); return; }
    if (p.risk_class !== d.risk_class) changes.riskMoves.push({ deal: d, from: p.risk_class, to: d.risk_class });
    if (p.primary_action !== d.primary_action) changes.actionChanges.push(d);
  });
  const curIds = new Set(cur.map(d => d.deal_id));
  prev.forEach(p => { if (!curIds.has(p.deal_id)) changes.closed.push(p); });

  const empty = !changes.riskMoves.length && !changes.actionChanges.length && !changes.newDeals.length && !changes.closed.length;
  return empty ? { empty: true } : changes;
}

/**
 * Overview widget — surfaces the highest-risk active deal as a callout above
 * the existing Overview content. No-op if cache empty or no risk above green.
 */
function mountAttentionWidget(el) {
  loadCoachingCache().then(() => {
    if (!coachCache.active || !coachCache.active.deals || !coachCache.active.deals.length) return;
    const classOrder = { red: 0, amber: 1, green: 2 };
    const top = [...coachCache.active.deals].sort((a, b) => {
      const ca = classOrder[a.risk_class] ?? 3, cb = classOrder[b.risk_class] ?? 3;
      if (ca !== cb) return ca - cb;
      return (b.risk_score || 0) - (a.risk_score || 0);
    })[0];
    if (!top || top.risk_class === 'green') return;

    const widget = document.createElement('div');
    widget.className = 'attention-widget';
    widget.innerHTML = `
      <div class="aw-icon">${top.risk_class === 'red' ? '⚠' : '⚡'}</div>
      <div class="aw-body">
        <div class="aw-label">Needs attention — highest-risk active deal</div>
        <div class="aw-deal"><strong>${escForHtml(top.deal_name)}</strong> · ${escForHtml(top.region || '')} · ${escForHtml(top.current_stage)} · ${top.days_in_current_stage}d</div>
        <div class="aw-action">${escForHtml(top.primary_action || '')}</div>
      </div>
      <div class="aw-meta">
        <div class="aw-risk aw-risk-${top.risk_class}">${(top.risk_class || '').toUpperCase()} ${top.risk_score || ''}</div>
        <button class="aw-go" onclick="goToPlays()">Open Plays →</button>
      </div>`;
    el.insertBefore(widget, el.firstChild);
  }).catch(() => { /* silent — widget is supplementary */ });
}

function goToPlays() {
  tab = 'plays';
  try { localStorage.setItem('stormboy_tab', 'plays'); } catch (_) {}
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.t === 'plays'));
  render();
}

function escForHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/**
 * Section TOC nav — sticky chip row at the top of a tab. Each chip is an
 * anchor link to a section ID. Smooth-scroll on click.
 */
function sectionNavHtml(items, tabKey) {
  if (!items || items.length < 2) return '';
  return `
    <div class="section-nav" role="navigation" aria-label="${escForHtml(tabKey)} sections">
      ${items.map(i => `<a href="#section-${escForHtml(i.id)}" class="section-nav-chip" onclick="scrollToSection(event, '${escForHtml(i.id)}')">${escForHtml(i.label)}</a>`).join('')}
    </div>`;
}

function scrollToSection(e, id) {
  e.preventDefault();
  const target = document.getElementById('section-' + id);
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * "What's working on-farm" — distilled Hobbs framings from real visits.
 * Used as the lead section on Plays (rep-facing) and as a sub-section
 * on Patterns (leadership-facing). Variant controls framing language.
 */
function onFarmInsightsHtml(fv, variant) {
  if (!fv || !fv.records) return '';
  const ids = Object.keys(fv.records);
  if (!ids.length) return '';

  const wins = {};
  ids.forEach(id => {
    const v = fv.records[id];
    (v.topic_distillates || []).filter(t => t.landed_or_friction === 'landed').forEach(t => {
      if (!wins[t.topic_label]) wins[t.topic_label] = { count: 0, samples: [] };
      wins[t.topic_label].count++;
      if (t.quotable_phrasing) wins[t.topic_label].samples.push({ phrase: t.quotable_phrasing, region: v.region_nrm });
    });
  });
  const sorted = Object.entries(wins).sort((a, b) => b[1].count - a[1].count).slice(0, 8);
  if (!sorted.length) return '';

  const isLead = variant === 'plays-lead';
  const titleText = isLead ? "What's working on-farm — Hobbs's framings to use today" : "What's working on-farm — Hobbs visit insights";
  const introText = isLead
    ? `Distilled from ${ids.length} real Hobbs visit transcript${ids.length === 1 ? '' : 's'}. These specific framings have landed in conversation. Use the verbatim phrasing — the exact words are doing the work.`
    : `Distilled from ${ids.length} recent farm-visit transcript${ids.length === 1 ? '' : 's'} via Pass 0 farm-visit distillation. Sourced from Claudia's Storm Boy Claude Tool.`;
  const sectionClass = isLead ? 'patterns-section onfarm-lead' : 'patterns-section';

  return `
    <div class="${sectionClass}">
      <h2>${escForHtml(titleText)}</h2>
      <div class="pl-intro" style="margin-bottom:14px">${escForHtml(introText)}</div>
      ${sorted.map(([label, data]) => `
        <div class="fv-row">
          <div class="fv-head">
            <span class="fv-label">${escForHtml(label)}</span>
            <span class="fv-count">${data.count} landed${data.count === 1 ? '' : 's'}</span>
          </div>
          ${data.samples.length ? `<div class="fv-quotes">${data.samples.slice(0, 2).map(s => `<div class="fv-quote">"${escForHtml(s.phrase)}" <span class="fv-region">— ${escForHtml(s.region || '')}</span></div>`).join('')}</div>` : ''}
        </div>
      `).join('')}
    </div>`;
}
