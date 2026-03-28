// js/utils.js

function createExplosion(x, y, color, amount) {
    for (let i = 0; i < amount; i++) particles.push(new Particle(x, y, color));
}

function circleCollision(x1, y1, r1, x2, y2, r2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) < r1 + r2;
}

// --- Asset Drawing Functions ---
function drawCuteAnime(context, x, y, size, hairCol, eyeCol, acc) {
    context.save();
    context.shadowBlur = 10;
    context.shadowColor = hairCol;

    // Face
    context.fillStyle = '#ffe0bd';
    context.beginPath(); context.arc(x, y, size / 2.2, 0, Math.PI * 2); context.fill();
    context.shadowBlur = 0;

    // Eyes
    context.fillStyle = 'white';
    context.beginPath(); context.ellipse(x - size / 5.5, y - size / 10, size / 7, size / 5, 0, 0, Math.PI * 2); context.fill();
    context.beginPath(); context.ellipse(x + size / 5.5, y - size / 10, size / 7, size / 5, 0, 0, Math.PI * 2); context.fill();

    // Iris
    context.fillStyle = eyeCol;
    context.beginPath(); context.arc(x - size / 5.5, y - size / 10, size / 9, 0, Math.PI * 2); context.fill();
    context.beginPath(); context.arc(x + size / 5.5, y - size / 10, size / 9, 0, Math.PI * 2); context.fill();

    // Eye highlights
    context.fillStyle = 'white';
    context.beginPath(); context.arc(x - size / 5.5 + size / 30, y - size / 10 - size / 25, size / 25, 0, Math.PI * 2); context.fill();
    context.beginPath(); context.arc(x + size / 5.5 + size / 30, y - size / 10 - size / 25, size / 25, 0, Math.PI * 2); context.fill();

    // Blush
    context.fillStyle = 'rgba(255, 100, 150, 0.4)';
    context.beginPath(); context.ellipse(x - size / 4, y + size / 8, size / 9, size / 15, 0, 0, Math.PI * 2); context.fill();
    context.beginPath(); context.ellipse(x + size / 4, y + size / 8, size / 9, size / 15, 0, 0, Math.PI * 2); context.fill();

    // Mouth 
    context.strokeStyle = '#ff8888'; context.lineWidth = Math.max(1, size / 40);
    context.beginPath(); context.arc(x, y + size / 6, size / 12, 0.1, Math.PI - 0.1); context.stroke();

    // Hair Base
    context.fillStyle = hairCol;
    context.beginPath();
    context.arc(x, y - size / 15, size / 1.9, Math.PI, Math.PI * 2);
    context.fill();

    // Front Bangs
    context.beginPath();
    context.moveTo(x - size / 1.9, y - size / 15);
    context.quadraticCurveTo(x - size / 4, y - size / 2, x, y - size / 4);
    context.quadraticCurveTo(x + size / 4, y - size / 2, x + size / 1.9, y - size / 15);
    context.quadraticCurveTo(x, y - size / 1.5, x - size / 1.9, y - size / 15);
    context.fill();

    // Side hair
    context.beginPath(); context.moveTo(x - size / 1.9, y - size / 15); context.lineTo(x - size / 1.5, y + size / 2.5); context.lineTo(x - size / 2.5, y + size / 5); context.fill();
    context.beginPath(); context.moveTo(x + size / 1.9, y - size / 15); context.lineTo(x + size / 1.5, y + size / 2.5); context.lineTo(x + size / 2.5, y + size / 5); context.fill();

    // Accessory
    if (acc === 'bow') { // Striker
        context.fillStyle = '#ff007f';
        context.beginPath(); context.moveTo(x, y - size / 2); context.lineTo(x - size / 4, y - size / 1.5); context.lineTo(x - size / 5, y - size / 2.5); context.fill();
        context.beginPath(); context.moveTo(x, y - size / 2); context.lineTo(x + size / 4, y - size / 1.5); context.lineTo(x + size / 5, y - size / 2.5); context.fill();
        context.beginPath(); context.arc(x, y - size / 2, size / 20, 0, Math.PI * 2); context.fill();
    } else if (acc === 'cat') { // Phantom
        context.beginPath(); context.moveTo(x - size / 2, y - size / 3); context.lineTo(x - size / 3, y - size / 1.6); context.lineTo(x - size / 6, y - size / 2.2); context.fill();
        context.beginPath(); context.moveTo(x + size / 2, y - size / 3); context.lineTo(x + size / 3, y - size / 1.6); context.lineTo(x + size / 6, y - size / 2.2); context.fill();
        context.fillStyle = '#ffccdd';
        context.beginPath(); context.moveTo(x - size / 2.3, y - size / 2.8); context.lineTo(x - size / 3.2, y - size / 1.4); context.lineTo(x - size / 5, y - size / 2.2); context.fill();
        context.beginPath(); context.moveTo(x + size / 2.3, y - size / 2.8); context.lineTo(x + size / 3.2, y - size / 1.4); context.lineTo(x + size / 5, y - size / 2.2); context.fill();
    } else if (acc === 'halo') { // Titan
        context.strokeStyle = '#ffe600'; context.lineWidth = size / 15;
        context.beginPath(); context.ellipse(x, y - size / 1.5, size / 3, size / 10, 0, 0, Math.PI * 2); context.stroke();
    } else if (acc === 'horns') { // Boss
        context.fillStyle = '#0a0a0a';
        context.beginPath(); context.moveTo(x - size / 4, y - size / 2); context.lineTo(x - size / 2, y - size / 1.2); context.lineTo(x - size / 6, y - size / 1.8); context.fill();
        context.beginPath(); context.moveTo(x + size / 4, y - size / 2); context.lineTo(x + size / 2, y - size / 1.2); context.lineTo(x + size / 6, y - size / 1.8); context.fill();
    }
    context.restore();
}

function drawShipStriker(context, x, y, size) { drawCuteAnime(context, x, y, size, '#ff99cc', '#00bfff', 'bow'); }
function drawShipPhantom(context, x, y, size) { drawCuteAnime(context, x, y, size, '#9933ff', '#ff1493', 'cat'); }
function drawShipTitan(context, x, y, size) { drawCuteAnime(context, x, y, size, '#33ccff', '#ffcc00', 'halo'); }

// --- Boss Drawing Functions ---
function drawBoss101(ctx, x, y, size) { // Neon Valkyrie
    ctx.save(); ctx.translate(x, y);
    ctx.shadowBlur = 20; ctx.shadowColor = '#ff007f'; ctx.fillStyle = '#ff007f';
    ctx.beginPath(); ctx.moveTo(0, -size/2); ctx.lineTo(-size/3, size/3); ctx.lineTo(0, size/2); ctx.lineTo(size/3, size/3); ctx.fill();
    ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(0, 0, size/6, 0, Math.PI*2); ctx.fill(); // Core
    // Wings
    ctx.strokeStyle = '#ff007f'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-size/3, -size/4); ctx.lineTo(-size, -size/2); ctx.lineTo(-size/2, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(size/3, -size/4); ctx.lineTo(size, -size/2); ctx.lineTo(size/2, 0); ctx.stroke();
    ctx.restore();
}
function drawBoss102(ctx, x, y, size) { // Cyber Behemoth
    ctx.save(); ctx.translate(x, y);
    ctx.shadowBlur = 10; ctx.shadowColor = '#ff3300'; ctx.fillStyle = '#222'; ctx.strokeStyle = '#ff3300'; ctx.lineWidth = 4;
    ctx.fillRect(-size/2, -size/2.5, size, size/1.25); ctx.strokeRect(-size/2, -size/2.5, size, size/1.25);
    // Treads
    ctx.fillStyle = '#ff3300';
    for(let i=0; i<3; i++) {
        ctx.fillRect(-size/2 - 10, -size/3 + i*(size/3), 10, size/4);
        ctx.fillRect(size/2, -size/3 + i*(size/3), 10, size/4);
    }
    // Cannon
    ctx.fillRect(-15, size/2.5, 30, size/2);
    ctx.restore();
}
function drawBoss103(ctx, x, y, size) { // Prism Core
    ctx.save(); ctx.translate(x, y);
    let rot = Date.now() * 0.002; ctx.rotate(rot);
    ctx.shadowBlur = 30; ctx.shadowColor = '#c5a3ff'; ctx.fillStyle = '#c5a3ff'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -size/2); ctx.lineTo(size/2, 0); ctx.lineTo(0, size/2); ctx.lineTo(-size/2, 0); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.rotate(-rot*2);
    ctx.beginPath(); ctx.moveTo(0, -size/3); ctx.lineTo(size/3, 0); ctx.lineTo(0, size/3); ctx.lineTo(-size/3, 0); ctx.closePath();
    ctx.stroke();
    ctx.restore();
}
function drawBoss104(ctx, x, y, size) { // Starship Carrier
    ctx.save(); ctx.translate(x, y);
    ctx.shadowBlur = 15; ctx.shadowColor = '#00ffcc'; ctx.fillStyle = '#1a1a1a'; ctx.strokeStyle = '#00ffcc'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-size, 0); ctx.lineTo(-size/2, -size/3); ctx.lineTo(size/2, -size/3); ctx.lineTo(size, 0);
    ctx.lineTo(size/2, size/3); ctx.lineTo(-size/2, size/3); ctx.closePath(); ctx.fill(); ctx.stroke();
    // Hangars
    ctx.fillStyle = '#000'; ctx.fillRect(-size/1.5, size/6, size/3, size/4); ctx.fillRect(size/3, size/6, size/3, size/4);
    ctx.fillStyle = '#00ffcc'; ctx.fillRect(-size/1.5 + 5, size/6 + 5, size/3 - 10, size/4 - 10); ctx.fillRect(size/3 + 5, size/6 + 5, size/3 - 10, size/4 - 10);
    ctx.restore();
}
function drawBoss105(ctx, x, y, size) { // Plasma Eye
    ctx.save(); ctx.translate(x, y);
    ctx.shadowBlur = 20; ctx.shadowColor = '#ff33cc'; 
    ctx.fillStyle = '#555'; ctx.beginPath(); ctx.arc(0, 0, size/2, 0, Math.PI*2); ctx.fill(); // Outer
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, size/2.5, 0, Math.PI*2); ctx.fill(); // Sclera
    ctx.fillStyle = '#ff33cc'; ctx.beginPath(); ctx.arc(0, 0, size/4, 0, Math.PI*2); ctx.fill(); // Iris
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(0, 0, size/8, 0, Math.PI*2); ctx.fill(); // Pupil
    // Veins / mechanical bits
    ctx.strokeStyle = '#ff33cc'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, size/2 + 10, Math.PI*0.8, Math.PI*2.2); ctx.stroke();
    ctx.restore();
}
function drawBoss106(ctx, x, y, size) { // Abyssal Spider
    ctx.save(); ctx.translate(x, y);
    let t = Date.now() * 0.005;
    ctx.shadowBlur = 15; ctx.shadowColor = '#9d00ff'; ctx.fillStyle = '#111'; ctx.strokeStyle = '#9d00ff'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, -10, size/3, 0, Math.PI*2); ctx.fill(); ctx.stroke(); // Abdomen
    ctx.beginPath(); ctx.arc(0, 20, size/4, 0, Math.PI*2); ctx.fill(); ctx.stroke(); // Cephalothorax
    // Legs
    for(let i=0; i<4; i++) {
        let angle = Math.PI/4 + (i * Math.PI/6) + Math.sin(t+i)*0.2;
        ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(Math.cos(angle)*size, Math.sin(angle)*size); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(-Math.cos(angle)*size, Math.sin(angle)*size); ctx.stroke();
    }
    // Eyes
    ctx.fillStyle = '#ff0000'; ctx.beginPath(); ctx.arc(-10, 30, 5, 0, Math.PI*2); ctx.arc(10, 30, 5, 0, Math.PI*2); ctx.fill();
    ctx.restore();
}
function drawBoss107(ctx, x, y, size) { // Aero-Serpent Head
    ctx.save(); ctx.translate(x, y);
    ctx.shadowBlur = 25; ctx.shadowColor = '#00ffcc'; ctx.fillStyle = '#00ffcc';
    ctx.beginPath(); ctx.moveTo(0, size/2); ctx.lineTo(-size/2, -size/2); ctx.lineTo(size/2, -size/2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-15, -10, 8, 0, Math.PI*2); ctx.arc(15, -10, 8, 0, Math.PI*2); ctx.fill();
    // Segment trails are normally handled by drawing multiple entities, but we'll simulate a tail here for the boss entity
    ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(0, -size/1.5, size/3, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 0.2; ctx.beginPath(); ctx.arc(0, -size*1.2, size/4, 0, Math.PI*2); ctx.fill();
    ctx.restore();
}
function drawBoss108(ctx, x, y, size) { // Twin-Core
    ctx.save(); ctx.translate(x, y);
    ctx.shadowBlur = 15; ctx.fillStyle = '#333'; ctx.fillRect(-size/2, -size/3, size, size/1.5); // Bridge
    // Red Core Left
    ctx.shadowColor = '#ff003c'; ctx.fillStyle = '#ff003c'; ctx.beginPath(); ctx.arc(-size/2, 0, size/3, 0, Math.PI*2); ctx.fill();
    // Blue Core Right
    ctx.shadowColor = '#00f3ff'; ctx.fillStyle = '#00f3ff'; ctx.beginPath(); ctx.arc(size/2, 0, size/3, 0, Math.PI*2); ctx.fill();
    // Spikes
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-size/2, size/3); ctx.lineTo(-size/2, size/1.5); ctx.lineTo(-size/2+10, size/3); ctx.fill();
    ctx.beginPath(); ctx.moveTo(size/2, size/3); ctx.lineTo(size/2, size/1.5); ctx.lineTo(size/2-10, size/3); ctx.fill();
    ctx.restore();
}
function drawBoss109(ctx, x, y, size) { // Crimson Interceptor
    ctx.save(); ctx.translate(x, y);
    ctx.shadowBlur = 30; ctx.shadowColor = '#ff0000'; ctx.fillStyle = '#5a0000'; ctx.strokeStyle = '#ff0000'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, size/2); ctx.lineTo(-size/1.5, -size/2); ctx.lineTo(0, -size/4); ctx.lineTo(size/1.5, -size/2); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ff0000'; ctx.beginPath(); ctx.moveTo(0, size/2); ctx.lineTo(-15, 0); ctx.lineTo(15, 0); ctx.fill(); // Canopy
    ctx.restore();
}
function drawBoss110(ctx, x, y, size) { // Omega Engine
    ctx.save(); ctx.translate(x, y);
    ctx.shadowBlur = 40; ctx.shadowColor = '#ffd700'; ctx.fillStyle = '#111'; ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 5;
    // Main Body
    ctx.beginPath(); ctx.arc(0, 0, size/2, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    // Crown
    ctx.beginPath(); ctx.moveTo(-size/2, -size/4); ctx.lineTo(-size/1.5, -size/1.5); ctx.lineTo(-size/4, -size/2); 
    ctx.lineTo(0, -size); ctx.lineTo(size/4, -size/2); ctx.lineTo(size/1.5, -size/1.5); ctx.lineTo(size/2, -size/4); ctx.stroke();
    // Cores
    ctx.fillStyle = '#ff0055'; ctx.beginPath(); ctx.arc(0, 20, size/5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#00ffcc'; ctx.beginPath(); ctx.arc(-30, -10, size/6, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#00ffcc'; ctx.beginPath(); ctx.arc(30, -10, size/6, 0, Math.PI*2); ctx.fill();
    ctx.restore();
}

function renderPreviews() {
    drawShipStriker(document.getElementById('ship1Preview').getContext('2d'), 40, 40, 50);
    drawShipPhantom(document.getElementById('ship2Preview').getContext('2d'), 40, 40, 50);
    drawShipTitan(document.getElementById('ship3Preview').getContext('2d'), 40, 40, 50);
}
