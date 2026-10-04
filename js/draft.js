let activeBulkEdit = {
  red: false,
  blue: false,
  yellow: false
};

function renderFixedTeamsUI() {
  TEAM_KEYS.forEach(t => {
    const cardEl = document.getElementById(`fixed-team-card-${t}`);
    const capInputEl = document.getElementById(`fixed-team-cap-${t}`);
    const countEl = document.getElementById(`fixed-team-count-${t}`);
    const listEl = document.getElementById(`fixed-team-list-${t}`);
    const bulkBoxEl = document.getElementById(`fixed-team-bulk-${t}`);
    const bulkTextarea = document.getElementById(`fixed-team-textarea-${t}`);

    const team = teams[t];
    if (!team) return;

    if (capInputEl && document.activeElement !== capInputEl) {
      capInputEl.value = team.cap || `Captain ${team.name || t}`;
    }

    const players = team.players || [];
    if (countEl) countEl.textContent = `${players.length} Players`;

    if (bulkBoxEl && bulkTextarea) {
      if (activeBulkEdit[t]) {
        bulkBoxEl.classList.remove('hidden');
        if (listEl) listEl.classList.add('hidden');
        if (document.activeElement !== bulkTextarea) {
          bulkTextarea.value = players.join('\n');
        }
      } else {
        bulkBoxEl.classList.add('hidden');
        if (listEl) listEl.classList.remove('hidden');
      }
    }

    if (listEl && !activeBulkEdit[t]) {
      if (players.length === 0) {
        listEl.innerHTML = `<div class="empty-roster-text">No players in this team yet.<br><span style="font-size:0.8rem; color:var(--text-muted);">Add players one by one below or click <b>📝 Bulk Edit</b> to paste your list.</span></div>`;
      } else {
        listEl.innerHTML = players.map((p, idx) => {
          const isCap = (p === team.cap);
          return `
            <div class="fixed-player-row ${isCap ? 'is-captain' : ''}">
              <div class="fixed-player-left">
                <span class="fixed-player-idx">${idx + 1}</span>
                <span class="fixed-player-name">${p}</span>
                ${isCap ? '<span class="captain-badge-inline">👑 Captain</span>' : ''}
              </div>
              <div class="fixed-player-actions">
                ${!isCap ? `<button class="btn-make-cap" onclick="setPlayerAsCaptain('${t}', '${p.replace(/'/g, "\\'")}')" title="Make Captain">👑</button>` : ''}
                <button class="btn-del-player" onclick="removePlayerFromTeam('${t}', ${idx})" title="Remove Player">✕</button>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  });

  updateTotalPlayersCount();
  updateCaptainSubtitles();
}

function updateTotalPlayersCount() {
  const badge = document.getElementById('total-players-badge');
  if (badge) {
    const total = TEAM_KEYS.reduce((acc, t) => acc + (teams[t]?.players?.length || 0), 0);
    badge.textContent = `${total} Players Total`;
  }
}

function updateTeamCaptain(teamKey, newCap) {
  const cap = (newCap || '').trim();
  if (!cap) return;
  teams[teamKey].cap = cap;
  updateCaptainSubtitles();
  saveStateToStorage();
}

function setPlayerAsCaptain(teamKey, playerName) {
  teams[teamKey].cap = playerName;
  const input = document.getElementById(`fixed-team-cap-${teamKey}`);
  if (input) input.value = playerName;
  playBeep(520, 'sine', 0.1);
  renderFixedTeamsUI();
  saveStateToStorage();
}

function addPlayerToTeam(teamKey) {
  const input = document.getElementById(`add-player-input-${teamKey}`);
  if (!input) return;
  const name = input.value.trim();
  if (!name) return;

  if (teams[teamKey].players.includes(name)) {
    alert(`"${name}" is already in this team's roster!`);
    return;
  }

  teams[teamKey].players.push(name);
  input.value = '';
  input.focus();

  playBeep(650, 'sine', 0.08);
  renderFixedTeamsUI();
  saveStateToStorage();
}

function removePlayerFromTeam(teamKey, index) {
  teams[teamKey].players.splice(index, 1);
  playBeep(380, 'sine', 0.1);
  renderFixedTeamsUI();
  saveStateToStorage();
}

function toggleTeamBulkEdit(teamKey) {
  activeBulkEdit[teamKey] = !activeBulkEdit[teamKey];
  const btn = document.getElementById(`btn-bulk-toggle-${teamKey}`);
  if (btn) {
    btn.textContent = activeBulkEdit[teamKey] ? "📋 View List" : "📝 Bulk Edit";
  }
  renderFixedTeamsUI();
}

function saveTeamRosterBulk(teamKey) {
  const textarea = document.getElementById(`fixed-team-textarea-${teamKey}`);
  if (!textarea) return;

  const rawLines = textarea.value.split('\n');
  const cleaned = rawLines.map(l => l.trim()).filter(l => l.length > 0);

  const unique = Array.from(new Set(cleaned));

  teams[teamKey].players = unique;
  activeBulkEdit[teamKey] = false;

  const btn = document.getElementById(`btn-bulk-toggle-${teamKey}`);
  if (btn) btn.textContent = "📝 Bulk Edit";

  playCoinSound();
  renderFixedTeamsUI();
  saveStateToStorage();
}

function clearAllTeamRosters() {
  if (!confirm("Are you sure you want to clear all team rosters?")) return;

  TEAM_KEYS.forEach(t => {
    teams[t].players = [];
    activeBulkEdit[t] = false;
  });

  playBeep(440, 'triangle', 0.15);
  renderFixedTeamsUI();
  saveStateToStorage();
}

function resetToDefaultFixedTeams() {
  clearAllTeamRosters();
}

function renderSnakeDraftBoard() {
  renderFixedTeamsUI();
}
function startSnakeDraft() {}
function populateCaptainSelectors() {}
function updatePlayerInputHint() {}
