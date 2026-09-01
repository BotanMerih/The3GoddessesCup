// ==========================================
// 1. UMA POOLS DATA (3 POTS - 102 UMAS)
// ==========================================
const POT_1 = [
  "Haru Urara", "Matikanetannhauser", "Vodka", "Mayano Top Gun", "Air Groove",
  "Sakura Bakushin O", "Super Creek", "Grass Wonder", "King Halo", "Nice Nature",
  "Daiwa Scarlet", "Mejiro Ryan", "Gold Ship", "Matikanefukukitaru", "Agnes Tachyon",
  "El Condor Pasa", "Winning Ticket"
];

const POT_2 = [
  "Oguri Cap", "Admire Vega", "Yaeno Muteki", "Manhattan Cafe", "Bamboo Memory",
  "Symboli Rudolf", "Mejiro Ardan", "Kitasan Black", "Kawakami Princess", "Fine Motion",
  "Inari One", "Yamanin Zephyr", "Mejiro McQueen", "Silence Suzuka", "Fuji Kiseki",
  "Gold City", "Mejiro Palmer", "Biwa Hayaide", "Meisho Doto", "Agnes Digital",
  "Copano Rickey", "Sakura Chiyono O", "Eishin Flash", "Mejiro Dober", "Narita Taishin",
  "Narita Brian", "Sweep Tosho", "TM Opera O", "Seiun Sky", "Aston Machan",
  "Curren Chan", "Mihono Bourbon", "Nishino Flower", "Taiki Shuttle", "Yukino Bijin",
  "Rice Shower", "Ines Fujin", "Smart Falcon", "Nakayama Festa", "Hishi Amazon",
  "Tamamo Cross", "Satono Diamond", "Air Shakur", "Tosen Jordan", "Seeking the Pearl",
  "Mejiro Bright", "Maruzensky", "Hishi Akebono", "Tokai Teio", "Special Week"
];

const POT_3 = [
  "Smart Falcon (Grand Concert)", "Special Week (Commander)", "Mejiro McQueen (Anime)",
  "Tamamo Cross (Festival)", "Symboli Rudolf (Festival)", "Taiki Shuttle (Camping)",
  "Fuji Kiseki (Ballroom)", "Narita Taishin (Steampunk)", "Mejiro Dober (Camping)",
  "Seiun Sky (Ballroom)", "Rice Shower (Halloween)", "Mayano Top Gun (Wedding)",
  "Matikanefukukitaru (Full Armor)", "Meisho Doto (Halloween)", "Curren Chan (Wedding)",
  "Gold City (Festival)", "Fine Motion (Wedding)", "Inari One (Festival)",
  "El Condor Pasa (Fantasy)", "Eishin Flash (Valentine)", "Maruzensky (Summer)",
  "Super Creek (Halloween)", "Grass Wonder (Fantasy)", "TM Opera O (New Year)",
  "Air Groove (Wedding)", "Mejiro McQueen (Summer)", "Special Week (Summer)",
  "Agnes Digital (Halloween)", "Winning Ticket (Steampunk)", "Biwa Hayahide (Christmas)",
  "Nice Nature (Cheerleader)", "Gold Ship (Summer)", "Haru Urara (New Year)",
  "Tokai Teio (Anime)", "King Halo (Cheerleader)"
];

const UMA_POT_MAP = {};
POT_1.forEach(u => UMA_POT_MAP[u] = 1);
POT_2.forEach(u => UMA_POT_MAP[u] = 2);
POT_3.forEach(u => UMA_POT_MAP[u] = 3);

const TEAM_KEYS = ['red', 'blue', 'yellow'];
const TOTAL_INITIAL_UMAS = POT_1.length + POT_2.length + POT_3.length;
const STORAGE_KEY = 'UMA_3GODDESSES_DATA_V2';

// Global tournament state
let teams = {
  red:    { name: "Red",    cap: "Captain Red",    players: [], umas: [] },
  blue:   { name: "Blue",   cap: "Captain Blue",   players: [], umas: [] },
  yellow: { name: "Yellow", cap: "Captain Yellow", players: [], umas: [] }
};

let availablePot1 = [...POT_1];
let availablePot2 = [...POT_2];
let availablePot3 = [...POT_3];

let playerPool = [];
let snakeDraftOrder = [];
let currentPickIndex = 0;
let pickHistory = [];

let selectedDrawTeam = 'red';
let currentTab = 1;

let isSequentialRunning = false;
let sequentialTimer = null;
let sequentialSpeed = 220;
let currentRoundRobinIndex = 0;

// Draft Timer State
let turnDuration = 60; // seconds (0 = off)
let turnTimeRemaining = 60;
let draftTimerInterval = null;
let isDraftTimerPaused = false;
