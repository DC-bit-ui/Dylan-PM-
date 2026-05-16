/**
 * v2 BRAIN tab: browsable team intelligence.
 *
 * Two surfaces:
 *   1. Profiles — Hobbs / Ben / Claudia / Will. Sticky TOC + rendered markdown.
 *      For browsing patterns when you don't know what to ask.
 *   2. Distillates — 6 farm visits + 6 calls as cards. For seeing what the
 *      team has actually done in the field, topic by topic.
 *
 * Filter box at top filters TOC sections + distillate cards by keyword.
 */
(function() {

  const PROFILES = ['hobbs', 'ben', 'claudia', 'will', 'kieren', 'bill-hyem'];
  let _activeProfile = 'hobbs';
  let _filter = '';
  let _container = null;
  let _profileCache = {};
  let _distillates = null;
  let _objectionCards = null;

  function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Lightweight markdown renderer tuned for the profile shape: headers,
  // lists, paragraphs, **bold**, *italic*, blockquotes, inline `code`.
  function renderMarkdown(md, tocSlugMap) {
    if (!md) return '';
    const lines = md.split('\n');
    const out = [];
    let inList = false;
    let inCodeBlock = false;
    let inBlockquote = false;
    let inTable = false;
    let tableHeaders = [];
    let buf = [];

    function flushPara() {
      if (buf.length) {
        out.push('<p>' + buf.join(' ') + '</p>');
        buf = [];
      }
    }
    function closeList() { if (inList) { out.push('</ul>'); inList = false; } }
    function closeBlockquote() { if (inBlockquote) { out.push('</blockquote>'); inBlockquote = false; } }
    function closeTable() {
      if (inTable) {
        out.push('</tbody></table>');
        inTable = false;
        tableHeaders = [];
      }
    }

    for (let raw of lines) {
      const line = raw.replace(/\r$/, '');

      // Code blocks
      if (line.trim().startsWith('```')) {
        flushPara(); closeList(); closeBlockquote(); closeTable();
        if (inCodeBlock) { out.push('</pre>'); inCodeBlock = false; }
        else { out.push('<pre class="v2-brain-code">'); inCodeBlock = true; }
        continue;
      }
      if (inCodeBlock) { out.push(escapeHtml(line)); continue; }

      // Headers
      const h = line.match(/^(#{1,6})\s+(.+)$/);
      if (h) {
        flushPara(); closeList(); closeBlockquote(); closeTable();
        const level = h[1].length;
        const text = h[2].trim();
        const tagLevel = Math.min(level + 1, 6);
        const slug = tocSlugMap && tocSlugMap[text];
        const id = slug ? ` id="toc-${slug}"` : '';
        out.push(`<h${tagLevel}${id}>${formatInline(text)}</h${tagLevel}>`);
        continue;
      }

      // Tables (basic GFM)
      if (line.match(/^\|.*\|$/)) {
        flushPara(); closeList(); closeBlockquote();
        const cells = line.slice(1, -1).split('|').map(c => c.trim());
        if (cells.every(c => /^[-: ]+$/.test(c))) {
          // separator row — already opened thead, now open tbody
          out.push('</thead><tbody>');
          continue;
        }
        if (!inTable) {
          out.push('<table class="v2-brain-table"><thead>');
          inTable = true;
          tableHeaders = cells;
          out.push('<tr>' + cells.map(c => `<th>${formatInline(c)}</th>`).join('') + '</tr>');
        } else {
          out.push('<tr>' + cells.map(c => `<td>${formatInline(c)}</td>`).join('') + '</tr>');
        }
        continue;
      } else if (inTable) {
        closeTable();
      }

      // Blockquote
      if (line.startsWith('>')) {
        flushPara(); closeList();
        if (!inBlockquote) { out.push('<blockquote>'); inBlockquote = true; }
        out.push(formatInline(line.replace(/^>\s?/, '')));
        continue;
      }
      closeBlockquote();

      // List
      if (line.match(/^\s*[-*+]\s+/)) {
        flushPara();
        if (!inList) { out.push('<ul>'); inList = true; }
        out.push('<li>' + formatInline(line.replace(/^\s*[-*+]\s+/, '')) + '</li>');
        continue;
      }
      if (line.match(/^\s*\d+\.\s+/)) {
        flushPara();
        if (!inList) { out.push('<ol>'); inList = true; }
        out.push('<li>' + formatInline(line.replace(/^\s*\d+\.\s+/, '')) + '</li>');
        continue;
      }
      closeList();

      // Empty line: flush
      if (!line.trim()) { flushPara(); continue; }

      // Plain paragraph buffer
      buf.push(formatInline(line));
    }
    flushPara(); closeList(); closeBlockquote(); closeTable();
    if (inCodeBlock) out.push('</pre>');
    return out.join('\n');
  }

  function formatInline(s) {
    return escapeHtml(s)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  }

  function matchesFilter(text) {
    if (!_filter) return true;
    return text.toLowerCase().includes(_filter.toLowerCase());
  }

  // ---- distillate cards ----
  function distillateCard(d) {
    const outcomeClass = (d.outcome || '').includes('warm') ? 'warm' : (d.outcome || '').includes('neutral') ? 'neutral' : 'other';
    const topicsHtml = d.topics.slice(0, 2).map(t => `
      <div class="v2-brain-topic">
        <div class="v2-brain-topic-label">${escapeHtml(t.topic_label)}</div>
        ${t.customer_position ? `<div class="v2-brain-topic-line"><strong>Customer:</strong> ${escapeHtml(t.customer_position)}</div>` : ''}
        ${t.hobbs_response ? `<div class="v2-brain-topic-line"><strong>Hobbs:</strong> ${escapeHtml(t.hobbs_response)}</div>` : ''}
      </div>
    `).join('');
    const moreCount = d.topic_count > 2 ? `<span class="v2-brain-topic-more">+${d.topic_count - 2} more topics</span>` : '';
    return `
      <div class="v2-brain-dist-card">
        <div class="v2-brain-dist-head">
          <span class="v2-brain-dist-kind">${d.kind === 'farm_visit' ? 'farm visit' : 'call · ' + (d.call_type || '?').split('(')[0].trim()}</span>
          <span class="v2-brain-dist-outcome v2-brain-out-${outcomeClass}">${escapeHtml(d.outcome || '?')}</span>
        </div>
        <div class="v2-brain-dist-id">${escapeHtml(d.id)}</div>
        <div class="v2-brain-dist-region">${escapeHtml(d.region || '')}</div>
        <div class="v2-brain-dist-summary">${escapeHtml(d.one_line || '')}</div>
        ${topicsHtml}
        ${moreCount}
      </div>
    `;
  }

  // ---- main render ----
  async function paint() {
    if (!_container) return;

    // Load profile if not cached
    if (!_profileCache[_activeProfile]) {
      try {
        const res = await fetch('/api/brain/profile/' + _activeProfile);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        _profileCache[_activeProfile] = await res.json();
      } catch (e) {
        _container.querySelector('#brain-profile-pane').innerHTML = `<div class="v2-empty" style="color:#a64545">Profile load failed: ${escapeHtml(e.message)}</div>`;
        return;
      }
    }
    const profile = _profileCache[_activeProfile];

    // Build slug map for header anchor IDs
    const slugMap = {};
    profile.toc.forEach(t => { slugMap[t.text] = t.slug; });

    // TOC
    const tocHtml = profile.toc
      .filter(t => matchesFilter(t.text))
      .map(t => `<a href="#toc-${t.slug}" class="v2-brain-toc-link v2-brain-toc-l${t.level}" data-slug="${t.slug}">${escapeHtml(t.text)}</a>`)
      .join('');

    // Profile body
    const bodyHtml = renderMarkdown(profile.markdown, slugMap);

    _container.querySelector('#brain-profile-toc').innerHTML = tocHtml || '<div class="v2-empty" style="font-size:11px">No sections match the filter.</div>';
    _container.querySelector('#brain-profile-body').innerHTML = bodyHtml;
    _container.querySelector('#brain-profile-meta').innerHTML = `<strong>${escapeHtml(profile.name)}</strong> · ${escapeHtml(profile.description)} · ${profile.toc.length} sections · ${Math.round(profile.size_bytes / 1024)}KB`;

    // Wire TOC scrolling
    _container.querySelectorAll('.v2-brain-toc-link').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const slug = a.dataset.slug;
        const target = _container.querySelector('#toc-' + slug);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  // ---- objection cards ----
  function objectionCard(c) {
    const tags = (c.tags || []).map(t => `<span class="v2-brain-obj-tag tag-${t}">${t}</span>`).join('');
    const subtext = c.subtext ? `
      <div class="v2-brain-obj-section">
        <div class="v2-brain-obj-section-label">What they're actually saying</div>
        <div class="v2-brain-obj-section-body">${escapeHtml(c.subtext)}</div>
      </div>` : '';
    const closing = c.closing_line ? `
      <div class="v2-brain-obj-closing">
        <div class="v2-brain-obj-section-label">Closing line</div>
        <blockquote class="v2-brain-obj-closing-text">"${escapeHtml(c.closing_line)}"</blockquote>
      </div>` : '';
    return `
      <div class="v2-brain-obj-card">
        <div class="v2-brain-obj-head">
          <span class="v2-brain-obj-num">#${c.number}</span>
          <div class="v2-brain-obj-tags">${tags}</div>
        </div>
        <div class="v2-brain-obj-statement">"${escapeHtml(c.objection)}"</div>
        ${subtext}
        <div class="v2-brain-obj-section">
          <div class="v2-brain-obj-section-label">Hobbs's reframe</div>
          <blockquote class="v2-brain-obj-reframe">"${escapeHtml(c.reframe)}"</blockquote>
        </div>
        ${closing}
        <div class="v2-brain-obj-source">${escapeHtml(c.source)}</div>
      </div>
    `;
  }

  async function paintObjectionCards() {
    if (!_objectionCards) {
      try {
        const res = await fetch('/api/brain/objection-cards');
        _objectionCards = await res.json();
      } catch (e) {
        _container.querySelector('#brain-obj-grid').innerHTML = `<div class="v2-empty" style="color:#a64545">Objection cards failed to load</div>`;
        return;
      }
    }
    const all = _objectionCards.cards || [];
    const filtered = all.filter(c => {
      if (!_filter) return true;
      const blob = [c.objection, c.subtext, c.reframe, c.closing_line, ...(c.tags || [])].filter(Boolean).join(' ');
      return blob.toLowerCase().includes(_filter.toLowerCase());
    });
    _container.querySelector('#brain-obj-grid').innerHTML = filtered.length
      ? filtered.map(objectionCard).join('')
      : '<div class="v2-empty">No objection cards match the filter.</div>';
    _container.querySelector('#brain-obj-count').textContent = `${filtered.length} of ${all.length}`;
  }

  async function paintDistillates() {
    if (!_distillates) {
      try {
        const res = await fetch('/api/brain/distillates');
        _distillates = await res.json();
      } catch (e) {
        _container.querySelector('#brain-dist-grid').innerHTML = `<div class="v2-empty" style="color:#a64545">Distillates load failed</div>`;
        return;
      }
    }
    const all = [..._distillates.farm_visits, ..._distillates.calls];
    const filtered = all.filter(d => {
      if (!_filter) return true;
      const blob = [d.id, d.region, d.outcome, d.one_line, ...(d.topics || []).map(t => t.topic_label + ' ' + (t.customer_position || '') + ' ' + (t.hobbs_response || ''))].join(' ');
      return blob.toLowerCase().includes(_filter.toLowerCase());
    });
    _container.querySelector('#brain-dist-grid').innerHTML = filtered.length
      ? filtered.map(distillateCard).join('')
      : '<div class="v2-empty">No distillates match the filter.</div>';
    _container.querySelector('#brain-dist-count').textContent = `${filtered.length} of ${all.length}`;
  }

  function render(container) {
    _container = container;
    container.innerHTML = `
      <div class="v2-section-header">
        <h2 class="v2-section-title">Brain</h2>
        <p class="v2-section-sub">browse the captured intelligence. profiles tell you what the team does; distillates show what's happened in the field.</p>
      </div>

      <div class="v2-brain-filter-bar">
        <input type="text" class="v2-brain-filter" placeholder="Filter sections + distillates by keyword (e.g. '25%', 'cold open', 'ratchet')" />
        <div class="v2-brain-profile-chips">
          ${PROFILES.map(p => `<button class="v2-brain-chip${p === _activeProfile ? ' active' : ''}" data-p="${p}">${p}</button>`).join('')}
        </div>
        <button class="v2-brain-refresh" id="brain-refresh-btn" title="Rebuild this profile from live HubSpot (takes ~30s)">⟳ Rebuild from HubSpot</button>
      </div>

      <div class="v2-brain-profile-meta" id="brain-profile-meta">Loading…</div>

      <div class="v2-brain-layout">
        <nav class="v2-brain-toc" id="brain-profile-toc"><div class="v2-loading">Loading TOC…</div></nav>
        <div class="v2-brain-body" id="brain-profile-body"><div class="v2-loading">Loading profile…</div></div>
      </div>

      <div class="v2-brain-dist-section">
        <div class="v2-brain-dist-head-section">
          <h3>Objection plays · structured by Hobbs's handbook</h3>
          <span class="v2-brain-dist-count" id="brain-obj-count">…</span>
        </div>
        <div class="v2-brain-obj-grid" id="brain-obj-grid"><div class="v2-loading">Loading objection cards…</div></div>
      </div>

      <div class="v2-brain-dist-section">
        <div class="v2-brain-dist-head-section">
          <h3>Hobbs distillates · what happened on-farm and on the phone</h3>
          <span class="v2-brain-dist-count" id="brain-dist-count">…</span>
        </div>
        <div class="v2-brain-dist-grid" id="brain-dist-grid"><div class="v2-loading">Loading distillates…</div></div>
      </div>
    `;

    // Wire profile chips
    container.querySelectorAll('.v2-brain-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        _activeProfile = chip.dataset.p;
        container.querySelectorAll('.v2-brain-chip').forEach(c => c.classList.toggle('active', c === chip));
        // Bust profile cache so the rebuilt version (or original) is re-fetched
        delete _profileCache[_activeProfile];
        paint();
      });
    });

    // Wire rebuild button — triggers /api/brain/refresh-persona/:slug
    const rebuildBtn = container.querySelector('#brain-refresh-btn');
    rebuildBtn.addEventListener('click', async () => {
      const slug = _activeProfile;
      const original = rebuildBtn.textContent;
      rebuildBtn.disabled = true;
      rebuildBtn.textContent = '⟳ Rebuilding ' + slug + '…';
      try {
        const res = await fetch('/api/brain/refresh-persona/' + encodeURIComponent(slug), { method: 'POST' });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || 'HTTP ' + res.status);
        delete _profileCache[slug];
        await paint();
        rebuildBtn.textContent = '✓ Rebuilt — ' + (data.discovery ? (data.discovery.unique_contacts + ' contacts · ' + data.discovery.unique_deals + ' deals') : 'ok');
        setTimeout(() => { rebuildBtn.textContent = original; }, 4000);
      } catch (e) {
        rebuildBtn.textContent = 'Rebuild failed: ' + e.message;
        setTimeout(() => { rebuildBtn.textContent = original; }, 5000);
      } finally {
        rebuildBtn.disabled = false;
      }
    });

    // Wire filter
    const filterInput = container.querySelector('.v2-brain-filter');
    let filterTimer = null;
    filterInput.addEventListener('input', () => {
      clearTimeout(filterTimer);
      filterTimer = setTimeout(() => {
        _filter = filterInput.value.trim();
        paint();
        paintDistillates();
        paintObjectionCards();
      }, 200);
    });

    paint();
    paintObjectionCards();
    paintDistillates();
  }

  v2Shell.register('brain', render);
})();
