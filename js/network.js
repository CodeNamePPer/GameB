// js/network.js

// --- PeerJS Networking ---
function initPeer(customId) {
    if (peer) peer.destroy();
    
    // Use public PeerJS server with custom ID if provided
    if (customId) {
        peer = new Peer(customId);
    } else {
        peer = new Peer();
    }
    return peer;
}

function setupConnection() {
    connection.on('open', () => {
        statusText.innerText = "Connected! Starting game...";
        
        // Client sends their selected ship & weapon
        if (!isHost) {
            connection.send({ type: 'init', shipType: selectedShipType, weaponType: selectedWeaponType });
        }

        connection.on('data', data => {
            handleNetworkData(data);
        });
    });

    connection.on('close', () => {
        alert("Connection lost.");
        location.reload();
    });
    connection.on('error', err => {
        console.error(err);
        alert("Network error.");
        location.reload();
    });
}

function handleNetworkData(data) {
    if (!gameActive && data.type !== 'start' && data.type !== 'init') return;

    if (isHost && data.type === 'init') {
        // Client joined
        startGameAsHost(data.shipType, data.weaponType);
    } else if (!isHost && data.type === 'start') {
        // Host started game
        startGameAsClient(data.clientShipType, data.hostShipType, data.clientWeaponType, data.hostWeaponType);
    } else if (data.type === 'draft_start') {
        isDrafting = true;
        draftChoices = data.choices;
        showDraftScreen();
    } else if (data.type === 'draft_pick') {
        if (isHost) {
            draftPicks[data.playerId] = data.pick;
            checkDraftComplete();
        }
    } else if (data.type === 'draft_end') {
        isDrafting = false;
        waveCount++;
        let waveEl = document.getElementById('waveValue');
        if (waveEl) waveEl.innerText = waveCount;
        if (data.p1Pick >= 0 && players['p1']) players['p1'].applyBuff(data.p1Pick);
        if (data.p2Pick >= 0 && players['p2']) players['p2'].applyBuff(data.p2Pick);
        document.getElementById('draftScreen').style.display = 'none';
        allBullets = []; enemyBullets = []; items = [];
        bossTimer = 0;
    } else if (data.type === 'sync') {
        // Continuous Sync
        if (isHost) {
            // Host receives client state & inputs
            if (players['p2']) {
                players['p2'].x = data.px;
                players['p2'].y = data.py;
                if (data.aim !== undefined) players['p2'].aimAngle = data.aim;
                if (data.shoot && (players['p2'].shootCooldown <= 0 || players['p2'].weaponType === 3)) {
                    players['p2'].shoot();
                    players['p2'].shootCooldown = players['p2'].shootDelay;
                }
                if (data.ult && players['p2'].ultCharge >= 99 && !players['p2'].ultActive) {
                    if (typeof players['p2'].activateUltimate === "function") players['p2'].activateUltimate();
                }
            }
        } else {
            // Client receives full world state
            score = data.score;
            if (data.wave !== undefined) waveCount = data.wave;
            if (data.boss !== undefined) isBossActive = data.boss;
            
            let waveEl = document.getElementById('waveValue');
            if (waveEl) waveEl.innerText = waveCount;

            if (players['p1']) {
                players['p1'].x = data.p1.x; players['p1'].y = data.p1.y;
                players['p1'].hp = data.p1.hp; players['p1'].maxHp = data.p1.maxHp;
                players['p1'].weaponLevel = data.p1.wl;
                players['p1'].weaponExp = data.p1.wexp;
                players['p1'].weaponMaxExp = data.p1.wmx;
                players['p1'].isShootingLaser = data.p1.isShootingLaser;
                players['p1'].laserHeat = data.p1.laserHeat;
                players['p1'].laserOverheated = data.p1.laserOverheated;
                
                players['p1'].ultCharge = data.p1.ultCharge;
                players['p1'].ultActive = data.p1.ultActive;
                players['p1'].ultTimer = data.p1.ultTimer;
                if (data.p1.aimAngle !== undefined) players['p1'].aimAngle = data.p1.aimAngle;
            }
            if (players['p2']) {
                players['p2'].hp = data.p2.hp; players['p2'].maxHp = data.p2.maxHp;
                players['p2'].weaponLevel = data.p2.wl;
                players['p2'].weaponExp = data.p2.wexp;
                players['p2'].weaponMaxExp = data.p2.wmx;
                players['p2'].isShootingLaser = data.p2.isShootingLaser;
                players['p2'].laserHeat = data.p2.laserHeat;
                players['p2'].laserOverheated = data.p2.laserOverheated;

                players['p2'].ultCharge = data.p2.ultCharge;
                players['p2'].ultActive = data.p2.ultActive;
                players['p2'].ultTimer = data.p2.ultTimer;
                if (data.p2.aimAngle !== undefined) players['p2'].aimAngle = data.p2.aimAngle;
            }
            
            // Sync Enemies
            let newEnemies = [];
            data.enemies.forEach(ed => {
                let existing = enemies.find(e => e.id === ed.id);
                if (existing) {
                    existing.x = ed.x; existing.y = ed.y;
                    existing.hp = ed.hp; existing.maxHp = ed.mhp;
                    existing.type = ed.t;
                    newEnemies.push(existing);
                } else {
                    let e = new Enemy(ed.x, ed.y, ed.t, ed.id);
                    e.hp = ed.hp; e.maxHp = ed.mhp;
                    newEnemies.push(e);
                }
            });
            enemies = newEnemies;

            // Sync Items
            let newItems = [];
            data.items.forEach(itData => {
                let existing = items.find(it => it.id === itData.id);
                if (existing) {
                    existing.x = itData.x; existing.y = itData.y;
                    existing.type = itData.t;
                    newItems.push(existing);
                } else {
                    newItems.push(new Item(itData.x, itData.y, itData.t, itData.id));
                }
            });
            items = newItems;

            // Sync Enemy Bullets
            let newEBullets = [];
            data.eBullets.forEach(b => {
                newEBullets.push(new Bullet(b.x, b.y, b.vx, b.vy, b.c, true, '', b.rm || 0, b.bt || 0));
            });
            enemyBullets = newEBullets;
            
            // Host bullets
            let hostBulls = [];
            data.hostBullets.forEach(b => {
                let bull = new Bullet(b.x, b.y, b.vx, b.vy, b.c, false, 'p1', b.rm || 0, b.bt || 0, b.ww || 0);
                if (b.bt === 6 && b.rm >= 50) bull.isNuke = true; // Recover nuke property visually
                hostBulls.push(bull);
            });
            
            // My bullets (P2)
            let myBulls = allBullets.filter(b => b.owner === myPlayerId);
            allBullets = hostBulls.concat(myBulls);
            
            // Sync Particles (Hits/Explosions)
            data.events.forEach(ev => {
                if (ev.type === 'explosion') createExplosion(ev.x, ev.y, ev.c, ev.amount);
                if (ev.type === 'bossAlert') {
                    // Could play a sound or show a quick flash
                }
                if (ev.type === 'gameover') showGameOver();
            });
            
            updateUI();
        }
    }
}
