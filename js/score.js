let playerUmaAssignments = {};
let activeMatchHistoryTrackFilter = 'all';
// 'all', 'team:<teamKey>' or 'track:<trackId>'
let leaderboardScope = 'all';

// The single source of truth for placements and their default points.
const PLACEMENTS = [
  { key: 'first',  statProp: 'wins',    pts: 10, short: '1st', label: '🥇 1st', podium: true },
  { key: 'second', statProp: 'seconds', pts: 7,  short: '2nd', label: '🥈 2nd', podium: true },
  { key: 'third',  statProp: 'thirds',  pts: 5,  short: '3rd', label: '🥉 3rd', podium: true },
  { key: 'fourth', statProp: 'fourths', pts: 3,  short: '4th', label: '🎖️ 4th', podium: false },
  { key: 'fifth',  statProp: 'fifths',  pts: 1,  short: '5th', label: '🎖️ 5th', podium: false }
];

function getDefaultPlacementPts(key) {
  return PLACEMENTS.find(p => p.key === key)?.pts ?? 0;
}

// Points actually awarded for a recorded placement (custom value if one was entered).
function getPlacementPts(pData, key) {
  return (pData && pData.pts !== undefined && pData.pts !== null && pData.pts !== '') ? Number(pData.pts) : getDefaultPlacementPts(key);
}

function resetRacePointInputs() {
  const legend = document.getElementById('placement-points-legend');
  if (legend) legend.textContent = PLACEMENTS.map(p => `${p.short}=${p.pts}p`).join(', ');
  PLACEMENTS.forEach(p => {
    const el = document.getElementById(`race-${p.key}-pts`);
    if (el) el.value = p.pts;
  });
}

function getPlayerUma(playerName) {
  return playerUmaAssignments[playerName] || '';
}

function updatePlayerUmaAssignment(teamKey, playerName, selectedUma) {
  if (selectedUma) {
    playerUmaAssignments[playerName] = selectedUma;
  } else {
    delete playerUmaAssignments[playerName];
  }
  renderScoringTab();
  saveStateToStorage();
}

function getMatchTrackId(match) {
  if (match && match.trackId) return match.trackId === 'hakodate-2600' ? 'kyoto-3000' : match.trackId;
  const title = (match?.title || '').toLowerCase();
  if (title.includes('kyoto') || title.includes('3000')) return 'kyoto-3000';
  if (title.includes('chukyo') || title.includes('1200')) return 'chukyo-1200';
  if (title.includes('sapporo') || title.includes('1500')) return 'sapporo-1500';
  if (title.includes('tokyo') || title.includes('2400')) return 'tokyo-2400';
  // Hakodate 2600 was replaced by Kyoto 3000; old saves map to the new long-distance track.
  if (title.includes('hakodate') || title.includes('2600')) return 'kyoto-3000';
  if (title.includes('morioka') || title.includes('1600') || title.includes('dirt')) return 'morioka-1600';
  return 'other';
}

function getTrackDisplayMeta(trackId) {
  const meta = DEFAULT_TRACKS.find(t => t.id === trackId);
  if (meta) return meta;
  return {
    id: 'other',
    name: 'Custom Track',
    category: 'General',
    distance: 'Open',
    surface: 'Turf/Dirt',
    turn: 'Standard',
    icon: '🏁',
    tagColor: '#6b7280',
    accentBg: '#f3f4f6',
    desc: 'General or unlisted race course'
  };
}

function onRaceTrackSelectChange(selectedTrackId) {
  const trackMeta = getTrackDisplayMeta(selectedTrackId);
  const titleInput = document.getElementById('race-title-input');
  if (titleInput) {
    titleInput.value = `Race ${matches.length + 1} - ${trackMeta.name}`;
  }
}

function selectTrackForNewRace(trackId) {
  const trackMeta = getTrackDisplayMeta(trackId);
  const trackSelect = document.getElementById('race-track-select');
  if (trackSelect) trackSelect.value = trackId;
  const titleInput = document.getElementById('race-title-input');
  if (titleInput) titleInput.value = `Race ${matches.length + 1} - ${trackMeta.name}`;
  const formEl = document.getElementById('record-race-form');
  if (formEl) {
    formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (typeof playCoinSound === 'function') playCoinSound();
  }
}

function setMatchHistoryTrackFilter(trackId) {
  activeMatchHistoryTrackFilter = trackId;
  renderScoringTab();
}

function emptyTeamTally() {
  return { points: 0, wins: 0, seconds: 0, thirds: 0, fourths: 0, fifths: 0, totalRaces: 0, podiums: 0 };
}

function emptyTrackStat(trackId) {
  return {
    meta: getTrackDisplayMeta(trackId),
    matches: [],
    teamPoints: { red: 0, blue: 0, yellow: 0 },
    wins: { red: 0, blue: 0, yellow: 0 },
    podiums: { red: 0, blue: 0, yellow: 0 }
  };
}

function emptyPlayerStat(name, team, assignedUma) {
  return {
    name, team, assignedUma,
    lastUma: '',
    points: 0, wins: 0, seconds: 0, thirds: 0, fourths: 0, fifths: 0,
    podiums: 0, top5: 0, races: 0
  };
}

// Builds every standings table. With onlyTrackId set, only races on that track are counted
// and bonus points (which belong to no track) are left out.
function calculateScoringStats(onlyTrackId = null) {
  const stats = {};
  TEAM_KEYS.forEach(t => {
    stats[t] = emptyTeamTally();
    if (!onlyTrackId) stats[t].points = bonusPoints[t] || 0;
  });

  const playerStats = {};
  // Keyed by team + player + Uma, so the same Uma raced by two players stays separate.
  const umaStats = {};

  const trackStats = {};
  DEFAULT_TRACKS.forEach(dt => {
    trackStats[dt.id] = emptyTrackStat(dt.id);
    trackStats[dt.id].meta = dt;
  });
  trackStats['other'] = emptyTrackStat('other');

  TEAM_KEYS.forEach(t => {
    const allMembers = Array.from(new Set([teams[t]?.cap, ...(teams[t]?.players || [])].filter(Boolean)));
    allMembers.forEach(p => {
      playerStats[p] = emptyPlayerStat(p, t, getPlayerUma(p));
    });
  });

  matches.forEach(m => {
    const tId = getMatchTrackId(m);
    if (onlyTrackId && tId !== onlyTrackId) return;
    const countedTeamsInMatch = new Set();

    if (!trackStats[tId]) trackStats[tId] = emptyTrackStat(tId);
    trackStats[tId].matches.push(m);
    if (m.first && m.first.team) {
      trackStats[tId].wins[m.first.team] = (trackStats[tId].wins[m.first.team] || 0) + 1;
    }

    PLACEMENTS.forEach(({ key, statProp, podium }) => {
      const pData = m[key];
      if (!pData || !pData.team || !stats[pData.team]) return;
      const pts = getPlacementPts(pData, key);
      stats[pData.team].points += pts;
      stats[pData.team][statProp] += 1;
      if (podium) stats[pData.team].podiums += 1;
      countedTeamsInMatch.add(pData.team);

      trackStats[tId].teamPoints[pData.team] = (trackStats[tId].teamPoints[pData.team] || 0) + pts;
      if (podium) trackStats[tId].podiums[pData.team] = (trackStats[tId].podiums[pData.team] || 0) + 1;

      if (pData.player) {
        if (!playerStats[pData.player]) {
          playerStats[pData.player] = emptyPlayerStat(pData.player, pData.team, getPlayerUma(pData.player));
        }
        const ps = playerStats[pData.player];
        ps.points += pts;
        ps[statProp] += 1;
        ps.top5 += 1;
        ps.races += 1;
        if (podium) ps.podiums += 1;
        if (pData.uma) ps.lastUma = pData.uma;
      }

      if (pData.uma) {
        const umaKey = `${pData.team}|${pData.player || ''}|${pData.uma}`;
        if (!umaStats[umaKey]) {
          umaStats[umaKey] = { umaName: pData.uma, team: pData.team, player: pData.player || '', points: 0, wins: 0, top5: 0, races: 0 };
        }
        umaStats[umaKey].points += pts;
        if (key === 'first') umaStats[umaKey].wins += 1;
        umaStats[umaKey].top5 += 1;
        umaStats[umaKey].races += 1;
      }
    });

    countedTeamsInMatch.forEach(t => {
      stats[t].totalRaces += 1;
    });
  });

return { teamStats: stats, playerStats, umaStats, trackStats };
}

function adjustTeamPoints(teamKey, delta) {
  if (!bonusPoints[teamKey]) bonusPoints[teamKey] = 0;
  bonusPoints[teamKey] += delta;
  renderScoringTab();
  saveStateToStorage();
}

function parsePointInput(id, fallback) {
  const el = document.getElementById(id);
  if (!el) return fallback;
  const val = parseInt(el.value, 10);
  return isNaN(val) ? fallback : val;
}

function recordRaceResult(e) {
  if (e) e.preventDefault();

  const raceTrack = document.getElementById('race-track-select')?.value || 'tokyo-2400';
  const raceTitle = document.getElementById('race-title-input')?.value.trim() || `Race ${matches.length + 1}`;
  
  const entries = {};
  PLACEMENTS.forEach(p => {
    entries[p.key] = {
      team: document.getElementById(`race-${p.key}-team`)?.value || "",
      player: document.getElementById(`race-${p.key}-player`)?.value || "",
      uma: document.getElementById(`race-${p.key}-uma`)?.value || "",
      pts: parsePointInput(`race-${p.key}-pts`, p.pts)
    };
  });

  if (PLACEMENTS.some(p => !entries[p.key].team)) {
    alert("Please select the teams for all 1st to 5th placements.");
    return;
  }

  // The same player or the same Uma cannot finish in two places of one race.
  const conflicts = [];
  ['player', 'uma'].forEach(field => {
    const seen = {};
    PLACEMENTS.forEach(p => {
      const val = entries[p.key][field];
      if (!val) return;
      (seen[val] = seen[val] || []).push(p.short);
    });
    Object.entries(seen).forEach(([val, places]) => {
      if (places.length > 1) conflicts.push(`${field === 'player' ? 'Player' : 'Uma'} "${val}" is entered in ${places.join(' and ')} place.`);
    });
  });
  if (conflicts.length) {
    alert("This race cannot be recorded:\n\n- " + conflicts.join('\n- ') + "\n\nFix the duplicate entries and try again.");
    return;
  }

  const now = new Date();
  const newMatch = {
    id: 'match_' + now.getTime(),
    raceNumber: matches.length + 1,
    trackId: raceTrack,
    title: raceTitle,
    timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ...entries
  };

  matches.push(newMatch);

  const currentTrackId = document.getElementById('race-track-select')?.value || raceTrack;
  const trackMeta = getTrackDisplayMeta(currentTrackId);
  if (document.getElementById('race-title-input')) {
    document.getElementById('race-title-input').value = `Race ${matches.length + 1} - ${trackMeta.name}`;
  }

  renderScoringTab();
  saveStateToStorage();
}

function deleteMatch(matchId) {
  if (!confirm("Are you sure you want to delete this race result?")) return;
  saveStateToStorage();
  createBackup('Before deleting a race');
  matches = matches.filter(m => m.id !== matchId);
  matches.forEach((m, idx) => {
    m.raceNumber = idx + 1;
  });
  renderScoringTab();
  saveStateToStorage();
}

function resetTournamentScores() {
  if (!confirm("Are you sure you want to reset all match results and scores?\n\nYour current data will be backed up first (see Backups).")) return;
  saveStateToStorage();
  createBackup('Before resetting scores');
  matches = [];
  bonusPoints = { red: 0, blue: 0, yellow: 0 };
  if (document.getElementById('race-title-input')) {
    document.getElementById('race-title-input').value = "Race 1";
  }
  resetRacePointInputs();
  renderScoringTab();
  saveStateToStorage();
}

function populateTeamMemberSelect(teamKey, selectEl, currentVal = '') {
  if (!selectEl) return;
  const cap = teams[teamKey]?.cap || `Captain ${teams[teamKey]?.name || teamKey}`;
  const players = teams[teamKey]?.players || [];

  let html = `<option value="">-- Select Player --</option>`;
  if (cap) {
    html += `<option value="${cap}">👑 ${cap} (Captain)</option>`;
  }
  players.filter(p => p !== cap).forEach((p, i) => {
    html += `<option value="${p}">${i + 1}. ${p}</option>`;
  });

  selectEl.innerHTML = html;
  if (currentVal) selectEl.value = currentVal;
}

function populateTeamUmaSelect(teamKey, selectEl, currentVal = '') {
  if (!selectEl) return;
  const umas = teams[teamKey]?.umas || [];

  let html = `<option value="">-- Select Uma --</option>`;
  umas.forEach((u, i) => {
    html += `<option value="${u}">${i + 1}. ${u}</option>`;
  });

  selectEl.innerHTML = html;
  if (currentVal) selectEl.value = currentVal;
}

function onRacePlacementTeamChange(placement) {
  const teamSelect = document.getElementById(`race-${placement}-team`);
  const playerSelect = document.getElementById(`race-${placement}-player`);
  const umaSelect = document.getElementById(`race-${placement}-uma`);
  const umaThumb = document.getElementById(`race-${placement}-uma-thumb`);

  if (!teamSelect || !playerSelect || !umaSelect) return;

  const chosenTeam = teamSelect.value;
  if (chosenTeam) {
    populateTeamMemberSelect(chosenTeam, playerSelect);
    populateTeamUmaSelect(chosenTeam, umaSelect);
  } else {
    playerSelect.innerHTML = `<option value="">-- Select Player --</option>`;
    umaSelect.innerHTML = `<option value="">-- Select Uma --</option>`;
  }

  if (umaThumb) {
    umaThumb.classList.add('hidden');
    umaThumb.src = '';
  }
}

function onRacePlacementPlayerChange(placement) {
  const playerSelect = document.getElementById(`race-${placement}-player`);
  const umaSelect = document.getElementById(`race-${placement}-uma`);
  const umaThumb = document.getElementById(`race-${placement}-uma-thumb`);

  if (!playerSelect || !umaSelect) return;

  const player = playerSelect.value;
  if (player && playerUmaAssignments[player]) {
    const pairedUma = playerUmaAssignments[player];
    for (let opt of umaSelect.options) {
      if (opt.value === pairedUma) {
        umaSelect.value = pairedUma;
        break;
      }
    }
  }

  onRacePlacementUmaChange(placement);
}

function onRacePlacementUmaChange(placement) {
  const umaSelect = document.getElementById(`race-${placement}-uma`);
  const umaThumb = document.getElementById(`race-${placement}-uma-thumb`);

  if (!umaSelect || !umaThumb) return;

  const chosenUma = umaSelect.value;
  if (chosenUma && typeof getUmaImageUrl === 'function') {
    umaThumb.src = getUmaImageUrl(chosenUma);
    umaThumb.classList.remove('hidden');
  } else {
    umaThumb.classList.add('hidden');
    umaThumb.src = '';
  }
}

function renderPlayerUmaPairingsUI() {
  const container = document.getElementById('player-uma-pairings-container');
  if (!container) return;

  container.innerHTML = TEAM_KEYS.map(t => {
    const team = teams[t];
    const teamName = team?.name || t;
    const emoji = t === 'red' ? '🔴' : t === 'blue' ? '🔵' : '🟡';
    const cap = team?.cap || `Captain ${teamName}`;
    const allMembers = Array.from(new Set([cap, ...(team?.players || [])].filter(Boolean)));
    const teamUmas = team?.umas || [];

    return `
      <div class="pairing-team-box ${t}">
        <div class="pairing-team-title">
          <span>${emoji} ${teamName} Team</span>
          <span style="font-size:11px; font-weight:700; color:var(--text-muted);">${allMembers.length} Players • ${teamUmas.length} Umas</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px;">
          ${allMembers.length === 0 ? `
            <div style="font-size:11px; color:var(--text-muted); text-align:center; padding:12px;">No players in roster. Add players in Tab 1.</div>
          ` : allMembers.map(p => {
            const isCap = (p === cap);
            const pairedUma = playerUmaAssignments[p] || '';
            const imgUrl = pairedUma && typeof getUmaImageUrl === 'function' ? getUmaImageUrl(pairedUma) : '';

            return `
              <div class="pairing-player-row">
                <div class="pairing-player-left" title="${p}">
                  <span>${isCap ? '👑' : '👤'}</span>
                  <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:90px;">${p}</span>
                </div>

                <div class="pairing-player-right">
                  ${pairedUma ? `
                    <img src="${imgUrl}" alt="${pairedUma}" class="uma-mini-thumb" title="${pairedUma}">
                  ` : ''}
                  <select class="pairing-select" onchange="updatePlayerUmaAssignment('${t}', '${p.replace(/'/g, "\\'")}', this.value)">
                    <option value="">-- Pair Uma --</option>
                    ${teamUmas.map(u => `
                      <option value="${u}" ${u === pairedUma ? 'selected' : ''}>${u}</option>
                    `).join('')}
                  </select>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function renderScoringTab() {
  const { teamStats, playerStats, umaStats, trackStats } = calculateScoringStats();

  const sortedTeams = [...TEAM_KEYS].sort((a, b) => {
    if (teamStats[b].points !== teamStats[a].points) {
      return teamStats[b].points - teamStats[a].points;
    }
    return teamStats[b].wins - teamStats[a].wins;
  });

  const medals = ['🥇', '🥈', '🥉'];
  const rankLabels = ['1st Place', '2nd Place', '3rd Place'];
  const rankClasses = ['rank-1', 'rank-2', 'rank-3'];

  const leaderboardGrid = document.getElementById('scoring-leaderboard-grid');
  if (leaderboardGrid) {
    leaderboardGrid.innerHTML = sortedTeams.map((t, idx) => {
      const st = teamStats[t];
      const capName = teams[t]?.cap || `Captain ${teams[t]?.name || t}`;
      const podiumPct = st.totalRaces > 0 ? Math.round((st.podiums / st.totalRaces) * 100) : 0;
      const winPct = st.totalRaces > 0 ? Math.round((st.wins / st.totalRaces) * 100) : 0;

      return `
        <div class="score-team-card ${t} ${rankClasses[idx]}">
          <div class="score-card-header">
            <div class="score-rank-badge">${medals[idx]} ${rankLabels[idx]}</div>
            <span class="score-team-name ${t}">● ${teams[t]?.name || t} Team</span>
          </div>

          <div class="score-main-points">
            <span class="pts-number">${st.points}</span>
            <span class="pts-label">TOTAL POINTS</span>
          </div>

          <div class="score-stats-grid-5">
            ${PLACEMENTS.map(p => `
            <div class="score-stat-box">
              <span class="stat-num">${st[p.statProp]}</span>
              <span class="stat-title">${p.short} (${p.pts}p)</span>
            </div>`).join('')}
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; font-size:11px; color:var(--text-muted); padding:4px 0; border-top:1px dashed #ebdcc5;">
            <span>🏁 Races: <b>${st.totalRaces}</b></span>
            <span>🏆 Podiums: <b>${st.podiums}</b> (${podiumPct}%)</span>
            <span>🥇 Win Rate: <b>${winPct}%</b></span>
          </div>

          <div class="score-card-footer">
            <div class="score-captain-tag">Captain: <b>${capName}</b></div>
            <div class="score-quick-adjust">
              <span style="font-size:10px; font-weight:700; color:var(--text-muted); margin-right:4px;">Quick Pts:</span>
              <button class="btn-score-adjust" onclick="adjustTeamPoints('${t}', 1)">+1</button>
              <button class="btn-score-adjust" onclick="adjustTeamPoints('${t}', 3)">+3</button>
              <button class="btn-score-adjust" onclick="adjustTeamPoints('${t}', 5)">+5</button>
              <button class="btn-score-adjust" onclick="adjustTeamPoints('${t}', 10)">+10</button>
              <button class="btn-score-adjust minus" onclick="adjustTeamPoints('${t}', -1)">-1</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderPlayerUmaPairingsUI();

  PLACEMENTS.forEach(({ key: p }) => {
    const teamSelect = document.getElementById(`race-${p}-team`);
    const playerSelect = document.getElementById(`race-${p}-player`);
    const umaSelect = document.getElementById(`race-${p}-uma`);
    if (teamSelect && playerSelect && umaSelect) {
      const curPlayer = playerSelect.value;
      const curUma = umaSelect.value;
      if (teamSelect.value) {
        populateTeamMemberSelect(teamSelect.value, playerSelect, curPlayer);
        populateTeamUmaSelect(teamSelect.value, umaSelect, curUma);
      }
      onRacePlacementUmaChange(p);
    }
  });

  if (typeof updateQuickTrackChips === 'function') updateQuickTrackChips();

  renderTrackResultsBoard(trackStats);
  renderTrackPointsMatrix(trackStats);
  renderMatchHistoryList(matches, trackStats);

  renderScopedLeaderboard();
}

function teamEmoji(t) {
  return t === 'red' ? '🔴' : t === 'blue' ? '🔵' : '🟡';
}

function setLeaderboardScope(scope) {
  leaderboardScope = scope;
  renderScopedLeaderboard();
}

function parseLeaderboardScope() {
  const [kind, id] = leaderboardScope.split(':');
  if (kind === 'team' && TEAM_KEYS.includes(id)) return { kind, id };
  if (kind === 'track' && (DEFAULT_TRACKS.some(t => t.id === id) || id === 'other')) return { kind, id };
  return { kind: 'all', id: null };
}

// Player and Uma leaderboards for the whole tournament, one team, or one track.
function renderScopedLeaderboard() {
  const scope = parseLeaderboardScope();
  const { teamStats, playerStats, umaStats } = calculateScoringStats(scope.kind === 'track' ? scope.id : null);

  const tabsEl = document.getElementById('leaderboard-scope-tabs');
  if (tabsEl) {
    const raceCount = id => matches.filter(m => getMatchTrackId(m) === id).length;
    const tabs = [
      { scope: 'all', label: '🌐 Overall' },
      ...TEAM_KEYS.map(t => ({ scope: `team:${t}`, label: `${teamEmoji(t)} ${teams[t]?.name || t}` })),
      ...DEFAULT_TRACKS.map(t => ({ scope: `track:${t.id}`, label: `${t.icon} ${t.name} (${raceCount(t.id)})` }))
    ];
    if (raceCount('other') > 0) tabs.push({ scope: 'track:other', label: `🏁 Custom (${raceCount('other')})` });
    const active = scope.kind === 'all' ? 'all' : `${scope.kind}:${scope.id}`;
    tabsEl.innerHTML = tabs.map(tab => `
      <button type="button" class="track-filter-btn ${tab.scope === active ? 'active' : ''}" onclick="setLeaderboardScope('${tab.scope}')">${tab.label}</button>
    `).join('');
  }

  let scopeTitle = 'Whole tournament';
  if (scope.kind === 'team') scopeTitle = `${teamEmoji(scope.id)} ${teams[scope.id]?.name || scope.id} Team`;
  if (scope.kind === 'track') {
    const meta = getTrackDisplayMeta(scope.id);
    scopeTitle = `${meta.icon} ${meta.name}`;
  }

  const summaryEl = document.getElementById('leaderboard-scope-summary');
  if (summaryEl) {
    if (scope.kind === 'all') {
      summaryEl.innerHTML = '';
    } else if (scope.kind === 'team') {
      const st = teamStats[scope.id];
      const bonus = bonusPoints[scope.id] || 0;
      summaryEl.innerHTML = `
        <div class="lb-summary-pill ${scope.id}"><b>${st.points}</b> pts total${bonus ? ` (incl. ${bonus > 0 ? '+' : ''}${bonus} bonus)` : ''}</div>
        <div class="lb-summary-pill">🏁 <b>${st.totalRaces}</b> races</div>
        <div class="lb-summary-pill">🥇 <b>${st.wins}</b> wins</div>
        <div class="lb-summary-pill">🏆 <b>${st.podiums}</b> podiums</div>`;
    } else {
      const ranked = [...TEAM_KEYS].sort((a, b) => teamStats[b].points - teamStats[a].points || teamStats[b].wins - teamStats[a].wins);
      summaryEl.innerHTML = `<span class="lb-summary-label">Team points on this track (no bonus):</span>` + ranked.map(t => `
        <div class="lb-summary-pill ${t}">${teamEmoji(t)} ${teams[t]?.name || t}: <b>${teamStats[t].points}p</b> · ${teamStats[t].wins}W</div>`).join('');
    }
  }

  const playerRosterTable = document.getElementById('player-leaderboard-body');
  if (playerRosterTable) {
    let rows = Object.values(playerStats);
    if (scope.kind === 'team') rows = rows.filter(p => p.team === scope.id);
    if (scope.kind === 'track') rows = rows.filter(p => p.races > 0);
    rows.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.podiums - a.podiums;
    });

    if (rows.length === 0) {
      const msg = scope.kind === 'track' ? 'No races recorded on this track yet.' : 'No player data found. Check team rosters in Tab 1.';
      playerRosterTable.innerHTML = `<tr><td colspan="12" style="text-align:center; padding:20px; color:var(--text-muted);">${msg}</td></tr>`;
    } else {
      playerRosterTable.innerHTML = rows.map((p, idx) => {
        // On a track board show the Uma actually raced there; elsewhere the paired Uma.
        const shownUma = scope.kind === 'track' ? (p.lastUma || p.assignedUma) : (p.assignedUma || getPlayerUma(p.name) || p.lastUma);
        const umaImg = shownUma && typeof getUmaImageUrl === 'function' ? getUmaImageUrl(shownUma) : '';
        const podiumPct = p.races > 0 ? Math.round((p.podiums / p.races) * 100) : 0;
        const isCap = (p.name === teams[p.team]?.cap);

        return `
          <tr>
            <td style="font-family:'JetBrains Mono',monospace; font-weight:700; width:45px;">${idx === 0 ? '👑 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : idx + 1}</td>
            <td style="font-weight:700; color:var(--text-main);">
              ${isCap ? '👑 ' : ''}${p.name}
            </td>
            <td>
              ${shownUma ? `
                <div style="display:flex; align-items:center; gap:6px;">
                  <img src="${umaImg}" alt="${shownUma}" class="uma-mini-thumb" onerror="this.style.display='none'">
                  <span style="font-weight:700; font-size:12px;">${shownUma}</span>
                </div>
              ` : `
                <span style="color:var(--text-faint); font-size:11px; font-style:italic;">None Paired</span>
              `}
            </td>
            <td><span class="team-tag ${p.team}" style="font-size:11px;">● ${teams[p.team]?.name || p.team}</span></td>
            <td style="font-family:'JetBrains Mono',monospace; text-align:center;">${p.races}</td>
            <td style="font-family:'JetBrains Mono',monospace; font-weight:700; text-align:center; color:#d97706;">${p.wins}</td>
            <td style="font-family:'JetBrains Mono',monospace; font-weight:700; text-align:center; color:#4b5563;">${p.seconds}</td>
            <td style="font-family:'JetBrains Mono',monospace; font-weight:700; text-align:center; color:#92400e;">${p.thirds}</td>
            <td style="font-family:'JetBrains Mono',monospace; text-align:center; color:var(--text-muted);">${p.fourths}</td>
            <td style="font-family:'JetBrains Mono',monospace; text-align:center; color:var(--text-muted);">${p.fifths}</td>
            <td style="font-family:'JetBrains Mono',monospace; text-align:center; font-weight:700; color:${podiumPct > 50 ? '#059669' : 'var(--text-main)'};">${podiumPct}%</td>
            <td style="font-family:'JetBrains Mono',monospace; font-weight:800; text-align:right; color:#b45309; font-size:14px;">${p.points} pts</td>
          </tr>
        `;
      }).join('');
    }
  }

  const mvpTitle = document.getElementById('uma-mvp-title');
  if (mvpTitle) mvpTitle.textContent = `🏇 Top Performing Uma Musumes · ${scopeTitle}`;
  const playerTitle = document.getElementById('player-leaderboard-title');
  if (playerTitle) playerTitle.textContent = `👤 Player & Uma Leaderboard · ${scopeTitle}`;

  const mvpContainer = document.getElementById('uma-mvp-cards-container');
  if (mvpContainer) {
    let umaRows = Object.values(umaStats);
    if (scope.kind === 'team') umaRows = umaRows.filter(u => u.team === scope.id);
    const sortedUmas = umaRows.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.wins - a.wins;
    }).slice(0, 5);

    if (sortedUmas.length === 0) {
      mvpContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding:18px; color:var(--text-muted); font-size:12px;">
          ${scope.kind === 'all' ? 'Record race matches to see the top performing Uma Musumes on this MVP board.' : 'No Uma results for this selection yet.'}
        </div>
      `;
    } else {
      mvpContainer.innerHTML = sortedUmas.map((u, idx) => {
        const img = typeof getUmaImageUrl === 'function' ? getUmaImageUrl(u.umaName) : '';
        const rankMedal = idx === 0 ? '👑 1st MVP' : idx === 1 ? '🥈 2nd' : idx === 2 ? '🥉 3rd' : `#${idx + 1}`;
        const teamName = teams[u.team]?.name || u.team;

        return `
          <div class="mvp-card ${idx === 0 ? 'rank-1' : ''}">
            <span class="mvp-rank-pill">${rankMedal}</span>
            <img src="${img}" alt="${u.umaName}" class="mvp-avatar" onerror="this.src='assets/umas/trained_chr_icon_1001_100101_02.png'">
            <div class="mvp-info">
              <span class="mvp-name" title="${u.umaName}">${u.umaName}</span>
              <span class="mvp-sub">👤 ${u.player || 'Unassigned'} • <b class="team-tag ${u.team}" style="font-size:9px; padding:1px 4px;">${teamName}</b></span>
              <div style="display:flex; align-items:center; gap:8px; margin-top:2px;">
                <span class="mvp-pts">${u.points} pts</span>
                <span style="font-size:10px; color:var(--text-muted);">(${u.wins} wins • ${u.races} races)</span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

function renderTrackResultsBoard(trackStats) {
  const container = document.getElementById('track-results-cards-grid');
  if (!container) return;

  const tracksToShow = DEFAULT_TRACKS.map(dt => dt.id);
  if (trackStats['other'] && trackStats['other'].matches.length > 0) {
    tracksToShow.push('other');
  }

  container.innerHTML = tracksToShow.map(trackId => {
    const data = trackStats[trackId] || {
      meta: getTrackDisplayMeta(trackId),
      matches: [],
      teamPoints: { red: 0, blue: 0, yellow: 0 },
      wins: { red: 0, blue: 0, yellow: 0 },
      podiums: { red: 0, blue: 0, yellow: 0 }
    };
    const meta = data.meta;
    const matchCount = data.matches.length;
    const latestMatch = matchCount > 0 ? data.matches[data.matches.length - 1] : null;
    const winner = latestMatch ? latestMatch.first : null;
    const winnerUmaImg = winner?.uma && typeof getUmaImageUrl === 'function' ? getUmaImageUrl(winner.uma) : '';

    return `
      <div class="track-result-card" style="border-top: 3px solid ${meta.tagColor};">
        <div class="track-result-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:20px;">${meta.icon}</span>
            <div>
              <div class="track-result-name">${meta.name}</div>
              <div class="track-result-sub">${meta.distance} • ${meta.surface} (${meta.turn})</div>
            </div>
          </div>
          <span class="track-result-badge" style="background:${meta.accentBg}; color:${meta.tagColor}; border: 1px solid ${meta.tagColor};">
            ${meta.category}
          </span>
        </div>

        ${matchCount === 0 ? `
          <div class="track-result-empty">
            <span style="font-size:11px; color:var(--text-muted);">No races recorded yet on this course</span>
            <button type="button" class="btn-track-action" onclick="selectTrackForNewRace('${trackId}')">
              🏁 Race on Course ➔
            </button>
          </div>
        ` : `
          <div class="track-result-winner-box">
            <div style="font-size:10px; font-weight:800; color:#b45309; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px;">
              🥇 Course Winner
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              ${winner?.uma ? `
                <img src="${winnerUmaImg}" alt="${winner.uma}" class="track-winner-avatar" onerror="this.style.display='none'">
              ` : ''}
              <div style="min-width:0; flex:1;">
                <div style="font-weight:800; font-size:13px; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  ${winner?.uma || 'Unassigned Uma'}
                </div>
                <div style="font-size:11px; color:var(--text-muted); display:flex; align-items:center; gap:6px;">
                  <span>👤 ${winner?.player || 'Player'}</span>
                  <span class="team-tag ${winner?.team}" style="font-size:9px; padding:1px 5px;">${teams[winner?.team]?.name || winner?.team}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="track-result-points-mini">
            <div class="track-team-pt-pill red">🔴 Red: <b>${data.teamPoints.red}p</b> (${data.wins.red}W)</div>
            <div class="track-team-pt-pill blue">🔵 Blue: <b>${data.teamPoints.blue}p</b> (${data.wins.blue}W)</div>
            <div class="track-team-pt-pill yellow">🟡 Yellow: <b>${data.teamPoints.yellow}p</b> (${data.wins.yellow}W)</div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; padding-top:6px; border-top:1px dashed #ebdcc5;">
            <span style="font-size:10px; font-weight:700; color:var(--text-muted); font-family:'JetBrains Mono',monospace;">
              🏁 ${matchCount} ${matchCount === 1 ? 'Race' : 'Races'}
            </span>
            <button type="button" class="btn-filter-track-history" onclick="setMatchHistoryTrackFilter('${trackId}')">
              🔍 View Races
            </button>
          </div>
        `}
      </div>
    `;
  }).join('');
}

function renderTrackPointsMatrix(trackStats) {
  const container = document.getElementById('track-points-matrix-container');
  if (!container) return;

  const tracks = DEFAULT_TRACKS;

  container.innerHTML = `
    <table class="scoring-player-table track-matrix-table">
      <thead>
        <tr>
          <th>Team</th>
          ${tracks.map(t => `
            <th style="text-align:center;">
              ${t.icon} ${t.name}<br>
              <span style="font-size:10px; font-weight:normal; text-transform:none; color:var(--text-muted);">${t.category} • ${t.distance}</span>
            </th>
          `).join('')}
          <th style="text-align:right;">Total Course Pts</th>
        </tr>
      </thead>
      <tbody>
        ${TEAM_KEYS.map(tKey => {
          const tName = teams[tKey]?.name || tKey;
          let totalCoursePts = 0;

          const cells = tracks.map(t => {
            const stat = trackStats[t.id];
            const pts = stat?.teamPoints[tKey] || 0;
            const wins = stat?.wins[tKey] || 0;
            totalCoursePts += pts;

            const redPts = stat?.teamPoints.red || 0;
            const bluePts = stat?.teamPoints.blue || 0;
            const yellowPts = stat?.teamPoints.yellow || 0;
            const maxPts = Math.max(redPts, bluePts, yellowPts);
            const isLeading = maxPts > 0 && pts === maxPts;

            return `
              <td style="text-align:center; font-family:'JetBrains Mono',monospace; ${isLeading ? 'background:#fef9e7; font-weight:800;' : ''}">
                ${pts > 0 ? `
                  <span style="color:${isLeading ? '#b45309' : 'var(--text-main)'}; font-weight:800;">${isLeading ? '👑 ' : ''}${pts}p</span>
                  ${wins > 0 ? `<div style="font-size:10px; color:#059669; font-weight:700;">${wins} win</div>` : ''}
                ` : `<span style="color:var(--text-faint);">-</span>`}
              </td>
            `;
          }).join('');

          return `
            <tr>
              <td>
                <span class="team-tag ${tKey}" style="font-size:12px; font-weight:800;">● ${tName} Team</span>
              </td>
              ${cells}
              <td style="text-align:right; font-family:'JetBrains Mono',monospace; font-weight:800; font-size:14px; color:#b45309;">
                ${totalCoursePts} pts
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function renderMatchHistoryList(matches, trackStats) {
  const historyContainer = document.getElementById('match-history-list');
  const matchCountBadge = document.getElementById('match-count-badge');
  const filterTabsContainer = document.getElementById('match-history-track-filters');

  if (matchCountBadge) {
    matchCountBadge.textContent = `${matches.length} Races`;
  }

  if (filterTabsContainer) {
    const filterOptions = [
      { id: 'all', label: `All Tracks (${matches.length})` },
      ...DEFAULT_TRACKS.map(t => {
        const cnt = (trackStats[t.id]?.matches || []).length;
        return { id: t.id, label: `${t.icon} ${t.name} (${cnt})` };
      })
    ];
    if (trackStats['other'] && trackStats['other'].matches.length > 0) {
      filterOptions.push({ id: 'other', label: `🏁 Custom (${trackStats['other'].matches.length})` });
    }

    filterTabsContainer.innerHTML = filterOptions.map(opt => `
      <button type="button" class="track-filter-btn ${activeMatchHistoryTrackFilter === opt.id ? 'active' : ''}" onclick="setMatchHistoryTrackFilter('${opt.id}')">
        ${opt.label}
      </button>
    `).join('');
  }

  if (!historyContainer) return;

  const filteredMatches = activeMatchHistoryTrackFilter === 'all'
    ? matches
    : matches.filter(m => getMatchTrackId(m) === activeMatchHistoryTrackFilter);

  if (filteredMatches.length === 0) {
    historyContainer.innerHTML = `
      <div class="empty-history-box">
        <div style="font-size:28px; margin-bottom:8px;">🏁</div>
        <div style="font-weight:700; color:var(--text-main);">
          ${activeMatchHistoryTrackFilter === 'all' ? 'No race matches logged yet.' : 'No races logged for this course yet.'}
        </div>
        <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">
          ${activeMatchHistoryTrackFilter === 'all' ? 'Use the form to record 1st–5th placements and distribute points!' : 'Select this track in the form above to record race results!'}
        </div>
      </div>
    `;
    return;
  }

  const reversedMatches = [...filteredMatches].reverse();
  historyContainer.innerHTML = reversedMatches.map(m => {
    const tId = getMatchTrackId(m);
    const meta = getTrackDisplayMeta(tId);

    return `
      <div class="match-history-card">
        <div class="match-card-top">
          <div class="match-title-wrap">
            <span class="match-round-tag">RACE #${m.raceNumber}</span>
            <span class="match-track-pill" style="background:${meta.accentBg}; color:${meta.tagColor}; border:1px solid ${meta.tagColor};">
              ${meta.icon} ${meta.name} • ${meta.category}
            </span>
            <span class="match-title-text">${m.title}</span>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <span class="match-time-tag">⏱️ ${m.timestamp}</span>
            <button class="btn-delete-match" onclick="deleteMatch('${m.id}')" title="Delete Race Result">✕</button>
          </div>
        </div>

        <div class="match-placements-grid-5">
          ${PLACEMENTS.map(({ key: pos, label }) => {
            const data = m[pos];
            const pts = getPlacementPts(data, pos);
            const imgUrl = data?.uma && typeof getUmaImageUrl === 'function' ? getUmaImageUrl(data.uma) : '';

            return `
              <div class="match-placement-item ${pos}">
                <div class="placement-row-badge">${label} (+${pts} pts)</div>
                <div class="podium-team ${data?.team}">● ${teams[data?.team]?.name || data?.team}</div>
                <div class="podium-player">${data?.player ? '👤 ' + data.player : 'Unspecified'}</div>
                ${data?.uma ? `
                  <div class="podium-uma-row">
                    <img src="${imgUrl}" alt="${data.uma}" class="podium-uma-avatar" onerror="this.style.display='none'">
                    <span class="podium-uma" style="font-weight:700; font-size:11px;">${data.uma}</span>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}
