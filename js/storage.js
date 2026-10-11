function utf8ToBase64(str) {
  return window.btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
    return String.fromCharCode(parseInt(p1, 16));
  }));
}

function base64ToUtf8(str) {
  return decodeURIComponent(Array.prototype.map.call(window.atob(str), function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

// Bump SAVE_VERSION whenever the save shape changes and add a step to migrateState.
const SAVE_VERSION = 5;
const BACKUP_KEY = 'UMA_3GODDESSES_BACKUPS';
const MAX_BACKUPS = 20;
const AUTO_BACKUP_INTERVAL_MS = 10 * 60 * 1000;
// True when the page was opened from a read-only viewer link (#view=...).
let IS_VIEWER = false;

// ---------- Validation & migration ----------

// Returns a list of problems; an empty list means the save can be loaded.
function validateState(state) {
  const errors = [];
  if (!state || typeof state !== 'object' || Array.isArray(state)) return ['Save is not a JSON object.'];
  if (typeof state.version === 'number' && state.version > SAVE_VERSION) {
    errors.push(`Save was made by a newer version of the site (v${state.version}, this site reads up to v${SAVE_VERSION}).`);
  }
  if (!state.teams || typeof state.teams !== 'object') {
    errors.push('Missing "teams".');
  } else {
    TEAM_KEYS.forEach(t => {
      const team = state.teams[t];
      if (!team || typeof team !== 'object') { errors.push(`Missing team "${t}".`); return; }
      if (team.umas !== undefined && (!Array.isArray(team.umas) || team.umas.some(u => typeof u !== 'string'))) {
        errors.push(`Team "${t}": "umas" must be a list of names.`);
      }
      if (team.players !== undefined && !Array.isArray(team.players)) errors.push(`Team "${t}": "players" must be a list.`);
    });
  }
  ['availablePot1', 'availablePot2', 'availablePot3', 'snakeDraftOrder', 'pickHistory', 'umaPickHistory', 'matches'].forEach(k => {
    if (state[k] !== undefined && !Array.isArray(state[k])) errors.push(`"${k}" must be a list.`);
  });
  ['currentPickIndex', 'currentRoundRobinIndex', 'turnDuration', 'racesPerTrack'].forEach(k => {
    if (state[k] !== undefined && typeof state[k] !== 'number') errors.push(`"${k}" must be a number.`);
  });
  if (state.tracksState !== undefined) {
    if (!state.tracksState || typeof state.tracksState !== 'object' || !Array.isArray(state.tracksState.tracks)) {
      errors.push('"tracksState.tracks" must be a list.');
    }
  }
  if (Array.isArray(state.matches) && state.matches.some(m => !m || typeof m !== 'object')) {
    errors.push('"matches" contains an invalid entry.');
  }
  if (state.bonusPoints !== undefined && (typeof state.bonusPoints !== 'object' || state.bonusPoints === null)) {
    errors.push('"bonusPoints" must be an object.');
  }
  return errors;
}

// Upgrades an older save in place, one version step at a time.
function migrateState(state) {
  const from = typeof state.version === 'number' ? state.version : 4;
  if (from < 5) {
    // Hakodate 2600 was replaced by Kyoto 3000.
    const fix = id => (id === 'hakodate-2600' ? 'kyoto-3000' : id);
    if (state.tracksState) {
      (state.tracksState.tracks || []).forEach(t => { t.id = fix(t.id); });
      (state.tracksState.history || []).forEach(h => { h.trackId = fix(h.trackId); });
    }
    (state.matches || []).forEach(m => { m.trackId = fix(m.trackId); });
  }
  state.version = SAVE_VERSION;
  return state;
}

// Parses and checks a raw save string. Returns { state } or { errors }.
function parseSaveString(raw) {
  let state;
  try {
    state = JSON.parse(raw);
  } catch (e) {
    return { errors: ['File is not valid JSON: ' + e.message] };
  }
  const errors = validateState(state);
  if (errors.length) return { errors };
  return { state: migrateState(state) };
}

// ---------- Save status indicator ----------

let lastSaveOk = null;

function setSaveStatus(ok, message) {
  let el = document.getElementById('save-status');
  if (!el) {
    if (!document.body) return;
    el = document.createElement('div');
    el.id = 'save-status';
    el.title = 'Click to open backups';
    el.onclick = () => openBackupsPanel();
    document.body.appendChild(el);
  }
  el.className = ok ? 'save-status ok' : 'save-status error';
  el.textContent = message;
  if (!ok) el.title = 'Saving to this browser failed. Export a save file to avoid losing data. Click to open backups.';
  else el.title = 'Click to open backups';
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDateTime(ts) {
  return new Date(ts).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ---------- Backups ----------

function getBackups() {
  try {
    const list = JSON.parse(localStorage.getItem(BACKUP_KEY) || '[]');
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

function writeBackups(list) {
  // If storage is full, drop the oldest backups until it fits.
  while (list.length) {
    try {
      localStorage.setItem(BACKUP_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      list.pop();
    }
  }
  try { localStorage.removeItem(BACKUP_KEY); } catch (e) {}
  return false;
}

// Stores a copy of the given save (default: the current one). Skips exact duplicates of the newest backup.
function createBackup(reason, raw) {
  if (IS_VIEWER) return false;
  try {
    if (raw === undefined) raw = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    return false;
  }
  if (!raw) return false;
  const list = getBackups();
  if (list[0] && list[0].data === raw) {
    // Same data is already backed up: keep it, but let an explicit reason ("Before ...") replace a routine label.
    if (reason.startsWith('Before') && !list[0].reason.startsWith('Before')) {
      list[0].reason = reason;
      return writeBackups(list);
    }
    return true;
  }
  list.unshift({ ts: Date.now(), reason, data: raw });
  return writeBackups(list.slice(0, MAX_BACKUPS));
}

function maybeAutoBackup() {
  const newest = getBackups()[0];
  if (!newest || Date.now() - newest.ts >= AUTO_BACKUP_INTERVAL_MS) createBackup('Auto (every 10 min)');
}

function summarizeSave(raw) {
  try {
    const s = JSON.parse(raw);
    const umas = TEAM_KEYS.reduce((n, t) => n + (s.teams?.[t]?.umas?.length || 0), 0);
    const matches = Array.isArray(s.matches) ? s.matches.length : 0;
    return `${umas} Umas drafted · ${matches} matches`;
  } catch (e) {
    return 'unreadable';
  }
}

function restoreBackup(index) {
  const b = getBackups()[index];
  if (!b) return;
  const parsed = parseSaveString(b.data);
  if (parsed.errors) {
    alert('This backup cannot be loaded:\n\n- ' + parsed.errors.join('\n- '));
    return;
  }
  if (!confirm(`Restore the backup from ${formatDateTime(b.ts)}?\n\nYour current data will be backed up first, so you can come back to it.`)) return;
  createBackup('Before restoring a backup');
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.state));
  } catch (e) {
    alert('Restore failed: ' + e.message);
    return;
  }
  window.location.reload();
}

function downloadBackup(index) {
  const b = getBackups()[index];
  if (!b) return;
  const stamp = new Date(b.ts).toISOString().replace(/[:.]/g, '-').slice(0, 19);
  downloadJson(b.data, `umanity_tournament_backup_${stamp}.json`);
}

function deleteBackup(index) {
  const list = getBackups();
  if (!list[index]) return;
  if (!confirm(`Delete the backup from ${formatDateTime(list[index].ts)}?`)) return;
  list.splice(index, 1);
  writeBackups(list);
  renderBackupsPanel();
}

function backupNow() {
  saveStateToStorage();
  const list = getBackups();
  let raw = null;
  try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  if (!raw) { alert('No tournament data to back up yet.'); return; }
  // A manual backup is always added, even if it matches the newest one.
  list.unshift({ ts: Date.now(), reason: 'Manual', data: raw });
  if (!writeBackups(list.slice(0, MAX_BACKUPS))) alert('Backup failed: browser storage is full. Use Export Save instead.');
  renderBackupsPanel();
}

function openBackupsPanel() {
  let overlay = document.getElementById('backups-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'backups-overlay';
    overlay.className = 'backups-overlay';
    overlay.onclick = e => { if (e.target === overlay) closeBackupsPanel(); };
    overlay.innerHTML = `
      <div class="backups-panel" role="dialog" aria-modal="true" aria-labelledby="backups-title">
        <div class="backups-head">
          <h3 id="backups-title">🕘 Backups</h3>
          <button class="btn btn-outline btn-sm" onclick="closeBackupsPanel()" aria-label="Close">✕</button>
        </div>
        <p class="backups-note">Saved in this browser. A backup is taken automatically every 10 minutes, at the start of each visit, and before any reset, import, share-link load or restore. The newest ${MAX_BACKUPS} are kept.</p>
        <div class="backups-actions">
          <button class="btn btn-primary btn-sm" onclick="backupNow()">＋ Back up now</button>
        </div>
        <div id="backups-list" class="backups-list"></div>
      </div>`;
    document.body.appendChild(overlay);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeBackupsPanel(); });
  }
  overlay.classList.add('open');
  renderBackupsPanel();
}

function closeBackupsPanel() {
  document.getElementById('backups-overlay')?.classList.remove('open');
}

function renderBackupsPanel() {
  const listEl = document.getElementById('backups-list');
  if (!listEl) return;
  const list = getBackups();
  if (!list.length) {
    listEl.innerHTML = '<div class="backups-empty">No backups yet.</div>';
    return;
  }
  listEl.innerHTML = list.map((b, i) => `
    <div class="backup-row">
      <div class="backup-info">
        <div class="backup-time">${formatDateTime(b.ts)}</div>
        <div class="backup-meta">${b.reason} · ${summarizeSave(b.data)}</div>
      </div>
      <div class="backup-btns">
        <button class="btn btn-outline btn-sm" onclick="restoreBackup(${i})">Restore</button>
        <button class="btn btn-outline btn-sm" onclick="downloadBackup(${i})" title="Download as .json">💾</button>
        <button class="btn btn-outline btn-sm" onclick="deleteBackup(${i})" title="Delete backup" style="color:var(--team-red);">🗑</button>
      </div>
    </div>`).join('');
}

// ---------- Save / load ----------

function buildState() {
  return {
    version: SAVE_VERSION,
    teams,
    availablePot1,
    availablePot2,
    availablePot3,
    playerPool,
    snakeDraftOrder,
    currentPickIndex,
    pickHistory,
    umaPickHistory: (typeof umaPickHistory !== 'undefined' ? umaPickHistory : []),
    selectedDrawTeam,
    tracksState,
    currentTab,
    currentRoundRobinIndex,
    turnDuration,
    matches,
    bonusPoints,
    racesPerTrack: (typeof racesPerTrack !== 'undefined' ? racesPerTrack : 1),
    playerUmaAssignments: (typeof playerUmaAssignments !== 'undefined' ? playerUmaAssignments : {}),
    // The legacy player-draft view no longer exists in index.html; treat it as inactive when missing.
    isDraftActive: document.getElementById('draft-live-view')?.classList.contains('hidden') === false,
    captainInputs: {
      red: document.getElementById('cap-red')?.value || "Captain Red",
      blue: document.getElementById('cap-blue')?.value || "Captain Blue",
      yellow: document.getElementById('cap-yellow')?.value || "Captain Yellow"
    },
    playerBulkText: document.getElementById('player-bulk-input')?.value || ""
  };
}

function saveStateToStorage() {
  // A viewer link shows a snapshot; it never writes to the viewer's own browser save.
  if (IS_VIEWER) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buildState()));
    lastSaveOk = true;
    setSaveStatus(true, `✓ Saved · ${formatTime(Date.now())}`);
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
    lastSaveOk = false;
    setSaveStatus(false, '⚠ Save failed! Export a save file');
    return;
  }
  maybeAutoBackup();
}

// rawOverride: load this save string instead of the browser's own save (viewer links).
function loadStateFromStorage(rawOverride = null) {
  try {
    const raw = rawOverride !== null ? rawOverride : localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = parseSaveString(raw);
    if (parsed.errors && rawOverride !== null) {
      alert('This viewer link could not be loaded:\n\n- ' + parsed.errors.join('\n- '));
      return false;
    }
    if (parsed.errors) {
      // Keep the broken save as a backup instead of silently overwriting it on the next save.
      createBackup('Unreadable save found at startup', raw);
      console.warn('Saved data is invalid:', parsed.errors);
      alert('The saved tournament data in this browser could not be loaded:\n\n- ' + parsed.errors.join('\n- ') +
        '\n\nA copy was kept under Backups. The site will start empty.');
      return false;
    }
    const state = parsed.state;

    if (state.teams) {
      teams = state.teams;
      TEAM_KEYS.forEach(t => {
        if (!teams[t].umas) teams[t].umas = [];
        // Twin Turbo was removed from the pool.
        teams[t].umas = teams[t].umas.filter(u => ALL_UMAS.includes(u));
        if (typeof teams[t].draftDone !== 'boolean') teams[t].draftDone = false;
        teams[t].budget = getTeamBudget(t);
        if (!Array.isArray(teams[t].players) || teams[t].players.length === 0) {
          // Saves made before the rosters were set have no players: use the tournament rosters.
          teams[t].players = [...(DEFAULT_FIXED_TEAMS[t]?.players || [])];
        }
        if (!teams[t].cap) {
          teams[t].cap = `Captain ${teams[t].name || t}`;
        }
      });
      if (!teams.red.package) teams.red.package = "A";
      if (!teams.blue.package) teams.blue.package = "B";
      if (!teams.yellow.package) teams.yellow.package = "C";
    }
    if (state.availablePot1) availablePot1 = state.availablePot1;
    if (state.availablePot2) {
      availablePot2 = state.availablePot2.filter(u => u !== "Nakayama Festa" && POT_2.includes(u));
    }
    if (state.availablePot3) {
      availablePot3 = state.availablePot3.filter(u => POT_3.includes(u));
      const isAlreadyDrawn = Object.values(teams).some(t => t.umas && t.umas.includes("Mihono Bourbon (Valentine)"));
      if (!isAlreadyDrawn && !availablePot3.includes("Mihono Bourbon (Valentine)")) {
        availablePot3.push("Mihono Bourbon (Valentine)");
      }
    }
    if (state.playerPool) playerPool = state.playerPool;
    if (state.snakeDraftOrder) snakeDraftOrder = state.snakeDraftOrder;
    if (typeof state.currentPickIndex === 'number') currentPickIndex = state.currentPickIndex;
    if (state.pickHistory) pickHistory = state.pickHistory;
    if (Array.isArray(state.umaPickHistory)) umaPickHistory = state.umaPickHistory;
    if (state.selectedDrawTeam) selectedDrawTeam = state.selectedDrawTeam;
    if (typeof state.currentRoundRobinIndex === 'number') currentRoundRobinIndex = state.currentRoundRobinIndex;

    if (state.tracksState) {
      tracksState = state.tracksState;
      DEFAULT_TRACKS.forEach(dt => {
        if (!tracksState.tracks.some(t => t.id === dt.id)) tracksState.tracks.push({ id: dt.id, status: 'available', team: null, order: null });
      });
    }
    if (Array.isArray(state.matches)) {
      matches = state.matches;
    }
    if (state.bonusPoints) bonusPoints = state.bonusPoints;
    if (typeof state.racesPerTrack === 'number' && state.racesPerTrack >= 1) racesPerTrack = state.racesPerTrack;
    if (state.playerUmaAssignments && typeof state.playerUmaAssignments === 'object') {
      playerUmaAssignments = state.playerUmaAssignments;
      if (typeof prunePlayerUmaAssignments === 'function') prunePlayerUmaAssignments();
    }

    if (typeof state.turnDuration === 'number') {
      turnDuration = state.turnDuration;
      const select = document.getElementById('draft-timer-select');
      if (select) select.value = String(turnDuration);
    }

    if (state.captainInputs) {
      if (document.getElementById('cap-red')) document.getElementById('cap-red').value = state.captainInputs.red || "Captain Red";
      if (document.getElementById('cap-blue')) document.getElementById('cap-blue').value = state.captainInputs.blue || "Captain Blue";
      if (document.getElementById('cap-yellow')) document.getElementById('cap-yellow').value = state.captainInputs.yellow || "Captain Yellow";
      if (typeof updateCaptainSubtitles === 'function') updateCaptainSubtitles();
    }

    if (state.playerBulkText && document.getElementById('player-bulk-input')) {
      document.getElementById('player-bulk-input').value = state.playerBulkText;
    }

    if (state.isDraftActive) {
      document.getElementById('setup-view').classList.add('hidden');
      document.getElementById('draft-live-view').classList.remove('hidden');
      renderSnakeDraftBoard();
      if (currentPickIndex < snakeDraftOrder.length) {
        startDraftTurnTimer();
      }
    }

    if (state.currentTab) {
      switchTab(state.currentTab, false);
    }

    return true;
  } catch (e) {
    console.warn('LocalStorage load failed:', e);
    return false;
  }
}

function copyShareableTournamentLink() {
  saveStateToStorage();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    alert("No tournament data to share.");
    return;
  }

  try {
    const encoded = utf8ToBase64(raw);
    const url = new URL(window.location.href.split('#')[0].split('?')[0]);
    url.hash = `state=${encoded}`;
    const fullUrl = url.toString();

    navigator.clipboard.writeText(fullUrl).then(() => {
      alert("📋 Serverless Share Link copied to clipboard!\n\nSend this link to any moderator or player. When they open it, the entire tournament will load automatically without any external server.");
    }).catch(() => {
      prompt("Copy this share URL:", fullUrl);
    });
  } catch (err) {
    alert("Failed to generate share link: " + err.message);
  }
}

// A read-only link: opens straight on the scoring tab with all editing hidden,
// and never touches the viewer's own saved data. It is a snapshot of right now.
function copyViewerLink() {
  saveStateToStorage();
  const state = buildState();
  state.sharedAt = Date.now();
  try {
    const url = new URL(window.location.href.split('#')[0].split('?')[0]);
    url.hash = `view=${utf8ToBase64(JSON.stringify(state))}`;
    const fullUrl = url.toString();
    navigator.clipboard.writeText(fullUrl).then(() => {
      alert("👁️ Viewer link copied!\n\nPlayers who open it see the standings and results only, with no edit buttons.\n\nIt is a snapshot of the results right now: copy a new link after more races are recorded.");
    }).catch(() => {
      prompt("Copy this viewer URL:", fullUrl);
    });
  } catch (err) {
    alert("Failed to generate viewer link: " + err.message);
  }
}

// Returns the save string from a #view=... link, or null.
function getViewerStateFromURL() {
  const hash = window.location.hash;
  if (!hash || !hash.startsWith('#view=')) return null;
  try {
    return base64ToUtf8(hash.substring(6));
  } catch (e) {
    alert('This viewer link is broken or was cut off.');
    return null;
  }
}

function clearStateFromURL() {
  history.replaceState(null, '', window.location.pathname + window.location.search);
}

function checkAndLoadStateFromURL() {
  const hash = window.location.hash;
  if (!hash || !hash.startsWith('#state=')) return false;
  const encoded = hash.substring(7);
  if (!encoded) { clearStateFromURL(); return false; }

  let jsonStr;
  try {
    jsonStr = base64ToUtf8(encoded);
  } catch (e) {
    console.warn('Failed to decode URL state:', e);
    alert('This share link is broken or was cut off, so it could not be loaded. Your current data was not changed.');
    clearStateFromURL();
    return false;
  }
  const parsed = parseSaveString(jsonStr);
  if (parsed.errors) {
    alert('This share link could not be loaded:\n\n- ' + parsed.errors.join('\n- ') + '\n\nYour current data was not changed.');
    clearStateFromURL();
    return false;
  }
  const incoming = JSON.stringify(parsed.state);

  let current = null;
  try { current = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  if (current && current !== incoming) {
    const ok = confirm('This link contains tournament data (' + summarizeSave(incoming) + ').\n\n' +
      'Load it and replace the data currently in this browser (' + summarizeSave(current) + ')?\n\n' +
      'Your current data will be backed up first. Press Cancel to keep your current data.');
    if (!ok) { clearStateFromURL(); return false; }
    createBackup('Before loading a share link', current);
  }
  try {
    localStorage.setItem(STORAGE_KEY, incoming);
  } catch (e) {
    alert('Could not store the shared data: ' + e.message);
    clearStateFromURL();
    return false;
  }
  clearStateFromURL();
  return true;
}

function downloadJson(raw, filename) {
  const blob = new Blob([raw], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportTournamentSaveFile() {
  saveStateToStorage();
  let raw = null;
  try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  if (!raw || lastSaveOk === false) {
    // Browser storage is unavailable: export straight from memory instead.
    raw = JSON.stringify(buildState());
  }
  if (!raw) {
    alert("No tournament data found to export.");
    return;
  }
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  downloadJson(raw, `umanity_tournament_save_${dateStr}.json`);
}

function triggerImportTournamentFile() {
  const input = document.getElementById('tournament-file-input');
  if (input) {
    input.value = "";
    input.click();
  }
}

function importTournamentSaveFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const parsed = parseSaveString(e.target.result);
    if (parsed.errors) {
      alert(`"${file.name}" is not a valid tournament save:\n\n- ` + parsed.errors.join('\n- ') + '\n\nYour current data was not changed.');
      return;
    }
    if (!confirm(`Load "${file.name}" (${summarizeSave(JSON.stringify(parsed.state))})?\n\n` +
      'This replaces the current tournament data. Your current data will be backed up first.')) return;
    saveStateToStorage();
    createBackup('Before importing ' + file.name);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.state));
    } catch (err) {
      alert("Failed to import save file: " + err.message);
      return;
    }
    // Reload so no data from the previous tournament stays in memory.
    window.location.reload();
  };
  reader.readAsText(file);
}

function resetFullTournament() {
  if (!confirm("Are you sure you want to reset all data and start a brand new tournament?\n\nYour current data will be backed up first (see Backups).")) return;
  if (isSequentialRunning) stopSequentialDraw();
  stopDraftTurnTimer();
  saveStateToStorage();
  createBackup('Before Delete All');
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
  window.location.reload();
}
