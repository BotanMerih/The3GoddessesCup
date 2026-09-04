function assignRandomPackages() {
  const pkgs = shuffleArray(['A', 'B', 'C']);
  teams.red.package = pkgs[0];
  teams.blue.package = pkgs[1];
  teams.yellow.package = pkgs[2];
  saveStateToStorage();
}

function ensureRandomPackageAssignment() {
  const currentPkgs = [teams.red?.package, teams.blue?.package, teams.yellow?.package];
  const isValid = currentPkgs.includes('A') && currentPkgs.includes('B') && currentPkgs.includes('C');
  if (!isValid) {
    assignRandomPackages();
  }
}

function getTeamPotCounts(teamKey) {
  const umas = teams[teamKey]?.umas || [];
  let p1 = 0, p2 = 0, p3 = 0;
  umas.forEach(u => {
    const p = UMA_POT_MAP[u];
    if (p === 1) p1++;
    else if (p === 2) p2++;
    else if (p === 3) p3++;
  });
  return { pot1: p1, pot2: p2, pot3: p3, total: umas.length };
}

function getTeamPackageInfo(teamKey) {
  ensureRandomPackageAssignment();
  const pkgId = teams[teamKey]?.package || 'A';
  return POOL_PACKAGES[pkgId] || POOL_PACKAGES['A'];
}

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

function getNextRandomUmaForTeam(teamKey) {
  ensureRandomPackageAssignment();
  const current = getTeamPotCounts(teamKey);
  const target = getTeamPackageInfo(teamKey);

  const need1 = Math.max(0, target.pot1 - current.pot1);
  const need2 = Math.max(0, target.pot2 - current.pot2);
  const need3 = Math.max(0, target.pot3 - current.pot3);

  if (need1 + need2 + need3 === 0) {
    return null;
  }

  const w1 = (need1 > 0 && availablePot1.length > 0) ? Math.sqrt(need1) : 0;
  const w2 = (need2 > 0 && availablePot2.length > 0) ? Math.sqrt(need2) : 0;
  const w3 = (need3 > 0 && availablePot3.length > 0) ? Math.sqrt(need3) : 0;
  const totalWeight = w1 + w2 + w3;

  let chosenPot = 1;

  if (totalWeight > 0) {
    const rand = Math.random() * totalWeight;
    if (rand < w1) {
      chosenPot = 1;
    } else if (rand < w1 + w2) {
      chosenPot = 2;
    } else {
      chosenPot = 3;
    }
  } else {
    if (availablePot1.length > 0) chosenPot = 1;
    else if (availablePot2.length > 0) chosenPot = 2;
    else if (availablePot3.length > 0) chosenPot = 3;
    else return null;
  }

  let chosenName = null;

  if (chosenPot === 1 && availablePot1.length > 0) {
    const idx = Math.floor(Math.random() * availablePot1.length);
    chosenName = availablePot1.splice(idx, 1)[0];
  } else if (chosenPot === 2 && availablePot2.length > 0) {
    const idx = Math.floor(Math.random() * availablePot2.length);
    chosenName = availablePot2.splice(idx, 1)[0];
  } else if (chosenPot === 3 && availablePot3.length > 0) {
    const idx = Math.floor(Math.random() * availablePot3.length);
    chosenName = availablePot3.splice(idx, 1)[0];
  }

  if (!chosenName) return null;

  return {
    name: chosenName,
    pot: chosenPot,
    teamKey
  };
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

  const proceedBtn = document.getElementById('btn-proceed-to-draft');
  if (proceedBtn) {
    if (remaining === 0) proceedBtn.classList.remove('hidden');
    else proceedBtn.classList.add('hidden');
  }
}

function drawUmaForTeam(teamKey, animateCard = true, onComplete = null) {
  ensureRandomPackageAssignment();
  const remainingTotal = availablePot1.length + availablePot2.length + availablePot3.length;
  if (remainingTotal === 0) {
    stopSequentialDraw();
    const gachaName = document.getElementById('gacha-name');
    const gachaSub = document.getElementById('gacha-sub');
    if (gachaName) gachaName.textContent = "Draw Completed! 🎉";
    if (gachaSub) gachaSub.textContent = "All Umas have been distributed to the teams.";
    document.getElementById('btn-proceed-to-draft')?.classList.remove('hidden');
    if (onComplete) onComplete();
    return false;
  }

  if (teams[teamKey].umas.length >= 34) {
    if (!isSequentialRunning) {
      alert(`${teams[teamKey].name} Team has drawn all 34 Umas! Please select another team.`);
    }
    return false;
  }

  const drawn = getNextRandomUmaForTeam(teamKey);
  if (!drawn || !drawn.name) return false;

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
    gachaPotBadge.textContent = "✨ UMA MUSUME";
    gachaPotBadge.className = "gacha-pot-tag pot-tag-1";
  }
  if (gachaSub) {
    const remaining = availablePot1.length + availablePot2.length + availablePot3.length;
    gachaSub.textContent = `Added to ${teams[teamKey].name} Team! (${teams[teamKey].umas.length}/34 Umas • Remaining: ${remaining})`;
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

  ensureRandomPackageAssignment();

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

  let foundTeam = null;
  for (let i = 0; i < 3; i++) {
    const candidateTeam = TEAM_KEYS[(currentRoundRobinIndex + i) % 3];
    if (teams[candidateTeam].umas.length < 34) {
      foundTeam = candidateTeam;
      currentRoundRobinIndex = currentRoundRobinIndex + i + 1;
      break;
    }
  }

  if (!foundTeam) {
    stopSequentialDraw();
    return;
  }

  setSelectedDrawTeam(foundTeam);
  const success = drawUmaForTeam(foundTeam, true);
  if (success && isSequentialRunning) {
    sequentialTimer = setTimeout(runSequentialLoop, sequentialSpeed);
  }
}

function stopSequentialDraw() {
  isSequentialRunning = false;
  clearTimeout(sequentialTimer);
  const mainBtn = document.getElementById('btn-live-draw-all');
  if (mainBtn) {
    mainBtn.innerHTML = "⚡ Live Draw (Sequential)";
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


function resetUmaPools() {
  if (!confirm("Are you sure you want to reset all team Uma pools?")) return;
  if (isSequentialRunning) stopSequentialDraw();

  assignRandomPackages();

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
    countEl.textContent = `${list.length}/34 Umas`;

    if (list.length === 0) {
      listEl.innerHTML = `<div style="text-align:center; padding:30px 10px; color:var(--text-faint); font-size:12px; font-weight:600;">No Umas drawn yet.</div>`;
      return;
    }

    listEl.innerHTML = list.map((uma, idx) => {
      const isLatest = idx === list.length - 1;
      return `
        <div class="uma-badge-item" style="${isLatest ? 'animation:fadeIn 0.25s ease; border-color:var(--team-' + t + '-border); background:#fffcf7;' : ''}">
          <span><b>${idx + 1}.</b> ${uma}</span>
        </div>
      `;
    }).join('');

    if (autoscrollTeamKey === t) {
      listEl.scrollTop = listEl.scrollHeight;
    }
  });
}
