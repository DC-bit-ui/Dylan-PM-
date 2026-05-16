/**
 * v2 Exemplar cards — the 3-steps-down insight pattern.
 *
 * Renders 3 cards demonstrating the depth target for every WORK card:
 *   - Stuck deal exemplar (Daisy Bank, orphan diagnosis + reassignment)
 *   - Completed visit exemplar (Ian Cameron, HORIZON-handover draft)
 *   - Stalled call exemplar (Ken Jacobs, re-engagement w/ honest opener)
 *
 * Collapse-by-default, expand-on-click reveals: diagnosis (3 steps),
 * counterfactual (act vs don't), evidence, draft (specific + pre-filled),
 * one-question, action buttons that actually act.
 */
window.v2Exemplar = (function() {

  function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getByPath(obj, pathStr) {
    return pathStr.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }

  // ---------- toast ----------
  function toast(msg, kind) {
    let host = document.getElementById('v2-toast-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'v2-toast-host';
      host.style.cssText = 'position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none';
      document.body.appendChild(host);
    }
    const t = document.createElement('div');
    t.style.cssText = 'background:#1a1a1a;color:#fff;padding:10px 16px;border-radius:5px;font-size:13px;box-shadow:0 4px 14px rgba(0,0,0,0.2);opacity:0;transition:opacity 0.2s;pointer-events:auto';
    if (kind === 'error') t.style.background = '#8a3024';
    if (kind === 'success') t.style.background = '#2f5a2f';
    t.textContent = msg;
    host.appendChild(t);
    requestAnimationFrame(() => { t.style.opacity = '1'; });
    setTimeout(() => {
      t.style.opacity = '0';
      setTimeout(() => t.remove(), 250);
    }, 2400);
  }

  // ---------- action handlers ----------
  async function runAction(action, exemplar, ev) {
    if (ev) ev.stopPropagation();
    try {
      switch (action.type) {
        case 'copy': {
          const val = action.payload_field ? getByPath(exemplar, action.payload_field) : action.payload;
          await navigator.clipboard.writeText(val || '');
          toast('Copied to clipboard', 'success');
          return;
        }
        case 'mailto': {
          const subject = action.payload.subject_field ? getByPath(exemplar, action.payload.subject_field) : (action.payload.subject || '');
          const body = action.payload.body_field ? getByPath(exemplar, action.payload.body_field) : (action.payload.body || '');
          const url = 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
          window.location.href = url;
          return;
        }
        case 'open_url': {
          window.open(action.payload, '_blank', 'noopener');
          return;
        }
        case 'bus_write': {
          const res = await fetch('/api/work/exemplar-action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              exemplar_id: exemplar.id,
              label: action.label,
              payload: action.payload,
            }),
          });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const data = await res.json();
          toast('Recorded: ' + action.label, 'success');
          return;
        }
        case 'expand': {
          const card = ev ? ev.currentTarget.closest('.v2-ex-card') : null;
          if (card) {
            const id = card.dataset.ex;
            if (id) toggle(id, ev);
          }
          return;
        }
        default:
          toast('Unhandled action type: ' + action.type, 'error');
      }
    } catch (e) {
      console.error('action failed', e);
      toast('Action failed: ' + e.message, 'error');
    }
  }

  // Wire registry — exemplar id -> exemplar object, for click handlers
  const _registry = {};

  // ---------- render primitives ----------
  function heatBadge(heat) {
    const m = {
      HOT: { cls: 'hot', icon: '🔥', label: 'HOT' },
      WARM: { cls: 'warm', icon: '🟡', label: 'WARM' },
      COLD: { cls: 'cold', icon: '❄️', label: 'COLD' },
    };
    const h = m[heat] || m.WARM;
    return `<span class="v2-heat ${h.cls}">${h.icon} ${h.label}</span>`;
  }

  function diagnosisHtml(d) {
    return (d || []).map(s => `
      <div class="v2-ex-step">
        <div class="v2-ex-step-num">${s.step}</div>
        <div>
          <div class="v2-ex-step-head">${escapeHtml(s.header)}</div>
          <div class="v2-ex-step-body">${escapeHtml(s.body)}</div>
        </div>
      </div>
    `).join('');
  }

  function counterfactualHtml(c) {
    if (!c) return '';
    return `
      <div class="v2-ex-cf">
        <div class="v2-ex-cf-grid">
          <div class="v2-ex-cf-cell good">
            <div class="v2-ex-cf-label">If you act now</div>
            <div class="v2-ex-cf-body">${escapeHtml(c.if_act_now)}</div>
          </div>
          <div class="v2-ex-cf-cell bad">
            <div class="v2-ex-cf-label">If you don't</div>
            <div class="v2-ex-cf-body">${escapeHtml(c.if_dont_act)}</div>
          </div>
        </div>
        <div class="v2-ex-cf-meta">Data quality: ${escapeHtml(c.data_quality)}</div>
      </div>
    `;
  }

  function evidenceHtml(items) {
    if (!items || !items.length) return '';
    return items.map(e => `
      <div class="v2-ex-evidence">
        <div class="v2-ex-evidence-source">${escapeHtml(e.source)}</div>
        <div class="v2-ex-evidence-body">${escapeHtml(e.content)}</div>
      </div>
    `).join('');
  }

  function draftHtml(d) {
    if (!d) return '';
    const subjLine = d.subject ? `<div class="v2-ex-draft-subject"><strong>Subject:</strong> ${escapeHtml(d.subject)}</div>` : '';
    const toLine = d.to ? `<div class="v2-ex-draft-subject"><strong>To:</strong> ${escapeHtml(d.to)}${d.to_placeholder ? ' <em style="color:#a64545">(placeholder — replace with real address)</em>' : ''}</div>` : '';
    return `
      <div class="v2-ex-draft">
        <div class="v2-ex-draft-label">${escapeHtml(d.label || 'Draft (' + d.kind + ')')}</div>
        ${toLine}
        ${subjLine}
        <pre class="v2-ex-draft-body">${escapeHtml(d.body)}</pre>
      </div>
    `;
  }

  function actionsHtml(actions, exemplarId) {
    return (actions || []).map((a, i) => `
      <button data-ex="${exemplarId}" data-action="${i}" class="v2-btn ${i === 0 ? 'primary' : ''}">${escapeHtml(a.label)}</button>
    `).join('');
  }

  function kindLabel(kind) {
    return ({ stuck_deal: 'Stuck deal', completed_visit: 'Completed visit', stalled_call: 'Stalled call' })[kind] || kind;
  }

  // Classify the next-step copy into an action type so the hero can colour-code
  // by the kind of action required. Order matters — specific patterns first.
  function classifyAction(text) {
    if (!text) return { type: 'default', icon: '→', label: 'Do this' };
    const t = String(text).toLowerCase();
    if (/\bhorizon\b|send (the )?report|share (the )?report|hand[- ]over|deliver/.test(t)) {
      return { type: 'deliver', icon: '📤', label: 'Deliver' };
    }
    if (/lawrieco|via partner|prompt (the )?broker|nudge (the )?broker|broker follow[- ]?up/.test(t)) {
      return { type: 'partner', icon: '🤝', label: 'Via partner' };
    }
    if (/\b(call|phone|dial|ring|aircall)\b/.test(t)) {
      return { type: 'call', icon: '📞', label: 'Call' };
    }
    if (/\b(visit|farm visit|book a visit|schedule a visit|on[- ]site|meet on)\b/.test(t)) {
      return { type: 'meeting', icon: '🚜', label: 'Visit / meet' };
    }
    if (/\b(email|reply|draft|write to|message|follow[- ]?up|send)\b/.test(t)) {
      return { type: 'email', icon: '✉️', label: 'Email' };
    }
    if (/\b(check|verify|review|read|investigate|confirm)\b/.test(t)) {
      return { type: 'review', icon: '🔍', label: 'Review' };
    }
    return { type: 'default', icon: '→', label: 'Do this' };
  }

  // ---------- main render ----------
  function ownerBadge(name) {
    if (!name) return '';
    const slug = (name || '').toLowerCase().split(' ')[0];
    return `<span class="v2-ex-owner owner-${slug}">${escapeHtml(name)}</span>`;
  }

  // Section head + content, only rendered if content is non-empty.
  function section(head, content, extraHeadHtml) {
    if (!content || content.trim() === '') return '';
    const right = extraHeadHtml || '';
    return `<div class="v2-ex-section-head" style="display:flex;justify-content:space-between;align-items:center"><span>${head}</span>${right}</div>${content}`;
  }

  function renderCard(ex) {
    _registry[ex.id] = ex;

    const diagnosisContent = (ex.diagnosis && ex.diagnosis.length)
      ? diagnosisHtml(ex.diagnosis)
      : (ex.diagnosis_pending
          ? `<div class="v2-ex-timeline-pending">Diagnosis generating… check back in a few minutes.</div>`
          : '<div class="v2-ex-timeline-pending">No diagnosis on file. Use Re-derive to generate one from the live timeline.</div>');
    const diagnosisRegenBtn = ex.lookup_type && ex.lookup_id
      ? `<button class="v2-ex-regen-btn" onclick="v2Exemplar.regenerate('${ex.id}', event)" title="Re-derive diagnosis from the live HubSpot timeline via Claude">⟳ Re-derive</button>`
      : '';
    const diagnosisMeta = ex.diagnosis_metadata
      ? `<div class="v2-ex-regen-meta">Generated ${new Date(ex.diagnosis_metadata.regenerated_at).toLocaleString()} · assessment: <strong>${escapeHtml(ex.diagnosis_metadata.assessment || 'ok')}</strong></div>`
      : '';

    const oneQHtml = ex.one_question
      ? `<div class="v2-ex-onequestion"><div class="v2-ex-onequestion-label">One question to answer first</div><div>${escapeHtml(ex.one_question)}</div></div>`
      : '';

    const actionsRow = (ex.actions && ex.actions.length)
      ? `<div class="v2-ex-actions">${actionsHtml(ex.actions, ex.id)}</div>`
      : '';

    // Hero "do this" block — lifts the next step into the expanded view with
    // visual weight so the reader's eye lands on the action. Action-type
    // classification drives the colour scheme so the kind of action (call,
    // email, partner nudge, visit, deliver, review) is readable at a glance.
    const cls = classifyAction(ex.next_step_short);
    const heroNextStep = ex.next_step_short
      ? `<div class="v2-ex-hero" data-action-type="${cls.type}">
          <div class="v2-ex-hero-icon">${cls.icon}</div>
          <div class="v2-ex-hero-content">
            <div class="v2-ex-hero-label">
              <span class="v2-ex-hero-label-prefix">Do this next</span>
              <span class="v2-ex-hero-chip">${cls.label}</span>
            </div>
            <div class="v2-ex-hero-body">${escapeHtml(ex.next_step_short)}</div>
            ${ex.next_step_qualifier ? `<div class="v2-ex-hero-qualifier">${escapeHtml(ex.next_step_qualifier)}</div>` : ''}
          </div>
        </div>`
      : '';

    const timelineBlock = ex.lookup_type && ex.lookup_id
      ? `<div class="v2-ex-timeline" data-loaded="false" data-lookup-type="${ex.lookup_type}" data-lookup-id="${ex.lookup_id}">
          <div class="v2-ex-timeline-pending">Timeline loads when card opens…</div>
        </div>`
      : '<div class="v2-ex-timeline-pending">No timeline link for this card.</div>';

    const evidenceBlock = (ex.evidence && ex.evidence.length)
      ? `<div class="v2-ex-receipts-section-head">Other signals</div>${evidenceHtml(ex.evidence)}`
      : '';

    return `
      <div class="v2-ex-card" data-ex="${ex.id}" data-owner="${escapeHtml(ex.assigned_to_name || 'unassigned')}">
        <div class="v2-ex-collapsed" onclick="v2Exemplar.toggle('${ex.id}', event)">
          <div class="v2-ex-collapsed-row">
            <div class="v2-ex-collapsed-main">
              <div class="v2-ex-collapsed-head">
                <span class="v2-ex-heat-dot heat-${(ex.heat || '').toLowerCase()}" title="${ex.heat || ''}"></span>
                <span class="v2-ex-name">${escapeHtml(ex.title)}</span>
                ${ex.kind ? `<span class="v2-ex-kind-small">${kindLabel(ex.kind).toLowerCase()}</span>` : ''}
              </div>
              ${ex.next_step_short ? `<div class="v2-ex-next-step"><span class="v2-ex-arrow">→</span><span class="v2-ex-next-step-text">${escapeHtml(ex.next_step_short)}</span></div>` : '<div class="v2-ex-next-step" style="color:#aaa;font-weight:500"><span class="v2-ex-arrow">…</span><span>Diagnosis pending</span></div>'}
              ${ex.next_step_qualifier ? `<div class="v2-ex-qualifier">${escapeHtml(ex.next_step_qualifier)}</div>` : ''}
            </div>
            <div class="v2-ex-collapsed-side">
              ${ownerBadge(ex.assigned_to_name)}
              <button class="v2-ex-expand-btn" onclick="v2Exemplar.toggle('${ex.id}', event)">
                <span class="caret">▼</span>
              </button>
            </div>
          </div>
        </div>

        <div class="v2-ex-expanded-body">
          <div class="v2-ex-overlay-bar">
            <div class="v2-ex-overlay-title">
              <span class="v2-ex-heat-dot heat-${(ex.heat || '').toLowerCase()}"></span>
              <span class="v2-ex-overlay-title-name">${escapeHtml(ex.title)}</span>
              ${ex.kind ? `<span class="v2-ex-kind-small">${kindLabel(ex.kind).toLowerCase()}</span>` : ''}
              ${ownerBadge(ex.assigned_to_name)}
            </div>
            <button class="v2-ex-overlay-close" onclick="v2Exemplar.closeAll()" title="Close (Esc)">✕</button>
          </div>
          ${ex.subtitle ? `<div class="v2-ex-deep-context"><span class="v2-ex-deep-context-label">Context</span><span>${escapeHtml(ex.subtitle)}</span></div>` : ''}

          ${heroNextStep}

          <div class="v2-ex-expanded-grid">
            <div class="v2-ex-diagnosis-col">
              <div class="v2-ex-section-head" style="display:flex;justify-content:space-between;align-items:center">
                <span>Diagnosis · 3 steps down</span>
                ${diagnosisRegenBtn}
              </div>
              ${diagnosisMeta}
              <div class="v2-ex-diagnosis-list" data-ex-diagnosis="${ex.id}">
                ${diagnosisContent}
              </div>
            </div>

            <div class="v2-ex-receipts-col">
              <div class="v2-ex-section-head v2-ex-receipts-head"><span>What actually happened</span></div>
              ${timelineBlock}
              ${evidenceBlock}
            </div>
          </div>

          ${ex.counterfactual ? `<div class="v2-ex-section-head">Counterfactual · act vs don't</div>${counterfactualHtml(ex.counterfactual)}` : ''}
          ${oneQHtml}

          ${ex.draft ? `<div class="v2-ex-section-head">Pre-filled draft</div>${draftHtml(ex.draft)}` : ''}

          ${actionsRow}
        </div>
      </div>
    `;
  }

  // ---------- engagement timeline (live, on expand) ----------
  function kindIcon(k) {
    return ({ note: '📝', email: '✉️', call: '📞', meeting: '🤝' })[k] || '•';
  }

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function daysSinceLabel(iso) {
    if (!iso) return '';
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
    return days >= 0 ? `${days}d ago` : '';
  }

  function renderTimelineEntry(e) {
    return `
      <div class="v2-ex-tl-entry">
        <div class="v2-ex-tl-icon">${kindIcon(e.kind)}</div>
        <div class="v2-ex-tl-main">
          <div class="v2-ex-tl-head">
            <span class="v2-ex-tl-title">${escapeHtml(e.title)}</span>
            <span class="v2-ex-tl-date">${formatDate(e.timestamp)} · ${daysSinceLabel(e.timestamp)}</span>
          </div>
          ${e.subline ? `<div class="v2-ex-tl-subline">${escapeHtml(e.subline)}</div>` : ''}
          ${e.body ? `<blockquote class="v2-ex-tl-body">${escapeHtml(e.body)}</blockquote>` : '<div class="v2-ex-tl-empty">(no body content recorded)</div>'}
        </div>
      </div>
    `;
  }

  async function loadTimeline(cardEl) {
    const tlEl = cardEl.querySelector('.v2-ex-timeline');
    if (!tlEl) return;
    if (tlEl.dataset.loaded === 'true' || tlEl.dataset.loaded === 'loading') return;
    const type = tlEl.dataset.lookupType;
    const id = tlEl.dataset.lookupId;
    if (!type || !id) {
      tlEl.innerHTML = '<div class="v2-ex-timeline-pending">No lookup configured.</div>';
      return;
    }
    tlEl.dataset.loaded = 'loading';
    tlEl.innerHTML = '<div class="v2-ex-timeline-pending">Loading from HubSpot…</div>';
    try {
      const res = await fetch(`/api/work/timeline?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const headline = data.last_contact_date
        ? `<div class="v2-ex-tl-headline">Last contact: <strong>${formatDate(data.last_contact_date)}</strong> (${data.days_since_last_contact}d ago) · ${data.engagements_returned || (data.engagements || []).length} engagements</div>`
        : '<div class="v2-ex-tl-headline">No contact recorded.</div>';
      const all = data.engagements || [];
      const visible = all.slice(0, 3);
      const hidden = all.slice(3);
      const visibleHtml = visible.map(renderTimelineEntry).join('') || '<div class="v2-ex-timeline-pending">No engagements found.</div>';
      const hiddenHtml = hidden.length
        ? `<div class="v2-ex-tl-rest" style="display:none">${hidden.map(renderTimelineEntry).join('')}</div>
           <button class="v2-ex-tl-more-btn" onclick="v2Exemplar.toggleTimelineRest(this)">Show ${hidden.length} more ▾</button>`
        : '';
      tlEl.innerHTML = headline + visibleHtml + hiddenHtml;
      tlEl.dataset.loaded = 'true';
    } catch (e) {
      tlEl.innerHTML = `<div class="v2-ex-timeline-pending" style="color:#a64545">Timeline failed: ${escapeHtml(e.message)}</div>`;
      tlEl.dataset.loaded = 'error';
    }
  }

  function renderOwnerFilter(exemplars) {
    const owners = Array.from(new Set(exemplars.map(e => e.assigned_to_name).filter(Boolean))).sort();
    return `
      <div class="v2-ex-filter">
        <span class="v2-ex-filter-label">Show cards for:</span>
        <button class="v2-ex-filter-btn active" data-owner="all">All</button>
        ${owners.map(o => `<button class="v2-ex-filter-btn" data-owner="${escapeHtml(o)}">${escapeHtml(o)}</button>`).join('')}
      </div>
    `;
  }

  function bindFilter(rootEl) {
    rootEl.querySelectorAll('.v2-ex-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        rootEl.querySelectorAll('.v2-ex-filter-btn').forEach(b => b.classList.toggle('active', b === btn));
        const owner = btn.dataset.owner;
        rootEl.querySelectorAll('.v2-ex-card').forEach(card => {
          card.style.display = (owner === 'all' || card.dataset.owner === owner) ? '' : 'none';
        });
      });
    });
  }

  // ---- focus-mode overlay: only one card open at a time, floats above the list ----
  function ensureBackdrop() {
    let bd = document.getElementById('v2-ex-backdrop');
    if (!bd) {
      bd = document.createElement('div');
      bd.id = 'v2-ex-backdrop';
      bd.className = 'v2-ex-overlay-backdrop';
      bd.addEventListener('click', closeAll);
      document.body.appendChild(bd);
      document.addEventListener('keydown', escHandler);
    }
    bd.classList.add('visible');
    document.body.classList.add('v2-ex-overlay-open');
  }
  function hideBackdrop() {
    const bd = document.getElementById('v2-ex-backdrop');
    if (bd) bd.classList.remove('visible');
    document.body.classList.remove('v2-ex-overlay-open');
  }
  function closeAll() {
    document.querySelectorAll('.v2-ex-card.expanded').forEach(c => {
      c.classList.remove('expanded');
      const btn = c.querySelector('.v2-ex-expand-btn .caret');
      if (btn) btn.textContent = '▼';
    });
    hideBackdrop();
  }
  function escHandler(ev) {
    if (ev.key === 'Escape') closeAll();
  }

  function toggle(exId, ev) {
    if (ev) ev.stopPropagation();
    const card = document.querySelector(`.v2-ex-card[data-ex="${exId}"]`);
    if (!card) return;
    const wasExpanded = card.classList.contains('expanded');
    // Enforce single-open: collapse any other open card first
    document.querySelectorAll('.v2-ex-card.expanded').forEach(c => {
      if (c !== card) {
        c.classList.remove('expanded');
        const cb = c.querySelector('.v2-ex-expand-btn .caret');
        if (cb) cb.textContent = '▼';
      }
    });
    if (wasExpanded) {
      card.classList.remove('expanded');
      hideBackdrop();
    } else {
      card.classList.add('expanded');
      ensureBackdrop();
      loadTimeline(card);
      // scroll the overlay back to top in case it was scrolled before
      const body = card.querySelector('.v2-ex-expanded-body');
      if (body) body.scrollTop = 0;
    }
    const btn = card.querySelector('.v2-ex-expand-btn .caret');
    if (btn) btn.textContent = card.classList.contains('expanded') ? '▲' : '▼';
  }

  function bindActions(rootEl) {
    rootEl.querySelectorAll('.v2-ex-actions button').forEach(btn => {
      btn.addEventListener('click', ev => {
        const exId = btn.dataset.ex;
        const idx = parseInt(btn.dataset.action, 10);
        const exemplar = _registry[exId];
        if (!exemplar) return;
        const action = exemplar.actions[idx];
        if (action) runAction(action, exemplar, ev);
      });
    });
  }

  async function loadAndRender(targetSelector) {
    const target = document.querySelector(targetSelector);
    if (!target) return;
    target.innerHTML = '<div class="v2-loading">Loading exemplars…</div>';
    try {
      const res = await fetch('/api/work/exemplars');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      target.innerHTML = `
        <div class="v2-ex-rail">
          <div class="v2-ex-rail-head">
            <div class="v2-ex-rail-title">Today's three</div>
            <div class="v2-ex-rail-sub">one stuck deal · one completed visit · one stalled call. each tagged with assigned owner. expand for the deeper dive.</div>
          </div>
          ${renderOwnerFilter(data.exemplars)}
          ${data.exemplars.map(renderCard).join('')}
        </div>
      `;
      bindActions(target);
      bindFilter(target);
    } catch (e) {
      target.innerHTML = `<div class="v2-empty" style="color:#a64545">Exemplars failed to load: ${escapeHtml(e.message)}</div>`;
    }
  }

  async function regenerate(exId, ev) {
    if (ev) ev.stopPropagation();
    const btn = ev && ev.currentTarget;
    if (btn) { btn.disabled = true; btn.textContent = '⟳ Re-deriving…'; }
    try {
      const res = await fetch('/api/work/regenerate-exemplar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exemplar_id: exId }),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'unknown error');

      // Update the card in place
      const ex = _registry[exId];
      if (data.result.diagnosis) ex.diagnosis = data.result.diagnosis;
      if (data.result.next_step_short) ex.next_step_short = data.result.next_step_short;
      if (data.result.next_step_qualifier) ex.next_step_qualifier = data.result.next_step_qualifier;
      ex.diagnosis_metadata = {
        regenerated_at: data.result.generated_at,
        assessment: data.result.diagnosis_assessment,
        timeline_used: data.result.timeline_used,
      };

      // Re-render just the diagnosis list + next-step row + meta
      const listEl = document.querySelector(`[data-ex-diagnosis="${exId}"]`);
      if (listEl) listEl.innerHTML = diagnosisHtml(ex.diagnosis);
      const card = document.querySelector(`.v2-ex-card[data-ex="${exId}"]`);
      if (card) {
        const nameNext = card.querySelector('.v2-ex-next-step-text');
        if (nameNext) nameNext.textContent = ex.next_step_short;
        const qual = card.querySelector('.v2-ex-qualifier');
        if (qual) qual.textContent = ex.next_step_qualifier;
      }
      toast('Re-derived. Assessment: ' + (data.result.diagnosis_assessment || 'ok'), 'success');
    } catch (e) {
      toast('Re-derive failed: ' + e.message, 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = '⟳ Re-derive from artifacts'; }
    }
  }

  function toggleTimelineRest(btn) {
    const rest = btn.previousElementSibling;
    if (!rest) return;
    const showing = rest.style.display !== 'none';
    rest.style.display = showing ? 'none' : 'block';
    const count = rest.children.length;
    btn.innerHTML = showing ? `Show ${count} more ▾` : `Hide ${count} ▴`;
  }

  return { loadAndRender, toggle, regenerate, renderCard, bindActions, toggleTimelineRest, closeAll };
})();
