// ==========================================
// STAGE 1: DYNAMIC SNAKE DRAFT & TIMER
// ==========================================

function updateDraftTimerSetting() {
  const select = document.getElementById('draft-timer-select');
  turnDuration = parseInt(select.value, 10);
  saveStateToStorage();
}

function startDraftTurnTimer() {
  stopDraftTurnTimer();
  const timerContainer = document.getElementById('draft-timer-container');
  const timerVal = document.getElementById('draft-timer-val');

  if (!timerContainer || !timerVal) return;

  if (turnDuration === 0) {
    timerContainer.classList.add('hidden');
    document.getElementById('btn-timer-pause')?.classList.add('hidden');
    return;
  }

  timerContainer.classList.remove('hidden');
  document.getElementById('btn-timer-pause')?.classList.remove('hidden');
  timerContainer.classList.remove('urgent');

  turnTimeRemaining = turnDuration;
  isDraftTimerPaused = false;
  if (document.getElementById('btn-timer-pause')) {
    document.getElementById('btn-timer-pause').innerHTML = "⏸️ Pause";
  }
  timerVal.textContent = `${turnTimeRemaining}s`;

  draftTimerInterval = setInterval(() => {
    if (isDraftTimerPaused) return;

    turnTimeRemaining--;

    if (turnTimeRemaining <= 10 && turnTimeRemaining > 0) {
      timerContainer.classList.add('urgent');
      playBeep(750, 'sine', 0.06);
    } else if (turnTimeRemaining > 10) {
      timerContainer.classList.remove('urgent');
    }

    timerVal.textContent = `${Math.max(0, turnTimeRemaining)}s`;

    if (turnTimeRemaining <= 0) {
      // Time expired -> Alert sound and Auto-pick first player
      playBeep(440, 'triangle', 0.25);
      setTimeout(() => playBeep(330, 'triangle', 0.3), 150);

      if (playerPool.length > 0 && currentPickIndex < snakeDraftOrder.length) {
        pickPlayer(playerPool[0]);
      } else {
        stopDraftTurnTimer();
      }
    }
  }, 1000);
}

function stopDraftTurnTimer() {
  if (draftTimerInterval) {
    clearInterval(draftTimerInterval);
    draftTimerInterval = null;
  }
  const timerContainer = document.getElementById('draft-timer-container');
  if (timerContainer) timerContainer.classList.remove('urgent');
}

function toggleDraftTimer() {
  isDraftTimerPaused = !isDraftTimerPaused;
  const btn = document.getElementById('btn-timer-pause');
  if (btn) {
    btn.innerHTML = isDraftTimerPaused ? "▶️ Resume" : "⏸️ Pause";
  }
}

function updatePlayerInputHint() {
  const inputEl = document.getElementById('player-bulk-input');
  if (!inputEl) return;
  const players = inputEl.value.trim().split('\n').map(p => p.trim()).filter(p => p.length > 0);
  const count = players.length;
  const slotsPerTeam = Math.ceil(count / 3);
  document.getElementById('player-count-hint').textContent = `${count} players detected (${slotsPerTeam} player slots + 1 Captain = ${slotsPerTeam + 1} per team).`;
  saveStateToStorage();
}

function generateSnakeOrder(playerCount) {
  const totalRounds = Math.ceil(playerCount / 3);
  const order = [];
  for (let round = 1; round <= totalRounds; round++) {
    if (round % 2 !== 0) {
      order.push({ round, team: 'red' }, { round, team: 'blue' }, { round, team: 'yellow' });
    } else {
      order.push({ round, team: 'yellow' }, { round, team: 'blue' }, { round, team: 'red' });
    }
  }
  return order.slice(0, playerCount);
}

function startSnakeDraft() {
  const text = document.getElementById('player-bulk-input').value.trim();
  const players = text.split('\n').map(p => p.trim()).filter(p => p.length > 0);

  if (players.length < 3) {
    alert(`Please enter at least 3 players. Current count: ${players.length}`);
    return;
  }

  teams.red.cap    = document.getElementById('cap-red').value.trim()    || "Captain Red";
  teams.blue.cap   = document.getElementById('cap-blue').value.trim()   || "Captain Blue";
  teams.yellow.cap = document.getElementById('cap-yellow').value.trim() || "Captain Yellow";

  teams.red.players = [];
  teams.blue.players = [];
  teams.yellow.players = [];

  document.getElementById('red-cap-sub').textContent = `Captain: ${teams.red.cap}`;
  document.getElementById('blue-cap-sub').textContent = `Captain: ${teams.blue.cap}`;
  document.getElementById('yellow-cap-sub').textContent = `Captain: ${teams.yellow.cap}`;

  playerPool = [...players];
  snakeDraftOrder = generateSnakeOrder(players.length);
  currentPickIndex = 0;
  pickHistory = [];

  document.getElementById('setup-view').classList.add('hidden');
  document.getElementById('draft-live-view').classList.remove('hidden');

  renderSnakeDraftBoard();
  startDraftTurnTimer();
  saveStateToStorage();
}

function renderSnakeDraftBoard() {
  const totalRounds = Math.ceil(snakeDraftOrder.length / 3);

  TEAM_KEYS.forEach(t => {
    const container = document.getElementById(`team-list-${t}`);
    const totalTeamSlots = snakeDraftOrder.filter(item => item.team === t).length;
    document.getElementById(`${t}-roster-count`).textContent = `${teams[t].players.length + 1}/${totalTeamSlots + 1}`;

    let html = `
      <div class="slot-item captain">
        <span>👑 ${teams[t].cap}</span>
        <span style="font-size:10px; color:var(--text-muted); font-family:'JetBrains Mono',monospace;">CAPTAIN</span>
      </div>
    `;

    for (let i = 0; i < totalTeamSlots; i++) {
      const p = teams[t].players[i];
      if (p) {
        html += `
          <div class="slot-item filled">
            <span><b style="color:var(--text-faint); font-size:11px; margin-right:4px;">${i + 1}.</b> ${p}</span>
          </div>
        `;
      } else {
        html += `
          <div class="slot-item empty">
            <span>[Empty Slot ${i + 1}]</span>
          </div>
        `;
      }
    }
    container.innerHTML = html;
  });

  renderPlayerPool();

  if (currentPickIndex < snakeDraftOrder.length) {
    const cur = snakeDraftOrder[currentPickIndex];
    document.getElementById('current-round-text').textContent = `${cur.round} / ${totalRounds}`;
    document.getElementById('current-pick-text').textContent = `${currentPickIndex + 1} / ${snakeDraftOrder.length}`;

    const badge = document.getElementById('active-turn-badge');
    badge.textContent = `Turn: ${teams[cur.team].name.toUpperCase()} TEAM`;
    badge.className = `turn-pill ${cur.team}`;

    TEAM_KEYS.forEach(t => {
      const card = document.getElementById(`team-card-${t}`);
      card.classList.remove('active-turn');
      if (t === cur.team) card.classList.add('active-turn');
    });

    document.getElementById('finish-stage1-btn').classList.add('hidden');
  } else {
    stopDraftTurnTimer();
    const badge = document.getElementById('active-turn-badge');
    badge.textContent = "DRAFT COMPLETED ✅";
    badge.className = "turn-pill done";

    const timerContainer = document.getElementById('draft-timer-container');
    if (timerContainer) timerContainer.classList.add('hidden');
    const pauseBtn = document.getElementById('btn-timer-pause');
    if (pauseBtn) pauseBtn.classList.add('hidden');

    TEAM_KEYS.forEach(t => {
      document.getElementById(`team-card-${t}`).classList.remove('active-turn');
    });
    document.getElementById('finish-stage1-btn').classList.remove('hidden');
  }
}

function renderPlayerPool() {
  const el = document.getElementById('player-pool-list');
  const search = (document.getElementById('player-search')?.value || "").toLowerCase();
  document.getElementById('pool-count').textContent = playerPool.length;

  const filtered = playerPool.filter(p => p.toLowerCase().includes(search));
  el.innerHTML = filtered.map(p => `
    <button class="pool-btn" onclick="pickPlayer('${p.replace(/'/g, "\\'")}')">
      <span>${p}</span>
      <span class="arrow">Pick ➔</span>
    </button>
  `).join('');
}

function pickPlayer(name) {
  if (currentPickIndex >= snakeDraftOrder.length) return;
  const cur = snakeDraftOrder[currentPickIndex];
  teams[cur.team].players.push(name);
  playerPool = playerPool.filter(p => p !== name);
  pickHistory.push({ team: cur.team, player: name });
  currentPickIndex++;
  renderSnakeDraftBoard();

  if (currentPickIndex < snakeDraftOrder.length) {
    startDraftTurnTimer();
  } else {
    stopDraftTurnTimer();
  }

  saveStateToStorage();
}

function undoPick() {
  if (pickHistory.length === 0) return;
  const last = pickHistory.pop();
  currentPickIndex--;
  teams[last.team].players.pop();
  playerPool.push(last.player);
  renderSnakeDraftBoard();
  startDraftTurnTimer();
  saveStateToStorage();
}

function finishStage1() {
  stopDraftTurnTimer();
  switchTab(2);
}
