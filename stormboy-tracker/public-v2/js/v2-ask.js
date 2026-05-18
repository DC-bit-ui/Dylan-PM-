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

  async function showPromptFor(qid, qLabel) {
    ensurePromptModal();
    const sub = document.getElementById('v2-ask-prompt-sub');
    const body = document.getElementById('v2-ask-prompt-body');
    const msg = document.getElementById('v2-ask-prompt-msg');
    sub.textContent = qLabel + ' · fetching prompt…';
    body.value = '';
    msg.textContent = '';
    document.getElementById('v2-ask-prompt-modal').classList.add('show');
    try {
      const r = await fetch('/api/ask/prompt/' + encodeURIComponent(qid));
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      sub.textContent = qLabel + ' · sources: ' + (data.brain_sources || []).length;
      body.value = data.prompt;
      try {
        await copyToClipboard(data.prompt);
        msg.textContent = '✓ on your clipboard';
        msg.style.color = '#3a6b3a';
      } catch (_) {
        msg.textContent = 'Clipboard blocked — select all + copy manually';
        msg.style.color = '#a64545';
      }
    } catch (e) {
      sub.textContent = 'Failed: ' + e.message;
      msg.textContent = '';
    }
  }

  async function render(container) {
    container.innerHTML = `
      <div class="v2-ask-launcher">
        <div class="v2-ask-launcher-head">
          <h2>Ask the team brain</h2>
          <p class="v2-ask-launcher-sub">
            Pick a question. We'll copy a ready-to-paste prompt to your clipboard —
            paste it into your Claude Code Desktop and Claude reads the sourced
            files from your synced bus. Multi-turn happens in your own session.
            Uses your Claude subscription, no API cost.
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
        showPromptFor(qid, label);
      });
    } catch (e) {
      document.getElementById('v2-ask-launcher-list').innerHTML =
        `<div class="v2-empty" style="color:#a64545">Load failed: ${escapeHtml(e.message)}</div>`;
    }
  }

  v2Shell.register('ask', render);
})();
