export function renderUI(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Dynamic Workers Demo</title>
<style>
  :root {
    --bg: #0a0a0f;
    --surface: #14141f;
    --surface2: #1e1e2e;
    --border: #2a2a3a;
    --text: #e0e0f0;
    --text-dim: #8888aa;
    --accent: #6366f1;
    --accent2: #f43f5e;
    --green: #22c55e;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: "Inter", -apple-system, system-ui, sans-serif;
    height: 100vh;
    display: flex;
    overflow: hidden;
  }

  /* Left panel */
  .sidebar {
    width: 340px;
    min-width: 340px;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow-y: auto;
  }

  .sidebar-header {
    padding: 20px;
    border-bottom: 1px solid var(--border);
  }

  .sidebar-header h1 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 4px;
    background: linear-gradient(135deg, #6366f1, #f43f5e);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .sidebar-header p {
    font-size: 11px;
    color: var(--text-dim);
  }

  .section {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
  }

  .section-title {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--text-dim);
    margin-bottom: 12px;
    font-weight: 600;
  }

  .slider-group {
    margin-bottom: 12px;
  }

  .slider-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    font-size: 13px;
  }

  .slider-label .name { font-weight: 500; }

  .version-badge {
    font-size: 11px;
    font-weight: 700;
    font-family: "SF Mono", "Fira Code", monospace;
    background: var(--surface2);
    border: 1px solid var(--border);
    padding: 2px 8px;
    border-radius: 4px;
    min-width: 36px;
    text-align: center;
  }

  input[type="range"] {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: var(--surface2);
    outline: none;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    border: 2px solid var(--bg);
    box-shadow: 0 0 6px rgba(99, 102, 241, 0.4);
  }

  input[type="range"].api-slider::-webkit-slider-thumb {
    background: var(--accent2);
    box-shadow: 0 0 6px rgba(244, 63, 94, 0.4);
  }

  /* Users list */
  .add-user-row {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .add-user-row input {
    flex: 1;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 8px 12px;
    color: var(--text);
    font-size: 13px;
    outline: none;
  }

  .add-user-row input:focus {
    border-color: var(--accent);
  }

  .btn {
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }

  .btn:hover { opacity: 0.9; }
  .btn-sm { padding: 4px 10px; font-size: 11px; }
  .btn-danger { background: var(--accent2); }
  .btn-ghost {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-dim);
  }
  .btn-ghost:hover { border-color: var(--text-dim); color: var(--text); }

  .user-card {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 8px;
  }

  .user-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .user-name {
    font-size: 13px;
    font-weight: 600;
  }

  .user-id {
    font-size: 10px;
    color: var(--text-dim);
    font-family: "SF Mono", monospace;
  }

  .user-slider-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 6px;
    font-size: 11px;
  }

  .user-slider-row label {
    min-width: 44px;
    color: var(--text-dim);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .user-slider-row input[type="range"] { flex: 1; height: 4px; }
  .user-slider-row input[type="range"]:disabled {
    opacity: 0.3;
    cursor: default;
  }
  .user-slider-row input[type="range"]:disabled::-webkit-slider-thumb {
    background: var(--text-dim);
    box-shadow: none;
    cursor: default;
  }
  .user-slider-row .version-badge { font-size: 10px; padding: 1px 6px; }
  .user-slider-row .version-badge.synced { opacity: 0.4; }

  .toggle-switch {
    position: relative;
    width: 36px;
    height: 20px;
    flex-shrink: 0;
  }
  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  .toggle-track {
    position: absolute;
    inset: 0;
    background: var(--surface);
    border: 2px solid var(--border);
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }
  .toggle-track::after {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--text-dim);
    transition: transform 0.2s, background 0.2s;
  }
  .toggle-switch input:checked + .toggle-track {
    background: var(--accent);
    border-color: var(--accent);
  }
  .toggle-switch input:checked + .toggle-track::after {
    transform: translateX(16px);
    background: white;
  }

  .users-empty {
    text-align: center;
    padding: 20px;
    color: var(--text-dim);
    font-size: 12px;
  }

  /* Right panel - grid */
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .main-header {
    padding: 12px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--surface);
  }

  .main-header h2 {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-dim);
  }

  .refresh-info {
    font-size: 11px;
    color: var(--text-dim);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .pulse {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--green);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .grid {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(7, 1fr);
    gap: 4px;
    padding: 4px;
    overflow: hidden;
  }

  .grid-cell {
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid var(--border);
    position: relative;
    min-height: 0;
  }

  .grid-cell iframe {
    width: 100%;
    height: 100%;
    border: none;
  }

  .grid-cell .cell-label {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    padding: 3px 6px;
    font-size: 9px;
    color: white;
    text-align: center;
    pointer-events: none;
  }

  /* Mixer / crossfader */
  .mixer {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 14px;
    margin-bottom: 12px;
  }

  .mixer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .mixer-versions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    font-family: "SF Mono", "Fira Code", monospace;
    font-size: 12px;
    font-weight: 700;
  }

  .mixer-versions .left { color: var(--text-dim); }
  .mixer-versions .right { color: var(--accent); }
  .mixer-versions .center {
    font-size: 9px;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 400;
  }

  .mixer-track {
    position: relative;
    padding: 4px 0;
  }

  .mixer-track .center-mark {
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 1px;
    background: var(--text-dim);
    opacity: 0.3;
    pointer-events: none;
    z-index: 1;
  }

  .mixer-track input[type="range"] {
    position: relative;
    z-index: 2;
  }

  .mixer-pct {
    display: flex;
    justify-content: space-between;
    margin-top: 4px;
    font-size: 10px;
    color: var(--text-dim);
    font-family: "SF Mono", monospace;
  }

  .mixer-pct .active { color: var(--text); font-weight: 600; }

  /* Preset buttons */
  .presets {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 8px;
  }

  .preset-btn {
    font-size: 10px;
    padding: 4px 10px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--text-dim);
    cursor: pointer;
  }
  .preset-btn:hover { border-color: var(--accent); color: var(--text); }
</style>
</head>
<body>

<div class="sidebar">
  <div class="sidebar-header">
    <h1>Dynamic Workers Demo</h1>
    <p>Version switching with Cloudflare Dynamic Workers + Durable Objects</p>
  </div>

  <div class="section">
    <div class="section-title">Layout Service — Rollout Mixer</div>
    <div class="mixer" id="layout-mixer">
      <div class="mixer-versions">
        <span class="left" id="mixer-left-label">v1</span>
        <span class="center" id="mixer-current-label">v1</span>
        <span class="right" id="mixer-right-label">v2</span>
      </div>
      <div class="mixer-track">
        <div class="center-mark"></div>
        <input type="range" id="mixer-slider" min="0" max="100" value="50">
      </div>
      <div class="mixer-pct">
        <span id="mixer-left-pct">0%</span>
        <span id="mixer-current-pct" class="active">100%</span>
        <span id="mixer-right-pct">0%</span>
      </div>
    </div>
    <div class="slider-group">
      <div class="slider-label">
        <span class="name">API Service</span>
        <span class="version-badge" id="api-badge">v1</span>
      </div>
      <input type="range" id="api-slider" class="api-slider" min="1" max="10" value="1">
    </div>
    <div class="presets">
      <button class="preset-btn" onclick="resetAll()">Reset to v1</button>
    </div>
  </div>

  <div class="section" style="flex: 1; overflow-y: auto;">
    <div class="section-title">Users</div>
    <div class="add-user-row">
      <input type="text" id="new-user-name" placeholder="User name..." onkeydown="if(event.key==='Enter')addUser()">
      <button class="btn" onclick="addUser()">Add</button>
    </div>
    <div id="users-list">
      <div class="users-empty">Add users to see per-user version targeting</div>
    </div>
  </div>
</div>

<div class="main">
  <div class="main-header">
    <h2>Live Preview Grid</h2>
    <div class="refresh-info">
      <span class="pulse"></span>
      Auto-refreshing every 2s
    </div>
  </div>
  <div class="grid" id="grid"></div>
</div>

<script>
const API = "";
const MAX_VERSION = 10;
const GRID_SIZE = 42; // 6x7

let state = { layoutBase: 1, layoutBalance: 50, apiVersion: 1, users: {} };
let refreshTimer = null;
// Wavefront state
let cellTargets = [];
let waveRunning = false;
let waveDirty = false;
const STAGGER_MS = 30;

// --- Mixer math ---
// balance 0=100% prev, 50=100% current, 100=100% next
function getMixerInfo() {
  const base = state.layoutBase;
  const bal = state.layoutBalance;
  const prev = Math.max(1, base - 1);
  const next = Math.min(MAX_VERSION, base + 1);

  let leftPct, rightPct, currentPct;
  if (bal <= 50) {
    leftPct = Math.round(((50 - bal) / 50) * 100);
    rightPct = 0;
    currentPct = 100 - leftPct;
  } else {
    leftPct = 0;
    rightPct = Math.round(((bal - 50) / 50) * 100);
    currentPct = 100 - rightPct;
  }

  return { base, prev, next, leftPct, rightPct, currentPct };
}

// Deterministic version for a cell index based on mixer balance
function resolveLayoutVersion(cellIndex) {
  const { base, prev, next, leftPct, rightPct } = getMixerInfo();
  // Use cell position to decide: lower indices get the "other" version first
  const threshold = cellIndex / GRID_SIZE * 100;
  if (leftPct > 0 && threshold < leftPct) return prev;
  if (rightPct > 0 && threshold < rightPct) return next;
  return base;
}

// --- Init ---
async function init() {
  const res = await fetch(API + "/api/state");
  const s = await res.json();
  // Handle stale DO state from before the mixer refactor
  state.layoutBase = s.layoutBase || s.layoutVersion || 1;
  state.layoutBalance = s.layoutBalance ?? 50;
  state.apiVersion = s.apiVersion || 1;
  state.users = s.users || {};
  document.getElementById("mixer-slider").value = state.layoutBalance;
  document.getElementById("api-slider").value = state.apiVersion;
  updateMixer();
  updateApiBadge();
  renderUsers();
  renderGrid();
  startRefresh();
}

// --- Mixer UI updates ---
function updateMixer() {
  const { base, prev, next, leftPct, rightPct, currentPct } = getMixerInfo();

  document.getElementById("mixer-left-label").textContent = base <= 1 ? "—" : "v" + prev;
  document.getElementById("mixer-current-label").textContent = "v" + base;
  document.getElementById("mixer-right-label").textContent = base >= MAX_VERSION ? "—" : "v" + next;

  const lp = document.getElementById("mixer-left-pct");
  const cp = document.getElementById("mixer-current-pct");
  const rp = document.getElementById("mixer-right-pct");

  lp.textContent = leftPct + "%";
  cp.textContent = currentPct + "% v" + base;
  rp.textContent = rightPct + "%";

  lp.className = leftPct > 0 ? "active" : "";
  cp.className = currentPct === 100 ? "active" : "";
  rp.className = rightPct > 0 ? "active" : "";
}

function updateApiBadge() {
  document.getElementById("api-badge").textContent = "v" + document.getElementById("api-slider").value;
}

// --- Mixer slider ---
// "input" fires while dragging — just update visuals, no promotion
document.getElementById("mixer-slider").addEventListener("input", (e) => {
  state.layoutBalance = parseInt(e.target.value);
  updateMixer();
  refreshGrid();

  // Fire-and-forget save (no await, keep dragging smooth)
  fetch(API + "/api/global", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ layoutBase: state.layoutBase, layoutBalance: state.layoutBalance }),
  }).then(r => r.json()).then(s => { state = s; });
});

// "change" fires on release — check for promote/demote
document.getElementById("mixer-slider").addEventListener("change", async (e) => {
  let bal = parseInt(e.target.value);

  if (bal >= 100 && state.layoutBase < MAX_VERSION) {
    state.layoutBase++;
    bal = 50;
    e.target.value = 50;
  } else if (bal <= 0 && state.layoutBase > 1) {
    state.layoutBase--;
    bal = 50;
    e.target.value = 50;
  }

  state.layoutBalance = bal;
  updateMixer();

  await fetch(API + "/api/global", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ layoutBase: state.layoutBase, layoutBalance: bal }),
  }).then(r => r.json()).then(s => { state = s; });

  syncDisabledSliders();
  refreshGrid();
});

// --- API slider ---
document.getElementById("api-slider").addEventListener("input", async (e) => {
  const v = parseInt(e.target.value);
  updateApiBadge();
  await fetch(API + "/api/global", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiVersion: v }),
  }).then(r => r.json()).then(s => { state = s; });
  syncDisabledSliders();
  refreshGrid();
});

// --- Presets ---
async function resetAll() {
  await fetch(API + "/api/global", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ layoutBase: 1, layoutBalance: 50, apiVersion: 1 }),
  }).then(r => r.json()).then(s => { state = s; });
  document.getElementById("mixer-slider").value = 50;
  document.getElementById("api-slider").value = 1;
  updateMixer();
  updateApiBadge();
  syncDisabledSliders();
  refreshGrid();
}

// --- Users ---
let userCounter = 0;
async function addUser() {
  const input = document.getElementById("new-user-name");
  const name = input.value.trim() || "User " + (++userCounter);
  input.value = "";
  const id = crypto.randomUUID().slice(0, 8);
  const res = await fetch(API + "/api/user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, name }),
  });
  state = await res.json();
  renderUsers();
  renderGrid();
}

async function removeUser(id) {
  const res = await fetch(API + "/api/user/" + id, { method: "DELETE" });
  state = await res.json();
  renderUsers();
  renderGrid();
}

async function setUserOverride(id, field, value) {
  const body = {};
  body[field + "Override"] = parseInt(value);
  const res = await fetch(API + "/api/user/" + id, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  state = await res.json();
  refreshGrid();
}

async function clearOverride(id, field) {
  const res = await fetch(API + "/api/clear/" + id + "/" + field, { method: "POST" });
  state = await res.json();
  renderUsers();
  refreshGrid();
}

function toggleOverride(id, field, enabled) {
  if (enabled) {
    setUserOverride(id, field, state.layoutBase);
    renderUsers();
  } else {
    clearOverride(id, field);
  }
}

function renderUsers() {
  const container = document.getElementById("users-list");
  const entries = Object.entries(state.users);
  if (entries.length === 0) {
    container.innerHTML = '<div class="users-empty">Add users to see per-user version targeting</div>';
    return;
  }

  container.innerHTML = entries.map(([id, user]) => {
    const pinned = user.layoutOverride !== undefined;
    const layoutVal = pinned ? user.layoutOverride : state.layoutBase;
    return \`
      <div class="user-card">
        <div class="user-card-header">
          <div>
            <div class="user-name">\${user.name}</div>
            <div class="user-id">\${id}</div>
          </div>
          <button class="btn btn-sm btn-danger" onclick="removeUser('\${id}')">Remove</button>
        </div>
        <div class="user-slider-row">
          <label class="toggle-switch" title="\${pinned ? 'Pinned to v' + layoutVal : 'Following global'}">
            <input type="checkbox" \${pinned ? "checked" : ""}
              onchange="toggleOverride('\${id}','layout',this.checked)">
            <span class="toggle-track"></span>
          </label>
          <input type="range" min="1" max="\${MAX_VERSION}" value="\${layoutVal}"
            \${pinned ? "" : "disabled"}
            oninput="setUserOverride('\${id}','layout',this.value);this.nextElementSibling.textContent='v'+this.value">
          <span class="version-badge \${pinned ? "" : "synced"}">v\${layoutVal}</span>
        </div>
      </div>
    \`;
  }).join("");
}

// --- Sync disabled sliders ---
function syncDisabledSliders() {
  document.querySelectorAll(".user-slider-row").forEach(row => {
    const slider = row.querySelector("input[type=range]");
    if (slider && slider.disabled) {
      const lbl = row.querySelector("label").textContent.trim();
      const globalVal = lbl === "Layout" ? state.layoutBase : state.apiVersion;
      slider.value = globalVal;
      const badge = row.querySelector(".version-badge");
      if (badge) badge.textContent = "v" + globalVal;
    }
  });
}

// --- Grid ---
function getCells() {
  const entries = Object.entries(state.users);
  const cells = [];

  for (let i = 0; i < entries.length; i++) {
    const [id, user] = entries[i];
    cells.push({
      id,
      label: user.name,
      lv: user.layoutOverride ?? resolveLayoutVersion(i),
      av: user.apiOverride ?? state.apiVersion,
    });
  }

  for (let i = cells.length; i < GRID_SIZE; i++) {
    cells.push({
      id: "default-" + i,
      label: "#" + (i + 1),
      lv: resolveLayoutVersion(i),
      av: state.apiVersion,
    });
  }
  return cells;
}

function renderGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  for (const c of getCells()) {
    const cell = document.createElement("div");
    cell.className = "grid-cell";
    cell.dataset.cellId = c.id;
    cell.innerHTML = \`
      <iframe src="/preview?layoutVersion=\${c.lv}&apiVersion=\${c.av}&userId=\${c.id}" loading="lazy"></iframe>
      <div class="cell-label">\${c.label}</div>
    \`;
    grid.appendChild(cell);
  }
}

function refreshGrid() {
  cellTargets = getCells();

  const gridCells = document.querySelectorAll(".grid-cell");
  if (gridCells.length !== cellTargets.length) { renderGrid(); return; }

  // Sync labels immediately
  cellTargets.forEach((c, i) => {
    const el = gridCells[i];
    if (el && el.dataset.cellId !== c.id) {
      el.dataset.cellId = c.id;
      el.querySelector(".cell-label").textContent = c.label;
    }
  });

  if (!waveRunning) {
    startWave();
  } else {
    waveDirty = true;
  }
}

function startWave() {
  waveRunning = true;
  waveDirty = false;
  advanceWave(0);
}

function advanceWave(i) {
  if (i >= GRID_SIZE) {
    waveRunning = false;
    if (waveDirty) startWave();
    return;
  }

  const gridCells = document.querySelectorAll(".grid-cell");
  const c = cellTargets[i];
  const el = gridCells[i];
  if (el && c) {
    el.querySelector("iframe").src =
      \`/preview?layoutVersion=\${c.lv}&apiVersion=\${c.av}&userId=\${c.id}&_t=\${Date.now()}\`;
  }

  setTimeout(() => advanceWave(i + 1), STAGGER_MS);
}

function startRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(() => {
    refreshGrid();
  }, 3000);
}

init();
</script>
</body>
</html>`;
}
