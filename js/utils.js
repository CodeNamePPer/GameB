// js/utils.js

function createExplosion(x, y, color, amount) {
    for (let i = 0; i < amount; i++) particles.push(new Particle(x, y, color));
}

function circleCollision(x1, y1, r1, x2, y2, r2) {
    return Math.sqrt((x1-x2)**2 + (y1-y2)**2) < r1 + r2;
}

// --- Asset Drawing Functions ---
function drawCuteAnime(context, x, y, size, hairCol, eyeCol, acc) {
    context.save();
    context.shadowBlur = 10;
    context.shadowColor = hairCol;
    
    // Face
    context.fillStyle = '#ffe0bd';
    context.beginPath(); context.arc(x, y, size/2.2, 0, Math.PI*2); context.fill();
    context.shadowBlur = 0; 
    
    // Eyes
    context.fillStyle = 'white';
    context.beginPath(); context.ellipse(x - size/5.5, y - size/10, size/7, size/5, 0, 0, Math.PI*2); context.fill();
    context.beginPath(); context.ellipse(x + size/5.5, y - size/10, size/7, size/5, 0, 0, Math.PI*2); context.fill();
    
    // Iris
    context.fillStyle = eyeCol;
    context.beginPath(); context.arc(x - size/5.5, y - size/10, size/9, 0, Math.PI*2); context.fill();
    context.beginPath(); context.arc(x + size/5.5, y - size/10, size/9, 0, Math.PI*2); context.fill();

    // Eye highlights
    context.fillStyle = 'white';
    context.beginPath(); context.arc(x - size/5.5 + size/30, y - size/10 - size/25, size/25, 0, Math.PI*2); context.fill();
    context.beginPath(); context.arc(x + size/5.5 + size/30, y - size/10 - size/25, size/25, 0, Math.PI*2); context.fill();

    // Blush
    context.fillStyle = 'rgba(255, 100, 150, 0.4)';
    context.beginPath(); context.ellipse(x - size/4, y + size/8, size/9, size/15, 0, 0, Math.PI*2); context.fill();
    context.beginPath(); context.ellipse(x + size/4, y + size/8, size/9, size/15, 0, 0, Math.PI*2); context.fill();

    // Mouth 
    context.strokeStyle = '#ff8888'; context.lineWidth = Math.max(1, size/40);
    context.beginPath(); context.arc(x, y + size/6, size/12, 0.1, Math.PI - 0.1); context.stroke();

    // Hair Base
    context.fillStyle = hairCol;
    context.beginPath(); 
    context.arc(x, y - size/15, size/1.9, Math.PI, Math.PI*2); 
    context.fill();

    // Front Bangs
    context.beginPath();
    context.moveTo(x - size/1.9, y - size/15);
    context.quadraticCurveTo(x - size/4, y - size/2, x, y - size/4);
    context.quadraticCurveTo(x + size/4, y - size/2, x + size/1.9, y - size/15);
    context.quadraticCurveTo(x, y - size/1.5, x - size/1.9, y - size/15);
    context.fill();
    
    // Side hair
    context.beginPath(); context.moveTo(x - size/1.9, y - size/15); context.lineTo(x - size/1.5, y + size/2.5); context.lineTo(x - size/2.5, y + size/5); context.fill();
    context.beginPath(); context.moveTo(x + size/1.9, y - size/15); context.lineTo(x + size/1.5, y + size/2.5); context.lineTo(x + size/2.5, y + size/5); context.fill();

    // Accessory
    if (acc === 'bow') { // Striker
        context.fillStyle = '#ff007f';
        context.beginPath(); context.moveTo(x, y - size/2); context.lineTo(x - size/4, y - size/1.5); context.lineTo(x - size/5, y - size/2.5); context.fill();
        context.beginPath(); context.moveTo(x, y - size/2); context.lineTo(x + size/4, y - size/1.5); context.lineTo(x + size/5, y - size/2.5); context.fill();
        context.beginPath(); context.arc(x, y - size/2, size/20, 0, Math.PI*2); context.fill();
    } else if (acc === 'cat') { // Phantom
        context.beginPath(); context.moveTo(x - size/2, y - size/3); context.lineTo(x - size/3, y - size/1.6); context.lineTo(x - size/6, y - size/2.2); context.fill();
        context.beginPath(); context.moveTo(x + size/2, y - size/3); context.lineTo(x + size/3, y - size/1.6); context.lineTo(x + size/6, y - size/2.2); context.fill();
        context.fillStyle = '#ffccdd';
        context.beginPath(); context.moveTo(x - size/2.3, y - size/2.8); context.lineTo(x - size/3.2, y - size/1.4); context.lineTo(x - size/5, y - size/2.2); context.fill();
        context.beginPath(); context.moveTo(x + size/2.3, y - size/2.8); context.lineTo(x + size/3.2, y - size/1.4); context.lineTo(x + size/5, y - size/2.2); context.fill();
    } else if (acc === 'halo') { // Titan
        context.strokeStyle = '#ffe600'; context.lineWidth = size/15;
        context.beginPath(); context.ellipse(x, y - size/1.5, size/3, size/10, 0, 0, Math.PI*2); context.stroke();
    } else if (acc === 'horns') { // Boss
        context.fillStyle = '#0a0a0a';
        context.beginPath(); context.moveTo(x - size/4, y - size/2); context.lineTo(x - size/2, y - size/1.2); context.lineTo(x - size/6, y - size/1.8); context.fill();
        context.beginPath(); context.moveTo(x + size/4, y - size/2); context.lineTo(x + size/2, y - size/1.2); context.lineTo(x + size/6, y - size/1.8); context.fill();
    }
    context.restore();
}

function drawShipStriker(context, x, y, size) { drawCuteAnime(context, x, y, size, '#ff99cc', '#00bfff', 'bow'); }
function drawShipPhantom(context, x, y, size) { drawCuteAnime(context, x, y, size, '#9933ff', '#ff1493', 'cat'); }
function drawShipTitan(context, x, y, size) { drawCuteAnime(context, x, y, size, '#33ccff', '#ffcc00', 'halo'); }

function renderPreviews() {
    drawShipStriker(document.getElementById('ship1Preview').getContext('2d'), 40, 40, 50);
    drawShipPhantom(document.getElementById('ship2Preview').getContext('2d'), 40, 40, 50);
    drawShipTitan(document.getElementById('ship3Preview').getContext('2d'), 40, 40, 50);
}
