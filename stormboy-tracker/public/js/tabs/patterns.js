/* ======================================================================
   PATTERNS tab — Will / leadership view.
   Reads friction.json + objections.json caches. Lower-density, hierarchical.
   ====================================================================== */

function rPatterns(el, all, cw, lost) {
  el.innerHTML = '<div class="ld"><div class="sp"></div><span>Loading patterns...</span></div>';

  loadCoachingCache().then(() => {
    const f = coachCache.friction;
    const o = coachCache.objections;

    if (!f && !o) {
      el.innerHTML = `
        <div class="coach-empty">
          <strong>Patterns cache not available yet.</strong>
          The server hasn't run the friction or objection-library jobs yet.
          <div style="margin-top:14px"><button class="coach-refresh" onclick="onPatternsRefresh()">↻ Trigger refresh now</button></div>
        </div>`;
      return;
    }

    const tocItems = [];
    if (f && f.top_systemic_friction) tocItems.push({ id: 'headline', label: "This week's headline" });
    if (coachCache.weekly && coachCache.weekly.channel_comparison) tocItems.push({ id: 'channel', label: 'Channel comparison' });
    if (coachCache.learnings && coachCache.learnings.learnings && coachCache.learnings.learnings.length) tocItems.push({ id: 'learnings', label: 'Recent learnings' });
    if (f && f.stage_transitions && f.stage_transitions.length) tocItems.push({ id: 'friction', label: 'Stage friction map' });
    if (coachCache.farm_visits && coachCache.farm_visits.records) tocItems.push({ id: 'on-farm', label: 'On-farm insights' });
    if (o && o.stage_index && o.stage_index.length) tocItems.push({ id: 'objections', label: 'Objection library' });

    el.innerHTML = `
      ${sectionNavHtml(tocItems, 'Patterns')}
      <div id="section-headline">${headlineHtml(f)}</div>
      <div id="section-channel">${channelComparisonHtml(coachCache.weekly)}</div>
      <div id="section-learnings">${recentLearningsHtml(coachCache.learnings)}</div>
      <div id="section-friction">${frictionMapHtml(f)}</div>
      <div id="section-on-farm">${onFarmInsightsHtml(coachCache.farm_visits, 'patterns')}</div>
      <div id="section-objections">${objectionLibraryHtml(o)}</div>
    `;
  }).catch(err => {
    console.error('Patterns load failed:', err);
    el.innerHTML = '<div class="coach-empty"><strong>Failed to load patterns cache.</strong></div>';
  });
}

function headlineHtml(f) {
  if (!f || !f.top_systemic_friction) return '';
  // Determine tag class from rough heuristic on friction text or use moderate.
  const tagClass = (f.top_systemic_friction || '').toLowerCase().includes('bleeding') ? 'high' : 'moderate';
  return `
    <div class="patterns-headline">
      <div class="ph-tag ${tagClass}">This week's headline</div>
      <h2>${escapeHtml(f.top_systemic_friction)}</h2>
      ${f.era_lift_observation ? `<div class="ph-era"><strong>Era lift:</strong> ${escapeHtml(f.era_lift_observation)}</div>` : ''}
    </div>`;
}

function recentLearningsHtml(lr) {
  if (!lr || !lr.learnings || !lr.learnings.length) return '';
  const recent = lr.learnings.filter(l => !l.superseded_by).slice(0, 8);
  if (!recent.length) return '';
  return `
    <div class="patterns-section pending-learnings">
      <h2>Recent system learnings (auto-written)</h2>
      <div class="pl-intro">The coaching pipeline writes high-confidence patterns directly to <code>coaching/learnings/YYYY-MM/</code> as soon as it identifies them. Append-only; revisions use <code>supersedes</code> front-matter, never delete. Click any learning to read the full file.</div>
      ${recent.map(l => `
        <div class="pl-card pl-cat-${escapeHtml(l.category || '')}" data-slug="${escapeHtml(l.slug)}">
          <div class="pl-head">
            <span class="pl-cat">${escapeHtml((l.category || '').replace(/_/g,' '))}</span>
            <span class="pl-conf pl-conf-${escapeHtml(l.confidence || 'low')}">${escapeHtml(l.confidence || '')}</span>
            <span class="pl-when">${escapeHtml(formatLearningDate(l.written_at))}</span>
          </div>
          <div class="pl-title">${escapeHtml(l.title)}</div>
          <div class="pl-meta">
            <div><strong>Sources:</strong> ${(l.sources || []).slice(0, 3).map(s => `<code>${escapeHtml(s)}</code>`).join(' · ')}${(l.sources || []).length > 3 ? ` <span class="pl-ev">+${(l.sources || []).length - 3} more</span>` : ''}</div>
            ${l.applicability && l.applicability.length ? `<div><strong>Applies when:</strong> ${l.applicability.slice(0,2).map(a => escapeHtml(a)).join(' · ')}</div>` : ''}
          </div>
          <div class="pl-actions">
            <a class="pl-open" href="/api/coaching/learnings/${escapeHtml(l.month)}/${escapeHtml(l.slug)}" target="_blank">Read full →</a>
            <span class="pl-path"><code>${escapeHtml(l.path)}</code></span>
          </div>
        </div>
      `).join('')}
    </div>`;
}

function formatLearningDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const days = Math.round((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return days + ' days ago';
  return d.toISOString().slice(0, 10);
}

function channelComparisonHtml(weekly) {
  const cc = weekly && weekly.channel_comparison;
  if (!cc || !cc.direct || !cc.lawrieco) return '';
  const d = cc.direct, l = cc.lawrieco;
  const winRateDelta = ((l.win_rate - d.win_rate) * 100).toFixed(0);
  const speedDelta = (d.median_days_to_close - l.median_days_to_close);
  return `
    <div class="patterns-section channel-cmp">
      <h2>Channel comparison — LawrieCo vs Direct</h2>
      <div class="cc-grid">
        <div class="cc-col">
          <div class="cc-label">Direct sales</div>
          <div class="cc-stat"><span class="cc-num">${d.won}</span><span class="cc-suf">won</span></div>
          <div class="cc-stat"><span class="cc-num">${(d.win_rate * 100).toFixed(0)}%</span><span class="cc-suf">win rate</span></div>
          <div class="cc-stat"><span class="cc-num">${d.median_days_to_close}d</span><span class="cc-suf">median to close</span></div>
        </div>
        <div class="cc-col cc-lawrie">
          <div class="cc-label">LawrieCo partner</div>
          <div class="cc-stat"><span class="cc-num">${l.won}</span><span class="cc-suf">won</span></div>
          <div class="cc-stat"><span class="cc-num">${(l.win_rate * 100).toFixed(0)}%</span><span class="cc-suf">win rate <span class="cc-delta">+${winRateDelta}pp</span></span></div>
          <div class="cc-stat"><span class="cc-num">${l.median_days_to_close}d</span><span class="cc-suf">median to close <span class="cc-delta">−${speedDelta}d</span></span></div>
        </div>
      </div>
      ${cc.observation ? `<div class="cc-observation">${escapeHtml(cc.observation)}</div>` : ''}
    </div>`;
}

function frictionMapHtml(f) {
  if (!f || !f.stage_transitions || !f.stage_transitions.length) return '';
  return `
    <div class="patterns-section">
      <h2>Stage friction map</h2>
      ${f.stage_transitions.map(t => {
        const wonLabel = (t.median_days_won && t.median_days_won > 0) ? `won ${t.median_days_won}d` : 'won — no data';
        const lostLabel = (t.median_days_lost && t.median_days_lost > 0) ? `lost ${t.median_days_lost}d` : 'lost — no data';
        return `
        <div class="friction-row">
          <div class="friction-head">
            <span class="friction-arrow">${escapeHtml(t.from)} → ${escapeHtml(t.to)}</span>
            <span class="friction-bench">
              <span class="won">${wonLabel}</span> /
              <span class="lost">${lostLabel}</span>
            </span>
            <span class="friction-conf ${t.confidence}">${t.confidence}</span>
            ${t.play_priority === 'high' ? '<span class="friction-star">★</span>' : ''}
          </div>
          <div class="friction-pattern">${escapeHtml(t.friction_pattern)}</div>
          ${t.play ? `<div class="friction-play">${escapeHtml(t.play)}</div>` : ''}
        </div>
      `;}).join('')}
    </div>`;
}

function objectionLibraryHtml(o) {
  if (!o || !o.stage_index || !o.stage_index.length) return '';
  return `
    <div class="patterns-section">
      <h2>Counter-objection library</h2>
      ${o.stage_index.map((stg, i) => `
        <div class="obj-stage" data-stage-idx="${i}">
          <div class="obj-stage-head" onclick="toggleObjStage(this)">
            <span class="obj-stage-name">${escapeHtml(stg.stage)}</span>
            <span class="obj-stage-meta">${stg.loss_count_in_window} losses, ${stg.objection_clusters?.length || 0} clusters</span>
            <span class="obj-stage-chev">▶</span>
          </div>
          <div class="obj-stage-body">
            ${stg.note ? `<div style="font-size:13px;color:var(--muted);font-style:italic">${escapeHtml(stg.note)}</div>` : ''}
            ${(stg.objection_clusters || []).map(c => `
              <div class="obj-cluster">
                <div class="obj-cluster-head">
                  <span class="obj-cluster-name">${escapeHtml(c.cluster_name)}</span>
                  <span class="obj-cluster-freq">${c.frequency} losses · ${c.confidence} conf</span>
                </div>
                ${c.typical_form ? `<div class="obj-typical">${escapeHtml(c.typical_form)}</div>` : ''}
                ${c.what_won ? `<div class="obj-framing">${escapeHtml(c.what_won)}</div>` : ''}
                ${c.tactical_framing ? `<button class="obj-copy" onclick="copyFraming(this, '${escapeForAttr(c.tactical_framing)}')">Copy battle card text</button>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>`;
}

function toggleObjStage(headEl) {
  headEl.parentElement.classList.toggle('open');
}

function copyFraming(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✓ Copied';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1800);
  });
}

function onPatternsRefresh() {
  refreshCoachingCache().then(() => render());
}

function escapeForAttr(s) {
  return String(s).replace(/['"\\]/g, c => '\\' + c).replace(/\n/g, ' ');
}
