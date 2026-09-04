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
    matches,
    bonusPoints,
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

    if (state.teams) {
      teams = state.teams;
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
    if (state.selectedDrawTeam) selectedDrawTeam = state.selectedDrawTeam;
    if (typeof state.currentRoundRobinIndex === 'number') currentRoundRobinIndex = state.currentRoundRobinIndex;

    if (Array.isArray(state.matches)) matches = state.matches;
    if (state.bonusPoints) bonusPoints = state.bonusPoints;

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

function checkAndLoadStateFromURL() {
  try {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#state=')) {
      const encoded = hash.substring(7);
      if (encoded) {
        const jsonStr = base64ToUtf8(encoded);
        const parsed = JSON.parse(jsonStr);
        if (parsed && parsed.teams) {
          localStorage.setItem(STORAGE_KEY, jsonStr);
          history.replaceState(null, '', window.location.pathname + window.location.search);
          return true;
        }
      }
    }
  } catch (e) {
    console.warn('Failed to parse URL state:', e);
  }
  return false;
}

function exportTournamentSaveFile() {
  saveStateToStorage();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    alert("No tournament data found to export.");
    return;
  }
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `umanity_tournament_save_${dateStr}.json`;
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
    try {
      const content = e.target.result;
      const parsed = JSON.parse(content);
      if (!parsed.teams) {
        alert("Invalid save file format! Missing tournament structure.");
        return;
      }
      localStorage.setItem(STORAGE_KEY, content);
      loadStateFromStorage();
      renderTeamUmaLists();
      updateProgressUI();
      updateCaptainSubtitles();
      if (typeof renderScoringTab === 'function') renderScoringTab();
      alert("Tournament save successfully loaded! All data synced.");
    } catch (err) {
      alert("Failed to import save file: " + err.message);
    }
  };
  reader.readAsText(file);
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
