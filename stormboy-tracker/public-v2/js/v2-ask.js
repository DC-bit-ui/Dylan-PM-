/**
 * v2 ASK tab — launcher for the user's Claude Code Desktop.
 *
 * No chat UI here. The dashboard is the SOURCE OF INTELLIGENCE; Claude Code
 * Desktop is the INTERFACE. Click a curated question → clipboard gets a
 * ready-to-paste prompt that tells Claude to read specific files from the
 * shared-growth-memory bus (synced to the user's OneDrive) and answer.
 * Multi-turn happens naturally in the user's own Claude Code session, under
 * their flat-fee subscription. No metered API.
 *
 * Source of truth for questions: <bus>/ask-prompts/curated-questions.json
 * — editable by Dylan/Kieren directly; reloads on every fetch.
 */
(function() {
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        resolve();
      } catch (e) { reject(e); }
    });
  }

  // Open Claude Desktop with a pre-populated question via its registered
  // claude:// URL protocol handler. Uses a hidden iframe so the main page
  // isn't navigated away. URL form confirmed by inspecting Claude Desktop's
  // AppX bundle (Claude_pzs8sxrjxfjjc package, registered protocol 'claude').
  // 2026-05-18.
  const CLAUDE_DESKTOP_URL_LIMIT = 7000;  // generous; Windows handlers vary
  function openClaudeDesktop(prompt) {
    const url = 'claude://cowork/new?q=' + encodeURIComponent(prompt);
    if (url.length > CLAUDE_DESKTOP_URL_LIMIT) return { opened: false, reason: 'prompt-too-long' };
    let frame = document.getElementById('v2-claude-launcher-frame');
    if (!frame) {
      frame = document.createElement('iframe');
      frame.id = 'v2-claude-launcher-frame';
      frame.style.display = 'none';
      document.body.appendChild(frame);
    }
    frame.src = url;
    return { opened: true, url_length: url.length };
  }

  // Toast — brief non-blocking confirmation, with a "Show prompt" affordance
  // in case the deep link didn't fire (handler not installed, prompt blocked).
  function showToast(msg, opts) {
    let t = document.getElementById('v2-ask-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'v2-ask-toast';
      t.className = 'v2-ask-toast';
      document.body.appendChild(t);
    }
    const fallbackLink = opts && opts.onFallback
      ? ` <a href="#" class="v2-ask-toast-link" id="v2-ask-toast-fb">Show prompt</a>`
      : '';
    t.innerHTML = `<span>${msg}</span>${fallbackLink}`;
    t.classList.add('show');
    if (opts && opts.onFallback) {
      const fb = document.getElementById('v2-ask-toast-fb');
      if (fb) {
        fb.addEventListener('click', e => { e.preventDefault(); opts.onFallback(); t.classList.remove('show'); });
      }
    }
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), opts && opts.duration ? opts.duration : 5000);
  }

  function categoryById(data, id) {
    return (data.categories || []).find(c => c.id === id) || { label: id, icon: '·' };
  }

  function questionCardHtml(q, cat) {
    return `
      <button class="v2-ask-q-card" data-qid="${escapeHtml(q.id)}">
        <span class="v2-ask-q-icon">${escapeHtml(q.icon || cat.icon || '·')}</span>
        <span class="v2-ask-q-main">
          <span class="v2-ask-q-label">${escapeHtml(q.label)}</span>
          <span class="v2-ask-q-hint">${escapeHtml(q.hint || '')}</span>
        </span>
        <span class="v2-ask-q-cta">Pop into Claude Code →</span>
      </button>`;
  }

  function categoryHtml(cat, questions) {
    if (!questions.length) return '';
    return `
      <section class="v2-ask-category">
        <h3 class="v2-ask-cat-head"><span class="v2-ask-cat-icon">${escapeHtml(cat.icon)}</span>${escapeHtml(cat.label)}</h3>
        <div class="v2-ask-q-grid">
          ${questions.map(q => questionCardHtml(q, cat)).join('')}
        </div>
      </section>`;
  }

  function ensurePromptModal() {
    if (document.getElementById('v2-ask-prompt-modal')) return;
    const m = document.createElement('div');
    m.id = 'v2-ask-prompt-modal';
    m.className = 'v2-ask-prompt-modal';
    m.innerHTML = `
      <div class="v2-ask-prompt-card">
        <div class="v2-ask-prompt-head">
          <div>
            <div class="v2-ask-prompt-title">Prompt copied · paste into Claude Code Desktop</div>
            <div class="v2-ask-prompt-sub" id="v2-ask-prompt-sub">—</div>
          </div>
          <button class="v2-ask-prompt-close" data-ask-close>✕</button>
        </div>
        <div class="v2-ask-prompt-steps">
          <ol>
            <li>The prompt is already on your clipboard.</li>
            <li>Open your Claude Code Desktop window (or any Claude surface with file access to your OneDrive).</li>
            <li>Paste and send. Claude will read the source files from your synced bus and answer in your own session — where you can multi-turn naturally.</li>
          </ol>
        </div>
        <div class="v2-ask-prompt-body-label">Preview (full prompt)</div>
        <textarea class="v2-ask-prompt-body" id="v2-ask-prompt-body" readonly></textarea>
        <div class="v2-ask-prompt-foot">
          <button id="v2-ask-prompt-recopy" class="v2-ask-prompt-btn">Copy again</button>
          <span id="v2-ask-prompt-msg" class="v2-ask-prompt-msg">✓ on your clipboard</span>
        </div>
      </div>`;
    document.body.appendChild(m);
    m.addEventListener('click', e => {
      if (e.target.matches('[data-ask-close]') || e.target === m) close();
    });
    document.getElementById('v2-ask-prompt-recopy').addEventListener('click', async () => {
      const body = document.getElementById('v2-ask-prompt-body').value;
      try {
        await copyToClipboard(body);
        const msg = document.getElementById('v2-ask-prompt-msg');
        msg.textContent = '✓ copied again';
        setTimeout(() => { msg.textContent = '✓ on your clipboard'; }, 1200);
      } catch (_) {}
    });
  }

  function close() {
    const m = document.getElementById('v2-ask-prompt-modal');
    if (m) m.classList.remove('show');
  }

  // Cache the last fetched prompt so the fallback "Show prompt" link can
  // open the modal without re-fetching.
  let _lastPrompt = null;

  async function fetchPrompt(qid) {
    const r = await fetch('/api/ask/prompt/' + encodeURIComponent(qid));
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }

  function showModalWithPrompt(data) {
    ensurePromptModal();
    document.getElementById('v2-ask-prompt-sub').textContent =
      data.label + ' · sources: ' + (data.brain_sources || []).length;
    document.getElementById('v2-ask-prompt-body').value = data.prompt;
    document.getElementById('v2-ask-prompt-msg').textContent = '✓ on your clipboard';
    document.getElementById('v2-ask-prompt-msg').style.color = '#3a6b3a';
    document.getElementById('v2-ask-prompt-modal').classList.add('show');
  }

  // Primary action: click question → deep-link Claude Desktop → done.
  // Clipboard copy happens silently as backup. Toast confirms; "Show prompt"
  // link in the toast opens the full modal if the deep link didn't fire.
  async function launchPromptFor(qid, qLabel) {
    let data;
    try {
      data = await fetchPrompt(qid);
    } catch (e) {
      showToast(`Couldn't load prompt: ${escapeHtml(e.message)}`, { duration: 6000 });
      return;
    }
    _lastPrompt = data;
    // Silent clipboard copy as a backup path
    copyToClipboard(data.prompt).catch(() => {});
    // Fire the deep link
    const launch = openClaudeDesktop(data.prompt);
    if (launch.opened) {
      showToast(
        `Opening Claude Desktop with: <strong>${escapeHtml(qLabel)}</strong>`,
        { duration: 6000, onFallback: () => showModalWithPrompt(data) }
      );
    } else {
      // URL too long — fall through to modal with clipboard
      showModalWithPrompt(data);
      showToast(
        `Prompt too long for direct launch — opened the preview, also on your clipboard`,
        { duration: 6000 }
      );
    }
  }

  async function render(container) {
    container.innerHTML = `
      <div class="v2-ask-launcher">
        <div class="v2-ask-launcher-head">
          <h2>Ask the team brain</h2>
          <p class="v2-ask-launcher-sub">
            Pick a question — your Claude Desktop opens with the question
            pre-filled and pointed at the relevant bus files. Multi-turn
            happens in your own Claude session. Uses your subscription, no
            API cost. <em>First click prompts Windows to confirm opening
            Claude Desktop; tick "Always allow" so future clicks are silent.</em>
          </p>
        </div>
        <div id="v2-ask-launcher-list"><div class="v2-empty">Loading…</div></div>
      </div>`;
    try {
      const r = await fetch('/api/ask/prompts');
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      if (data.error) {
        document.getElementById('v2-ask-launcher-list').innerHTML =
          `<div class="v2-empty" style="color:#a64545">Curated questions unavailable: ${escapeHtml(data.error)}</div>`;
        return;
      }
      const byCat = {};
      (data.questions || []).forEach(q => {
        const c = q.category || 'uncategorised';
        (byCat[c] = byCat[c] || []).push(q);
      });
      const html = (data.categories || []).map(cat => categoryHtml(cat, byCat[cat.id] || [])).join('');
      const list = document.getElementById('v2-ask-launcher-list');
      list.innerHTML = html || '<div class="v2-empty">No curated questions in the bus yet. Add them to shared-growth-memory/ask-prompts/curated-questions.json.</div>';
      list.addEventListener('click', e => {
        const btn = e.target.closest('.v2-ask-q-card');
        if (!btn) return;
        const qid = btn.dataset.qid;
        const label = btn.querySelector('.v2-ask-q-label').textContent;
        launchPromptFor(qid, label);
      });
    } catch (e) {
      document.getElementById('v2-ask-launcher-list').innerHTML =
        `<div class="v2-empty" style="color:#a64545">Load failed: ${escapeHtml(e.message)}</div>`;
    }
  }

  v2Shell.register('ask', render);
})();
