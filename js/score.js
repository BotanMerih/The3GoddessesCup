let playerUmaAssignments = {};
let activeMatchHistoryTrackFilter = 'all';

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

function calculateScoringStats() {
  const stats = {
    red: { points: bonusPoints.red || 0, wins: 0, seconds: 0, thirds: 0, fourths: 0, fifths: 0, totalRaces: 0, podiums: 0 },
    blue: { points: bonusPoints.blue || 0, wins: 0, seconds: 0, thirds: 0, fourths: 0, fifths: 0, totalRaces: 0, podiums: 0 },
    yellow: { points: bonusPoints.yellow || 0, wins: 0, seconds: 0, thirds: 0, fourths: 0, fifths: 0, totalRaces: 0, podiums: 0 }
  };

  const playerStats = {};
  const umaStats = {};

  const trackStats = {};
  DEFAULT_TRACKS.forEach(dt => {
    trackStats[dt.id] = {
      meta: dt,
      matches: [],
      teamPoints: { red: 0, blue: 0, yellow: 0 },
      wins: { red: 0, blue: 0, yellow: 0 },
      podiums: { red: 0, blue: 0, yellow: 0 }
    };
  });
  trackStats['other'] = {
    meta: getTrackDisplayMeta('other'),
    matches: [],
    teamPoints: { red: 0, blue: 0, yellow: 0 },
    wins: { red: 0, blue: 0, yellow: 0 },
    podiums: { red: 0, blue: 0, yellow: 0 }
  };

  TEAM_KEYS.forEach(t => {
    const allMembers = Array.from(new Set([teams[t]?.cap, ...(teams[t]?.players || [])].filter(Boolean)));
    allMembers.forEach(p => {
      playerStats[p] = {
        name: p,
        team: t,
        assignedUma: getPlayerUma(p),
        points: 0,
        wins: 0,
        seconds: 0,
        thirds: 0,
        fourths: 0,
        fifths: 0,
        podiums: 0,
        top5: 0,
        races: 0
      };
    });
  });

  const placements = [
    { key: 'first', statProp: 'wins', pts: 10 },
    { key: 'second', statProp: 'seconds', pts: 7 },
    { key: 'third', statProp: 'thirds', pts: 5 },
    { key: 'fourth', statProp: 'fourths', pts: 3 },
    { key: 'fifth', statProp: 'fifths', pts: 1 }
  ];

  matches.forEach(m => {
    const countedTeamsInMatch = new Set();
    const tId = getMatchTrackId(m);

    if (!trackStats[tId]) {
      trackStats[tId] = {
        meta: getTrackDisplayMeta(tId),
        matches: [],
        teamPoints: { red: 0, blue: 0, yellow: 0 },
        wins: { red: 0, blue: 0, yellow: 0 },
        podiums: { red: 0, blue: 0, yellow: 0 }
      };
    }
    trackStats[tId].matches.push(m);
    if (m.first && m.first.team) {
      trackStats[tId].wins[m.first.team] = (trackStats[tId].wins[m.first.team] || 0) + 1;
    }

    placements.forEach(({ key, statProp, pts: defaultPts }) => {
      const pData = m[key];
      if (pData && pData.team && stats[pData.team]) {
        const pts = (pData.pts !== undefined && pData.pts !== null && pData.pts !== '') ? Number(pData.pts) : defaultPts;
        stats[pData.team].points += pts;
        stats[pData.team][statProp] += 1;
        if (key === 'first' || key === 'second' || key === 'third') {
          stats[pData.team].podiums += 1;
        }
        countedTeamsInMatch.add(pData.team);

        if (trackStats[tId]) {
          trackStats[tId].teamPoints[pData.team] = (trackStats[tId].teamPoints[pData.team] || 0) + pts;
          if (key === 'first' || key === 'second' || key === 'third') {
            trackStats[tId].podiums[pData.team] = (trackStats[tId].podiums[pData.team] || 0) + 1;
          }
        }

        if (pData.player) {
          if (!playerStats[pData.player]) {
            playerStats[pData.player] = {
              name: pData.player,
              team: pData.team,
              assignedUma: getPlayerUma(pData.player) || pData.uma || '',
              points: 0,
              wins: 0,
              seconds: 0,
              thirds: 0,
              fourths: 0,
              fifths: 0,
              podiums: 0,
              top5: 0,
              races: 0
            };
          }
          playerStats[pData.player].points += pts;
          playerStats[pData.player][statProp] += 1;
          playerStats[pData.player].top5 += 1;
          playerStats[pData.player].races += 1;
          if (key === 'first' || key === 'second' || key === 'third') {
            playerStats[pData.player].podiums += 1;
          }
          if (pData.uma && !playerStats[pData.player].assignedUma) {
            playerStats[pData.player].assignedUma = pData.uma;
          }
        }

        if (pData.uma) {
          if (!umaStats[pData.uma]) {
            umaStats[pData.uma] = {
              umaName: pData.uma,
              team: pData.team,
              player: pData.player || '',
              points: 0,
              wins: 0,
              top5: 0,
              races: 0
            };
          }
          umaStats[pData.uma].points += pts;
          if (key === 'first') umaStats[pData.uma].wins += 1;
          umaStats[pData.uma].top5 += 1;
          umaStats[pData.uma].races += 1;
          if (pData.player) umaStats[pData.uma].player = pData.player;
        }
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
  
  const firstTeam = document.getElementById('race-first-team')?.value;
  const firstPlayer = document.getElementById('race-first-player')?.value || "";
  const firstUma = document.getElementById('race-first-uma')?.value || "";
  const firstPts = parsePointInput('race-first-pts', 10);

  const secondTeam = document.getElementById('race-second-team')?.value;
  const secondPlayer = document.getElementById('race-second-player')?.value || "";
  const secondUma = document.getElementById('race-second-uma')?.value || "";
  const secondPts = parsePointInput('race-second-pts', 7);

  const thirdTeam = document.getElementById('race-third-team')?.value;
  const thirdPlayer = document.getElementById('race-third-player')?.value || "";
  const thirdUma = document.getElementById('race-third-uma')?.value || "";
  const thirdPts = parsePointInput('race-third-pts', 5);

  const fourthTeam = document.getElementById('race-fourth-team')?.value;
  const fourthPlayer = document.getElementById('race-fourth-player')?.value || "";
  const fourthUma = document.getElementById('race-fourth-uma')?.value || "";
  const fourthPts = parsePointInput('race-fourth-pts', 3);

  const fifthTeam = document.getElementById('race-fifth-team')?.value;
  const fifthPlayer = document.getElementById('race-fifth-player')?.value || "";
  const fifthUma = document.getElementById('race-fifth-uma')?.value || "";
  const fifthPts = parsePointInput('race-fifth-pts', 1);

  if (!firstTeam || !secondTeam || !thirdTeam || !fourthTeam || !fifthTeam) {
    alert("Please select the teams for all 1st to 5th placements.");
    return;
  }

  const newMatch = {
    id: 'match_' + Date.now(),
    raceNumber: matches.length + 1,
    trackId: raceTrack,
    title: raceTitle,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    first: { team: firstTeam, player: firstPlayer, uma: firstUma, pts: firstPts },
    second: { team: secondTeam, player: secondPlayer, uma: secondUma, pts: secondPts },
    third: { team: thirdTeam, player: thirdPlayer, uma: thirdUma, pts: thirdPts },
    fourth: { team: fourthTeam, player: fourthPlayer, uma: fourthUma, pts: fourthPts },
    fifth: { team: fifthTeam, player: fifthPlayer, uma: fifthUma, pts: fifthPts }
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
  matches = matches.filter(m => m.id !== matchId);
  matches.forEach((m, idx) => {
    m.raceNumber = idx + 1;
  });
  renderScoringTab();
  saveStateToStorage();
}

function resetTournamentScores() {
  if (!confirm("Are you sure you want to reset all match results and scores?")) return;
  matches = [];
  bonusPoints = { red: 0, blue: 0, yellow: 0 };
  if (document.getElementById('race-title-input')) {
    document.getElementById('race-title-input').value = "Race 1";
  }
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
            <div class="score-stat-box">
              <span class="stat-num">${st.wins}</span>
              <span class="stat-title">1st (10p)</span>
            </div>
            <div class="score-stat-box">
              <span class="stat-num">${st.seconds}</span>
              <span class="stat-title">2nd (7p)</span>
            </div>
            <div class="score-stat-box">
              <span class="stat-num">${st.thirds}</span>
              <span class="stat-title">3rd (5p)</span>
            </div>
            <div class="score-stat-box">
              <span class="stat-num">${st.fourths}</span>
              <span class="stat-title">4th (3p)</span>
            </div>
            <div class="score-stat-box">
              <span class="stat-num">${st.fifths}</span>
              <span class="stat-title">5th (1p)</span>
            </div>
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

  ['first', 'second', 'third', 'fourth', 'fifth'].forEach(p => {
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

  const playerRosterTable = document.getElementById('player-leaderboard-body');
  if (playerRosterTable) {
    const sortedPlayers = Object.values(playerStats).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.podiums - a.podiums;
    });

    if (sortedPlayers.length === 0) {
      playerRosterTable.innerHTML = `<tr><td colspan="12" style="text-align:center; padding:20px; color:var(--text-muted);">No player data found. Check team rosters in Tab 1.</td></tr>`;
    } else {
      playerRosterTable.innerHTML = sortedPlayers.map((p, idx) => {
        const pairedUma = p.assignedUma || getPlayerUma(p.name);
        const umaImg = pairedUma && typeof getUmaImageUrl === 'function' ? getUmaImageUrl(pairedUma) : '';
        const podiumPct = p.races > 0 ? Math.round((p.podiums / p.races) * 100) : 0;
        const isCap = (p.name === teams[p.team]?.cap);

        return `
          <tr>
            <td style="font-family:'JetBrains Mono',monospace; font-weight:700; width:45px;">${idx === 0 ? '👑 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : idx + 1}</td>
            <td style="font-weight:700; color:var(--text-main);">
              ${isCap ? '👑 ' : ''}${p.name}
            </td>
            <td>
              ${pairedUma ? `
                <div style="display:flex; align-items:center; gap:6px;">
                  <img src="${umaImg}" alt="${pairedUma}" class="uma-mini-thumb" onerror="this.style.display='none'">
                  <span style="font-weight:700; font-size:12px;">${pairedUma}</span>
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

  const mvpContainer = document.getElementById('uma-mvp-cards-container');
  if (mvpContainer) {
    const sortedUmas = Object.values(umaStats).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.wins - a.wins;
    }).slice(0, 5);

    if (sortedUmas.length === 0) {
      mvpContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding:18px; color:var(--text-muted); font-size:12px;">
          Record race matches to see the top performing Uma Musumes on this MVP board.
        </div>
      `;
    } else {
      mvpContainer.innerHTML = sortedUmas.map((u, idx) => {
        const img = typeof getUmaImageUrl === 'function' ? getUmaImageUrl(u.umaName) : '';
        const rankMedal = idx === 0 ? '👑 1st MVP' : idx === 1 ? '🥈 2nd' : idx === 2 ? '🥉 3rd' : `#${idx + 1}`;
        const teamObj = teams[u.team];
        const teamName = teamObj?.name || u.team;

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
          ${['first', 'second', 'third', 'fourth', 'fifth'].map(pos => {
            const data = m[pos];
            const pts = data?.pts !== undefined ? data.pts : (pos === 'first' ? 10 : pos === 'second' ? 7 : pos === 'third' ? 5 : pos === 'fourth' ? 3 : 1);
            const label = pos === 'first' ? '🥇 1st' : pos === 'second' ? '🥈 2nd' : pos === 'third' ? '🥉 3rd' : pos === 'fourth' ? '🎖️ 4th' : '🎖️ 5th';
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
