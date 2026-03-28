// js/main.js

document.getElementById('singlePlayerBtn').addEventListener('click', () => {
    isMultiplayer = false;
    startGameAsHost(null, null);
});

document.getElementById('hostBtn').addEventListener('click', () => {
    statusText.innerText = "Initializing Host...";
    // Generate a random 4-digit Host ID (1000-9999)
    const randomId = Math.floor(1000 + Math.random() * 9000).toString();
    
    initPeer(randomId).on('open', id => {
        statusText.innerHTML = `Waiting for player... <br><br><b style="font-size: 24px;">Your Host ID: <span style="color:#39ff14">${id}</span></b><br><span style="font-size:12px">(Share this ID with a friend)</span>`;
        isHost = true;
        isMultiplayer = true;
    });
    peer.on('connection', conn => {
        connection = conn;
        setupConnection();
    });
});

document.getElementById('joinBtn').addEventListener('click', () => {
    const joinId = joinIdInput.value.trim();
    if (!joinId) { statusText.innerText = "Please enter a valid Host ID."; return; }

    statusText.innerText = "Connecting to Host...";
    initPeer().on('open', id => {
        connection = peer.connect(joinId);
        setupConnection();
        isHost = false;
        isMultiplayer = true;
    });
});

document.querySelectorAll('.ship-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.ship-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedShipType = parseInt(card.getAttribute('data-ship'));
    });
});

document.querySelectorAll('.weapon-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.weapon-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedWeaponType = parseInt(card.getAttribute('data-weapon'));
    });
});

document.querySelectorAll('.control-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.control-card').forEach(c => {
            c.classList.remove('selected');
            c.style.borderColor = '#333';
            c.style.boxShadow = 'none';
        });
        card.classList.add('selected');
        card.style.borderColor = '#f0f';
        card.style.boxShadow = '0 0 10px #f0f';
        selectedControlType = card.getAttribute('data-control');
    });
});

// Initialize default control visuals
document.querySelector('.control-card.selected').style.borderColor = '#f0f';
document.querySelector('.control-card.selected').style.boxShadow = '0 0 10px #f0f';

document.getElementById('confirmControlBtn').addEventListener('click', () => {
    UIAnimations.hideMenu('controlMenu', () => {
        UIAnimations.showMenu('mainMenu', 'flex', true); // ใช้ staggering effect
        // Render previews here after the menu is visible
        renderPreviews();
    });
});

document.getElementById('restartBtn').addEventListener('click', () => {
    location.reload(); // Simple reload for multiplayer reset
});

// Responsive scaling
function resizeGame() {
    const container = document.getElementById('gameContainer');
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    // Mobile specific scaling - fill height exactly, adjust width proportionally
    if (screenW < 600 || screenH / screenW > 1.2) {
        // Portrait mode / Mobile
        const logicalHeight = 800; // Fix game logic height to 800
        const logicalWidth = logicalHeight * (screenW / screenH); // Proportional width

        // Update logical canvas resolution
        canvas.width = logicalWidth;
        canvas.height = logicalHeight;

        // Update CSS container physical size
        container.style.width = logicalWidth + 'px';
        container.style.height = logicalHeight + 'px';

        // Scale to fill screen exactly
        const scale = screenH / logicalHeight;
        container.style.transform = `scale(${scale})`;
    } else {
        // PC / Landscape (Classic 600x800)
        canvas.width = 600;
        canvas.height = 800;
        container.style.width = '600px';
        container.style.height = '800px';

        const scaleX = screenW / 600;
        const scaleY = screenH / 800;
        // Leave 5% padding on PC
        const scale = Math.min(scaleX, scaleY) * 0.95;
        container.style.transform = `scale(${scale})`;
    }
}

// Listen to resize and orientation changes
window.addEventListener('resize', resizeGame);
window.addEventListener('orientationchange', () => setTimeout(resizeGame, 100));

// Initial fit
resizeGame();
