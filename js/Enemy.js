// js/Enemy.js

class Enemy {
    constructor(x, y, type, id=0) {
        this.x = x; this.y = y; this.type = type;
        this.timer = 0;
        this.id = id || ++enemyIdCounter;
        
        if (type === 1) { this.hp = 15; this.color = '#ff3333'; this.speedY = 2.5; this.radius = 15; } 
        else if (type === 2) { this.hp = 40; this.color = '#b026ff'; this.speedY = 0.8; this.radius = 25; } 
        else if (type === 3) { this.hp = 60; this.color = '#ff00c8'; this.speedY = 0.5; this.radius = 30; } 
        else if (type === 4) { this.hp = 100; this.color = '#ff9900'; this.speedY = 0.3; this.radius = 40; }
        else if (type === 5) { this.hp = 60; this.color = '#00ffff'; this.speedY = 2.0; this.radius = 20; this.vx = (Math.random() < 0.5 ? 2 : -2); } // Tracker
        else if (type === 6) { this.hp = 10; this.color = '#ffff00'; this.speedY = 6.0; this.radius = 15; this.vx = 4; } // Sprinter
        else if (type === 7) { this.hp = 150; this.color = '#333333'; this.speedY = 0.4; this.radius = 45; } // Bomber
        else if (type === 8) { this.hp = 50; this.color = '#00ff00'; this.speedY = 4.0; this.radius = 20; } // Sniper
        else if (type === 9) { this.hp = 30; this.color = '#0066ff'; this.speedY = 1.5; this.radius = 22; this.startX = x; } // Waver
        else if (type === 10) { this.hp = 120; this.color = '#ffffff'; this.speedY = 1.0; this.radius = 35; } // Splitter
        else if (type === 101) { this.hp = 1500; this.color = '#ff003c'; this.speedY = 1.2; this.radius = 60; } // Boss 1
        else if (type === 102) { this.hp = 2500; this.color = '#00ffff'; this.speedY = 1.5; this.radius = 65; } // Boss 2
        else if (type === 103) { this.hp = 4000; this.color = '#9900ff'; this.speedY = 2.0; this.radius = 70; } // Boss 3
        else if (type > 103) { this.hp = 4000 + (type-103)*1500; this.color = '#ffffff'; this.speedY = 2.5; this.radius = 70; } // Boss scaling
        
        this.maxHp = this.hp;
    }

    update() {
        if (this.type >= 100) {
            // Boss stops halfway (only move down if y is less than 150)
            if (this.y < 150) {
                this.y += this.speedY;
            } else if (this.type === 102) {
                // Boss 2 moves side to side
                if (!this.vx) this.vx = 2;
                this.x += this.vx;
                if (this.x < 100 || this.x > canvas.width - 100) this.vx *= -1;
            } else if (this.type >= 103) {
                // Boss 3 erratic movement
                if (this.timer % 60 === 0) {
                    this.vx = (Math.random() - 0.5) * 6;
                    this.vy = (Math.random() - 0.5) * 4;
                }
                if (this.vx) this.x += this.vx;
                if (this.vy) this.y += this.vy;
                this.x = Math.max(80, Math.min(canvas.width - 80, this.x));
                this.y = Math.max(50, Math.min(250, this.y));
            }
        } else {
            if (this.type === 5) {
                // Tracker
                this.x += this.vx;
                this.y += this.speedY;
                if (this.x < 20 || this.x > canvas.width - 20) this.vx *= -1;
            } else if (this.type === 6) {
                // Sprinter
                if (this.timer % 30 === 0) this.vx *= -1;
                this.x += this.vx;
                this.y += this.speedY;
            } else if (this.type === 8) {
                // Sniper
                if (this.y < 120) this.y += this.speedY;
                else if (this.timer > 200) this.y -= this.speedY * 2; // runs away
            } else if (this.type === 9) {
                // Waver
                this.y += this.speedY;
                this.x = this.startX + Math.sin(this.timer * 0.05) * 80;
            } else {
                this.y += this.speedY;
            }
        }
        this.timer++;

        // Only host spawns enemy bullets
        if (!isHost) return;

        // Target the closest alive player
        let target = null;
        let minDist = Infinity;
        Object.values(players).forEach(p => {
            if (p.hp > 0) {
                let d = Math.hypot(p.x - this.x, p.y - this.y);
                if (d < minDist) { minDist = d; target = p; }
            }
        });
        if (!target) target = { x: canvas.width/2, y: canvas.height }; // fallback

        if (this.type === 1 && this.timer % 70 === 0) this.shootTarget(target, 4);
        else if (this.type === 2 && this.timer % 100 === 0) this.shootRadial(8, 3);
        else if (this.type === 3 && this.timer % 10 === 0) this.shootSpiral();
        else if (this.type === 4 && this.timer % 120 === 0) this.shootArc(10);
        else if (this.type === 5 && this.timer % 50 === 0) this.shootTarget(target, 6);
        else if (this.type === 7 && this.timer % 90 === 0) this.shootMine();
        else if (this.type === 8 && this.y >= 120 && this.timer > 80 && this.timer % 60 === 0 && this.timer < 180) this.shootTarget(target, 12);
        else if (this.type === 9 && this.timer % 40 === 0) {
            enemyBullets.push(new Bullet(this.x, this.y, 4, 0, this.color, true));
            enemyBullets.push(new Bullet(this.x, this.y, -4, 0, this.color, true));
        }
        
        // Boss attacks
        if (this.type === 101) { // Boss 1
            let phase = Math.floor(this.timer / 150) % 3;
            if (phase === 0 && this.timer % 30 === 0) this.shootRadial(12, 3.5);
            else if (phase === 1 && this.timer % 8 === 0) this.shootSpiral(1);
            else if (phase === 2 && this.timer % 40 === 0) { this.shootTarget(target, 6); this.shootArc(8); }
        } else if (this.type === 102) { // Boss 2
            let phase = Math.floor(this.timer / 200) % 2;
            if (phase === 0 && this.timer % 50 === 0) {
                 this.shootRadial(20, 5);
                 this.shootTarget(target, 8);
            } else if (phase === 1 && this.timer % 5 === 0) {
                 enemyBullets.push(new Bullet(this.x, this.y + 40, (Math.random()-0.5)*2, 8, '#00ffff', true));
            }
        } else if (this.type >= 103) { // Boss 3+
            let phase = Math.floor(this.timer / 120) % 3;
            if (phase === 0 && this.timer % 4 === 0) this.shootSpiral(1.5, '#9900ff');
            else if (phase === 1 && this.timer % 20 === 0) this.shootRadial(16, 4);
            else if (phase === 2 && this.timer % 50 === 0) {
                for(let i=0; i<3; i++) {
                    let nx = this.x + (Math.random()-0.5)*100;
                    enemyBullets.push(new Bullet(nx, this.y, 0, 2, '#333333', true)); // Black holes
                }
            }
        }
    }

    shootTarget(target, speed) {
        const angle = Math.atan2(target.y - this.y, target.x - this.x);
        enemyBullets.push(new Bullet(this.x, this.y, Math.cos(angle)*speed, Math.sin(angle)*speed, '#ff003c', true));
    }
    shootRadial(amount, speed) {
        for (let i = 0; i < amount; i++) {
            const angle = (Math.PI * 2 / amount) * i;
            enemyBullets.push(new Bullet(this.x, this.y, Math.cos(angle)*speed, Math.sin(angle)*speed, this.color, true));
        }
    }
    shootSpiral(mult=1, col=this.color) {
        const speed = 3 * mult; const angle = this.timer * 0.15 * mult;
        enemyBullets.push(new Bullet(this.x, this.y, Math.cos(angle)*speed, Math.sin(angle)*speed, col, true));
        enemyBullets.push(new Bullet(this.x, this.y, Math.cos(angle+Math.PI)*speed, Math.sin(angle+Math.PI)*speed, col, true));
    }
    shootArc(amount) {
        const speed = 2.5; const startAngle = Math.PI * 0.2; const endAngle = Math.PI * 0.8;
        for (let i = 0; i < amount; i++) {
            const angle = startAngle + (endAngle - startAngle) * (i / (amount - 1));
            enemyBullets.push(new Bullet(this.x, this.y, Math.cos(angle)*speed, Math.sin(angle)*speed, '#ff9900', true));
        }
    }
    shootMine() {
        enemyBullets.push(new Bullet(this.x, this.y, 0, 0.5, '#555555', true));
    }

    draw() {
        ctx.fillStyle = this.color; ctx.shadowBlur = 15; ctx.shadowColor = this.color; ctx.beginPath();
        if (this.type === 1) { // Triangle
            ctx.moveTo(this.x, this.y + this.radius); ctx.lineTo(this.x - this.radius, this.y - this.radius); ctx.lineTo(this.x + this.radius, this.y - this.radius);
        } else if (this.type === 2) { // Diamond
            ctx.moveTo(this.x, this.y - this.radius); ctx.lineTo(this.x + this.radius, this.y); ctx.lineTo(this.x, this.y + this.radius); ctx.lineTo(this.x - this.radius, this.y);
        } else if (this.type === 3) { // Star
            const spikes = 5;
            for(let i=0; i<spikes*2; i++) {
                const r = (i%2==0) ? this.radius : this.radius/2;
                const a = (i * Math.PI / spikes) + (this.timer * 0.05);
                if(i==0) ctx.moveTo(this.x + r*Math.cos(a), this.y + r*Math.sin(a));
                else ctx.lineTo(this.x + r*Math.cos(a), this.y + r*Math.sin(a));
            }
        } else if (this.type === 4) { // Rectangle
            ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI*2);
            ctx.rect(this.x - this.radius, this.y - this.radius*0.3, this.radius*2, this.radius*0.6);
        } else if (this.type === 5) { // Kite
            ctx.moveTo(this.x, this.y + this.radius); ctx.lineTo(this.x - this.radius/2, this.y); ctx.lineTo(this.x, this.y - this.radius); ctx.lineTo(this.x + this.radius/2, this.y);
        } else if (this.type === 6) { // Dart
            ctx.moveTo(this.x, this.y + this.radius); ctx.lineTo(this.x - this.radius/3, this.y - this.radius); ctx.lineTo(this.x, this.y - this.radius/2); ctx.lineTo(this.x + this.radius/3, this.y - this.radius);
        } else if (this.type === 7) { // Bomber Circle
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
            ctx.moveTo(this.x - this.radius, this.y); ctx.lineTo(this.x + this.radius, this.y);
        } else if (this.type === 8) { // Cross
            ctx.rect(this.x - this.radius/3, this.y - this.radius, this.radius/1.5, this.radius*2);
            ctx.rect(this.x - this.radius, this.y - this.radius/3, this.radius*2, this.radius/1.5);
        } else if (this.type === 9) { // Oval
            ctx.ellipse(this.x, this.y, this.radius, this.radius/2, 0, 0, Math.PI*2);
        } else if (this.type === 10) { // Hexagon
            for (let i = 0; i < 6; i++) {
                ctx.lineTo(this.x + this.radius * Math.cos(i * Math.PI / 3), this.y + this.radius * Math.sin(i * Math.PI / 3));
            }
        } else if (this.type === 101) {
            ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
            drawCuteAnime(ctx, this.x, this.y, this.radius * 2, '#4a0000', '#ff003c', 'horns');
            ctx.beginPath(); // Prevent clipping issues after function call
        } else if (this.type === 102) {
            ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
            drawCuteAnime(ctx, this.x, this.y, this.radius * 2, '#ffffff', '#00ffff', 'halo');
            ctx.beginPath(); 
        } else if (this.type >= 103) {
            ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
            drawCuteAnime(ctx, this.x, this.y, this.radius * 2, '#000000', '#9900ff', 'cat');
            ctx.beginPath(); 
        }
        ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;

        const hpRatio = this.hp / this.maxHp;
        let barY = this.type >= 100 ? this.y - this.radius - 20 : this.y - this.radius - 10;
        ctx.fillStyle = 'red'; ctx.fillRect(this.x - this.radius, barY, this.radius*2, 4);
        ctx.fillStyle = '#0f0'; ctx.fillRect(this.x - this.radius, barY, (this.radius*2) * hpRatio, 4);
    }
}
