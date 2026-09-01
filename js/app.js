// ==========================================
// APP BOOTSTRAP & TAB NAVIGATION
// ==========================================

function switchTab(tabNum, save = true) {
  currentTab = tabNum;
  [1, 2].forEach(n => {
    document.getElementById(`tab-${n}`)?.classList.remove('active');
    document.getElementById(`nav-btn-${n}`)?.classList.remove('active');
  });

  document.getElementById(`tab-${tabNum}`)?.classList.add('active');
  document.getElementById(`nav-btn-${tabNum}`)?.classList.add('active');

  if (tabNum === 2) {
    renderTeamUmaLists();
    updateProgressUI();
    if (document.getElementById('red-cap-sub')) document.getElementById('red-cap-sub').textContent = `Captain: ${teams.red.cap}`;
    if (document.getElementById('blue-cap-sub')) document.getElementById('blue-cap-sub').textContent = `Captain: ${teams.blue.cap}`;
    if (document.getElementById('yellow-cap-sub')) document.getElementById('yellow-cap-sub').textContent = `Captain: ${teams.yellow.cap}`;
  }

  if (save) saveStateToStorage();
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  const hasSavedData = loadStateFromStorage();
  const inputEl = document.getElementById('player-bulk-input');

  if (!hasSavedData) {
    if (inputEl) {
      inputEl.value = Array.from({length: 24}, (_, i) => `Player ${i + 1}`).join('\n');
    }
    updatePlayerInputHint();
  } else {
    updatePlayerInputHint();
    if (currentTab === 2) {
      renderTeamUmaLists();
      updateProgressUI();
    }
  }

  if (inputEl) {
    inputEl.addEventListener('input', updatePlayerInputHint);
  }
});
