/**
 * v2 HEALTH tab — at-a-glance answer to "is this thing learning?".
 *
 * Five widgets, each rendered from /api/system/health (single fetch):
 *  1. Apex heartbeat — is the daily-enrichment cron alive?
 *  2. Supplements — write volume across today / week / month
 *  3. Patterns — count by confidence + cross-confirmed count
 *  4. Probes — total / open / closed / populated rate
 *  5. Heuristic drift — how often the dashboard's next-step heuristic was wrong
 *
 * The point isn't analytical depth — it's "if any number stops moving, the
 * system has a specific named problem to fix instead of a vague feeling
 * that nothing is happening".
 */
(function() {
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  function formatAge(secs) {
    if (secs == null) return '—';
    if (secs < 60) return secs + 's';
    if (secs < 3600) return Math.round(secs / 60) + 'm';
    if (secs < 86400) return Math.round(secs / 3600) + 'h';
    return Math.round(secs / 86400) + 'd';
  }

  function statusDot(ok, warn) {
    const cls = ok ? 'ok' : warn ? 'warn' : 'bad';
    return `<span class="v2-health-dot ${cls}"></span>`;
  }

  function apexWidget(apex) {
    if (!apex || apex.ok === false) {
      return `
        <div class="v2-health-card status-bad">
          <div class="v2-health-card-head">${statusDot(false)} Apex heartbeat</div>
          <div class="v2-health-card-big">Not yet logged</div>
          <div class="v2-health-card-sub">${escapeHtml(apex && apex.reason || 'apex-runs.log absent')}</div>
        </div>`;
    }
    const ageHours = apex.age_seconds != null ? apex.age_seconds / 3600 : null;
    const fresh = ageHours != null && ageHours < 36;
    const cls = fresh ? 'status-ok' : 'status-warn';
    const ageLabel = ageHours == null ? '—' : (ageHours < 1 ? Math.round(apex.age_seconds / 60) + 'm ago' : Math.round(ageHours) + 'h ago');
    const counts = apex.counts || {};
    const countSummary = Object.keys(counts).slice(0, 6).map(k => `${escapeHtml(k)}=${counts[k]}`).join(' · ') || '(no counts)';
    return `
      <div class="v2-health-card ${cls}">
        <div class="v2-health-card-head">${statusDot(fresh, !fresh)} Apex heartbeat</div>
        <div class="v2-health-card-big">${escapeHtml(apex.run_type || 'unknown')} · ${ageLabel}</div>
        <div class="v2-health-card-sub">last: ${escapeHtml(apex.last_run || '—')} · total runs: ${apex.total_runs_logged || 0}</div>
        <div class="v2-health-card-meta">${countSummary}</div>
      </div>`;
  }

  function supplementsWidget(s) {
    if (!s) return '';
    const fresh = s.today > 0;
    const cls = fresh ? 'status-ok' : (s.week > 0 ? 'status-warn' : 'status-bad');
    const sources = Object.entries(s.by_source || {})
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `<span class="v2-health-pill">${escapeHtml(k)}: ${v}</span>`)
      .join('');
    return `
      <div class="v2-health-card ${cls}">
        <div class="v2-health-card-head">${statusDot(fresh, s.week > 0)} Supplements written</div>
        <div class="v2-health-card-big">${s.today} today</div>
        <div class="v2-health-card-sub">${s.week} this week · ${s.month} last 30d · totals: contact=${s.contact} deal=${s.deal} persona=${s.persona}</div>
        <div class="v2-health-card-meta">${sources || '(no source breakdown)'}</div>
      </div>`;
  }

  function patternsWidget(p) {
    if (!p) return '';
    const cls = p.cross_confirmed > 0 ? 'status-ok' : p.total > 0 ? 'status-warn' : 'status-bad';
    const conf = p.by_confidence || {};
    const recent = (p.recent || []).map(r => `
      <li class="v2-health-list-item">
        <span class="v2-health-pill conf-${r.confidence}">${r.confidence}</span>
        ${escapeHtml(r.title)} · ${r.age_days}d ago · in: ${(r.systems || []).join(', ') || 'one system'}
      </li>`).join('');
    return `
      <div class="v2-health-card ${cls}">
        <div class="v2-health-card-head">${statusDot(p.cross_confirmed > 0, p.total > 0)} Patterns</div>
        <div class="v2-health-card-big">${p.total} · <span class="v2-health-soft">${p.cross_confirmed} cross-confirmed</span></div>
        <div class="v2-health-card-sub">low: ${conf.low || 0} · moderate: ${conf.moderate || 0} · high: ${conf.high || 0} · archived: ${p.archived || 0}</div>
        ${recent ? `<ul class="v2-health-list">${recent}</ul>` : ''}
      </div>`;
  }

  function probesWidget(pr) {
    if (!pr) return '';
    const rate = pr.populated_rate == null ? null : Math.round(pr.populated_rate * 100);
    const cls = pr.total === 0 ? 'status-bad' : rate >= 70 ? 'status-ok' : rate >= 40 ? 'status-warn' : 'status-bad';
    const outcomes = Object.entries(pr.outcome_mix || {})
      .map(([k, v]) => `<span class="v2-health-pill">${escapeHtml(k)}: ${v}</span>`).join('');
    return `
      <div class="v2-health-card ${cls}">
        <div class="v2-health-card-head">${statusDot(rate >= 70, rate >= 40)} Probe loop closure</div>
        <div class="v2-health-card-big">${rate == null ? '—' : rate + '%'} <span class="v2-health-soft">populated</span></div>
        <div class="v2-health-card-sub">${pr.total} total · ${pr.open} open · ${pr.closed} closed</div>
        <div class="v2-health-card-meta">${outcomes || '(no outcome mix yet)'}</div>
        <div class="v2-health-target">Target: ≥70% within 30 days · gap to target: ${rate == null ? '—' : Math.max(0, 70 - rate) + 'pp'}</div>
      </div>`;
  }

  function attributionWidget(a) {
    if (!a || !a.cohorts) return '';
    const inv = a.cohorts.involved;
    const not = a.cohorts.not_involved;
    const baseline = a.baseline;
    const cls = baseline ? 'status-ok' : a.sample.not_involved < 5 ? 'status-warn' : 'status-ok';
    const compareRow = (label, invVal, notVal) => `
      <div class="v2-health-cmp-row">
        <span class="v2-health-cmp-label">${label}</span>
        <span class="v2-health-cmp-val">${invVal == null ? '—' : invVal}</span>
        <span class="v2-health-cmp-vs">vs</span>
        <span class="v2-health-cmp-val">${notVal == null ? '—' : notVal}</span>
      </div>`;
    const baselineBlock = baseline ? `
      <div class="v2-health-baseline">
        <div class="v2-health-baseline-head">Historical baseline (pre-system control)</div>
        <div class="v2-health-baseline-row">
          <span>${baseline.sample.total_closed} closed deals</span>
          <span>·</span>
          <span><strong>${baseline.sample.win_rate_pct}%</strong> win rate</span>
          <span>·</span>
          <span>median ${baseline.median_days_to_close_won}d to win</span>
        </div>
        <div class="v2-health-baseline-period">${baseline.period.since_iso.slice(0,10)} → ${baseline.period.until_iso.slice(0,10)} · ${baseline.period.days}d window</div>
      </div>
      ` : `
      <div class="v2-health-baseline-cta">No historical baseline yet · <code>POST /api/system/backfill-baseline</code> to generate one</div>
    `;
    return `
      <div class="v2-health-card ${cls}">
        <div class="v2-health-card-head">${statusDot(!!baseline, true)} Outcome attribution</div>
        <div class="v2-health-card-big">${inv.count} <span class="v2-health-soft">vs ${not.count}</span></div>
        <div class="v2-health-card-sub">involved · vs not-involved (of ${a.sample.active_deals_in_working_set} active deals)</div>
        ${compareRow('Mean risk score',  inv.mean_risk_score,  not.mean_risk_score)}
        ${compareRow('Mean days in stage', inv.mean_days_in_stage, not.mean_days_in_stage)}
        ${baselineBlock}
        <div class="v2-health-target">${escapeHtml(a.sample.caveat || a.methodology_note)}</div>
      </div>`;
  }

  function heuristicWidget(h) {
    if (!h) return '';
    const rate = h.rate == null ? null : Math.round(h.rate * 100);
    const cls = h.total === 0 ? 'status-warn' : rate <= 30 ? 'status-ok' : rate <= 60 ? 'status-warn' : 'status-bad';
    return `
      <div class="v2-health-card ${cls}">
        <div class="v2-health-card-head">${statusDot(rate <= 30, rate <= 60)} Heuristic drift</div>
        <div class="v2-health-card-big">${rate == null ? '—' : rate + '%'} <span class="v2-health-soft">wrong</span></div>
        <div class="v2-health-card-sub">${h.wrong} of ${h.total} diagnoses flagged heuristic_was_wrong</div>
        <div class="v2-health-target">Watch this trend month-on-month. Rising = next-step rules drifting from reality.</div>
      </div>`;
  }

  async function render(container) {
    container.innerHTML = `
      <div class="v2-health-wrap">
        <div class="v2-health-head">
          <h2>System health</h2>
          <div class="v2-health-sub">Is this thing learning? Five signals — if any one stalls, the system has a specific named problem.</div>
        </div>
        <div class="v2-health-grid" id="health-grid"><div class="v2-empty">Loading…</div></div>
        <div class="v2-health-bus" id="health-bus"></div>
      </div>`;
    try {
      const [hRes, aRes] = await Promise.all([
        fetch('/api/system/health'),
        fetch('/api/system/outcome-attribution').catch(() => null),
      ]);
      if (!hRes.ok) throw new Error('HTTP ' + hRes.status);
      const h = await hRes.json();
      const a = (aRes && aRes.ok) ? await aRes.json() : null;
      const grid = document.getElementById('health-grid');
      grid.innerHTML = [
        apexWidget(h.apex),
        supplementsWidget(h.supplements),
        patternsWidget(h.patterns),
        probesWidget(h.probes),
        heuristicWidget(h.heuristic_errors),
        attributionWidget(a),
      ].filter(Boolean).join('');
      const bus = document.getElementById('health-bus');
      bus.innerHTML = `
        <div class="v2-health-buspath">
          <strong>Bus location</strong> · ${escapeHtml(h.bus.canonical_path)}
          · ${h.bus.reachable ? '<span style="color:#3a6b3a">reachable ✓</span>' : '<span style="color:#a64545">unreachable ✗</span>'}
          · snapshot generated ${escapeHtml(h.generated_at)}
        </div>`;
    } catch (e) {
      document.getElementById('health-grid').innerHTML = `<div class="v2-empty" style="color:#a64545">Health failed: ${escapeHtml(e.message)}</div>`;
    }
  }

  v2Shell.register('health', render);
})();
