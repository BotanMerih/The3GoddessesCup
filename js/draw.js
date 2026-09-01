// ==========================================
// STAGE 2: LIVE UMA DRAW SYSTEM
// ==========================================

function setSelectedDrawTeam(teamKey) {
  selectedDrawTeam = teamKey;
  TEAM_KEYS.forEach(t => {
    const btn = document.getElementById(`selector-${t}`);
    if (t === teamKey) btn?.classList.add('active');
    else btn?.classList.remove('active');
  });
  saveStateToStorage();
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getNextRandomUma() {
  const combined = [
    ...availablePot1.map(u => ({ name: u, pot: 1 })),
    ...availablePot2.map(u => ({ name: u, pot: 2 })),
    ...availablePot3.map(u => ({ name: u, pot: 3 }))
  ];

  if (combined.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * combined.length);
  const chosen = combined[randomIndex];

  if (chosen.pot === 1) availablePot1 = availablePot1.filter(u => u !== chosen.name);
  if (chosen.pot === 2) availablePot2 = availablePot2.filter(u => u !== chosen.name);
  if (chosen.pot === 3) availablePot3 = availablePot3.filter(u => u !== chosen.name);

  return chosen;
}

function updateProgressUI() {
  const remaining = availablePot1.length + availablePot2.length + availablePot3.length;
  const drawnCount = TOTAL_INITIAL_UMAS - remaining;
  const pct = Math.round((drawnCount / TOTAL_INITIAL_UMAS) * 100);

  const statusEl = document.getElementById('draw-status-text');
  const pctEl = document.getElementById('draw-progress-percent');
  const barEl = document.getElementById('draw-progress-bar');

  if (statusEl) statusEl.textContent = `Drawn: ${drawnCount}/${TOTAL_INITIAL_UMAS} • Remaining: ${remaining} Umas`;
  if (pctEl) pctEl.textContent = `${pct}%`;
  if (barEl) barEl.style.width = `${pct}%`;
}

function drawUmaForTeam(teamKey, animateCard = true, onComplete = null) {
  const remainingTotal = availablePot1.length + availablePot2.length + availablePot3.length;
  if (remainingTotal === 0) {
    stopSequentialDraw();
    const gachaName = document.getElementById('gacha-name');
    const gachaSub = document.getElementById('gacha-sub');
    if (gachaName) gachaName.textContent = "Draw Completed! 🎉";
    if (gachaSub) gachaSub.textContent = "All Umas have been distributed to the teams.";
    if (onComplete) onComplete();
    return false;
  }

  const drawn = getNextRandomUma();
  if (!drawn) return false;

  teams[teamKey].umas.push(drawn.name);

  const gachaBox = document.getElementById('gacha-box');
  const gachaName = document.getElementById('gacha-name');
  const gachaPotBadge = document.getElementById('gacha-pot-badge');
  const gachaSub = document.getElementById('gacha-sub');

  if (animateCard && gachaBox) {
    gachaBox.classList.remove('revealed');
    void gachaBox.offsetWidth;
    gachaBox.classList.add('revealed');
  }

  if (gachaName) gachaName.textContent = drawn.name;
  if (gachaPotBadge) {
    gachaPotBadge.textContent = `POT ${drawn.pot}`;
    gachaPotBadge.className = `gacha-pot-tag pot-tag-${drawn.pot}`;
  }
  if (gachaSub) {
    gachaSub.textContent = `Added to ${teams[teamKey].name} Team! (Remaining: ${availablePot1.length + availablePot2.length + availablePot3.length})`;
  }

  renderTeamUmaLists(teamKey);
  updateProgressUI();
  saveStateToStorage();

  if (onComplete) onComplete();
  return true;
}

function toggleLiveSequentialDraw() {
  const remainingTotal = availablePot1.length + availablePot2.length + availablePot3.length;
  if (remainingTotal === 0) {
    alert("All Uma pools have already been drawn!");
    return;
  }

  const mainBtn = document.getElementById('btn-live-draw-all');
  const speedBtn = document.getElementById('btn-speed-toggle');

  if (isSequentialRunning) {
    isSequentialRunning = false;
    clearTimeout(sequentialTimer);
    if (mainBtn) {
      mainBtn.innerHTML = "▶️ Resume Live Draw";
      mainBtn.style.background = "var(--team-blue-gradient)";
    }
  } else {
    isSequentialRunning = true;
    if (speedBtn) speedBtn.classList.remove('hidden');
    if (mainBtn) {
      mainBtn.innerHTML = "⏸️ Pause Draw";
      mainBtn.style.background = "var(--team-red-gradient)";
    }
    runSequentialLoop();
  }
}

function runSequentialLoop() {
  if (!isSequentialRunning) return;

  const remainingTotal = availablePot1.length + availablePot2.length + availablePot3.length;
  if (remainingTotal === 0) {
    stopSequentialDraw();
    return;
  }

  const currentTeam = TEAM_KEYS[currentRoundRobinIndex % 3];
  setSelectedDrawTeam(currentTeam);
  currentRoundRobinIndex++;

  const success = drawUmaForTeam(currentTeam, true);
  if (success && isSequentialRunning) {
    sequentialTimer = setTimeout(runSequentialLoop, sequentialSpeed);
  }
}

function stopSequentialDraw() {
  isSequentialRunning = false;
  clearTimeout(sequentialTimer);
  const mainBtn = document.getElementById('btn-live-draw-all');
  if (mainBtn) {
    mainBtn.innerHTML = "⚡ Live Draw All (One by One)";
    mainBtn.style.background = "var(--team-yellow-gradient)";
  }
}

function cycleDrawSpeed() {
  const speeds = [
    { label: "Normal (1x)", delay: 220 },
    { label: "Fast (2x)", delay: 100 },
    { label: "Ultra (5x)", delay: 35 }
  ];

  const currentIdx = speeds.findIndex(s => s.delay === sequentialSpeed);
  const nextIdx = (currentIdx + 1) % speeds.length;

  sequentialSpeed = speeds[nextIdx].delay;
  const speedLabel = document.getElementById('speed-label');
  if (speedLabel) speedLabel.textContent = speeds[nextIdx].label;
}

function instantDistributeAll() {
  if (!confirm("Distribute all remaining Umas instantly across the 3 teams?")) return;
  if (isSequentialRunning) stopSequentialDraw();

  const p1 = shuffleArray(availablePot1);
  const p2 = shuffleArray(availablePot2);
  const p3 = shuffleArray(availablePot3);

  p1.forEach((uma, i) => teams[TEAM_KEYS[i % 3]].umas.push(uma));
  p2.forEach((uma, i) => teams[TEAM_KEYS[i % 3]].umas.push(uma));
  p3.forEach((uma, i) => teams[TEAM_KEYS[i % 3]].umas.push(uma));

  availablePot1 = [];
  availablePot2 = [];
  availablePot3 = [];

  renderTeamUmaLists();
  updateProgressUI();
  saveStateToStorage();

  const gachaName = document.getElementById('gacha-name');
  const gachaSub = document.getElementById('gacha-sub');
  if (gachaName) gachaName.textContent = "Pool Distributed ✅";
  if (gachaSub) gachaSub.textContent = "All remaining Umas have been distributed evenly.";
}

function resetUmaPools() {
  if (!confirm("Are you sure you want to reset all team Uma pools?")) return;
  if (isSequentialRunning) stopSequentialDraw();

  teams.red.umas = [];
  teams.blue.umas = [];
  teams.yellow.umas = [];
  availablePot1 = [...POT_1];
  availablePot2 = [...POT_2];
  availablePot3 = [...POT_3];
  currentRoundRobinIndex = 0;

  const gachaName = document.getElementById('gacha-name');
  const gachaSub = document.getElementById('gacha-sub');
  const gachaPotBadge = document.getElementById('gacha-pot-badge');

  if (gachaName) gachaName.textContent = "Draw an Uma ✨";
  if (gachaSub) gachaSub.textContent = "Click the live draw button above to start drawing Umas in real-time";
  if (gachaPotBadge) {
    gachaPotBadge.textContent = "READY";
    gachaPotBadge.className = "gacha-pot-tag pot-tag-1";
  }

  renderTeamUmaLists();
  updateProgressUI();
  saveStateToStorage();
}

function renderTeamUmaLists(autoscrollTeamKey = null) {
  TEAM_KEYS.forEach(t => {
    const listEl = document.getElementById(`${t}-uma-list`);
    const countEl = document.getElementById(`${t}-uma-count`);
    if (!listEl || !countEl) return;
    const list = teams[t].umas;

    countEl.textContent = `${list.length} Umas`;

    if (list.length === 0) {
      listEl.innerHTML = `<div style="text-align:center; padding:30px 10px; color:var(--text-faint); font-size:12px; font-weight:600;">No Umas drawn yet.</div>`;
      return;
    }

    listEl.innerHTML = list.map((uma, idx) => {
      const pot = UMA_POT_MAP[uma] || 1;
      const isLatest = idx === list.length - 1;
      return `
        <div class="uma-badge-item" style="${isLatest ? 'animation:fadeIn 0.25s ease; border-color:var(--team-' + t + '-border); background:#fffcf7;' : ''}">
          <span><b>${idx + 1}.</b> ${uma}</span>
          <span class="gacha-pot-tag pot-tag-${pot}" style="font-size:9px; padding:2px 8px;">P${pot}</span>
        </div>
      `;
    }).join('');

    if (autoscrollTeamKey === t) {
      listEl.scrollTop = listEl.scrollHeight;
    }
  });
}
