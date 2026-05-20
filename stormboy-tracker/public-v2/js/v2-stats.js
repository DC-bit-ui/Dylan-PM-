/**
 * v2 STATS tab: leadership-facing analytics, structured as vertical sub-tabs.
 *
 *   Overview          — leadership scorecard (top-line KPIs)
 *   Conversion        — process refinement: funnel detail, stage transitions,
 *                       conversion-time distribution, loss forensics
 *   Era & Channel     — multi-era breakdown, channel mix, LawrieCo deep-dive link
 *   Team & Goals      — rep leaderboard, Storm Boy contact funnel, farm visits,
 *                       30K hectare projection
 *   Deep Dive         — per-deal picker + HubSpot timeline
 *
 * Terminology aligned to AgriProve's ISO 9001 certified scope (carbon project
 * management, spatial mapping, soil sampling, regulatory reporting, data analysis).
 * Operational tabs (WORK / ASK / BRAIN) keep team-spoken language.
 */
(function() {

  // ---- helpers ----
  function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function fmtDays(x) { return x === null || x === undefined ? '—' : Math.round(x) + 'd'; }
  function fmtPct(x, d) { return x === null || x === undefined ? '—' : (x * 100).toFixed(d || 1) + '%'; }
  function fmtNum(x) { return x === null || x === undefined ? '—' : x.toLocaleString(); }

  let _data = null;
  let _activeSubtab = 'overview';

  // ============================ OVERVIEW ============================
  function hectaresCard(d) {
    const h = d.hectares_to_30k;
    const trendMax = Math.max(...h.monthly_trend.map(m => m.project_ha), 1);
    return `
      <div class="v2-stats-card">
        <div class="v2-stats-head">
          <h3>Hectares registered · 30,000 target</h3>
          <p>Cumulative enrolled project area across registered carbon projects under the ACCU Scheme since 1 Sep 2025.</p>
        </div>
        <div class="v2-stats-h-headline">
          <span class="v2-stats-h-big">${fmtNum(h.project_ha)} <span class="v2-stats-h-unit">project ha</span></span>
          <span class="v2-stats-h-pct">${h.project_pct}% of 30k target</span>
          <span class="v2-stats-h-n">${h.n_wins} wins</span>
        </div>
        <div class="v2-stats-h-bar-wrap">
          <div class="v2-stats-h-bar" style="width:${Math.min(100, h.project_pct)}%"></div>
        </div>
        <div class="v2-stats-h-trend">
          ${h.monthly_trend.map(m => {
            const pct = (m.project_ha / trendMax) * 100;
            return `<div class="v2-stats-h-month"><div class="v2-stats-h-month-bar" style="height:${pct}%" title="${m.project_ha.toLocaleString()} ha"></div><div class="v2-stats-h-month-label">${m.month.slice(5)}</div><div class="v2-stats-h-month-val">${m.project_ha.toLocaleString()}</div></div>`;
          }).join('')}
        </div>
      </div>`;
  }

  function eraSummaryCard(d) {
    const e = d.era_comparison;
    const pre = e.pre_stormboy, post = e.post_stormboy;
    const deltaSign = e.delta_median_days > 0 ? '−' : '+';
    const deltaAbs = Math.abs(e.delta_median_days || 0);
    const ac = e.all_channels_comparison || {};
    const acPre = ac.pre_stormboy || {};
    const acPost = ac.post_stormboy || {};
    return `
      <div class="v2-stats-card">
        <div class="v2-stats-head">
          <h3>Time to project registration · era comparison</h3>
          <p>Median days from initial landholder engagement to registered carbon project, pre vs post 1 Sep 2025. <strong>LawrieCo excluded on both sides</strong> so the turnaround is attributable to Stormboy direct vs pre-Stormboy direct — LawrieCo deals close ~3x faster than the average and would bias the comparison.</p>
        </div>
        <div class="v2-stats-era-grid">
          <div class="v2-stats-era-col">
            <div class="v2-stats-era-label">Pre-Stormboy <span class="v2-stats-era-flag">direct only</span></div>
            <div class="v2-stats-era-window">${escapeHtml(pre.window)}</div>
            <div class="v2-stats-era-big">${fmtDays(pre.median_days)}</div>
            <div class="v2-stats-era-sub">median · n=${pre.n_with_ttc}</div>
            <div class="v2-stats-era-spread">IQR: ${fmtDays(pre.p25_days)} – ${fmtDays(pre.p75_days)}</div>
          </div>
          <div class="v2-stats-era-delta">
            <div class="v2-stats-era-delta-arrow">→</div>
            <div class="v2-stats-era-delta-val ${e.delta_median_days > 0 ? 'better' : 'worse'}">${deltaSign}${Math.round(deltaAbs)}d</div>
            <div class="v2-stats-era-delta-label">${e.delta_median_days > 0 ? 'faster' : 'slower'}</div>
          </div>
          <div class="v2-stats-era-col">
            <div class="v2-stats-era-label">Stormboy era <span class="v2-stats-era-flag">direct only</span></div>
            <div class="v2-stats-era-window">${escapeHtml(post.window)}</div>
            <div class="v2-stats-era-big">${fmtDays(post.median_days)}</div>
            <div class="v2-stats-era-sub">median · n=${post.n_with_ttc}</div>
            <div class="v2-stats-era-spread">IQR: ${fmtDays(post.p25_days)} – ${fmtDays(post.p75_days)}</div>
          </div>
        </div>
        <div class="v2-stats-honesty">
          <span class="v2-stats-honesty-label">Honest read</span>
          <span>${escapeHtml(e.honesty_note)} · ${e.lawrieco_excluded_wins || 0} LawrieCo wins excluded across both eras.</span>
        </div>
        <details class="v2-stats-secondary">
          <summary>Show all-channels view (with LawrieCo)</summary>
          <div class="v2-stats-secondary-body">
            <div class="v2-stats-secondary-row">
              <span>Pre-Stormboy:</span>
              <strong>${fmtDays(acPre.median_days)}</strong>
              <span class="v2-stats-secondary-meta">median · n=${acPre.n_with_ttc || 0}</span>
            </div>
            <div class="v2-stats-secondary-row">
              <span>Stormboy era:</span>
              <strong>${fmtDays(acPost.median_days)}</strong>
              <span class="v2-stats-secondary-meta">median · n=${acPost.n_with_ttc || 0}</span>
            </div>
            <div class="v2-stats-secondary-row">
              <span>Delta:</span>
              <strong class="${(ac.delta_median_days || 0) > 0 ? 'better' : 'worse'}">${ac.delta_median_days > 0 ? '−' : '+'}${Math.round(Math.abs(ac.delta_median_days || 0))}d</strong>
              <span class="v2-stats-secondary-meta">${(ac.delta_median_days || 0) > 0 ? 'faster' : 'slower'} when LawrieCo is included</span>
            </div>
            <div class="v2-stats-secondary-note">${escapeHtml(ac.note || '')}</div>
          </div>
        </details>
      </div>`;
  }

  function recentWinsCard(d) {
    const rows = d.recent_wins.map(w => {
      const channel = w.partner ? `<span class="v2-stats-tag tag-partner">${escapeHtml(w.partner)}</span>` : (w.lead_source === 'Storm Boy' ? '<span class="v2-stats-tag tag-stormboy">Storm Boy</span>' : '<span class="v2-stats-tag tag-direct">direct</span>');
      const projectHa = w.project_ha ? `${w.project_ha.toLocaleString()} project ha` : `${w.total_ha.toLocaleString()} total ha`;
      return `<div class="v2-stats-win-row"><div class="v2-stats-win-name">${escapeHtml(w.name)}</div><div class="v2-stats-win-meta">${channel} · ${fmtDays(w.days_to_close)} to register · ${projectHa} · closed ${new Date(w.closedate).toLocaleDateString()}</div></div>`;
    }).join('');
    return `
      <div class="v2-stats-card">
        <div class="v2-stats-head">
          <h3>Recently registered projects</h3>
          <p>Last 6 projects registered under the ACCU Scheme.</p>
        </div>
        ${rows || '<div class="v2-empty">No recently registered projects.</div>'}
      </div>`;
  }

  function renderOverview(d) {
    return `${hectaresCard(d)}${eraSummaryCard(d)}${recentWinsCard(d)}`;
  }

  // ============================ CONVERSION ANALYSIS ============================
  function funnelCard(d) {
    const f = d.pipeline_funnel;
    const max = Math.max(...f.map(s => s.open_count), 1);
    // Compute drop-off rate stage-to-stage
    const dropoffs = [];
    for (let i = 1; i < f.length; i++) {
      const prev = f[i - 1].open_count, cur = f[i].open_count;
      const ratio = prev > 0 ? cur / prev : null;
      dropoffs.push(ratio);
    }
    return `
      <div class="v2-stats-card">
        <div class="v2-stats-head">
          <h3>Active project pipeline · open projects by lifecycle stage</h3>
          <p>${d.totals.open_deals} open projects. Bars are absolute counts; the arrows between stages show the conversion ratio from the prior stage (open-to-open snapshot, not historical conversion).</p>
        </div>
        <div class="v2-stats-funnel-rows">
          ${f.map((s, i) => {
            const w = (s.open_count / max) * 100;
            const dropoff = i > 0 ? dropoffs[i - 1] : null;
            const dropoffEl = dropoff !== null
              ? `<div class="v2-stats-stage-flow">↓ ${(dropoff * 100).toFixed(0)}% of previous stage</div>`
              : '';
            return `${dropoffEl}<div class="v2-stats-funnel-row">
                <div class="v2-stats-funnel-stage">${escapeHtml(s.stage_name)}</div>
                <div class="v2-stats-funnel-bar-wrap"><div class="v2-stats-funnel-bar" style="width:${Math.max(2, w)}%">${s.open_count}</div></div>
                <div class="v2-stats-funnel-meta">
                  <span class="v2-stats-funnel-median">median ${fmtDays(s.median_days_in_stage)}</span>
                  <span class="v2-stats-funnel-max">oldest ${fmtDays(s.max_days_in_stage)}</span>
                </div>
              </div>
              ${s.oldest_deals.length ? `<div class="v2-stats-funnel-oldest">${s.oldest_deals.map(o => `<span class="v2-stats-funnel-oldest-deal">${escapeHtml(o.name)} · ${o.days}d</span>`).join('')}</div>` : ''}`;
          }).join('')}
        </div>
      </div>`;
  }

  function transitionTimesCard(d) {
    const t = d.transition_times;
    // Bar reflects historical Stormboy-era median (fall back to all-time if n is 0).
    const refFor = s => (s.won_stormboy_era.n ? s.won_stormboy_era.median : s.won_all_time.median) || 0;
    const max = Math.max(...t.map(refFor), 1);
    return `
      <div class="v2-stats-card">
        <div class="v2-stats-head">
          <h3>Stage dwell times · how long each stage actually takes</h3>
          <p>Historical median time spent in each stage by projects that registered, computed from <code>hs_v2_cumulative_time_in_&lt;stage&gt;</code>. Stormboy-era column is the read for current process; current-open column shows what's stuck right now.</p>
        </div>
        <table class="v2-stats-era-table">
          <thead>
            <tr>
              <th>Stage</th>
              <th class="num" colspan="2">Won · Stormboy era</th>
              <th class="num" colspan="2">Won · all-time</th>
              <th class="num" colspan="2">Open now</th>
            </tr>
            <tr class="meta">
              <th></th>
              <th class="num meta">median</th>
              <th class="num meta">IQR</th>
              <th class="num meta">median</th>
              <th class="num meta">IQR</th>
              <th class="num meta">median</th>
              <th class="num meta">max</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(s => {
              const sb = s.won_stormboy_era, at = s.won_all_time, cur = s.current_open;
              const ref = refFor(s);
              const w = (ref / max) * 100;
              return `<tr>
                <td>
                  <strong>${escapeHtml(s.stage_name)}</strong>
                  <div class="v2-stats-funnel-bar-wrap" style="margin-top:4px;max-width:160px"><div class="v2-stats-funnel-bar dwell" style="width:${Math.max(2, w)}%">${fmtDays(ref)}</div></div>
                </td>
                <td class="num strong">${fmtDays(sb.median)}</td>
                <td class="num meta">${sb.n ? `${fmtDays(sb.p25)}–${fmtDays(sb.p75)} · n=${sb.n}` : `n=0`}</td>
                <td class="num">${fmtDays(at.median)}</td>
                <td class="num meta">${at.n ? `${fmtDays(at.p25)}–${fmtDays(at.p75)} · n=${at.n}` : `n=0`}</td>
                <td class="num">${fmtDays(cur.median)}</td>
                <td class="num meta">${cur.n ? `${fmtDays(cur.max)} · n=${cur.n}` : `n=0`}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
        <div class="v2-stats-honesty">
          <span class="v2-stats-honesty-label">Reading this</span>
          <span>The Stormboy-era column is the truthful answer to "how long does this stage take?" — drawn only from projects that completed. If Open-now median exceeds Stormboy-era p75, the stage is running slower than its historical norm.</span>
        </div>
      </div>`;
  }

  function distributionCard(d) {
    const dist = d.conversion_time_distribution.stormboy_era;
    if (!dist.n) return '';
    const max = Math.max(...dist.buckets.map(b => b.count), 1);
    return `
      <div class="v2-stats-card">
        <div class="v2-stats-head">
          <h3>Conversion time distribution · Stormboy era</h3>
          <p>Histogram of days-from-creation-to-registration across ${dist.n} wins. 30-day buckets. Shows the shape of the curve, not just the median.</p>
        </div>
        <div class="v2-stats-dist-headline">
          <span>min ${fmtDays(dist.min)}</span>
          <span>p25 ${fmtDays(dist.p25)}</span>
          <strong>median ${fmtDays(dist.median)}</strong>
          <span>p75 ${fmtDays(dist.p75)}</span>
          <span>p90 ${fmtDays(dist.p90)}</span>
          <span>max ${fmtDays(dist.max)}</span>
        </div>
        <div class="v2-stats-dist-chart">
          ${dist.buckets.map(b => {
            const h = (b.count / max) * 100;
            return `<div class="v2-stats-dist-col" title="${b.lo}-${b.hi}d: ${b.count} wins"><div class="v2-stats-dist-bar" style="height:${Math.max(h, 2)}%">${b.count || ''}</div><div class="v2-stats-dist-label">${b.lo}-${b.hi}</div></div>`;
          }).join('')}
        </div>
        <div class="v2-stats-honesty"><span class="v2-stats-honesty-label">Reading this</span><span>Right-skew (long tail to the right) = some projects take materially longer than typical. Tighten by reducing what's happening between p50 and p90.</span></div>
      </div>`;
  }

  function lossCard(d) {
    const loss = d.loss_analysis.filter(l => l.lost_count > 0);
    const max = Math.max(...loss.map(l => l.lost_count), 1);
    return `
      <div class="v2-stats-card">
        <div class="v2-stats-head">
          <h3>Loss forensics · stage at which projects did not progress</h3>
          <p>Projects that closed lost, grouped by the stage they were in. Identifies where in the lifecycle landholders disengage.</p>
        </div>
        <div class="v2-stats-funnel-rows">
          ${loss.map(l => {
            const w = (l.lost_count / max) * 100;
            return `<div class="v2-stats-funnel-row">
              <div class="v2-stats-funnel-stage">${escapeHtml(l.stage)}</div>
              <div class="v2-stats-funnel-bar-wrap"><div class="v2-stats-funnel-bar lost" style="width:${Math.max(2, w)}%">${l.lost_count}</div></div>
              <div class="v2-stats-funnel-meta"><span class="v2-stats-funnel-median">median ${fmtDays(l.median_days_to_loss)} to loss</span></div>
            </div>
            ${l.recent_examples.length ? `<div class="v2-stats-funnel-oldest">Recent: ${l.recent_examples.map(e => `<span class="v2-stats-funnel-oldest-deal">${escapeHtml(e.name)}${e.partner ? ' (' + e.partner + ')' : ''} · ${fmtDays(e.days_to_loss)}</span>`).join('')}</div>` : ''}`;
          }).join('')}
        </div>
        <div class="v2-stats-honesty"><span class="v2-stats-honesty-label">Data quality note</span><span>${loss.find(l => l.stage === '(unknown stage)')?.lost_count || 0} of these losses have empty <code>deal_stage_before_close</code> in HubSpot. Worth a workflow to capture stage-at-close on transition.</span></div>
      </div>`;
  }

  function renderConversion(d) {
    return `${funnelCard(d)}${transitionTimesCard(d)}${distributionCard(d)}${lossCard(d)}`;
  }

  // ============================ ERA & CHANNEL ============================
  function multiEraCard(d) {
    const me = d.multi_era;
    const max = Math.max(...me.map(e => e.median_days || 0), 1);
    return `
      <div class="v2-stats-card">
        <div class="v2-stats-head">
          <h3>Multi-era comparison · Legacy / KCT / Stormboy</h3>
          <p>Median time-to-registration and hectares enrolled per era. Successive eras should show tighter medians + larger hectare totals if the system is compounding.</p>
        </div>
        <table class="v2-stats-era-table">
          <thead><tr><th>Era</th><th>Window</th><th class="num">n</th><th class="num">Median TTC</th><th class="num">IQR</th><th class="num">Project ha</th></tr></thead>
          <tbody>
            ${me.map(e => `<tr>
              <td><strong>${escapeHtml(e.name)}</strong></td>
              <td class="meta">${escapeHtml(e.window)}</td>
              <td class="num">${e.n}</td>
              <td class="num strong">${fmtDays(e.median_days)}</td>
              <td class="num meta">${fmtDays(e.p25_days)}–${fmtDays(e.p75_days)}</td>
              <td class="num">${fmtNum(e.project_ha)} ha</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  }

  function channelMixCard(d) {
    const ch = d.win_rate_by_channel;
    const direct = ch.direct, lawrieco = ch.lawrieco;
    const mult = direct.terminal_win_rate ? (lawrieco.terminal_win_rate / direct.terminal_win_rate) : null;
    return `
      <div class="v2-stats-card">
        <div class="v2-stats-head">
          <h3>Project registration rate · by referral channel</h3>
          <p>Terminal registration rate = registered / (registered + not progressed). Active projects excluded.</p>
        </div>
        <div class="v2-stats-channel-grid">
          <div class="v2-stats-channel-row">
            <div class="v2-stats-channel-name">Direct</div>
            <div class="v2-stats-channel-bar-wrap"><div class="v2-stats-channel-bar" style="width:${(direct.terminal_win_rate || 0) * 100}%"></div></div>
            <div class="v2-stats-channel-val">${fmtPct(direct.terminal_win_rate)}</div>
            <div class="v2-stats-channel-n">${direct.wins}w · ${direct.losses}l</div>
          </div>
          <div class="v2-stats-channel-row">
            <div class="v2-stats-channel-name">LawrieCo</div>
            <div class="v2-stats-channel-bar-wrap"><div class="v2-stats-channel-bar lawrieco" style="width:${(lawrieco.terminal_win_rate || 0) * 100}%"></div></div>
            <div class="v2-stats-channel-val">${fmtPct(lawrieco.terminal_win_rate)}</div>
            <div class="v2-stats-channel-n">${lawrieco.wins}w · ${lawrieco.losses}l</div>
          </div>
        </div>
        <div class="v2-stats-channel-delta">
          LawrieCo registers ${mult ? mult.toFixed(1) + '× more often than direct.' : 'rate calculation unavailable.'}
          <a href="/v2/experiments/lawrieco.html" class="v2-stats-link" target="_blank">Open full LawrieCo experiment →</a>
        </div>
      </div>`;
  }

  function quarterlyCard(d) {
    const q = d.quarterly_trend || [];
    if (!q.length) return '';
    const maxWon = Math.max(...q.map(x => x.won), 1);
    const maxHa = Math.max(...q.map(x => x.project_ha), 1);
    return `
      <div class="v2-stats-card">
        <div class="v2-stats-head">
          <h3>Quarterly trend · project registrations + enrolled hectares</h3>
          <p>Projects registered per quarter, with cumulative enrolled hectares overlay.</p>
        </div>
        <div class="v2-stats-quarterly">
          ${q.map(x => {
            const wh = (x.won / maxWon) * 100;
            const hh = (x.project_ha / maxHa) * 100;
            return `<div class="v2-stats-q-col"><div class="v2-stats-q-bars"><div class="v2-stats-q-bar wins" style="height:${wh}%"></div><div class="v2-stats-q-bar hectares" style="height:${hh}%"></div></div><div class="v2-stats-q-label">${x.quarter}</div><div class="v2-stats-q-vals"><span class="v2-stats-q-wins">${x.won}w</span><span class="v2-stats-q-ha">${(x.project_ha/1000).toFixed(1)}k ha</span></div></div>`;
          }).join('')}
        </div>
        <div class="v2-stats-q-legend">
          <span><span class="v2-stats-q-legend-swatch wins"></span> Project registrations (count)</span>
          <span><span class="v2-stats-q-legend-swatch hectares"></span> Project hectares</span>
        </div>
      </div>`;
  }

  function renderEraChannel(d) {
    return `${multiEraCard(d)}${channelMixCard(d)}${quarterlyCard(d)}`;
  }

  // ============================ TEAM & GOALS ============================
  function repCard(d) {
    const r = (d.rep_performance || []).filter(x => x.wins > 0);
    if (!r.length) return '';
    const max = Math.max(...r.map(x => x.project_ha), 1);
    return `
      <div class="v2-stats-card">
        <div class="v2-stats-head">
          <h3>Customer success team performance · Stormboy era</h3>
          <p>Projects registered by HubSpot owner since 1 Sep 2025.</p>
        </div>
        <div class="v2-stats-funnel-rows">
          ${r.map(x => {
            const w = (x.project_ha / max) * 100;
            return `<div class="v2-stats-funnel-row">
              <div class="v2-stats-funnel-stage">${escapeHtml(x.rep)}</div>
              <div class="v2-stats-funnel-bar-wrap"><div class="v2-stats-funnel-bar" style="width:${Math.max(2, w)}%">${x.project_ha.toLocaleString()} ha</div></div>
              <div class="v2-stats-funnel-meta"><span class="v2-stats-funnel-max">${x.wins} wins</span></div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
  }

  function projectionCard(d) {
    const p = d.projection_30k;
    return `
      <div class="v2-stats-card">
        <div class="v2-stats-head">
          <h3>30,000 hectare projection · trailing run rate</h3>
          <p>Linear extrapolation from the trailing ${p.trailing_months}-month rate. Directional — does not account for seasonality or pipeline acceleration.</p>
        </div>
        <div class="v2-stats-fv-headline">
          <div class="v2-stats-fv-stat"><div class="v2-stats-fv-big">${fmtNum(p.current_ha)}</div><div class="v2-stats-fv-lbl">current ha</div><div class="v2-stats-fv-sub">of ${fmtNum(p.target_ha)} target</div></div>
          <div class="v2-stats-fv-stat"><div class="v2-stats-fv-big">${fmtNum(p.remaining_ha)}</div><div class="v2-stats-fv-lbl">remaining</div><div class="v2-stats-fv-sub">to 30k</div></div>
          <div class="v2-stats-fv-stat"><div class="v2-stats-fv-big">${fmtNum(p.avg_monthly_ha)}</div><div class="v2-stats-fv-lbl">avg ha / month</div><div class="v2-stats-fv-sub">trailing ${p.trailing_months}m</div></div>
          <div class="v2-stats-fv-stat"><div class="v2-stats-fv-big">${p.months_to_target !== null ? p.months_to_target : '—'}</div><div class="v2-stats-fv-lbl">months left</div><div class="v2-stats-fv-sub">at current rate</div></div>
          <div class="v2-stats-fv-stat"><div class="v2-stats-fv-big" style="font-size:14px">${p.estimated_target_date || '—'}</div><div class="v2-stats-fv-lbl">est. target date</div><div class="v2-stats-fv-sub">confidence: ${p.confidence}</div></div>
        </div>
        <div class="v2-stats-honesty"><span class="v2-stats-honesty-label">Honest read</span><span>${escapeHtml(p.note)}</span></div>
      </div>`;
  }

  async function sbFunnelCard() {
    try {
      const res = await fetch('/api/stormboy/summary');
      const sb = await res.json();
      const max = Math.max(...sb.funnel.map(f => f.count), 1);
      return `
        <div class="v2-stats-card">
          <div class="v2-stats-head">
            <h3>Storm Boy landholder funnel · pre-registration stages</h3>
            <p>${sb.total_contacts.toLocaleString()} landholders in the Storm Boy campaign. ${sb.unstaged} not yet staged · ${sb.not_eligible} marked Not Eligible.</p>
          </div>
          <div class="v2-stats-funnel-rows">
            ${sb.funnel.map(s => {
              const w = (s.count / max) * 100;
              return `<div class="v2-stats-funnel-row"><div class="v2-stats-funnel-stage">${escapeHtml(s.stage)}</div><div class="v2-stats-funnel-bar-wrap"><div class="v2-stats-funnel-bar sb" style="width:${Math.max(2, w)}%">${s.count}</div></div></div>`;
            }).join('')}
          </div>
        </div>`;
    } catch (e) {
      return `<div class="v2-stats-card"><div class="v2-empty" style="color:#a64545">Storm Boy funnel failed: ${escapeHtml(e.message)}</div></div>`;
    }
  }

  async function farmVisitsCard() {
    try {
      const res = await fetch('/api/stats/farm-visits');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const d = await res.json();
      const maxBookings = Math.max(...d.trend.map(t => t.bookings), d.goal_per_week, 1);
      const wowSign = d.week_on_week_delta > 0 ? '+' : '';
      const wowClass = d.week_on_week_delta > 0 ? 'better' : (d.week_on_week_delta < 0 ? 'worse' : 'flat');
      const trackingClass = d.on_track ? 'better' : 'worse';
      return `
        <div class="v2-stats-card">
          <div class="v2-stats-head">
            <h3>Farm visits booked · weekly cadence vs goal</h3>
            <p>${d.lifetime_total} lifetime visits booked. Goal is ${d.goal_per_week}/week.</p>
          </div>
          <div class="v2-stats-fv-headline">
            <div class="v2-stats-fv-stat"><div class="v2-stats-fv-big">${d.this_week.bookings}</div><div class="v2-stats-fv-lbl">this week</div><div class="v2-stats-fv-sub">w/c ${d.this_week.week_start}</div></div>
            <div class="v2-stats-fv-stat"><div class="v2-stats-fv-big">${d.last_week.bookings}</div><div class="v2-stats-fv-lbl">last week</div><div class="v2-stats-fv-sub">w/c ${d.last_week.week_start}</div></div>
            <div class="v2-stats-fv-stat"><div class="v2-stats-fv-big ${wowClass}">${wowSign}${d.week_on_week_delta}</div><div class="v2-stats-fv-lbl">week on week</div><div class="v2-stats-fv-sub">vs last week</div></div>
            <div class="v2-stats-fv-stat"><div class="v2-stats-fv-big">${d.average_per_week}</div><div class="v2-stats-fv-lbl">avg / week</div><div class="v2-stats-fv-sub">trailing ${d.trend_window_weeks}w</div></div>
            <div class="v2-stats-fv-stat"><div class="v2-stats-fv-big ${trackingClass}">${d.vs_goal_pct}%</div><div class="v2-stats-fv-lbl">of goal</div><div class="v2-stats-fv-sub">${d.on_track ? 'on track' : 'below pace'}</div></div>
          </div>
          <div class="v2-stats-fv-chart">
            <div class="v2-stats-fv-goal-line" style="bottom:${(d.goal_per_week / maxBookings) * 100}%"><span class="v2-stats-fv-goal-label">Goal · ${d.goal_per_week}/wk</span></div>
            ${d.trend.map(w => {
              const h = (w.bookings / maxBookings) * 100;
              const meets = w.bookings >= d.goal_per_week;
              return `<div class="v2-stats-fv-bar-col" title="Week of ${w.week_start}: ${w.bookings}"><div class="v2-stats-fv-bar ${meets ? 'meets' : 'short'}" style="height:${Math.max(h, 2)}%">${w.bookings}</div><div class="v2-stats-fv-bar-label">${w.week_start.slice(5)}</div></div>`;
            }).join('')}
          </div>
        </div>`;
    } catch (e) {
      return `<div class="v2-stats-card"><div class="v2-empty" style="color:#a64545">Farm-visit metrics failed: ${escapeHtml(e.message)}</div></div>`;
    }
  }

  async function callEfficiencyCard() {
    try {
      const res = await fetch('/api/stats/call-efficiency');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const d = await res.json();
      const t = d.totals;
      const cur = d.this_week, prev = d.last_week;
      const wowSign = d.efficiency_wow > 0 ? '−' : (d.efficiency_wow < 0 ? '+' : '');
      const wowClass = d.efficiency_wow > 0 ? 'better' : (d.efficiency_wow < 0 ? 'worse' : 'flat');
      const maxCalls = Math.max(...d.trend.map(w => w.calls), 1);
      const maxVisits = Math.max(...d.trend.map(w => w.visits), 1);
      const maxCpv = Math.max(...d.trend.map(w => w.calls_per_visit || 0), d.target.calls_per_visit, 1);
      const targetPct = (d.target.calls_per_visit / maxCpv) * 100;
      const repRows = d.by_rep.map(r => {
        const max = Math.max(...d.by_rep.map(x => x.calls), 1);
        const w = (r.calls / max) * 100;
        return `<div class="v2-stats-funnel-row">
          <div class="v2-stats-funnel-stage">${escapeHtml(r.rep)}</div>
          <div class="v2-stats-funnel-bar-wrap"><div class="v2-stats-funnel-bar" style="width:${Math.max(2, w)}%">${r.calls}</div></div>
          <div class="v2-stats-funnel-meta"><span class="v2-stats-funnel-max">${Math.round((r.calls / t.calls) * 100)}% of total</span></div>
        </div>`;
      }).join('');
      return `
        <div class="v2-stats-card">
          <div class="v2-stats-head">
            <h3>Call efficiency · outbound calls per farm visit booked</h3>
            <p>Outbound calls by ${d.team_owners.join(', ')} vs farm visits booked, per ISO week. Will's product-refinement target (14 May): <strong>${d.target.calls_per_visit} calls per visit</strong> (20 calls → 10 visits).</p>
          </div>
          <div class="v2-stats-fv-headline">
            <div class="v2-stats-fv-stat"><div class="v2-stats-fv-big ${d.target.on_target ? 'better' : 'worse'}">${t.avg_calls_per_visit ?? '—'}</div><div class="v2-stats-fv-lbl">avg calls / visit</div><div class="v2-stats-fv-sub">trailing ${d.trend_window_weeks}w</div></div>
            <div class="v2-stats-fv-stat"><div class="v2-stats-fv-big">${t.calls.toLocaleString()}</div><div class="v2-stats-fv-lbl">total calls</div><div class="v2-stats-fv-sub">${d.trend_window_weeks}-week window</div></div>
            <div class="v2-stats-fv-stat"><div class="v2-stats-fv-big">${t.visits}</div><div class="v2-stats-fv-lbl">total visits</div><div class="v2-stats-fv-sub">booked in window</div></div>
            <div class="v2-stats-fv-stat"><div class="v2-stats-fv-big">${cur.calls_per_visit ?? '—'}</div><div class="v2-stats-fv-lbl">this week</div><div class="v2-stats-fv-sub">${cur.calls}c · ${cur.visits}v · ${cur.week_start.slice(5)}</div></div>
            <div class="v2-stats-fv-stat"><div class="v2-stats-fv-big ${wowClass}">${d.efficiency_wow !== null ? wowSign + Math.abs(d.efficiency_wow) : '—'}</div><div class="v2-stats-fv-lbl">wow change</div><div class="v2-stats-fv-sub">${d.efficiency_wow > 0 ? 'more efficient' : (d.efficiency_wow < 0 ? 'less efficient' : 'flat')}</div></div>
          </div>
          <div class="v2-stats-fv-chart" style="margin-top:18px;height:140px;position:relative">
            <div class="v2-stats-fv-goal-line" style="bottom:${targetPct}%;border-color:#3a6b3a"><span class="v2-stats-fv-goal-label" style="background:#e7f0e6;color:#2a4d2a">Target · ${d.target.calls_per_visit} calls/visit</span></div>
            ${d.trend.map(w => {
              const h = ((w.calls_per_visit || 0) / maxCpv) * 100;
              const onTarget = w.calls_per_visit !== null && w.calls_per_visit <= d.target.calls_per_visit * 2; // within 2x of target = green-ish
              return `<div class="v2-stats-fv-bar-col" title="${w.week_start}: ${w.calls} calls → ${w.visits} visits = ${w.calls_per_visit ?? '∞'} per visit"><div class="v2-stats-fv-bar ${onTarget ? 'meets' : 'short'}" style="height:${Math.max(h, 2)}%">${w.calls_per_visit ?? '—'}</div><div class="v2-stats-fv-bar-label">${w.week_start.slice(5)}</div></div>`;
            }).join('')}
          </div>
          <div class="v2-stats-fv-sub" style="margin-top:8px;text-align:center">Bar height = calls per visit (lower = more efficient). Target line at ${d.target.calls_per_visit}.</div>

          <div style="margin-top:18px;display:grid;grid-template-columns:1fr 1fr;gap:18px">
            <div>
              <h4 style="margin:0 0 8px;font-size:13px;color:#5a5a5a">Weekly volume · calls vs visits</h4>
              <div class="v2-stats-fv-chart" style="height:120px">
                ${d.trend.map(w => {
                  const ch = (w.calls / maxCalls) * 100;
                  const vh = (w.visits / maxVisits) * 100;
                  return `<div class="v2-stats-fv-bar-col" style="display:flex;flex-direction:column;align-items:center" title="${w.week_start}: ${w.calls} calls, ${w.visits} visits">
                    <div style="display:flex;align-items:flex-end;height:100%;gap:2px;width:100%;justify-content:center">
                      <div style="width:8px;background:#b6b09a;height:${Math.max(ch, 2)}%" title="${w.calls} calls"></div>
                      <div style="width:8px;background:#3a6b3a;height:${Math.max(vh, 2)}%" title="${w.visits} visits"></div>
                    </div>
                    <div class="v2-stats-fv-bar-label">${w.week_start.slice(5)}</div>
                  </div>`;
                }).join('')}
              </div>
              <div class="v2-stats-q-legend" style="margin-top:6px"><span><span class="v2-stats-q-legend-swatch" style="background:#b6b09a"></span> Calls</span><span><span class="v2-stats-q-legend-swatch" style="background:#3a6b3a"></span> Visits</span></div>
            </div>
            <div>
              <h4 style="margin:0 0 8px;font-size:13px;color:#5a5a5a">Call distribution · who's dialling</h4>
              <div class="v2-stats-funnel-rows">${repRows}</div>
            </div>
          </div>

          <div class="v2-stats-honesty">
            <span class="v2-stats-honesty-label">Reading this</span>
            <span>${t.avg_calls_per_visit !== null && t.avg_calls_per_visit > d.target.calls_per_visit
              ? `Currently <strong>${t.avg_calls_per_visit}</strong> calls per visit vs target of <strong>${d.target.calls_per_visit}</strong> — ratio is ${Math.round(t.avg_calls_per_visit / d.target.calls_per_visit * 10) / 10}× the target. Closing this gap = either (a) calls convert at a higher rate, or (b) the team makes more calls and visit count grows. Will's reading: focus on call quality, not just volume.`
              : 'On target.'}</span>
          </div>
        </div>`;
    } catch (e) {
      return `<div class="v2-stats-card"><div class="v2-empty" style="color:#a64545">Call-efficiency metrics failed: ${escapeHtml(e.message)}</div></div>`;
    }
  }

  async function renderTeamGoals(d) {
    const [sb, fv, ce] = await Promise.all([sbFunnelCard(), farmVisitsCard(), callEfficiencyCard()]);
    return `${repCard(d)}${projectionCard(d)}${fv}${ce}${sb}`;
  }

  // ============================ WIN TIMELINE ============================
  let _winTimelineData = null;
  let _winTimelineRange = '4y';        // default: past 4 years
  let _winTimelineYear = null;         // when range='year', this year
  let _winTimelineChannels = { stormboy: true, partner: true, direct: true };

  async function renderWinTimeline() {
    return `
      <div class="v2-stats-card">
        <div class="v2-stats-head">
          <h3>Win timeline · all registered carbon projects</h3>
          <p>Each marker is a closed-won deal. Position = close date · colour = channel · size = enrolled project hectares. Hover for detail, click to open in HubSpot.</p>
        </div>
        <div id="win-timeline-host"><div class="v2-loading" style="padding:24px">Loading win timeline…</div></div>
      </div>`;
  }

  async function loadAndPaintWinTimeline() {
    const host = document.getElementById('win-timeline-host');
    if (!host) return;
    try {
      if (!_winTimelineData) {
        host.innerHTML = '<div class="v2-loading" style="padding:24px">Fetching wins + channel attribution from HubSpot…</div>';
        const res = await fetch('/api/stats/win-timeline');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        _winTimelineData = await res.json();
      }
      paintWinTimeline();
    } catch (e) {
      host.innerHTML = `<div class="v2-empty" style="color:#a64545;padding:24px">Win timeline failed: ${escapeHtml(e.message)}</div>`;
    }
  }

  function winTimelineRange() {
    const now = new Date();
    const ranges = {
      'all':  { start: null, end: now, label: 'All time' },
      '4y':   { start: new Date(now.getFullYear() - 4, now.getMonth(), now.getDate()), end: now, label: 'Past 4 years' },
      '1y':   { start: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()), end: now, label: 'Past year' },
      '6m':   { start: new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()), end: now, label: 'Past 6 months' },
      '3m':   { start: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()), end: now, label: 'Past 3 months' },
    };
    if (_winTimelineRange === 'year' && _winTimelineYear) {
      return {
        start: new Date(_winTimelineYear, 0, 1),
        end: new Date(_winTimelineYear, 11, 31, 23, 59, 59),
        label: String(_winTimelineYear),
      };
    }
    return ranges[_winTimelineRange] || ranges['4y'];
  }

  function paintWinTimeline() {
    const host = document.getElementById('win-timeline-host');
    if (!host || !_winTimelineData) return;
    const wins = _winTimelineData.wins || [];
    if (!wins.length) {
      host.innerHTML = '<div class="v2-empty">No wins on record.</div>';
      return;
    }
    const range = winTimelineRange();
    const startMs = range.start ? range.start.getTime() : new Date(_winTimelineData.earliest_closedate).getTime();
    const endMs = range.end.getTime();
    const spanMs = endMs - startMs || 1;

    // Filter
    const filtered = wins.filter(w => {
      if (!w.closedate) return false;
      const t = new Date(w.closedate).getTime();
      if (t < startMs || t > endMs) return false;
      if (w.channel.stormboy && !_winTimelineChannels.stormboy) return false;
      if (w.channel.partner && !_winTimelineChannels.partner) return false;
      if (w.channel.direct && !_winTimelineChannels.direct) return false;
      return true;
    });

    // Build year-tick array
    const startYr = new Date(startMs).getFullYear();
    const endYr = new Date(endMs).getFullYear();
    const ticks = [];
    for (let y = startYr; y <= endYr; y++) {
      const t = new Date(y, 0, 1).getTime();
      if (t >= startMs && t <= endMs) ticks.push({ year: y, pct: ((t - startMs) / spanMs) * 100 });
    }
    // Month ticks (lighter) for short ranges
    const showMonths = _winTimelineRange === '6m' || _winTimelineRange === '3m' || (_winTimelineRange === 'year');
    const monthTicks = [];
    if (showMonths) {
      let cursor = new Date(startMs);
      cursor.setDate(1);
      while (cursor.getTime() <= endMs) {
        const t = cursor.getTime();
        if (t >= startMs && t <= endMs) {
          monthTicks.push({
            label: cursor.toLocaleDateString(undefined, { month: 'short' }),
            pct: ((t - startMs) / spanMs) * 100,
          });
        }
        cursor.setMonth(cursor.getMonth() + 1);
      }
    }

    // Size scale — log of hectares, clamped
    function markerSize(ha) {
      if (!ha || ha <= 0) return 10;
      const log = Math.log10(ha);     // 100 ha = 2, 1k ha = 3, 10k ha = 4
      return Math.max(8, Math.min(28, 6 + log * 5));
    }

    function channelClass(w) {
      if (w.channel.stormboy) return 'ch-stormboy';
      if (w.channel.partner) return 'ch-partner';
      return 'ch-direct';
    }
    function channelLabel(w) {
      const bits = [];
      if (w.channel.stormboy) bits.push('Stormboy');
      if (w.channel.partner) bits.push('via ' + w.channel.partner);
      if (!bits.length) bits.push('direct');
      return bits.join(' + ');
    }

    // Marker stack within same day — offset vertically
    const dayBuckets = {};
    filtered.forEach(w => {
      const d = w.closedate.slice(0, 10);
      dayBuckets[d] = dayBuckets[d] || [];
      dayBuckets[d].push(w);
    });

    const markers = filtered.map(w => {
      const t = new Date(w.closedate).getTime();
      const x = ((t - startMs) / spanMs) * 100;
      const d = w.closedate.slice(0, 10);
      const idx = dayBuckets[d].indexOf(w);
      const yOffset = (idx % 5) * 6; // stack same-day markers
      const size = markerSize(w.project_ha || w.total_ha);
      const haLabel = w.project_ha
        ? `${Math.round(w.project_ha).toLocaleString()} ha (project)`
        : (w.total_ha ? `${Math.round(w.total_ha).toLocaleString()} ha (total)` : 'no ha');
      const tooltip = `${w.deal_name}\n${new Date(w.closedate).toLocaleDateString()} · ${channelLabel(w)}\n${haLabel}${w.days_to_close ? ' · ' + w.days_to_close + 'd to close' : ''}`;
      return `<a class="v2-wt-marker ${channelClass(w)}" href="${w.hubspot_url}" target="_blank" style="left:${x}%;width:${size}px;height:${size}px;bottom:calc(50% + ${yOffset}px - ${size/2}px)" title="${escapeHtml(tooltip).replace(/\n/g,'&#10;')}"></a>`;
    }).join('');

    // Totals + breakdowns for the filtered window
    const sumHa = filtered.reduce((s, w) => s + (w.project_ha || w.total_ha || 0), 0);
    const sbCount = filtered.filter(w => w.channel.stormboy).length;
    const partnerCount = filtered.filter(w => w.channel.partner).length;
    const directCount = filtered.filter(w => w.channel.direct).length;

    // Year-buttons for year-mode (offer last 5 years + earliest)
    const yearsAvailable = new Set();
    wins.forEach(w => { if (w.closedate) yearsAvailable.add(new Date(w.closedate).getFullYear()); });
    const yearList = Array.from(yearsAvailable).sort((a, b) => b - a);

    host.innerHTML = `
      <div class="v2-wt-controls">
        <div class="v2-wt-range-row">
          <span class="v2-wt-range-label">Range:</span>
          <button class="v2-wt-range-btn${_winTimelineRange==='all'?' active':''}" data-range="all">All time</button>
          <button class="v2-wt-range-btn${_winTimelineRange==='4y'?' active':''}" data-range="4y">4 years</button>
          <button class="v2-wt-range-btn${_winTimelineRange==='1y'?' active':''}" data-range="1y">1 year</button>
          <button class="v2-wt-range-btn${_winTimelineRange==='6m'?' active':''}" data-range="6m">6 months</button>
          <button class="v2-wt-range-btn${_winTimelineRange==='3m'?' active':''}" data-range="3m">3 months</button>
          <select class="v2-wt-year-select" data-action="year">
            <option value="">Specific year…</option>
            ${yearList.map(y => `<option value="${y}"${_winTimelineRange==='year' && _winTimelineYear===y?' selected':''}>${y}</option>`).join('')}
          </select>
        </div>
        <div class="v2-wt-channel-row">
          <span class="v2-wt-range-label">Channels:</span>
          <label class="v2-wt-ch-toggle ch-stormboy${_winTimelineChannels.stormboy?' active':''}"><input type="checkbox" data-ch="stormboy" ${_winTimelineChannels.stormboy?'checked':''}/> Stormboy <span class="v2-wt-ch-count">${sbCount}</span></label>
          <label class="v2-wt-ch-toggle ch-partner${_winTimelineChannels.partner?' active':''}"><input type="checkbox" data-ch="partner" ${_winTimelineChannels.partner?'checked':''}/> Partner <span class="v2-wt-ch-count">${partnerCount}</span></label>
          <label class="v2-wt-ch-toggle ch-direct${_winTimelineChannels.direct?' active':''}"><input type="checkbox" data-ch="direct" ${_winTimelineChannels.direct?'checked':''}/> Direct <span class="v2-wt-ch-count">${directCount}</span></label>
          <span class="v2-wt-totals">${filtered.length} wins · ${Math.round(sumHa).toLocaleString()} ha · ${range.label}</span>
        </div>
      </div>

      <div class="v2-wt-frame">
        ${monthTicks.length ? `<div class="v2-wt-month-row">${monthTicks.map(m => `<div class="v2-wt-month" style="left:${m.pct}%">${m.label}</div>`).join('')}</div>` : ''}
        <div class="v2-wt-track">
          <div class="v2-wt-axis"></div>
          ${ticks.map(t => `<div class="v2-wt-year-tick" style="left:${t.pct}%"><div class="v2-wt-year-line"></div><div class="v2-wt-year-label">${t.year}</div></div>`).join('')}
          ${markers || '<div class="v2-empty" style="padding:24px;text-align:center;width:100%">No wins in this range.</div>'}
        </div>
      </div>

      <div class="v2-stats-honesty" style="margin-top:14px">
        <span class="v2-stats-honesty-label">Reading this</span>
        <span>Vertical stacking handles same-day clusters. Marker size scales with log(hectares) — a 10,000ha deal isn't 100× the size of a 100ha deal, just visibly bigger. Use the channel toggles to isolate one motion (e.g. Stormboy-only) and look for seasonal density patterns: gaps reveal slow periods; clusters reveal months that closed well.</span>
      </div>
    `;

    // Wire controls
    host.querySelectorAll('.v2-wt-range-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        _winTimelineRange = btn.dataset.range;
        _winTimelineYear = null;
        const sel = host.querySelector('.v2-wt-year-select');
        if (sel) sel.value = '';
        paintWinTimeline();
      });
    });
    const yearSel = host.querySelector('.v2-wt-year-select');
    if (yearSel) {
      yearSel.addEventListener('change', () => {
        const v = parseInt(yearSel.value, 10);
        if (Number.isFinite(v)) {
          _winTimelineRange = 'year';
          _winTimelineYear = v;
          paintWinTimeline();
        }
      });
    }
    host.querySelectorAll('input[data-ch]').forEach(cb => {
      cb.addEventListener('change', () => {
        _winTimelineChannels[cb.dataset.ch] = cb.checked;
        paintWinTimeline();
      });
    });
  }

  // ============================ DEEP DIVE ============================
  function renderDeepDive(d) {
    return `
      <div class="v2-stats-card">
        <div class="v2-stats-head">
          <h3>Per-deal deep dive</h3>
          <p>Pick a deal to see its HubSpot timeline + run a fresh artifact-grounded diagnosis. Reuses the engagement-timeline endpoint already powering the WORK tab.</p>
        </div>
        <div style="margin-bottom:12px">
          <input type="text" class="v2-stats-deal-search" placeholder="Type a deal name or HubSpot ID…" style="width:100%;padding:8px 12px;border:1px solid #d8d6c4;border-radius:4px;font-size:13px" />
        </div>
        <div id="deep-dive-results"><div class="v2-empty">Type a deal name above. Search runs after 600ms of inactivity.</div></div>
      </div>`;
  }

  function bindDeepDive() {
    const input = document.querySelector('.v2-stats-deal-search');
    if (!input) return;
    let timer = null;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => runDeepDiveSearch(input.value.trim()), 600);
    });
  }

  async function runDeepDiveSearch(q) {
    const target = document.getElementById('deep-dive-results');
    if (!q || q.length < 2) { target.innerHTML = '<div class="v2-empty">Type a deal name above.</div>'; return; }
    target.innerHTML = '<div class="v2-loading">Searching HubSpot…</div>';
    try {
      const body = {
        objectType: 'deals',
        query: q,
        properties: ['dealname', 'dealstage', 'createdate', 'closedate', 'partner', 'total_property_hectares', 'estimated_project_ha'],
        limit: 10,
      };
      const res = await fetch('/api/hubspot/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      const results = (data.results || []).slice(0, 10);
      if (!results.length) { target.innerHTML = '<div class="v2-empty">No matches.</div>'; return; }
      target.innerHTML = results.map(r => {
        const p = r.properties;
        return `<div class="v2-stats-win-row" data-deal-id="${r.id}" style="cursor:pointer" onclick="v2StatsLoadTimeline('${r.id}', '${escapeHtml(p.dealname || '')}')">
          <div class="v2-stats-win-name">${escapeHtml(p.dealname || '(no name)')}</div>
          <div class="v2-stats-win-meta">id ${r.id} · created ${p.createdate ? new Date(p.createdate).toLocaleDateString() : '—'} · ${p.estimated_project_ha || '—'} ha</div>
        </div>`;
      }).join('') + '<div class="v2-stats-fv-sub" style="margin-top:8px">Click a deal to load its HubSpot timeline.</div>';
    } catch (e) {
      target.innerHTML = `<div class="v2-empty" style="color:#a64545">Search failed: ${escapeHtml(e.message)}</div>`;
    }
  }

  window.v2StatsLoadTimeline = async function(dealId, name) {
    const target = document.getElementById('deep-dive-results');
    target.innerHTML = `<div class="v2-loading">Loading timeline for ${escapeHtml(name)}…</div>`;
    try {
      const res = await fetch('/api/work/timeline?type=deal&id=' + encodeURIComponent(dealId));
      const data = await res.json();
      target.innerHTML = `
        <div class="v2-stats-card" style="margin-bottom:0;border-left:4px solid #3a6b3a">
          <h3 style="margin:0 0 8px;font-size:14px">${escapeHtml(name)}</h3>
          <div class="v2-stats-fv-sub" style="margin-bottom:12px">Last contact: ${data.last_contact_date ? new Date(data.last_contact_date).toLocaleDateString() : '—'} (${data.days_since_last_contact ?? '—'}d ago) · ${data.engagements_returned} engagements</div>
          ${(data.engagements || []).map(e => `
            <div style="padding:10px 0;border-bottom:1px solid #f0efe7">
              <div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px"><strong style="font-size:13px">${escapeHtml(e.title)}</strong><span class="v2-stats-fv-sub">${e.timestamp ? new Date(e.timestamp).toLocaleString() : '—'}</span></div>
              ${e.subline ? `<div class="v2-stats-fv-sub">${escapeHtml(e.subline)}</div>` : ''}
              ${e.body ? `<blockquote style="background:#fbfaf3;border-left:3px solid #b6b09a;margin:6px 0 0;padding:8px 12px;font-size:12px;font-style:italic;color:#3a3a3a">${escapeHtml(e.body)}</blockquote>` : ''}
            </div>`).join('')}
          <div style="margin-top:10px"><a href="javascript:void(0)" onclick="document.querySelector('.v2-stats-deal-search').value='';runDeepDiveSearch('')" class="v2-stats-link">← Back to search</a></div>
        </div>`;
    } catch (e) {
      target.innerHTML = `<div class="v2-empty" style="color:#a64545">Timeline load failed: ${escapeHtml(e.message)}</div>`;
    }
  };
  // Make runDeepDiveSearch usable from inline onclick "Back to search"
  window.runDeepDiveSearch = runDeepDiveSearch;

  // ============================ SHELL + ROUTING ============================
  const SUBTABS = [
    { key: 'overview',     label: 'Overview',           hint: 'Scorecard · top-line KPIs' },
    { key: 'conversion',   label: 'Conversion Analysis', hint: 'Funnel · stage dwell · distribution · losses' },
    { key: 'era-channel',  label: 'Era & Channel',      hint: 'Multi-era · channel mix · quarterly trend' },
    { key: 'win-timeline', label: 'Win timeline',       hint: 'All wins · channel-coloured · seasonal trends · range selector' },
    { key: 'team-goals',   label: 'Team & Goals',       hint: 'Reps · 30k projection · farm visits · call efficiency · SB funnel' },
    { key: 'deep-dive',    label: 'Deep Dive',          hint: 'Per-deal timeline + diagnosis' },
  ];

  async function renderSubtab(key, d) {
    if (key === 'overview')     return renderOverview(d);
    if (key === 'conversion')   return renderConversion(d);
    if (key === 'era-channel')  return renderEraChannel(d);
    if (key === 'win-timeline') return await renderWinTimeline();
    if (key === 'team-goals')   return await renderTeamGoals(d);
    if (key === 'deep-dive')    return renderDeepDive(d);
    return '<div class="v2-empty">Unknown tab.</div>';
  }

  async function activateSubtab(key) {
    _activeSubtab = key;
    document.querySelectorAll('.v2-stats-vtab').forEach(t => t.classList.toggle('active', t.dataset.tab === key));
    const target = document.getElementById('stats-pane');
    target.innerHTML = '<div class="v2-loading">Loading…</div>';
    const html = await renderSubtab(key, _data);
    target.innerHTML = html;
    if (key === 'deep-dive') bindDeepDive();
    if (key === 'win-timeline') loadAndPaintWinTimeline();
    target.scrollTop = 0;
  }

  // ====== EFFICACY HERO — Section 1 of the STATS redesign ======
  // The single most important question this page should answer: is Stormboy
  // working? Three cards comparing Stormboy cohort vs control on the same
  // time window. Reads /api/stats/stormboy-efficacy. Renders before the
  // existing subtab nav (subtabs to be removed in subsequent slices once
  // sections 2-5 land).
  function fmtNumber(n, opts = {}) {
    if (n == null) return '—';
    if (opts.pct) return n + '%';
    if (opts.days) return n + 'd';
    if (opts.ha)   return n.toLocaleString() + ' ha';
    return n.toLocaleString();
  }
  function deltaPill(d, opts = {}) {
    if (!d) return '<span class="v2-eff-delta v2-eff-delta-na">n/a</span>';
    const arrow = d.trend === 'good' ? '↑' : d.trend === 'bad' ? '↓' : '→';
    const cls = `v2-eff-delta v2-eff-delta-${d.trend}`;
    const absLabel = opts.pp ? `${d.absolute > 0 ? '+' : ''}${d.absolute}pp`
                  : opts.days ? `${d.absolute > 0 ? '+' : ''}${d.absolute}d`
                  : opts.ha ? `${d.absolute > 0 ? '+' : ''}${d.absolute.toLocaleString()} ha`
                  : `${d.absolute > 0 ? '+' : ''}${d.absolute}`;
    const pct = d.pct_change != null ? ` · ${d.pct_change > 0 ? '+' : ''}${d.pct_change}%` : '';
    return `<span class="${cls}">${arrow} ${absLabel}${pct}</span>`;
  }
  function efficacyHeroHtml(eff) {
    if (!eff || eff.empty) {
      return `<div class="v2-empty" style="padding:18px">${escapeHtml(eff && eff.reason || 'No efficacy data available yet.')}</div>`;
    }
    const sb = eff.cohorts.stormboy, ct = eff.cohorts.control;
    const lc = eff.cohorts.lawrieco || {};
    const winDelta   = eff.deltas.win_rate_pp;
    // Days to decision (won + lost) is the headline; days-to-close (won-only)
    // is shown as a secondary breakout in the card note.
    const decDelta   = eff.deltas.median_days_to_decision;
    const haDelta    = eff.deltas.hectares_per_won_deal_mean;
    const since = (eff.window.since_iso || '').slice(0, 10);
    const until = (eff.window.until_iso || '').slice(0, 10);
    const lawriecoNote = lc && lc.total_closed
      ? ` · LawrieCo n=${lc.total_closed} carved out (closes ~3x faster, would bias comparison)`
      : '';
    return `
      <section class="v2-eff-hero">
        <div class="v2-eff-hero-head">
          <h2 class="v2-eff-hero-title">Is Stormboy working?</h2>
          <div class="v2-eff-hero-sub">
            Cohort comparison · ${since} → ${until} (${eff.window.months}mo window) ·
            Stormboy n=${sb.total_closed}, direct control n=${ct.total_closed}${lawriecoNote} ·
            Stormboy launched ${eff.stormboy_launch_date}
          </div>
        </div>
        <div class="v2-eff-grid">
          ${heroCard({
            label: 'Win rate',
            value: fmtNumber(sb.win_rate_pct, { pct: true }),
            compare: `${fmtNumber(ct.win_rate_pct, { pct: true })} direct control`,
            delta: deltaPill(winDelta, { pp: true }),
            trend: winDelta && winDelta.trend,
            note: `${sb.won_count} won / ${sb.lost_count} lost · vs ${ct.won_count} won / ${ct.lost_count} lost`,
          })}
          ${heroCard({
            label: 'Median days to decision',
            value: fmtNumber(sb.median_days_to_decision, { days: true }),
            compare: `${fmtNumber(ct.median_days_to_decision, { days: true })} direct control`,
            delta: deltaPill(decDelta, { days: true }),
            trend: decDelta && decDelta.trend,
            note: `won-only: ${fmtNumber(sb.median_days_to_close_won, { days: true })} vs ${fmtNumber(ct.median_days_to_close_won, { days: true })} · lost-only: ${fmtNumber(sb.median_days_to_close_lost, { days: true })} vs ${fmtNumber(ct.median_days_to_close_lost, { days: true })} · n=${sb.n_with_decision_days} vs ${ct.n_with_decision_days} (noise filtered [1, 730]d)`,
          })}
          ${heroCard({
            label: 'Hectares per won deal',
            value: fmtNumber(sb.hectares_per_won_deal_mean, { ha: true }),
            compare: `${fmtNumber(ct.hectares_per_won_deal_mean, { ha: true })} direct control`,
            delta: deltaPill(haDelta, { ha: true }),
            trend: haDelta && haDelta.trend,
            note: `total enrolled: ${fmtNumber(sb.hectares_won, { ha: true })} vs ${fmtNumber(ct.hectares_won, { ha: true })}`,
          })}
          ${pipelineEntryCard(eff)}
        </div>
        <details class="v2-eff-caveats">
          <summary>How to read this</summary>
          <ul>${(eff.caveats || []).map(c => `<li>${escapeHtml(c)}</li>`).join('')}</ul>
        </details>
      </section>`;
  }
  // 4th hero card — pipeline entry rate (direct deals only, excludes
  // LawrieCo). Measures deals reaching the sales pipeline per week,
  // Stormboy era vs pre-Stormboy, normalised so the two periods are
  // directly comparable regardless of length.
  function pipelineEntryCard(eff) {
    const pe = eff.pipeline_entry || {};
    const sb = pe.stormboy_era || {};
    const pre = pe.pre_stormboy || {};
    const d = eff.deltas && eff.deltas.pipeline_entry_direct_per_week;
    return heroCard({
      label: 'Direct deals to pipeline / week',
      value: sb.direct_per_week != null ? sb.direct_per_week + '/wk' : '—',
      compare: pre.direct_per_week != null ? `${pre.direct_per_week}/wk pre-Stormboy` : '—',
      delta: deltaPillRate(d),
      trend: d && d.trend,
      note: `${sb.direct_count} direct in ${sb.weeks}wk Stormboy era · vs ${pre.direct_count} in ${pre.weeks}wk · LawrieCo excluded (${sb.excluded_lawrieco} + ${pre.excluded_lawrieco})`,
    });
  }
  function deltaPillRate(d) {
    if (!d) return '<span class="v2-eff-delta v2-eff-delta-na">n/a</span>';
    const arrow = d.trend === 'good' ? '↑' : d.trend === 'bad' ? '↓' : '→';
    const cls = `v2-eff-delta v2-eff-delta-${d.trend}`;
    const sign = d.absolute > 0 ? '+' : '';
    const pct = d.pct_change != null ? ` · ${d.pct_change > 0 ? '+' : ''}${d.pct_change}%` : '';
    return `<span class="${cls}">${arrow} ${sign}${d.absolute}/wk${pct}</span>`;
  }

  function heroCard({ label, value, compare, delta, trend, note }) {
    return `
      <div class="v2-eff-card v2-eff-trend-${trend || 'flat'}">
        <div class="v2-eff-card-label">${escapeHtml(label)}</div>
        <div class="v2-eff-card-value">${value}</div>
        <div class="v2-eff-card-delta">${delta}</div>
        <div class="v2-eff-card-compare">${escapeHtml(compare)}</div>
        <div class="v2-eff-card-note">${escapeHtml(note)}</div>
      </div>`;
  }
  async function fetchEfficacy() {
    try {
      const r = await fetch('/api/stats/stormboy-efficacy');
      if (!r.ok) return null;
      return await r.json();
    } catch (_) { return null; }
  }

  // ====== COHORT FUNNEL — Section 2 of the STATS redesign ======
  // Side-by-side stage conversion for Stormboy / direct control / LawrieCo.
  // Each cohort's bars normalised to its own top-of-funnel so the funnel
  // shape is visible even when absolute volumes differ wildly.
  async function fetchCohortFunnel() {
    try {
      const r = await fetch('/api/stats/cohort-funnel');
      if (!r.ok) return null;
      return await r.json();
    } catch (_) { return null; }
  }
  const COHORTS = [
    { key: 'stormboy', label: 'Stormboy', accent: '#2d6a4f' },
    { key: 'control',  label: 'Direct control', accent: '#5a6878' },
    { key: 'lawrieco', label: 'LawrieCo (carved out)', accent: '#a16207' },
  ];
  function fmtPct(p) {
    if (p == null) return '—';
    return Math.round(p * 10) / 10 + '%';
  }
  function fmtPp(pp) {
    if (pp == null) return '—';
    return (pp > 0 ? '+' : '') + (Math.round(pp * 10) / 10) + 'pp';
  }
  function deltaCls(pp) {
    if (pp == null) return 'neutral';
    if (Math.abs(pp) < 5) return 'flat';
    return pp > 0 ? 'good' : 'bad';
  }
  function cohortFunnelHtml(fn) {
    if (!fn || fn.empty) {
      return `<section class="v2-funnel-section"><div class="v2-empty">${escapeHtml(fn && fn.reason || 'No funnel data yet.')}</div></section>`;
    }
    const summary = fn.summary || {};
    const stages = fn.stages || [];
    const since = (fn.window && fn.window.since_iso || '').slice(0, 10);
    const until = (fn.window && fn.window.until_iso || '').slice(0, 10);
    const bd = fn.biggest_delta || {};

    // Headline summary row — entered → won across cohorts
    const summaryHtml = COHORTS.map(c => {
      const s = summary[c.key] || {};
      return `
        <div class="v2-funnel-summary-cell" style="border-left-color:${c.accent}">
          <div class="v2-funnel-summary-cohort">${escapeHtml(c.label)}</div>
          <div class="v2-funnel-summary-flow"><strong>${s.entered_pipeline || 0}</strong> entered → <strong>${s.reached_won || 0}</strong> won</div>
          <div class="v2-funnel-summary-rate">${fmtPct(s.total_funnel_conversion_pct)} end-to-end · ${fmtPct(s.overall_win_rate_pct)} of closed</div>
        </div>`;
    }).join('');

    // Stage rows — each row is one pipeline stage. Three columns, one per
    // cohort. Bar width is count / cohort's top-of-funnel so funnel shape
    // is visible even when absolute volumes differ wildly.
    const stageRows = stages.map((stage, idx) => {
      const cells = COHORTS.map(c => {
        const count = stage[c.key] || 0;
        const conv = stage[c.key + '_conversion_pct'];
        const top = (summary[c.key] && summary[c.key].entered_pipeline) || 1;
        const widthPct = Math.min(100, Math.max(2, (count / top) * 100));
        const isFirst = idx === 0;
        const convDisplay = isFirst
          ? '<span class="v2-funnel-cell-conv-na">top of funnel</span>'
          : `<span class="v2-funnel-cell-conv">${conv > 100 ? '↗' : '↓'} ${fmtPct(conv)}</span>`;
        return `
          <div class="v2-funnel-cell" style="--accent:${c.accent}">
            <div class="v2-funnel-cell-bar-wrap">
              <div class="v2-funnel-cell-bar" style="width:${widthPct}%;background:${c.accent}"></div>
              <span class="v2-funnel-cell-count">${count}</span>
            </div>
            ${convDisplay}
          </div>`;
      }).join('');
      // Stages with all-zero counts get muted styling
      const allZero = COHORTS.every(c => (stage[c.key] || 0) === 0);
      return `
        <div class="v2-funnel-row${allZero ? ' v2-funnel-row-empty' : ''}">
          <div class="v2-funnel-row-label">
            <span class="v2-funnel-row-name">${escapeHtml(stage.name)}</span>
            ${allZero ? '<span class="v2-funnel-row-note">stage rarely recorded</span>' : ''}
          </div>
          ${cells}
        </div>`;
    }).join('');

    // Biggest stage-delta callout — where Stormboy diverges most from control
    const bdHtml = bd && bd.stage_name
      ? `<div class="v2-funnel-callout v2-funnel-callout-${deltaCls(bd.delta_pp)}">
          <span class="v2-funnel-callout-label">Biggest Stormboy-vs-control delta</span>
          <span class="v2-funnel-callout-body">${escapeHtml(bd.stage_name)} stage conversion · Stormboy ${fmtPp(bd.delta_pp)} ${bd.delta_pp > 0 ? 'higher' : 'lower'} than control</span>
        </div>`
      : '';

    return `
      <section class="v2-funnel-section">
        <header class="v2-funnel-head">
          <h2 class="v2-funnel-title">Where does Stormboy add value in the funnel?</h2>
          <div class="v2-funnel-sub">Stage-by-stage cohort comparison · ${since} → ${until} · closed deals only. Each cohort's bars normalised to its own top-of-funnel so funnel shape is visible regardless of volume.</div>
        </header>
        <div class="v2-funnel-summary">${summaryHtml}</div>
        ${bdHtml}
        <div class="v2-funnel-grid">
          <div class="v2-funnel-grid-header">
            <div></div>
            ${COHORTS.map(c => `<div class="v2-funnel-col-header" style="color:${c.accent}">${escapeHtml(c.label)}</div>`).join('')}
          </div>
          ${stageRows}
        </div>
      </section>`;
  }

  // ====== TRAJECTORY — Section 3 of the STATS redesign ======
  // 12-week trailing win rate (line, left y-axis) and weekly hectares
  // (filled area, right y-axis) on a shared time x-axis. Vertical
  // annotation at Stormboy launch (2026-01-13) so the inflection is
  // visible. LawrieCo excluded server-side so the trajectory reflects
  // direct/Stormboy performance.
  let _trajChart = null;
  async function fetchTrajectory() {
    try {
      const r = await fetch('/api/stats/trajectory');
      if (!r.ok) return null;
      return await r.json();
    } catch (_) { return null; }
  }
  function trajectoryShellHtml(data) {
    if (!data || !data.weeks || !data.weeks.length) {
      return `<section class="v2-funnel-section"><div class="v2-empty">No trajectory data yet.</div></section>`;
    }
    const since = (data.window && data.window.since_iso || '').slice(0, 10);
    const until = (data.window && data.window.until_iso || '').slice(0, 10);
    const launch = data.stormboy_launch_date;
    // Latest non-null rolling win rate
    let latestWr = null, preLaunchWr = null;
    for (let i = data.weeks.length - 1; i >= 0; i--) {
      if (data.weeks[i].rolling_win_rate_pct != null) { latestWr = data.weeks[i]; break; }
    }
    // Pre-launch rolling win rate = the rolling value at the week before launch
    const launchIdx = data.weeks.findIndex(w => w.week_start >= launch);
    if (launchIdx > 0) {
      for (let i = launchIdx - 1; i >= 0; i--) {
        if (data.weeks[i].rolling_win_rate_pct != null) { preLaunchWr = data.weeks[i]; break; }
      }
    }
    const wrDelta = (latestWr && preLaunchWr && latestWr.rolling_win_rate_pct != null && preLaunchWr.rolling_win_rate_pct != null)
      ? Math.round((latestWr.rolling_win_rate_pct - preLaunchWr.rolling_win_rate_pct) * 10) / 10
      : null;
    // Post-launch hectares (sum of weeks on/after launch)
    const postHa = data.weeks.filter(w => w.week_start >= launch).reduce((s, w) => s + (w.hectares || 0), 0);
    const wks = data.weeks.filter(w => w.week_start >= launch).length;
    const haPerWk = wks ? Math.round(postHa / wks) : 0;

    const summary = `
      <div class="v2-funnel-summary-cell" style="border-left-color:#2d6a4f">
        <div class="v2-funnel-summary-cohort">12-week rolling win rate now</div>
        <div class="v2-funnel-summary-flow"><strong>${latestWr ? fmtPct(latestWr.rolling_win_rate_pct) : '—'}</strong> · ${latestWr ? latestWr.rolling_won + '/' + latestWr.rolling_closed : '0/0'} in window</div>
        <div class="v2-funnel-summary-rate">vs pre-launch ${preLaunchWr ? fmtPct(preLaunchWr.rolling_win_rate_pct) : '—'}${wrDelta != null ? ' · ' + fmtPp(wrDelta) : ''}</div>
      </div>
      <div class="v2-funnel-summary-cell" style="border-left-color:#5a6878">
        <div class="v2-funnel-summary-cohort">Hectares enrolled post-launch</div>
        <div class="v2-funnel-summary-flow"><strong>${Math.round(postHa).toLocaleString()}</strong> ha across ${wks} weeks</div>
        <div class="v2-funnel-summary-rate">≈ ${haPerWk.toLocaleString()} ha/week average since 13 Jan</div>
      </div>
      <div class="v2-funnel-summary-cell" style="border-left-color:#a16207">
        <div class="v2-funnel-summary-cohort">Annotation</div>
        <div class="v2-funnel-summary-flow"><strong>13 Jan 2026</strong> — Stormboy launch</div>
        <div class="v2-funnel-summary-rate">Vertical line on chart marks the inflection point</div>
      </div>`;

    return `
      <section class="v2-funnel-section">
        <header class="v2-funnel-head">
          <h2 class="v2-funnel-title">Is the trajectory bending?</h2>
          <div class="v2-funnel-sub">Trailing ${data.rolling_window_weeks}-week win rate and weekly hectares enrolled · ${since} → ${until} · LawrieCo excluded.</div>
        </header>
        <div class="v2-funnel-summary">${summary}</div>
        <div class="v2-traj-chart-wrap"><canvas id="v2-traj-chart"></canvas></div>
        <div class="v2-traj-legend">
          <span class="v2-traj-key v2-traj-key-wr">Trailing 12-wk win rate (left axis)</span>
          <span class="v2-traj-key v2-traj-key-ha">Weekly hectares enrolled (right axis)</span>
          <span class="v2-traj-key v2-traj-key-pl">Direct pipeline entries / wk (right axis)</span>
          <span class="v2-traj-key v2-traj-key-mk">— Stormboy launch (13 Jan 2026)</span>
        </div>
        <div class="v2-funnel-sub" style="margin-top:8px">${data.caveats.map(c => '· ' + escapeHtml(c)).join('<br>')}</div>
      </section>`;
  }
  function renderTrajectoryChart(data) {
    if (typeof Chart === 'undefined') return;
    const canvas = document.getElementById('v2-traj-chart');
    if (!canvas) return;
    if (_trajChart) { _trajChart.destroy(); _trajChart = null; }
    const labels = data.weeks.map(w => w.week_start);
    const wrData = data.weeks.map(w => w.rolling_win_rate_pct);
    const haData = data.weeks.map(w => Math.round(w.hectares || 0));
    const plData = data.weeks.map(w => w.direct_pipeline_entries || 0);
    const launchIdx = data.weeks.findIndex(w => w.week_start >= data.stormboy_launch_date);
    const launchLabel = launchIdx >= 0 ? labels[launchIdx] : null;
    _trajChart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '12-wk win rate %',
            data: wrData, yAxisID: 'y',
            borderColor: '#2d6a4f', backgroundColor: 'rgba(45,106,79,0.12)',
            tension: 0.25, borderWidth: 2.4, pointRadius: 0, pointHoverRadius: 4,
            spanGaps: true, order: 1,
          },
          {
            label: 'Hectares enrolled / wk',
            data: haData, yAxisID: 'y1',
            type: 'bar', backgroundColor: 'rgba(90,104,120,0.55)',
            borderColor: 'rgba(90,104,120,0.55)', borderWidth: 0,
            order: 3,
          },
          {
            label: 'Direct pipeline entries / wk',
            data: plData, yAxisID: 'y1',
            type: 'line', borderColor: '#a16207', backgroundColor: 'rgba(161,98,7,0.12)',
            borderDash: [4, 3], tension: 0.2, borderWidth: 1.6, pointRadius: 0,
            order: 2,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const v = ctx.parsed.y;
                if (v == null) return ctx.dataset.label + ': —';
                if (ctx.dataset.label.includes('win rate')) return `Win rate (rolling): ${v}%`;
                if (ctx.dataset.label.includes('Hectares')) return `Hectares: ${v.toLocaleString()} ha`;
                return `Pipeline entries: ${v}`;
              },
            },
          },
          annotation: {},
        },
        scales: {
          x: {
            ticks: { maxTicksLimit: 10, autoSkip: true, color: '#6a6a5a', font: { size: 10 } },
            grid: { display: false },
          },
          y: {
            position: 'left',
            min: 0, max: 100,
            ticks: { callback: (v) => v + '%', color: '#2d6a4f', font: { size: 10 } },
            grid: { color: '#f0eedb' },
            title: { display: true, text: 'Win rate', color: '#2d6a4f', font: { size: 10 } },
          },
          y1: {
            position: 'right',
            min: 0,
            ticks: { color: '#5a6878', font: { size: 10 } },
            grid: { drawOnChartArea: false },
            title: { display: true, text: 'ha / entries', color: '#5a6878', font: { size: 10 } },
          },
        },
      },
      plugins: launchLabel ? [{
        id: 'launchLine',
        afterDraw: (chart) => {
          const x = chart.scales.x.getPixelForValue(launchLabel);
          if (x == null || Number.isNaN(x)) return;
          const top = chart.chartArea.top, bot = chart.chartArea.bottom;
          const ctx = chart.ctx;
          ctx.save();
          ctx.strokeStyle = '#c44'; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bot); ctx.stroke();
          ctx.fillStyle = '#c44'; ctx.font = '10px system-ui'; ctx.textAlign = 'left';
          ctx.fillText('Stormboy launch', x + 4, top + 12);
          ctx.restore();
        },
      }] : [],
    });
  }

  // ====== EVIDENCE CARDS — Section 4 of the STATS redesign ======
  // Reads /api/stats/evidence-cards which scans shared-growth-memory/patterns/
  // for the team's distilled tactical patterns. Each card cites its
  // source pattern file so claims are traceable.
  async function fetchEvidenceCards() {
    try {
      const r = await fetch('/api/stats/evidence-cards');
      if (!r.ok) return null;
      return await r.json();
    } catch (_) { return null; }
  }
  function categoryLabel(cat) {
    const m = {
      tactical_framing: 'Tactical framing',
      strategic_finding: 'Strategic finding',
      tactical_play: 'Tactical play',
    };
    return m[cat] || (cat || 'pattern').replace(/_/g, ' ');
  }
  function evidenceCardsHtml(ev) {
    if (!ev || !ev.cards || !ev.cards.length) {
      return `<section class="v2-evid-section"><header class="v2-funnel-head">
        <h2 class="v2-funnel-title">What's working in conversation?</h2>
        <div class="v2-funnel-sub">No patterns in <code>shared-growth-memory/patterns/</code> yet.</div>
      </header></section>`;
    }
    const cards = ev.cards.map(c => `
      <article class="v2-evid-card" style="border-left-color:${c.accent}">
        <div class="v2-evid-card-h">
          <h3 class="v2-evid-title">${escapeHtml(c.title)}</h3>
          <span class="v2-evid-tag" style="color:${c.accent}">${escapeHtml(categoryLabel(c.category))}</span>
        </div>
        <div class="v2-evid-body">${escapeHtml(c.headline_evidence || c.body_preview || '')}</div>
        <div class="v2-evid-foot">
          confidence ${escapeHtml(c.confidence)} · ${c.applicability_count} applicability case${c.applicability_count === 1 ? '' : 's'} ·
          <code>patterns/${escapeHtml(c.source_file)}</code>
        </div>
      </article>`).join('');
    return `
      <section class="v2-evid-section">
        <header class="v2-funnel-head">
          <h2 class="v2-funnel-title">What's working in conversation?</h2>
          <div class="v2-funnel-sub">Tactical patterns distilled from farm-visit transcripts, standup notes, and HubSpot loss data. Each card cites the source file in <code>shared-growth-memory/patterns/</code> — the team can read the full pattern there.</div>
        </header>
        <div class="v2-evid-grid">${cards}</div>
      </section>`;
  }

  // ====== 30K HECTARE PROJECTION — Section 5 of the STATS redesign ======
  // Reads /api/stats/projection. Renders a ring (registered vs target)
  // and four side stats: registered/remaining/short pace/long pace, with
  // projected hit-dates. Honest about the spread between short & long.
  async function fetchProjection() {
    try {
      const r = await fetch('/api/stats/projection');
      if (!r.ok) return null;
      return await r.json();
    } catch (_) { return null; }
  }
  function fmtDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  function projectionHtml(pj) {
    if (!pj || pj.empty) {
      return `<section class="v2-proj-section"><div class="v2-empty">No projection yet — needs trajectory data.</div></section>`;
    }
    const pct = Math.min(100, Math.max(0, pj.pct_of_target || 0));
    const sweep = (pct / 100) * (Math.PI * 2);
    const cx = 120, cy = 120, r = 96;
    // SVG arc — start at top, sweep clockwise
    const startX = cx, startY = cy - r;
    const endX = cx + Math.sin(sweep) * r;
    const endY = cy - Math.cos(sweep) * r;
    const largeArc = sweep > Math.PI ? 1 : 0;
    const arcPath = pct >= 100
      ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
      : `M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`;
    const short = pj.pace.short_window_weekly_ha;
    const long = pj.pace.long_window_weekly_ha;
    const needed = pj.pace.needed_weekly_ha_by_fy_end;
    const shortEta = pj.projection.at_short_pace.eta;
    const longEta  = pj.projection.at_long_pace.eta;
    const sinceEta = pj.projection.at_since_anchor_pace.eta;

    function paceTone(pace) {
      if (!pace) return 'bad';
      if (pace >= needed) return 'good';
      if (pace >= needed * 0.5) return 'flat';
      return 'bad';
    }

    return `
      <section class="v2-proj-section">
        <header class="v2-funnel-head">
          <h2 class="v2-funnel-title">Will we hit 30k?</h2>
          <div class="v2-funnel-sub">Hectares registered since ${escapeHtml(pj.target_set_date)} (target-set anchor) vs 30,000 ha goal · LawrieCo excluded so this reflects direct/Stormboy pace specifically (header tile shows all-channel; values can differ).</div>
        </header>
        <div class="v2-proj-layout">
          <div class="v2-proj-ring-wrap">
            <svg viewBox="0 0 240 240" width="240" height="240">
              <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#ece8cd" stroke-width="14" />
              <path d="${arcPath}" fill="none" stroke="#2d6a4f" stroke-width="14" stroke-linecap="round" />
            </svg>
            <div class="v2-proj-ring-center">
              <div class="v2-proj-pct">${pct.toFixed(1)}%</div>
              <div class="v2-proj-pct-sub">${(pj.registered_hectares || 0).toLocaleString()} / ${pj.target_hectares.toLocaleString()} ha</div>
            </div>
          </div>
          <div class="v2-proj-stats">
            <div class="v2-proj-stat">
              <div class="v2-proj-stat-label">Remaining</div>
              <div class="v2-proj-stat-val">${(pj.remaining_hectares || 0).toLocaleString()} ha</div>
              <div class="v2-proj-stat-sub">to 30k target</div>
            </div>
            <div class="v2-proj-stat">
              <div class="v2-proj-stat-label">Needed by 30 Jun</div>
              <div class="v2-proj-stat-val">${needed.toLocaleString()} ha/wk</div>
              <div class="v2-proj-stat-sub">FY26 stretch pace</div>
            </div>
            <div class="v2-proj-stat">
              <div class="v2-proj-stat-label">${pj.pace.short_window_weeks}-week pace</div>
              <div class="v2-proj-stat-val ${paceTone(short)}">${short.toLocaleString()} ha/wk</div>
              <div class="v2-proj-stat-sub">ETA at this pace: ${fmtDate(shortEta)}</div>
            </div>
            <div class="v2-proj-stat">
              <div class="v2-proj-stat-label">${pj.pace.long_window_weeks}-week pace</div>
              <div class="v2-proj-stat-val ${paceTone(long)}">${long.toLocaleString()} ha/wk</div>
              <div class="v2-proj-stat-sub">ETA at this pace: ${fmtDate(longEta)}</div>
            </div>
          </div>
        </div>
        <div class="v2-funnel-sub" style="margin-top:14px">
          Since-anchor pace: <strong>${pj.pace.since_anchor_weekly_ha} ha/wk</strong> across ${pj.weeks_since_anchor} weeks · projected hit at this rate: <strong>${fmtDate(sinceEta)}</strong><br>
          ${pj.caveats.map(c => '· ' + escapeHtml(c)).join('<br>')}
        </div>
      </section>`;
  }

  async function render(container) {
    container.innerHTML = `
      <div id="stats-efficacy"><div class="v2-loading" style="padding:24px">Loading efficacy comparison…</div></div>
      <div id="stats-funnel"><div class="v2-loading" style="padding:24px">Loading cohort funnel…</div></div>
      <div id="stats-trajectory"><div class="v2-loading" style="padding:24px">Loading trajectory…</div></div>
      <div id="stats-evidence"><div class="v2-loading" style="padding:24px">Loading tactical evidence…</div></div>
      <div id="stats-projection"><div class="v2-loading" style="padding:24px">Loading 30k projection…</div></div>
      <div class="v2-section-header" style="margin-top:24px">
        <h2 class="v2-section-title">Detail · process refinement</h2>
        <p class="v2-section-sub">drill-downs by sub-tab — kept for cohort breakdowns; the redesigned story above is the primary view.</p>
      </div>
      <div id="stats-content"><div class="v2-loading">Loading from HubSpot…</div></div>`;
    // Hero + funnel + trajectory + evidence + projection all load in parallel with detail
    fetchEfficacy().then(eff => {
      document.getElementById('stats-efficacy').innerHTML = efficacyHeroHtml(eff);
    });
    fetchCohortFunnel().then(fn => {
      document.getElementById('stats-funnel').innerHTML = cohortFunnelHtml(fn);
    });
    fetchTrajectory().then(tr => {
      const slot = document.getElementById('stats-trajectory');
      if (!slot) return;
      slot.innerHTML = trajectoryShellHtml(tr);
      if (tr && tr.weeks && tr.weeks.length) renderTrajectoryChart(tr);
    });
    fetchEvidenceCards().then(ev => {
      const slot = document.getElementById('stats-evidence');
      if (slot) slot.innerHTML = evidenceCardsHtml(ev);
    });
    fetchProjection().then(pj => {
      const slot = document.getElementById('stats-projection');
      if (slot) slot.innerHTML = projectionHtml(pj);
    });
    try {
      const res = await fetch('/api/stats/pipeline');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      _data = await res.json();
      document.getElementById('stats-content').innerHTML = `
        <div class="v2-stats-layout">
          <nav class="v2-stats-vnav">
            ${SUBTABS.map(t => `<button class="v2-stats-vtab" data-tab="${t.key}"><div class="v2-stats-vtab-label">${escapeHtml(t.label)}</div><div class="v2-stats-vtab-hint">${escapeHtml(t.hint)}</div></button>`).join('')}
          </nav>
          <div class="v2-stats-pane" id="stats-pane"></div>
        </div>
        <div class="v2-stats-footer">Generated ${new Date(_data.generated_at).toLocaleString()} · Lifetime: ${_data.totals.all_won_lifetime} registered / ${_data.totals.all_lost_lifetime} not progressed / ${_data.totals.open_deals} open</div>`;
      document.querySelectorAll('.v2-stats-vtab').forEach(t => t.addEventListener('click', () => activateSubtab(t.dataset.tab)));
      await activateSubtab('overview');
    } catch (e) {
      document.getElementById('stats-content').innerHTML = `<div class="v2-empty" style="color:#a64545">Stats failed: ${escapeHtml(e.message)}</div>`;
    }
  }

  v2Shell.register('stats', render);
})();
