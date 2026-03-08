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

const MAPS = [
    { name: "Deep Space", color: { r: 5, g: 5, b: 8 }, starColor: { r: 255, g: 255, b: 255 } },
    { name: "Earth Orbit", color: { r: 2, g: 10, b: 25 }, starColor: { r: 170, g: 204, b: 255 } },
    { name: "Nebula Zone", color: { r: 15, g: 2, b: 20 }, starColor: { r: 255, g: 153, b: 255 } },
    { name: "Cyber Matrix", color: { r: 0, g: 10, b: 5 }, starColor: { r: 57, g: 255, b: 20 } },
    { name: "Blood Moon", color: { r: 20, g: 2, b: 2 }, starColor: { r: 255, g: 0, b: 60 } }
];
let currentMapIndex = 0;
let currentBgColor = { ...MAPS[0].color };
let currentStarColor = { ...MAPS[0].starColor };

let myPlayerId = 'p1'; 
let otherPlayerId = 'p2';
let selectedShipType = 1;
let selectedWeaponType = 1;
let selectedControlType = 'pc';

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
window.addEventListener('keydown', e => { 
    keys[e.key.toLowerCase()] = true; 
    if (e.code) keys[e.code.toLowerCase()] = true;
});
window.addEventListener('keyup', e => { 
    keys[e.key.toLowerCase()] = false; 
    if (e.code) keys[e.code.toLowerCase()] = false;
});

// Touch controls for mobile (Joystick + Button)
const mobileControls = document.getElementById('mobileControls');
const joystickBase = document.getElementById('joystickBase');
const joystickStick = document.getElementById('joystickStick');
const shootBtn = document.getElementById('shootBtn');

let joystickVector = { x: 0, y: 0 };
let isShooting = false;
let joystickActive = false;
let joystickCenter = { x: 0, y: 0 };
let joystickMaxRadius = 40;

joystickBase.addEventListener('touchstart', (e) => {
    e.preventDefault();
    joystickActive = true;
    let rect = joystickBase.getBoundingClientRect();
    joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    updateJoystick(e.touches[0]);
}, {passive: false});

joystickBase.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (joystickActive) updateJoystick(e.touches[0]);
}, {passive: false});

function updateJoystick(touch) {
    let scale = document.getElementById('gameContainer').getBoundingClientRect().width / 600;
    
    let dx = (touch.clientX - joystickCenter.x) / scale;
    let dy = (touch.clientY - joystickCenter.y) / scale;
    let distance = Math.hypot(dx, dy);
    
    if (distance > joystickMaxRadius) {
        dx = (dx / distance) * joystickMaxRadius;
        dy = (dy / distance) * joystickMaxRadius;
    }
    
    joystickStick.style.transform = `translate(${dx}px, ${dy}px)`;
    
    // Normalize to -1.0 to 1.0 for player movement
    joystickVector.x = dx / joystickMaxRadius;
    joystickVector.y = dy / joystickMaxRadius;
}

function resetJoystick() {
    joystickActive = false;
    joystickStick.style.transform = `translate(0px, 0px)`;
    joystickVector = { x: 0, y: 0 };
}

joystickBase.addEventListener('touchend', resetJoystick);
joystickBase.addEventListener('touchcancel', resetJoystick);

shootBtn.addEventListener('touchstart', (e) => { e.preventDefault(); isShooting = true; shootBtn.style.opacity = '0.5'; }, {passive: false});
shootBtn.addEventListener('touchend', (e) => { e.preventDefault(); isShooting = false; shootBtn.style.opacity = '1'; }, {passive: false});
shootBtn.addEventListener('touchcancel', (e) => { e.preventDefault(); isShooting = false; shootBtn.style.opacity = '1'; }, {passive: false});

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
