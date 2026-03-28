// js/Enemy.js

class Enemy {
    constructor(x, y, type, id = 0) {
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
        else if (type === 101) { this.hp = 1500; this.color = '#ff007f'; this.speedY = 1.0; this.radius = 50; } // Neon Valkyrie
        else if (type === 102) { this.hp = 2500; this.color = '#ff3300'; this.speedY = 0.5; this.radius = 70; } // Cyber Behemoth
        else if (type === 103) { this.hp = 3000; this.color = '#c5a3ff'; this.speedY = 1.2; this.radius = 50; } // Prism Core
        else if (type === 104) { this.hp = 4000; this.color = '#00ffcc'; this.speedY = 0.8; this.radius = 90; } // Starship Carrier
        else if (type === 105) { this.hp = 4500; this.color = '#ff33cc'; this.speedY = 1.0; this.radius = 60; } // Plasma Eye
        else if (type === 106) { this.hp = 5500; this.color = '#9d00ff'; this.speedY = 1.5; this.radius = 65; } // Abyssal Spider
        else if (type === 107) { this.hp = 6500; this.color = '#00ffcc'; this.speedY = 2.0; this.radius = 45; } // Aero-Serpent
        else if (type === 108) { this.hp = 7500; this.color = '#ffffff'; this.speedY = 1.8; this.radius = 70; } // Twin-Core
        else if (type === 109) { this.hp = 8500; this.color = '#ff0000'; this.speedY = 3.0; this.radius = 55; } // Crimson Interceptor
        else if (type === 110) { this.hp = 12000; this.color = '#ffd700'; this.speedY = 0.4; this.radius = 100; } // Omega Engine
        else if (type > 110) { this.hp = 12000 + (type-110)*2000; this.color = '#ffffff'; this.speedY = 1.0; this.radius = 80; } // Infinity scaling

        this.maxHp = this.hp;
    }

    update() {
        if (this.type >= 100) {
            // Most bosses stop at y = 150
            if (this.y < 150 && this.type !== 109) {
                this.y += this.speedY;
            } else {
                // Boss Specific Movements
                if (!this.vx) this.vx = 2; // Default horizontal speed
                
                if (this.type === 102) { // Cyber Behemoth (Slow side to side)
                    this.vx = this.vx > 0 ? 1 : -1;
                    this.x += this.vx;
                    if (this.x < 150 || this.x > canvas.width - 150) this.vx *= -1;
                } else if (this.type === 104) { // Starship Carrier (Very wide, slow)
                    this.vx = this.vx > 0 ? 0.8 : -0.8;
                    this.x += this.vx;
                    if (this.x < 200 || this.x > canvas.width - 200) this.vx *= -1;
                } else if (this.type === 105) { // Plasma Eye (Center focus, slow drift)
                    this.x += Math.sin(this.timer * 0.02) * 1.5;
                } else if (this.type === 106) { // Abyssal Spider (Rapid dodger)
                    if (this.timer % 120 === 0) this.vx = (Math.random() - 0.5) * 15;
                    this.x += this.vx;
                    this.vx *= 0.9; // Friction
                    if (this.x < 100) { this.x = 100; this.vx = Math.abs(this.vx); }
                    if (this.x > canvas.width - 100) { this.x = canvas.width - 100; this.vx = -Math.abs(this.vx); }
                } else if (this.type === 107) { // Aero-Serpent (Slithers top)
                    this.x += Math.sin(this.timer * 0.05) * 4;
                    this.y = 80 + Math.cos(this.timer * 0.03) * 30; // Figure 8 up high
                } else if (this.type === 109) { // Crimson Interceptor (Fast Dasher)
                    if (this.timer % 150 === 0) {
                        this.vx = (Math.random() - 0.5) * 20;
                        this.vy = (Math.random() - 0.5) * 10;
                    }
                    if (this.timer % 150 < 40) { // Dash duration
                        this.x += this.vx || 0;
                        this.y += this.vy || 0;
                    }
                    this.x = Math.max(80, Math.min(canvas.width - 80, this.x));
                    this.y = Math.max(50, Math.min(300, this.y));
                } else if (this.type === 110) { // Omega Engine
                    this.x = canvas.width / 2 + Math.sin(this.timer * 0.01) * 30; // Very subtle sway
                    this.y = 120 + Math.sin(this.timer * 0.015) * 15;
                } else {
                    // Default erratic or sweep for 101, 103, 108
                    this.x += Math.sin(this.timer * 0.03) * 2.5;
                }
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
        if (!target) target = { x: canvas.width / 2, y: canvas.height }; // fallback

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
        if (this.type === 101) { // Neon Valkyrie
            let phase = Math.floor(this.timer / 150) % 2;
            if (phase === 0 && this.timer % 20 === 0) this.shootRadial(16, 4); // Nova rings
            else if (phase === 1 && this.timer % 15 === 0) this.shootTarget(target, 8); // Accurate burst
        } else if (this.type === 102) { // Cyber Behemoth
            if (this.timer % 80 === 0) {
                // Huge cannon ball 
                enemyBullets.push(new Bullet(this.x, this.y + 40, 0, 5, '#ff3300', true)); 
            }
            if (this.timer % 120 === 0) this.shootRadial(12, 3); // Shrapnel simulator
        } else if (this.type === 103) { // Prism Core
            if (this.timer % 6 === 0) this.shootSpiral(1.2, '#c5a3ff'); // Continuous spiral
        } else if (this.type === 104) { // Starship Carrier
            if (this.timer % 150 === 0) {
                // Spawn kamikaze
                if (typeof enemies !== 'undefined') {
                    enemies.push(new Enemy(this.x - 40, this.y + 20, 6)); 
                    enemies.push(new Enemy(this.x + 40, this.y + 20, 6)); 
                }
            }
            if (this.timer % 50 === 0) this.shootArc(12); // Sweeping wave
        } else if (this.type === 105) { // Plasma Eye
            // Continuous Laser Sweep (simulated by dense fast bullets sweeping)
            if (this.timer % 3 === 0) {
                let sweepAngle = Math.PI/2 + Math.sin(this.timer * 0.05) * 0.8; // Sweeps downwards left to right
                enemyBullets.push(new Bullet(this.x, this.y, Math.cos(sweepAngle)*12, Math.sin(sweepAngle)*12, '#ff33cc', true));
            }
        } else if (this.type === 106) { // Abyssal Spider
            if (this.timer % 90 === 0) this.shootMine(); // Web mines
            if (this.timer % 60 === 0 && Math.random() < 0.5) this.shootTarget(target, 7);
        } else if (this.type === 107) { // Aero-Serpent
            if (this.timer % 10 === 0) { // 3-way spread constant
                const speed = 5;
                enemyBullets.push(new Bullet(this.x, this.y, 0, speed, '#00ffcc', true));
                enemyBullets.push(new Bullet(this.x, this.y, -2, speed*0.9, '#00ffcc', true));
                enemyBullets.push(new Bullet(this.x, this.y, 2, speed*0.9, '#00ffcc', true));
            }
        } else if (this.type === 108) { // Twin-Core
            let phase = Math.floor(this.timer / 100) % 2;
            if (phase === 0 && this.timer % 10 === 0) { // Red fast
                enemyBullets.push(new Bullet(this.x - 45, this.y, 0, 8, '#ff003c', true));
            } else if (phase === 1 && this.timer % 40 === 0) { // Blue tracking
                const angle = Math.atan2(target.y - this.y, target.x - (this.x + 45));
                enemyBullets.push(new Bullet(this.x + 45, this.y, Math.cos(angle)*3, Math.sin(angle)*3, '#00f3ff', true));
            }
        } else if (this.type === 109) { // Crimson Interceptor
            if (this.timer % 150 === 60) { // Fires shortly after dashing
                this.shootArc(15); // Shotgun blast
                this.shootTarget(target, 10);
            }
        } else if (this.type >= 110) { // Omega Engine
            let hpRatio = this.hp / this.maxHp;
            if (hpRatio > 0.6) { // Phase 1
                if (this.timer % 8 === 0) this.shootSpiral(1.5, '#ffd700');
                if (this.timer % 60 === 0) this.shootRadial(15, 4);
            } else if (hpRatio > 0.3) { // Phase 2
                if (this.timer % 120 === 0 && typeof enemies !== 'undefined') enemies.push(new Enemy(this.x, this.y + 50, 5));
                if (this.timer % 4 === 0) {
                    let sweep = Math.PI/2 + Math.sin(this.timer * 0.1) * 1.0;
                    enemyBullets.push(new Bullet(this.x, this.y, Math.cos(sweep)*10, Math.sin(sweep)*10, '#ff0055', true));
                }
            } else { // Phase 3 (Desperation)
                if (this.timer % 5 === 0) {
                    let a = Math.random() * Math.PI * 2;
                    enemyBullets.push(new Bullet(this.x, this.y, Math.cos(a)*6, Math.sin(a)*6, '#ffffff', true));
                }
                if (this.timer % 30 === 0) this.shootTarget(target, 9);
            }
        }
    }

    shootTarget(target, speed) {
        const angle = Math.atan2(target.y - this.y, target.x - this.x);
        enemyBullets.push(new Bullet(this.x, this.y, Math.cos(angle) * speed, Math.sin(angle) * speed, '#ff003c', true));
    }
    shootRadial(amount, speed) {
        for (let i = 0; i < amount; i++) {
            const angle = (Math.PI * 2 / amount) * i;
            enemyBullets.push(new Bullet(this.x, this.y, Math.cos(angle) * speed, Math.sin(angle) * speed, this.color, true));
        }
    }
    shootSpiral(mult = 1, col = this.color) {
        const speed = 3 * mult; const angle = this.timer * 0.15 * mult;
        enemyBullets.push(new Bullet(this.x, this.y, Math.cos(angle) * speed, Math.sin(angle) * speed, col, true));
        enemyBullets.push(new Bullet(this.x, this.y, Math.cos(angle + Math.PI) * speed, Math.sin(angle + Math.PI) * speed, col, true));
    }
    shootArc(amount) {
        const speed = 2.5; const startAngle = Math.PI * 0.2; const endAngle = Math.PI * 0.8;
        for (let i = 0; i < amount; i++) {
            const angle = startAngle + (endAngle - startAngle) * (i / (amount - 1));
            enemyBullets.push(new Bullet(this.x, this.y, Math.cos(angle) * speed, Math.sin(angle) * speed, '#ff9900', true));
        }
    }
    shootMine() {
        enemyBullets.push(new Bullet(this.x, this.y, 0, 0.5, '#555555', true));
    }

    draw() {
        if (this.type < 100) {
            let imgScale = 1.6;
            let size = this.radius * 2 * imgScale;
            let offset = this.radius * imgScale;
            
            // จัดกลุ่มรูปลักษณ์ตามประเภทและหมุน 180 องศา
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(Math.PI); // หมุนลง 180 องศา
            
            if (this.type === 1 || this.type === 5 || this.type === 6 || this.type === 9) {
                if (imgAlienDrone.complete) ctx.drawImage(imgAlienDrone, -offset, -offset, size, size);
            } else if (this.type === 2 || this.type === 3 || this.type === 8) {
                if (imgAlienCruiser.complete) ctx.drawImage(imgAlienCruiser, -offset, -offset, size, size);
            } else {
                if (imgAlienBomber.complete) ctx.drawImage(imgAlienBomber, -offset, -offset, size, size);
            }
            
            ctx.restore();
        } else {
            // Render Bosses based on Type (รูปแบบเก่าดั้งเดิม)
            if (this.type === 101) drawBoss101(ctx, this.x, this.y, this.radius * 2);
            else if (this.type === 102) drawBoss102(ctx, this.x, this.y, this.radius * 2);
            else if (this.type === 103) drawBoss103(ctx, this.x, this.y, this.radius * 2);
            else if (this.type === 104) drawBoss104(ctx, this.x, this.y, this.radius * 2);
            else if (this.type === 105) drawBoss105(ctx, this.x, this.y, this.radius * 2);
            else if (this.type === 106) drawBoss106(ctx, this.x, this.y, this.radius * 2);
            else if (this.type === 107) drawBoss107(ctx, this.x, this.y, this.radius * 2);
            else if (this.type === 108) drawBoss108(ctx, this.x, this.y, this.radius * 2);
            else if (this.type === 109) drawBoss109(ctx, this.x, this.y, this.radius * 2);
            else if (this.type === 110) drawBoss110(ctx, this.x, this.y, this.radius * 2);
            else drawBoss110(ctx, this.x, this.y, this.radius * 2); // Fallback for 111+
        }

        const hpRatio = this.hp / this.maxHp;
        let barY = this.type >= 100 ? this.y - this.radius - 20 : this.y - this.radius - 10;
        ctx.fillStyle = 'red'; ctx.fillRect(this.x - this.radius, barY, this.radius * 2, 4);
        ctx.fillStyle = '#0f0'; ctx.fillRect(this.x - this.radius, barY, (this.radius * 2) * hpRatio, 4);
    }
}
