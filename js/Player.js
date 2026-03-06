// js/Player.js

class Player {
    constructor(type, weaponType, id) {
        this.id = id;
        this.type = type;
        this.weaponType = weaponType;
        this.x = (id === 'p1') ? canvas.width / 2 - 50 : canvas.width / 2 + 50;
        this.y = canvas.height - 80;
        this.width = 40; this.height = 40;
        this.hitboxRadius = 4;
        this.weaponLevel = 1;
        this.weaponExp = 0;
        this.weaponMaxExp = 3;
        this.shootCooldown = 0;

        if (type === 1) { this.speed = 6; this.maxHp = 100; this.shootDelay = 8; this.color = '#ff99cc'; } 
        else if (type === 2) { this.speed = 8.5; this.maxHp = 60; this.shootDelay = 5; this.color = '#9933ff'; } 
        else if (type === 3) { this.speed = 4; this.maxHp = 180; this.shootDelay = 10; this.color = '#33ccff'; }
        this.hp = this.maxHp;

        // Buff system modifiers
        this.damageMod = 0;
        this.bulletRadiusMod = 0;
        this.vampirism = false;
        this.shield = 0;
        this.greed = false;
        this.itemDropMod = 0;
        this.piercing = false;
    }

    updateLocally() {
        if (this.hp <= 0) {
            if (this.x !== -1000) { this.x = -1000; this.y = -1000; }
            return;
        }
        if (keys['arrowleft'] || keys['a']) this.x -= this.speed;
        if (keys['arrowright'] || keys['d']) this.x += this.speed;
        if (keys['arrowup'] || keys['w']) this.y -= this.speed;
        if (keys['arrowdown'] || keys['s']) this.y += this.speed;

        this.x = Math.max(this.width/2, Math.min(canvas.width - this.width/2, this.x));
        this.y = Math.max(this.height/2, Math.min(canvas.height - this.height/2, this.y));

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
        const speed = -15; const c = this.color; const rm = this.bulletRadiusMod;
        let wt = this.weaponType;

        // 1: Standard
        if (wt === 1) {
            let spreadCount = this.weaponLevel; // 1 to 5
            let startX = this.x - ((spreadCount - 1) * 8);
            for(let i=0; i<spreadCount; i++) {
                allBullets.push(new Bullet(startX + (16 * i), this.y - 20, 0, speed, c, false, this.id, rm));
            }
        } 
        // 2: Spread (Shotgun)
        else if (wt === 2) {
            let pelletCount = 2 + this.weaponLevel; // 3 to 7
            let spreadAngleBase = 0.5;
            for(let i=0; i<pelletCount; i++) {
                let vx = spreadAngleBase * (i - (pelletCount - 1) / 2);
                allBullets.push(new Bullet(this.x, this.y - 20, vx * 3, speed * 0.9, c, false, this.id, rm));
            }
        }
        // 3: Laser (Fast & Piercing innate)
        else if (wt === 3) {
            let count = Math.ceil(this.weaponLevel / 2); // 1, 1, 2, 2, 3
            let startX = this.x - ((count - 1) * 10);
            for(let i=0; i<count; i++) {
                let b = new Bullet(startX + (20 * i), this.y - 30, 0, speed * 1.5, '#fff', false, this.id, rm + 1, 3);
                b.naturalPiercing = true;
                allBullets.push(b);
            }
        }
        // 4: Homing
        else if (wt === 4) {
            let count = this.weaponLevel; // 1 to 5
            for(let i=0; i<count; i++) {
                let vx = (Math.random() - 0.5) * 6; // pop out sideways slightly
                allBullets.push(new Bullet(this.x, this.y - 15, vx, speed * 0.8, c, false, this.id, rm, 4));
            }
        }
        // 5: Wave
        else if (wt === 5) {
            let width = 2 + this.weaponLevel; // 3 to 7
            allBullets.push(new Bullet(this.x, this.y - 20, 0, Math.max(-8, speed * 0.6), c, false, this.id, rm, 5, width));
            if (this.weaponLevel >= 3) allBullets.push(new Bullet(this.x, this.y - 20, 0, Math.max(-8, speed * 0.6), c, false, this.id, rm, 5, -width)); // mirrored wave
        }
        // 6: Cannon
        else if (wt === 6) {
            let sizeMod = this.weaponLevel * 3;
            allBullets.push(new Bullet(this.x, this.y - 30, 0, -10, c, false, this.id, rm + sizeMod, 6)); // massive
        }
    }

    takeDamage(amount) {
        if (this.shield > 0) {
            this.shield--;
            if (typeof updateUI === "function") updateUI();
            return;
        }
        this.hp -= amount;
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
