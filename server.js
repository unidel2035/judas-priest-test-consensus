const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Import the Pazaak game model
const PazaakGame = require('./models/game');

// Store active games
const games = new Map();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join or create a game
    socket.on('join-game', (data) => {
        const { gameId, isMultiplayer = false } = data || {};
        
        let game;
        
        // If gameId provided and exists, join that game
        if (gameId && games.has(gameId)) {
            game = games.get(gameId);
            
            // Check if game is already full (2 players max for now)
            if (Object.keys(game.players).length >= 2) {
                socket.emit('game-error', { message: 'Game is full' });
                return;
            }
            
            // Add player to existing game
            game.addPlayer(socket.id);
        } else {
            // Create a new game
            game = new PazaakGame(socket.id, isMultiplayer);
            games.set(game.gameId, game);
            
            // Let the client know the game ID
            socket.emit('game-created', { gameId: game.gameId });
        }
        
        // Join the game room
        socket.join(game.gameId);
        
        // Send current game state to the player
        socket.emit('game-state', game.getGameState());
        
        // Broadcast updated game state to all players in the game
        io.to(game.gameId).emit('game-state', game.getGameState());
        
        console.log(`Player ${socket.id} joined game ${game.gameId}`);
    });

    // Handle player ready
    socket.on('player-ready', () => {
        const game = Array.from(games.values()).find(g => g.players[socket.id]);
        
        if (!game) {
            socket.emit('game-error', { message: 'Game not found' });
            return;
        }
        
        // Mark player as ready
        game.players[socket.id].isReady = true;
        
        // Check if all players are ready
        const allReady = Object.keys(game.players).every(playerId => game.players[playerId].isReady);
        
        if (allReady) {
            // Start the game
            game.startGame();
            io.to(game.gameId).emit('game-state', game.getGameState());
        } else {
            // Update game state for all players
            io.to(game.gameId).emit('game-state', game.getGameState());
        }
    });

    // Handle hit action
    socket.on('hit', () => {
        const game = Array.from(games.values()).find(g => g.players[socket.id]);
        
        if (!game) {
            socket.emit('game-error', { message: 'Game not found' });
            return;
        }
        
        if (game.hit(socket.id)) {
            // Broadcast updated game state
            io.to(game.gameId).emit('game-state', game.getGameState());
            
            // Check if game is finished
            if (game.gameState === 'finished') {
                const winner = game.getWinner();
                io.to(game.gameId).emit('game-over', { 
                    winner: winner,
                    scores: Object.keys(game.players).map(playerId => ({
                        playerId: playerId,
                        score: game.players[playerId].score,
                        hasWon: playerId === winner
                    }))
                });
            }
        } else {
            socket.emit('game-error', { message: 'Invalid move' });
        }
    });

    // Handle stand action
    socket.on('stand', () => {
        const game = Array.from(games.values()).find(g => g.players[socket.id]);
        
        if (!game) {
            socket.emit('game-error', { message: 'Game not found' });
            return;
        }
        
        if (game.stand(socket.id)) {
            // Broadcast updated game state
            io.to(game.gameId).emit('game-state', game.getGameState());
            
            // Check if game is finished
            if (game.gameState === 'finished') {
                const winner = game.getWinner();
                io.to(game.gameId).emit('game-over', { 
                    winner: winner,
                    scores: Object.keys(game.players).map(playerId => ({
                        playerId: playerId,
                        score: game.players[playerId].score,
                        hasWon: playerId === winner
                    }))
                });
            }
        } else {
            socket.emit('game-error', { message: 'Invalid move' });
        }
    });

    // Handle playing a side card
    socket.on('play-side-card', (data) => {
        const { cardId, targetPlayerId } = data;
        
        const game = Array.from(games.values()).find(g => g.players[socket.id]);
        
        if (!game) {
            socket.emit('game-error', { message: 'Game not found' });
            return;
        }
        
        if (game.playSideCard(socket.id, cardId, targetPlayerId)) {
            // Broadcast updated game state
            io.to(game.gameId).emit('game-state', game.getGameState());
            
            // Check if game is finished
            if (game.gameState === 'finished') {
                const winner = game.getWinner();
                io.to(game.gameId).emit('game-over', { 
                    winner: winner,
                    scores: Object.keys(game.players).map(playerId => ({
                        playerId: playerId,
                        score: game.players[playerId].score,
                        hasWon: playerId === winner
                    }))
                });
            }
        } else {
            socket.emit('game-error', { message: 'Invalid move' });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        // Find and remove player from games
        for (const [gameId, game] of games.entries()) {
            if (game.players[socket.id]) {
                // Remove player from game
                delete game.players[socket.id];
                
                // If no players left, remove game
                if (Object.keys(game.players).length === 0) {
                    games.delete(gameId);
                } else {
                    // Notify remaining players
                    io.to(gameId).emit('player-disconnected', { playerId: socket.id });
                }
                
                break;
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});