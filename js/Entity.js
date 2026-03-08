// js/Entity.js

class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y; this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1.0; this.decay = Math.random() * 0.05 + 0.02;
    }
    update() {
        this.x += this.vx; this.y += this.vy; this.life -= this.decay;
    }
    draw() {
        if (this.life <= 0) return;
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(this.x, this.y, 2, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

class Star {
    constructor() {
        this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 1.0 + 0.5; this.vy = this.radius * 1.5;
        this.alpha = Math.random() * 0.4 + 0.1;
    }
    update() {
        this.y += this.vy;
        if (this.y > canvas.height) { this.y = 0; this.x = Math.random() * canvas.width; }
    }
    draw() {
        ctx.fillStyle = `rgba(${Math.floor(currentStarColor.r)}, ${Math.floor(currentStarColor.g)}, ${Math.floor(currentStarColor.b)}, ${this.alpha})`;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill();
    }
}

class Item {
    constructor(x, y, type, id=0) {
        this.x = x; this.y = y; this.radius = 10;
        this.type = type; // 'heal' or 'upgrade'
        this.color = type === 'heal' ? '#39ff14' : '#ffeb3b';
        this.id = id || ++itemIdCounter;
    }
    update() { this.y += 2; }
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        if (this.type === 'heal') {
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        } else {
             ctx.moveTo(this.x, this.y - this.radius); ctx.lineTo(this.x + this.radius, this.y); ctx.lineTo(this.x, this.y + this.radius); ctx.lineTo(this.x - this.radius, this.y);
        }
        ctx.fill();
        ctx.fillStyle = '#000'; ctx.font = '12px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(this.type === 'heal' ? 'H' : 'U', this.x, this.y);
    }
}

class Bullet {
    constructor(x, y, vx, vy, color, isEnemy, owner='', radiusMod=0, type=0, waveW=0) {
        this.x = x; this.y = y; this.vx = vx; this.vy = vy; this.color = color;
        this.isEnemy = isEnemy; this.radius = (isEnemy ? 5 : 4) + radiusMod;
        this.owner = owner;
        this.type = type;
        this.radiusMod = radiusMod;
        this.waveW = waveW;
        this.naturalPiercing = false;
        
        // For wave movement
        this.startX = x;
        this.waveWidth = waveW;
        this.life = 0;
    }
    update() { 
        this.life++;
        if (this.type === 4) {
            // Homing behavior
            if (this.life > 300) { 
                // Despawn after 5 seconds
                this.y = -1000; 
            } else if (enemies.length > 0) {
                let nearest = enemies[0];
                let minDist = Infinity;
                for(let e of enemies) {
                    let d = Math.sqrt((this.x - e.x)**2 + (this.y - e.y)**2);
                    if (d < minDist) { minDist = d; nearest = e; }
                }
                // Add 15% RNG to not track this frame OR steer slightly off
                if (nearest && minDist < 300 && Math.random() > 0.15) {
                    let angle = Math.atan2(nearest.y - this.y, nearest.x - this.x);
                    let spd = Math.sqrt(this.vx**2 + this.vy**2);
                    this.vx = this.vx * 0.9 + Math.cos(angle) * spd * 0.1;
                    this.vy = this.vy * 0.9 + Math.sin(angle) * spd * 0.1;
                }
            }
        } else if (this.type === 5) {
            // Wave behavior
            this.x = this.startX + Math.sin(this.life * 0.2) * this.waveWidth * 10;
        }

        this.x += this.vx; this.y += this.vy; 
    }
    draw() {
        ctx.fillStyle = this.color; 
        ctx.shadowBlur = 8; 
        ctx.shadowColor = this.color; 
        
        if (this.isEnemy) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); 
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff'; 
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2); 
            ctx.fill();
        } else {
            ctx.save();
            ctx.translate(this.x, this.y);
            let angle = (this.vx === 0 && this.vy === 0) ? -Math.PI / 2 : Math.atan2(this.vy, this.vx);
            ctx.rotate(angle);
            
            ctx.beginPath();
            if (this.type === 1) { // Standard - teardrop
                ctx.moveTo(this.radius * 1.5, 0);
                ctx.lineTo(-this.radius, this.radius * 0.8);
                ctx.lineTo(-this.radius * 0.5, 0);
                ctx.lineTo(-this.radius, -this.radius * 0.8);
            } else if (this.type === 2) { // Spread - wedge
                ctx.moveTo(this.radius, 0);
                ctx.lineTo(-this.radius, this.radius * 1.2);
                ctx.lineTo(-this.radius * 0.3, 0);
                ctx.lineTo(-this.radius, -this.radius * 1.2);
            } else if (this.type === 3) { // Laser - thin rectangle
                ctx.rect(-this.radius * 1.5, -this.radius * 0.4, this.radius * 3, this.radius * 0.8);
            } else if (this.type === 4) { // Homing - diamond
                ctx.moveTo(this.radius * 1.2, 0);
                ctx.lineTo(0, this.radius * 0.8);
                ctx.lineTo(-this.radius * 1.2, 0);
                ctx.lineTo(0, -this.radius * 0.8);
            } else if (this.type === 5) { // Wave - crescent
                ctx.arc(0, 0, this.radius, -Math.PI / 2, Math.PI / 2);
                ctx.arc(-this.radius * 0.5, 0, this.radius * 0.8, Math.PI / 2, -Math.PI / 2, true);
            } else if (this.type === 6) { // Cannon - hexagon
                for (let i = 0; i < 6; i++) {
                    let a = i * Math.PI / 3;
                    if (i === 0) ctx.moveTo(this.radius * 1.5 * Math.cos(a), this.radius * 1.5 * Math.sin(a));
                    else ctx.lineTo(this.radius * 1.5 * Math.cos(a), this.radius * 1.5 * Math.sin(a));
                }
            } else {
                ctx.ellipse(0, 0, this.radius * 1.2, this.radius * 0.8, 0, 0, Math.PI * 2);
            }
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
            
            ctx.fillStyle = '#fff';
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            if (this.type === 3) {
                ctx.rect(-this.radius, -this.radius * 0.15, this.radius * 2, this.radius * 0.3);
            } else if (this.type === 4) {
                ctx.moveTo(this.radius * 0.6, 0);
                ctx.lineTo(0, this.radius * 0.4);
                ctx.lineTo(-this.radius * 0.6, 0);
                ctx.lineTo(0, -this.radius * 0.4);
            } else {
                ctx.arc(0, 0, this.radius * 0.4, 0, Math.PI * 2);
            }
            ctx.fill();
            ctx.globalAlpha = 1.0;
            
            ctx.restore();
        }
    }
}
