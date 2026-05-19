/**
 * v2 WORK tab: main content + sticky right-rail.
 *
 * Layout:
 *   Right rail (sticky): Upcoming farm visits — next major milestones
 *   Main column:
 *     Today's three exemplars
 *     Stream 1 (Motion 2) — Existing deals · re-engage warm pipeline
 *     Stream 2 (Motion 1) — Storm Boy · recruitment outreach
 *       1. Funnel breakdown
 *       2. Farm visits completed (linchpin: pursue vs disengage)
 *       3. Call queue (stalled in conversation)
 *     Foot: Recent wins + Probes waiting (cross-motion)
 *
 * Two-motion separation is enforced — see shared-growth-memory/sales-motion-separation.md.
 */
(function() {
  // Owner-id → display name. Phase 2: load from /api/owners or HubSpot.
  const OWNER_NAMES = {
    '145644281': 'Harrison (inactive)',
    '361236574': 'Hobbs',
    '76812243': 'Ben',
    '78272376': 'Claudia',
    '50488404': 'Dylan',
  };
  function ownerName(id) {
    return OWNER_NAMES[String(id)] || '—';
  }
  const STAGE_PILL = {
    'KCT Issued':       { cls: 'kct',       short: 'KCT' },
    'Strategy Call':    { cls: 'strategy',  short: 'Strategy' },
    'SLA/KCT Mapping':  { cls: 'kct',       short: 'Mapping' },
    'Qualified Account':{ cls: 'qualified', short: 'Qualified' },
    'Discovery Call':   { cls: 'qualified', short: 'Discovery' },
  };

  function pill(stage) {
    const p = STAGE_PILL[stage] || { cls: '', short: stage };
    return `<span class="v2-pill ${p.cls}">${p.short}</span>`;
  }

  function riskBadge(cls, score) {
    return `<span class="risk-badge ${cls}">${cls} · ${score}</span>`;
  }

  function dealCard(d) {
    const cls = d.risk_class || 'amber';
    const score = d.risk_score || 50;
    return `
      <div class="v2-deal-card risk-${cls}">
        <div class="deal-head">
          <div>
            <div class="deal-name">${d.deal_name}</div>
            <div class="deal-meta">${pill(d.current_stage)} · ${d.days_in_current_stage}d in stage · ${d.attribution || 'direct'}</div>
          </div>
          ${riskBadge(cls, score)}
        </div>
        ${d.coaching_message ? `<div class="coaching">${d.coaching_message}</div>` : ''}
        <div class="actions">
          <button class="primary" onclick="alert('Email draft action — to wire')">Draft email</button>
          <button onclick="alert('Probe action — to wire')">Send probe</button>
          <button onclick="alert('Mark engaged — to wire')">Mark engaged</button>
          <button onclick="alert('Defer 7d — to wire')">Defer 7d</button>
        </div>
      </div>
    `;
  }

  // "What's new" badge — for each rendered deal card, fetch its supplement
  // listing and, if Apex wrote something in the last 14 days, inject a small
  // pill into the collapsed header summarising the sources + recency. Runs
  // post-render; cards stay interactive throughout.
  const RECENT_SUPPLEMENT_WINDOW_DAYS = 14;
  const SUPPLEMENT_LABEL_FOR_BADGE = {
    'aircall-transcript': 'Aircall',
    'farm-visit-transcript': 'Farm visit',
    'outlook-email': 'Outlook',
    'teams-message': 'Teams',
    'granola-meeting': 'Granola',
    'hubspot-snapshot': 'HubSpot snap',
  };
  function formatAge(ms) {
    const hours = ms / (1000 * 60 * 60);
    if (hours < 1) return 'just now';
    if (hours < 24) return `${Math.round(hours)}h ago`;
    const days = Math.round(hours / 24);
    return `${days}d ago`;
  }
  async function augmentWithSupplementBadges(exemplars) {
    const cutoffMs = Date.now() - RECENT_SUPPLEMENT_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    await Promise.all(exemplars.map(async ex => {
      if (ex.lookup_type !== 'deal' || !ex.lookup_id) return;
      try {
        const r = await fetch(`/api/work/deal-supplements/${encodeURIComponent(ex.lookup_id)}`);
        if (!r.ok) return;
        const data = await r.json();
        if (!data.files || !data.files.length) return;
        const recent = data.files.filter(f => Date.parse(f.mtime) >= cutoffMs);
        if (!recent.length) return;
        const sources = Array.from(new Set(recent.map(f => SUPPLEMENT_LABEL_FOR_BADGE[f.type] || 'Apex')));
        const newest = recent.reduce((a, b) => Date.parse(a.mtime) >= Date.parse(b.mtime) ? a : b);
        const age = formatAge(Date.now() - Date.parse(newest.mtime));
        const cardEl = document.querySelector(`.v2-ex-card[data-ex="${ex.id}"]`);
        if (!cardEl) return;
        const head = cardEl.querySelector('.v2-ex-collapsed-head');
        if (!head || head.querySelector('.v2-ex-fresh-badge')) return;
        const badge = document.createElement('span');
        badge.className = 'v2-ex-fresh-badge';
        badge.title = `${recent.length} new file(s) from Apex daily enrichment in the last ${RECENT_SUPPLEMENT_WINDOW_DAYS} days`;
        badge.textContent = `↗ ${sources.join(' + ')} · ${age}`;
        head.appendChild(badge);
      } catch (_) { /* swallow; this is a best-effort enhancement */ }
    }));
  }

  async function fetchActive() {
    const res = await fetch('/api/coaching/active');
    if (!res.ok) throw new Error('coaching/active failed: ' + res.status);
    return res.json();
  }

  async function fetchDealDiagnoses() {
    const res = await fetch('/api/work/deal-diagnoses');
    if (!res.ok) return { deals: {} };
    return res.json();
  }

  async function fetchDiagnoseJob() {
    try {
      const res = await fetch('/api/work/diagnose-job');
      if (!res.ok) return null;
      return res.json();
    } catch (_) { return null; }
  }

  // Convert an active-deal record (+ optional cached diagnosis) into the
  // exemplar shape that v2Exemplar.renderCard expects. Falls back gracefully
  // when no diagnosis is cached yet.
  function dealToExemplar(d, dx) {
    const heat = d.risk_class === 'red' ? 'HOT' : d.risk_class === 'amber' ? 'WARM' : 'COLD';
    const id = 'deal-' + d.deal_id;
    return {
      id,
      kind: 'stuck_deal',
      lookup_type: 'deal',
      lookup_id: d.deal_id,
      hubspot_id: d.deal_id,
      hubspot_url: `https://app.hubspot.com/contacts/24224559/record/0-3/${d.deal_id}`,
      title: d.deal_name,
      subtitle: `${d.current_stage} · ${d.days_in_current_stage}d in stage · attribution: ${d.attribution || 'direct'} · risk ${d.risk_score}`,
      heat,
      assigned_to_id: '',
      assigned_to_name: '',
      next_step_short: dx ? dx.next_step_short : null,
      next_step_qualifier: dx ? dx.next_step_qualifier : null,
      diagnosis: dx ? dx.diagnosis : null,
      diagnosis_pending: !dx,
      counterfactual: null,
      evidence: [
        {
          source: 'Stage-friction baseline',
          content: `Median time-to-close at this stage: won=${d.median_won_at_stage}d, lost=${d.median_lost_at_stage}d. Current dwell: ${d.days_in_current_stage}d. Risk class: ${d.risk_class} (${d.risk_score}).`,
        },
      ],
      draft: d.enablement && d.enablement.inline_draft ? {
        kind: d.enablement.inline_draft.type || 'email',
        label: 'Inline draft from coaching pipeline',
        subject: d.enablement.inline_draft.subject,
        body: d.enablement.inline_draft.body,
      } : null,
      one_question: dx && dx.diagnosis_assessment === 'next_step_revised'
        ? 'The system revised the next-step from the heuristic. Read the diagnosis before acting.'
        : null,
      actions: [
        { label: 'Open in HubSpot', type: 'open_url', payload: `https://app.hubspot.com/contacts/24224559/record/0-3/${d.deal_id}` },
      ],
      diagnosis_metadata: dx ? {
        regenerated_at: dx.regenerated_at,
        assessment: dx.diagnosis_assessment,
        timeline_used: dx.timeline_used,
      } : null,
    };
  }

  async function fetchStormboy() {
    const res = await fetch('/api/stormboy/summary');
    if (!res.ok) throw new Error('stormboy/summary failed: ' + res.status);
    return res.json();
  }

  async function fetchStormboyDetail(stage) {
    const res = await fetch('/api/stormboy/detail?stage=' + encodeURIComponent(stage));
    if (!res.ok) throw new Error('stormboy/detail failed: ' + res.status);
    return res.json();
  }

  async function fetchContactDiagnoses() {
    try {
      const res = await fetch('/api/work/contact-diagnoses');
      if (!res.ok) return { contacts: {} };
      return res.json();
    } catch (_) { return { contacts: {} }; }
  }

  async function fetchRecentWins() {
    const res = await fetch('/api/work/recent-wins');
    if (!res.ok) throw new Error('recent wins fetch failed: ' + res.status);
    return res.json();
  }

  function channelBadge(w) {
    if (w.partner) return `<span class="v2-win-channel via-partner">via ${escapeHtml(w.partner)}</span>`;
    if (w.lead_source === 'Storm Boy') return `<span class="v2-win-channel via-stormboy">Storm Boy</span>`;
    return `<span class="v2-win-channel via-direct">direct</span>`;
  }
  function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function confidenceBadge(conf) {
    const c = (conf || 'moderate').toLowerCase();
    return `<span class="v2-win-conf conf-${c}" title="LLM confidence in this analysis based on timeline depth">${c} confidence</span>`;
  }
  function channelChips(w) {
    const ch = w.channel || {};
    const chips = [];
    if (ch.stormboy) chips.push('<span class="v2-win-chip chip-stormboy">Stormboy</span>');
    if (ch.partner) chips.push(`<span class="v2-win-chip chip-partner">${escapeHtml(ch.partner)}</span>`);
    if (!ch.stormboy && !ch.partner) chips.push('<span class="v2-win-chip chip-direct">direct</span>');
    return chips.join('');
  }

  function winRow(w) {
    const a = w.analysis || {};
    const ha = w.estimated_project_ha || w.total_property_hectares;
    const haStr = ha ? `${Math.round(ha).toLocaleString()}ha` : '—';
    const closedDate = w.closedate ? new Date(w.closedate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : '—';
    const bullets = (a.replicable_pattern || []).map(p => `<li>${escapeHtml(p)}</li>`).join('');
    const dayBadgeClass = w.days_to_close !== null && w.days_to_close <= 60 ? 'date-soon' : '';
    const rowStormboyClass = w.channel && w.channel.stormboy ? 'v2-win-row-stormboy' : '';
    return `
      <div class="v2-milestone-row v2-win-row ${rowStormboyClass}" data-wid="${w.deal_id}" onclick="v2WorkExpandWin('${w.deal_id}', event)">
        <div class="v2-milestone-date ${dayBadgeClass}">${w.days_to_close ?? '—'}d</div>
        <div class="v2-milestone-body">
          <div class="v2-milestone-name">${escapeHtml(w.deal_name || '(no name)')}</div>
          <div class="v2-win-row-chips">${channelChips(w)}</div>
          <div class="v2-milestone-meta">${haStr} · closed ${closedDate}</div>
        </div>
        <a href="${w.hubspot_url}" target="_blank" class="v2-milestone-link" title="Open in HubSpot" onclick="event.stopPropagation()">↗</a>
      </div>
      <div class="v2-milestone-drawer v2-win-drawer">
        <div class="v2-win-drawer-why">
          <div class="v2-win-drawer-why-label">Why this won</div>
          <div class="v2-win-drawer-why-body">${escapeHtml(a.one_line_why || '(no analysis on file)')}</div>
        </div>
        ${bullets ? `
          <div class="v2-win-drawer-section">
            <div class="v2-win-drawer-section-label">How to replicate</div>
            <ul class="v2-win-drawer-pattern">${bullets}</ul>
          </div>` : ''}
        ${a.key_moment ? `<div class="v2-win-drawer-moment"><span class="v2-win-drawer-moment-label">Key moment</span>${escapeHtml(a.key_moment)}</div>` : ''}
        <div class="v2-win-drawer-foot">
          ${confidenceBadge(a.confidence)}
          <a href="${w.hubspot_url}" target="_blank" class="v2-win-drawer-link">Open in HubSpot →</a>
        </div>
      </div>`;
  }

  function expandWin(dealId, ev) {
    if (ev) ev.stopPropagation();
    const row = document.querySelector(`.v2-win-row[data-wid="${dealId}"]`);
    if (!row) return;
    const drawer = row.nextElementSibling;
    if (!drawer || !drawer.classList.contains('v2-win-drawer')) return;
    drawer.classList.toggle('open');
    row.classList.toggle('v2-win-row-open');
  }
  window.v2WorkExpandWin = expandWin;

  function daysBetween(a, b) {
    if (!a || !b) return null;
    return Math.round((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));
  }

  // ===========================================================================
  // Storm Boy funnel
  // ===========================================================================

  function sbFunnelRow(stage, count, max) {
    const pct = max ? (count / max) * 100 : 0;
    const w = Math.max(2, pct);
    return `
      <div style="display:flex;align-items:center;gap:10px;padding:5px 0;font-size:12px">
        <div style="min-width:140px;color:#555">${stage}</div>
        <div style="flex:1;height:10px;background:#f0efe7;border-radius:5px;overflow:hidden">
          <div style="height:100%;width:${w}%;background:#5e8a5c;border-radius:5px"></div>
        </div>
        <div style="min-width:38px;text-align:right;font-family:'SF Mono',Menlo,monospace;font-weight:600">${count}</div>
      </div>
    `;
  }

  // ===========================================================================
  // Synthesis card (Farm visits completed) — the linchpin
  // ===========================================================================

  function heatBadge(heat) {
    const map = {
      HOT:  { cls: 'hot',  icon: '🔥', label: 'HOT · pursue' },
      WARM: { cls: 'warm', icon: '🟡', label: 'WARM · nurture' },
      COLD: { cls: 'cold', icon: '❄️', label: 'COLD · decide' },
    };
    const h = map[heat] || map.WARM;
    return `<span class="v2-heat ${h.cls}">${h.icon} ${h.label}</span>`;
  }

  function callDistillateBlock(d) {
    if (!d) return '';
    const topics = (d.top_topics || []).map(t => `
      <div style="margin-top:6px;padding:8px 10px;background:#fbfaf3;border-left:2px solid #d4cba2;border-radius:0 3px 3px 0;font-size:12px">
        <div style="font-weight:600;color:#5a5240;margin-bottom:3px">${t.topic}</div>
        <div style="color:#666;margin-bottom:2px"><strong style="color:#555">Customer:</strong> ${t.customer_position || '—'}</div>
        <div style="color:#666"><strong style="color:#555">Hobbs:</strong> ${t.hobbs_response || '—'}</div>
      </div>
    `).join('');
    return `
      <div style="margin-top:8px;padding:8px 10px;background:#f7f3e8;border-radius:3px;border:1px solid #e8dfbf">
        <div style="font-size:11px;font-weight:700;color:#5a5240;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:4px">Matched call distillate · ${d.outcome || '?'}</div>
        <div style="font-size:12px;color:#5a5240;font-style:italic">"${d.one_line || ''}"</div>
        ${topics}
      </div>
    `;
  }

  function lastNoteBlock(n) {
    if (!n) return '<div style="font-size:11px;color:#aaa;padding:6px 0">No notes recorded in HubSpot.</div>';
    return `
      <div style="margin-top:8px;padding:8px 10px;background:#f6f7f6;border-left:2px solid #b6c8b4;border-radius:0 3px 3px 0;font-size:12px">
        <div style="font-size:10px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:4px">Last HubSpot note · ${n.days_since}d ago</div>
        <div style="color:#444;line-height:1.45">${n.text}</div>
      </div>
    `;
  }

  function reasoningBlock(reasons) {
    if (!reasons || !reasons.length) return '';
    return `
      <div style="margin-top:6px;font-size:11px;color:#666">
        <strong style="color:#555">Heat signals:</strong> ${reasons.join(' · ')}
      </div>
    `;
  }

  function pendingSynthesisBlock() {
    return `
      <div style="margin-top:8px;padding:6px 10px;background:#fbfaf6;border:1px dashed #d8d4c0;border-radius:3px;font-size:11px;color:#888">
        <strong style="color:#777">Phase-2 synthesis pending:</strong> Teams channel posts + email threads + visit transcript will be combined here by LLM into a single coherent read.
      </div>
    `;
  }

  function synthesisCard(c) {
    const visitDateStr = c.meeting_date
      ? new Date(c.meeting_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      : 'date unknown';
    return `
      <div class="v2-synth-card heat-${c.heat.toLowerCase()}">
        <div class="v2-synth-head">
          <div style="flex:1;min-width:0">
            <div class="v2-synth-name">${c.name}</div>
            <div class="v2-synth-meta">visit · ${visitDateStr} · ${c.days_since_visit ?? '—'}d ago${c.horizon_snapshot_created === 'Yes' ? ' · HORIZON sent' : ''}</div>
          </div>
          ${heatBadge(c.heat)}
        </div>

        ${callDistillateBlock(c.call_distillate)}
        ${lastNoteBlock(c.last_note)}
        ${reasoningBlock(c.heat_reasoning)}

        <div class="v2-synth-next">
          <span class="v2-synth-next-label">Next step</span>
          <span class="v2-synth-next-body">${c.next_step}</span>
        </div>

        ${pendingSynthesisBlock()}

        <div class="v2-synth-actions">
          <a href="${c.hubspot_url}" target="_blank" class="v2-btn primary">Open in HubSpot</a>
          <button onclick="alert('Mark hot — to wire')" class="v2-btn">Mark HOT</button>
          <button onclick="alert('Mark cold — to wire')" class="v2-btn">Mark COLD</button>
          <button onclick="alert('Snooze 7d — to wire')" class="v2-btn">Snooze 7d</button>
        </div>
      </div>
    `;
  }

  // ===========================================================================
  // Compact rows for upcoming + call queue
  // ===========================================================================

  function compactRow(c, opts) {
    const days = c.days_since_contact ?? c.days_since;
    const dayStr = days === null || days === undefined ? '—' : `${days}d`;
    const dateLabel = opts.dateLabel || 'last contact';
    const meetingStr = c.meeting_date
      ? new Date(c.meeting_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      : null;
    return `
      <div style="padding:6px 0;border-bottom:1px solid #f0efe7;display:flex;justify-content:space-between;align-items:center;gap:10px">
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.name}</div>
          <div style="font-size:10px;color:#888">${meetingStr ? `visit · ${meetingStr}` : `${dateLabel}: ${dayStr}`}</div>
        </div>
        <a href="${c.hubspot_url}" target="_blank" style="font-size:11px;color:#3a6b3a;text-decoration:none;font-weight:600;white-space:nowrap">Open &rarr;</a>
      </div>
    `;
  }

  // Milestone row — clicking the row expands an inline prep-brief drawer
  // populated from the contact-diagnoses cache.
  let _milestoneCache = null;
  async function loadMilestoneCache() {
    if (_milestoneCache) return _milestoneCache;
    try {
      const res = await fetch('/api/work/contact-diagnoses');
      if (!res.ok) { _milestoneCache = {}; return _milestoneCache; }
      const d = await res.json();
      _milestoneCache = d.contacts || {};
    } catch (_) { _milestoneCache = {}; }
    return _milestoneCache;
  }

  function expandMilestone(contactId, ev) {
    if (ev) ev.stopPropagation();
    const row = document.querySelector(`.v2-milestone-row[data-cid="${contactId}"]`);
    if (!row) return;
    const drawer = row.nextElementSibling;
    if (!drawer || !drawer.classList.contains('v2-milestone-drawer')) return;
    const open = drawer.classList.toggle('open');
    if (!open) return;
    if (drawer.dataset.loaded === 'true') return;
    drawer.dataset.loaded = 'loading';
    drawer.innerHTML = '<div class="v2-milestone-drawer-pending">Loading prep brief…</div>';
    loadMilestoneCache().then(cache => {
      const dx = cache[contactId];
      if (!dx || !dx.diagnosis || !dx.diagnosis.length) {
        drawer.innerHTML = '<div class="v2-milestone-drawer-pending">Prep brief pending. Batch may still be running for this contact.</div>';
        drawer.dataset.loaded = 'pending';
        return;
      }
      const steps = dx.diagnosis.map(s => `
        <div class="v2-milestone-drawer-step">
          <div class="v2-milestone-drawer-step-head">${s.header}</div>
          <div class="v2-milestone-drawer-step-body">${s.body}</div>
        </div>
      `).join('');
      drawer.innerHTML = `
        <div class="v2-milestone-drawer-next">
          <span class="v2-milestone-drawer-next-label">Next step</span>
          <span class="v2-milestone-drawer-next-body">${dx.next_step_short || ''}</span>
        </div>
        ${dx.next_step_qualifier ? `<div class="v2-milestone-drawer-qualifier">${dx.next_step_qualifier}</div>` : ''}
        ${steps}
        <div class="v2-milestone-drawer-meta">Generated ${new Date(dx.regenerated_at).toLocaleString()} · assessment: ${dx.diagnosis_assessment || 'ok'}</div>
      `;
      drawer.dataset.loaded = 'true';
    });
  }
  window.v2WorkExpandMilestone = expandMilestone;

  // Milestone row (used in the right-rail upcoming-visits widget)
  function milestoneRow(c) {
    const dt = c.meeting_date ? new Date(c.meeting_date) : null;
    let dateLabel = 'no date set';
    let dateClass = 'unset';
    let isPast = false;
    if (dt) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const visit = new Date(dt);
      visit.setHours(0, 0, 0, 0);
      const diffDays = Math.round((visit - today) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) { dateLabel = 'TODAY'; dateClass = 'today'; }
      else if (diffDays === 1) { dateLabel = 'TOMORROW'; dateClass = 'soon'; }
      else if (diffDays > 1 && diffDays <= 7) { dateLabel = dt.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }); dateClass = 'soon'; }
      else if (diffDays < 0) { dateLabel = `${Math.abs(diffDays)}d ago`; dateClass = 'past'; isPast = true; }
      else { dateLabel = dt.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }); }
    }
    const owner = ownerName(c.owner_id);
    const horizonSent = c.horizon_snapshot_created === 'Yes';
    // Past visits that haven't had a HORIZON Snapshot sent → flag the action.
    // Past visits where it's already sent → confirm receipt instead.
    let postVisitTag = '';
    if (isPast) {
      postVisitTag = horizonSent
        ? `<span class="v2-milestone-tag tag-horizon-sent">✓ HORIZON sent</span>`
        : `<span class="v2-milestone-tag tag-horizon-todo">Send HORIZON Snapshot</span>`;
    }
    return `
      <div class="v2-milestone-row" data-cid="${c.id}" onclick="v2WorkExpandMilestone('${c.id}', event)">
        <div class="v2-milestone-date date-${dateClass}">${dateLabel}</div>
        <div class="v2-milestone-body">
          <div class="v2-milestone-name">${c.name}</div>
          ${postVisitTag}
          <div class="v2-milestone-meta">${owner}${c.last_contacted ? ' · last contact ' + new Date(c.last_contacted).toLocaleDateString() : ''}</div>
        </div>
        <a href="${c.hubspot_url}" target="_blank" class="v2-milestone-link" title="Open in HubSpot" onclick="event.stopPropagation()">↗</a>
      </div>
      <div class="v2-milestone-drawer" data-loaded="false"></div>
    `;
  }

  // Detail-version of call queue row (richer than upcoming-visit row)
  function callQueueDetailCard(c) {
    return `
      <div class="v2-synth-card heat-${c.heat.toLowerCase()}" style="border-left-width:3px;padding:10px 12px">
        <div class="v2-synth-head" style="margin-bottom:4px">
          <div style="flex:1;min-width:0">
            <div class="v2-synth-name" style="font-size:13px">${c.name}</div>
            <div class="v2-synth-meta">In Conversation · last contact ${c.days_since_contact ?? '∞'}d ago</div>
          </div>
          ${heatBadge(c.heat)}
        </div>
        ${c.last_note ? `
          <div style="margin-top:6px;padding:6px 8px;background:#f6f7f6;border-left:2px solid #b6c8b4;border-radius:0 3px 3px 0;font-size:11px;color:#444;line-height:1.45">
            <strong style="color:#666;font-size:10px;text-transform:uppercase;letter-spacing:0.3px">Last note (${c.last_note.days_since}d ago)</strong><br/>
            ${c.last_note.text}
          </div>` : '<div style="font-size:11px;color:#aaa;padding:4px 0">No HubSpot note on file.</div>'}
        <div class="v2-synth-next" style="margin-top:6px;padding:6px 10px;font-size:11px">
          <span class="v2-synth-next-label">Next step</span>
          <span class="v2-synth-next-body">${c.next_step}</span>
        </div>
        <div class="v2-synth-actions" style="margin-top:6px">
          <a href="${c.hubspot_url}" target="_blank" class="v2-btn primary" style="font-size:10px">Open in HubSpot</a>
          <button onclick="alert('Drop — to wire')" class="v2-btn" style="font-size:10px">Drop from list</button>
        </div>
      </div>
    `;
  }

  // ===========================================================================
  // Storm Boy stream render — funnel · completed visits · upcoming · call queue
  // ===========================================================================

  async function renderStormboyStream(container) {
    // Funnel comes from /summary. Detail for completed visits + call queue
    // come from /detail (heavier endpoint). Upcoming visits moved to right
    // rail at top of page.
    const summaryEl = document.createElement('div');
    container.appendChild(summaryEl);
    summaryEl.innerHTML = '<div class="v2-loading">Loading Storm Boy summary…</div>';

    try {
      const sb = await fetchStormboy();
      const max = Math.max(...sb.funnel.map(f => f.count), 1);
      const funnelRows = sb.funnel.map(f => sbFunnelRow(f.stage, f.count, max)).join('');

      summaryEl.innerHTML = `
        <div style="background:#f6f4ec;border:1px solid #e5e0c8;padding:10px 14px;border-radius:5px;margin-bottom:14px;font-size:12px;color:#5a5240">
          <strong>${sb.total_contacts.toLocaleString()} Storm Boy contacts</strong> · ${sb.unstaged} unstaged · ${sb.not_eligible} not eligible · action in Claudia's tool
        </div>

        <div class="v2-sb-section-title">1. Funnel</div>
        ${funnelRows}

        <div class="v2-sb-section-title" style="margin-top:18px">
          2. Farm visits completed
          <span style="font-weight:400;font-size:11px;color:#888;margin-left:6px">linchpin · pursue HOT vs decide on COLD</span>
        </div>
        <div id="sb-completed"><div class="v2-loading">Loading per-visit synthesis…</div></div>

        <div class="v2-sb-section-title" style="margin-top:18px">3. Call queue · stalled in conversation</div>
        <div id="sb-callqueue"><div class="v2-loading">Loading per-contact context…</div></div>
      `;
    } catch (e) {
      summaryEl.innerHTML = `<div class="v2-empty" style="color:#a64545">${e.message}</div>`;
      return;
    }

    // Kick off detail fetches + contact-diagnoses cache in parallel
    Promise.all([
      fetchStormboyDetail('Farm Visit completed'),
      fetchContactDiagnoses(),
    ]).then(([d, dxCache]) => {
      const el = document.getElementById('sb-completed');
      if (!d.contacts.length) {
        el.innerHTML = '<div class="v2-empty">No completed visits recorded.</div>';
        return;
      }
      const cache = (dxCache && dxCache.contacts) || {};
      const exemplars = d.contacts.map(c => contactToCompletedVisitExemplar(c, cache[c.id]));
      el.innerHTML =
        `<div style="font-size:11px;color:#888;margin-bottom:8px">${d.contacts.length} of ${d.total_in_stage} shown · sorted HOT first · ${d.heat_scoring.method} heat · expand for timeline + re-derive</div>` +
        exemplars.map(v2Exemplar.renderCard).join('');
      v2Exemplar.bindActions(el);
    }).catch(e => {
      document.getElementById('sb-completed').innerHTML = `<div class="v2-empty" style="color:#a64545">${e.message}</div>`;
    });

    Promise.all([
      fetchStormboyDetail('In Conversation'),
      fetchContactDiagnoses(),
    ]).then(([d, dxCache]) => {
      const el = document.getElementById('sb-callqueue');
      const stalled = d.contacts.filter(c => (c.days_since_contact ?? 99) >= 3).slice(0, 6);
      if (!stalled.length) {
        el.innerHTML = '<div class="v2-empty">Call queue is clear — no stalled in-conversation contacts.</div>';
        return;
      }
      const cache = (dxCache && dxCache.contacts) || {};
      const exemplars = stalled.map(c => contactToStalledCallExemplar(c, cache[c.id]));
      el.innerHTML =
        `<div style="font-size:11px;color:#888;margin-bottom:8px">${stalled.length} stalled · sorted HOT first · expand for timeline + re-derive</div>` +
        exemplars.map(v2Exemplar.renderCard).join('');
      v2Exemplar.bindActions(el);
    }).catch(e => {
      document.getElementById('sb-callqueue').innerHTML = `<div class="v2-empty" style="color:#a64545">${e.message}</div>`;
    });
  }

  // ---- contact → exemplar shape (Storm Boy Stream 2) -----------------------

  function visitMeta(c) {
    const bits = [];
    if (c.days_since_visit !== null && c.days_since_visit !== undefined) bits.push(`visit ${c.days_since_visit}d ago`);
    if (c.days_since_contact !== null && c.days_since_contact !== undefined) bits.push(`last contact ${c.days_since_contact}d`);
    if (c.horizon_snapshot_created === 'Yes') bits.push('HORIZON sent');
    return bits.join(' · ');
  }

  function callMeta(c) {
    const bits = ['In Conversation'];
    if (c.days_since_contact !== null && c.days_since_contact !== undefined) bits.push(`stalled ${c.days_since_contact}d`);
    if (c.lead_status) bits.push(c.lead_status.toLowerCase());
    return bits.join(' · ');
  }

  function buildQualifier(c) {
    // Prefer matched call distillate one-liner; fall back to heat reasoning; then last-note snippet
    if (c.call_distillate && c.call_distillate.one_line) {
      return c.call_distillate.one_line;
    }
    if (c.heat_reasoning && c.heat_reasoning.length) {
      return c.heat_reasoning.join(' · ');
    }
    if (c.last_note && c.last_note.text) {
      return c.last_note.text.slice(0, 140) + (c.last_note.text.length > 140 ? '…' : '');
    }
    return '';
  }

  function contactToCompletedVisitExemplar(c, dx) {
    return {
      id: 'sb-visit-' + c.id,
      kind: 'completed_visit',
      lookup_type: 'contact',
      lookup_id: c.id,
      hubspot_url: c.hubspot_url,
      title: c.name,
      subtitle: visitMeta(c),
      heat: c.heat,
      assigned_to_id: c.owner_id,
      assigned_to_name: ownerName(c.owner_id),
      next_step_short: dx ? dx.next_step_short : (c.next_step_short || c.next_step),
      next_step_qualifier: dx ? dx.next_step_qualifier : buildQualifier(c),
      diagnosis: dx ? dx.diagnosis : null,
      diagnosis_pending: false,
      counterfactual: null,
      evidence: c.call_distillate ? [{
        source: 'Aircall · ' + (c.call_distillate.transcript_id || 'matched call'),
        content: c.call_distillate.one_line || '',
      }] : [],
      draft: null,
      one_question: null,
      actions: [
        { label: 'Open in HubSpot', type: 'open_url', payload: c.hubspot_url },
      ],
      diagnosis_metadata: dx ? {
        regenerated_at: dx.regenerated_at,
        assessment: dx.diagnosis_assessment,
        timeline_used: dx.timeline_used,
      } : null,
    };
  }

  function contactToStalledCallExemplar(c, dx) {
    return {
      id: 'sb-call-' + c.id,
      kind: 'stalled_call',
      lookup_type: 'contact',
      lookup_id: c.id,
      hubspot_url: c.hubspot_url,
      title: c.name,
      subtitle: callMeta(c),
      heat: c.heat,
      assigned_to_id: c.owner_id,
      assigned_to_name: ownerName(c.owner_id),
      next_step_short: dx ? dx.next_step_short : (c.next_step_short || c.next_step),
      next_step_qualifier: dx ? dx.next_step_qualifier : buildQualifier(c),
      diagnosis: dx ? dx.diagnosis : null,
      diagnosis_pending: false,
      counterfactual: null,
      evidence: [],
      draft: null,
      one_question: null,
      actions: [
        { label: 'Open in HubSpot', type: 'open_url', payload: c.hubspot_url },
      ],
      diagnosis_metadata: dx ? {
        regenerated_at: dx.regenerated_at,
        assessment: dx.diagnosis_assessment,
        timeline_used: dx.timeline_used,
      } : null,
    };
  }

  // ===========================================================================
  // Top-level render
  // ===========================================================================

  async function render(container) {
    container.innerHTML = `
      <div class="v2-section-header">
        <h2 class="v2-section-title">Today's work</h2>
        <p class="v2-section-sub">two streams, deliberately separated. <strong>existing deals</strong> = re-engage warm pipeline. <strong>Storm Boy</strong> = outreach + post-visit decisions on which leads to pursue.</p>
      </div>

      <div id="work-call-cadence" class="v2-call-cadence-host"></div>

      <div class="v2-work-layout">
        <aside class="v2-work-rail-left">
          <div class="v2-milestone-card v2-wins-card">
            <div class="v2-milestone-head v2-wins-head">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
                <div>
                  <span class="v2-milestone-title">What's working · recent wins</span>
                  <span class="v2-milestone-sub">click a row to see why it closed + how to replicate</span>
                </div>
                <button class="v2-wins-refresh-mini" onclick="v2WorkRefreshWins(event)" title="Force fresh LLM pass">⟳</button>
              </div>
            </div>
            <div id="wins-rail"><div class="v2-loading" style="padding:18px">Analysing recent wins…</div></div>
          </div>
        </aside>

        <div class="v2-work-main">
          <div id="work-exemplars"></div>

          <div class="v2-work-streams">
            <div class="v2-stream">
              <div class="v2-stream-head">
                <div>
                  <div class="v2-stream-title">Existing deals</div>
                  <div class="v2-stream-sub">engaged pipeline · re-engage warm</div>
                </div>
                <span class="v2-stream-badge motion2">Motion 2</span>
              </div>
              <div id="plays-list"><div class="v2-loading">Loading active deals…</div></div>
            </div>

            <div class="v2-stream">
              <div class="v2-stream-head">
                <div>
                  <div class="v2-stream-title">Storm Boy</div>
                  <div class="v2-stream-sub">recruitment · outreach + post-visit triage</div>
                </div>
                <span class="v2-stream-badge motion1">Motion 1</span>
              </div>
              <div id="stormboy-stream"></div>
            </div>
          </div>

          <div class="v2-work-foot">
            <div class="v2-card">
              <div class="v2-card-head">
                <span class="v2-card-title">Probes waiting</span>
                <span class="v2-card-sub">awaiting customer response</span>
              </div>
              <div id="probes-list"><div class="v2-empty">No probes in flight.</div></div>
            </div>
          </div>
        </div>

        <aside class="v2-work-rail">
          <div class="v2-milestone-card">
            <div class="v2-milestone-head">
              <span class="v2-milestone-title">Upcoming farm visits</span>
              <span class="v2-milestone-sub">next major milestones</span>
            </div>
            <div id="upcoming-visits"><div class="v2-loading" style="padding:18px">Loading…</div></div>
          </div>
        </aside>
      </div>
    `;

    // Header scorecard is rendered globally by v2-scoreboard.init() on page load;
    // refresh it now in case any WORK action changed an underlying metric.
    if (window.v2Scoreboard && window.v2Scoreboard.refresh) window.v2Scoreboard.refresh();

    loadCallCadence();

    // Upcoming visits rail — render all booked visits (server filters
    // completed-over-24h-ago and sorts by next-proximal); panel scrolls
    // internally per the .v2-work-rail CSS.
    fetchStormboy().then(sb => {
      const upcoming = sb.upcoming || [];
      const el = document.getElementById('upcoming-visits');
      if (!upcoming.length) {
        el.innerHTML = '<div class="v2-empty" style="padding:18px">No upcoming visits scheduled.</div>';
        return;
      }
      el.innerHTML = upcoming.map(milestoneRow).join('');
    }).catch(e => {
      const el = document.getElementById('upcoming-visits');
      if (el) el.innerHTML = `<div class="v2-empty" style="color:#a64545;padding:18px">${e.message}</div>`;
    });

    // Exemplars first — these demonstrate the 3-steps-down pattern
    v2Exemplar.loadAndRender('#work-exemplars');

    // Stream 1 — fetch active deals AND cached diagnoses in parallel, render as exemplar cards
    Promise.all([fetchActive(), fetchDealDiagnoses(), fetchDiagnoseJob()]).then(([active, dxCache, job]) => {
      const deals = (active.deals || []).slice().sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0));
      const top = deals.slice(0, 12);
      const cache = (dxCache && dxCache.deals) || {};

      let progressBar = '';
      if (job && job.running) {
        progressBar = `<div style="font-size:11px;color:#5a5240;background:#f6f4ec;border:1px solid #e5e0c8;padding:6px 10px;border-radius:4px;margin-bottom:10px">⟳ Diagnosis batch running · ${job.completed_count}/${job.target_count} complete · current: ${job.current_deal ? job.current_deal.deal_name : '—'}</div>`;
      } else if (job && job.finished_at) {
        progressBar = `<div style="font-size:11px;color:#5a5240;background:#f0f5ef;border:1px solid #c8dcc4;padding:6px 10px;border-radius:4px;margin-bottom:10px">✓ Diagnosis batch complete · ${job.completed_count}/${job.target_count} · ${new Date(job.finished_at).toLocaleString()}</div>`;
      }

      const exemplars = top.map(d => dealToExemplar(d, cache[d.deal_id]));
      document.getElementById('plays-list').innerHTML = exemplars.length
        ? progressBar + `<div style="font-size:11px;color:#888;margin-bottom:8px">${exemplars.length} of ${deals.length} active · sorted by risk</div>` + exemplars.map(v2Exemplar.renderCard).join('')
        : '<div class="v2-empty">No active deals.</div>';
      // Bind action buttons in the new cards
      v2Exemplar.bindActions(document.getElementById('plays-list'));
      // Decorate each card with a "what's new" badge if Apex has fresh
      // supplement files. Async, non-blocking — cards render immediately and
      // badges land seconds later as each fetch resolves.
      augmentWithSupplementBadges(exemplars);
    }).catch(e => {
      document.getElementById('plays-list').innerHTML = `<div class="v2-empty" style="color:#a64545">${e.message}</div>`;
    });

    renderStormboyStream(document.getElementById('stormboy-stream'));

    loadWins();
  }

  // ===========================================================================
  // Team call cadence — surfaces team-target progress + per-rep contribution
  // so reps can self-correct mid-week without doing the math in standup.
  // ===========================================================================
  function dayLabel() {
    const d = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[d.getDay()];
  }
  function paceClass(t) {
    if (t.on_pace) return 'on-pace';
    if (t.gap_vs_pace < -10) return 'behind';
    return 'slightly-behind';
  }
  function repCadenceClass(slug) {
    return 'cc-rep-' + slug.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  function renderCallCadenceCard(d) {
    const t = d.team_target;
    if (!t) return '';
    const pct = Math.min(100, t.pct_of_target);
    const paceCls = paceClass(t);
    const paceMessage = t.business_days_remaining === 0
      ? (t.this_week_calls >= t.target_per_week ? 'Week wrapped — target hit ✓' : `Week wrapped — ${t.calls_needed} short`)
      : t.on_pace
        ? `On pace · ${t.business_days_remaining} business day${t.business_days_remaining === 1 ? '' : 's'} left`
        : `Behind pace by ${Math.abs(t.gap_vs_pace)} · ${t.business_days_remaining} day${t.business_days_remaining === 1 ? '' : 's'} left · need ${t.needed_per_remaining_day}/day`;
    // Per-rep rows — sorted by calls desc, normalised by fair-share
    const maxRepCalls = Math.max(...t.per_rep.map(r => r.calls), t.fair_share_per_rep, 1);
    const repRows = t.per_rep.map(r => {
      const w = (r.calls / maxRepCalls) * 100;
      const fairW = (t.fair_share_per_rep / maxRepCalls) * 100;
      const overShare = r.pct_of_fair_share >= 100;
      const slug = r.rep.toLowerCase().replace(/[^a-z0-9]/g, '');
      return `<div class="v2-cc-rep-row ${repCadenceClass(slug)}">
        <div class="v2-cc-rep-name">${escapeHtml(r.rep)}</div>
        <div class="v2-cc-rep-bar-wrap">
          <div class="v2-cc-rep-bar ${overShare ? 'over' : 'under'}" style="width:${Math.max(2, w)}%">${r.calls}</div>
          <div class="v2-cc-rep-fair-marker" style="left:${fairW}%" title="Fair share: ${t.fair_share_per_rep} calls"></div>
        </div>
        <div class="v2-cc-rep-meta">${r.pct_of_fair_share}% of fair</div>
      </div>`;
    }).join('');
    return `
      <div class="v2-call-cadence-card pace-${paceCls}">
        <div class="v2-cc-head">
          <div>
            <div class="v2-cc-title">Team call cadence · this week</div>
            <div class="v2-cc-sub">target ${t.target_per_week}/week · ${dayLabel()} · ${t.business_days_elapsed}/5 business days elapsed</div>
          </div>
          <div class="v2-cc-pace ${paceCls}">${paceMessage}</div>
        </div>
        <div class="v2-cc-progress-row">
          <div class="v2-cc-progress-headline">
            <span class="v2-cc-big">${t.this_week_calls}</span>
            <span class="v2-cc-of">/ ${t.target_per_week}</span>
            <span class="v2-cc-pct">${t.pct_of_target}%</span>
          </div>
          <div class="v2-cc-progress-bar-wrap">
            <div class="v2-cc-progress-bar ${paceCls}" style="width:${pct}%"></div>
            <div class="v2-cc-pace-marker" style="left:${Math.min(100, (t.expected_by_today / t.target_per_week) * 100)}%" title="Expected pace by ${dayLabel()}: ${t.expected_by_today}"></div>
          </div>
        </div>
        <div class="v2-cc-rep-rows">${repRows}</div>
        <div class="v2-cc-foot">Fair share = ${t.fair_share_per_rep}/rep/week (target ÷ ${t.per_rep.length} callers). Pace marker = where the team should be by end of ${dayLabel()}.</div>
      </div>
    `;
  }

  async function loadCallCadence() {
    const target = document.getElementById('work-call-cadence');
    if (!target) return;
    try {
      const res = await fetch('/api/stats/call-efficiency');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const d = await res.json();
      target.innerHTML = renderCallCadenceCard(d);
    } catch (e) {
      target.innerHTML = `<div class="v2-empty" style="color:#a64545;padding:10px 0">Call cadence unavailable: ${e.message}</div>`;
    }
  }

  function loadWins() {
    const target = document.getElementById('wins-rail');
    if (!target) return;
    target.innerHTML = '<div class="v2-loading" style="padding:18px">Analysing recent wins…</div>';
    fetchRecentWins().then(data => {
      const wins = (data.wins || []).slice(0, 5);
      target.innerHTML = wins.length
        ? wins.map(winRow).join('')
        : '<div class="v2-empty" style="padding:18px">No recent wins.</div>';
    }).catch(e => {
      target.innerHTML = `<div class="v2-empty" style="color:#a64545;padding:18px">${e.message}</div>`;
    });
  }

  window.v2WorkRefreshWins = async function(ev) {
    if (ev) ev.stopPropagation();
    const btn = ev && ev.currentTarget;
    const target = document.getElementById('wins-rail');
    if (btn) { btn.disabled = true; btn.textContent = '…'; }
    target.innerHTML = '<div class="v2-loading" style="padding:18px">Re-analysing wins (~30s for 5 deals)…</div>';
    try {
      const res = await fetch('/api/work/recent-wins?force=1');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const wins = (data.wins || []).slice(0, 5);
      target.innerHTML = wins.length ? wins.map(winRow).join('') : '<div class="v2-empty" style="padding:18px">No recent wins.</div>';
    } catch (e) {
      target.innerHTML = `<div class="v2-empty" style="color:#a64545;padding:18px">Refresh failed: ${e.message}</div>`;
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = '⟳'; }
    }
  };

  v2Shell.register('work', render);
})();
