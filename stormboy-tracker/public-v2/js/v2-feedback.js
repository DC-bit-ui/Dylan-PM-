/**
 * v2-feedback — floating "Report" button + modal form, plus helpers any
 * tab can use to query/render feedback for a specific target.
 *
 * The button installs itself once on DOMContentLoaded. Clicking opens a
 * modal that posts to POST /api/feedback. The modal pre-fills target_kind
 * and target_id when given context — opens via v2Feedback.open({...}).
 */
(function() {
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  const TYPES = [
    { v: 'error',       label: 'Error · system got this wrong' },
    { v: 'correction',  label: 'Correction · fact needs updating' },
    { v: 'preference',  label: 'Preference · how I want this to work' },
    { v: 'comment',     label: 'Comment · just noting this' },
  ];
  const TARGET_KINDS = [
    { v: 'system',     label: 'System (general)' },
    { v: 'suggestion', label: 'Suggestion the system made' },
    { v: 'deal',       label: 'Specific deal' },
    { v: 'contact',    label: 'Specific contact' },
    { v: 'persona',    label: 'Persona / rep profile' },
    { v: 'pattern',    label: 'Pattern in the bus' },
  ];
  const SEVERITIES = [
    { v: 'low',    label: 'Low — nice-to-have' },
    { v: 'medium', label: 'Medium — bug but not blocking' },
    { v: 'high',   label: 'High — actively wrong / urgent' },
  ];

  function ensureModal() {
    if (document.getElementById('v2-fb-modal')) return;
    const wrap = document.createElement('div');
    wrap.id = 'v2-fb-modal';
    wrap.className = 'v2-fb-modal';
    wrap.innerHTML = `
      <div class="v2-fb-modal-card">
        <div class="v2-fb-modal-head">
          <div class="v2-fb-modal-title">Report or comment</div>
          <button class="v2-fb-modal-close" data-fb-close>✕</button>
        </div>
        <form class="v2-fb-form" id="v2-fb-form">
          <label>
            <span>Type</span>
            <select name="type">${TYPES.map(t => `<option value="${t.v}">${escapeHtml(t.label)}</option>`).join('')}</select>
          </label>
          <label>
            <span>About</span>
            <select name="target_kind">${TARGET_KINDS.map(t => `<option value="${t.v}">${escapeHtml(t.label)}</option>`).join('')}</select>
          </label>
          <label class="v2-fb-target-id-wrap">
            <span>Target ID <em>(optional · deal_id, contact_id, pattern slug, etc.)</em></span>
            <input type="text" name="target_id" placeholder="leave blank for system-wide">
          </label>
          <label>
            <span>Severity</span>
            <select name="severity">${SEVERITIES.map(s => `<option value="${s.v}"${s.v === 'medium' ? ' selected' : ''}>${escapeHtml(s.label)}</option>`).join('')}</select>
          </label>
          <label>
            <span>Title <em>(one-line summary, ≤200 chars)</em></span>
            <input type="text" name="title" maxlength="200" required>
          </label>
          <label>
            <span>Body <em>(what's wrong / what you want / context)</em></span>
            <textarea name="body" rows="6"></textarea>
          </label>
          <div class="v2-fb-form-foot">
            <button type="button" class="v2-fb-btn-secondary" data-fb-close>Cancel</button>
            <button type="submit" class="v2-fb-btn-primary">Save feedback</button>
          </div>
          <div class="v2-fb-form-msg" id="v2-fb-form-msg"></div>
        </form>
      </div>
    `;
    document.body.appendChild(wrap);

    wrap.addEventListener('click', e => {
      if (e.target.matches('[data-fb-close]') || e.target === wrap) close();
    });

    document.getElementById('v2-fb-form').addEventListener('submit', async e => {
      e.preventDefault();
      const form = e.target;
      const data = Object.fromEntries(new FormData(form));
      if (!data.target_id) delete data.target_id;
      // Capture the current view automatically so we know where the user was
      data.system_context = {
        source_view: location.pathname + location.hash,
        captured_at: new Date().toISOString(),
      };
      const msg = document.getElementById('v2-fb-form-msg');
      msg.textContent = 'Saving…';
      try {
        const res = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const out = await res.json();
        if (!res.ok) throw new Error(out.error || ('HTTP ' + res.status));
        msg.textContent = '✓ Saved · id ' + out.id;
        msg.style.color = '#3a6b3a';
        form.reset();
        setTimeout(() => { close(); msg.textContent = ''; }, 1500);
      } catch (e) {
        msg.textContent = 'Failed: ' + e.message;
        msg.style.color = '#a64545';
      }
    });
  }

  function open(prefill) {
    ensureModal();
    const modal = document.getElementById('v2-fb-modal');
    modal.classList.add('show');
    if (prefill) {
      const form = document.getElementById('v2-fb-form');
      if (prefill.type) form.elements.type.value = prefill.type;
      if (prefill.target_kind) form.elements.target_kind.value = prefill.target_kind;
      if (prefill.target_id) form.elements.target_id.value = prefill.target_id;
      if (prefill.severity) form.elements.severity.value = prefill.severity;
      if (prefill.title) form.elements.title.value = prefill.title;
      if (prefill.body) form.elements.body.value = prefill.body;
    }
    setTimeout(() => { document.getElementById('v2-fb-form').elements.title.focus(); }, 50);
  }
  function close() {
    const modal = document.getElementById('v2-fb-modal');
    if (modal) modal.classList.remove('show');
  }

  function installButton() {
    if (document.getElementById('v2-fb-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'v2-fb-btn';
    btn.className = 'v2-fb-btn-floating';
    btn.title = 'Report an error / preference / comment about the system';
    btn.innerHTML = '💬 Report';
    btn.addEventListener('click', () => open({}));
    document.body.appendChild(btn);
  }

  // Fetch + render a compact feedback list for a specific target. Used by
  // deal-expand and other point-of-use views.
  async function loadForTarget(kind, id) {
    try {
      const res = await fetch(`/api/feedback?target_kind=${encodeURIComponent(kind)}&target_id=${encodeURIComponent(id)}&status=open`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.items || [];
    } catch (_) { return []; }
  }
  function renderListInline(items) {
    if (!items || !items.length) return '';
    return `
      <div class="v2-fb-inline">
        <div class="v2-fb-inline-head">⚠ ${items.length} open feedback on this target</div>
        ${items.map(i => `
          <div class="v2-fb-inline-item sev-${escapeHtml(i.severity)}">
            <span class="v2-fb-inline-type">${escapeHtml(i.type)}</span>
            <span class="v2-fb-inline-title">${escapeHtml(i.title)}</span>
            <span class="v2-fb-inline-date">${(i.created_at || '').slice(0,10)}</span>
          </div>
        `).join('')}
      </div>`;
  }

  document.addEventListener('DOMContentLoaded', installButton);

  window.v2Feedback = { open, close, loadForTarget, renderListInline };
})();
