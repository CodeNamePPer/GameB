// js/engine.js

function spawnEnemies() {
    if (!isHost) return;

    // Check for Boss spawn
    if (bossTimer >= 1800 && !isBossActive) {
        isBossActive = true;
        let bossType = 100 + waveCount; // 101, 102, 103, ...
        
        let boss = null;
        if (waveCount <= 10) {
            boss = new Enemy(canvas.width / 2, -100, bossType);
        } else {
            // Randomize boss after wave 10
            let randomType = 101 + Math.floor(Math.random() * 10);
            boss = new Enemy(canvas.width / 2, -100, randomType);
            // Apply health scaling for infinite waves
            let extraScaling = (waveCount - 10) * 2000;
            boss.maxHp += extraScaling;
            boss.hp = boss.maxHp;
        }

        enemies.push(boss);
        pushEvent('bossAlert', {});
        return;
    }

    if (isBossActive) return; // Stop normal spawns

    // Limit maximum normal enemies on screen at once
    let normalEnemiesCount = enemies.filter(e => e.type < 100).length;
    if (normalEnemiesCount >= 8) return;

    const sr = Math.max(25, 80 - Math.floor(score / 300) - waveCount * 2);
    if (frameCount % sr === 0) {
        const x = Math.random() * (canvas.width - 60) + 30;
        let type = 1;
        const rand = Math.random();

        // Progressive unlock based on wave
        if (waveCount === 1) {
            if (rand > 0.5) type = 2;
            if (rand > 0.8) type = 6;
        } else if (waveCount === 2) {
            if (rand > 0.4) type = 2;
            if (rand > 0.6) type = 3;
            if (rand > 0.75) type = 5;
            if (rand > 0.9) type = 6;
        } else if (waveCount === 3) {
            if (rand > 0.3) type = 3;
            if (rand > 0.5) type = 4;
            if (rand > 0.7) type = 7;
            if (rand > 0.85) type = 8;
        } else {
            // Wave 4+ All types
            type = Math.floor(Math.random() * 10) + 1;
        }

        enemies.push(new Enemy(x, -30, type));
    }
}

function updateUI() {
    let scoreEl = document.getElementById('scoreValue');
    let oldScore = parseInt(scoreEl.innerText) || 0;
    scoreEl.innerText = score;
    if (score > oldScore && typeof UIAnimations !== 'undefined') {
        UIAnimations.animateScore();
    }

    let p1 = players['p1'];
    if (p1) {
        const perc1 = (p1.hp / p1.maxHp) * 100;
        const hp1 = document.getElementById('hpBar1');
        hp1.style.width = `${perc1}%`;
        hp1.style.backgroundColor = perc1 < 30 ? '#ff003c' : '#45a29e';
        
        const ult1 = document.getElementById('ultBar1');
        ult1.style.width = `${Math.min(100, p1.ultCharge)}%`;
        ult1.style.backgroundColor = p1.ultCharge >= 99 ? '#fff' : '#ffd700';

        document.getElementById('weaponLvValue1').innerText = p1.weaponLevel === 5 ? 'MAX' : p1.weaponLevel;
        document.getElementById('weaponExp1').innerText = p1.weaponLevel === 5 ? '[MAX]' : `[${p1.weaponExp}/${p1.weaponMaxExp}]`;
    }

    let p2 = players['p2'];
    if (p2 && isMultiplayer) {
        document.getElementById('p2UiBox').style.display = 'flex';
        const perc2 = (p2.hp / p2.maxHp) * 100;
        const hp2 = document.getElementById('hpBar2');
        hp2.style.width = `${perc2}%`;
        hp2.style.backgroundColor = perc2 < 30 ? '#ff003c' : '#45a29e';

        const ult2 = document.getElementById('ultBar2');
        if (ult2) {
            ult2.style.width = `${Math.min(100, p2.ultCharge)}%`;
            ult2.style.backgroundColor = p2.ultCharge >= 99 ? '#fff' : '#ffd700';
        }

        document.getElementById('weaponLvValue2').innerText = p2.weaponLevel === 5 ? 'MAX' : p2.weaponLevel;
        document.getElementById('weaponExp2').innerText = p2.weaponLevel === 5 ? '[MAX]' : `[${p2.weaponExp}/${p2.weaponMaxExp}]`;
    }
}

function showGameOver() {
    gameActive = false;
    document.getElementById('finalScore').innerText = score;
    if (typeof UIAnimations !== 'undefined') {
        UIAnimations.showMenu('gameOverScreen');
    } else {
        document.getElementById('gameOverScreen').style.display = 'flex';
    }
}

function startGameAsHost(clientShipType, clientWeaponType) {
    if (typeof UIAnimations !== 'undefined') UIAnimations.hideMenu('mainMenu');
    else mainMenu.style.display = 'none';
    uiLayer.style.display = 'block';

    if (selectedControlType === 'mobile') {
        if (typeof UIAnimations !== 'undefined') UIAnimations.showMenu('mobileControls', 'block');
        else document.getElementById('mobileControls').style.display = 'block';
    }

    myPlayerId = 'p1';
    players['p1'] = new Player(selectedShipType, selectedWeaponType, 'p1');

    if (isMultiplayer && clientShipType) {
        players['p2'] = new Player(clientShipType, clientWeaponType || 1, 'p2');
        connection.send({ type: 'start', hostShipType: selectedShipType, hostWeaponType: selectedWeaponType, clientShipType: clientShipType, clientWeaponType: clientWeaponType });
    }

    allBullets = []; enemyBullets = []; enemies = []; items = []; particles = [];
    stars = Array.from({ length: 50 }, () => new Star());

    score = 0; frameCount = 0; gameActive = true; isBossActive = false; waveCount = 1; bossTimer = 0;
    document.getElementById('gameOverScreen').style.display = 'none';

    updateUI();
    gameLoop();
}

function startGameAsClient(myShipType, hostShipType, myWeaponType, hostWeaponType) {
    if (typeof UIAnimations !== 'undefined') UIAnimations.hideMenu('mainMenu');
    else mainMenu.style.display = 'none';
    uiLayer.style.display = 'block';

    if (selectedControlType === 'mobile') {
        if (typeof UIAnimations !== 'undefined') UIAnimations.showMenu('mobileControls', 'block');
        else document.getElementById('mobileControls').style.display = 'block';
    }

    myPlayerId = 'p2';
    players['p1'] = new Player(hostShipType, hostWeaponType, 'p1');
    players['p2'] = new Player(myShipType, myWeaponType, 'p2');

    allBullets = []; enemyBullets = []; enemies = []; items = []; particles = [];
    stars = Array.from({ length: 50 }, () => new Star());

    score = 0; frameCount = 0; gameActive = true; isBossActive = false; waveCount = 1; bossTimer = 0;
    document.getElementById('gameOverScreen').style.display = 'none';

    updateUI();
    gameLoop();
}

function startDraft() {
    isDrafting = true;
    draftChoices = [];
    
    // Weapon-specific weights for p1
    let wt = (players['p1'] && players['p1'].hp > 0) ? players['p1'].weaponType : 1;
    let wLv = (players['p1'] && players['p1'].hp > 0) ? players['p1'].weaponLevel : 1;
    let pool = [];

    BUFFS.forEach(buff => {
        let weight = 10; // base weight
        
        // General Weapon Level priority
        if (buff.title === "WEAPON UPGRADE") {
            if (wLv < 5) {
                weight = 80; // Extremely high priority to upgrade weapons quickly
            } else {
                weight = 0; // Skip if already MAX
            }
        }

        if (wt === 1) { // Standard: all around good
            // Triple shot already handled above
        } else if (wt === 2) { // Spread: wants damage and piercing
            if (buff.title === "DAMAGE UP") weight = 20;
            if (buff.title === "PIERCING") weight = 30;
        } else if (wt === 3) { // Laser: heat management (fire rate acts as cooling), damage
            if (buff.title === "FIRE RATE UP") weight = 25; // acts as cooling
            if (buff.title === "DAMAGE UP") weight = 20;
        } else if (wt === 4) { // Homing: speed and fire rate
            if (buff.title === "FIRE RATE UP") weight = 25;
            if (buff.title === "SPEED UP") weight = 15;
        } else if (wt === 5) { // Wave: fire rate and damage
            if (buff.title === "FIRE RATE UP") weight = 20;
            if (buff.title === "DAMAGE UP") weight = 15;
        } else if (wt === 6) { // Cannon: fire rate is king, speed is necessary
            if (buff.title === "SPEED UP") weight = 20;
            if (buff.title === "FIRE RATE UP") weight = 30;
            if (buff.title === "BULLET SIZE UP") weight = 20;
        }
        
        if (weight > 0) {
            for (let i = 0; i < weight; i++) pool.push(buff);
        }
    });

    for (let i = 0; i < 3; i++) {
        let idx = Math.floor(Math.random() * pool.length);
        let selected = { ...pool[idx] }; // Clone to avoid mutating global BUFFS

        // Dynamic Name for Weapon Upgrade
        if (selected.id === 5) {
            if (wt === 1) { selected.title = "TWIN/TRIPLE BLASTER"; selected.desc = "+1 Weapon Level. Fires additional parallel shots."; }
            else if (wt === 2) { selected.title = "SPREAD UPGRADE"; selected.desc = "+1 Weapon Level. Fires more pellets over a wider arc."; }
            else if (wt === 3) { selected.title = "BEAM INTENSIFY"; selected.desc = "+1 Weapon Level. Laser becomes wider and deals more damage."; }
            else if (wt === 4) { selected.title = "MISSILE BARRAGE"; selected.desc = "+1 Weapon Level. Fire more micro-missiles per volley."; }
            else if (wt === 5) { selected.title = "TSUNAMI EXPANSION"; selected.desc = "+1 Weapon Level. Energy waves become larger and hit wider."; }
            else if (wt === 6) { selected.title = "CANNON CALIBER UP"; selected.desc = "+1 Weapon Level. Cannonballs become larger and more devastating."; }
        }

        draftChoices.push(selected);
        pool = pool.filter(b => b.id !== selected.id); // Remove all instances of the same buff
        if (pool.length === 0) break; // Fallback
    }
    draftPicks = { p1: null, p2: null };
    if (!isMultiplayer || (players['p2'] && players['p2'].hp <= 0)) draftPicks.p2 = -1; // Auto skip dead p2
    if (players['p1'] && players['p1'].hp <= 0) draftPicks.p1 = -1;

    if (isMultiplayer && connection && connection.open) {
        connection.send({ type: 'draft_start', choices: draftChoices });
    }

    showDraftScreen();
}

function showDraftScreen() {
    if (typeof UIAnimations !== 'undefined') {
        document.getElementById('draftScreen').style.display = 'block';
        UIAnimations.animateDraftPopup();
    } else {
        document.getElementById('draftScreen').style.display = 'block';
    }
    document.getElementById('draftWaitText').style.display = 'none';
    document.getElementById('draftCards').style.pointerEvents = 'auto'; // allow re-clicking safely
    let container = document.getElementById('draftCards');
    container.innerHTML = '';

    // If dead, skip instantly
    let me = players[myPlayerId];
    if (!me || me.hp <= 0) {
        container.innerHTML = '<p style="color:#ff003c; font-size:24px;">Ship Destroyed. Cannot Pick Module.</p>';
        submitDraftPick(-1);
        return;
    }

    draftChoices.forEach((buff) => {
        let div = document.createElement('div');
        div.className = 'draft-card';
        div.innerHTML = `<span class="draft-icon">${buff.icon}</span><div class="draft-title">${buff.title}</div><div class="draft-desc">${buff.desc}</div>`;
        div.onclick = () => {
            document.querySelectorAll('.draft-card').forEach(c => c.classList.remove('selected'));
            div.classList.add('selected');
            submitDraftPick(buff.id);
        };
        container.appendChild(div);
    });
}

function submitDraftPick(buffId) {
    document.getElementById('draftCards').style.pointerEvents = 'none';
    document.getElementById('draftWaitText').style.display = 'block';

    if (isHost) {
        draftPicks[myPlayerId] = buffId;
        checkDraftComplete();
    } else {
        connection.send({ type: 'draft_pick', playerId: myPlayerId, pick: buffId });
    }
}

function checkDraftComplete() {
    if (!isHost) return;
    if (draftPicks.p1 !== null && (!isMultiplayer || draftPicks.p2 !== null)) {
        // Both picked
        if (draftPicks.p1 >= 0 && players['p1']) players['p1'].applyBuff(draftPicks.p1);
        if (isMultiplayer && draftPicks.p2 >= 0 && players['p2']) players['p2'].applyBuff(draftPicks.p2);

        isDrafting = false;
        waveCount++;
        let waveEl = document.getElementById('waveValue');
        if (waveEl) waveEl.innerText = waveCount;
        if (typeof UIAnimations !== 'undefined') UIAnimations.animateWavePopup();

        if (isMultiplayer && connection && connection.open) {
            connection.send({ type: 'draft_end', p1Pick: draftPicks.p1, p2Pick: draftPicks.p2 });
        }
        
        if (typeof UIAnimations !== 'undefined') UIAnimations.hideMenu('draftScreen');
        else document.getElementById('draftScreen').style.display = 'none';


        // Reset state slightly after boss
        allBullets = []; enemyBullets = []; items = [];
        bossTimer = 0;
    }
}

function gameLoop() {
    if (!gameActive) return;

    if (isDrafting) {
        // Freeze gameplay but keep rendering
        ctx.fillStyle = '#0b0c10'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        stars.forEach(s => { s.update(); s.draw(); });
        for (let pid in players) players[pid].draw();
        animationId = requestAnimationFrame(gameLoop);
        return;
    }

    frameCount++;
    if (!isBossActive) bossTimer++;

    // Reset laser shooting flag for all players at start of frame
    for (let pid in players) {
        if (players[pid]) players[pid].isShootingLaser = false;
    }

    let me = players[myPlayerId];
    if (me && me.hp > 0) {
        if (selectedControlType === 'pc') {
            me.updateLocally();
            if ((keys[' '] || keys['space']) && (me.shootCooldown <= 0 || me.weaponType === 3)) {
                me.shoot();
                me.shootCooldown = me.shootDelay;
            }
            if ((keys['q'] || keys['keyq']) && me.ultCharge >= 99 && !me.ultActive) {
                if (typeof me.activateUltimate === "function") me.activateUltimate();
            }
        } else if (selectedControlType === 'mobile') {
            me.updateLocally();

            // Auto-fire while holding FIRE button
            if (isShooting && (me.shootCooldown <= 0 || me.weaponType === 3)) {
                me.shoot();
                me.shootCooldown = me.shootDelay;
            }
            if (isPressingUlt && me.ultCharge >= 99 && !me.ultActive) {
                if (typeof me.activateUltimate === "function") me.activateUltimate();
            }
        }
    }

    // Host decays p2 cooldown to match client's frame limit logic
    if (isHost && isMultiplayer && players['p2'] && players['p2'].shootCooldown > 0) {
        players['p2'].shootCooldown--;
    }

    // Dissipate laser heat for any player not shooting
    for (let pid in players) {
        let p = players[pid];
        if (p && p.weaponType === 3 && !p.isShootingLaser && p.laserHeat > 0) {
            p.laserHeat = Math.max(0, p.laserHeat - 1); // Recover 1 per frame
            if (p.laserHeat === 0) p.laserOverheated = false;
        }
        
        // Passive Ultimate Generation
        if (p && p.hp > 0 && !p.ultActive && frameCount % 6 === 0) {
            p.ultCharge = Math.min(100, p.ultCharge + 0.5); // Charge over time
            if (p.ultCharge >= 99 && frameCount % 60 === 0 && typeof updateUI === "function") updateUI(); // Optional pulse effect could trigger here
        }
    }

    // Update Time display
    if (frameCount % 10 === 0) {
        let timeRemaining = Math.max(0, 30 - Math.floor(bossTimer / 60));
        let timerEl = document.getElementById('bossTimerValue');
        if (timerEl) {
            if (isBossActive) { timerEl.innerText = "BOSS FIGHT!!"; timerEl.style.color = "#ff003c"; }
            else { timerEl.innerText = timeRemaining + "s"; timerEl.style.color = "#ffeb3b"; }
        }
    }

    stars.forEach(s => s.update());

    // 2. Network Sync
    if (isMultiplayer && frameCount % 2 === 0 && connection && connection.open) { // 30 FPS sync
        if (isHost) {
            // Host sends world state
            let state = {
                type: 'sync',
                score: score,
                wave: waveCount,
                boss: isBossActive,
                p1: players['p1'] ? { x: players['p1'].x, y: players['p1'].y, hp: players['p1'].hp, maxHp: players['p1'].maxHp, wl: players['p1'].weaponLevel, wexp: players['p1'].weaponExp, wmx: players['p1'].weaponMaxExp, isShootingLaser: players['p1'].isShootingLaser, laserHeat: players['p1'].laserHeat, laserOverheated: players['p1'].laserOverheated, ultCharge: players['p1'].ultCharge, ultActive: players['p1'].ultActive, ultTimer: players['p1'].ultTimer, aimAngle: players['p1'].aimAngle } : null,
                p2: players['p2'] ? { hp: players['p2'].hp, maxHp: players['p2'].maxHp, wl: players['p2'].weaponLevel, wexp: players['p2'].weaponExp, wmx: players['p2'].weaponMaxExp, isShootingLaser: players['p2'].isShootingLaser, laserHeat: players['p2'].laserHeat, laserOverheated: players['p2'].laserOverheated, ultCharge: players['p2'].ultCharge, ultActive: players['p2'].ultActive, ultTimer: players['p2'].ultTimer, aimAngle: players['p2'].aimAngle } : null, // Host sends HP & EXP
                enemies: enemies.map(e => ({ x: Math.floor(e.x), y: Math.floor(e.y), t: e.type, hp: e.hp, mhp: e.maxHp, id: e.id })),
                items: items.map(i => ({ x: Math.floor(i.x), y: Math.floor(i.y), t: i.type, id: i.id })),
                eBullets: enemyBullets.map(b => ({ x: Math.floor(b.x), y: Math.floor(b.y), vx: b.vx, vy: b.vy, c: b.color, rm: b.radiusMod, bt: b.type })),
                hostBullets: allBullets.filter(b => b.owner === 'p1').map(b => ({ x: Math.floor(b.x), y: Math.floor(b.y), vx: b.vx, vy: b.vy, c: b.color, bt: b.type, rm: b.radiusMod, ww: b.waveW })),
                events: networkEvents
            };
            connection.send(state);
            networkEvents = []; // clear after send
        } else {
            // Client sends its pos and bullets
            let state = {
                type: 'sync',
                px: me.x,
                py: me.y,
                aim: me.aimAngle,
                shoot: (selectedControlType === 'pc' ? (keys[' '] || keys['space'] || keys['mouse0']) : isShooting),
                ult: (selectedControlType === 'pc' ? (keys['q'] || keys['keyq']) : isPressingUlt)
            };
            connection.send(state);
        }
    }

    // 3. Game Logic (Host only for interactions, Client for visual extrapolation)
    if (isHost) spawnEnemies();

    // Update Bullets
    for (let i = allBullets.length - 1; i >= 0; i--) {
        let b = allBullets[i]; b.update();
        if (b.y < -10 || b.y > canvas.height + 10 || b.x < -10 || b.x > canvas.width + 10) allBullets.splice(i, 1);
    }
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        let b = enemyBullets[i]; b.update();
        if (b.y < -10 || b.y > canvas.height + 10 || b.x < -10 || b.x > canvas.width + 10) enemyBullets.splice(i, 1);
    }

    if (isHost) {
        // Update Enemies & Items
        for (let i = enemies.length - 1; i >= 0; i--) {
            let e = enemies[i];
            e.update();
            // Only despawn normal enemies at bottom, Boss won't reach bottom anyway, but just in case
            if (e.y > canvas.height + 50 && e.type < 100) enemies.splice(i, 1);
        }
        for (let i = items.length - 1; i >= 0; i--) { let it = items[i]; it.update(); if (it.y > canvas.height + 20) items.splice(i, 1); }
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i]; p.update();
        if (p.life <= 0) particles.splice(i, 1);
    }

    // --- Host Collisions --- 
    if (isHost) {
        // Player vs Items
        for (let pid in players) {
            let p = players[pid];
            if (p.hp <= 0) continue;
            for (let i = items.length - 1; i >= 0; i--) {
                let it = items[i];
                if (circleCollision(p.x, p.y, p.width / 2, it.x, it.y, it.radius)) {
                    if (it.type === 'heal') p.heal(30); else p.upgradeWeapon();
                    createExplosion(it.x, it.y, it.color, 10);
                    pushEvent('explosion', { x: it.x, y: it.y, c: it.color, amount: 10 });
                    items.splice(i, 1);
                }
            }
        }

        // Player vs Enemy Bullets
        for (let pid in players) {
            let p = players[pid];
            if (p.hp <= 0) continue;
            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                let b = enemyBullets[i];
                if (circleCollision(p.x, p.y, p.hitboxRadius, b.x, b.y, b.radius)) {
                    p.takeDamage(10);
                    createExplosion(b.x, b.y, '#ff003c', 5);
                    pushEvent('explosion', { x: b.x, y: b.y, c: '#ff003c', amount: 5 });
                    enemyBullets.splice(i, 1);
                }
            }
        }

        // Player vs Enemies
        for (let pid in players) {
            let p = players[pid];
            if (p.hp <= 0) continue;
            for (let i = enemies.length - 1; i >= 0; i--) {
                let e = enemies[i];
                if (circleCollision(p.x, p.y, p.hitboxRadius + 10, e.x, e.y, e.radius)) {
                    if (e.type >= 100) {
                        p.takeDamage(p.maxHp * 0.8);
                        createExplosion(e.x, e.y, e.color, 40);
                        pushEvent('explosion', { x: e.x, y: e.y, c: e.color, amount: 40 });
                    } else {
                        p.takeDamage(20);
                        createExplosion(e.x, e.y, e.color, 20);
                        pushEvent('explosion', { x: e.x, y: e.y, c: e.color, amount: 20 });
                        e.hp = 0;
                        enemies.splice(i, 1);
                    }
                }
            }
        }

        // All Player Bullets vs Enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            let e = enemies[i];
            for (let j = allBullets.length - 1; j >= 0; j--) {
                let b = allBullets[j];
                if (circleCollision(e.x, e.y, e.radius, b.x, b.y, b.radius)) {
                    let ownerP = players[b.owner];
                    let dmg = 15;
                    if (ownerP) {
                        // Base damage by Weapon Type
                        let wt = ownerP.weaponType;
                        if (wt === 1) dmg = 15;
                        else if (wt === 2) dmg = 12; // Spread
                        else if (wt === 3) dmg = 8;  // Laser (hits faster/pierces)
                        else if (wt === 4) dmg = 10; // Homing (safe but weak)
                        else if (wt === 5) dmg = 18; // Wave (high coverage rewarding)
                        else if (wt === 6) dmg = 100; // Cannon (massive hit)
                        
                        // Nuke special damage
                        if (b.isNuke) dmg = e.type >= 100 ? 1000 : e.maxHp + 1000;

                        // Ship Base Modifiers
                        dmg += ownerP.damageMod;
                        if (ownerP.vampirism && Math.random() < 0.05) ownerP.heal(1);
                    }

                    e.hp -= dmg;
                    if (ownerP && !ownerP.ultActive && e.hp > 0 && !b.isNuke) ownerP.ultCharge = Math.min(100, ownerP.ultCharge + 0.1); // Small charge for hit

                    if (!b.isNuke && (!ownerP || (!ownerP.piercing && !b.naturalPiercing) || Math.random() >= 0.25)) {
                        allBullets.splice(j, 1);
                    }

                    createExplosion(b.x, b.y, e.color, 3);
                    pushEvent('explosion', { x: b.x, y: b.y, c: e.color, amount: 3 });

                    if (e.hp <= 0) {
                        if (ownerP && !ownerP.ultActive) {
                            ownerP.ultCharge = Math.min(100, ownerP.ultCharge + (e.type >= 100 ? 50 : 5));
                        }

                        if (e.type >= 100) {
                            isBossActive = false;
                            score += 2000;
                            startDraft();
                        } else {
                            let mult = (ownerP && ownerP.greed) ? 2 : 1;
                            score += e.type * 50 * mult;
                            if (e.type === 10) { // Splitter logic
                                enemies.push(new Enemy(e.x - 20, e.y, 6)); // Spawn 3 sprinters
                                enemies.push(new Enemy(e.x + 20, e.y, 6));
                                enemies.push(new Enemy(e.x, e.y - 20, 6));
                            }
                        }
                        updateUI();
                        createExplosion(e.x, e.y, e.color, 20);
                        pushEvent('explosion', { x: e.x, y: e.y, c: e.color, amount: 20 });
                        let dropChance = 0.20 + (ownerP ? ownerP.itemDropMod : 0);
                        if (Math.random() < dropChance) items.push(new Item(e.x, e.y, Math.random() < 0.4 ? 'heal' : 'upgrade'));
                        enemies.splice(i, 1); break;
                    }
                }
            }
        }

        // Laser Continuous Beam Collision (Type 3) and Ultimate Type 1 & 3
        for (let pid in players) {
            let p = players[pid];
            
            // Handle Ultimate Timers
            if (p.hp > 0 && p.ultActive && p.ultTimer > 0) {
                p.ultTimer--;
                if (p.ultTimer <= 0) p.ultActive = false;
            }

            // Calculations for Beam orientation
            let dirX = Math.cos(p.aimAngle || -Math.PI/2);
            let dirY = Math.sin(p.aimAngle || -Math.PI/2);

            // Type 1 Ultimate: Giga Buster
            if (p.hp > 0 && p.ultActive && p.weaponType === 1) {
                let beamWidth = 60; // Massive beam

                // Hit Enemies
                for (let i = enemies.length - 1; i >= 0; i--) {
                    let e = enemies[i];
                    let dx = e.x - p.x; let dy = e.y - p.y;
                    let proj = dx * dirX + dy * dirY;
                    let distSq = (dx*dx + dy*dy) - (proj*proj);
                    let dist = distSq > 0 ? Math.sqrt(distSq) : 0;
                    
                    if (proj > -e.radius && dist < (beamWidth / 2) + e.radius) {
                        let dmg = 5; // Extreme tick damage
                        e.hp -= dmg;
                        
                        if (frameCount % 3 === 0) {
                            createExplosion(e.x, e.y + e.radius, '#fff', 5);
                            pushEvent('explosion', { x: e.x, y: e.y + e.radius, c: '#fff', amount: 5 });
                        }

                        if (e.hp <= 0) {
                            if (e.type >= 100) {
                                isBossActive = false;
                                score += 2000;
                                startDraft();
                            } else {
                                let mult = (p.greed) ? 2 : 1;
                                score += e.type * 50 * mult;
                                if (e.type === 10) {
                                    enemies.push(new Enemy(e.x - 20, e.y, 6));
                                    enemies.push(new Enemy(e.x + 20, e.y, 6));
                                    enemies.push(new Enemy(e.x, e.y - 20, 6));
                                }
                            }
                            updateUI();
                            createExplosion(e.x, e.y, e.color, 20);
                            pushEvent('explosion', { x: e.x, y: e.y, c: e.color, amount: 20 });
                            let dropChance = 0.20 + p.itemDropMod;
                            if (Math.random() < dropChance) items.push(new Item(e.x, e.y, Math.random() < 0.4 ? 'heal' : 'upgrade'));
                            enemies.splice(i, 1);
                        }
                    }
                }

                // Destroy Enemy Bullets
                for (let i = enemyBullets.length - 1; i >= 0; i--) {
                    let eb = enemyBullets[i];
                    let dx = eb.x - p.x; let dy = eb.y - p.y;
                    let proj = dx * dirX + dy * dirY;
                    let distSq = (dx*dx + dy*dy) - (proj*proj);
                    let dist = distSq > 0 ? Math.sqrt(distSq) : 0;
                    
                    if (proj > -eb.radius && dist < (beamWidth / 2) + eb.radius) {
                        createExplosion(eb.x, eb.y, '#fff', 3);
                        pushEvent('explosion', { x: eb.x, y: eb.y, c: '#fff', amount: 3 });
                        enemyBullets.splice(i, 1);
                    }
                }
            }

            // Type 3: Normal Laser or Zero Core Override
            if (p.hp > 0 && p.weaponType === 3 && (p.isShootingLaser || p.ultActive)) {
                let isUlt = p.ultActive;
                let beamWidth = isUlt ? (20 + (p.weaponLevel * 4)) * 3 : 20 + (p.weaponLevel * 4); // 3x wider in ult

                // Hit Enemies
                for (let i = enemies.length - 1; i >= 0; i--) {
                    let e = enemies[i];
                    let dx = e.x - p.x; let dy = e.y - p.y;
                    let proj = dx * dirX + dy * dirY;
                    let distSq = (dx*dx+dy*dy) - (proj*proj);
                    let dist = distSq > 0 ? Math.sqrt(distSq) : 0;

                    if (proj > -e.radius && dist < (beamWidth / 2) + e.radius) {
                        let dmg = isUlt ? 7.5 : 1.5; // ลดเหลือแค่ 1.5 ตามคำขอผู้เล่น (Ultimate x5 เป็น 7.5)
                        e.hp -= dmg;
                        
                        if (!isUlt && frameCount % 10 === 0 && !p.ultActive) p.ultCharge = Math.min(100, p.ultCharge + 0.5); // Charge for laser ticks

                        if (frameCount % (isUlt ? 2 : 4) === 0) { // More particles in ult
                            createExplosion(e.x, e.y + e.radius, '#fff', isUlt ? 5 : 2);
                            pushEvent('explosion', { x: e.x, y: e.y + e.radius, c: '#fff', amount: isUlt ? 5 : 2 });
                        }

                        if (e.hp <= 0) {
                            if (!isUlt) p.ultCharge = Math.min(100, p.ultCharge + (e.type >= 100 ? 50 : 5));
                            
                            if (e.type >= 100) {
                                isBossActive = false;
                                score += 2000;
                                startDraft();
                            } else {
                                let mult = (p.greed) ? 2 : 1;
                                score += e.type * 50 * mult;
                                if (e.type === 10) {
                                    enemies.push(new Enemy(e.x - 20, e.y, 6));
                                    enemies.push(new Enemy(e.x + 20, e.y, 6));
                                    enemies.push(new Enemy(e.x, e.y - 20, 6));
                                }
                            }
                            if (!p.ultActive) p.ultCharge = Math.min(100, p.ultCharge + (e.type >= 100 ? 50 : 5));
                            updateUI();
                            createExplosion(e.x, e.y, e.color, 20);
                            pushEvent('explosion', { x: e.x, y: e.y, c: e.color, amount: 20 });
                            let dropChance = 0.20 + p.itemDropMod;
                            if (Math.random() < dropChance) items.push(new Item(e.x, e.y, Math.random() < 0.4 ? 'heal' : 'upgrade'));
                            enemies.splice(i, 1);
                        }
                    }
                }

                // Destroy Enemy Bullets
                for (let i = enemyBullets.length - 1; i >= 0; i--) {
                    let eb = enemyBullets[i];
                    let dx = eb.x - p.x; let dy = eb.y - p.y;
                    let proj = dx * dirX + dy * dirY;
                    let distSq = (dx*dx + dy*dy) - (proj*proj);
                    let dist = distSq > 0 ? Math.sqrt(distSq) : 0;
                    
                    if (proj > -eb.radius && dist < (beamWidth / 2) + eb.radius) {
                        createExplosion(eb.x, eb.y, '#33ccff', 2);
                        pushEvent('explosion', { x: eb.x, y: eb.y, c: '#33ccff', amount: 2 });
                        enemyBullets.splice(i, 1);
                    }
                }
            }
        }

        // Check Game Over condition for Host
        let allDead = true;
        for (let pid in players) {
            if (players[pid].hp > 0) allDead = false;
        }
        if (allDead && gameActive) {
            showGameOver();
            pushEvent('gameover', {});
        }
    } else {
        // Client checks its own bullet collisions visually (enemies die only on host sync, but client can generate hit explosion particles immediately)
        for (let i = enemies.length - 1; i >= 0; i--) {
            let e = enemies[i];
            for (let j = allBullets.length - 1; j >= 0; j--) {
                let b = allBullets[j];
                if (b.owner === myPlayerId && circleCollision(e.x, e.y, e.radius, b.x, b.y, b.radius)) {
                    createExplosion(b.x, b.y, e.color, 3);
                    allBullets.splice(j, 1);
                }
            }
        }
    }

    // Background Map Theme Logic (Change every 60s = 3600 frames)
    if (frameCount > 0 && frameCount % 3600 === 0) {
        currentMapIndex = (currentMapIndex + 1) % MAPS.length;
    }

    // Smoothly interpolate current background towards target map color
    let targetC = MAPS[currentMapIndex].color;
    currentBgColor.r += (targetC.r - currentBgColor.r) * 0.01;
    currentBgColor.g += (targetC.g - currentBgColor.g) * 0.01;
    currentBgColor.b += (targetC.b - currentBgColor.b) * 0.01;

    let targetStarC = MAPS[currentMapIndex].starColor;
    currentStarColor.r += (targetStarC.r - currentStarColor.r) * 0.01;
    currentStarColor.g += (targetStarC.g - currentStarColor.g) * 0.01;
    currentStarColor.b += (targetStarC.b - currentStarColor.b) * 0.01;

    let bgStyle = `rgb(${Math.floor(currentBgColor.r)}, ${Math.floor(currentBgColor.g)}, ${Math.floor(currentBgColor.b)})`;

    // Render
    ctx.fillStyle = bgStyle;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => s.draw());
    items.forEach(i => i.draw());
    enemies.forEach(e => e.draw());
    enemyBullets.forEach(b => b.draw());
    allBullets.forEach(b => b.draw());
    particles.forEach(p => p.draw());

    // Draw Beams and Heat UI
    ctx.globalAlpha = 1.0;
    ctx.lineWidth = 1;
    for (let pid in players) {
        let p = players[pid];
        
        // Draw Giga Buster Beam (Ultimate 1)
        if (p.hp > 0 && p.ultActive && p.weaponType === 1) {
            let beamWidth = 60;
            let ext = Math.max(canvas.width, canvas.height) * 1.5;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.aimAngle);
            // Outer Glow
            ctx.fillStyle = '#ff99cc';
            ctx.globalAlpha = 0.6 + (Math.random() * 0.4);
            ctx.fillRect(0, -beamWidth / 2, ext, beamWidth);
            // Inner Core
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.9 + (Math.random() * 0.1);
            ctx.fillRect(0, -(beamWidth * 0.5) / 2, ext, beamWidth * 0.5);
            ctx.restore();
            ctx.globalAlpha = 1.0;
        }

        if (p.hp > 0 && p.weaponType === 3) {
            // Draw Heat Bar above player
            let heatRatio = Math.min(1, p.laserHeat / 600);
            ctx.fillStyle = p.laserOverheated ? '#ff003c' : '#ffeb3b';
            ctx.fillRect(p.x - 20, p.y - 45, 40 * heatRatio, 4);
            ctx.strokeStyle = '#000'; ctx.strokeRect(p.x - 20, p.y - 45, 40, 4);

            // Draw Active Beam or Zero Core Override
            if (p.isShootingLaser || p.ultActive) {
                let isUlt = p.ultActive;
                let beamWidth = isUlt ? (20 + (p.weaponLevel * 4)) * 3 : 20 + (p.weaponLevel * 4);
                let ext = Math.max(canvas.width, canvas.height) * 1.5;
                
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.aimAngle);
                
                // Outer Glow
                ctx.fillStyle = isUlt ? '#ffffff' : '#33ccff';
                ctx.globalAlpha = isUlt ? 0.8 + (Math.random() * 0.2) : 0.5 + (Math.random() * 0.3);
                ctx.fillRect(0, -beamWidth / 2, ext, beamWidth);
                // Inner Core
                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = 0.8 + (Math.random() * 0.2);
                ctx.fillRect(0, -(beamWidth * 0.4) / 2, ext, beamWidth * 0.4);
                
                ctx.restore();
                ctx.globalAlpha = 1.0;
            }
        }
    }

    for (let pid in players) players[pid].draw();

    // Draw Crosshair (PC) or Lock-on (Mobile)
    if (selectedControlType === 'pc') {
        canvas.style.cursor = 'none';
        ctx.strokeStyle = '#00ffcc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mousePos.x - 10, mousePos.y); ctx.lineTo(mousePos.x + 10, mousePos.y);
        ctx.moveTo(mousePos.x, mousePos.y - 10); ctx.lineTo(mousePos.x, mousePos.y + 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, 6, 0, Math.PI * 2);
        ctx.stroke();
    } else if (lockedTargetId !== null) {
        let target = enemies.find(e => e.id === lockedTargetId);
        if (target) {
            ctx.strokeStyle = '#ff003c';
            ctx.lineWidth = 3;
            let s = target.radius * 2;
            ctx.save();
            ctx.translate(target.x, target.y);
            ctx.rotate(frameCount * 0.05);
            ctx.strokeRect(-s/2, -s/2, s, s);
            ctx.restore();
        } else {
            lockedTargetId = null; // Target dead
        }
    }

    if (gameActive) animationId = requestAnimationFrame(gameLoop);
}
