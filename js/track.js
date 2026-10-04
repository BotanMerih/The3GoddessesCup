function getTrackMeta(trackId) {
  return DEFAULT_TRACKS.find(t => t.id === trackId) || null;
}

function getTrackState(trackId) {
  return tracksState.tracks.find(t => t.id === trackId) || null;
}

function setTrackActiveTeam(teamKey) {
  if (!TEAM_KEYS.includes(teamKey)) return;
  tracksState.activeTeam = teamKey;
  renderTracksUI();
  saveStateToStorage();
}

function banTrack(trackId, teamKey = null) {
  const tKey = teamKey || tracksState.activeTeam || 'red';
  const track = getTrackState(trackId);
  const meta = getTrackMeta(trackId);
  if (!track || !meta) return;

  if (track.status !== 'available') {
    alert(`This track is already ${track.status === 'banned' ? 'banned' : 'picked'}!`);
    return;
  }

  tracksState.history.push({
    action: 'ban',
    trackId,
    prevStatus: track.status,
    prevTeam: track.team,
    prevOrder: track.order,
    team: tKey
  });

  track.status = 'banned';
  track.team = tKey;
  track.order = null;

  playBeep(220, 'sawtooth', 0.18);

  renderTracksUI();
  saveStateToStorage();
}

function pickTrack(trackId, teamKey = null) {
  const tKey = teamKey || tracksState.activeTeam || 'red';
  const track = getTrackState(trackId);
  const meta = getTrackMeta(trackId);
  if (!track || !meta) return;

  if (track.status !== 'available') {
    alert(`This track is already ${track.status === 'banned' ? 'banned' : 'picked'}!`);
    return;
  }

  const pickedCount = tracksState.tracks.filter(t => t.status === 'picked').length;

  tracksState.history.push({
    action: 'pick',
    trackId,
    prevStatus: track.status,
    prevTeam: track.team,
    prevOrder: track.order,
    team: tKey,
    order: pickedCount + 1
  });

  track.status = 'picked';
  track.team = tKey;
  track.order = pickedCount + 1;

  playCoinSound();

  renderTracksUI();
  saveStateToStorage();
}

function resetTrack(trackId) {
  const track = getTrackState(trackId);
  if (!track) return;

  tracksState.history.push({
    action: 'reset_single',
    trackId,
    prevStatus: track.status,
    prevTeam: track.team,
    prevOrder: track.order
  });

  track.status = 'available';
  track.team = null;
  track.order = null;

  reindexPickedTracks();

  playBeep(400, 'sine', 0.1);
  renderTracksUI();
  saveStateToStorage();
}

function reindexPickedTracks() {
  const picked = tracksState.tracks.filter(t => t.status === 'picked');
  picked.sort((a, b) => (a.order || 0) - (b.order || 0));
  picked.forEach((t, idx) => {
    t.order = idx + 1;
  });
}

function undoTrackAction() {
  if (tracksState.history.length === 0) {
    alert("No track actions to undo.");
    return;
  }

  const last = tracksState.history.pop();
  const track = getTrackState(last.trackId);
  if (track) {
    track.status = last.prevStatus;
    track.team = last.prevTeam;
    track.order = last.prevOrder;
    reindexPickedTracks();
  }

  playBeep(350, 'triangle', 0.12);
  renderTracksUI();
  saveStateToStorage();
}

function resetAllTracks() {
  if (!confirm("Are you sure you want to reset all track bans and picks?")) return;

  tracksState.tracks.forEach(t => {
    t.status = 'available';
    t.team = null;
    t.order = null;
  });
  tracksState.history = [];

  playBeep(300, 'triangle', 0.15);
  renderTracksUI();
  saveStateToStorage();
}

function renderTracksUI() {
  const cardsContainer = document.getElementById('track-cards-grid');
  const pickedListEl = document.getElementById('picked-tracks-list');
  const bannedListEl = document.getElementById('banned-tracks-list');
  const activeHintEl = document.getElementById('track-active-team-hint');

  TEAM_KEYS.forEach(t => {
    const btn = document.getElementById(`track-team-btn-${t}`);
    if (btn) {
      if (t === tracksState.activeTeam) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });

  if (activeHintEl) {
    const teamName = teams[tracksState.activeTeam]?.name || tracksState.activeTeam;
    activeHintEl.innerHTML = `Active Decider: <b style="color:var(--team-${tracksState.activeTeam})">${teamName} Team</b>`;
  }

  if (cardsContainer) {
    cardsContainer.innerHTML = DEFAULT_TRACKS.map(meta => {
      const state = getTrackState(meta.id);
      const status = state ? state.status : 'available';
      const team = state ? state.team : null;
      const order = state ? state.order : null;

      let cardClass = `track-card ${status}`;
      if (team) cardClass += ` team-${team}`;

      let statusBadge = '';
      let actionButtons = '';

      if (status === 'available') {
        statusBadge = `<span class="track-status-pill available">AVAILABLE</span>`;
        actionButtons = `
          <button onclick="banTrack('${meta.id}')" class="btn-track-action ban" title="Ban this track">
            🚫 Ban
          </button>
          <button onclick="pickTrack('${meta.id}')" class="btn-track-action pick" title="Pick this track">
            ✅ Pick
          </button>
        `;
      } else if (status === 'banned') {
        const teamObj = teams[team];
        statusBadge = `<span class="track-status-pill banned">🚫 BANNED • ${teamObj?.name || team}</span>`;
        actionButtons = `
          <div class="track-locked-info banned">
            <span>Banned by ${teamObj?.name || team} Team</span>
            <button onclick="resetTrack('${meta.id}')" class="btn-track-undo" title="Remove ban">
              ↩️ Cancel
            </button>
          </div>
        `;
      } else if (status === 'picked') {
        const teamObj = teams[team];
        statusBadge = `<span class="track-status-pill picked">🏁 RACE ${order} • PICKED</span>`;
        actionButtons = `
          <div class="track-locked-info picked">
            <span>Scheduled as Race ${order} (${teamObj?.name || team})</span>
            <button onclick="resetTrack('${meta.id}')" class="btn-track-undo" title="Remove pick">
              ↩️ Cancel
            </button>
          </div>
        `;
      }

      return `
        <div class="${cardClass}">
          <div class="track-card-header">
            <div class="track-icon-badge" style="background:${meta.accentBg}; border-color:${meta.tagColor}; color:${meta.tagColor}">
              ${meta.icon}
            </div>
            <div class="track-header-meta">
              <span class="track-category-tag" style="background:${meta.accentBg}; color:${meta.tagColor}; border:1px solid ${meta.tagColor}">
                ${meta.category.toUpperCase()} • ${meta.distance}
              </span>
              ${statusBadge}
            </div>
          </div>

          <div class="track-title-wrap">
            <h3 class="track-title">${meta.name}</h3>
            <div class="track-distance-pill">
              <span>🏟️ ${meta.surface}</span>
              <span>🔄 ${meta.turn}</span>
            </div>
          </div>

          <p class="track-desc">${meta.desc}</p>

          <div class="track-actions-bar">
            ${actionButtons}
          </div>
        </div>
      `;
    }).join('');
  }

  const pickedTracks = tracksState.tracks.filter(t => t.status === 'picked');
  pickedTracks.sort((a, b) => (a.order || 0) - (b.order || 0));

  if (pickedListEl) {
    if (pickedTracks.length === 0) {
      pickedListEl.innerHTML = `
        <div class="track-summary-empty">
          <span>🏁</span>
          <p>No tracks picked yet. Click <b>'Pick'</b> on track cards to schedule races.</p>
        </div>
      `;
    } else {
      pickedListEl.innerHTML = pickedTracks.map(t => {
        const meta = getTrackMeta(t.id);
        const teamObj = teams[t.team];
        return `
          <div class="picked-track-item">
            <div class="picked-track-left">
              <span class="race-order-badge">Race ${t.order}</span>
              <div class="picked-track-info">
                <span class="picked-track-name">${meta.name}</span>
                <span class="picked-track-sub">${meta.category} • ${meta.distance} • ${meta.surface}</span>
              </div>
            </div>
            <div class="picked-track-right">
              <span class="team-badge-pill ${t.team}">Picked by: ${teamObj?.name || t.team}</span>
              <button onclick="resetTrack('${t.id}')" class="btn-mini-cancel" title="Release track">✕</button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  const bannedTracks = tracksState.tracks.filter(t => t.status === 'banned');
  if (bannedListEl) {
    if (bannedTracks.length === 0) {
      bannedListEl.innerHTML = `
        <div class="track-summary-empty small">
          <p>No tracks banned yet.</p>
        </div>
      `;
    } else {
      bannedListEl.innerHTML = bannedTracks.map(t => {
        const meta = getTrackMeta(t.id);
        const teamObj = teams[t.team];
        return `
          <div class="banned-track-item">
            <div class="banned-track-left">
              <span class="ban-icon-cross">🚫</span>
              <span class="banned-track-name">${meta.name}</span>
              <span class="banned-track-cat">(${meta.category})</span>
            </div>
            <div class="banned-track-right">
              <span class="team-badge-pill ${t.team}">Banned by: ${teamObj?.name || t.team}</span>
              <button onclick="resetTrack('${t.id}')" class="btn-mini-cancel" title="Remove ban">✕</button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  updateQuickTrackChips();
}

function getPickedTournamentTracks() {
  const picked = tracksState.tracks.filter(t => t.status === 'picked');
  picked.sort((a, b) => (a.order || 0) - (b.order || 0));
  return picked.map(t => {
    const meta = getTrackMeta(t.id);
    return {
      order: t.order,
      trackId: t.id,
      name: meta?.name || t.id,
      category: meta?.category || '',
      distance: meta?.distance || '',
      label: `Race ${t.order} - ${meta?.name || t.id} (${meta?.category || ''})`
    };
  });
}

function autofillRaceTrack(title, trackId = null) {
  const input = document.getElementById('race-title-input');
  if (input) {
    input.value = title;
    input.focus();
    playBeep(600, 'sine', 0.08);
  }
  if (trackId && document.getElementById('race-track-select')) {
    document.getElementById('race-track-select').value = trackId;
  }
}

function updateQuickTrackChips() {
  const container = document.getElementById('quick-track-chips-container');
  if (!container) return;

  const pickedTracks = getPickedTournamentTracks();
  if (pickedTracks.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = pickedTracks.map(t => {
    return `
      <button type="button" class="quick-track-chip" onclick="autofillRaceTrack('${t.label}', '${t.trackId}')" title="Set race title to '${t.label}'">
        🏁 ${t.name}
      </button>
    `;
  }).join('');
}
