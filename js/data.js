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
  "Royce and Royce",
  "Tsurumaru Tsuyoshi",
  "Ikuno Dictus",
  "Biko Pegasus",
  "Matikanetannhauser",
  "Gold Ship",
  "Vodka",
  "Daiwa Scarlet",
  "Grass Wonder",
  "El Condor Pasa",
  "Air Groove",
  "Mayano Top Gun",
  "Super Creek",
  "Twin Turbo",
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

const TEAM_MAX_BUDGET = 120;
const UMA_PRICE = 10;
const MAX_UMAS_PER_TEAM = 12;

function getTeamBudget(teamKey) {
  const team = teams[teamKey];
  if (!team) return 0;
  const spent = (team.umas ? team.umas.length : 0) * UMA_PRICE;
  return Math.max(0, TEAM_MAX_BUDGET - spent);
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

const DEFAULT_FIXED_TEAMS = {
  red: {
    cap: "Captain Red",
    players: []
  },
  blue: {
    cap: "Captain Blue",
    players: []
  },
  yellow: {
    cap: "Captain Yellow",
    players: []
  }
};

let teams = {
  red:    { name: "Red",    cap: DEFAULT_FIXED_TEAMS.red.cap,    budget: 120, package: _initPkgs[0], players: [], umas: [] },
  blue:   { name: "Blue",   cap: DEFAULT_FIXED_TEAMS.blue.cap,   budget: 120, package: _initPkgs[1], players: [], umas: [] },
  yellow: { name: "Yellow", cap: DEFAULT_FIXED_TEAMS.yellow.cap, budget: 120, package: _initPkgs[2], players: [], umas: [] }
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
    desc: "Chukyo • Short Distance (Sprint) • Turf • Left Turn"
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
    desc: "Sapporo • Mile Distance • Turf • Right Turn"
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
    desc: "Tokyo • Medium Distance • Turf (Japan Cup / Derby) • Left Turn"
  },
  {
    id: "hakodate-2600",
    name: "Hakodate 2600",
    category: "Long",
    distance: "2600m",
    surface: "Turf",
    turn: "Right Turn",
    icon: "🏔️",
    tagColor: "#f59e0b",
    accentBg: "#fffbeb",
    desc: "Hakodate • Long Distance • Turf • Right Turn"
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
    desc: "Morioka (Oro Park) • Dirt • Mile Distance • Left Turn"
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
