/**
 * v2 ASK tab: query the team brain in natural language.
 *
 * The rep types a question; we POST /api/ask with it; Claude answers
 * with verbatim citations from Hobbs profile, the call distillates,
 * Ben, Claudia, and Will profiles. Each exchange shows in a conversation
 * thread above the input.
 *
 * Quick-prompt suggestions land common Storm Boy use-cases at one click.
 */
(function() {

  const SUGGESTED_PROMPTS = [
    {
      category: 'Cold outreach',
      icon: '📞',
      label: 'Cold-open framings that work',
      hint: 'Hobbs\'s verbatim openings + when each fits',
      question: 'What cold-open framings does Hobbs use that actually land? Give me his verbatim openings with the situations each fits.',
    },
    {
      category: 'Cold outreach',
      icon: '🙋',
      label: '"I\'m just a grazier" objection',
      hint: 'Disarming self-deprecation without flattery',
      question: 'A prospect says "I wouldn\'t say I do anything out of this world" — how does Hobbs handle that self-deprecation without flattery?',
    },
    {
      category: 'Objection handling',
      icon: '💸',
      label: '"25% is too high"',
      hint: 'Reframing the AgriProve fee structure',
      question: 'A landholder is pushing back on the 25% AgriProve share. How does the team handle this objection?',
    },
    {
      category: 'Objection handling',
      icon: '⏳',
      label: '"25 years is too long"',
      hint: 'Permanence + lock-in reframes',
      question: 'A landholder is worried about being locked in for 25 years. What\'s Hobbs\'s reframe + what does the AgriProve guide add?',
    },
    {
      category: 'Pre-visit prep',
      icon: '🗺️',
      label: 'On-farm sequence',
      hint: 'Hobbs\'s first 30-60 minutes',
      question: 'What does Hobbs do in the first 30-60 minutes on-farm? Give me his sequence so I can prepare for tomorrow\'s visit.',
    },
    {
      category: 'Pre-visit prep',
      icon: '📋',
      label: 'Pre-visit checklist for a specific contact',
      hint: 'What to bring, ask, prep before walking on-farm',
      question: 'I have a farm visit tomorrow with a Riverina grazier (~1500 ha). What should I prep, what should I bring, and what are the 3 most important questions to ask?',
    },
    {
      category: 'Re-engagement',
      icon: '🔄',
      label: 'Re-engage a stalled deal',
      hint: 'Breaking silence without generic check-ins',
      question: 'A landholder went silent after KCT was issued. What does Hobbs do to break the pattern without sending another generic check-in?',
    },
    {
      category: 'Re-engagement',
      icon: '📨',
      label: 'Nurture-back from a "no for now"',
      hint: 'Ben\'s HORIZON-snapshot tactic',
      question: 'What\'s Ben\'s nurture-back tactic for landholders who said no 6 months ago? Walk me through the framing he uses.',
    },
    {
      category: 'Team patterns',
      icon: '✨',
      label: 'What worked in the last 6 visits',
      hint: 'Patterns across distilled visits',
      question: 'Across the 6 most recent farm visits, what patterns emerged? Which framings landed and which didn\'t?',
    },
    {
      category: 'Team patterns',
      icon: '🎯',
      label: 'Ben\'s curiosity-frame cold open',
      hint: 'The validated framing producing bookings',
      question: 'Tell me about Ben\'s curiosity-frame cold-open pattern. Why is it working and how should I deploy it?',
    },
  ];

  function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Tiny markdown renderer for answer body: bold, blockquote, paragraphs.
  function renderMarkdown(md) {
    if (!md) return '';
    let lines = md.split('\n');
    const out = [];
    let inQuote = false;
    let buf = [];
    function flushPara() {
      if (buf.length) {
        out.push('<p>' + buf.join(' ') + '</p>');
        buf = [];
      }
    }
    for (let raw of lines) {
      const line = raw.trim();
      if (!line) {
        flushPara();
        if (inQuote) { out.push('</blockquote>'); inQuote = false; }
        continue;
      }
      if (line.startsWith('>')) {
        flushPara();
        if (!inQuote) { out.push('<blockquote class="v2-ask-q">'); inQuote = true; }
        out.push(formatInline(line.replace(/^>\s?/, '')));
        continue;
      }
      if (inQuote) { out.push('</blockquote>'); inQuote = false; }
      if (line.match(/^[-*]\s/)) {
        flushPara();
        out.push('<li>' + formatInline(line.replace(/^[-*]\s/, '')) + '</li>');
        continue;
      }
      if (line.match(/^#{1,6}\s/)) {
        flushPara();
        const level = line.match(/^(#+)/)[1].length;
        out.push(`<h${Math.min(level+2, 6)}>${formatInline(line.replace(/^#+\s/, ''))}</h${Math.min(level+2, 6)}>`);
        continue;
      }
      buf.push(formatInline(line));
    }
    flushPara();
    if (inQuote) out.push('</blockquote>');
    return out.join('\n').replace(/(<li>.*?<\/li>\s*)+/gs, m => '<ul>' + m + '</ul>');
  }

  function formatInline(s) {
    return escapeHtml(s)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  function confidenceBadge(c) {
    const m = { high: 'high · grounded', medium: 'medium', low: 'low · be careful' };
    return `<span class="v2-ask-conf v2-ask-conf-${c}">${m[c] || c}</span>`;
  }

  function renderSources(sources) {
    if (!sources || !sources.length) return '';
    return `
      <div class="v2-ask-sources">
        <div class="v2-ask-sources-label">Sources</div>
        ${sources.map(s => `
          <div class="v2-ask-source">
            <div class="v2-ask-source-name">${escapeHtml(s.source)}</div>
            <div class="v2-ask-source-excerpt">${escapeHtml(s.excerpt || '')}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderExchange(ex) {
    return `
      <div class="v2-ask-exchange">
        <div class="v2-ask-q-block">
          <span class="v2-ask-q-tag">You</span>
          <div class="v2-ask-q-text">${escapeHtml(ex.question)}</div>
        </div>
        <div class="v2-ask-a-block">
          <div class="v2-ask-a-head">
            <span class="v2-ask-a-tag">Team brain</span>
            ${confidenceBadge(ex.confidence)}
            <span class="v2-ask-a-meta">${ex.model_used} · ${Math.round(ex.latency_ms / 100) / 10}s</span>
          </div>
          <div class="v2-ask-a-body">${renderMarkdown(ex.answer)}</div>
          ${renderSources(ex.sources)}
        </div>
      </div>
    `;
  }

  function renderSuggestions() {
    // Group prompts by category
    const byCategory = {};
    SUGGESTED_PROMPTS.forEach((p, i) => {
      if (!byCategory[p.category]) byCategory[p.category] = [];
      byCategory[p.category].push({ ...p, _idx: i });
    });
    const sections = Object.entries(byCategory).map(([cat, prompts]) => `
      <div class="v2-ask-suggest-section">
        <div class="v2-ask-suggest-cat">${escapeHtml(cat)}</div>
        <div class="v2-ask-suggest-grid">
          ${prompts.map(p => `
            <button class="v2-ask-suggest-card" data-suggest="${p._idx}">
              <span class="v2-ask-suggest-icon">${p.icon || '•'}</span>
              <span class="v2-ask-suggest-text">
                <span class="v2-ask-suggest-label">${escapeHtml(p.label)}</span>
                <span class="v2-ask-suggest-hint">${escapeHtml(p.hint || '')}</span>
              </span>
            </button>
          `).join('')}
        </div>
      </div>
    `).join('');
    return `<div class="v2-ask-suggestions">${sections}</div>`;
  }

  let _exchanges = [];
  let _container = null;

  function paint() {
    if (!_container) return;
    const conv = _container.querySelector('.v2-ask-conv');
    if (!conv) return;
    if (!_exchanges.length) {
      conv.innerHTML = `
        <div class="v2-ask-empty">
          <h3>Ask the team brain</h3>
          <p>Hobbs's framings, Ben's call patterns, Claudia's operating model — queryable in natural language. Cites verbatim from the source material so you know it's real.</p>
          ${renderSuggestions()}
        </div>
      `;
    } else {
      const pending = _container.querySelector('.v2-ask-input').dataset.pending === 'true';
      conv.innerHTML = `
        <div class="v2-ask-thread-bar">
          <span class="v2-ask-thread-count">${_exchanges.length} ${_exchanges.length === 1 ? 'question' : 'questions'} in this thread</span>
          <div class="v2-ask-thread-actions">
            <button class="v2-ask-thread-btn" onclick="v2AskBackToSuggestions()">← Back to suggestions</button>
            <button class="v2-ask-thread-btn danger" onclick="v2AskClearThread()">Clear thread</button>
          </div>
        </div>
        ${_exchanges.map(renderExchange).join('')}
        ${pending ? `<div class="v2-ask-thinking">Team brain thinking… (Haiku call, usually 5-10s)</div>` : ''}
      `;
      conv.scrollTop = conv.scrollHeight;
    }
    bindSuggestions();
  }

  // Exposed globally for inline onclick handlers
  window.v2AskBackToSuggestions = function() {
    if (!_container) return;
    // Scroll to top to reveal a suggestion strip without dropping the thread
    const conv = _container.querySelector('.v2-ask-conv');
    if (!conv) return;
    // Toggle a suggestion overlay state
    const existing = conv.querySelector('.v2-ask-overlay-suggestions');
    if (existing) { existing.remove(); return; }
    const overlay = document.createElement('div');
    overlay.className = 'v2-ask-overlay-suggestions';
    overlay.innerHTML = `
      <div class="v2-ask-overlay-head">
        <span>Suggested questions</span>
        <button class="v2-ask-thread-btn" onclick="this.closest('.v2-ask-overlay-suggestions').remove()">Close</button>
      </div>
      ${renderSuggestions()}
    `;
    conv.insertBefore(overlay, conv.firstChild);
    overlay.scrollIntoView({ behavior: 'smooth', block: 'start' });
    bindSuggestions();
  };

  window.v2AskClearThread = function() {
    if (!_exchanges.length) return;
    if (!confirm('Clear the current conversation? This drops the memory and starts fresh.')) return;
    _exchanges = [];
    paint();
  };

  function bindSuggestions() {
    if (!_container) return;
    // Card buttons in the new empty state + overlay
    _container.querySelectorAll('.v2-ask-suggest-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.suggest, 10);
        const p = SUGGESTED_PROMPTS[idx];
        if (!p) return;
        const input = _container.querySelector('.v2-ask-input');
        input.value = p.question;
        // Close the overlay if we're inside one
        const overlay = btn.closest('.v2-ask-overlay-suggestions');
        if (overlay) overlay.remove();
        input.focus();
        submit();
      });
    });
  }

  async function submit() {
    const input = _container.querySelector('.v2-ask-input');
    const q = input.value.trim();
    if (!q || input.dataset.pending === 'true') return;
    input.dataset.pending = 'true';
    input.disabled = true;
    paint();
    try {
      // Send last 10 exchanges as conversation memory. Server trims further.
      const history = _exchanges.slice(-10).map(ex => ({
        question: ex.question,
        answer: ex.answer,
        sources: ex.sources || [],
        confidence: ex.confidence || 'medium',
      }));
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, history }),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      _exchanges.push(data);
      input.value = '';
    } catch (e) {
      _exchanges.push({
        question: q,
        answer: `**Error:** ${e.message}`,
        sources: [],
        confidence: 'low',
        model_used: 'error',
        latency_ms: 0,
        asked_at: new Date().toISOString(),
      });
    } finally {
      input.dataset.pending = 'false';
      input.disabled = false;
      paint();
      input.focus();
    }
  }

  function render(container) {
    _container = container;
    container.innerHTML = `
      <div class="v2-section-header">
        <h2 class="v2-section-title">Ask the team</h2>
        <p class="v2-section-sub">"Ask Hobbs" · "Ask the team" · natural-language queries against the captured intelligence layer. cites verbatim from profiles + distillates.</p>
      </div>

      <div class="v2-ask-shell">
        <div class="v2-ask-conv"></div>
        <div class="v2-ask-input-row">
          <textarea class="v2-ask-input" placeholder="Ask the team brain anything — pre-visit prep, objection handling, what worked for similar prospects…" rows="2"></textarea>
          <button class="v2-ask-send">Ask &rarr;</button>
        </div>
      </div>
    `;

    const input = container.querySelector('.v2-ask-input');
    const sendBtn = container.querySelector('.v2-ask-send');
    sendBtn.addEventListener('click', submit);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
        e.preventDefault();
        submit();
      }
    });

    paint();
  }

  v2Shell.register('ask', render);
})();
