// js/engine.js

function spawnEnemies() {
    if (!isHost) return;
    
    // Check for Boss spawn
    if (frameCount > 0 && frameCount % 1800 === 0 && !isBossActive) {
        isBossActive = true;
        let bossType = 100 + waveCount; // 101, 102, 103, ...
        enemies.push(new Enemy(canvas.width / 2, -100, bossType));
        pushEvent('bossAlert', {});
        return;
    }

    if (isBossActive) return; // Stop normal spawns

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
    document.getElementById('scoreValue').innerText = score;
    
    let p1 = players['p1'];
    if(p1) {
        const perc1 = (p1.hp / p1.maxHp) * 100;
        const hp1 = document.getElementById('hpBar1');
        hp1.style.width = `${perc1}%`;
        hp1.style.backgroundColor = perc1 < 30 ? '#ff003c' : '#45a29e';
        document.getElementById('weaponLvValue1').innerText = p1.weaponLevel === 5 ? 'MAX' : p1.weaponLevel;
        document.getElementById('weaponExp1').innerText = p1.weaponLevel === 5 ? '[MAX]' : `[${p1.weaponExp}/${p1.weaponMaxExp}]`;
    }

    let p2 = players['p2'];
    if(p2 && isMultiplayer) {
        document.getElementById('p2UiBox').style.display = 'flex';
        const perc2 = (p2.hp / p2.maxHp) * 100;
        const hp2 = document.getElementById('hpBar2');
        hp2.style.width = `${perc2}%`;
        hp2.style.backgroundColor = perc2 < 30 ? '#ff003c' : '#45a29e';
        document.getElementById('weaponLvValue2').innerText = p2.weaponLevel === 5 ? 'MAX' : p2.weaponLevel;
        document.getElementById('weaponExp2').innerText = p2.weaponLevel === 5 ? '[MAX]' : `[${p2.weaponExp}/${p2.weaponMaxExp}]`;
    }
}

function showGameOver() {
    gameActive = false;
    document.getElementById('finalScore').innerText = score;
    document.getElementById('gameOverScreen').style.display = 'flex';
}

function startGameAsHost(clientShipType, clientWeaponType) {
    mainMenu.style.display = 'none';
    uiLayer.style.display = 'block';

    myPlayerId = 'p1';
    players['p1'] = new Player(selectedShipType, selectedWeaponType, 'p1');
    
    if (isMultiplayer && clientShipType) {
        players['p2'] = new Player(clientShipType, clientWeaponType || 1, 'p2');
        connection.send({ type: 'start', hostShipType: selectedShipType, hostWeaponType: selectedWeaponType, clientShipType: clientShipType, clientWeaponType: clientWeaponType });
    }

    allBullets = []; enemyBullets = []; enemies = []; items = []; particles = [];
    stars = Array.from({length: 100}, () => new Star());
    
    score = 0; frameCount = 0; gameActive = true; isBossActive = false; waveCount = 1;
    document.getElementById('gameOverScreen').style.display = 'none';
    
    updateUI();
    gameLoop();
}

function startGameAsClient(myShipType, hostShipType, myWeaponType, hostWeaponType) {
    mainMenu.style.display = 'none';
    uiLayer.style.display = 'block';

    myPlayerId = 'p2';
    players['p1'] = new Player(hostShipType, hostWeaponType, 'p1');
    players['p2'] = new Player(myShipType, myWeaponType, 'p2');
    
    allBullets = []; enemyBullets = []; enemies = []; items = []; particles = [];
    stars = Array.from({length: 100}, () => new Star());
    
    score = 0; frameCount = 0; gameActive = true; isBossActive = false; waveCount = 1;
    document.getElementById('gameOverScreen').style.display = 'none';
    
    updateUI();
    gameLoop();
}

function startDraft() {
    isDrafting = true;
    draftChoices = [];
    let available = [...BUFFS];
    for (let i=0; i<3; i++) {
        let idx = Math.floor(Math.random() * available.length);
        draftChoices.push(available[idx]);
        available.splice(idx, 1);
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
    document.getElementById('draftScreen').style.display = 'block';
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
        
        if (isMultiplayer && connection && connection.open) {
            connection.send({ type: 'draft_end', p1Pick: draftPicks.p1, p2Pick: draftPicks.p2 });
        }
        document.getElementById('draftScreen').style.display = 'none';
        
        // Reset state slightly after boss
        allBullets = []; enemyBullets = []; items = [];
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
    
    let me = players[myPlayerId];
    if (me && me.hp > 0) {
        me.updateLocally();
        if (keys[' '] && me.shootCooldown <= 0) {
            me.shoot();
            me.shootCooldown = me.shootDelay;
        }
    }

    // Host decays p2 cooldown to match client's frame limit logic
    if (isHost && isMultiplayer && players['p2'] && players['p2'].shootCooldown > 0) {
        players['p2'].shootCooldown--;
    }

    // Update Time display
    if (frameCount % 10 === 0) {
        let timeRemaining = Math.max(0, 30 - Math.floor((frameCount % 1800) / 60));
        let timerEl = document.getElementById('bossTimerValue');
        if(timerEl) {
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
                p1: players['p1'] ? {x:players['p1'].x, y:players['p1'].y, hp:players['p1'].hp, maxHp:players['p1'].maxHp, wl:players['p1'].weaponLevel, wexp:players['p1'].weaponExp, wmx: players['p1'].weaponMaxExp} : null,
                p2: players['p2'] ? {hp:players['p2'].hp, maxHp:players['p2'].maxHp, wl:players['p2'].weaponLevel, wexp:players['p2'].weaponExp, wmx: players['p2'].weaponMaxExp} : null, // Host sends HP & EXP
                enemies: enemies.map(e => ({ x:Math.floor(e.x), y:Math.floor(e.y), t:e.type, hp:e.hp, mhp:e.maxHp, id:e.id })),
                items: items.map(i => ({ x:Math.floor(i.x), y:Math.floor(i.y), t:i.type, id:i.id })),
                eBullets: enemyBullets.map(b => ({ x:Math.floor(b.x), y:Math.floor(b.y), vx:b.vx, vy:b.vy, c:b.color })),
                hostBullets: allBullets.filter(b=>b.owner==='p1').map(b => ({ x:Math.floor(b.x), y:Math.floor(b.y), vx:b.vx, vy:b.vy, c:b.color, bt:b.type })),
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
                shoot: keys[' ']
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
        for (let i = items.length - 1; i >= 0; i--) { let it = items[i]; it.update(); if (it.y > canvas.height+20) items.splice(i, 1); }
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
            if(p.hp <= 0) continue;
            for (let i = items.length - 1; i >= 0; i--) {
                let it = items[i];
                if (circleCollision(p.x, p.y, p.width/2, it.x, it.y, it.radius)) {
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
            if(p.hp <= 0) continue;
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
            if(p.hp <= 0) continue;
            for (let i = enemies.length - 1; i >= 0; i--) {
                let e = enemies[i];
                if (circleCollision(p.x, p.y, p.hitboxRadius + 10, e.x, e.y, e.radius)) {
                    p.takeDamage(20); e.hp = 0;
                    createExplosion(e.x, e.y, e.color, 20);
                    pushEvent('explosion', { x: e.x, y: e.y, c: e.color, amount: 20 });
                    enemies.splice(i, 1);
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
                    if(ownerP) {
                        dmg = (ownerP.type === 2 ? 8 : (ownerP.type === 3 ? 20 : 15));
                        dmg += ownerP.damageMod;
                        if (ownerP.vampirism && Math.random() < 0.05) ownerP.heal(1);
                    }
                    
                    e.hp -= dmg;
                    if (!ownerP || (!ownerP.piercing && !b.naturalPiercing) || Math.random() >= 0.25) {
                        allBullets.splice(j, 1);
                    }
                    
                    createExplosion(b.x, b.y, e.color, 3);
                    pushEvent('explosion', { x: b.x, y: b.y, c: e.color, amount: 3 });

                    if (e.hp <= 0) {
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

        // Check Game Over condition for Host
        let allDead = true;
        for(let pid in players) {
            if(players[pid].hp > 0) allDead = false;
        }
        if(allDead && gameActive) {
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

    // Render
    ctx.fillStyle = '#0b0c10'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => s.draw());
    items.forEach(i => i.draw());
    enemies.forEach(e => e.draw());
    enemyBullets.forEach(b => b.draw());
    allBullets.forEach(b => b.draw());
    particles.forEach(p => p.draw());
    
    for (let pid in players) players[pid].draw();

    if (gameActive) animationId = requestAnimationFrame(gameLoop);
}
