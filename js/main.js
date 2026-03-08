// js/main.js

document.getElementById('singlePlayerBtn').addEventListener('click', () => {
    isMultiplayer = false;
    startGameAsHost(null, null);
});

document.getElementById('hostBtn').addEventListener('click', () => {
    statusText.innerText = "Initializing Host...";
    initPeer().on('open', id => {
        statusText.innerHTML = `Waiting for player... <br><br><b>Your Host ID:</b> ${id}<br><span style="font-size:12px">(Share this ID with a friend)</span>`;
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
    document.getElementById('controlMenu').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'flex';
    // Render previews here after the menu is visible
    renderPreviews();
});

document.getElementById('restartBtn').addEventListener('click', () => {
    location.reload(); // Simple reload for multiplayer reset
});

// Responsive scaling
function resizeGame() {
    const container = document.getElementById('gameContainer');
    // Calculate scale factor: we want the 600x800 container to fit exactly inside window
    const scaleX = window.innerWidth / 600;
    const scaleY = window.innerHeight / 800;
    // Constrain scale to whichever is smaller so it always fits, and reduce by 10% padding
    const scale = Math.min(scaleX, scaleY) * 0.9; 
    container.style.transform = `scale(${scale})`;
}

// Listen to resize and orientation changes
window.addEventListener('resize', resizeGame);
window.addEventListener('orientationchange', () => setTimeout(resizeGame, 100));

// Initial fit
resizeGame();
