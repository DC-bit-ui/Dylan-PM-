/**
 * v2 ASK tab — command-palette launcher for Claude Code Desktop.
 *
 * Rewritten 2026-05-26 from the category-card grid into a launcher-first
 * command-palette UX. Same data source (bus curated questions), same
 * launch mechanism (claude:// deep link → user's subscription), but a
 * dramatically faster path from intent → fired prompt.
 *
 * SURFACE LAYOUT
 *
 *   ┌ Ask the team brain ─────────────────────────────────┐
 *   │ 🔍 [ free-form ask bar with autocomplete         ] │
 *   │                                                      │
 *   │ Recent           [recent strip — last 5 fired]      │
 *   │ Suggested        [contextual — based on recent      │
 *   │                   dashboard views]                   │
 *   │                                                      │
 *   │ Browse curated   [collapsed categories]             │
 *   └─────────────────────────────────────────────────────┘
 *
 *   Selecting a question shows an INLINE PREVIEW that replaces the
 *   browse area: the constructed prompt + bus files it'll read + an
 *   editable textarea + Open-in-Claude / Copy / Cancel buttons.
 *
 * COST MODEL · $0 metered
 *   No Anthropic API calls. Everything fires through claude:// deep
 *   link → user's own Claude Code Desktop subscription. Reaffirmed
 *   2026-05-26 — inline answer rendering would re-introduce metered
 *   cost (the very thing the bundle/subscription migration eliminated).
 *
 * SOURCE OF TRUTH
 *   shared-growth-memory/ask-prompts/curated-questions.json
 *   — team-editable. The dashboard is a launcher, not a writer.
 */
(function() {

  // ===========================================================================
  // Utility — escape, copy, deep-link, fuzzy match, localStorage helpers
  // ===========================================================================
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
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); document.execCommand('copy');
        document.body.removeChild(ta); resolve();
      } catch (e) { reject(e); }
    });
  }

  const CLAUDE_DESKTOP_URL_LIMIT = 7000;
  function openClaudeDesktop(prompt) {
    const url = 'claude://cowork/new?q=' + encodeURIComponent(prompt);
    if (url.length > CLAUDE_DESKTOP_URL_LIMIT) return { opened: false, reason: 'prompt-too-long' };
    let frame = document.getElementById('v2-claude-launcher-frame');
    if (!frame) {
      frame = document.createElement('iframe');
      frame.id = 'v2-claude-launcher-frame'; frame.style.display = 'none';
      document.body.appendChild(frame);
    }
    frame.src = url;
    return { opened: true, url_length: url.length };
  }

  // Cheap fuzzy match: case-insensitive token contains. Returns score
  // (higher = better) or 0 for no match. Used by the autocomplete.
  function fuzzyScore(query, label, hint, body) {
    const q = (query || '').toLowerCase().trim();
    if (!q) return 0;
    const tokens = q.split(/\s+/).filter(Boolean);
    const haystacks = [
      { text: (label || '').toLowerCase(),  weight: 3 },
      { text: (hint || '').toLowerCase(),   weight: 2 },
      { text: (body || '').toLowerCase(),   weight: 1 },
    ];
    let score = 0;
    for (const tok of tokens) {
      let bestForToken = 0;
      for (const h of haystacks) {
        if (h.text.includes(tok)) {
          // Bonus if the token starts at a word boundary
          const idx = h.text.indexOf(tok);
          const boundary = idx === 0 || /\s/.test(h.text.charAt(idx - 1));
          bestForToken = Math.max(bestForToken, h.weight + (boundary ? 1 : 0));
        }
      }
      if (bestForToken === 0) return 0; // every token must appear somewhere
      score += bestForToken;
    }
    return score;
  }

  // LocalStorage helpers — recent prompts + recent tab views
  const LS = {
    RECENT_PROMPTS: 'v2-ask-recent-prompts',     // array of {id, label, ts}
    RECENT_VIEWS:   'v2-ask-recent-views',        // array of {tab, section, ts}
  };
  function lsGet(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (_) { return fallback; }
  }
  function lsSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  }
  function recordRecentPrompt(id, label) {
    const list = lsGet(LS.RECENT_PROMPTS, []);
    const next = [{ id, label, ts: Date.now() }, ...list.filter(x => x.id !== id)].slice(0, 12);
    lsSet(LS.RECENT_PROMPTS, next);
  }
  function recordRecentView(tab) {
    if (!tab) return;
    const list = lsGet(LS.RECENT_VIEWS, []);
    const next = [{ tab, ts: Date.now() }, ...list.filter(x => x.tab !== tab)].slice(0, 8);
    lsSet(LS.RECENT_VIEWS, next);
  }

  // Capture which top-level tab the user is on (from URL hash). Called
  // by the shell elsewhere; here we listen for hashchange.
  function currentTab() {
    const h = (location.hash || '').replace(/^#/, '').split('/')[0];
    return h || 'ask';
  }
  function attachTabRecorder() {
    window.addEventListener('hashchange', () => {
      const t = currentTab();
      if (t && t !== 'ask') recordRecentView(t);
    });
    // Record current tab on mount too
    const t = currentTab();
    if (t && t !== 'ask') recordRecentView(t);
  }

  // Map tab → suggested question IDs. Lightweight curated mapping;
  // can grow over time as more questions are added to the bus file.
  // Falls back to top-3 from the catalog if no mapping exists.
  const TAB_TO_SUGGESTED_IDS = {
    'work':   ['cold-open-framings', 'i-just-graze-objection', '25-pct-too-high', 'horizon-snapshot-power'],
    'stats':  ['ben-curiosity-frame', 'team-patterns-25pp-gap', 'team-patterns-friction-stages'],
    'brain':  ['hobbs-handbook-overview', 'cold-open-framings', '25-yr-too-long'],
    'messaging': ['team-patterns-25pp-gap', 'hobbs-handbook-overview'],
    'health': ['operational-stuck-tickets', 'operational-snapshot-bottleneck'],
  };

  // ===========================================================================
  // State + render
  // ===========================================================================
  let _data = null;        // /api/ask/prompts response
  let _query = '';
  let _selectedQid = null; // currently previewed
  let _selectedPrompt = null;

  // ===========================================================================
  // Network — fetch catalog + per-question prompt
  // ===========================================================================
  async function fetchCatalog() {
    const r = await fetch('/api/ask/prompts');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }
  async function fetchPromptForId(qid) {
    const r = await fetch('/api/ask/prompt/' + encodeURIComponent(qid));
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }

  // ===========================================================================
  // Toast — brief non-blocking confirmation
  // ===========================================================================
  function showToast(msg, opts) {
    let t = document.getElementById('v2-ask-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'v2-ask-toast';
      t.className = 'v2-ask-toast';
      document.body.appendChild(t);
    }
    t.innerHTML = `<span>${msg}</span>`;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), opts && opts.duration ? opts.duration : 4000);
  }

  // ===========================================================================
  // Card components
  // ===========================================================================
  function questionById(qid) {
    return (_data && _data.questions || []).find(q => q.id === qid);
  }
  function categoryById(catId) {
    return (_data && _data.categories || []).find(c => c.id === catId)
        || { label: catId, icon: '·' };
  }

  function chipRow(label, ids, slotId) {
    const items = ids
      .map(id => questionById(id))
      .filter(Boolean)
      .map(q => `
        <button class="v2-ask-chip" data-qid="${escapeHtml(q.id)}" title="${escapeHtml(q.hint || '')}">
          <span class="v2-ask-chip-icon">${escapeHtml(q.icon || categoryById(q.category).icon || '·')}</span>
          <span class="v2-ask-chip-label">${escapeHtml(q.label)}</span>
        </button>`).join('');
    if (!items) return '';
    return `
      <div class="v2-ask-row">
        <div class="v2-ask-row-label">${escapeHtml(label)}</div>
        <div class="v2-ask-chips" id="${escapeHtml(slotId)}">${items}</div>
      </div>`;
  }

  function recentRow() {
    const recent = lsGet(LS.RECENT_PROMPTS, []);
    if (!recent.length) {
      return `
        <div class="v2-ask-row v2-ask-row-muted">
          <div class="v2-ask-row-label">Recent</div>
          <div class="v2-ask-chips-empty">Your last-asked questions will appear here.</div>
        </div>`;
    }
    return chipRow('Recent', recent.map(r => r.id), 'v2-ask-recent-row');
  }

  function contextualRow() {
    const views = lsGet(LS.RECENT_VIEWS, []);
    // Aggregate: combine suggested-ids from each recently-viewed tab
    const ids = [];
    const seen = new Set();
    views.forEach(v => {
      const list = TAB_TO_SUGGESTED_IDS[v.tab] || [];
      list.forEach(id => { if (!seen.has(id)) { seen.add(id); ids.push(id); } });
    });
    // Fallback: top-3 questions if no view history yet
    if (!ids.length && _data && _data.questions) {
      _data.questions.slice(0, 3).forEach(q => ids.push(q.id));
    }
    if (!ids.length) return '';
    const tabsViewed = views.map(v => v.tab).join(' · ');
    const label = views.length
      ? `Based on your recent views (${tabsViewed})`
      : 'Suggested starting points';
    return chipRow(label, ids.slice(0, 6), 'v2-ask-contextual-row');
  }

  function autocompleteList() {
    if (!_query) return '';
    const matches = (_data && _data.questions || [])
      .map(q => ({ q, score: fuzzyScore(_query, q.label, q.hint, q.question) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
    if (!matches.length) {
      return `
        <div class="v2-ask-autocomplete v2-ask-autocomplete-empty">
          <div class="v2-ask-ac-empty">
            No curated question matches "<strong>${escapeHtml(_query)}</strong>".
            <br><span class="v2-ask-ac-empty-sub">Press Enter to send your raw question to Claude Desktop anyway — it'll figure out which bus files to read.</span>
          </div>
        </div>`;
    }
    return `
      <div class="v2-ask-autocomplete">
        ${matches.map((m, i) => `
          <button class="v2-ask-ac-item ${i === 0 ? 'v2-ask-ac-active' : ''}" data-qid="${escapeHtml(m.q.id)}">
            <span class="v2-ask-ac-icon">${escapeHtml(m.q.icon || categoryById(m.q.category).icon || '·')}</span>
            <span class="v2-ask-ac-main">
              <span class="v2-ask-ac-label">${escapeHtml(m.q.label)}</span>
              <span class="v2-ask-ac-hint">${escapeHtml(m.q.hint || '')}</span>
            </span>
            <span class="v2-ask-ac-cat">${escapeHtml(categoryById(m.q.category).label)}</span>
          </button>`).join('')}
      </div>`;
  }

  function browseHtml() {
    if (!_data || !_data.categories) return '';
    const byCat = {};
    (_data.questions || []).forEach(q => {
      const k = q.category || 'uncategorised';
      (byCat[k] = byCat[k] || []).push(q);
    });
    const cats = _data.categories.map(cat => {
      const qs = byCat[cat.id] || [];
      if (!qs.length) return '';
      return `
        <details class="v2-ask-browse-cat">
          <summary class="v2-ask-browse-summary">
            <span class="v2-ask-browse-icon">${escapeHtml(cat.icon)}</span>
            <span class="v2-ask-browse-label">${escapeHtml(cat.label)}</span>
            <span class="v2-ask-browse-count">${qs.length}</span>
          </summary>
          <div class="v2-ask-browse-list">
            ${qs.map(q => `
              <button class="v2-ask-browse-item" data-qid="${escapeHtml(q.id)}">
                <span class="v2-ask-browse-q-label">${escapeHtml(q.label)}</span>
                <span class="v2-ask-browse-q-hint">${escapeHtml(q.hint || '')}</span>
              </button>`).join('')}
          </div>
        </details>`;
    }).join('');
    return `
      <div class="v2-ask-browse">
        <div class="v2-ask-browse-head">
          <h3>Browse curated questions</h3>
          <span class="v2-ask-browse-subhead">${(_data.questions || []).length} questions · authored in <code>shared-growth-memory/ask-prompts/curated-questions.json</code></span>
        </div>
        ${cats}
      </div>`;
  }

  function previewHtml() {
    if (!_selectedQid || !_selectedPrompt) return '';
    const d = _selectedPrompt;
    const sources = (d.brain_sources || [])
      .map(s => `<li><code>${escapeHtml(s)}</code></li>`)
      .join('') || '<li><em>no source files specified — Claude will use its own context</em></li>';
    return `
      <div class="v2-ask-preview">
        <div class="v2-ask-preview-head">
          <div>
            <div class="v2-ask-preview-label">Preview</div>
            <div class="v2-ask-preview-title">${escapeHtml(d.label)}</div>
          </div>
          <button class="v2-ask-preview-close" data-action="cancel" title="Close preview">✕</button>
        </div>
        <div class="v2-ask-preview-body-row">
          <div class="v2-ask-preview-prompt-section">
            <label class="v2-ask-preview-sub-label">Prompt (editable — your edits ship to Claude)</label>
            <textarea class="v2-ask-preview-textarea" id="v2-ask-preview-textarea">${escapeHtml(d.prompt)}</textarea>
          </div>
          <div class="v2-ask-preview-sources">
            <label class="v2-ask-preview-sub-label">Bus files Claude will read</label>
            <ul class="v2-ask-preview-sources-list">${sources}</ul>
            <div class="v2-ask-preview-meta">
              <div>${(d.brain_sources || []).length} file${(d.brain_sources || []).length === 1 ? '' : 's'} · ~${Math.round(d.prompt.length / 4)} tokens</div>
            </div>
          </div>
        </div>
        <div class="v2-ask-preview-actions">
          <button class="v2-ask-btn-primary" data-action="fire">Open in Claude Desktop →</button>
          <button class="v2-ask-btn-secondary" data-action="copy">Copy prompt</button>
          <button class="v2-ask-btn-tertiary" data-action="cancel">Cancel</button>
        </div>
      </div>`;
  }

  function fullHtml() {
    return `
      <div class="v2-ask-launcher">
        <header class="v2-ask-head">
          <h2>Ask the team brain</h2>
          <p class="v2-ask-sub">
            Type what you want to know, pick from suggestions, or browse the curated set below.
            Each question opens your Claude Desktop with the right bus files pointed at — multi-turn
            happens in your own session. No metered API.
          </p>
        </header>
        <div class="v2-ask-search-wrap">
          <span class="v2-ask-search-icon">🔍</span>
          <input
            type="text"
            id="v2-ask-search"
            class="v2-ask-search-input"
            placeholder="Ask anything…  e.g. 'why is South East LLS converting 9%?'"
            autocomplete="off"
            spellcheck="false"
            value="${escapeHtml(_query)}"
          />
          <kbd class="v2-ask-search-kbd">↵</kbd>
        </div>
        <div id="v2-ask-autocomplete-slot">${autocompleteList()}</div>
        <div id="v2-ask-preview-slot">${previewHtml()}</div>
        <div id="v2-ask-rows-slot" ${_selectedQid ? 'style="display:none"' : ''}>
          ${recentRow()}
          ${contextualRow()}
        </div>
        <div id="v2-ask-browse-slot" ${_selectedQid ? 'style="display:none"' : ''}>${browseHtml()}</div>
      </div>`;
  }

  // ===========================================================================
  // Event wiring
  // ===========================================================================
  let _root = null;
  let _rerenderInFlight = false;
  function rerender() {
    if (!_root || _rerenderInFlight) return;
    _rerenderInFlight = true;
    requestAnimationFrame(() => {
      _root.innerHTML = fullHtml();
      wireEvents();
      // Restore focus + cursor to search if user was typing
      const inp = document.getElementById('v2-ask-search');
      if (inp && _query && !_selectedQid) {
        inp.focus();
        inp.setSelectionRange(_query.length, _query.length);
      }
      _rerenderInFlight = false;
    });
  }

  async function selectQuestion(qid) {
    const q = questionById(qid);
    if (!q) return;
    try {
      _selectedPrompt = await fetchPromptForId(qid);
      _selectedQid = qid;
      recordRecentPrompt(qid, q.label);
      rerender();
    } catch (e) {
      showToast(`Couldn't load prompt: ${escapeHtml(e.message)}`);
    }
  }

  function deselect() {
    _selectedQid = null;
    _selectedPrompt = null;
    rerender();
  }

  function fireCurrentPrompt() {
    const ta = document.getElementById('v2-ask-preview-textarea');
    const prompt = ta ? ta.value : (_selectedPrompt && _selectedPrompt.prompt);
    if (!prompt) return;
    copyToClipboard(prompt).catch(() => {});
    const launch = openClaudeDesktop(prompt);
    if (launch.opened) {
      showToast(`Opened Claude Desktop with: <strong>${escapeHtml(_selectedPrompt.label)}</strong>`, { duration: 5000 });
      deselect();
    } else {
      showToast(`Prompt too long for direct launch — copied to clipboard. Paste in Claude Desktop manually.`, { duration: 7000 });
    }
  }

  async function fireRawQuery() {
    if (!_query.trim()) return;
    // Build a raw "ask the brain" prompt with the user's query as-is.
    // Claude in Cowork can read the bus from there; we don't need to
    // specify sources for an unknown query.
    const prompt = `Read whatever you need from the shared-growth-memory bus on my OneDrive (Claude Code Projects/shared-growth-memory) and answer this question for me:\n\n> ${_query.trim()}\n\nLead with the answer, then evidence. Cite the source files inline. If the bus doesn't ground a clear answer, say so.`;
    copyToClipboard(prompt).catch(() => {});
    const launch = openClaudeDesktop(prompt);
    if (launch.opened) {
      showToast(`Opened Claude Desktop with your question`, { duration: 4500 });
      _query = '';
      rerender();
    } else {
      showToast(`Prompt too long — copied to clipboard.`, { duration: 6000 });
    }
  }

  function wireEvents() {
    const root = _root;
    // Search input — typeahead
    const inp = root.querySelector('#v2-ask-search');
    if (inp) {
      inp.addEventListener('input', () => {
        _query = inp.value;
        rerender();
      });
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          // Pick top autocomplete match if any, else fire raw query
          const ac = root.querySelector('.v2-ask-ac-item');
          if (ac) {
            selectQuestion(ac.dataset.qid);
          } else if (_query.trim()) {
            fireRawQuery();
          }
        } else if (e.key === 'Escape') {
          _query = '';
          rerender();
        }
      });
    }
    // Autocomplete clicks
    root.querySelectorAll('.v2-ask-ac-item').forEach(el => {
      el.addEventListener('click', () => selectQuestion(el.dataset.qid));
    });
    // Recent + contextual chip clicks
    root.querySelectorAll('.v2-ask-chip').forEach(el => {
      el.addEventListener('click', () => selectQuestion(el.dataset.qid));
    });
    // Browse list clicks
    root.querySelectorAll('.v2-ask-browse-item').forEach(el => {
      el.addEventListener('click', () => selectQuestion(el.dataset.qid));
    });
    // Preview actions
    root.querySelectorAll('.v2-ask-preview [data-action]').forEach(el => {
      el.addEventListener('click', () => {
        const a = el.dataset.action;
        if (a === 'cancel') deselect();
        else if (a === 'fire') fireCurrentPrompt();
        else if (a === 'copy') {
          const ta = document.getElementById('v2-ask-preview-textarea');
          if (ta) copyToClipboard(ta.value).then(() => showToast('✓ Copied'));
        }
      });
    });
  }

  // ===========================================================================
  // Render entry
  // ===========================================================================
  async function render(container) {
    _root = container;
    attachTabRecorder();
    container.innerHTML = `<div class="v2-ask-launcher"><div class="v2-loading" style="padding:24px">Loading curated questions…</div></div>`;
    try {
      _data = await fetchCatalog();
      if (_data.error) {
        container.innerHTML = `<div class="v2-empty" style="color:#a64545;padding:24px">Curated questions unavailable: ${escapeHtml(_data.error)}</div>`;
        return;
      }
      rerender();
    } catch (e) {
      container.innerHTML = `<div class="v2-empty" style="color:#a64545;padding:24px">Load failed: ${escapeHtml(e.message)}</div>`;
    }
  }

  v2Shell.register('ask', render);
})();
