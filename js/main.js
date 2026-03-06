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

document.getElementById('restartBtn').addEventListener('click', () => {
    location.reload(); // Simple reload for multiplayer reset
});

// Initial draw of the previews on the main menu
renderPreviews();
