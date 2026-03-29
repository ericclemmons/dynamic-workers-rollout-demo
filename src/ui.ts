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
  .user-slider-row .version-badge { font-size: 10px; padding: 1px 6px; }

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

  .mixer-versions .left,
  .mixer-versions .right {
    cursor: pointer;
    padding: 2px 8px;
    border-radius: 4px;
    transition: background 0.15s, color 0.15s;
  }
  .mixer-versions .left { color: var(--text-dim); }
  .mixer-versions .left:hover { background: var(--surface); color: var(--text); }
  .mixer-versions .right { color: var(--accent); }
  .mixer-versions .right:hover { background: rgba(99,102,241,0.15); }
  .mixer-versions .left.disabled,
  .mixer-versions .right.disabled {
    opacity: 0.3;
    cursor: default;
    pointer-events: none;
  }
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
        <span class="left" id="mixer-left-label" onclick="jumpVersion(-1)">v1</span>
        <span class="center" id="mixer-current-label">v1</span>
        <span class="right" id="mixer-right-label" onclick="jumpVersion(1)">v2</span>
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
    <div class="section-title" style="margin-top:16px">API Service — Rollout Mixer</div>
    <div class="mixer" id="api-mixer">
      <div class="mixer-versions">
        <span class="left" id="api-mixer-left-label" onclick="jumpApiVersion(-1)">—</span>
        <span class="center" id="api-mixer-current-label">v1</span>
        <span class="right" id="api-mixer-right-label" onclick="jumpApiVersion(1)">v2</span>
      </div>
      <div class="mixer-track">
        <div class="center-mark"></div>
        <input type="range" id="api-mixer-slider" class="api-slider" min="0" max="100" value="50">
      </div>
      <div class="mixer-pct">
        <span id="api-mixer-left-pct">0%</span>
        <span id="api-mixer-current-pct" class="active">100%</span>
        <span id="api-mixer-right-pct">0%</span>
      </div>
    </div>
    <div class="presets">
      <button class="preset-btn" onclick="resetAll()">Reset to v1</button>
    </div>
  </div>

  <div class="section" style="flex: 1; overflow-y: auto;">
    <div class="section-title">Users</div>
    <div class="add-user-row">
      <button class="btn" onclick="addUser()" style="width:100%">+ Add User</button>
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

let state = { layoutBase: 1, layoutBalance: 50, apiBase: 1, apiBalance: 50, users: {} };
let refreshTimer = null;
// Wavefront state
let cellTargets = [];
let waveRunning = false;
let waveDirty = false;
const STAGGER_MS = 30;

// --- Mixer math (shared for layout and API) ---
// balance 0=100% prev, 50=100% current, 100=100% next
function getMixerInfo(base, bal) {
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

// Simple string hash → 0–99. Deterministic: same userId always lands
// in the same spot on the ring, so rollouts are stable per-user.
function hashToRing(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return ((h % 100) + 100) % 100; // ensure positive 0–99
}

// Consistent-hash rollout: userId hashes to a ring position.
// As the balance arc widens, more positions fall inside → more
// users get the new (or previous) version. Same user never flickers.
function resolveVersion(base, bal, userId) {
  const { prev, next, leftPct, rightPct } = getMixerInfo(base, bal);
  const pos = hashToRing(userId);
  if (leftPct > 0 && pos < leftPct) return prev;
  if (rightPct > 0 && pos < rightPct) return next;
  return base;
}

// --- Init ---
async function init() {
  const res = await fetch(API + "/api/state");
  const s = await res.json();
  state.layoutBase = s.layoutBase || 1;
  state.layoutBalance = s.layoutBalance ?? 50;
  state.apiBase = s.apiBase || s.apiVersion || 1;
  state.apiBalance = s.apiBalance ?? 50;
  state.users = s.users || {};
  document.getElementById("mixer-slider").value = state.layoutBalance;
  document.getElementById("api-mixer-slider").value = state.apiBalance;
  updateMixer("layout");
  updateMixer("api");
  renderUsers();
  renderGrid();
  startRefresh();
}

// --- Mixer UI updates (works for both layout and api) ---
function updateMixer(service) {
  const isLayout = service === "layout";
  const base = isLayout ? state.layoutBase : state.apiBase;
  const bal = isLayout ? state.layoutBalance : state.apiBalance;
  const prefix = isLayout ? "mixer" : "api-mixer";
  const { prev, next, leftPct, rightPct, currentPct } = getMixerInfo(base, bal);

  const leftEl = document.getElementById(prefix + "-left-label");
  const rightEl = document.getElementById(prefix + "-right-label");
  leftEl.textContent = base <= 1 ? "—" : "v" + prev;
  leftEl.className = "left" + (base <= 1 ? " disabled" : "");
  document.getElementById(prefix + "-current-label").textContent = "v" + base;
  rightEl.textContent = base >= MAX_VERSION ? "—" : "v" + next;
  rightEl.className = "right" + (base >= MAX_VERSION ? " disabled" : "");

  const lp = document.getElementById(prefix + "-left-pct");
  const cp = document.getElementById(prefix + "-current-pct");
  const rp = document.getElementById(prefix + "-right-pct");

  lp.textContent = leftPct + "%";
  cp.textContent = currentPct + "% v" + base;
  rp.textContent = rightPct + "%";

  lp.className = leftPct > 0 ? "active" : "";
  cp.className = currentPct === 100 ? "active" : "";
  rp.className = rightPct > 0 ? "active" : "";
}

// --- Generic mixer slider wiring (works for both layout and api) ---
function wireMixer(sliderId, service) {
  const baseKey = service + "Base";
  const balKey = service + "Balance";

  // "input" fires while dragging — update visuals, no promotion
  document.getElementById(sliderId).addEventListener("input", (e) => {
    state[balKey] = parseInt(e.target.value);
    updateMixer(service);
    refreshGrid();

    const body = {};
    body[baseKey] = state[baseKey];
    body[balKey] = state[balKey];
    fetch(API + "/api/global", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(r => r.json()).then(s => { state = s; });
  });

  // "change" fires on release — check for promote/demote
  document.getElementById(sliderId).addEventListener("change", async (e) => {
    let bal = parseInt(e.target.value);

    if (bal >= 100 && state[baseKey] < MAX_VERSION) {
      state[baseKey]++;
      bal = 50;
      e.target.value = 50;
    } else if (bal <= 0 && state[baseKey] > 1) {
      state[baseKey]--;
      bal = 50;
      e.target.value = 50;
    }

    state[balKey] = bal;
    updateMixer(service);

    const body = {};
    body[baseKey] = state[baseKey];
    body[balKey] = bal;
    await fetch(API + "/api/global", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(r => r.json()).then(s => { state = s; });

    refreshGrid();
  });
}

wireMixer("mixer-slider", "layout");
wireMixer("api-mixer-slider", "api");

// --- Jump to prev/next version instantly ---
function makeJumper(service) {
  const baseKey = service + "Base";
  const balKey = service + "Balance";
  const sliderId = service === "layout" ? "mixer-slider" : "api-mixer-slider";

  return async function(direction) {
    const newBase = state[baseKey] + direction;
    if (newBase < 1 || newBase > MAX_VERSION) return;
    state[baseKey] = newBase;
    state[balKey] = 50;
    document.getElementById(sliderId).value = 50;
    updateMixer(service);

    const body = {};
    body[baseKey] = newBase;
    body[balKey] = 50;
    await fetch(API + "/api/global", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(r => r.json()).then(s => { state = s; });

    refreshGrid();
  };
}

const jumpVersion = makeJumper("layout");
const jumpApiVersion = makeJumper("api");

// --- Presets ---
async function resetAll() {
  await fetch(API + "/api/global", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ layoutBase: 1, layoutBalance: 50, apiBase: 1, apiBalance: 50 }),
  }).then(r => r.json()).then(s => { state = s; });
  document.getElementById("mixer-slider").value = 50;
  document.getElementById("api-mixer-slider").value = 50;
  updateMixer("layout");
  updateMixer("api");
  refreshGrid();
}

// --- Users ---
let userCounter = 0;
async function addUser() {
  const name = "User " + (++userCounter);
  const id = crypto.randomUUID().slice(0, 8);
  await fetch(API + "/api/user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, name }),
  });
  // Immediately pin to current base versions
  const res = await fetch(API + "/api/user/" + id, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ layoutOverride: state.layoutBase, apiOverride: state.apiBase }),
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



function renderUsers() {
  const container = document.getElementById("users-list");
  const entries = Object.entries(state.users);
  if (entries.length === 0) {
    container.innerHTML = '<div class="users-empty">Add users to see per-user version targeting</div>';
    return;
  }

  container.innerHTML = entries.map(([id, user]) => {
    const layoutVal = user.layoutOverride ?? state.layoutBase;
    const apiVal = user.apiOverride ?? state.apiBase;
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
          <label>Layout</label>
          <input type="range" min="1" max="\${MAX_VERSION}" value="\${layoutVal}"
            oninput="setUserOverride('\${id}','layout',this.value);this.nextElementSibling.textContent='v'+this.value">
          <span class="version-badge">v\${layoutVal}</span>
        </div>
        <div class="user-slider-row">
          <label>API</label>
          <input type="range" min="1" max="\${MAX_VERSION}" value="\${apiVal}"
            class="api-slider"
            oninput="setUserOverride('\${id}','api',this.value);this.nextElementSibling.textContent='v'+this.value">
          <span class="version-badge">v\${apiVal}</span>
        </div>
      </div>
    \`;
  }).join("");
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
      lv: user.layoutOverride ?? resolveVersion(state.layoutBase, state.layoutBalance, id),
      av: user.apiOverride ?? resolveVersion(state.apiBase, state.apiBalance, id),
    });
  }

  for (let i = cells.length; i < GRID_SIZE; i++) {
    cells.push({
      id: "default-" + i,
      label: "#" + (i + 1),
      lv: resolveVersion(state.layoutBase, state.layoutBalance, "default-" + i),
      av: resolveVersion(state.apiBase, state.apiBalance, "default-" + i),
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
