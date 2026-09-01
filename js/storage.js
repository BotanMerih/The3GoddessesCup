// ==========================================
// LOCALSTORAGE STATE PERSISTENCE
// ==========================================
function saveStateToStorage() {
  const state = {
    teams,
    availablePot1,
    availablePot2,
    availablePot3,
    playerPool,
    snakeDraftOrder,
    currentPickIndex,
    pickHistory,
    selectedDrawTeam,
    currentTab,
    currentRoundRobinIndex,
    turnDuration,
    isDraftActive: !document.getElementById('draft-live-view').classList.contains('hidden'),
    captainInputs: {
      red: document.getElementById('cap-red')?.value || "Captain Red",
      blue: document.getElementById('cap-blue')?.value || "Captain Blue",
      yellow: document.getElementById('cap-yellow')?.value || "Captain Yellow"
    },
    playerBulkText: document.getElementById('player-bulk-input')?.value || ""
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

function loadStateFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const state = JSON.parse(raw);

    if (state.teams) teams = state.teams;
    if (state.availablePot1) availablePot1 = state.availablePot1;
    if (state.availablePot2) availablePot2 = state.availablePot2;
    if (state.availablePot3) availablePot3 = state.availablePot3;
    if (state.playerPool) playerPool = state.playerPool;
    if (state.snakeDraftOrder) snakeDraftOrder = state.snakeDraftOrder;
    if (typeof state.currentPickIndex === 'number') currentPickIndex = state.currentPickIndex;
    if (state.pickHistory) pickHistory = state.pickHistory;
    if (state.selectedDrawTeam) selectedDrawTeam = state.selectedDrawTeam;
    if (typeof state.currentRoundRobinIndex === 'number') currentRoundRobinIndex = state.currentRoundRobinIndex;

    if (typeof state.turnDuration === 'number') {
      turnDuration = state.turnDuration;
      const select = document.getElementById('draft-timer-select');
      if (select) select.value = String(turnDuration);
    }

    if (state.captainInputs) {
      if (document.getElementById('cap-red')) document.getElementById('cap-red').value = state.captainInputs.red || "Captain Red";
      if (document.getElementById('cap-blue')) document.getElementById('cap-blue').value = state.captainInputs.blue || "Captain Blue";
      if (document.getElementById('cap-yellow')) document.getElementById('cap-yellow').value = state.captainInputs.yellow || "Captain Yellow";
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

function resetFullTournament() {
  if (!confirm("Are you sure you want to reset all data and start a brand new tournament?")) return;
  if (isSequentialRunning) stopSequentialDraw();
  stopDraftTurnTimer();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
  window.location.reload();
}
