// js/globals.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const uiLayer = document.getElementById('uiLayer');
const mainMenu = document.getElementById('mainMenu');
const statusText = document.getElementById('statusText');
const joinIdInput = document.getElementById('joinIdInput');

// Preload Enemy Images
const imgAlienDrone = new Image(); imgAlienDrone.src = 'img/alien_drone_1774679648085-removebg-preview.png';
const imgAlienCruiser = new Image(); imgAlienCruiser.src = 'img/alien_cruiser_1774679709180-removebg-preview.png';
const imgAlienBomber = new Image(); imgAlienBomber.src = 'img/alien_bomber_1774679796975-removebg-preview.png';


let isHost = true;
let isMultiplayer = false;
let peer = null;
let connection = null;

let gameActive = false;
let score = 0;
let frameCount = 0;
let isBossActive = false;
let bossTimer = 0;
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
window.addEventListener('mousedown', e => {
    if (e.button === 0) keys['mouse0'] = true;
});
window.addEventListener('mouseup', e => {
    if (e.button === 0) keys['mouse0'] = false;
});

let mousePos = { x: canvas.width / 2, y: canvas.height * 0.2 };
let lockedTargetId = null;

canvas.addEventListener('mousemove', (e) => {
    let rect = canvas.getBoundingClientRect();
    let scaleX = canvas.width / rect.width;
    let scaleY = canvas.height / rect.height;
    mousePos.x = (e.clientX - rect.left) * scaleX;
    mousePos.y = (e.clientY - rect.top) * scaleY;
});

canvas.addEventListener('touchstart', (e) => {
    if (selectedControlType === 'pc') return; 
    let rect = canvas.getBoundingClientRect();
    let scaleX = canvas.width / rect.width;
    let scaleY = canvas.height / rect.height;
    let touchX = (e.touches[0].clientX - rect.left) * scaleX;
    let touchY = (e.touches[0].clientY - rect.top) * scaleY;
    
    // ค้นหาศัตรูที่อยู่ใกล้จุดที่แตะนิ้วมากที่สุด (รัศมี 80px)
    let closest = null;
    let minDist = 80; 
    for(let en of enemies) {
        let d = Math.hypot(en.x - touchX, en.y - touchY);
        if(d < minDist) { minDist = d; closest = en; }
    }
    if (closest) {
        lockedTargetId = closest.id;
    } else {
        lockedTargetId = null; // แตะพื้นที่ว่างเพื่อปลดล็อคเป้า
    }
}, {passive: false});

// Touch controls for mobile (Joystick + Button)
const mobileControls = document.getElementById('mobileControls');
const joystickZone = document.getElementById('joystickZone');
const joystickBase = document.getElementById('joystickBase');
const joystickStick = document.getElementById('joystickStick');
const shootBtn = document.getElementById('shootBtn');
const ultBtn = document.getElementById('ultBtn');

const autoToggleBtn = document.getElementById('autoToggleBtn');

let joystickVector = { x: 0, y: 0 };
let isAutoShooting = true; 
let isManualShooting = false;
Object.defineProperty(window, 'isShooting', { get: () => isAutoShooting || isManualShooting });

let isPressingUlt = false;
let joystickActive = false;
let joystickCenter = { x: 0, y: 0 };
let joystickMaxRadius = 40;

joystickZone.addEventListener('touchstart', (e) => {
    e.preventDefault();
    e.stopPropagation(); // กันการส่งต่อ Event ไปยังจอเกมเพื่อไม่ให้สับสนกับการล็อกเป้า
    joystickActive = true;
    
    // Position joystick base exactly at touch start point inside the container
    let containerRect = document.getElementById('gameContainer').getBoundingClientRect();
    let touchX = e.touches[0].clientX - containerRect.left;
    let touchY = e.touches[0].clientY - containerRect.top;
    
    joystickBase.style.left = (touchX - 50) + 'px'; // Center base (100px width/height)
    joystickBase.style.top = (touchY - 50) + 'px';
    joystickBase.style.bottom = 'auto'; // Disable original bottom styling
    joystickBase.style.opacity = '1';
    
    let rect = joystickBase.getBoundingClientRect();
    joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    updateJoystick(e.touches[0]);
}, {passive: false});

joystickZone.addEventListener('touchmove', (e) => {
    e.preventDefault();
    e.stopPropagation();
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
    joystickBase.style.opacity = '0'; // Hide when lifted
}

joystickZone.addEventListener('touchend', resetJoystick);
joystickZone.addEventListener('touchcancel', resetJoystick);

autoToggleBtn.addEventListener('touchstart', (e) => { 
    e.preventDefault(); 
    isAutoShooting = !isAutoShooting; 
    autoToggleBtn.innerHTML = isAutoShooting ? "AUTO<br>ON" : "AUTO<br>OFF";
    autoToggleBtn.style.backgroundColor = isAutoShooting ? "rgba(0, 255, 100, 0.4)" : "rgba(100, 100, 100, 0.6)";
    autoToggleBtn.style.borderColor = isAutoShooting ? "rgba(0, 255, 100, 0.8)" : "rgba(255, 255, 255, 0.5)";
}, {passive: false});

shootBtn.addEventListener('touchstart', (e) => { e.preventDefault(); isManualShooting = true; shootBtn.style.transform = 'scale(0.9)'; }, {passive: false});
shootBtn.addEventListener('touchend', (e) => { e.preventDefault(); isManualShooting = false; shootBtn.style.transform = 'scale(1)'; }, {passive: false});
shootBtn.addEventListener('touchcancel', (e) => { e.preventDefault(); isManualShooting = false; shootBtn.style.transform = 'scale(1)'; }, {passive: false});

ultBtn.addEventListener('touchstart', (e) => { e.preventDefault(); isPressingUlt = true; ultBtn.style.opacity = '0.5'; }, {passive: false});
ultBtn.addEventListener('touchend', (e) => { e.preventDefault(); isPressingUlt = false; ultBtn.style.opacity = '1'; }, {passive: false});
ultBtn.addEventListener('touchcancel', (e) => { e.preventDefault(); isPressingUlt = false; ultBtn.style.opacity = '1'; }, {passive: false});

const BUFFS = [
    { id: 0, title: "MAX HP UP", desc: "+50 Max HP and restores 50 HP.", icon: "💖" },
    { id: 1, title: "SPEED UP", desc: "+1.5 Move Speed.", icon: "⚡" },
    { id: 2, title: "FIRE RATE UP", desc: "Shoot faster (-1 frame delay).", icon: "🔥" },
    { id: 3, title: "DAMAGE UP", desc: "+5 Damage to all bullets.", icon: "⚔️" },
    { id: 4, title: "FULL HEAL", desc: "Restore HP to 100%.", icon: "💊" },
    { id: 5, title: "WEAPON UPGRADE", desc: "+1 Weapon Level.", icon: "🚀" },
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
