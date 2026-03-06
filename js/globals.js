// js/globals.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const uiLayer = document.getElementById('uiLayer');
const mainMenu = document.getElementById('mainMenu');
const statusText = document.getElementById('statusText');
const joinIdInput = document.getElementById('joinIdInput');

let isHost = true;
let isMultiplayer = false;
let peer = null;
let connection = null;

let gameActive = false;
let score = 0;
let frameCount = 0;
let isBossActive = false;
let waveCount = 1;

let myPlayerId = 'p1'; 
let otherPlayerId = 'p2';
let selectedShipType = 1;
let selectedWeaponType = 1;

let isDrafting = false;
let draftChoices = [];
let draftPicks = { p1: null, p2: null };

let players = {}; 
let allBullets = []; 
let enemyBullets = [];
let enemies = [];
let items = [];
let particles = [];
let stars = [];
let animationId;
let enemyIdCounter = 0;
let itemIdCounter = 0;

const keys = {};
window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

const BUFFS = [
    { id: 0, title: "MAX HP UP", desc: "+50 Max HP and restores 50 HP.", icon: "💖" },
    { id: 1, title: "SPEED UP", desc: "+1.5 Move Speed.", icon: "⚡" },
    { id: 2, title: "FIRE RATE UP", desc: "Shoot faster (-1 frame delay).", icon: "🔥" },
    { id: 3, title: "DAMAGE UP", desc: "+5 Damage to all bullets.", icon: "⚔️" },
    { id: 4, title: "FULL HEAL", desc: "Restore HP to 100%.", icon: "💊" },
    { id: 5, title: "TRIPLE SHOT", desc: "Adds +1 Weapon Level instantly.", icon: "🚀" },
    { id: 6, title: "BULLET SIZE UP", desc: "+2 Bullet Hitbox.", icon: "🟢" },
    { id: 7, title: "VAMPIRISM", desc: "5% chance to heal +1 HP on hit.", icon: "🦇" },
    { id: 8, title: "SHIELD", desc: "Ignore next 1 hit per wave.", icon: "🛡️" },
    { id: 9, title: "GREED", desc: "x2 Score from kills.", icon: "💰" },
    { id: 10, title: "ITEM DROP UP", desc: "+10% Item drop chance.", icon: "🎁" },
    { id: 11, title: "PIERCING", desc: "25% chance for bullets to pierce.", icon: "☄️" },
];

let networkEvents = [];
function pushEvent(type, data) {
    if(!isHost) return;
    networkEvents.push({ type, ...data });
}
