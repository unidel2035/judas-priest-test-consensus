const socket = io();

// Game state variables
let gameId = null;
let playerId = socket.id;
let gameState = null;

// DOM elements
const playerHandEl = document.getElementById('player-hand');
const dealerHandEl = document.getElementById('dealer-hand');
const playerBoardEl = document.getElementById('player-board');
const dealerBoardEl = document.getElementById('dealer-board');
const standButton = document.getElementById('stand-button');
const hitButton = document.getElementById('hit-button');
const gameMessageEl = document.createElement('div');
const readyButton = document.createElement('button');

// Add message and ready button to the page
const gameBoard = document.getElementById('game-board');
gameMessageEl.id = 'game-message';
readyButton.id = 'ready-button';
readyButton.textContent = 'Ready';
gameBoard.appendChild(gameMessageEl);
gameBoard.appendChild(readyButton);

// Hide buttons initially
standButton.style.display = 'none';
hitButton.style.display = 'none';
readyButton.style.display = 'none';

// Join a game when the page loads
window.onload = function() {
    // Ask if player wants to join an existing game or create a new one
    const isMultiplayer = confirm('Do you want to play multiplayer? (Cancel for single player)');
    
    // For now, just create a new game
    socket.emit('join-game', { isMultiplayer });
};

// Handle game creation
socket.on('game-created', (data) => {
    gameId = data.gameId;
    gameMessageEl.textContent = `Game created! Game ID: ${gameId}. Waiting for players...`;
    readyButton.style.display = 'block';
});

// Handle joining a game
socket.on('game-state', (state) => {
    gameState = state;
    
    // Update UI based on game state
    renderGameState();
    
    // Show appropriate buttons based on game state
    if (state.gameState === 'waiting') {
        readyButton.style.display = 'block';
        standButton.style.display = 'none';
        hitButton.style.display = 'none';
        
        // If we're in a multiplayer game, show the game ID
        if (state.isMultiplayer) {
            gameMessageEl.textContent = gameId ? `Multiplayer game! Game ID: ${gameId}. Click Ready when you're ready.` : 
                                        'Multiplayer game! Share the page URL to invite a friend.';
        } else {
            gameMessageEl.textContent = 'Single player game. Click Ready to start.';
        }
    } else if (state.gameState === 'playing') {
        readyButton.style.display = 'none';
        
        // Show game buttons only for the current player
        if (state.currentPlayer === playerId) {
            standButton.style.display = 'block';
            hitButton.style.display = 'block';
            gameMessageEl.textContent = 'Your turn!';
        } else {
            standButton.style.display = 'none';
            hitButton.style.display = 'none';
            
            if (state.isMultiplayer) {
                gameMessageEl.textContent = "Opponent's turn...";
            } else {
                gameMessageEl.textContent = "Dealer's turn...";
            }
        }
    } else if (state.gameState === 'finished') {
        standButton.style.display = 'none';
        hitButton.style.display = 'none';
        readyButton.style.display = 'none';
    }
});

// Handle ready button
readyButton.addEventListener('click', () => {
    socket.emit('player-ready');
    readyButton.disabled = true;
    readyButton.textContent = 'Ready (waiting)';
});

// Handle stand action
standButton.addEventListener('click', () => {
    socket.emit('stand');
});

// Handle hit action
hitButton.addEventListener('click', () => {
    socket.emit('hit');
});

// Handle game over
socket.on('game-over', (data) => {
    // Show game over message
    if (data.winner === playerId) {
        gameMessageEl.textContent = 'You win!';
    } else if (data.winner === 'dealer' || !data.winner) {
        gameMessageEl.textContent = 'You lose!';
    } else {
        gameMessageEl.textContent = 'Game over!';
    }
    
    // Show final scores
    const scores = data.scores.map(s => 
        `${s.playerId === playerId ? 'You' : s.playerId === 'dealer' ? 'Dealer' : 'Opponent'}: ${s.score}`
    ).join(' | ');
    
    // Create a new div for scores
    const scoresEl = document.createElement('div');
    scoresEl.textContent = scores;
    gameBoard.appendChild(scoresEl);
    
    // Add a restart button
    const restartButton = document.createElement('button');
    restartButton.textContent = 'Play Again';
    restartButton.addEventListener('click', () => {
        location.reload();
    });
    gameBoard.appendChild(restartButton);
});

// Handle errors
socket.on('game-error', (error) => {
    console.error('Game error:', error.message);
    alert('Error: ' + error.message);
});

// Handle player disconnected
socket.on('player-disconnected', (data) => {
    gameMessageEl.textContent = `Player ${data.playerId} disconnected. Game over.`;
    standButton.style.display = 'none';
    hitButton.style.display = 'none';
    readyButton.style.display = 'none';
});

// Render the game state
function renderGameState() {
    if (!gameState || !gameState.players) return;
    
    // Clear existing content
    playerHandEl.innerHTML = '';
    dealerHandEl.innerHTML = '';
    playerBoardEl.innerHTML = '';
    dealerBoardEl.innerHTML = '';
    
    // Find current player and dealer
    const player = gameState.players[playerId];
    const dealer = Object.values(gameState.players).find(p => p.id !== playerId);
    
    // Render player hand (side cards)
    if (player && player.hand) {
        player.hand.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card side-card';
            cardEl.textContent = card.value >= 0 ? `+${card.value}` : `${card.value}`;
            cardEl.onclick = () => {
                // Can only play side cards during your turn
                if (gameState.currentPlayer === playerId && gameState.gameState === 'playing') {
                    socket.emit('play-side-card', { 
                        cardId: card.id, 
                        targetPlayerId: playerId // For now, play on yourself
                    });
                }
            };
            playerHandEl.appendChild(cardEl);
        });
    }
    
    // Render dealer hand (side cards)
    if (dealer && dealer.hand) {
        dealer.hand.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card side-card';
            cardEl.textContent = card.value >= 0 ? `+${card.value}` : `${card.value}`;
            dealerHandEl.appendChild(cardEl);
        });
    }
    
    // Render player board (main cards)
    if (player && player.board) {
        player.board.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card';
            cardEl.textContent = card.value;
            playerBoardEl.appendChild(cardEl);
        });
    }
    
    // Render dealer board (main cards)
    if (dealer && dealer.board) {
        dealer.board.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card';
            cardEl.textContent = card.value;
            dealerBoardEl.appendChild(cardEl);
        });
    }
    
    // Add scores
    if (player) {
        const playerScore = document.createElement('div');
        playerScore.className = 'score';
        playerScore.textContent = `Score: ${player.score}`;
        playerBoardEl.appendChild(playerScore);
    }
    
    if (dealer) {
        const dealerScore = document.createElement('div');
        dealerScore.className = 'score';
        dealerScore.textContent = `Score: ${dealer.score}`;
        dealerBoardEl.appendChild(dealerScore);
    }
}