function updateCaptainSubtitles() {
  const redCap = teams.red.cap || document.getElementById('cap-red')?.value || "Captain Red";
  const blueCap = teams.blue.cap || document.getElementById('cap-blue')?.value || "Captain Blue";
  const yellowCap = teams.yellow.cap || document.getElementById('cap-yellow')?.value || "Captain Yellow";

  if (document.getElementById('red-cap-sub')) document.getElementById('red-cap-sub').textContent = `Captain: ${redCap}`;
  if (document.getElementById('blue-cap-sub')) document.getElementById('blue-cap-sub').textContent = `Captain: ${blueCap}`;
  if (document.getElementById('yellow-cap-sub')) document.getElementById('yellow-cap-sub').textContent = `Captain: ${yellowCap}`;

  if (document.getElementById('red-cap-badge')) document.getElementById('red-cap-badge').textContent = redCap;
  if (document.getElementById('blue-cap-badge')) document.getElementById('blue-cap-badge').textContent = blueCap;
  if (document.getElementById('yellow-cap-badge')) document.getElementById('yellow-cap-badge').textContent = yellowCap;
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
  [1, 2, 3, 4].forEach(n => {
    document.getElementById(`tab-${n}`)?.classList.remove('active');
    document.getElementById(`nav-btn-${n}`)?.classList.remove('active');
  });

  document.getElementById(`tab-${tabNum}`)?.classList.add('active');
  document.getElementById(`nav-btn-${tabNum}`)?.classList.add('active');

  if (tabNum === 1) {
    if (typeof renderFixedTeamsUI === 'function') renderFixedTeamsUI();
    updateCaptainSubtitles();
  } else if (tabNum === 2) {
    if (typeof renderTracksUI === 'function') renderTracksUI();
  } else if (tabNum === 3) {
    if (typeof renderMarketUI === 'function') renderMarketUI();
    else renderTeamUmaLists();
    updateProgressUI();
    updateCaptainSubtitles();
  } else if (tabNum === 4) {
    renderScoringTab();
  }

  if (save) saveStateToStorage();
}

document.addEventListener('DOMContentLoaded', () => {
  checkAndLoadStateFromURL();
  loadStateFromStorage();

  if (typeof renderFixedTeamsUI === 'function') renderFixedTeamsUI();
  if (typeof renderTracksUI === 'function') renderTracksUI();
  if (typeof renderMarketUI === 'function') renderMarketUI();
  else renderTeamUmaLists();
  updateProgressUI();
  updateCaptainSubtitles();
  renderScoringTab();
});

