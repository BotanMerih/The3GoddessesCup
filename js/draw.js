let marketSearch = '';
let marketFilter = 'all';
let marketSort = 'az';

let umaPickHistory = [];

function getSnakeDraftOrder() {
  const order = [];
  const baseTeams = ['red', 'blue', 'yellow'];
  for (let round = 1; round <= MAX_UMAS_PER_TEAM; round++) {
    if (round % 2 === 1) {
      order.push(baseTeams[0], baseTeams[1], baseTeams[2]);
    } else {
      order.push(baseTeams[2], baseTeams[1], baseTeams[0]);
    }
  }
  return order;
}

// Cheapest Uma this team could still legally draft (respecting the 9-Uma reserve), or null if none.
function getCheapestAffordableUma(teamKey) {
  let best = null;
  for (const u of ALL_UMAS) {
    if (!isUmaAvailable(u) || !canTeamAffordUma(teamKey, u)) continue;
    if (best === null || getUmaPrice(u) < getUmaPrice(best)) best = u;
  }
  return best;
}

// A team stops taking turns once it has finished (after reaching the minimum), hit the roster cap,
// or can no longer afford any available Uma.
function isTeamDraftFinished(teamKey) {
  const team = teams[teamKey];
  if (!team) return true;
  const count = team.umas ? team.umas.length : 0;
  if (count >= MAX_UMAS_PER_TEAM) return true;
  if (team.draftDone && count >= MIN_UMAS_PER_TEAM) return true;
  return getCheapestAffordableUma(teamKey) === null;
}

function getCurrentDraftPick() {
  const order = getSnakeDraftOrder();
  // Each team's drafted Umas consume that team's slots in snake order; the first unconsumed slot
  // of a team that is still drafting is the current pick. Finished teams are skipped.
  const remaining = {};
  TEAM_KEYS.forEach(t => { remaining[t] = teams[t]?.umas?.length || 0; });
  const madePicks = TEAM_KEYS.reduce((acc, t) => acc + remaining[t], 0);

  for (let i = 0; i < order.length; i++) {
    const t = order[i];
    if (remaining[t] > 0) { remaining[t]--; continue; }
    if (isTeamDraftFinished(t)) continue;
    return {
      pickIndex: i,
      pickNumber: madePicks + 1,
      round: Math.floor(i / 3) + 1,
      teamKey: t,
      isComplete: false,
      totalPicks: madePicks
    };
  }

  return {
    pickIndex: order.length,
    pickNumber: madePicks,
    round: Math.ceil(order.length / 3),
    teamKey: null,
    isComplete: true,
    totalPicks: madePicks
  };
}

function finishTeamDraft(teamKey) {
  const team = teams[teamKey];
  if (!team) return;
  const count = team.umas?.length || 0;
  if (count < MIN_UMAS_PER_TEAM) {
    alert(`${team.name} Team needs at least ${MIN_UMAS_PER_TEAM} Umas before finishing (currently ${count}).`);
    return;
  }
  if (!confirm(`Finish drafting for ${team.name} Team with ${count} Umas? Remaining ${getTeamBudget(teamKey)} 🪙 will be unused.`)) return;
  team.draftDone = true;
  const next = getCurrentDraftPick();
  selectedDrawTeam = next.isComplete ? teamKey : next.teamKey;
  playBeep(520, 'sine', 0.1);
  renderMarketUI();
  saveStateToStorage();
}

function resumeTeamDraft(teamKey, ev) {
  if (ev) ev.stopPropagation();
  const team = teams[teamKey];
  if (!team) return;
  team.draftDone = false;
  playBeep(600, 'sine', 0.08);
  renderMarketUI();
  saveStateToStorage();
}

function syncUmaPickHistoryWithTeams() {
  const totalInTeams = TEAM_KEYS.reduce((acc, t) => acc + (teams[t]?.umas?.length || 0), 0);
  if (umaPickHistory.length === 0 && totalInTeams > 0) {
    const order = getSnakeDraftOrder();
    const teamCopied = {
      red: [...(teams.red?.umas || [])],
      blue: [...(teams.blue?.umas || [])],
      yellow: [...(teams.yellow?.umas || [])]
    };
    for (let i = 0; i < order.length; i++) {
      const t = order[i];
      if (teamCopied[t].length > 0) {
        const u = teamCopied[t].shift();
        umaPickHistory.push({
          uma: u,
          team: t,
          pickNumber: i + 1,
          round: Math.floor(i / 3) + 1,
          timestamp: Date.now()
        });
      } else {
        break;
      }
    }
  }
}

function getUmaOwner(umaName) {
  for (const t of TEAM_KEYS) {
    if (teams[t]?.umas?.includes(umaName)) return t;
  }
  return null;
}

function isUmaAvailable(umaName) {
  return getUmaOwner(umaName) === null;
}

function setSelectedDrawTeam(teamKey) {
  if (!TEAM_KEYS.includes(teamKey)) return;
  selectedDrawTeam = teamKey;
  renderBudgetCards();
  renderMarketList();
  renderTeamUmaLists();
  saveStateToStorage();
}

function buyUmaForTeam(umaName) {
  const current = getCurrentDraftPick();
  if (current.isComplete) {
    alert("Snake Draft has completed! Every team has finished drafting.");
    return;
  }

  const teamKey = current.teamKey;
  const team = teams[teamKey];
  if (!team) return;

  if (team.umas.length >= MAX_UMAS_PER_TEAM) {
    alert(`${team.name} Team has reached the maximum ${MAX_UMAS_PER_TEAM} Uma limit!`);
    return;
  }

  const owner = getUmaOwner(umaName);
  if (owner) {
    alert(`"${umaName}" is already owned by ${teams[owner].name} Team!`);
    return;
  }

  const remainingBudget = getTeamBudget(teamKey);
  const price = getUmaPrice(umaName);
  if (remainingBudget < price) {
    alert(`${team.name} Team has insufficient coins! Remaining: ${remainingBudget} 🪙, Required: ${price} 🪙`);
    return;
  }
  if (!canTeamAffordUma(teamKey, umaName)) {
    const reserve = getRequiredReserve(teamKey, umaName);
    if (remainingBudget - price < reserve) {
      alert(`${team.name} Team can't draft "${umaName}" (${price} 🪙): it would leave ${remainingBudget - price} 🪙, but at least ${reserve} 🪙 is needed to reach the minimum of ${MIN_UMAS_PER_TEAM} Umas.`);
    } else {
      alert(`${team.name} Team can't draft "${umaName}" right now: it would leave too few affordable Umas for every team to reach the minimum of ${MIN_UMAS_PER_TEAM}.`);
    }
    return;
  }

  team.umas.push(umaName);
  team.budget = getTeamBudget(teamKey);

  umaPickHistory.push({
    uma: umaName,
    team: teamKey,
    pickNumber: current.pickNumber,
    round: current.round,
    timestamp: Date.now()
  });

  const nextPick = getCurrentDraftPick();
  selectedDrawTeam = nextPick.isComplete ? teamKey : nextPick.teamKey;

  playCoinSound();
  renderMarketUI();
  saveStateToStorage();
}

function undoLastDraftPick() {
  if (umaPickHistory.length === 0) return;
  const lastPick = umaPickHistory.pop();
  const team = teams[lastPick.team];
  if (team && team.umas) {
    const idx = team.umas.lastIndexOf(lastPick.uma);
    if (idx !== -1) {
      team.umas.splice(idx, 1);
      team.budget = getTeamBudget(lastPick.team);
    }
  }

  const cur = getCurrentDraftPick();
  selectedDrawTeam = cur.isComplete ? lastPick.team : cur.teamKey;

  playBeep(440, 'sine', 0.12);
  renderMarketUI();
  saveStateToStorage();
}

function sellUmaForTeam(umaName, teamKey) {
  const team = teams[teamKey];
  if (!team) return;

  const idx = team.umas.indexOf(umaName);
  if (idx === -1) return;

  team.umas.splice(idx, 1);
  team.budget = getTeamBudget(teamKey);

  const histIdx = umaPickHistory.findIndex(h => h.uma === umaName && h.team === teamKey);
  if (histIdx !== -1) {
    umaPickHistory.splice(histIdx, 1);
  }

  const cur = getCurrentDraftPick();
  selectedDrawTeam = cur.isComplete ? teamKey : cur.teamKey;

  playBeep(440, 'sine', 0.12);
  renderMarketUI();
  saveStateToStorage();
}

function resetUmaPools() {
  if (!confirm(`Are you sure you want to reset the Snake Draft and refund all ${TEAM_MAX_BUDGET} coins for all teams?`)) return;

  TEAM_KEYS.forEach(t => {
    teams[t].umas = [];
    teams[t].budget = TEAM_MAX_BUDGET;
    teams[t].draftDone = false;
  });
  umaPickHistory = [];
  selectedDrawTeam = 'red';

  playBeep(350, 'triangle', 0.15);
  renderMarketUI();
  saveStateToStorage();
}

function setMarketFilter(filterType) {
  marketFilter = filterType;
  document.querySelectorAll('.filter-tab').forEach(btn => {
    if (btn.getAttribute('data-filter') === filterType) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  renderMarketList();
}

function onMarketSearchInput(val) {
  marketSearch = (val || '').trim().toLowerCase();
  const clearBtn = document.getElementById('btn-clear-search');
  if (clearBtn) {
    if (marketSearch.length > 0) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
  }
  renderMarketList();
}

function clearMarketSearch() {
  const input = document.getElementById('market-search-input');
  if (input) input.value = '';
  marketSearch = '';
  document.getElementById('btn-clear-search')?.classList.add('hidden');
  renderMarketList();
}

function onMarketSortChange(val) {
  marketSort = val || 'az';
  renderMarketList();
}

function renderSnakeDraftTicker() {
  const order = getSnakeDraftOrder();
  const current = getCurrentDraftPick();

  const roundBadge = document.getElementById('draft-round-badge');
  const pickBadge = document.getElementById('draft-pick-badge');
  const onClockEl = document.getElementById('draft-on-clock-indicator');
  const teamNameEl = document.getElementById('draft-current-team-name');
  const undoBtn = document.getElementById('btn-undo-pick');
  const queueStrip = document.getElementById('draft-queue-strip');

  if (roundBadge) {
    roundBadge.textContent = current.isComplete ? `Draft Complete` : `Round ${current.round}`;
  }

  if (pickBadge) {
    pickBadge.textContent = current.isComplete ? `${current.totalPicks} Umas Drafted` : `Pick ${current.pickNumber}`;
  }

  if (onClockEl && teamNameEl) {
    onClockEl.className = 'draft-on-clock';
    if (current.isComplete) {
      onClockEl.classList.add('complete');
      onClockEl.innerHTML = `<span class="clock-label">STATUS:</span> <b>🎉 Draft Complete!</b>`;
    } else {
      onClockEl.classList.add(current.teamKey);
      const teamObj = teams[current.teamKey];
      const teamName = teamObj?.name || current.teamKey;
      const emoji = current.teamKey === 'red' ? '🔴' : current.teamKey === 'blue' ? '🔵' : '🟡';
      const count = teamObj?.umas?.length || 0;
      const finishBtn = count >= MIN_UMAS_PER_TEAM
        ? ` <button type="button" class="btn btn-outline btn-sm" onclick="finishTeamDraft('${current.teamKey}')" title="Stop drafting for this team (minimum ${MIN_UMAS_PER_TEAM} reached)">🏁 Finish ${teamName}</button>`
        : '';
      onClockEl.innerHTML = `<span class="clock-label">ON THE CLOCK:</span> <b>${emoji} ${teamName} Team</b>${finishBtn}`;
    }
  }

  if (undoBtn) {
    undoBtn.disabled = (umaPickHistory.length === 0);
    undoBtn.style.opacity = (umaPickHistory.length === 0) ? '0.4' : '1';
    undoBtn.style.cursor = (umaPickHistory.length === 0) ? 'not-allowed' : 'pointer';
  }

  if (queueStrip) {
    let html = '';
    if (current.isComplete) {
      html = `<span style="font-size:12px; font-weight:800; color:#059669;">🏆 Draft complete: ${current.totalPicks} Umas drafted!</span>`;
    } else {
      // Upcoming slots, skipping teams that have already finished drafting.
      const upcoming = [];
      for (let i = current.pickIndex; i < order.length && upcoming.length < 9; i++) {
        if (i === current.pickIndex || !isTeamDraftFinished(order[i])) upcoming.push(i);
      }
      upcoming.forEach((i, n) => {
        const t = order[i];
        const isActive = n === 0;
        const roundNum = Math.floor(i / 3) + 1;
        const emoji = t === 'red' ? '🔴' : t === 'blue' ? '🔵' : '🟡';
        const tName = teams[t]?.name || t;
        html += `
          <div class="queue-chip ${t}${isActive ? ' active' : ''}" title="Round ${roundNum}: ${tName} Team">
            <span>#${current.pickNumber + n}</span>
            <span>${emoji} ${tName}</span>
            ${isActive ? '<span class="queue-chip-now">NOW</span>' : ''}
          </div>
        `;
      });
      const finished = TEAM_KEYS.filter(t => isTeamDraftFinished(t));
      if (finished.length) {
        html += `<span style="font-size:11px; color:var(--text-faint); margin-left:4px;">Finished: ${finished.map(t => teams[t]?.name || t).join(', ')}</span>`;
      }
    }
    queueStrip.innerHTML = html;
  }
}

function renderBudgetCards() {
  const current = getCurrentDraftPick();

  TEAM_KEYS.forEach(t => {
    const team = teams[t];
    const budget = getTeamBudget(t);
    const count = team?.umas?.length || 0;
    const isClockTeam = (!current.isComplete && current.teamKey === t);
    const isSelected = (selectedDrawTeam === t);

    const cardEl = document.getElementById(`budget-card-${t}`);
    const budgetValEl = document.getElementById(`${t}-budget-val`);
    const countBadgeEl = document.getElementById(`${t}-uma-count-badge`);
    const slotsEl = document.getElementById(`${t}-coin-slots`);
    const capBadge = document.getElementById(`${t}-cap-badge`);

    if (cardEl) {
      if (isClockTeam) cardEl.classList.add('active');
      else cardEl.classList.remove('active');
    }

    if (budgetValEl) budgetValEl.textContent = budget;
    if (countBadgeEl) {
      countBadgeEl.textContent = count >= MIN_UMAS_PER_TEAM ? `${count} Umas ✓` : `${count} / ${MIN_UMAS_PER_TEAM} Umas`;
      countBadgeEl.title = `Minimum ${MIN_UMAS_PER_TEAM} Umas, up to ${MAX_UMAS_PER_TEAM}`;
    }
    if (capBadge) capBadge.textContent = team?.cap || `Captain ${team?.name || t}`;

    if (slotsEl) {
      // One chip per drafted Uma (its price), then empty chips up to the 9-Uma minimum.
      let slotsHtml = '';
      const umas = team?.umas || [];
      umas.forEach(u => {
        slotsHtml += `<div class="coin-chip spent" title="${u}: ${getUmaPrice(u)} 🪙">${getUmaPrice(u)}</div>`;
      });
      for (let i = umas.length; i < MIN_UMAS_PER_TEAM; i++) {
        slotsHtml += `<div class="coin-chip available" title="Required slot #${i + 1}">🪙</div>`;
      }
      slotsEl.innerHTML = slotsHtml;
    }

    const actionTextEl = cardEl?.querySelector('.budget-card-action');
    if (actionTextEl) {
      if (isTeamDraftFinished(t)) {
        const canResume = team?.draftDone && count < MAX_UMAS_PER_TEAM && getCheapestAffordableUma(t) !== null;
        actionTextEl.innerHTML = `<span class="select-indicator ${t}">🏁 Finished (${count} Umas)</span>`
          + (canResume ? ` <button type="button" class="btn btn-outline btn-sm" onclick="resumeTeamDraft('${t}', event)">Resume</button>` : '');
      } else if (isClockTeam) {
        actionTextEl.innerHTML = `<span class="select-indicator ${t}" style="font-weight:800;">⏱️ ON THE CLOCK (Pick #${current.pickNumber})</span>`;
      } else if (isSelected) {
        actionTextEl.innerHTML = `<span class="select-indicator ${t}">✓ Viewing Team</span>`;
      } else {
        actionTextEl.innerHTML = `<span class="select-indicator inactive">Inspect Team ➔</span>`;
      }
    }
  });

  const activeDraftTeam = current.isComplete ? selectedDrawTeam : current.teamKey;
  const activeName = teams[activeDraftTeam]?.name || activeDraftTeam;
  const activeBudget = getTeamBudget(activeDraftTeam);

  const hintName = document.getElementById('hint-team-name');
  const hintBudget = document.getElementById('hint-team-budget');
  if (hintName) {
    const emoji = activeDraftTeam === 'red' ? '🔴' : activeDraftTeam === 'blue' ? '🔵' : '🟡';
    hintName.textContent = current.isComplete ? `Draft Finished` : `${emoji} ${activeName} Team (Turn #${current.pickNumber})`;
    hintName.style.color = `var(--team-${activeDraftTeam})`;
  }
  if (hintBudget) hintBudget.textContent = activeBudget;

  const allFilterBtn = document.querySelector('.filter-tab[data-filter="all"]');
  if (allFilterBtn) {
    allFilterBtn.textContent = `All (${ALL_UMAS.length})`;
  }
}

// ---------- rating display (data from js/uma_scores.js) ----------
// 1–24 rating -> heat class (low / mid / high / top)
function ratingHeat(v) {
  if (v >= 20) return 'top';
  if (v >= 15) return 'high';
  if (v >= 10) return 'mid';
  return 'low';
}

function renderMarketList() {
  const container = document.getElementById('market-cards-container');
  const counterEl = document.getElementById('market-counter-text');
  if (!container) return;

  const current = getCurrentDraftPick();
  const activeTeamKey = current.isComplete ? selectedDrawTeam : current.teamKey;

  let filtered = ALL_UMAS.filter(uma => {
    if (marketSearch && !uma.toLowerCase().includes(marketSearch)) {
      return false;
    }
    const owner = getUmaOwner(uma);

    if (marketFilter === 'available' && owner !== null) return false;
    if (marketFilter === 'myteam' && owner !== selectedDrawTeam) return false;

    return true;
  });

  const avgOf = (u) => getUmaScore(u)?.rating ?? -1;
  const trackOf = (u, id) => getUmaScore(u)?.tracks?.[id]?.score ?? 0;
  if (marketSort === 'za') {
    filtered.sort((a, b) => b.localeCompare(a));
  } else if (marketSort === 'rating') {
    filtered.sort((a, b) => avgOf(b) - avgOf(a) || a.localeCompare(b));
  } else if (marketSort === 'price-desc') {
    filtered.sort((a, b) => getUmaPrice(b) - getUmaPrice(a) || a.localeCompare(b));
  } else if (marketSort === 'price-asc') {
    filtered.sort((a, b) => getUmaPrice(a) - getUmaPrice(b) || a.localeCompare(b));
  } else if (marketSort.startsWith('track:')) {
    const id = marketSort.slice(6);
    filtered.sort((a, b) => trackOf(b, id) - trackOf(a, id) || avgOf(b) - avgOf(a));
  } else {
    filtered.sort((a, b) => a.localeCompare(b));
  }

  if (counterEl) {
    counterEl.textContent = `${filtered.length} Umas listed (Total: ${ALL_UMAS.length})`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-market-state">
        <span style="font-size:32px;">🔍</span>
        <div style="font-weight:700; margin-top:8px;">No Uma Found</div>
        <div style="font-size:12px; color:var(--text-muted);">Try clearing your search or filters to see available characters.</div>
      </div>
    `;
    return;
  }

  const activeBudget = getTeamBudget(activeTeamKey);
  const activeCount = teams[activeTeamKey]?.umas?.length || 0;
  const isTeamFull = activeCount >= MAX_UMAS_PER_TEAM;

  const html = filtered.map(uma => {
    const price = getUmaPrice(uma);
    const hasEnoughBudget = activeBudget >= price;
    const keepsReserve = canTeamAffordUma(activeTeamKey, uma);
    const owner = getUmaOwner(uma);
    const isOwnedByActive = owner === activeTeamKey;
    const isOwnedByOther = owner && owner !== activeTeamKey;

    let cardClass = `uma-market-card`;
    let actionHtml = '';

    if (owner) {
      const ownerTeam = teams[owner];
      cardClass += ` owned-active ${owner}`;
      actionHtml = `
        <div class="uma-card-owned-bar">
          <span class="owned-badge">✓ ${ownerTeam?.name || owner} Team</span>
          <button class="btn-card-refund" onclick="sellUmaForTeam('${uma.replace(/'/g, "\\'")}', '${owner}')" title="Refund this Uma">
            ↩️ Refund
          </button>
        </div>
      `;
    } else {
      if (current.isComplete) {
        actionHtml = `
          <button class="btn-card-buy disabled" disabled title="Every team has finished drafting">
            ⛔ Draft Complete
          </button>
        `;
      } else if (isTeamFull) {
        actionHtml = `
          <button class="btn-card-buy disabled" disabled title="Team roster is full (${MAX_UMAS_PER_TEAM}/${MAX_UMAS_PER_TEAM})">
            ⛔ Team Full (${MAX_UMAS_PER_TEAM}/${MAX_UMAS_PER_TEAM})
          </button>
        `;
      } else if (!hasEnoughBudget) {
        actionHtml = `
          <button class="btn-card-buy disabled" disabled title="Insufficient Coins (${activeBudget} 🪙 left, costs ${price} 🪙)">
            ⛔ Insufficient Coins
          </button>
        `;
      } else if (!keepsReserve) {
        const reserve = getRequiredReserve(activeTeamKey, uma);
        const why = activeBudget - price < reserve
          ? `Would leave ${activeBudget - price} 🪙; ${reserve} 🪙 needed to reach ${MIN_UMAS_PER_TEAM} Umas`
          : `Would leave too few affordable Umas for every team to reach ${MIN_UMAS_PER_TEAM}`;
        actionHtml = `
          <button class="btn-card-buy disabled" disabled title="${why}">
            ⛔ Over 9-Uma Reserve
          </button>
        `;
      } else {
        const teamName = teams[activeTeamKey]?.name || activeTeamKey;
        const emoji = activeTeamKey === 'red' ? '🔴' : activeTeamKey === 'blue' ? '🔵' : '🟡';
        actionHtml = `
          <button class="btn-card-buy snake-turn-${activeTeamKey}" onclick="buyUmaForTeam('${uma.replace(/'/g, "\\'")}')">
            🛒 Draft for ${emoji} ${teamName} (${price} 🪙)
          </button>
        `;
      }
    }

    const imageUrl = typeof getUmaImageUrl === 'function' ? getUmaImageUrl(uma) : `assets/umas/trained_chr_icon_1001_100101_02.png`;

    return `
      <div class="${cardClass}">
        <div class="uma-card-header">
          <span class="uma-price-pill" title="Draft price">${price} 🪙</span>
        </div>
        <div class="uma-card-avatar-wrap">
          <img src="${imageUrl}" alt="${uma}" class="uma-card-avatar" loading="lazy" onerror="this.src='assets/umas/trained_chr_icon_1001_100101_02.png'">
        </div>
        <div class="uma-card-name" title="${uma}">${uma}</div>
        <div class="uma-card-footer">
          ${actionHtml}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

function renderTeamUmaLists(autoscrollTeamKey = null) {
  TEAM_KEYS.forEach(t => {
    const listEl = document.getElementById(`${t}-uma-list`);
    const countEl = document.getElementById(`${t}-uma-count`);
    const rosterBudgetEl = document.getElementById(`roster-${t}-budget`);
    if (!listEl) return;

    const list = teams[t]?.umas || [];
    const budget = getTeamBudget(t);

    if (countEl) countEl.textContent = list.length >= MIN_UMAS_PER_TEAM ? `${list.length} Umas ✓` : `${list.length} / ${MIN_UMAS_PER_TEAM} Umas`;
    if (rosterBudgetEl) rosterBudgetEl.textContent = `💰 ${budget} 🪙`;

    // Drafted Umas, then empty slots up to the 9-Uma minimum.
    let html = '';
    const slots = Math.max(list.length, MIN_UMAS_PER_TEAM);
    for (let i = 0; i < slots; i++) {
      if (i < list.length) {
        const uma = list[i];
        const price = getUmaPrice(uma);
        const s = getUmaScore(uma);
        const imageUrl = typeof getUmaImageUrl === 'function' ? getUmaImageUrl(uma) : `assets/umas/trained_chr_icon_1001_100101_02.png`;
        html += `
          <div class="roster-uma-item">
            <div class="roster-uma-left">
              <span class="roster-slot-num">${i + 1}</span>
              <img src="${imageUrl}" alt="${uma}" class="roster-uma-avatar" loading="lazy" onerror="this.src='assets/umas/trained_chr_icon_1001_100101_02.png'">
              <span class="roster-uma-name" title="${uma}">${uma}</span>
              ${s && !s.unrated ? `<span class="roster-uma-rating ${ratingHeat(s.rating)}" title="Rating ${s.rating} / 24">★${s.rating.toFixed(1)}</span>` : ''}
            </div>
            <button class="btn-roster-refund" onclick="sellUmaForTeam('${uma.replace(/'/g, "\\'")}', '${t}')" title="Refund and get ${price} coins back">
              ✕ Refund (+${price} 🪙)
            </button>
          </div>
        `;
      } else {
        html += `
          <div class="roster-uma-empty">
            <span class="roster-slot-num">${i + 1}</span>
            <span class="empty-slot-label">Required Slot #${i + 1} (min ${MIN_UMAS_PER_TEAM})</span>
          </div>
        `;
      }
    }

    listEl.innerHTML = html;
  });
}

function updateProgressUI() {
  const current = getCurrentDraftPick();
  const proceedBtn = document.getElementById('btn-proceed-to-scoring');
  if (proceedBtn) {
    if (current.isComplete) {
      proceedBtn.style.animation = 'coinGlow 1.5s infinite alternate';
    } else {
      proceedBtn.style.animation = 'none';
    }
  }
}

function renderMarketUI() {
  syncUmaPickHistoryWithTeams();
  renderSnakeDraftTicker();
  renderBudgetCards();
  renderMarketList();
  renderTeamUmaLists();
  updateProgressUI();
}

function assignRandomPackages() {}
