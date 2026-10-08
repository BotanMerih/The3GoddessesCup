const ALL_UMAS = [
  "Satono Diamond (New Year)",
  "Kitasan Black (New Year)",
  "Narita Brian (BLAZE)",
  "Zenno Rob Roy",
  "Vodka (Christmas)",
  "Daiwa Scarlet (Christmas)",
  "Wonder Acute",
  "Nakayama Festa",
  "Tamamo Cross (Festival)",
  "Inari One (Festival)",
  "Yamanin Zephyr",
  "Aston Machan",
  "Agnes Digital (Halloween)",
  "Meisho Doto (Halloween)",
  "Seeking the Pearl",
  "Yukino Bijin",
  "Winning Ticket (Steampunk)",
  "Narita Taishin (Steampunk)",
  "Smart Falcon (Grand Concert)",
  "Copano Rickey",
  "Bamboo Memory",
  "Gold Ship (Summer)",
  "Mejiro McQueen (Summer)",
  "Special Week (Commander)",
  "Air Shakur",
  "Taiki Shuttle (Camping)",
  "Mejiro Dober (Camping)",
  "Sweep Tosho",
  "Inari One",
  "Fine Motion (Wedding)",
  "Curren Chan (Wedding)",
  "Mejiro Palmer",
  "Ines Fujin",
  "Nice Nature (Cheerleader)",
  "King Halo (Cheerleader)",
  "Yaeno Muteki",
  "Nishino Flower",
  "Fuji Kiseki (Ballroom)",
  "Seiun Sky (Ballroom)",
  "Mejiro Bright",
  "Satono Diamond",
  "Kitasan Black",
  "Admire Vega",
  "Mejiro Ardan",
  "Mihono Bourbon (Valentine)",
  "Eishin Flash (Valentine)",
  "Sakura Chiyono O",
  "TM Opera O (New Year)",
  "Haru Urara (New Year)",
  "Tamamo Cross",
  "Fine Motion",
  "Oguri Cap (Christmas)",
  "Biwa Hayahide (Christmas)",
  "Mejiro Dober",
  "Tosen Jordan",
  "Symboli Rudolf (Festival)",
  "Gold City (Festival)",
  "Manhattan Cafe",
  "Kawakami Princess",
  "Rice Shower (Halloween)",
  "Super Creek (Halloween)",
  "Agnes Digital",
  "Hishi Akebono",
  "Matikanefukukitaru (Full Armor)",
  "Eishin Flash",
  "Meisho Doto",
  "Special Week (Summer)",
  "Maruzensky (Summer)",
  "Gold City",
  "Fuji Kiseki",
  "Grass Wonder (Fantasy)",
  "El Condor Pasa (Fantasy)",
  "Hishi Amazon",
  "Seiun Sky",
  "Air Groove (Wedding)",
  "Mayano Top Gun (Wedding)",
  "Narita Brian",
  "Smart Falcon",
  "Narita Taishin",
  "Curren Chan",
  "Tokai Teio (Anime Collab)",
  "Mejiro McQueen (Anime Collab)",
  "Biwa Hayahide",
  "Mihono Bourbon",
  "Special Week",
  "Silence Suzuka",
  "Tokai Teio",
  "Maruzensky",
  "Oguri Cap",
  "Taiki Shuttle",
  "Mejiro McQueen",
  "TM Opera O",
  "Symboli Rudolf",
  "Rice Shower",
  "Matikanetannhauser",
  "Gold Ship",
  "Vodka",
  "Daiwa Scarlet",
  "Grass Wonder",
  "El Condor Pasa",
  "Air Groove",
  "Mayano Top Gun",
  "Super Creek",
  "Mejiro Ryan",
  "Agnes Tachyon",
  "Winning Ticket",
  "Sakura Bakushin O",
  "Haru Urara",
  "Matikanefukukitaru",
  "Nice Nature",
  "King Halo"
];

const POT_1 = [...ALL_UMAS];
const POT_2 = [];
const POT_3 = [];
const UMA_POT_MAP = {};
ALL_UMAS.forEach(u => UMA_POT_MAP[u] = 1);

const TEAM_MAX_BUDGET = 140;
// Every team must draft at least MIN_UMAS_PER_TEAM. MAX_UMAS_PER_TEAM is only a roster cap;
// it is not used in any budget or reserve calculation.
const MIN_UMAS_PER_TEAM = 9;
const MAX_UMAS_PER_TEAM = 18;
// Per-Uma price comes from js/uma_scores.js (rating-based, 5–24 🪙).
const MIN_UMA_PRICE = (typeof UMA_SCORE_META !== 'undefined' && UMA_SCORE_META.priceMin) || 5;
const FALLBACK_UMA_PRICE = (typeof UMA_SCORE_META !== 'undefined' && UMA_SCORE_META.unratedPrice) || 10;

function getUmaPrice(umaName) {
  const s = (typeof UMA_SCORES !== 'undefined') ? UMA_SCORES[umaName] : null;
  return s && typeof s.price === 'number' ? s.price : FALLBACK_UMA_PRICE;
}

function getUmaScore(umaName) {
  return (typeof UMA_SCORES !== 'undefined' && UMA_SCORES[umaName]) || null;
}

function getTeamSpent(teamKey) {
  const team = teams[teamKey];
  if (!team || !team.umas) return 0;
  return team.umas.reduce((sum, u) => sum + getUmaPrice(u), 0);
}

function getTeamBudget(teamKey) {
  if (!teams[teamKey]) return 0;
  return Math.max(0, TEAM_MAX_BUDGET - getTeamSpent(teamKey));
}

// Coins this team needs to reach MIN_UMAS_PER_TEAM after buying `umaName`, if it could take
// the cheapest Umas left in the pool (shown in messages).
function getRequiredReserve(teamKey, umaName) {
  const count = teams[teamKey]?.umas?.length || 0;
  const need = Math.max(0, MIN_UMAS_PER_TEAM - (count + 1));
  const owned = new Set(TEAM_KEYS.flatMap(t => teams[t]?.umas || []));
  const cheapest = ALL_UMAS.filter(u => u !== umaName && !owned.has(u)).map(getUmaPrice).sort((a, b) => a - b);
  return cheapest.slice(0, need).reduce((a, b) => a + b, 0);
}

// After `teamKey` buys `umaName`, can every team that still needs Umas reach MIN_UMAS_PER_TEAM?
// Greedy check: the tightest team (fewest coins per missing Uma) takes the cheapest remaining Umas,
// the next tightest takes the next cheapest, and so on. Blocks purchases that would strand either
// the buyer or another team below the minimum.
function isDraftStillFeasible(teamKey, umaName) {
  const owned = new Set(TEAM_KEYS.flatMap(t => teams[t]?.umas || []));
  const pool = ALL_UMAS.filter(u => u !== umaName && !owned.has(u)).map(getUmaPrice).sort((a, b) => a - b);
  const needs = TEAM_KEYS.map(t => {
    const count = (teams[t]?.umas?.length || 0) + (t === teamKey ? 1 : 0);
    const budget = getTeamBudget(t) - (t === teamKey ? getUmaPrice(umaName) : 0);
    return { need: Math.max(0, MIN_UMAS_PER_TEAM - count), budget };
  }).filter(x => x.need > 0);
  if (needs.some(x => x.budget < 0)) return false;
  needs.sort((a, b) => a.budget / a.need - b.budget / b.need);
  let i = 0;
  for (const x of needs) {
    const take = pool.slice(i, i + x.need);
    if (take.length < x.need) return false;
    if (take.reduce((a, b) => a + b, 0) > x.budget) return false;
    i += x.need;
  }
  return true;
}

// Can this team afford this Uma right now without breaking the 9-Uma minimum for anyone?
function canTeamAffordUma(teamKey, umaName) {
  if (!teams[teamKey]) return false;
  if (getTeamBudget(teamKey) < getUmaPrice(umaName)) return false;
  return isDraftStillFeasible(teamKey, umaName);
}

const POOL_PACKAGES = {
  A: { id: 'A', name: 'Package A', total: ALL_UMAS.length },
  B: { id: 'B', name: 'Package B', total: ALL_UMAS.length },
  C: { id: 'C', name: 'Package C', total: ALL_UMAS.length }
};

const TEAM_KEYS = ['red', 'blue', 'yellow'];
const TOTAL_INITIAL_UMAS = ALL_UMAS.length;
const STORAGE_KEY = 'UMA_3GODDESSES_DATA_V4';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const _initPkgs = shuffleArray(['A', 'B', 'C']);

// Tournament rosters: Team A = Red, Team B = Blue, Team C = Yellow.
const DEFAULT_FIXED_TEAMS = {
  red: {
    cap: "Captain Red",
    players: ["kishiyuyu", "nobody_cid", "botanmerih", "kei9445", "satohinalings", "torigoo", "casual", "nesnt", "shirakaminep"]
  },
  blue: {
    cap: "Captain Blue",
    players: ["soul.93", "rnob", "chqileaf", "himehime", ".swig", "alkopoligami", "vgricka", "mythlols", "patatamoltobella"]
  },
  yellow: {
    cap: "Captain Yellow",
    players: ["lucycdk", "matikanbenbeki03", "kingggg98", "ionnesxii", "andreadoria", "morton1247", "_cyrus29", "the_real_adocado", "potatosayo"]
  }
};

let teams = {
  red:    { name: "Red",    cap: DEFAULT_FIXED_TEAMS.red.cap,    budget: TEAM_MAX_BUDGET, package: _initPkgs[0], players: [...DEFAULT_FIXED_TEAMS.red.players],    umas: [], draftDone: false },
  blue:   { name: "Blue",   cap: DEFAULT_FIXED_TEAMS.blue.cap,   budget: TEAM_MAX_BUDGET, package: _initPkgs[1], players: [...DEFAULT_FIXED_TEAMS.blue.players],   umas: [], draftDone: false },
  yellow: { name: "Yellow", cap: DEFAULT_FIXED_TEAMS.yellow.cap, budget: TEAM_MAX_BUDGET, package: _initPkgs[2], players: [...DEFAULT_FIXED_TEAMS.yellow.players], umas: [], draftDone: false }
};

let availablePot1 = [...ALL_UMAS];
let availablePot2 = [];
let availablePot3 = [];

let playerPool = [];
let snakeDraftOrder = [];
let currentPickIndex = 0;
let pickHistory = [];

let matches = [];
let bonusPoints = { red: 0, blue: 0, yellow: 0 };

let selectedDrawTeam = 'red';
let currentTab = 1;

let isSequentialRunning = false;
let sequentialTimer = null;
let sequentialSpeed = 220;
let currentRoundRobinIndex = 0;

let turnDuration = 60;
let turnTimeRemaining = 60;
let draftTimerInterval = null;
let isDraftTimerPaused = false;

const DEFAULT_TRACKS = [
  {
    id: "chukyo-1200",
    name: "Chukyo 1200",
    category: "Sprint",
    distance: "1200m",
    surface: "Turf",
    turn: "Left Turn",
    icon: "⚡",
    tagColor: "#10b981",
    accentBg: "#ecfdf5",
    desc: "Chukyo • Short Distance (Sprint) • Turf • Left Turn • Spring · Rainy · Soft"
  },
  {
    id: "sapporo-1500",
    name: "Sapporo 1500",
    category: "Mile",
    distance: "1500m",
    surface: "Turf",
    turn: "Right Turn",
    icon: "🏃",
    tagColor: "#0284c7",
    accentBg: "#f0f9ff",
    desc: "Sapporo • Mile Distance • Turf • Right Turn • Summer · Sunny · Firm"
  },
  {
    id: "tokyo-2400",
    name: "Tokyo 2400",
    category: "Medium",
    distance: "2400m",
    surface: "Turf",
    turn: "Left Turn",
    icon: "👑",
    tagColor: "#7c3aed",
    accentBg: "#f5f3ff",
    desc: "Tokyo • Medium Distance • Turf (Japan Cup / Derby) • Left Turn • Fall · Cloudy · Firm"
  },
  {
    id: "kyoto-3000",
    name: "Kyoto 3000",
    category: "Long",
    distance: "3000m",
    surface: "Turf",
    turn: "Right Turn",
    icon: "🏔️",
    tagColor: "#f59e0b",
    accentBg: "#fffbeb",
    desc: "Kyoto • Long Distance • Turf • Right Turn • Winter · Cloudy · Firm"
  },
  {
    id: "morioka-1600",
    name: "Morioka 1600",
    category: "Dirt",
    distance: "1600m",
    surface: "Dirt",
    turn: "Left Turn",
    icon: "🏜️",
    tagColor: "#b45309",
    accentBg: "#fef3c7",
    desc: "Morioka (Oro Park) • Dirt • Mile Distance • Left Turn • Spring · Sunny · Firm"
  }
];

let tracksState = {
  activeTeam: 'red',
  tracks: DEFAULT_TRACKS.map(t => ({
    id: t.id,
    status: 'available',
    team: null,
    order: null
  })),
  history: []
};
