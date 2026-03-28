// js/Player.js //Weapon

class Player {
    constructor(type, weaponType, id) {
        this.id = id;
        this.type = parseInt(type);
        this.weaponType = parseInt(weaponType);
        this.x = (id === 'p1') ? canvas.width / 2 - 50 : canvas.width / 2 + 50;
        this.y = canvas.height - 80;
        this.width = 40; this.height = 40;
        this.hitboxRadius = 4;
        this.weaponLevel = 1;
        this.weaponExp = 0;
        this.weaponMaxExp = 3;
        this.shootCooldown = 0;

        if (type === 1) { this.speed = 6; this.maxHp = 100; this.shootDelay = 16; this.color = '#ff99cc'; }
        else if (type === 2) { this.speed = 8.5; this.maxHp = 60; this.shootDelay = 10; this.color = '#9933ff'; }
        else if (type === 3) { this.speed = 4; this.maxHp = 180; this.shootDelay = 20; this.color = '#33ccff'; }

        // Weapon Balance: Fire Rate Modifiers
        if (this.weaponType === 1) this.shootDelay = Math.floor(this.shootDelay * 1.0); // Standard
        else if (this.weaponType === 2) this.shootDelay = Math.floor(this.shootDelay * 1.0); // Spread
        else if (this.weaponType === 3) this.shootDelay = Math.max(2, Math.floor(this.shootDelay * 0.8)); // Laser: Faster
        else if (this.weaponType === 4) this.shootDelay = Math.floor(this.shootDelay * 1.5); // Homing: Slower (Nerf from 1.8 to 1.5)
        else if (this.weaponType === 5) this.shootDelay = Math.floor(this.shootDelay * 1.2); // Wave: Slightly slower
        else if (this.weaponType === 6) this.shootDelay = Math.floor(this.shootDelay * 2.5); // Cannon: Very Slow

        this.hp = this.maxHp;

        // Buff system modifiers
        this.damageMod = 0;
        this.bulletRadiusMod = 0;
        this.vampirism = false;
        this.shield = 0;
        this.greed = false;
        this.itemDropMod = 0;
        this.piercing = false;
        // Laser mechanics
        this.laserHeat = 0; // 0 to 600 (10 seconds at 60fps)
        this.laserOverheated = false;
        this.isShootingLaser = false;

        // Ultimate Mechanics
        this.ultCharge = 0; // 0 to 100
        this.ultActive = false;
        this.ultTimer = 0; // For duration-based ultimates
        
        // Aiming Mechanics
        this.aimAngle = -Math.PI / 2; // Default facing up
    }

    updateLocally() {
        if (this.hp <= 0) {
            if (this.x !== -1000) { this.x = -1000; this.y = -1000; }
            return;
        }

        if (selectedControlType === 'pc') {
            if (keys['arrowleft'] || keys['a'] || keys['keya']) this.x -= this.speed;
            if (keys['arrowright'] || keys['d'] || keys['keyd']) this.x += this.speed;
            if (keys['arrowup'] || keys['w'] || keys['keyw']) this.y -= this.speed;
            if (keys['arrowdown'] || keys['s'] || keys['keys']) this.y += this.speed;
        } else if (selectedControlType === 'mobile') {
            if (joystickActive) {
                this.x += joystickVector.x * this.speed;
                this.y += joystickVector.y * this.speed;
            }
        }

        this.x = Math.max(this.width / 2, Math.min(canvas.width - this.width / 2, this.x));
        this.y = Math.max(this.height / 2, Math.min(canvas.height - this.height / 2, this.y));

        // Update Aim Angle
        if (selectedControlType === 'pc') {
            this.aimAngle = Math.atan2(mousePos.y - this.y, mousePos.x - this.x);
        } else if (selectedControlType === 'mobile') {
            if (lockedTargetId !== null) {
                let target = enemies.find(e => e.id === lockedTargetId);
                if (target) {
                    this.aimAngle = Math.atan2(target.y - this.y, target.x - this.x);
                } else {
                    lockedTargetId = null;
                }
            }
            if (lockedTargetId === null && enemies.length > 0) {
                // Auto-aim nearest
                let closest = null;
                let minDist = Infinity;
                for (let en of enemies) {
                    let d = Math.hypot(en.x - this.x, en.y - this.y);
                    if (d < minDist) { minDist = d; closest = en; }
                }
                if (closest && minDist < 800) {
                    this.aimAngle = Math.atan2(closest.y - this.y, closest.x - this.x);
                } else {
                    this.aimAngle = -Math.PI / 2;
                }
            } else if (enemies.length === 0) {
                this.aimAngle = -Math.PI / 2;
            }
        }

        if (this.shootCooldown > 0) this.shootCooldown--;
    }

    upgradeWeapon() {
        if (this.weaponLevel >= 5) {
            score += 500;
            return;
        }
        this.weaponExp++;
        if (this.weaponExp >= this.weaponMaxExp) {
            this.weaponLevel++;
            this.weaponExp = 0;
            this.weaponMaxExp = this.weaponLevel * 3;
        }
        if (typeof updateUI === "function") updateUI();
    }

    shoot() {
        if (this.hp <= 0) return;
        const c = this.color; const rm = this.bulletRadiusMod;
        let wt = this.weaponType;

        // 1: Standard
        if (wt === 1) {
            let speed = 18;
            let spreadCount = this.weaponLevel; // 1 to 5
            let angleSpread = 0.15; // Radians
            let startAngle = this.aimAngle - ((spreadCount - 1) / 2) * angleSpread;
            for (let i = 0; i < spreadCount; i++) {
                let a = startAngle + i * angleSpread;
                allBullets.push(new Bullet(this.x, this.y, Math.cos(a)*speed, Math.sin(a)*speed, c, false, this.id, rm, 1));
            }
        }
        // 2: Spread (Shotgun)
        else if (wt === 2) {
            let speed = 12;
            let pelletCount = 2 + this.weaponLevel; // 3 to 7
            let angleSpreadBase = 0.25;
            for (let i = 0; i < pelletCount; i++) {
                let a = this.aimAngle + (Math.random() - 0.5) * angleSpreadBase * pelletCount;
                let s = speed * (0.8 + Math.random() * 0.4);
                allBullets.push(new Bullet(this.x, this.y, Math.cos(a)*s, Math.sin(a)*s, c, false, this.id, rm, 2));
            }
        }
        // 3: Laser (Continuous Beam)
        else if (wt === 3) {
            if (this.laserOverheated) return; // Cannot shoot
            
            this.isShootingLaser = true;
            this.laserHeat += 1; // 1 heat per frame
            if (this.laserHeat >= 600) { // 10 seconds at 60 FPS
                this.laserOverheated = true;
                pushEvent('explosion', { x: this.x, y: this.y, c: '#ff003c', amount: 30 }); // minor visual feedback
            }

            // We let engine.js handle the actual beam rendering and collision for wt===3
        }
        // 4: Homing
        else if (wt === 4) {
            let speed = 10;
            let count = this.weaponLevel; // 1 to 5
            for (let i = 0; i < count; i++) {
                let a = this.aimAngle + (Math.random() - 0.5) * 1.5; 
                allBullets.push(new Bullet(this.x, this.y, Math.cos(a)*speed, Math.sin(a)*speed, c, false, this.id, rm, 4));
            }
        }
        // 5: Wave
        else if (wt === 5) {
            let speed = 14;
            let width = 2 + this.weaponLevel; // 3 to 7
            let cosA = Math.cos(this.aimAngle);
            let sinA = Math.sin(this.aimAngle);
            allBullets.push(new Bullet(this.x, this.y, cosA*speed, sinA*speed, c, false, this.id, rm, 5, width));
            if (this.weaponLevel >= 3) {
                allBullets.push(new Bullet(this.x, this.y, cosA*speed, sinA*speed, c, false, this.id, rm, 5, -width)); // mirrored wave
            }
        }
        // 6: Cannon
        else if (wt === 6) {
            let speed = 8;
            let sizeMod = this.weaponLevel * 4; // bigger bullets
            let b = new Bullet(this.x, this.y, Math.cos(this.aimAngle)*speed, Math.sin(this.aimAngle)*speed, c, false, this.id, rm + sizeMod, 6); 
            if (Math.random() < 0.5) b.naturalPiercing = true; // 50% chance to pierce
            allBullets.push(b);
        }
    }

    activateUltimate() {
        if (this.hp <= 0 || this.ultCharge < 99 || this.ultActive) return;
        
        this.ultCharge = 0;
        this.ultActive = true;
        let wt = this.weaponType;

        // Visual cue for Activation
        pushEvent('explosion', { x: this.x, y: this.y, c: '#ffffff', amount: 50 });
        createExplosion(this.x, this.y, '#ffffff', 50);

        if (wt === 1) {
            // Standard: Giga Buster (3 seconds duration, handled in gameLoop)
            this.ultTimer = 180; // 60 frames * 3 sec
        } else if (wt === 2) {
            // Spread: Supernova Burst (Instant 3 waves of huge pellets)
            let burst = () => {
                if (this.hp <= 0) return;
                for (let i = 0; i < 36; i++) {
                    let angle = (i * 10) * (Math.PI / 180);
                    let vx = Math.cos(angle) * 15;
                    let vy = Math.sin(angle) * 15;
                    allBullets.push(new Bullet(this.x, this.y, vx, vy, this.color, false, this.id, 10, 2)); // Huge pellets
                }
                pushEvent('explosion', { x: this.x, y: this.y, c: this.color, amount: 20 });
            };
            burst();
            setTimeout(burst, 300);
            setTimeout(() => { burst(); this.ultActive = false; }, 600);
        } else if (wt === 3) {
            // Laser: Zero Core Override (5 seconds duration, massive laser, no overheat)
            this.ultTimer = 300; // 60 frames * 5 sec
            this.laserHeat = 0;
            this.laserOverheated = false;
        } else if (wt === 4) {
            // Homing: Swarm Protocol (50 micro missiles instantly)
            for (let i = 0; i < 50; i++) {
                let vx = (Math.random() - 0.5) * 20;
                let vy = -Math.random() * 15 - 5;
                allBullets.push(new Bullet(this.x, this.y, vx, vy, this.color, false, this.id, 2, 4));
            }
            this.ultActive = false;
        } else if (wt === 5) {
            // Wave: Tsunami Overdrive (5 massive waves spanning the screen)
            let waveCount = 0;
            let fireWave = () => {
                if (this.hp <= 0) return;
                allBullets.push(new Bullet(this.x, this.y, 0, -10, this.color, false, this.id, 15, 5, 20)); // Massive width modifier
                pushEvent('explosion', { x: this.x, y: this.y, c: this.color, amount: 20 });
                waveCount++;
                if (waveCount < 5) setTimeout(fireWave, 400);
                else this.ultActive = false;
            };
            fireWave();
        } else if (wt === 6) {
            // Cannon: Obliteration Nuke (One slow, ultra massive black hole bullet)
            let b = new Bullet(this.x, this.y - 40, 0, -3, '#111', false, this.id, 50, 6); // Massive radius 50+ min
            b.isNuke = true; // Flag for special collision logic
            b.naturalPiercing = true;
            allBullets.push(b);
            this.ultActive = false;
        }
    }

    takeDamage(amount) {
        if (this.shield > 0) {
            this.shield--;
            if (typeof updateUI === "function") updateUI();
            return;
        }
        
        this.hp -= amount;
        
        // --- Add UI Shake Effects ---
        let pNum = this.id === 'p1' ? 1 : 2;
        if (typeof UIAnimations !== 'undefined') {
            UIAnimations.hpBoxShake(pNum);
            // Screen shake heavily only if local player takes damage
            if (this.id === myPlayerId) {
                UIAnimations.screenShake(10, 300);
            }
        }
        // -----------------------------
        if (this.hp <= 0) {
            this.hp = 0;
            createExplosion(this.x, this.y, this.color, 50);
            pushEvent('explosion', { x: this.x, y: this.y, c: this.color, amount: 50 });
        }
        if (typeof updateUI === "function") updateUI();
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
        if (typeof updateUI === "function") updateUI();
    }

    applyBuff(buffId) {
        if (buffId === 0) { this.maxHp += 50; this.hp += 50; }
        else if (buffId === 1) { this.speed += 1.5; }
        else if (buffId === 2) { this.shootDelay = Math.max(2, this.shootDelay - 1); }
        else if (buffId === 3) { this.damageMod += 5; }
        else if (buffId === 4) { this.hp = this.maxHp; }
        else if (buffId === 5) { this.weaponLevel = Math.min(5, this.weaponLevel + 1); this.weaponMaxExp = this.weaponLevel * 3; }
        else if (buffId === 6) { this.bulletRadiusMod += 2; }
        else if (buffId === 7) { this.vampirism = true; }
        else if (buffId === 8) { this.shield++; }
        else if (buffId === 9) { this.greed = true; }
        else if (buffId === 10) { this.itemDropMod += 0.1; }
        else if (buffId === 11) { this.piercing = true; }
        if (typeof updateUI === "function") updateUI();
    }

    draw() {
        if (this.hp <= 0) {
            if (this.id === myPlayerId) {
                document.getElementById('spectateOverlay').style.display = 'block';
            }
            return;
        }
        if (this.id === myPlayerId) document.getElementById('spectateOverlay').style.display = 'none';

        ctx.globalAlpha = (this.id === myPlayerId) ? 1.0 : 0.7; // Ally slightly transparent
        if (this.type === 1) drawShipStriker(ctx, this.x, this.y, this.width);
        else if (this.type === 2) drawShipPhantom(ctx, this.x, this.y, this.width);
        else drawShipTitan(ctx, this.x, this.y, this.width);
        ctx.globalAlpha = 1.0;

        // Hitbox
        ctx.fillStyle = '#ff003c'; ctx.beginPath();
        ctx.arc(this.x, this.y, this.hitboxRadius, 0, Math.PI * 2); ctx.fill();

        // Name Tag & Shield
        ctx.fillStyle = 'white'; ctx.font = '10px Arial'; ctx.textAlign = 'center';
        let txt = this.id === myPlayerId ? 'YOU' : 'P2';
        if (this.shield > 0) txt += ` [Shield: ${this.shield}]`;
        ctx.fillText(txt, this.x, this.y + 30);
    }
}
