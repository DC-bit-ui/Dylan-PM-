// ═══════════════════════════════════════════
// HORIZON Snapshot Generator — Frontend App
// ═══════════════════════════════════════════

const state = {
  parsed: null,
  calcs: null,
  images: {},
  centroid: null,
  zoneStats: null,
  geojson: null,
  narratives: { page2: '', page4: '', email: '', growth: '' },
  apiReady: false,
  currentPage: 1,
  totalPages: 12,
  currentStep: 1,
  completedSteps: new Set(),
  devMode: false,
  loaded: false,
  source: 'upload',
  uploadedFile: null,
  geoContext: null,
  // Per-map pan/zoom transforms (page 3 model output maps).
  mapTransforms: {},
  // Manual narrative font-size overrides (px). When set for a page, autofit
  // is skipped and the override is used directly. { p2?: number, p4?: number }
  narrativeFontOverride: {},
  // Editorial memory — every guidance string entered during a regen gets
  // appended here. Sent with subsequent regens so the LLM stays consistent
  // across sections without the user having to repeat instructions. Reset
  // when a fresh snapshot is loaded. Shape: [{ section, guidance, ts }, ...]
  editGuidance: []
};

const PAGE_LABELS = [
  'Cover', 'HORIZON Analysis', 'Soil & Carbon Indicators', 'Portfolio & ACCU Potential',
  'Background', 'Economics', 'The AgriProve Difference', 'The AgriProve Advantage',
  'The AgriProve Process', 'Your ACCUs', 'The AgriProve Assessment', 'Contact Us'
];
const DYNAMIC_PAGES = new Set([1, 2, 3, 4, 6]);

const PIPELINE_DATA = [
  { id: 'snap-001', name: 'Dawlish Road', address: 'Dawlish Rd, Dorrigo NSW 2453', area: 39, rainfall: 1542, projects: 1, status: 'ready', statusLabel: 'Ready for Review', requestDate: '2026-05-03', requestedBy: 'Ben Sherry', hubspotStage: 'Snapshot Requested' },
  { id: 'snap-002', name: 'Castle Hill Station', address: 'Castle Hill, Longreach QLD 4730', area: 8336, rainfall: 640, projects: 11, status: 'ready', statusLabel: 'Ready for Review', requestDate: '2026-05-04', requestedBy: 'Ben Sherry', hubspotStage: 'Snapshot Requested' },
  { id: 'snap-003', name: 'Doongara Pastoral', address: 'Doongara Rd, Coonamble NSW 2829', area: 4120, rainfall: 480, projects: 6, status: 'in-progress', statusLabel: 'In Progress', requestDate: '2026-05-02', requestedBy: 'Ben Sherry', hubspotStage: 'Snapshot In Progress' },
  { id: 'snap-004', name: 'Wirrabilla', address: 'Wirrabilla Rd, Condobolin NSW 2877', area: 1850, rainfall: 410, projects: 3, status: 'complete', statusLabel: 'Complete', requestDate: '2026-04-28', requestedBy: 'Ben Sherry', hubspotStage: 'Snapshot Sent', completedDate: '2026-05-01' },
  { id: 'snap-005', name: 'Bellata Aggregation', address: 'Bellata NSW 2397', area: 6200, rainfall: 590, projects: 8, status: 'queued', statusLabel: 'Queued', requestDate: '2026-05-05', requestedBy: 'Growth Team', hubspotStage: 'Model Run Complete' },
  { id: 'snap-006', name: 'LawrieCo Holdings', address: 'Moree NSW 2400', area: 12400, rainfall: 570, projects: 16, status: 'queued', statusLabel: 'Queued', requestDate: '2026-05-05', requestedBy: 'Growth Team', hubspotStage: 'Model Run Complete' }
];
let pipelineFilter = 'all';

function renderPipeline() {
  const list = document.getElementById('pipelineList');
  if (!list) return;
  const filtered = pipelineFilter === 'all' ? PIPELINE_DATA : PIPELINE_DATA.filter(s => s.status === pipelineFilter);
  document.getElementById('pipelineCount').textContent = filtered.length;
  document.querySelectorAll('.pipe-filter').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`.pipe-filter[onclick*="${pipelineFilter}"]`);
  if (activeBtn) activeBtn.classList.add('active');
  if (!filtered.length) { list.innerHTML = '<div class="pipeline-empty">No snapshots match this filter.</div>'; return; }
  list.innerHTML = filtered.map(s => {
    const dateStr = s.status === 'complete' && s.completedDate ? `Completed ${s.completedDate}` : `Requested ${s.requestDate} by ${s.requestedBy}`;
    return `<div class="pipe-card" onclick="selectPipelineItem('${s.id}')" data-id="${s.id}">
      <div class="pipe-status ${s.status}">${s.statusLabel}</div>
      <div class="pipe-name">${s.name}</div>
      <div class="pipe-address">${s.address}</div>
      <div class="pipe-meta">
        <span class="pipe-meta-item"><strong>${s.area.toLocaleString()}</strong> ha</span>
        <span class="pipe-meta-item"><strong>${s.rainfall}</strong> mm</span>
        <span class="pipe-meta-item"><strong>${s.projects}</strong> project${s.projects !== 1 ? 's' : ''}</span>
      </div>
      <div class="pipe-date">${dateStr}</div>
    </div>`;
  }).join('');
}
function filterPipeline(status) { pipelineFilter = status; renderPipeline(); }
function selectPipelineItem(id) {
  const item = PIPELINE_DATA.find(s => s.id === id);
  if (!item) return;
  document.querySelectorAll('.pipe-card').forEach(c => c.classList.remove('selected'));
  const card = document.querySelector(`.pipe-card[data-id="${id}"]`);
  if (card) card.classList.add('selected');
  if (item.status === 'ready') toast(`${item.name} — switch to Upload ZIP and load the model output to review`, 'info');
  else if (item.status === 'complete') toast(`${item.name} sent on ${item.completedDate}`, 'success');
  else toast(`${item.name} status: ${item.statusLabel}`, 'info');
}

function setSource(src) {
  state.source = src;
  document.getElementById('srcPlatform').classList.toggle('active', src === 'platform');
  document.getElementById('srcUpload').classList.toggle('active', src === 'upload');
  const u = document.getElementById('upload-panel'), p = document.getElementById('pipeline-panel');
  if (src === 'platform') {
    if (u) u.style.display = 'none';
    if (p) { p.style.display = 'block'; renderPipeline(); }
    if (!state.loaded) {
      ['review-panel','calc-panel','generate-panel'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
    }
  } else {
    if (u) u.style.display = 'block';
    if (p) p.style.display = 'none';
  }
}
function toggleDevMode() {
  state.devMode = !state.devMode;
  document.body.classList.toggle('dev-mode', state.devMode);
  document.getElementById('devToggle').classList.toggle('active', state.devMode);
}

// ═══ DATA LOADING ═══════════════════════════════════════════
function loadSnapshotData(data) {
  state.parsed = data.parsed;
  state.calcs = data.calcs;
  state.images = data.images || {};
  state.centroid = data.centroid;
  state.zoneStats = data.zoneStats;
  state.geojson = data.geojson || null;
  state.loaded = true;
  if (data.narratives) state.narratives = { ...state.narratives, ...data.narratives };

  // Eagerly compute portfolio geo-context (+ named ACCU-issued neighbour)
  // so narrative prompts have full location context even before the user
  // visits page 4.
  if (state.centroid) {
    Promise.all([loadPortfolioGeoJson(), loadAccuCompanies()])
      .then(([geo, accu]) => {
        if (geo) state.geoContext = computeGeoContext(state.centroid, geo, accu);
      })
      .catch(() => {});
  }

  const badge = document.getElementById('propertyBadge');
  badge.textContent = state.parsed.name || 'Unknown Property';
  badge.style.display = 'inline-block';

  document.getElementById('review-panel').style.display = 'block';
  document.getElementById('calc-panel').style.display = 'block';
  document.getElementById('generate-panel').style.display = 'block';

  const uploadPanel = document.getElementById('upload-panel');
  if (uploadPanel) {
    const zone = document.getElementById('zipUpload');
    zone.classList.add('has-file');
    zone.onclick = null;
    zone.innerHTML = `<div class="upload-file-info">
      <div>
        <div class="filename">&#10003; ${state.uploadedFile || 'Model output'}</div>
        <div class="filesize">Parsed successfully</div>
      </div>
      <button class="remove" onclick="resetUpload(event)">&#10005; Clear</button>
    </div>`;
  }

  renderPropertySummary();
  renderCalcGrid();
  renderAllPages();
  renderThumbs();
  document.getElementById('exportBtn').disabled = false;
  const hsBtn = document.getElementById('hubspotBtn');
  if (hsBtn) hsBtn.disabled = false;
  const hsContactInput = document.getElementById('hubspotContact');
  if (hsContactInput && state.parsed?.contactName) hsContactInput.value = state.parsed.contactName;
  setStatus('Snapshot ready for review');
  goToStep(1);
  completeStep(0);
}

async function handleUpload(file) {
  if (!file) return;
  state.uploadedFile = file.name;
  setStatus('Processing ' + file.name + '...', true);
  const form = new FormData();
  form.append('file', file);
  try {
    const resp = await fetch('/api/upload', { method: 'POST', body: form });
    if (!resp.ok) throw new Error(await resp.text());
    const data = await resp.json();
    loadSnapshotData(data);
    toast('Model output processed: ' + file.name, 'success');
  } catch (e) {
    setStatus('Upload error: ' + e.message);
    toast('Upload failed: ' + e.message, 'error');
    console.error(e);
  }
}
function handleDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('active');
  const file = e.dataTransfer.files[0];
  if (file && file.name.endsWith('.zip')) handleUpload(file);
  else toast('Please upload a .zip file', 'error');
}
function resetUpload(e) {
  if (e) e.stopPropagation();
  state.loaded = false; state.parsed = null; state.calcs = null;
  state.images = {}; state.uploadedFile = null;
  state.narratives = { page2: '', page4: '', email: '', growth: '' };
  state.editGuidance = [];
  const zone = document.getElementById('zipUpload');
  zone.classList.remove('has-file');
  zone.innerHTML = `<div class="icon">&#128193;</div>
    <p>Drop model output <strong>.zip</strong> here<br><span style="font-size:10px;opacity:0.7">or click to browse</span></p>
    <input type="file" id="zipInput" accept=".zip" style="display:none" onchange="handleUpload(this.files[0])">`;
  zone.onclick = () => document.getElementById('zipInput').click();
  ['review-panel','calc-panel','generate-panel','edit-panel','send-panel','growth-panel'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
  document.getElementById('propertyBadge').style.display = 'none';
  setStatus('No snapshot loaded');
  renderAllPages();
  renderThumbs();
  showPage(1);
}

// ═══ API KEY (Settings + localStorage) ═════════════════════
const API_KEY_STORAGE = 'horizon_claude_api_key';
const NARRATIVE_GUIDE_STORAGE = 'horizon_narrative_guide';

// Narrative Guide — persistent copy preferences applied to every snapshot.
// Loaded once at app init (and rehydrated whenever Settings opens), saved on
// blur of the textarea or via the explicit Clear button. Sent on every
// /api/generate call so the server can inject it into the prompt context.
function getNarrativeGuide() {
  try { return localStorage.getItem(NARRATIVE_GUIDE_STORAGE) || ''; }
  catch { return ''; }
}
function saveNarrativeGuide() {
  const ta = document.getElementById('settingsNarrativeGuide');
  if (!ta) return;
  const text = ta.value.trim();
  try {
    if (text) localStorage.setItem(NARRATIVE_GUIDE_STORAGE, text);
    else localStorage.removeItem(NARRATIVE_GUIDE_STORAGE);
  } catch {}
  updateNarrativeGuideStatus();
}
function clearNarrativeGuide() {
  const ta = document.getElementById('settingsNarrativeGuide');
  if (ta) ta.value = '';
  try { localStorage.removeItem(NARRATIVE_GUIDE_STORAGE); } catch {}
  updateNarrativeGuideStatus();
  toast('Narrative guide cleared', 'success');
}
function onNarrativeGuideEdit() { updateNarrativeGuideStatus(); }
function updateNarrativeGuideStatus() {
  const ta = document.getElementById('settingsNarrativeGuide');
  const lbl = document.getElementById('narrativeGuideStatus');
  if (!ta || !lbl) return;
  const text = ta.value.trim();
  if (!text) { lbl.textContent = 'Empty'; return; }
  const lines = text.split('\n').filter(l => l.trim()).length;
  const chars = text.length;
  lbl.textContent = `${lines} line${lines === 1 ? '' : 's'} · ${chars} char${chars === 1 ? '' : 's'}`;
}
function updateApiKeyIndicators(configured) {
  state.apiReady = !!configured;
  const gear = document.getElementById('settingsBtn');
  if (gear) {
    gear.classList.toggle('configured', !!configured);
    gear.title = configured ? 'Settings (API key configured)' : 'Settings';
  }
  const row = document.getElementById('apiStatusRow');
  const rowText = document.getElementById('apiStatusText');
  if (row && rowText) {
    row.classList.toggle('configured', !!configured);
    rowText.textContent = configured ? 'API key configured' : 'API key not configured';
  }
  const sLine = document.getElementById('settingsStatus');
  const sText = document.getElementById('settingsStatusText');
  if (sLine && sText) {
    sLine.classList.toggle('configured', !!configured);
    sText.textContent = configured ? 'Configured · ready to generate narratives' : 'Not configured';
  }
}
async function applyApiKey(key, { silent = false } = {}) {
  if (!key) return false;
  try {
    const resp = await fetch('/api/config', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: key })
    });
    if (!resp.ok) throw new Error((await resp.json().catch(() => ({}))).error || 'Invalid API key');
    updateApiKeyIndicators(true);
    if (!silent) toast('API key configured', 'success');
    return true;
  } catch (e) {
    updateApiKeyIndicators(false);
    if (!silent) toast('API key error: ' + e.message, 'error');
    return false;
  }
}
function loadStoredApiKey() {
  const stored = (() => { try { return localStorage.getItem(API_KEY_STORAGE); } catch { return null; } })();
  if (stored) applyApiKey(stored, { silent: true });
}

// If a /api/generate call fails because the server-side Claude client was
// never initialised (typical after a server restart), silently re-push the
// stored key and signal the caller to retry. Returns true on successful
// recovery, false otherwise.
async function tryRecoverApiKey() {
  const stored = (() => { try { return localStorage.getItem(API_KEY_STORAGE); } catch { return null; } })();
  if (!stored) return false;
  return await applyApiKey(stored, { silent: true });
}
// Detects the specific "client not initialised" error string from claude.js.
function isClientUninitError(text) {
  return typeof text === 'string' && text.includes('Claude API client not initialised');
}
function openSettings() {
  const modal = document.getElementById('settingsModal');
  const input = document.getElementById('settingsApiKey');
  const stored = (() => { try { return localStorage.getItem(API_KEY_STORAGE) || ''; } catch { return ''; } })();
  input.value = stored;
  // Hydrate Narrative Guide from localStorage so the user sees their saved preferences
  const ng = document.getElementById('settingsNarrativeGuide');
  if (ng) ng.value = getNarrativeGuide();
  updateNarrativeGuideStatus();
  modal.classList.add('open');
  setTimeout(() => input.focus(), 50);
  // Refresh usage stats + ACCU project status whenever the modal opens
  loadUsageStats();
  loadAccuStatus();
}

async function loadUsageStats() {
  const target = document.getElementById('usageStats');
  if (!target) return;
  try {
    const resp = await fetch('/api/usage-stats');
    if (!resp.ok) throw new Error('stats fetch failed');
    const data = await resp.json();
    target.innerHTML = renderUsageStats(data);
  } catch (e) {
    target.innerHTML = `<div style="color:var(--text-muted)">Stats unavailable: ${e.message}</div>`;
  }
}

// ACCU project status — populates the Settings panel with count + last refresh.
async function loadAccuStatus() {
  const target = document.getElementById('accuStatus');
  if (!target) return;
  try {
    const resp = await fetch('/api/accu-data-status');
    const data = await resp.json();
    if (!data.exists) {
      target.innerHTML = `<div style="color:var(--text-muted)">No ACCU project data — click Resync to build it.</div>`;
      return;
    }
    const generated = data.generated ? new Date(data.generated) : null;
    const ageStr = generated ? formatRelativeTime(generated) : 'unknown';
    target.innerHTML = `
      <div><strong style="color:var(--accent)">${data.count}</strong> credentialled projects (${data.geocoded} geocoded)</div>
      <div style="opacity:0.65;font-size:11px;margin-top:2px">Last refreshed: ${ageStr}</div>
    `;
  } catch (e) {
    target.innerHTML = `<div style="color:var(--text-muted)">Status unavailable: ${e.message}</div>`;
  }
}
function formatRelativeTime(date) {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

async function resyncAccuProjects() {
  const btn = document.getElementById('accuResyncBtn');
  const target = document.getElementById('accuStatus');
  if (!btn) return;
  btn.disabled = true;
  const orig = btn.textContent;
  btn.innerHTML = '<span class="spinner"></span>Resyncing... (~1 min)';
  if (target) target.innerHTML = `<div style="opacity:0.7">Refreshing — Nominatim rate-limits us to one address per second, so 24 records takes about a minute.</div>`;
  try {
    const resp = await fetch('/api/refresh-accu-data', { method: 'POST' });
    const data = await resp.json();
    if (!resp.ok || !data.ok) {
      throw new Error(data.error || 'Resync failed');
    }
    // Bust the in-memory cache so subsequent narrative generations pick up fresh data.
    accuCompaniesCache = null;
    toast(`ACCU projects refreshed · ${data.count} records`, 'success');
    await loadAccuStatus();
  } catch (e) {
    toast('Resync error: ' + e.message, 'error');
    await loadAccuStatus();
  }
  btn.disabled = false;
  btn.textContent = orig;
}
function renderUsageStats(data) {
  const fmt$ = (n) => '$' + (n || 0).toFixed(4);
  const fmtN = (n) => (n || 0).toLocaleString();
  const block = (title, b) => `
    <div style="margin-bottom:10px">
      <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-muted);margin-bottom:4px">${title}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 14px">
        <div><span style="opacity:0.65">Snapshots</span> <strong>${fmtN(b.snapshots)}</strong></div>
        <div><span style="opacity:0.65">Regens</span> <strong>${fmtN(b.regens)}</strong></div>
        <div><span style="opacity:0.65">Avg / snapshot</span> <strong style="color:var(--accent)">${fmt$(b.avgCostPerSnapshotUSD)}</strong></div>
        <div><span style="opacity:0.65">Total spend</span> <strong style="color:var(--accent)">${fmt$(b.totalCostUSD)}</strong></div>
        <div><span style="opacity:0.65">Input tokens</span> <strong>${fmtN(b.inputTokens)}</strong></div>
        <div><span style="opacity:0.65">Output tokens</span> <strong>${fmtN(b.outputTokens)}</strong></div>
      </div>
    </div>`;
  return block('Last 30 days', data.last30) + block('All-time', data.allTime);
}
function closeSettings() { document.getElementById('settingsModal').classList.remove('open'); }
async function saveSettingsKey() {
  const key = document.getElementById('settingsApiKey').value.trim();
  if (!key) { toast('Enter a Claude API key', 'error'); return; }
  if (!key.startsWith('sk-ant-')) { toast('Key should start with sk-ant-', 'error'); return; }
  const ok = await applyApiKey(key);
  if (ok) {
    try { localStorage.setItem(API_KEY_STORAGE, key); } catch {}
    closeSettings();
  }
}
function clearSettingsKey() {
  try { localStorage.removeItem(API_KEY_STORAGE); } catch {}
  document.getElementById('settingsApiKey').value = '';
  updateApiKeyIndicators(false);
  toast('API key cleared', 'success');
}
function setApiKey() { openSettings(); }

// ═══ GROWTH SUMMARY (internal — copy/edit handlers) ═════════
function copyGrowthSummary() {
  const el = document.getElementById('growthOutput');
  const text = (el?.innerText || '').trim();
  if (!text || text.toLowerCase().startsWith('growth summary will appear')) {
    toast('Generate narratives first', 'error'); return;
  }
  navigator.clipboard.writeText(text).then(() => {
    toast('Growth summary copied to clipboard', 'success');
    document.querySelectorAll('.btn-copy').forEach(b => {
      b.classList.add('copied');
      const orig = b.textContent;
      b.textContent = 'Copied';
      setTimeout(() => { b.classList.remove('copied'); b.textContent = orig; }, 1500);
    });
  }).catch(e => toast('Copy failed: ' + e.message, 'error'));
}
function onGrowthEdit(e) {
  state.narratives.growth = e.target.innerText;
  e.target.dataset.userEdited = '1';
}

// ═══ EDITORIAL MEMORY (regen-history indicator + clear) ═════
function updateEditMemoryIndicator() {
  const el = document.getElementById('editMemoryIndicator');
  if (!el) return;
  const n = state.editGuidance.length;
  if (n === 0) { el.style.display = 'none'; return; }
  el.style.display = 'flex';
  el.innerHTML = `
    <span><strong>${n}</strong> editorial note${n > 1 ? 's' : ''} carried across sections</span>
    <a onclick="clearEditMemory()" style="cursor:pointer;color:var(--accent);text-decoration:underline">Clear</a>`;
}
function clearEditMemory() {
  state.editGuidance = [];
  updateEditMemoryIndicator();
  toast('Editorial memory cleared', 'success');
}

// ═══ NARRATIVE GENERATION ═══════════════════════════════════
async function regenerate(page) {
  if (!state.loaded) return;
  if (!state.apiReady) { toast('Configure your Claude API key in Settings first', 'error'); return; }
  setStatus('Regenerating ' + page + '...', true);
  const guidance = document.getElementById('regenGuidance').value.trim();
  // Append to editorial memory so future regens of OTHER sections inherit it.
  if (guidance) {
    state.editGuidance.push({ section: page, guidance, ts: new Date().toISOString() });
    updateEditMemoryIndicator();
  }
  try {
    const buildBody = () => JSON.stringify({
      parsed: state.parsed, calcs: state.calcs, zoneStats: state.zoneStats,
      style: document.getElementById('commStyle').value, guidance, page,
      geoContext: state.geoContext,
      // Editorial memory — full guidance log + current narrative state for
      // sibling sections so this regen stays consistent with prior edits.
      editHistory: state.editGuidance,
      siblingNarratives: state.narratives,
      // Persistent Narrative Guide — user's standing copy preferences from Settings.
      narrativeGuide: getNarrativeGuide()
    });
    let resp = await fetch('/api/generate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: buildBody()
    });
    if (!resp.ok) {
      const errText = await resp.text();
      // Auto-recover from "Claude API client not initialised" (server restart) by
      // silently re-pushing the stored key and retrying once.
      if (isClientUninitError(errText) && await tryRecoverApiKey()) {
        resp = await fetch('/api/generate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: buildBody()
        });
        if (!resp.ok) throw new Error(await resp.text());
      } else {
        throw new Error(errText);
      }
    }
    const data = await resp.json();
    state.narratives[page] = data[page];
    // Reset user-edited flag so the regenerated copy displaces the prior text.
    if (page === 'growth') {
      const el = document.getElementById('growthOutput');
      if (el) delete el.dataset.userEdited;
    }
    if (data._costUSD != null) {
      state.lastCostUSD = (state.lastCostUSD || 0) + data._costUSD;
      state.lastUsage = data._usage || state.lastUsage;
      updateCostDisplay();
    }
    applyNarratives();
    if (page === 'page2') showPage(2);
    if (page === 'page4') showPage(4);
    toast(`${page} regenerated${data._costUSD != null ? ` · +$${data._costUSD.toFixed(4)}` : ''}`, 'success');
    setStatus('Narrative updated');
  } catch (e) {
    toast('Regen error: ' + e.message, 'error');
    setStatus('Regeneration failed');
  }
}
async function generateAll() {
  if (!state.loaded) { toast('Upload a model output ZIP first', 'error'); return; }
  if (!state.apiReady) { toast('Configure your Claude API key in Settings first', 'error'); return; }
  const btn = document.getElementById('generateAllBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Generating...';
  setStatus('Generating all narratives...', true);
  try {
    const buildBody = () => JSON.stringify({
      parsed: state.parsed, calcs: state.calcs, zoneStats: state.zoneStats,
      style: document.getElementById('commStyle').value,
      geoContext: state.geoContext,
      editHistory: state.editGuidance,
      siblingNarratives: state.narratives,
      narrativeGuide: getNarrativeGuide()
    });
    let resp = await fetch('/api/generate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: buildBody()
    });
    if (!resp.ok) {
      const errText = await resp.text();
      if (isClientUninitError(errText) && await tryRecoverApiKey()) {
        resp = await fetch('/api/generate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: buildBody()
        });
        if (!resp.ok) throw new Error(await resp.text());
      } else {
        throw new Error(errText);
      }
    }
    const data = await resp.json();
    // Strip cost meta so it doesn't get rendered as a narrative
    const cost = data._costUSD || 0;
    const usage = data._usage || {};
    delete data._costUSD; delete data._usage;
    state.narratives = { ...state.narratives, ...data };
    state.lastCostUSD = cost;
    state.lastUsage = usage;
    updateCostDisplay();
    applyNarratives();
    document.getElementById('edit-panel').style.display = 'block';
    document.getElementById('send-panel').style.display = 'block';
    const growthPanel = document.getElementById('growth-panel');
    if (growthPanel) growthPanel.style.display = 'block';
    completeStep(1);
    goToStep(2);
    showPage(2);
    toast(`Narratives generated · cost $${cost.toFixed(4)}`, 'success');
    setStatus('Narratives ready for review');
  } catch (e) {
    toast('Generation error: ' + e.message, 'error');
    setStatus('Generation failed');
  }
  btn.disabled = false;
  btn.textContent = 'Generate All Narratives';
}
// Update the cost row in the Send panel after a generation run.
function updateCostDisplay() {
  const row = document.getElementById('costRow');
  const value = document.getElementById('costValue');
  const tokens = document.getElementById('costTokens');
  if (!row || !value) return;
  if (state.lastCostUSD == null) { row.style.display = 'none'; return; }
  row.style.display = 'block';
  value.textContent = '$' + state.lastCostUSD.toFixed(4);
  if (tokens && state.lastUsage) {
    const i = state.lastUsage.input_tokens || 0;
    const o = state.lastUsage.output_tokens || 0;
    tokens.textContent = `${(i + o).toLocaleString()} tok (${i.toLocaleString()} in / ${o.toLocaleString()} out)`;
  }
}

function applyNarratives() {
  const p2 = document.querySelector('[data-page="2"] #narrative-page2');
  const p4 = document.querySelector('[data-page="4"] #narrative-page4');
  if (p2 && state.narratives.page2) p2.textContent = state.narratives.page2;
  if (p4 && state.narratives.page4) p4.textContent = state.narratives.page4;
  if (state.narratives.email) {
    const email = document.getElementById('emailOutput');
    if (email) email.textContent = state.narratives.email;
  }
  // Growth summary lives in its own dedicated panel (peer to Edit/Send).
  // Only populate if user hasn't started editing.
  const g = document.getElementById('growthOutput');
  if (g && state.narratives.growth && !g.dataset.userEdited) {
    g.textContent = state.narratives.growth;
  }
  // Defer until layout settles so scrollHeight is accurate.
  requestAnimationFrame(() => {
    autofitNarrative('.p2-summary-overlay', { max: 11, min: 8 });
    autofitNarrative('.p4-summary-overlay', { max: 16, min: 11 });
  });
}

// Shrink the font-size of a narrative overlay until its content fits the
// container, but never below `min`. The overlay sets overflow:hidden, so
// without this, generated copy that's a few words long can be silently clipped.
// If the user has manually overridden the size via +/- controls, skip autofit.
function autofitNarrative(selector, { max = 13, min = 9, step = 0.5 } = {}) {
  const el = document.querySelector(selector);
  if (!el) return;
  const key = selector.includes('p2') ? 'p2' : 'p4';
  const override = state.narrativeFontOverride?.[key];
  if (override != null) { el.style.fontSize = override + 'px'; return; }
  // No override → walk from max down until content fits.
  el.style.fontSize = max + 'px';
  let size = max;
  while (el.scrollHeight > el.clientHeight + 1 && size > min) {
    size = Math.max(min, size - step);
    el.style.fontSize = size + 'px';
  }
}

// Manually adjust narrative font size. Once user touches +/-, autofit is
// disabled for that page until they hit "Auto" (resetNarrativeFont).
function bumpNarrativeFont(page, delta) {
  state.narrativeFontOverride = state.narrativeFontOverride || {};
  const selector = page === 'p2' ? '.p2-summary-overlay' : '.p4-summary-overlay';
  const el = document.querySelector(selector);
  if (!el) return;
  const current = state.narrativeFontOverride[page]
    ?? parseFloat(getComputedStyle(el).fontSize)
    ?? (page === 'p2' ? 11 : 13);
  const next = Math.max(6, Math.min(24, current + delta));
  state.narrativeFontOverride[page] = next;
  el.style.fontSize = next + 'px';
}
function resetNarrativeFont(page) {
  if (state.narrativeFontOverride) delete state.narrativeFontOverride[page];
  const selector = page === 'p2' ? '.p2-summary-overlay' : '.p4-summary-overlay';
  const opts = page === 'p2' ? { max: 11, min: 8 } : { max: 13, min: 9 };
  autofitNarrative(selector, opts);
}

// ═══ PDF EXPORT ═════════════════════════════════════════════
async function snapshotLeafletMap(mapInst, mapElId) {
  if (!mapInst || !window.html2canvas) return null;
  const el = document.getElementById(mapElId);
  if (!el) return null;
  const userCenter = mapInst.getCenter();
  const userZoom = mapInst.getZoom();

  const wrapper = el.closest('.page-wrapper');
  const wasHidden = wrapper && getComputedStyle(wrapper).display === 'none';
  let saved = null;
  if (wasHidden) {
    saved = {
      display: wrapper.style.display, position: wrapper.style.position,
      left: wrapper.style.left, top: wrapper.style.top
    };
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-99999px';
    wrapper.style.top = '0';
    wrapper.style.display = 'block';
    mapInst.invalidateSize({ animate: false, pan: false });
    mapInst.setView(userCenter, userZoom, { animate: false });
    await new Promise(r => setTimeout(r, 1500));
  } else {
    mapInst.setView(userCenter, userZoom, { animate: false });
    await new Promise(r => setTimeout(r, 600));
  }

  if (el.offsetWidth === 0 || el.offsetHeight === 0) {
    if (wasHidden && saved) Object.assign(wrapper.style, saved);
    return null;
  }
  let png = null;
  try {
    const canvas = await html2canvas(el, {
      useCORS: true, allowTaint: false, logging: false, backgroundColor: null, scale: 2
    });
    png = canvas.toDataURL('image/png');
  } catch (e) {
    console.warn('Map snapshot failed:', e);
  }
  if (wasHidden && saved) Object.assign(wrapper.style, saved);
  return png;
}

async function exportPDF() {
  const btn = document.getElementById('exportBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Generating PDF...';
  setStatus('Rendering PDF...', true);
  try {
    // Capture all four Leaflet maps so PDF reflects user's pan/zoom on each
    const [page2Png, page3PhPng, page3DepthPng, page4Png] = await Promise.all([
      snapshotLeafletMap(page2MapInstance,      'p2-map'),
      snapshotLeafletMap(page3PhMapInstance,    'p3-ph-map'),
      snapshotLeafletMap(page3DepthMapInstance, 'p3-depth-map'),
      snapshotLeafletMap(mapInstance,           'portfolioMap')
    ]);

    const containerNode = document.getElementById('pageContainer').cloneNode(true);
    const replaceWithImg = (selector, png) => {
      if (!png) return;
      const n = containerNode.querySelector(selector);
      if (n) n.innerHTML = `<img src="${png}" style="width:100%;height:100%;object-fit:cover;display:block">`;
    };
    replaceWithImg('#p2-map',        page2Png);
    replaceWithImg('#p3-ph-map',     page3PhPng);
    replaceWithImg('#p3-depth-map',  page3DepthPng);
    replaceWithImg('#portfolioMap',  page4Png);
    const pages = containerNode.innerHTML;
    const snapshotStyles = getSnapshotStyles();
    const fullHtml = `<!DOCTYPE html><html><head>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
      <style>
      :root{--font:'Inter',system-ui,sans-serif}
      body{font-family:var(--font);overflow:visible;height:auto;background:#fff;margin:0;padding:0}
      ${snapshotStyles}
      .page-wrapper{width:210mm;margin:0;display:block!important}
      .page{width:210mm;height:297mm;page-break-after:always;box-shadow:none!important}
      [contenteditable]{outline:none!important}
      [contenteditable], [contenteditable] *, .sp-editable, .sp-editable *,
      .p2-summary-overlay, .p2-summary-overlay *,
      .p4-summary-overlay, .p4-summary-overlay * {
        font-family: var(--font) !important;
      }
      </style></head><body>${pages}</body></html>`;
    const name = state.parsed ? state.parsed.name.replace(/[^a-zA-Z0-9]/g, '_') : 'Snapshot';
    const resp = await fetch('/api/export-pdf', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html: fullHtml, filename: `HORIZON_Snapshot_${name}.pdf` })
    });
    if (!resp.ok) throw new Error(await resp.text());
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HORIZON_Snapshot_${name}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    completeStep(3);
    toast('PDF downloaded', 'success');
    setStatus('PDF exported');
  } catch (e) {
    toast('PDF error: ' + e.message, 'error');
    setStatus('PDF export failed');
  }
  btn.disabled = false;
  btn.textContent = 'Export PDF';
}
function getSnapshotStyles() {
  const full = document.querySelector('style').textContent;
  const idx = full.indexOf('.page{');
  return idx >= 0 ? full.substring(idx) : full;
}

// ═══ HUBSPOT SEND ═══════════════════════════════════════════
const HUBSPOT_PORTAL_ID = '24224559';
const HUBSPOT_BASE = 'https://app-ap1.hubspot.com';
async function openHubSpotEmail() {
  if (!state.loaded) { toast('Upload a snapshot first', 'error'); return; }
  // Priority: parsed contact name (Frontier) → manual input → property → address
  const manualContact = (document.getElementById('hubspotContact')?.value || '').trim();
  const parsedContact = state.parsed?.contactName || '';
  const propertyName = state.parsed?.name || '';
  const address = state.parsed?.address || '';
  const query = manualContact || parsedContact || propertyName || address;
  if (!query) { toast('Enter a landholder name to search HubSpot', 'error'); return; }
  const emailBody = state.narratives?.email || '';
  if (emailBody) {
    try { await navigator.clipboard.writeText(emailBody); toast('Email copy on clipboard. Paste into HubSpot composer.', 'success'); }
    catch (e) { toast('Email copy ready below — copy manually if needed', 'info'); }
  } else {
    toast('No email copy yet — generate narratives first', 'info');
  }
  const url = `${HUBSPOT_BASE}/contacts/${HUBSPOT_PORTAL_ID}/objects/0-1/views/all/list?query=${encodeURIComponent(query)}`;
  window.open(url, '_blank', 'noopener');
}

// ═══ FEEDBACK ═══════════════════════════════════════════════
// Lightweight issue-reporting flow. Captures the current preview page as a
// PNG (html2canvas) plus the parsed snapshot context, posts to /api/feedback.
// Server saves under feedback/<timestamp>/ for the team / Claude to triage.
function openFeedback() {
  document.getElementById('feedbackNote').value = '';
  setFeedbackStatus('Ready', false);
  document.getElementById('feedbackModal').classList.add('open');
  setTimeout(() => document.getElementById('feedbackNote').focus(), 50);
}
function closeFeedback() { document.getElementById('feedbackModal').classList.remove('open'); }
function setFeedbackStatus(text, busy) {
  const line = document.getElementById('feedbackStatus');
  const txt = document.getElementById('feedbackStatusText');
  if (txt) txt.textContent = text;
  if (line) line.classList.toggle('configured', busy === 'success');
}
async function submitFeedback() {
  const note = document.getElementById('feedbackNote').value.trim();
  const btn = document.getElementById('feedbackSubmitBtn');
  btn.disabled = true;
  setFeedbackStatus('Capturing screenshot...', true);

  let screenshot = null;
  try {
    if (window.html2canvas) {
      const target = document.querySelector(`#pageContainer .page-wrapper[data-page="${state.currentPage}"]`) || document.getElementById('pageContainer');
      const canvas = await html2canvas(target, { useCORS: true, backgroundColor: null, scale: 1, logging: false });
      screenshot = canvas.toDataURL('image/png');
    }
  } catch (e) {
    console.warn('Feedback screenshot failed:', e);
  }

  setFeedbackStatus('Sending report...', true);
  const payload = {
    note,
    page: state.currentPage,
    pageLabel: PAGE_LABELS[state.currentPage - 1] || '',
    propertyName: state.parsed?.name || null,
    address: state.parsed?.address || null,
    parsed: state.parsed,
    calcs: state.calcs,
    narrativesPresent: {
      page2: !!state.narratives?.page2,
      page4: !!state.narratives?.page4,
      email: !!state.narratives?.email
    },
    apiReady: state.apiReady,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    screenshot
  };

  try {
    const resp = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) throw new Error(await resp.text());
    const data = await resp.json();
    setFeedbackStatus('Report saved · ID ' + (data.id || 'unknown'), 'success');
    toast('Issue report submitted', 'success');
    setTimeout(closeFeedback, 1200);
  } catch (e) {
    setFeedbackStatus('Submit failed: ' + e.message, false);
    toast('Could not submit: ' + e.message, 'error');
  }
  btn.disabled = false;
}

// ═══ PROPERTY SUMMARY ═══════════════════════════════════════
function renderPropertySummary() {
  const p = state.parsed; if (!p) return;
  const contactLine = p.contactName
    ? `<div class="prop-contact">👤 <strong>${p.contactName}</strong>${p.contactEmail ? ` · <span style="opacity:0.85">${p.contactEmail}</span>` : ''}</div>`
    : '';
  document.getElementById('propertySummary').innerHTML = `
    <div class="property-summary">
      <div class="prop-name">${p.name || 'Unknown'}</div>
      ${contactLine}
      <div class="prop-address">${p.address || 'No address'}</div>
      <div class="prop-meta">
        <div class="meta-item"><strong>${p.totalArea ? p.totalArea.toLocaleString() : '—'}</strong> ha total</div>
        <div class="meta-item"><strong>${p.eligibleArea ? p.eligibleArea.toLocaleString() : '—'}</strong> ha eligible (${p.eligiblePct || '—'}%)</div>
        <div class="meta-item"><strong>${p.rainfall ? p.rainfall.toLocaleString() : '—'}</strong> mm rainfall</div>
      </div>
    </div>
    <div class="data-grid">
      <div class="data-card"><div class="label">Soil Types</div><div class="value" style="font-size:12px">${p.soilClasses ? p.soilClasses.join(', ') : '—'}</div></div>
      <div class="data-card"><div class="label">Production</div><div class="value" style="font-size:12px">${p.productionSystem || '—'}</div></div>
      <div class="data-card"><div class="label">pH Range</div><div class="value">${p.phMin ? p.phMin + ' – ' + p.phMax : '—'}</div></div>
      <div class="data-card"><div class="label">Depth Range</div><div class="value">${p.depthMin ? p.depthMin + ' – ' + p.depthMax + ' m' : '—'}</div></div>
    </div>`;
}
function renderCalcGrid() {
  const c = state.calcs; if (!c) return;
  document.getElementById('calcGrid').innerHTML = `
    <div class="data-card highlight"><div class="label">ACCU Rate</div><div class="value">${c.accuRate} /ha/yr</div></div>
    <div class="data-card highlight"><div class="label">Total ACCUs (25yr)</div><div class="value">~${c.totalAccu.toLocaleString()}</div></div>
    <div class="data-card"><div class="label">Projects (~400ha)</div><div class="value">${c.numProjects}</div></div>
    <div class="data-card"><div class="label">Total Cores</div><div class="value">${c.totalCores}</div></div>
    <div class="data-card"><div class="label">Cost/Core</div><div class="value">$${c.costPerCore}</div></div>
    <div class="data-card highlight"><div class="label">Baseline Cost</div><div class="value">$${c.baselineCost.toLocaleString()}</div></div>
    <div class="data-card"><div class="label">Deferred ACCUs</div><div class="value">${c.deferredAccus.toLocaleString()}</div></div>
    <div class="data-card"><div class="label">Land Use</div><div class="value">${c.landUse}</div></div>`;
}

// ═══ PAGE RENDERING ═════════════════════════════════════════
function renderAllPages() {
  const p = state.parsed || {};
  const c = state.calcs || {};
  const name = p.name || 'PROPERTY NAME';
  const nameUpper = name.toUpperCase();
  const n2 = state.narratives.page2 || '<em style="color:#999">[Narrative generated after model upload]</em>';
  const n4 = state.narratives.page4 || '<em style="color:#8FA3B8">[Narrative generated after model upload]</em>';
  const mapSrc = state.images.map || '';
  const depthSrc = state.images.map_depth || '';
  const phSrc = state.images.map_ph || '';
  const fmtNum = (n) => (n != null && !Number.isNaN(n) ? n.toLocaleString() : '—');
  const dash = (v) => (v != null && v !== '' ? v : '—');

  const tplBg = (n) => `background-image:url('/templates/template_page_${String(n).padStart(2, '0')}.png')`;
  const staticPage = (n) => `<div class="page-wrapper" data-page="${n}"><div class="page page-tpl" style="${tplBg(n)}"></div></div>`;

  const page1 = `
    <div class="page-wrapper" data-page="1"><div class="page page-tpl" style="${tplBg(1)}">
      <div class="cover-name-overlay">${nameUpper}</div>
    </div></div>`;

  const horizonLegend = `
    <div class="p2-horizon-legend">
      <div class="legend-title">Horizon Layer</div>
      <div class="legend-row"><span class="legend-swatch outline-red"></span>Farm Boundary</div>
      <div class="legend-row"><span class="legend-swatch outline-dashed"></span>Eligible Area</div>
      <div class="legend-row"><span class="legend-swatch" style="background:#008000CC"></span>Strength Zones</div>
      <div class="legend-row"><span class="legend-swatch" style="background:#67B876CC"></span>Reference Zones</div>
      <div class="legend-row"><span class="legend-swatch" style="background:#FF8300CC"></span>Opportunity Zones</div>
    </div>`;

  // PAGE 2 — Leaflet container with satellite basemap + model map.png as imageOverlay
  const page2 = `
    <div class="page-wrapper" data-page="2"><div class="page page-tpl" style="${tplBg(2)}">
      <div class="p2-map-overlay">
        <div id="p2-map" class="p2-leaflet-container"></div>
        ${mapSrc ? `
        <div class="map-toolbar">
          <button class="map-zoom-btn" onclick="zoomPage2Map(0.25)" title="Zoom in">+</button>
          <button class="map-zoom-btn" onclick="zoomPage2Map(-0.25)" title="Zoom out">−</button>
          <button class="map-reset-btn" onclick="resetPage2Map()" title="Reset to default fit">Reset view</button>
        </div>` : ''}
        ${horizonLegend}
      </div>
      <div class="p2-summary-overlay">
        <div class="narrative-fontctl">
          <button onclick="bumpNarrativeFont('p2',-0.5)" title="Smaller">A&minus;</button>
          <button onclick="bumpNarrativeFont('p2',0.5)" title="Larger">A+</button>
          <button class="reset" onclick="resetNarrativeFont('p2')" title="Auto-fit">Auto</button>
        </div>
        <strong>HORIZON Summary:</strong>
        <span class="sp-editable" contenteditable="true" id="narrative-page2">${n2}</span>
      </div>
    </div></div>`;

  // PAGE 3 — Soil indicators (pH + Depth maps now Leaflet, like page 2)
  const phLegend = `<img class="p3-legend-img ph" src="/templates/assets/legend_ph.png" alt="pH legend">`;
  const depthLegend = `<img class="p3-legend-img depth" src="/templates/assets/legend_depth.png" alt="Soil Depth legend">`;
  const p3Toolbar = (resetFn, zoomFn) => `
    <div class="map-toolbar">
      <button class="map-zoom-btn" onclick="${zoomFn}(0.25)" title="Zoom in">+</button>
      <button class="map-zoom-btn" onclick="${zoomFn}(-0.25)" title="Zoom out">−</button>
      <button class="map-reset-btn" onclick="${resetFn}()" title="Reset to default fit">Reset view</button>
    </div>`;
  const page3 = `
    <div class="page-wrapper" data-page="3"><div class="page page-tpl" style="${tplBg(3)}">
      <div class="p3-ph-banner-overlay"><span class="banner-title">PH &amp; SOIL TYPE</span></div>
      <div class="p3-ph-overlay">
        <div id="p3-ph-map" class="p3-leaflet-container"></div>
        ${phSrc ? p3Toolbar('resetPage3PhMap', 'zoomPage3PhMap') : ''}
        ${phLegend}
      </div>
      <div class="p3-depth-overlay">
        <div id="p3-depth-map" class="p3-leaflet-container"></div>
        ${depthSrc ? p3Toolbar('resetPage3DepthMap', 'zoomPage3DepthMap') : ''}
        ${depthLegend}
      </div>
      <div class="p3-carbon-banner-overlay"><span class="banner-title">CARBON INDICATORS</span></div>
      <div class="p3-carbon-table-overlay">
        <table class="p3-carbon-table">
          <thead><tr>
            <th>Soil Type</th><th>Rainfall (mm)</th><th>Water Holding</th>
            <th>Productivity</th><th>Carbon Stability</th><th>ACCU / ha / yr</th>
          </tr></thead>
          <tbody>
          ${(c.soil && c.soil.allChars && c.soil.allChars.length
            ? c.soil.allChars
            : [{ name: '—', water: '—', productivity: '—', stability: '—' }]
          ).map(s => `
            <tr>
              <td>${s.name}</td>
              <td>${fmtNum(c.rainfall)}</td>
              <td>${s.water}</td>
              <td>${s.productivity}</td>
              <td>${s.stability}</td>
              <td class="p3-carbon-accu">${dash(c.accuRate)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div></div>`;

  // PAGE 4 — Property & Portfolio (hybrid: stripped Canva PNG provides the
  // page background — title, white card, tiles, disclaimer, wave all baked in.
  // HTML overlays only add the dynamic content: map, property name, summary,
  // and ACCU values inside the tiles).
  const eligDisplay = c.eligibleArea ? Math.round(c.eligibleArea).toLocaleString() : '—';
  const page4 = `
    <div class="page-wrapper" data-page="4"><div class="page p4r-page">
      <div class="p4r-map" id="portfolioMap"></div>
      <div class="p4r-property-name"><span class="p4r-pin"></span>${nameUpper}</div>
      <div class="p4-summary-overlay">
        <div class="narrative-fontctl dark">
          <button onclick="bumpNarrativeFont('p4',-0.5)" title="Smaller">A&minus;</button>
          <button onclick="bumpNarrativeFont('p4',0.5)" title="Larger">A+</button>
          <button class="reset" onclick="resetNarrativeFont('p4')" title="Auto-fit">Auto</button>
        </div>
        <span class="p4r-summary-label">Property Summary</span>
        <span class="sp-editable sp-editable-dark" contenteditable="true" id="narrative-page4">${n4}</span>
      </div>
      <div class="p4r-accu-main">
        <div class="p4r-accu-header">Estimated ACCU Potential</div>
        <div class="p4r-accu-number">~${fmtNum(c.totalAccu)}</div>
        <div class="p4r-accu-sub">over 25 years</div>
      </div>
      <div class="p4r-tile p4r-tile-1">
        <div class="p4r-tile-lbl">Eligible Area</div>
        <div class="p4r-tile-num">${eligDisplay} ha</div>
        ${c.eligiblePct != null ? `<div class="p4r-tile-sub">${c.eligiblePct}% of property</div>` : ''}
      </div>
      <div class="p4r-tile p4r-tile-2">
        <div class="p4r-tile-lbl">Estimated Rate</div>
        <div class="p4r-tile-num">${dash(c.accuRate)}</div>
        <div class="p4r-tile-sub">ACCUs/ha/year</div>
      </div>
      <div class="p4r-tile p4r-tile-3">
        <div class="p4r-tile-lbl">Number of Projects</div>
        <div class="p4r-tile-num">${dash(c.numProjects)}</div>
        <div class="p4r-tile-sub">~400ha each</div>
      </div>
    </div></div>`;

  // PAGE 6 — Economics
  const MAX_DEFERRED = 50000;
  const baselineCostNum = c.baselineCost || 0;
  const baselineCost = baselineCostNum ? `$${baselineCostNum.toLocaleString()}` : '—';
  const deferredAccusValue = c.deferredAccus ? c.deferredAccus.toLocaleString() : '—';
  const overflowDollars = Math.max(0, baselineCostNum - MAX_DEFERRED);
  // Always render the overflow cell — shows $0 when baseline ≤ $50K, the actual
  // overflow when baseline exceeds the cap. Opaque so it covers any stale value
  // baked into the template PNG.
  const overflowOverlay = `<div class="p6-price-overlay p6-price-3"><div>$${overflowDollars.toLocaleString()}</div></div>`;
  const page6 = `
    <div class="page-wrapper" data-page="6"><div class="page page-tpl" style="${tplBg(6)}">
      <div class="p6-price-overlay p6-price-1"><div>${baselineCost}</div></div>
      ${overflowOverlay}
      <div class="p6-price-overlay p6-price-2"><div>${deferredAccusValue}</div></div>
    </div></div>`;

  document.getElementById('pageContainer').innerHTML =
    page1 + page2 + page3 + page4 + staticPage(5) + page6 +
    staticPage(7) + staticPage(8) + staticPage(9) +
    staticPage(10) + staticPage(11) + staticPage(12);

  showPage(state.currentPage);
  if (state.currentPage === 2) setTimeout(initPage2Map, 200);
  if (state.currentPage === 3) setTimeout(() => { initPage3PhMap(); initPage3DepthMap(); }, 200);
  if (state.currentPage === 4) setTimeout(initPortfolioMap, 200);
  setupMapInteractions();
  // Re-fit narratives after the page DOM has been rebuilt — initial render
  // injects ${n2}/${n4} via template literals, so applyNarratives doesn't
  // necessarily run, but the overlays still need fitting.
  requestAnimationFrame(() => {
    autofitNarrative('.p2-summary-overlay', { max: 11, min: 8 });
    autofitNarrative('.p4-summary-overlay', { max: 16, min: 11 });
  });
}

// ═══ MAP DRAG/ZOOM (page 3 model output maps) ═══════════════
function applyMapTransform(img, t) {
  if (!img) return;
  img.style.transform = `translate(${t.x}%, ${t.y}%) scale(${t.s})`;
  img.style.transformOrigin = 'center';
}
function resetMapTransform(key) {
  if (!state.mapTransforms) state.mapTransforms = {};
  state.mapTransforms[key] = { x: 0, y: 0, s: 1 };
  const container = document.querySelector(`[data-map-key="${key}"]`);
  if (container) applyMapTransform(container.querySelector('img'), state.mapTransforms[key]);
}
let _activeMapDrag = null;
function _onMapMouseMove(e) {
  if (!_activeMapDrag) return;
  const { key, img, el, startX, startY, startTx, startTy } = _activeMapDrag;
  const rect = el.getBoundingClientRect();
  const t = state.mapTransforms[key];
  t.x = startTx + ((e.clientX - startX) / rect.width) * 100;
  t.y = startTy + ((e.clientY - startY) / rect.height) * 100;
  applyMapTransform(img, t);
}
function _onMapMouseUp() {
  if (_activeMapDrag) { _activeMapDrag.el.style.cursor = ''; _activeMapDrag = null; }
}
let _mapHandlersInstalled = false;
function setupMapInteractions() {
  if (!_mapHandlersInstalled) {
    document.addEventListener('mousemove', _onMapMouseMove);
    document.addEventListener('mouseup', _onMapMouseUp);
    _mapHandlersInstalled = true;
  }
  document.querySelectorAll('[data-map-key]').forEach(el => {
    const key = el.dataset.mapKey;
    const img = el.querySelector('img');
    if (!img) return;
    if (!state.mapTransforms[key]) state.mapTransforms[key] = { x: 0, y: 0, s: 1 };
    applyMapTransform(img, state.mapTransforms[key]);
    el.onmousedown = (e) => {
      if (e.target.closest('.map-reset-btn')) return;
      const t = state.mapTransforms[key];
      _activeMapDrag = { key, img, el, startX: e.clientX, startY: e.clientY, startTx: t.x, startTy: t.y };
      el.style.cursor = 'grabbing';
      e.preventDefault();
    };
    el.onwheel = (e) => {
      if (e.target.closest('.map-reset-btn')) return;
      e.preventDefault();
      const t = state.mapTransforms[key];
      const delta = -Math.sign(e.deltaY) * 0.15;
      t.s = Math.max(0.4, Math.min(4, +(t.s + delta).toFixed(2)));
      applyMapTransform(img, t);
    };
  });
}

// ═══ PAGE 2 LEAFLET ZONE MAP ═══════════════════════════════
let page2MapInstance = null;
let page2MapEl = null;
let page2ImageBounds = null;
function computeGeoJsonBounds(geojson) {
  let latMin = 90, latMax = -90, lngMin = 180, lngMax = -180;
  function walk(coords) {
    if (typeof coords[0] === 'number') {
      const [lng, lat] = coords;
      if (lng < lngMin) lngMin = lng;
      if (lng > lngMax) lngMax = lng;
      if (lat < latMin) latMin = lat;
      if (lat > latMax) latMax = lat;
    } else { coords.forEach(walk); }
  }
  if (geojson && geojson.features) geojson.features.forEach(f => walk(f.geometry.coordinates));
  return { latMin, latMax, lngMin, lngMax };
}
// Zone fill colours from COLOUR_SPEC_FOR_HORIZON_OUTPUT.md (Cadel renders these
// at 100% alpha). Frontend dims them to 70% on the page 2 zone map only.
// Outlines (farm boundary red, eligible-area dark teal) and other colours
// pass through at 100% alpha.
const ZONE_FILL_COLORS_100 = [
  { r: 0,   g: 128, b: 0   },  // Strength    #008000
  { r: 103, g: 184, b: 118 },  // Reference   #67B876
  { r: 255, g: 131, b: 0   }   // Opportunity #FF8300
];
const ZONE_TOLERANCE = 30; // ± per RGB channel — wide enough for anti-alias, narrow enough to not catch outlines
function isZoneFill(r, g, b) {
  for (const z of ZONE_FILL_COLORS_100) {
    if (Math.abs(r - z.r) <= ZONE_TOLERANCE &&
        Math.abs(g - z.g) <= ZONE_TOLERANCE &&
        Math.abs(b - z.b) <= ZONE_TOLERANCE) return true;
  }
  return false;
}

// Pre-process the model PNG: replace near-white pixels with transparent so the
// satellite tiles show through cleanly (no white border around the property
// zones). When `dimZones` is true (used for page 2's zone map), zone-fill
// pixels get alpha reduced to 60% — keeping outlines at 100% opacity but
// letting the basemap colour bleed through under the zone fills.
// Returns the image's natural aspect ratio so bounds can match it.
function preprocessMapImage(srcDataUrl, options = {}) {
  const { dimZones = false } = options;
  const ZONE_ALPHA_60 = 153; // 0.6 × 255 = 153
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const px = data.data;
        for (let i = 0; i < px.length; i += 4) {
          const r = px[i], g = px[i+1], b = px[i+2];
          if (r > 235 && g > 235 && b > 235) {
            // Near-white outside the property → fully transparent
            px[i+3] = 0;
          } else if (dimZones && isZoneFill(r, g, b)) {
            // Zone fill (Strength / Reference / Opportunity) → 60% alpha
            px[i+3] = ZONE_ALPHA_60;
          }
          // Everything else (outlines, anti-aliased boundaries) stays at original alpha
        }
        ctx.putImageData(data, 0, 0);
        resolve({ dataUrl: canvas.toDataURL('image/png'), aspect: img.naturalWidth / img.naturalHeight });
      } catch (e) {
        // Fallback: no pre-processing
        resolve({ dataUrl: srcDataUrl, aspect: img.naturalWidth / img.naturalHeight || 1 });
      }
    };
    img.onerror = () => resolve({ dataUrl: srcDataUrl, aspect: 1 });
    img.src = srcDataUrl;
  });
}

// Bounds that match the IMAGE's aspect ratio (not the property's), centered
// on the property centroid. Prevents stretching of portrait/non-landscape PNGs.
function aspectAwareBounds(inputGeo, imgAspect) {
  const b = computeGeoJsonBounds(inputGeo);
  const cLat = (b.latMin + b.latMax) / 2;
  const cLng = (b.lngMin + b.lngMax) / 2;
  const latSpan = Math.max(0.0005, b.latMax - b.latMin);
  const lngSpan = Math.max(0.0005, b.lngMax - b.lngMin);
  const cosLat = Math.cos(cLat * Math.PI / 180);
  // property's geographic aspect (lng × cosLat / lat)
  const propAspect = (lngSpan * cosLat) / latSpan;
  let finalLatSpan, finalLngSpan;
  if (imgAspect >= propAspect) {
    // Image wider than property → keep latSpan, expand lngSpan to match imgAspect
    finalLatSpan = latSpan;
    finalLngSpan = (latSpan * imgAspect) / cosLat;
  } else {
    // Image taller (more portrait) than property → keep lngSpan, expand latSpan
    finalLngSpan = lngSpan;
    finalLatSpan = (lngSpan * cosLat) / imgAspect;
  }
  const pad = 1.10; // 10% padding on the larger dimension
  finalLatSpan *= pad;
  finalLngSpan *= pad;
  return [
    [cLat - finalLatSpan / 2, cLng - finalLngSpan / 2],
    [cLat + finalLatSpan / 2, cLng + finalLngSpan / 2]
  ];
}

async function initPage2Map() {
  const el = document.getElementById('p2-map');
  if (!el || el.offsetHeight === 0) return;
  const inputGeo = state.geojson && state.geojson.input;
  if (!inputGeo || !state.images.map) return;
  if (page2MapInstance && page2MapEl === el) {
    setTimeout(() => page2MapInstance.invalidateSize(), 50);
    return;
  }
  if (page2MapInstance) { page2MapInstance.remove(); page2MapInstance = null; }

  // Pre-process the PNG: white → transparent, AND dim zone fills (Strength /
  // Reference / Opportunity) to 60% alpha. Cadel renders zones at 100%; the
  // 60% blend lets the satellite basemap show through underneath.
  // Outlines (farm boundary red, eligible-area teal) are NOT dimmed.
  const { dataUrl: processedSrc, aspect: imgAspect } = await preprocessMapImage(state.images.map, { dimZones: true });
  page2ImageBounds = aspectAwareBounds(inputGeo, imgAspect);

  // Finer zoom controls: zoomSnap/zoomDelta 0.25 + raised wheel pixel ratio
  page2MapInstance = L.map(el, {
    zoomControl: false, attributionControl: false, fadeAnimation: false,
    zoomSnap: 0.25, zoomDelta: 0.25, wheelPxPerZoomLevel: 120
  });
  page2MapEl = el;
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19, crossOrigin: true
  }).addTo(page2MapInstance);
  L.imageOverlay(processedSrc, page2ImageBounds, { opacity: 1.0 }).addTo(page2MapInstance);
  page2MapInstance.fitBounds(page2ImageBounds, { padding: [8, 8] });
  setTimeout(() => page2MapInstance.invalidateSize(), 200);
}
function resetPage2Map() {
  if (page2MapInstance && page2ImageBounds) {
    page2MapInstance.fitBounds(page2ImageBounds, { padding: [8, 8] });
  }
}
function zoomPage2Map(delta) {
  if (!page2MapInstance) return;
  page2MapInstance.setZoom(page2MapInstance.getZoom() + delta);
}

// ── Page 3 pH and Depth maps (same Leaflet pattern as page 2) ─────────
let page3PhMapInstance = null, page3PhMapEl = null, page3PhBounds = null;
let page3DepthMapInstance = null, page3DepthMapEl = null, page3DepthBounds = null;

async function _initPage3Map(elId, imgSrc, instanceVar) {
  const el = document.getElementById(elId);
  if (!el || el.offsetHeight === 0) return null;
  const inputGeo = state.geojson && state.geojson.input;
  if (!inputGeo || !imgSrc) return null;

  const cur = instanceVar.get();
  if (cur.map && cur.el === el) {
    setTimeout(() => cur.map.invalidateSize(), 50);
    return cur.map;
  }
  if (cur.map) cur.map.remove();

  const { dataUrl, aspect } = await preprocessMapImage(imgSrc);
  const bounds = aspectAwareBounds(inputGeo, aspect);

  const map = L.map(el, {
    zoomControl: false, attributionControl: false, fadeAnimation: false,
    zoomSnap: 0.25, zoomDelta: 0.25, wheelPxPerZoomLevel: 120
  });
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19, crossOrigin: true
  }).addTo(map);
  L.imageOverlay(dataUrl, bounds, { opacity: 1.0 }).addTo(map);
  map.fitBounds(bounds, { padding: [6, 6] });
  setTimeout(() => map.invalidateSize(), 200);

  instanceVar.set(map, el, bounds);
  return map;
}

const page3PhRef = {
  get: () => ({ map: page3PhMapInstance, el: page3PhMapEl, bounds: page3PhBounds }),
  set: (m, e, b) => { page3PhMapInstance = m; page3PhMapEl = e; page3PhBounds = b; }
};
const page3DepthRef = {
  get: () => ({ map: page3DepthMapInstance, el: page3DepthMapEl, bounds: page3DepthBounds }),
  set: (m, e, b) => { page3DepthMapInstance = m; page3DepthMapEl = e; page3DepthBounds = b; }
};

function initPage3PhMap()    { return _initPage3Map('p3-ph-map',    state.images.map_ph,    page3PhRef); }
function initPage3DepthMap() { return _initPage3Map('p3-depth-map', state.images.map_depth, page3DepthRef); }
function resetPage3PhMap()   { if (page3PhMapInstance && page3PhBounds)       page3PhMapInstance.fitBounds(page3PhBounds, { padding: [6, 6] }); }
function resetPage3DepthMap(){ if (page3DepthMapInstance && page3DepthBounds) page3DepthMapInstance.fitBounds(page3DepthBounds, { padding: [6, 6] }); }
function zoomPage3PhMap(d)    { if (page3PhMapInstance)    page3PhMapInstance.setZoom(page3PhMapInstance.getZoom() + d); }
function zoomPage3DepthMap(d) { if (page3DepthMapInstance) page3DepthMapInstance.setZoom(page3DepthMapInstance.getZoom() + d); }

// ═══ PAGE 4 PORTFOLIO MAP (Leaflet + GeoJSON) ═══════════════
const PORTFOLIO_GROUPS = {
  1467231603: { label: 'ACCUs Issued',      color: '#fd821f', key: 'accusIssued' },
  1586608709: { label: 'Measured Increase', color: '#96c896', key: 'measured' },
  3712194001: { label: 'Existing Project',  color: '#006400', key: 'existing' }
};
function radiusForZoom(z) {
  if (z <= 4) return 4;
  if (z >= 13) return 12;
  return Math.round(4 + (z - 4) * 0.9);
}
let portfolioCache = null;
async function loadPortfolioGeoJson() {
  if (portfolioCache) return portfolioCache;
  const resp = await fetch('/data/portfolio.geojson');
  if (!resp.ok) return null;
  portfolioCache = await resp.json();
  return portfolioCache;
}
// Companies with ACCUs issued — pulled from HubSpot, geocoded, cached as a
// static JSON. Used to find the closest credentialled neighbour for narrative
// citation (e.g. "the Blewett carbon project, 12km away, has earned ~22,611 ACCUs").
let accuCompaniesCache = null;
async function loadAccuCompanies() {
  if (accuCompaniesCache) return accuCompaniesCache;
  try {
    const resp = await fetch('/data/accu_issued_companies.json');
    if (!resp.ok) return null;
    const doc = await resp.json();
    accuCompaniesCache = doc.companies || [];
    return accuCompaniesCache;
  } catch { return null; }
}
function haversineKm(a, b) {
  const R = 6371;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(x));
}
function inAustralia(lat, lng) { return lat <= -10 && lat >= -45 && lng >= 110 && lng <= 155; }
function computeGeoContext(prospect, geo, accuCompanies) {
  if (!prospect || !geo || !geo.features) return null;
  const ctx = {
    within50km:  { accusIssued: 0, measured: 0, existing: 0 },
    within100km: { accusIssued: 0, measured: 0, existing: 0 },
    within200km: { accusIssued: 0, measured: 0, existing: 0 },
    closest:     { accusIssued: null, measured: null, existing: null }
  };
  geo.features.forEach(f => {
    const [lng, lat] = f.geometry.coordinates;
    if (!inAustralia(lat, lng)) return;
    const cfg = PORTFOLIO_GROUPS[f.properties.group];
    if (!cfg) return;
    const dist = haversineKm(prospect, { lat, lng });
    if (dist <= 50)  ctx.within50km[cfg.key]++;
    if (dist <= 100) ctx.within100km[cfg.key]++;
    if (dist <= 200) ctx.within200km[cfg.key]++;
    if (!ctx.closest[cfg.key] || dist < ctx.closest[cfg.key].distanceKm) {
      ctx.closest[cfg.key] = { name: f.properties.title || 'Project', distanceKm: Math.round(dist) };
    }
  });

  // Closest credentialled neighbour — projects that have actually earned ACCUs.
  // Pulled from HubSpot (data/accu_companies_raw.json), geocoded, served from
  // public/data/accu_issued_companies.json. We surface the named project +
  // ACCU count + distance so prompts can cite it concretely. Capped at 500km
  // — beyond that the "neighbour" framing stops being credible.
  if (Array.isArray(accuCompanies) && accuCompanies.length) {
    let best = null;
    for (const c of accuCompanies) {
      if (typeof c.lat !== 'number' || typeof c.lng !== 'number') continue;
      const d = haversineKm(prospect, { lat: c.lat, lng: c.lng });
      if (d > 500) continue;
      if (!best || d < best.distanceKm) {
        best = {
          name: c.narrativeName || c.projectName || c.rawName,
          accusIssued: c.accusIssued,
          distanceKm: Math.round(d),
          state: (c.state || '').trim(),
          city:  (c.city  || '').trim()
        };
      }
    }
    ctx.namedNeighbour = best;  // null when nothing within 500km
  }

  return ctx;
}
let mapInstance = null;
let mapInstanceEl = null;
async function initPortfolioMap() {
  const el = document.getElementById('portfolioMap');
  if (!el || el.offsetHeight === 0) return;
  if (mapInstance && mapInstanceEl === el) {
    setTimeout(() => mapInstance.invalidateSize(), 50);
    return;
  }
  if (mapInstance) { mapInstance.remove(); mapInstance = null; }
  const prospect = state.centroid;
  const center = prospect ? [prospect.lat, prospect.lng] : [-25.27, 133.78];
  const zoom = prospect ? 7 : 4;
  mapInstance = L.map(el, {
    zoomControl: false, attributionControl: false,
    zoomSnap: 0.25, zoomDelta: 0.25, wheelPxPerZoomLevel: 120
  }).setView(center, zoom);
  mapInstanceEl = el;
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18, crossOrigin: true }).addTo(mapInstance);

  const portfolioRenderer = L.canvas({ padding: 1.0 });
  const portfolioMarkers = [];
  try {
    const geo = await loadPortfolioGeoJson();
    if (geo && geo.features) {
      const layerOrder = [3712194001, 1586608709, 1467231603];
      const initialR = radiusForZoom(zoom);
      layerOrder.forEach(groupId => {
        const cfg = PORTFOLIO_GROUPS[groupId];
        geo.features.forEach(f => {
          if (f.properties.group !== groupId) return;
          const [lng, lat] = f.geometry.coordinates;
          if (!inAustralia(lat, lng)) return;
          const m = L.circleMarker([lat, lng], {
            renderer: portfolioRenderer, radius: initialR,
            fillColor: cfg.color, color: '#fff', weight: 1, opacity: 1, fillOpacity: 0.85
          }).bindTooltip(f.properties.title || cfg.label, { direction: 'top' });
          m.addTo(mapInstance);
          portfolioMarkers.push(m);
        });
      });
      mapInstance.on('zoomend', () => {
        const r = radiusForZoom(mapInstance.getZoom());
        portfolioMarkers.forEach(m => m.setRadius(r));
      });
      if (prospect) {
        const accu = await loadAccuCompanies();
        state.geoContext = computeGeoContext(prospect, geo, accu);
      }
    }
  } catch (e) {
    console.error('Portfolio map load error:', e);
  }
  if (prospect) {
    const prospectIcon = L.divIcon({
      className: 'prospect-marker',
      html: '<div class="prospect-pin"><div class="prospect-pin-inner"></div></div>',
      iconSize: [26, 36], iconAnchor: [13, 34]
    });
    L.marker(center, { icon: prospectIcon, zIndexOffset: 1000 })
      .bindTooltip(state.parsed?.name || 'Your Property', { permanent: false, direction: 'top' })
      .addTo(mapInstance);
  }
  const legend = L.control({ position: 'bottomleft' });
  legend.onAdd = () => {
    const div = L.DomUtil.create('div', 'p4-leaflet-legend');
    div.innerHTML = `
      <div class="legend-row"><span class="legend-pin"></span>Your Property</div>
      <div class="legend-row"><span class="legend-dot" style="background:#fd821f"></span>ACCUs Issued</div>
      <div class="legend-row"><span class="legend-dot" style="background:#96c896"></span>Measured Increase</div>
      <div class="legend-row"><span class="legend-dot" style="background:#006400"></span>Existing Project</div>`;
    return div;
  };
  legend.addTo(mapInstance);
  setTimeout(() => { if (mapInstance) mapInstance.invalidateSize(); }, 300);
}

// ═══ NAVIGATION ════════════════════════════════════════════
function showPage(num) {
  state.currentPage = num;
  document.querySelectorAll('#pageContainer .page-wrapper').forEach(pw => {
    pw.style.display = parseInt(pw.dataset.page) === num ? 'block' : 'none';
  });
  document.getElementById('pageNum').textContent = num;
  document.getElementById('prevBtn').disabled = num <= 1;
  document.getElementById('nextBtn').disabled = num >= state.totalPages;
  document.getElementById('pageType').textContent = PAGE_LABELS[num - 1] || '';
  document.querySelectorAll('.thumb').forEach(t => {
    t.classList.toggle('active', parseInt(t.dataset.thumb) === num);
  });
  if (num === 2) setTimeout(initPage2Map, 200);
  if (num === 3) setTimeout(() => { initPage3PhMap(); initPage3DepthMap(); }, 200);
  if (num === 4) setTimeout(initPortfolioMap, 200);
  // Re-fit narratives now that the page is actually visible. Autofit only
  // works when clientHeight > 0, which it isn't on display:none pages, so
  // initial fits during generation are no-ops for whichever page wasn't current.
  if (num === 2 || num === 4) {
    requestAnimationFrame(() => {
      if (num === 2) autofitNarrative('.p2-summary-overlay', { max: state.narrativeFontMax?.p2 ?? 11, min: 8 });
      if (num === 4) autofitNarrative('.p4-summary-overlay', { max: state.narrativeFontMax?.p4 ?? 16, min: 11 });
    });
  }
}
function prevPage() { if (state.currentPage > 1) showPage(state.currentPage - 1); }
function nextPage() { if (state.currentPage < state.totalPages) showPage(state.currentPage + 1); }
function renderThumbs() {
  const container = document.getElementById('page-thumbs');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 1; i <= state.totalPages; i++) {
    const t = document.createElement('div');
    t.className = 'thumb' + (i === state.currentPage ? ' active' : '') + (DYNAMIC_PAGES.has(i) ? ' dynamic' : '');
    t.dataset.thumb = i;
    t.textContent = i;
    t.onclick = ((page) => () => showPage(page))(i);
    container.appendChild(t);
  }
}

// ═══ WORKFLOW STEPS ═════════════════════════════════════════
function goToStep(num) {
  state.currentStep = num;
  document.querySelectorAll('.step').forEach(s => {
    const sn = parseInt(s.dataset.step);
    s.classList.toggle('active', sn === num);
    s.classList.toggle('completed', state.completedSteps.has(sn) && sn !== num);
  });
  const setPanel = (id, { visible, expanded }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = visible ? 'block' : 'none';
    el.classList.toggle('collapsed', !expanded);
  };
  const reviewIds = ['review-panel', 'calc-panel', 'generate-panel'];
  if (num === 1) {
    reviewIds.forEach(id => setPanel(id, { visible: state.loaded, expanded: state.loaded }));
    setPanel('edit-panel', { visible: false, expanded: false });
    setPanel('send-panel', { visible: false, expanded: false });
  } else if (num === 2) {
    reviewIds.forEach(id => setPanel(id, { visible: state.loaded, expanded: false }));
    setPanel('edit-panel', { visible: state.loaded, expanded: state.loaded });
    setPanel('send-panel', { visible: state.loaded, expanded: false });
  } else if (num === 3) {
    reviewIds.forEach(id => setPanel(id, { visible: state.loaded, expanded: false }));
    setPanel('edit-panel', { visible: state.loaded, expanded: false });
    setPanel('send-panel', { visible: state.loaded, expanded: state.loaded });
  }
}
function completeStep(n) {
  state.completedSteps.add(n);
  document.querySelectorAll('.step').forEach(s => {
    const sn = parseInt(s.dataset.step);
    if (state.completedSteps.has(sn) && sn !== state.currentStep) s.classList.add('completed');
  });
}

// ═══ UI HELPERS ═════════════════════════════════════════════
function togglePanel(header) { header.closest('.panel').classList.toggle('collapsed'); }
function expandPanel(id) { document.getElementById(id).classList.remove('collapsed'); }
function setStatus(msg, working) {
  const text = document.getElementById('statusText');
  if (text) text.textContent = msg;
  const dot = document.getElementById('statusDot');
  if (dot) dot.classList.toggle('working', !!working);
}
function toast(msg, type) {
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' ' + type : '');
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ═══ KEYBOARD ═══════════════════════════════════════════════
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const m = document.getElementById('settingsModal');
    if (m && m.classList.contains('open')) closeSettings();
  }
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
  if (e.key === 'ArrowLeft') prevPage();
  if (e.key === 'ArrowRight') nextPage();
});
document.addEventListener('input', (e) => {
  if (e.target.id === 'narrative-page2') {
    state.narratives.page2 = e.target.textContent;
    autofitNarrative('.p2-summary-overlay', { max: 11, min: 8 });
  }
  if (e.target.id === 'narrative-page4') {
    state.narratives.page4 = e.target.textContent;
    autofitNarrative('.p4-summary-overlay', { max: 16, min: 11 });
  }
});

// Update the helper text under the Communication Style select to describe
// when each register is appropriate. Called on init and on select change.
const STYLE_HINTS = {
  standard: 'Use for someone already familiar with AgriProve, an existing contact, or a warm referral. Partnership tone, measured language.',
  stormboy: 'Use post-farm-visit for a cold or unfamiliar prospect. High-energy, value-led, designed to convert someone who needs a stronger hook.'
};
function updateStyleHint() {
  const sel = document.getElementById('commStyle');
  const hint = document.getElementById('styleHint');
  if (!sel || !hint) return;
  hint.textContent = STYLE_HINTS[sel.value] || '';
}

// ═══ INIT ═══════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  loadStoredApiKey();
  renderAllPages();
  renderThumbs();
  showPage(1);
  updateStyleHint();
});

window.snapshotApp = {
  load: loadSnapshotData,
  getState: () => ({ parsed: state.parsed, calcs: state.calcs, narratives: state.narratives }),
  generateAll
};
