/**
 * v2 scoreboard — persistent header scorecard, visible across all tabs.
 *
 * Renders the 6 key metric pills (hectares since target / total visits booked /
 * booked this week / completed this week / Stormboy wins / most recent win)
 * into the global header slot. One fetch on page load — uses the consolidated
 * /api/work/header-stats endpoint.
 */
window.v2Scoreboard = (function() {

  function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderPills(d) {
    const fv = d.farm_visits || {};
    const sb = d.stormboy_wins || {};
    const mr = d.most_recent_win;
    const targetSetLabel = d.target_set_date
      ? new Date(d.target_set_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
      : '—';
    let mrChannelChip = '';
    if (mr && mr.channel) {
      if (mr.channel.stormboy) mrChannelChip = '<span class="v2-stat-chip chip-stormboy">Stormboy</span>';
      else if (mr.channel.partner) mrChannelChip = `<span class="v2-stat-chip chip-partner">${escapeHtml(mr.channel.partner)}</span>`;
      else mrChannelChip = '<span class="v2-stat-chip chip-direct">direct</span>';
    }
    return `
      <div class="v2-stat-pills">
        <div class="v2-stat-pill pill-hectares" title="Hectares enrolled in soil-carbon projects since the 30K target was set">
          <div class="v2-stat-pill-num">${(d.project_ha_since_target || 0).toLocaleString()}<span class="v2-stat-pill-unit">ha</span></div>
          <div class="v2-stat-pill-progress"><div class="v2-stat-pill-progress-fill" style="width:${Math.min(100, d.project_ha_pct || 0)}%"></div></div>
          <div class="v2-stat-pill-label">${d.project_ha_pct}% of ${(d.project_ha_target/1000).toFixed(0)}K · since ${targetSetLabel}</div>
        </div>
        <div class="v2-stat-pill pill-total" title="Lifetime farm visits booked across all Storm Boy contacts">
          <div class="v2-stat-pill-num">${fv.lifetime_booked ?? '—'}</div>
          <div class="v2-stat-pill-label">total visits booked</div>
        </div>
        <div class="v2-stat-pill pill-booked" title="Storm Boy farm visits booked in the current ISO week">
          <div class="v2-stat-pill-num">${fv.booked_this_week ?? '—'}</div>
          <div class="v2-stat-pill-label">booked this week</div>
        </div>
        <div class="v2-stat-pill pill-completed" title="Storm Boy farm visits marked completed in the current ISO week">
          <div class="v2-stat-pill-num">${fv.completed_this_week ?? '—'}</div>
          <div class="v2-stat-pill-label">completed this week</div>
        </div>
        <div class="v2-stat-pill pill-stormboy" title="All-time won deals where any associated contact has storm_boy_campaign_member=Yes">
          <div class="v2-stat-pill-num">${sb.count ?? '—'}</div>
          <div class="v2-stat-pill-label">Stormboy wins · all-time</div>
        </div>
        <div class="v2-stat-pill pill-recent" title="${mr ? escapeHtml(mr.deal_name) : 'no recent wins'}">
          ${mr ? `<div class="v2-stat-pill-recent-name">${escapeHtml(mr.deal_name)}</div>
                  <div class="v2-stat-pill-label">most recent win · ${mr.days_ago}d ago ${mrChannelChip}</div>`
              : '<div class="v2-stat-pill-num">—</div><div class="v2-stat-pill-label">most recent win</div>'}
        </div>
      </div>
    `;
  }

  async function render() {
    const el = document.getElementById('scoreboard');
    if (!el) return;
    try {
      const res = await fetch('/api/work/header-stats');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      el.innerHTML = renderPills(data);
    } catch (e) {
      el.innerHTML = `<div class="v2-score-loading" style="color:#a64545">Scoreboard unavailable: ${escapeHtml(e.message)}</div>`;
    }
  }

  return { init: render, refresh: render };
})();
