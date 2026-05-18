/**
 * v2-intelligence — UI helpers for the API-free intelligence pipeline.
 *
 * Two affordances:
 *   1. v2Intelligence.runBundle({ purpose, system_prompt, input_data, ... })
 *      Creates a bundle on the server, opens a modal with the markdown
 *      prompt and a "Copy" button + a "Paste result back" textarea + a
 *      "Wait for Cowork" path. User can either:
 *        a) Copy → open Claude Code in another window → paste prompt →
 *           Claude reads + writes the result file directly. Dashboard
 *           polls and shows result automatically.
 *        b) Copy → claude.ai web → run → paste output back here.
 *        c) Do nothing — Cowork's scheduled task picks it up next run.
 *
 *   2. v2Intelligence.installPanel(container) renders a queue/results
 *      summary into any container — used by the HEALTH tab.
 */
(function() {
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  // Deep-link helper — same pattern as v2-ask.js. Duplicated for now;
  // consolidate when a third consumer appears.
  const CLAUDE_DESKTOP_URL_LIMIT = 7000;
  function openClaudeDesktop(prompt) {
    const url = 'claude://cowork/new?q=' + encodeURIComponent(prompt);
    if (url.length > CLAUDE_DESKTOP_URL_LIMIT) return { opened: false, reason: 'prompt-too-long', length: url.length };
    let frame = document.getElementById('v2-claude-launcher-frame');
    if (!frame) {
      frame = document.createElement('iframe');
      frame.id = 'v2-claude-launcher-frame';
      frame.style.display = 'none';
      document.body.appendChild(frame);
    }
    frame.src = url;
    return { opened: true, length: url.length };
  }

  function ensureModal() {
    if (document.getElementById('v2-ib-modal')) return;
    const wrap = document.createElement('div');
    wrap.id = 'v2-ib-modal';
    wrap.className = 'v2-ib-modal';
    wrap.innerHTML = `
      <div class="v2-ib-modal-card">
        <div class="v2-ib-modal-head">
          <div>
            <div class="v2-ib-modal-title">Intelligence bundle</div>
            <div class="v2-ib-modal-sub" id="v2-ib-sub">Subscription compute · no API call</div>
          </div>
          <button class="v2-ib-modal-close" data-ib-close>✕</button>
        </div>
        <div class="v2-ib-modal-body">
          <div class="v2-ib-section v2-ib-primary-action">
            <div class="v2-ib-section-head"><span>Process this bundle now</span></div>
            <button id="v2-ib-launch" class="v2-ib-btn-primary v2-ib-btn-launch">↗ Open in Claude Desktop</button>
            <div class="v2-ib-section-hint">
              Opens your Claude Desktop with the bundle prompt pre-filled.
              Claude reads + writes the result file directly — no paste-back
              needed. Uses your subscription, instant.
            </div>
            <div class="v2-ib-section-hint v2-ib-launch-warning" id="v2-ib-launch-warning" style="display:none">
              ⚠ Bundle is large (over ~7KB) — direct launch unavailable.
              Use the copy + paste flow below instead.
            </div>
          </div>
          <div class="v2-ib-section">
            <div class="v2-ib-section-head"><span>Or wait for Cowork</span></div>
            <div class="v2-ib-section-hint">
              Cowork's <code>apex-process-intelligence</code> scheduled task picks
              up queued bundles every 2h and processes them automatically. Just
              close this modal — the bundle is already written to the bus.
              Status will move from <em>queued</em> → <em>completed</em> on its own.
            </div>
          </div>
          <details class="v2-ib-section v2-ib-fallback">
            <summary>Or copy the prompt manually (fallback)</summary>
            <div style="margin-top:10px">
              <div class="v2-ib-section-head">
                <span>The prompt markdown</span>
                <button id="v2-ib-copy" class="v2-ib-btn-secondary">Copy markdown</button>
              </div>
              <textarea id="v2-ib-prompt" readonly rows="8"></textarea>
              <div class="v2-ib-section-head" style="margin-top:14px">
                <span>Paste result back here (if processed elsewhere)</span>
              </div>
              <textarea id="v2-ib-result" rows="5" placeholder="Paste the JSON output Claude returned, then click Submit"></textarea>
              <div class="v2-ib-section-foot">
                <button id="v2-ib-submit" class="v2-ib-btn-primary">Submit result</button>
                <span id="v2-ib-msg" class="v2-ib-msg"></span>
              </div>
            </div>
          </details>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);
    wrap.addEventListener('click', e => {
      if (e.target.matches('[data-ib-close]') || e.target === wrap) close();
    });
    document.getElementById('v2-ib-copy').addEventListener('click', () => {
      const t = document.getElementById('v2-ib-prompt');
      t.select();
      try { document.execCommand('copy'); } catch (_) {}
      const btn = document.getElementById('v2-ib-copy');
      const orig = btn.textContent;
      btn.textContent = 'Copied ✓';
      setTimeout(() => { btn.textContent = orig; }, 1200);
    });
    document.getElementById('v2-ib-launch').addEventListener('click', () => {
      const prompt = document.getElementById('v2-ib-prompt').value;
      if (!prompt) return;
      const r = openClaudeDesktop(prompt);
      const btn = document.getElementById('v2-ib-launch');
      const orig = btn.textContent;
      if (r.opened) {
        btn.textContent = '✓ Launched';
        btn.disabled = true;
        setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 2500);
      } else {
        document.getElementById('v2-ib-launch-warning').style.display = '';
        btn.disabled = true;
        btn.textContent = 'Too long — use copy flow';
      }
    });
  }

  function close() {
    const m = document.getElementById('v2-ib-modal');
    if (m) m.classList.remove('show');
  }

  async function runBundle(spec) {
    ensureModal();
    const modal = document.getElementById('v2-ib-modal');
    const sub = document.getElementById('v2-ib-sub');
    const prompt = document.getElementById('v2-ib-prompt');
    const msg = document.getElementById('v2-ib-msg');
    const submitBtn = document.getElementById('v2-ib-submit');
    msg.textContent = 'Creating bundle…';
    msg.style.color = '#555';
    prompt.value = '';
    modal.classList.add('show');

    let bundleId = null;
    try {
      const r = await fetch('/api/intelligence/bundles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spec),
      });
      const meta = await r.json();
      if (!r.ok) throw new Error(meta.error || ('HTTP ' + r.status));
      bundleId = meta.id;
      sub.innerHTML = `Bundle <code>${escapeHtml(meta.id)}</code> · status <strong>${meta.status}</strong> · purpose ${escapeHtml(meta.purpose)}`;
      const r2 = await fetch('/api/intelligence/bundles/' + meta.id);
      const detail = await r2.json();
      prompt.value = detail.markdown || '';
      // Direct-launch viability check: if the URL-encoded prompt would exceed
      // the protocol-handler limit, surface the warning and disable launch.
      const urlLen = ('claude://cowork/new?q=' + encodeURIComponent(prompt.value)).length;
      const launchBtn = document.getElementById('v2-ib-launch');
      const launchWarning = document.getElementById('v2-ib-launch-warning');
      if (urlLen > CLAUDE_DESKTOP_URL_LIMIT) {
        launchBtn.disabled = true;
        launchBtn.textContent = 'Too long — use copy flow';
        launchWarning.style.display = '';
      } else {
        launchBtn.disabled = false;
        launchBtn.textContent = '↗ Open in Claude Desktop';
        launchWarning.style.display = 'none';
      }
      msg.textContent = 'Bundle written to bus.';
      msg.style.color = '#3a6b3a';
    } catch (e) {
      msg.textContent = 'Failed: ' + e.message;
      msg.style.color = '#a64545';
    }

    const newSubmit = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newSubmit, submitBtn);
    newSubmit.addEventListener('click', async () => {
      if (!bundleId) { msg.textContent = 'No bundle to submit to.'; return; }
      const raw = document.getElementById('v2-ib-result').value.trim();
      if (!raw) { msg.textContent = 'Paste a result first.'; return; }
      let parsed;
      try { parsed = JSON.parse(raw); }
      catch (_) { parsed = raw; }
      msg.textContent = 'Submitting…';
      try {
        const r3 = await fetch(`/api/intelligence/results/${bundleId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ result: parsed, completed_by: 'manual_paste' }),
        });
        const out = await r3.json();
        if (!r3.ok) throw new Error(out.error || ('HTTP ' + r3.status));
        msg.textContent = '✓ Saved to ' + out.result_file;
        msg.style.color = '#3a6b3a';
        setTimeout(close, 1500);
      } catch (e) {
        msg.textContent = 'Failed: ' + e.message;
        msg.style.color = '#a64545';
      }
    });

    return bundleId;
  }

  async function fetchQueueSummary() {
    try {
      const r = await fetch('/api/intelligence/bundles');
      if (!r.ok) return null;
      return await r.json();
    } catch (_) { return null; }
  }

  function renderQueueWidget(data) {
    if (!data) return '';
    const s = data.stats || {};
    const queued = (s.by_status && s.by_status.queued) || 0;
    const cls = queued > 5 ? 'status-warn' : 'status-ok';
    const purposes = Object.entries(s.by_purpose || {}).map(([k, v]) => `<span class="v2-health-pill">${escapeHtml(k)}: ${v}</span>`).join('');
    return `
      <div class="v2-health-card ${cls}">
        <div class="v2-health-card-head">⚡ Intelligence queue</div>
        <div class="v2-health-card-big">${queued} <span class="v2-health-soft">queued</span></div>
        <div class="v2-health-card-sub">${s.total || 0} total · claimed: ${(s.by_status && s.by_status.claimed) || 0} · completed: ${(s.by_status && s.by_status.completed) || 0} · failed: ${(s.by_status && s.by_status.failed) || 0}</div>
        <div class="v2-health-card-meta">${purposes || '(no bundles yet — no synthesis flows migrated)'}</div>
        <div class="v2-health-target">Bundles get processed by Cowork's scheduled apex-process-intelligence task (every 2h) or by an interactive Claude Code session. Zero metered-API cost.</div>
      </div>`;
  }

  window.v2Intelligence = { runBundle, fetchQueueSummary, renderQueueWidget };
})();
