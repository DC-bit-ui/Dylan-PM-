/* ======================================================================
   PLAYS tab — rep-facing landing surface.
   Reads composed coaching data from coaching-client.js. The deals passed in
   from render() are HubSpot-shaped; we cross-reference them with the active
   coaching cache to produce per-deal cards.
   ====================================================================== */

function rPlays(el, all, act) {
  el.innerHTML = '<div class="ld"><div class="sp"></div><span>Loading coaching insights...</span></div>';

  loadCoachingCache().then(() => {
    const hasCoaching = coachCache.active || coachCache.friction;
    if (!hasCoaching) {
      el.innerHTML = playsEmptyState();
      bindPlaysControls(el);
      return;
    }

    // Build per-deal view. Two paths:
    // 1. Live mode: HubSpot `act` is populated → join HubSpot active deals with
    //    the coaching cache by ID. HubSpot supplies the URL + stage; the cache
    //    supplies the coaching message.
    // 2. Cache-only mode (pre-token / HubSpot fetch failed): render every deal
    //    from `coachCache.active.deals` directly so the dashboard is never blank.
    let dealsForRep;
    if (act && act.length) {
      dealsForRep = act.map(d => {
        const coach = composeDealCoaching(d.id);
        return {
          id: d.id, name: d.name, url: d.url,
          currentStageName: SM[d.stage] ? SM[d.stage].n : d.stage,
          daysInPipeline: d.days,
          coach: coach
        };
      }).filter(d => d.coach);
    } else if (coachCache.active && coachCache.active.deals) {
      dealsForRep = coachCache.active.deals.map(c => ({
        id: c.deal_id,
        name: c.deal_name,
        url: '#',
        currentStageName: c.current_stage,
        daysInPipeline: c.days_in_current_stage,
        coach: {
          dealId: c.deal_id,
          dealName: c.deal_name,
          region: c.region,
          sizeBucket: c.size_bucket,
          currentStage: c.current_stage,
          daysInStage: c.days_in_current_stage,
          riskClass: c.risk_class,
          riskScore: c.risk_score,
          message: c.coaching_message,
          primaryAction: c.primary_action,
          benchWon: c.median_won_at_stage,
          benchLost: c.median_lost_at_stage,
          twins: [], // optional — could resolve from coachCache.twins by ID
          friction: null
        }
      }));
    } else {
      dealsForRep = [];
    }

    // Sort: red > amber > green; within class, descending risk score.
    const classOrder = { red: 0, amber: 1, green: 2 };
    dealsForRep.sort((a, b) => {
      const ca = classOrder[a.coach.riskClass] ?? 3;
      const cb = classOrder[b.coach.riskClass] ?? 3;
      if (ca !== cb) return ca - cb;
      return (b.coach.riskScore || 0) - (a.coach.riskScore || 0);
    });

    const topPlays = composeTopPlays(dealsForRep);
    const diff = composeDiff();

    const hasOnFarm = coachCache.farm_visits && coachCache.farm_visits.records && Object.keys(coachCache.farm_visits.records).length > 0;
    const hasDiff = diff && !diff.empty;
    const hasTopPlays = topPlays && topPlays.length > 0;

    // Section TOC: only show anchors that actually have content
    const tocItems = [];
    if (hasOnFarm) tocItems.push({ id: 'on-farm', label: "What's working on-farm" });
    if (hasDiff) tocItems.push({ id: 'diff', label: 'What changed' });
    if (hasTopPlays) tocItems.push({ id: 'top-plays', label: 'Top 3 plays' });
    tocItems.push({ id: 'deals', label: `Your deals (${dealsForRep.length})` });

    el.innerHTML = `
      ${sectionNavHtml(tocItems, 'Plays')}
      ${hasOnFarm ? `<div id="section-on-farm">${onFarmInsightsHtml(coachCache.farm_visits, 'plays-lead')}</div>` : ''}
      ${hasDiff ? `<div id="section-diff">${diffBannerHtml(diff)}</div>` : ''}
      ${hasTopPlays ? `<div id="section-top-plays">${topPlaysHtml(topPlays)}</div>` : ''}
      <div id="section-deals" class="cd">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:6px;flex-wrap:wrap">
          <h2 style="margin:0">Engaged pipeline follow-ups (${dealsForRep.length})</h2>
          <span class="coach-stale">Last refresh: ${coachStaleLabel()}</span>
          <button class="coach-refresh" onclick="onPlaysRefresh()">↻ Refresh</button>
        </div>
        <div class="motion-note">
          Post-funnel deals already in the sales pipeline. <strong>Not the Storm Boy cold-outreach queue</strong> — for Storm Boy calls, work from Claudia's tool. These are re-engagement plays grounded in team learnings + Hobbs's framings.
        </div>
        ${dealsForRep.length === 0
          ? '<div class="coach-empty"><strong>No active deals with coaching yet.</strong>Cache may still be warming up. Try refresh.</div>'
          : dealsForRep.map((d, i) => dealCardHtml(d, i === 0)).join('')}
      </div>
    `;

    bindPlaysControls(el);
  }).catch(err => {
    console.error('Plays load failed:', err);
    el.innerHTML = playsEmptyState('Failed to load coaching cache.');
  });
}

function playsEmptyState(msg) {
  return `
    <div class="coach-empty">
      <strong>${msg || 'Coaching cache not available yet.'}</strong>
      The server hasn't generated insights yet. This typically happens overnight.
      <div style="margin-top:14px"><button class="coach-refresh" onclick="onPlaysRefresh()">↻ Trigger refresh now</button></div>
    </div>`;
}

function diffBannerHtml(diff) {
  if (!diff || diff.empty) return '';
  const items = [];
  diff.riskMoves.forEach(m => {
    items.push(`<li><strong>${escapeHtml(m.deal.deal_name)}</strong> moved <span style="color:var(--muted)">${m.from.toUpperCase()}</span> → <strong>${m.to.toUpperCase()}</strong></li>`);
  });
  diff.actionChanges.forEach(d => items.push(`<li><strong>${escapeHtml(d.deal_name)}</strong> — primary action changed</li>`));
  diff.newDeals.forEach(d => items.push(`<li>New deal: <strong>${escapeHtml(d.deal_name)}</strong></li>`));
  diff.closed.forEach(d => items.push(`<li><strong>${escapeHtml(d.deal_name)}</strong> closed since last visit</li>`));
  if (!items.length) return '';
  return `<div class="diff-banner"><strong>What changed since last visit</strong><ul>${items.join('')}</ul></div>`;
}

function topPlaysHtml(plays) {
  if (!plays || !plays.length) return '';
  return `
    <div class="plays-top">
      <h2>Top 3 Plays this week</h2>
      <ol>
        ${plays.map(p => `<li>${escapeHtml(p.play)}<span class="play-meta">↳ ${escapeHtml(p.meta)}</span></li>`).join('')}
      </ol>
    </div>`;
}

function dealCardHtml(d, openByDefault) {
  const c = d.coach;
  const cls = c.riskClass || 'amber';
  return `
    <div class="dc-card risk-${cls}${openByDefault ? ' open' : ''}" data-deal-id="${d.id}">
      <div class="dc-head" onclick="toggleDealCard(this)">
        <div class="dc-risk-dot ${cls}"></div>
        <div class="dc-name">${escapeHtml(d.name)}${c.region ? ` · ${escapeHtml(c.region)}` : ''}${c.sizeBucket ? ` · ${escapeHtml(c.sizeBucket)}` : ''}</div>
        <div class="dc-meta">
          <span>Risk <span class="dc-risk-score">${c.riskScore || '—'}/100</span></span>
          <span class="dc-chev">▶</span>
        </div>
      </div>
      <div class="dc-stage">
        <strong>${escapeHtml(c.currentStage)}</strong>
        · ${c.daysInStage}d in stage
        <span class="dc-bench">
          <span class="won">won med ${c.benchWon || '?'}d</span>
          <span class="lost">lost med ${c.benchLost || '?'}d</span>
        </span>
      </div>
      <div class="dc-body">
        ${signalMixHtml(c)}
        ${latestFromCustomerHtml(c)}
        ${c.message ? `<div class="dc-message">${escapeHtml(c.message)}</div>` : ''}
        ${c.primaryAction ? `<div class="dc-row"><div class="dc-label">Do this week</div><div class="dc-value"><strong>${escapeHtml(c.primaryAction)}</strong></div></div>` : ''}
        ${enablementHtml(c)}
        ${probeHtml(c)}
        ${whatWeDontKnowHtml(c)}
        ${c.twins && c.twins.length ? `<div class="dc-row"><div class="dc-label">Twins</div><div class="dc-value"><div class="dc-twins">${c.twins.map(t => `<span class="dc-twin ${t.outcome}">${escapeHtml(t.deal_name)} <strong>[${t.outcome.toUpperCase()}]</strong></span>`).join('')}</div></div></div>` : ''}
        ${c.friction && c.friction.friction_pattern ? `<div class="dc-row"><div class="dc-label">Friction here</div><div class="dc-value">${escapeHtml(c.friction.friction_pattern)}</div></div>` : ''}
        <div class="dc-actions">
          <a href="${d.url}" target="_blank">Open in HubSpot →</a>
        </div>
      </div>
    </div>`;
}

// === Multi-signal rendering ===
function getRawCoaching(dealId) {
  return (coachCache.active && coachCache.active.deals || []).find(d => d.deal_id === dealId);
}

function signalMixHtml(c) {
  const raw = getRawCoaching(c.dealId);
  const signals = raw && raw.signals;
  if (!signals) return '';
  const tiers = [
    { key: 'stage',      label: 'Stage' },
    { key: 'behavioral', label: 'Engagement' },
    { key: 'content',    label: 'Content' }
  ];
  return `
    <div class="signal-mix">
      <div class="signal-mix-head">
        <span class="signal-mix-label">Signal mix</span>
        ${raw.coaching_mode ? `<span class="signal-mix-mode">${escapeHtml(raw.coaching_mode.replace(/_/g, ' '))}</span>` : ''}
      </div>
      <div class="signal-bars">
        ${tiers.map(t => {
          const s = signals[t.key];
          if (!s) return '';
          return `
            <div class="signal-tier" title="${escapeHtml(s.note || '')}">
              <div class="signal-tier-label">${escapeHtml(t.label)}</div>
              <div class="signal-tier-bar signal-${escapeHtml(s.health)}"></div>
              <div class="signal-tier-value">${escapeHtml(s.value)}</div>
              <div class="signal-tier-conf">conf: ${escapeHtml(s.confidence)}</div>
            </div>`;
        }).join('')}
      </div>
    </div>`;
}

function latestFromCustomerHtml(c) {
  const raw = getRawCoaching(c.dealId);
  const pos = raw && raw.signals && raw.signals.content && raw.signals.content.latest_customer_position;
  if (!pos) return '';
  const when = raw.signals.content.latest_customer_position_at;
  const ageDays = when ? Math.round((Date.now() - new Date(when).getTime()) / 86400000) : null;
  return `
    <div class="latest-from-customer">
      <div class="lfc-label">Latest from customer ${ageDays != null ? `<span class="lfc-age">${ageDays}d ago</span>` : ''}</div>
      <blockquote class="lfc-quote">${escapeHtml(pos)}</blockquote>
    </div>`;
}

function probeHtml(c) {
  const raw = getRawCoaching(c.dealId);
  const p = raw && raw.probe;
  if (!p || !p.recommended) return '';
  return `
    <div class="probe-section">
      <div class="probe-header">
        <span class="probe-tag">🔍 Probe to disambiguate</span>
        <span class="probe-rationale">${escapeHtml(p.rationale)}</span>
      </div>
      <div class="probe-outcomes">
        <div class="probe-outcomes-label">Predicted outcomes (read the response to know what's actually happening)</div>
        <ul class="probe-outcomes-list">
          ${(p.predicted_outcomes || []).map(o => `
            <li>
              <strong>${escapeHtml(o.signal)}</strong>
              <span class="probe-arrow">→</span>
              ${escapeHtml(o.interpretation)}
            </li>
          `).join('')}
        </ul>
      </div>
    </div>`;
}

function whatWeDontKnowHtml(c) {
  const raw = getRawCoaching(c.dealId);
  const gaps = raw && raw.what_we_dont_know;
  if (!gaps || !gaps.length) return '';
  return `
    <details class="what-dont-know">
      <summary>What we don't know (${gaps.length} gaps in signal)</summary>
      <ul>
        ${gaps.map(g => `<li>${escapeHtml(g)}</li>`).join('')}
      </ul>
    </details>`;
}

function toggleDealCard(headEl) {
  headEl.parentElement.classList.toggle('open');
}

/**
 * Enablement renderer — turns "do this thing" into "here's the thing, ready to use".
 * Renders inline draft (Pattern A) + optional delegate-to-cowork button (Pattern B).
 * Hidden if the coaching cache entry has no `enablement` field.
 */
function enablementHtml(coach) {
  const raw = (coachCache.active && coachCache.active.deals || []).find(d => d.deal_id === coach.dealId);
  const e = raw && raw.enablement;
  if (!e) return '';

  const draft = e.inline_draft;
  const cwTask = e.cowork_task;
  if (!draft && !cwTask) return '';

  const draftId = 'draft-' + coach.dealId;
  return `
    <div class="enablement">
      <div class="enablement-header">
        <span class="enablement-tag">⚡ Enablement</span>
        <span class="enablement-note">Ready-to-use artifacts — review, don't re-do</span>
      </div>
      ${draft ? `
        <div class="enable-block">
          <div class="enable-block-head" onclick="toggleEnable('${escapeHtml(draftId)}')">
            <span class="enable-block-icon">📄</span>
            <span class="enable-block-label">
              ${draft.type === 'email' ? 'Draft email' : draft.type === 'message' ? 'Draft message' : 'Draft ' + escapeHtml(draft.type)}
              ${draft.length_words ? `<span class="enable-block-meta">${draft.length_words} words · ${escapeHtml(draft.tone || '')}</span>` : ''}
            </span>
            <span class="enable-block-chev">▶</span>
          </div>
          <div id="${escapeHtml(draftId)}" class="enable-block-body">
            ${draft.subject ? `<div class="enable-draft-subject"><strong>Subject:</strong> ${escapeHtml(draft.subject)}</div>` : ''}
            <pre class="enable-draft-body">${escapeHtml(draft.body)}</pre>
            <div class="enable-actions">
              <button class="enable-btn enable-btn-primary" onclick="copyDraft('${escapeHtml(draftId)}', this)">📋 Copy</button>
              <button class="enable-btn" onclick="alert('Future: open in Outlook drafts via Microsoft Graph')">📧 Open in Outlook drafts</button>
              <button class="enable-btn enable-btn-ghost" onclick="alert('Future: ask Claude to rewrite — replies will land here once interactive insights are wired')">✎ Rewrite</button>
            </div>
          </div>
        </div>
      ` : ''}
      ${cwTask ? `
        <div class="enable-block enable-cowork">
          <div class="enable-block-head">
            <span class="enable-block-icon">⚡</span>
            <span class="enable-block-label">
              Delegate to Cowork — ${escapeHtml(cwTask.type.replace(/_/g, ' '))}
              <span class="enable-block-meta">${cwTask.estimated_minutes_saved ? `~${cwTask.estimated_minutes_saved} min saved` : ''} · delivers to ${escapeHtml(cwTask.delivery || 'your inbox')}</span>
            </span>
          </div>
          <div class="enable-block-body open">
            <div class="enable-cowork-desc">${escapeHtml(cwTask.description)}</div>
            <button class="enable-btn enable-btn-primary" onclick="alert('Future: POST to Cowork task queue per cowork-task-delegation-spec.md')">⚡ Delegate to Cowork</button>
          </div>
        </div>
      ` : ''}
    </div>`;
}

function toggleEnable(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const head = el.previousElementSibling;
  el.classList.toggle('open');
  if (head) head.classList.toggle('open');
}

function copyDraft(draftId, btn) {
  const el = document.getElementById(draftId);
  if (!el) return;
  const subjectEl = el.querySelector('.enable-draft-subject');
  const bodyEl = el.querySelector('.enable-draft-body');
  const text = (subjectEl ? subjectEl.textContent + '\n\n' : '') + (bodyEl ? bodyEl.textContent : '');
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✓ Copied';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1800);
  });
}

function onPlaysRefresh() {
  refreshCoachingCache().then(() => render());
}

function bindPlaysControls() { /* placeholder for future filter/sort wiring */ }

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
