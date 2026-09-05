function updateCaptainSubtitles() {
  const redCap = teams.red.cap || document.getElementById('cap-red')?.value || "Captain Red";
  const blueCap = teams.blue.cap || document.getElementById('cap-blue')?.value || "Captain Blue";
  const yellowCap = teams.yellow.cap || document.getElementById('cap-yellow')?.value || "Captain Yellow";

  if (document.getElementById('red-cap-sub')) document.getElementById('red-cap-sub').textContent = `Captain: ${redCap}`;
  if (document.getElementById('blue-cap-sub')) document.getElementById('blue-cap-sub').textContent = `Captain: ${blueCap}`;
  if (document.getElementById('yellow-cap-sub')) document.getElementById('yellow-cap-sub').textContent = `Captain: ${yellowCap}`;
}

function updateCaptainsAndSave() {
  teams.red.cap = document.getElementById('cap-red')?.value.trim() || "Captain Red";
  teams.blue.cap = document.getElementById('cap-blue')?.value.trim() || "Captain Blue";
  teams.yellow.cap = document.getElementById('cap-yellow')?.value.trim() || "Captain Yellow";
  updateCaptainSubtitles();
  saveStateToStorage();
}

function switchTab(tabNum, save = true) {
  currentTab = tabNum;
  [1, 2, 3].forEach(n => {
    document.getElementById(`tab-${n}`)?.classList.remove('active');
    document.getElementById(`nav-btn-${n}`)?.classList.remove('active');
  });

  document.getElementById(`tab-${tabNum}`)?.classList.add('active');
  document.getElementById(`nav-btn-${tabNum}`)?.classList.add('active');

  if (tabNum === 1) {
    renderTeamUmaLists();
    updateProgressUI();
    updateCaptainSubtitles();
  } else if (tabNum === 2) {
    renderSnakeDraftBoard();
  } else if (tabNum === 3) {
    renderScoringTab();
  }

  if (save) saveStateToStorage();
}

document.addEventListener('DOMContentLoaded', () => {
  checkAndLoadStateFromURL();
  const hasSavedData = loadStateFromStorage();
  const inputEl = document.getElementById('player-bulk-input');

  if (!hasSavedData) {
    if (inputEl) {
      inputEl.value = DEFAULT_PLAYERS.join('\n');
    }
    updatePlayerInputHint();
  } else {
    if (inputEl && !inputEl.value.trim()) {
      inputEl.value = DEFAULT_PLAYERS.join('\n');
    }
    updatePlayerInputHint();
  }

  renderTeamUmaLists();
  updateProgressUI();
  updateCaptainSubtitles();
  renderScoringTab();

  if (inputEl) {
    inputEl.addEventListener('input', updatePlayerInputHint);
  }
});
