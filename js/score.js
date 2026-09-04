let matches = [];
let bonusPoints = { red: 0, blue: 0, yellow: 0 };

function calculateScoringStats() {
  const stats = {
    red: { points: bonusPoints.red || 0, wins: 0, seconds: 0, thirds: 0, fourths: 0, fifths: 0, totalRaces: 0 },
    blue: { points: bonusPoints.blue || 0, wins: 0, seconds: 0, thirds: 0, fourths: 0, fifths: 0, totalRaces: 0 },
    yellow: { points: bonusPoints.yellow || 0, wins: 0, seconds: 0, thirds: 0, fourths: 0, fifths: 0, totalRaces: 0 }
  };

  const playerStats = {};

  TEAM_KEYS.forEach(t => {
    const allMembers = [teams[t].cap, ...teams[t].players].filter(Boolean);
    allMembers.forEach(p => {
      playerStats[p] = { name: p, team: t, points: 0, wins: 0, top5: 0, races: 0 };
    });
  });

  const placements = [
    { key: 'first', statProp: 'wins' },
    { key: 'second', statProp: 'seconds' },
    { key: 'third', statProp: 'thirds' },
    { key: 'fourth', statProp: 'fourths' },
    { key: 'fifth', statProp: 'fifths' }
  ];

  matches.forEach(m => {
    const countedTeamsInMatch = new Set();

    placements.forEach(({ key, statProp }) => {
      const pData = m[key];
      if (pData && pData.team && stats[pData.team]) {
        const pts = Number(pData.pts) || 0;
        stats[pData.team].points += pts;
        stats[pData.team][statProp] += 1;
        countedTeamsInMatch.add(pData.team);

        if (pData.player) {
          if (!playerStats[pData.player]) {
            playerStats[pData.player] = { name: pData.player, team: pData.team, points: 0, wins: 0, top5: 0, races: 0 };
          }
          playerStats[pData.player].points += pts;
          if (key === 'first') playerStats[pData.player].wins += 1;
          playerStats[pData.player].top5 += 1;
          playerStats[pData.player].races += 1;
        }
      }
    });

    countedTeamsInMatch.forEach(t => {
      stats[t].totalRaces += 1;
    });
  });

  return { teamStats: stats, playerStats };
}

function adjustTeamPoints(teamKey, delta) {
  if (!bonusPoints[teamKey]) bonusPoints[teamKey] = 0;
  bonusPoints[teamKey] += delta;
  renderScoringTab();
  saveStateToStorage();
}

function recordRaceResult(e) {
  if (e) e.preventDefault();

  const raceTitle = document.getElementById('race-title-input')?.value.trim() || `Race ${matches.length + 1}`;
  
  const firstTeam = document.getElementById('race-first-team')?.value;
  const firstPlayer = document.getElementById('race-first-player')?.value || "";
  const firstUma = document.getElementById('race-first-uma')?.value || "";
  const firstPts = parseInt(document.getElementById('race-first-pts')?.value, 10) || 10;

  const secondTeam = document.getElementById('race-second-team')?.value;
  const secondPlayer = document.getElementById('race-second-player')?.value || "";
  const secondUma = document.getElementById('race-second-uma')?.value || "";
  const secondPts = parseInt(document.getElementById('race-second-pts')?.value, 10) || 7;

  const thirdTeam = document.getElementById('race-third-team')?.value;
  const thirdPlayer = document.getElementById('race-third-player')?.value || "";
  const thirdUma = document.getElementById('race-third-uma')?.value || "";
  const thirdPts = parseInt(document.getElementById('race-third-pts')?.value, 10) || 5;

  const fourthTeam = document.getElementById('race-fourth-team')?.value;
  const fourthPlayer = document.getElementById('race-fourth-player')?.value || "";
  const fourthUma = document.getElementById('race-fourth-uma')?.value || "";
  const fourthPts = parseInt(document.getElementById('race-fourth-pts')?.value, 10) || 3;

  const fifthTeam = document.getElementById('race-fifth-team')?.value;
  const fifthPlayer = document.getElementById('race-fifth-player')?.value || "";
  const fifthUma = document.getElementById('race-fifth-uma')?.value || "";
  const fifthPts = parseInt(document.getElementById('race-fifth-pts')?.value, 10) || 1;

  if (!firstTeam || !secondTeam || !thirdTeam || !fourthTeam || !fifthTeam) {
    alert("Please select the teams for all 1st to 5th placements.");
    return;
  }

  const newMatch = {
    id: 'match_' + Date.now(),
    raceNumber: matches.length + 1,
    title: raceTitle,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    first: { team: firstTeam, player: firstPlayer, uma: firstUma, pts: firstPts },
    second: { team: secondTeam, player: secondPlayer, uma: secondUma, pts: secondPts },
    third: { team: thirdTeam, player: thirdPlayer, uma: thirdUma, pts: thirdPts },
    fourth: { team: fourthTeam, player: fourthPlayer, uma: fourthUma, pts: fourthPts },
    fifth: { team: fifthTeam, player: fifthPlayer, uma: fifthUma, pts: fifthPts }
  };

  matches.push(newMatch);

  if (document.getElementById('race-title-input')) {
    document.getElementById('race-title-input').value = `Race ${matches.length + 1}`;
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
  html += `<option value="${cap}">👑 ${cap} (Captain)</option>`;
  players.forEach((p, i) => {
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

  if (!teamSelect || !playerSelect || !umaSelect) return;

  const chosenTeam = teamSelect.value;
  if (chosenTeam) {
    populateTeamMemberSelect(chosenTeam, playerSelect);
    populateTeamUmaSelect(chosenTeam, umaSelect);
  } else {
    playerSelect.innerHTML = `<option value="">-- Select Player --</option>`;
    umaSelect.innerHTML = `<option value="">-- Select Uma --</option>`;
  }
}

function renderScoringTab() {
  const { teamStats, playerStats } = calculateScoringStats();

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
      const capName = teams[t].cap || `Captain ${teams[t].name}`;
      return `
        <div class="score-team-card ${t} ${rankClasses[idx]}">
          <div class="score-card-header">
            <div class="score-rank-badge">${medals[idx]} ${rankLabels[idx]}</div>
            <span class="score-team-name ${t}">● ${teams[t].name} Team</span>
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
    }
  });

  const historyContainer = document.getElementById('match-history-list');
  const matchCountBadge = document.getElementById('match-count-badge');
  if (matchCountBadge) matchCountBadge.textContent = `${matches.length} Races`;

  if (historyContainer) {
    if (matches.length === 0) {
      historyContainer.innerHTML = `
        <div class="empty-history-box">
          <div style="font-size:28px; margin-bottom:8px;">🏁</div>
          <div style="font-weight:700; color:var(--text-main);">No race matches logged yet.</div>
          <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">Use the form to record 1st–5th placements and distribute points!</div>
        </div>
      `;
    } else {
      const reversedMatches = [...matches].reverse();
      historyContainer.innerHTML = reversedMatches.map(m => `
        <div class="match-history-card">
          <div class="match-card-top">
            <div class="match-title-wrap">
              <span class="match-round-tag">RACE #${m.raceNumber}</span>
              <span class="match-title-text">${m.title}</span>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="match-time-tag">⏱️ ${m.timestamp}</span>
              <button class="btn-delete-match" onclick="deleteMatch('${m.id}')" title="Delete Race Result">✕</button>
            </div>
          </div>

          <div class="match-placements-grid-5">
            <div class="match-placement-item first">
              <div class="placement-row-badge">🥇 1st (+${m.first?.pts || 10} pts)</div>
              <div class="podium-team ${m.first?.team}">● ${teams[m.first?.team]?.name || m.first?.team}</div>
              <div class="podium-player">${m.first?.player ? '👤 ' + m.first.player : 'Unspecified'}</div>
              <div class="podium-uma">${m.first?.uma ? '🏇 ' + m.first.uma : ''}</div>
            </div>

            <div class="match-placement-item second">
              <div class="placement-row-badge">🥈 2nd (+${m.second?.pts || 7} pts)</div>
              <div class="podium-team ${m.second?.team}">● ${teams[m.second?.team]?.name || m.second?.team}</div>
              <div class="podium-player">${m.second?.player ? '👤 ' + m.second.player : 'Unspecified'}</div>
              <div class="podium-uma">${m.second?.uma ? '🏇 ' + m.second.uma : ''}</div>
            </div>

            <div class="match-placement-item third">
              <div class="placement-row-badge">🥉 3rd (+${m.third?.pts || 5} pts)</div>
              <div class="podium-team ${m.third?.team}">● ${teams[m.third?.team]?.name || m.third?.team}</div>
              <div class="podium-player">${m.third?.player ? '👤 ' + m.third.player : 'Unspecified'}</div>
              <div class="podium-uma">${m.third?.uma ? '🏇 ' + m.third.uma : ''}</div>
            </div>

            <div class="match-placement-item fourth">
              <div class="placement-row-badge">🎖️ 4th (+${m.fourth?.pts || 3} pts)</div>
              <div class="podium-team ${m.fourth?.team}">● ${teams[m.fourth?.team]?.name || m.fourth?.team}</div>
              <div class="podium-player">${m.fourth?.player ? '👤 ' + m.fourth.player : 'Unspecified'}</div>
              <div class="podium-uma">${m.fourth?.uma ? '🏇 ' + m.fourth.uma : ''}</div>
            </div>

            <div class="match-placement-item fifth">
              <div class="placement-row-badge">🎖️ 5th (+${m.fifth?.pts || 1} pts)</div>
              <div class="podium-team ${m.fifth?.team}">● ${teams[m.fifth?.team]?.name || m.fifth?.team}</div>
              <div class="podium-player">${m.fifth?.player ? '👤 ' + m.fifth.player : 'Unspecified'}</div>
              <div class="podium-uma">${m.fifth?.uma ? '🏇 ' + m.fifth.uma : ''}</div>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  const playerRosterTable = document.getElementById('player-leaderboard-body');
  if (playerRosterTable) {
    const sortedPlayers = Object.values(playerStats).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.top5 - a.top5;
    });

    if (sortedPlayers.length === 0) {
      playerRosterTable.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--text-muted);">No player data available. Complete the snake draft first.</td></tr>`;
    } else {
      playerRosterTable.innerHTML = sortedPlayers.map((p, idx) => `
        <tr>
          <td style="font-family:'JetBrains Mono',monospace; font-weight:700; width:40px;">${idx === 0 ? '👑 1' : idx + 1}</td>
          <td style="font-weight:700; color:var(--text-main);">${p.name}</td>
          <td><span class="team-tag ${p.team}" style="font-size:11px;">● ${teams[p.team]?.name || p.team}</span></td>
          <td style="font-family:'JetBrains Mono',monospace; font-weight:700; text-align:center;">${p.wins}</td>
          <td style="font-family:'JetBrains Mono',monospace; font-weight:700; text-align:center;">${p.top5}</td>
          <td style="font-family:'JetBrains Mono',monospace; font-weight:800; text-align:right; color:var(--text-main); font-size:14px;">${p.points} pts</td>
        </tr>
      `).join('');
    }
  }
}
