/**
 * v2 MESSAGING tab — marketing-side intelligence drawn from team interactions.
 *
 * Sub-tabs:
 *   1. Resonance map — verbatim phrases the team has used across categories,
 *      attributed to each rep. The "what's working in 1:1 conversations" view
 *      that marketing should borrow from.
 *   2. Current Campaign (placeholder, pending Dylan staging the campaign brief
 *      into memory/marketing/)
 *   3. Refinements (placeholder, LLM-synthesis pass once both halves exist)
 */
(function() {
  let _activeSubtab = 'customer-themes';
  let _resonance = null;
  let _themes = null;
  let _filter = '';
  let _activeCategory = 'all';
  let _themeView = 'all';      // 'all' / 'landed' / 'friction'

  const SUBTABS = [
    { key: 'customer-themes', label: 'Customer themes', hint: 'Topics resonating with landholders · clustered from real conversations' },
    { key: 'language-bank',   label: 'Team language bank', hint: 'Verbatim phrases reps use · for tone/voice consistency' },
    { key: 'campaign',        label: 'Current campaign', hint: 'Active marketing brief (staged in memory/marketing/)' },
    { key: 'refinements',     label: 'Suggested refinements', hint: 'Where the campaign should adopt team-resonant language' },
  ];

  function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function repChipClass(slug) {
    return 'msg-rep-' + slug.replace(/[^a-z0-9]/gi, '');
  }

  async function loadResonance() {
    if (_resonance) return _resonance;
    const res = await fetch('/api/messaging/resonance');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    _resonance = await res.json();
    return _resonance;
  }

  function paintResonanceHost() {
    const host = document.getElementById('msg-resonance-host');
    if (!host) return;
    if (!_resonance) {
      host.innerHTML = '<div class="v2-loading" style="padding:24px">Loading resonance map…</div>';
      return;
    }
    const d = _resonance;
    if (d.error) {
      host.innerHTML = `<div class="v2-empty" style="color:#a64545;padding:24px">${escapeHtml(d.error)}</div>`;
      return;
    }
    const cats = d.categories || [];
    const filter = _filter.toLowerCase();
    const activeCat = _activeCategory;

    // Per-rep stats row
    const repStats = Object.entries(d.per_rep || {}).map(([slug, r]) => `
      <div class="msg-rep-stat ${repChipClass(slug)}">
        <div class="msg-rep-stat-name">${escapeHtml(r.name)}</div>
        <div class="msg-rep-stat-counts">${r.phrase_count} phrases · ${r.objection_count} objections</div>
      </div>
    `).join('');

    // Category filter pills
    const catPills = `
      <button class="msg-cat-pill${activeCat==='all'?' active':''}" data-cat="all">All categories · ${d.summary.total_phrases}</button>
      ${cats.map(c => `<button class="msg-cat-pill${activeCat===c.key?' active':''}" data-cat="${c.key}">${c.icon} ${escapeHtml(c.display)} · ${c.phrases.length}</button>`).join('')}
    `;

    // Render category sections (filtered)
    const shownCats = activeCat === 'all' ? cats : cats.filter(c => c.key === activeCat);
    const catBlocks = shownCats.map(c => {
      const phrases = (c.phrases || []).filter(p => !filter || p.phrase.toLowerCase().includes(filter) || p.rep.toLowerCase().includes(filter));
      if (!phrases.length) return '';
      return `
        <div class="msg-cat-block">
          <div class="msg-cat-head">
            <span class="msg-cat-icon">${c.icon}</span>
            <span class="msg-cat-title">${escapeHtml(c.display)}</span>
            <span class="msg-cat-count">${phrases.length}</span>
          </div>
          <div class="msg-phrase-grid">
            ${phrases.map(p => `
              <div class="msg-phrase-card ${repChipClass(p.slug)}">
                <div class="msg-phrase-text">"${escapeHtml(p.phrase)}"</div>
                <div class="msg-phrase-rep">${escapeHtml(p.rep)}${p.status === 'historical' ? ' · historical' : ''}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('') || '<div class="v2-empty" style="padding:24px">No phrases match the current filter.</div>';

    // Objection roll-up — show as a separate block underneath
    const objections = (d.objections || []).filter(o => !filter || o.objection.toLowerCase().includes(filter) || o.response.toLowerCase().includes(filter) || o.rep.toLowerCase().includes(filter));
    const objBlock = objections.length ? `
      <div class="msg-obj-section">
        <div class="msg-obj-head">
          <span class="msg-cat-icon">🛡</span>
          <span class="msg-cat-title">Objection handling across the team</span>
          <span class="msg-cat-count">${objections.length}</span>
        </div>
        <div class="msg-obj-list">
          ${objections.map(o => `
            <div class="msg-obj-card ${repChipClass(o.slug)}">
              <div class="msg-obj-objection"><span class="msg-obj-label">Objection</span> ${escapeHtml(o.objection)}</div>
              <div class="msg-obj-response"><span class="msg-obj-label">Response pattern</span> ${escapeHtml(o.response)}</div>
              ${o.outcome ? `<div class="msg-obj-outcome"><span class="msg-obj-label">Outcome</span> ${escapeHtml(o.outcome)}</div>` : ''}
              <div class="msg-obj-foot">
                <span class="msg-phrase-rep">${escapeHtml(o.rep)}</span>
                ${o.confidence ? `<span class="msg-obj-conf">${escapeHtml(o.confidence)}</span>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    host.innerHTML = `
      <div class="msg-summary-row">
        <div class="msg-summary-headline">
          <strong>${d.summary.total_phrases}</strong> verbatim phrases · <strong>${d.summary.total_objections}</strong> objection-response pairs · across <strong>${d.summary.reps_aggregated}</strong> reps
        </div>
        <div class="msg-rep-stats">${repStats}</div>
      </div>

      <div class="msg-filter-row">
        <input type="text" class="msg-filter-input" placeholder="Filter phrases by keyword (e.g. 'carbon', 'visit', 'data')" value="${escapeHtml(_filter)}" />
      </div>

      <div class="msg-cat-pill-row">${catPills}</div>

      <div class="msg-cat-blocks">${catBlocks}</div>

      ${objBlock}

      <div class="v2-stats-honesty" style="margin-top:18px">
        <span class="v2-stats-honesty-label">How to use</span>
        <span>These phrases are extracted from each rep's persona profile (auto-built from HubSpot engagement + Apex's multi-source enrichment when active). They're what's verifiably resonating in 1:1 conversations — not aspirational copy. Marketing should treat them as the test set for the active campaign: any campaign claim that doesn't echo at least one of these has a higher bar to clear.</span>
      </div>
    `;

    // Wire interactions
    host.querySelectorAll('.msg-cat-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        _activeCategory = btn.dataset.cat;
        paintResonanceHost();
      });
    });
    const filterInput = host.querySelector('.msg-filter-input');
    let timer = null;
    filterInput.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        _filter = filterInput.value.trim();
        paintResonanceHost();
      }, 200);
    });
    // Keep focus after re-render
    if (filterInput && document.activeElement !== filterInput && _filter) {
      const len = filterInput.value.length;
      filterInput.focus();
      filterInput.setSelectionRange(len, len);
    }
  }

  function renderResonance() {
    return `<div id="msg-resonance-host"><div class="v2-loading" style="padding:24px">Loading…</div></div>`;
  }

  // ============================ CUSTOMER THEMES ============================
  async function loadCustomerThemes() {
    if (_themes) return _themes;
    const res = await fetch('/api/messaging/customer-themes');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    _themes = await res.json();
    return _themes;
  }

  function renderCustomerThemes() {
    return `<div id="msg-themes-host"><div class="v2-loading" style="padding:24px">Loading customer themes from real conversations…</div></div>`;
  }

  function paintCustomerThemesHost() {
    const host = document.getElementById('msg-themes-host');
    if (!host) return;
    if (!_themes) {
      host.innerHTML = '<div class="v2-loading" style="padding:24px">Loading…</div>';
      return;
    }
    const d = _themes;
    if (d.error) {
      host.innerHTML = `<div class="v2-empty" style="color:#a64545;padding:24px">${escapeHtml(d.error)}</div>`;
      return;
    }
    const filter = _filter.toLowerCase();
    let themes = (d.themes || []);
    if (_themeView === 'landed') themes = themes.filter(t => t.land_rate >= 75);
    if (_themeView === 'friction') themes = themes.filter(t => t.friction_count > 0 || t.land_rate < 50);
    if (filter) themes = themes.filter(t =>
      t.theme.toLowerCase().includes(filter)
      || (t.member_labels || []).some(l => l.toLowerCase().includes(filter))
      || (t.customer_positions || []).some(p => (p.text || '').toLowerCase().includes(filter))
    );

    function landBadge(t) {
      if (t.land_rate >= 90) return `<span class="msg-theme-land high">${t.land_rate}% lands</span>`;
      if (t.land_rate >= 60) return `<span class="msg-theme-land med">${t.land_rate}% lands</span>`;
      if (t.friction_count > 0) return `<span class="msg-theme-land friction">${t.friction_count} friction · ${t.land_rate}% lands</span>`;
      return `<span class="msg-theme-land low">${t.land_rate}% lands</span>`;
    }

    function repPills(reps) {
      return (reps || []).map(r => `<span class="msg-rep-pill ${repChipClass(r.toLowerCase().replace(/[^a-z0-9]/g, ''))}">${escapeHtml(r)}</span>`).join('');
    }

    function surfaceTag(s) {
      const map = { 'farm visit': '🚜', 'call': '📞', 'email': '✉️' };
      return `${map[s] || '·'} ${s}`;
    }

    function customerVoiceCard(positions, quotes, max = 3) {
      // Combine, dedupe lightly by first 60 chars
      const items = [];
      const seen = new Set();
      (positions || []).slice(0, max + 3).forEach(p => {
        const k = (p.text || '').slice(0, 60);
        if (!k || seen.has(k)) return;
        seen.add(k);
        items.push({ ...p, kind: 'position' });
      });
      (quotes || []).slice(0, 2).forEach(q => {
        const k = (q.text || '').slice(0, 60);
        if (!k || seen.has(k)) return;
        seen.add(k);
        items.push({ ...q, kind: 'quote' });
      });
      return items.slice(0, max).map(item => `
        <div class="msg-voice-item ${item.landed === 'landed' ? 'landed' : (item.landed === 'friction' ? 'friction' : '')}">
          <div class="msg-voice-text">"${escapeHtml(item.text)}"</div>
          <div class="msg-voice-meta">${escapeHtml(item.rep || 'mixed')} · ${escapeHtml(surfaceTag(item.surface || '?'))}${item.landed && item.landed !== 'unknown' ? ' · ' + escapeHtml(item.landed) : ''}</div>
        </div>
      `).join('');
    }

    const themesHtml = themes.map(t => `
      <div class="msg-theme-card ${t.land_rate >= 75 ? 'lands' : (t.friction_count ? 'frictionful' : 'mixed')}">
        <div class="msg-theme-head">
          <div>
            <div class="msg-theme-title">${escapeHtml(t.theme)}</div>
            <div class="msg-theme-sub">${t.member_label_count || 1} label variant${(t.member_label_count || 1) === 1 ? '' : 's'} · ${t.occurrences} occurrence${t.occurrences === 1 ? '' : 's'} · surfaced by ${(t.reps || ['mixed']).join(', ')}</div>
          </div>
          ${landBadge(t)}
        </div>
        <div class="msg-theme-voice">
          ${customerVoiceCard(t.customer_positions, t.quotes)}
        </div>
        ${(t.member_labels || []).length > 1 ? `
          <details class="msg-theme-variants">
            <summary>Show ${t.member_labels.length} topic-label variants</summary>
            <ul>${t.member_labels.map(l => `<li>${escapeHtml(l)}</li>`).join('')}</ul>
          </details>
        ` : ''}
      </div>
    `).join('') || '<div class="v2-empty" style="padding:24px">No themes match the current filter/view.</div>';

    host.innerHTML = `
      <div class="msg-summary-row">
        <div class="msg-summary-headline">
          <strong>${d.summary.total_topic_distillates}</strong> conversation distillates · clustered into <strong>${d.themes.length}</strong> themes · <strong>${d.summary.overall_land_rate}%</strong> overall land rate
        </div>
        <div class="msg-summary-headline" style="margin-top:4px">
          Sources: ${d.summary.sources_loaded.map(s => `${escapeHtml(s.label)} (${s.distillates})`).join(' · ')}
        </div>
      </div>

      <div class="msg-filter-row">
        <input type="text" class="msg-filter-input" placeholder="Filter themes by keyword (e.g. 'cost', 'additionality', 'horizon')" value="${escapeHtml(_filter)}" />
      </div>

      <div class="msg-cat-pill-row">
        <button class="msg-cat-pill${_themeView==='all'?' active':''}" data-view="all">All themes · ${d.themes.length}</button>
        <button class="msg-cat-pill${_themeView==='landed'?' active':''}" data-view="landed">Strong-landing (≥75%) · ${d.themes.filter(t => t.land_rate >= 75).length}</button>
        <button class="msg-cat-pill${_themeView==='friction'?' active':''}" data-view="friction">Friction zones · ${d.themes.filter(t => t.friction_count > 0 || t.land_rate < 50).length}</button>
        <button class="v2-wt-range-btn" id="msg-themes-refresh" style="margin-left:auto" title="Re-cluster from cached distillates (force Haiku refresh)">⟳ Re-cluster</button>
      </div>

      <div class="msg-themes-grid">${themesHtml}</div>

      <div class="v2-stats-honesty" style="margin-top:18px">
        <span class="v2-stats-honesty-label">How marketing should use this</span>
        <span>Strong-landing themes (top of the list, high land rate) are messaging the campaign should anchor on — these are claims the team can credibly make because the customer is already responding. Friction zones are objections marketing should pre-empt in copy. Customer voice quotes are real landholder phrasings — borrow tone, not just content.</span>
      </div>
    `;

    host.querySelectorAll('.msg-cat-pill[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        _themeView = btn.dataset.view;
        paintCustomerThemesHost();
      });
    });
    const filterInput = host.querySelector('.msg-filter-input');
    let timer = null;
    filterInput.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        _filter = filterInput.value.trim();
        paintCustomerThemesHost();
      }, 200);
    });
    if (filterInput && _filter) { filterInput.focus(); filterInput.setSelectionRange(_filter.length, _filter.length); }

    const refresh = host.querySelector('#msg-themes-refresh');
    if (refresh) {
      refresh.addEventListener('click', async () => {
        const orig = refresh.textContent;
        refresh.disabled = true;
        refresh.textContent = '⟳ Re-clustering…';
        try {
          const res = await fetch('/api/messaging/customer-themes?force=1');
          if (!res.ok) throw new Error('HTTP ' + res.status);
          _themes = await res.json();
          paintCustomerThemesHost();
        } catch (e) {
          refresh.textContent = 'Failed: ' + e.message;
          setTimeout(() => { refresh.textContent = orig; }, 4000);
        } finally {
          refresh.disabled = false;
        }
      });
    }
  }

  function renderCampaign() {
    return `
      <div class="v2-stats-card">
        <div class="v2-stats-head">
          <h3>Current campaign brief — placeholder</h3>
          <p>This tab activates once a campaign brief is staged at <code>memory/marketing/current-campaign-&lt;date&gt;.md</code>. The dashboard then renders the brief here and uses it as the input to the "Refinements" tab.</p>
        </div>
        <div class="v2-empty">
          To stage: drop the latest campaign brief (headlines, channels, key claims) into <code>memory/marketing/</code> with a date-stamped filename. Once present, this view auto-renders it.
        </div>
      </div>
    `;
  }

  function renderRefinements() {
    return `
      <div class="v2-stats-card">
        <div class="v2-stats-head">
          <h3>Suggested refinements — placeholder</h3>
          <p>Once a campaign brief is staged, this tab runs an LLM pass over: <strong>campaign claims × team-resonant phrases</strong> → recommendations for where the campaign should adopt language that's already proven in 1:1 conversations, and where claims diverge from what the team can credibly say in person.</p>
        </div>
        <div class="v2-empty">Pending campaign brief staging.</div>
      </div>
    `;
  }

  async function activateSubtab(key) {
    _activeSubtab = key;
    document.querySelectorAll('.msg-subtab').forEach(t => t.classList.toggle('active', t.dataset.tab === key));
    const target = document.getElementById('msg-pane');
    if (key === 'customer-themes') {
      target.innerHTML = renderCustomerThemes();
      try {
        await loadCustomerThemes();
        paintCustomerThemesHost();
      } catch (e) {
        document.getElementById('msg-themes-host').innerHTML = `<div class="v2-empty" style="color:#a64545;padding:24px">Customer themes failed: ${escapeHtml(e.message)}</div>`;
      }
    } else if (key === 'language-bank') {
      target.innerHTML = renderResonance();
      try {
        await loadResonance();
        paintResonanceHost();
      } catch (e) {
        document.getElementById('msg-resonance-host').innerHTML = `<div class="v2-empty" style="color:#a64545;padding:24px">Language bank failed: ${escapeHtml(e.message)}</div>`;
      }
    } else if (key === 'campaign') {
      target.innerHTML = renderCampaign();
    } else if (key === 'refinements') {
      target.innerHTML = renderRefinements();
    }
  }

  async function render(container) {
    container.innerHTML = `
      <div class="v2-section-header">
        <h2 class="v2-section-title">Messaging · what resonates with landholders</h2>
        <p class="v2-section-sub">marketing intelligence drawn from the team's actual 1:1 conversations. borrow what's already proven, refine the campaign against what the team can credibly say.</p>
      </div>

      <div class="v2-stats-layout">
        <nav class="v2-stats-vnav">
          ${SUBTABS.map(t => `<button class="v2-stats-vtab msg-subtab" data-tab="${t.key}"><div class="v2-stats-vtab-label">${escapeHtml(t.label)}</div><div class="v2-stats-vtab-hint">${escapeHtml(t.hint)}</div></button>`).join('')}
        </nav>
        <div class="v2-stats-pane" id="msg-pane"></div>
      </div>
    `;
    container.querySelectorAll('.msg-subtab').forEach(t => t.addEventListener('click', () => activateSubtab(t.dataset.tab)));
    await activateSubtab('customer-themes');
  }

  v2Shell.register('messaging', render);
})();
