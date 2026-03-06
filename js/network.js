// js/network.js

// --- PeerJS Networking ---
function initPeer() {
    if (peer) peer.destroy();
    peer = new Peer();
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
    } else if (data.type === 'sync') {
        // Continuous Sync
        if (isHost) {
            // Host receives client state & inputs
            if (players['p2']) {
                players['p2'].x = data.px;
                players['p2'].y = data.py;
                if (data.shoot && players['p2'].shootCooldown <= 0) {
                    players['p2'].shoot();
                    players['p2'].shootCooldown = players['p2'].shootDelay;
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
            }
            if (players['p2']) {
                players['p2'].hp = data.p2.hp; players['p2'].maxHp = data.p2.maxHp;
                players['p2'].weaponLevel = data.p2.wl;
                players['p2'].weaponExp = data.p2.wexp;
                players['p2'].weaponMaxExp = data.p2.wmx;
            }
            
            // Sync Enemies
            let newEnemies = [];
            data.enemies.forEach(ed => {
                let e = new Enemy(ed.x, ed.y, ed.t, ed.id);
                e.hp = ed.hp; e.maxHp = ed.mhp;
                newEnemies.push(e);
            });
            enemies = newEnemies;

            // Sync Items
            let newItems = [];
            data.items.forEach(itData => {
                newItems.push(new Item(itData.x, itData.y, itData.t, itData.id));
            });
            items = newItems;

            // Sync Enemy Bullets
            let newEBullets = [];
            data.eBullets.forEach(b => {
                newEBullets.push(new Bullet(b.x, b.y, b.vx, b.vy, b.c, true));
            });
            enemyBullets = newEBullets;
            
            // Host bullets
            let hostBulls = [];
            data.hostBullets.forEach(b => {
                hostBulls.push(new Bullet(b.x, b.y, b.vx, b.vy, b.c, false, 'p1', 0, b.bt)); // passing player ID 'p1' and bullet type b.bt
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
