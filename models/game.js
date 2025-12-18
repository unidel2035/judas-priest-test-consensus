/**
 * Pazaak Game Model
 * Implements the core game logic for Pazaak
 */

class PazaakGame {
    constructor(playerId, isMultiplayer = false) {
        this.gameId = this.generateGameId();
        this.players = {};
        this.currentPlayer = null;
        this.gameState = 'waiting'; // waiting, playing, finished
        this.isMultiplayer = isMultiplayer;
        this.turnStartTime = null;
        this.turnTimeout = 30000; // 30 seconds per turn

        // Initialize player
        this.addPlayer(playerId);
    }

    generateGameId() {
        return Math.random().toString(36).substring(2, 15);
    }

    addPlayer(playerId) {
        this.players[playerId] = {
            id: playerId,
            hand: this.generatePlayerHand(),
            board: [],
            score: 0,
            hasStood: false,
            isReady: false
        };

        // If this is the first player, they start
        if (Object.keys(this.players).length === 1) {
            this.currentPlayer = playerId;
        }

        return this.players[playerId];
    }

    generatePlayerHand() {
        // Generate 4 random side cards for the player's hand
        const sideCards = [];
        const possibleValues = [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6];
        
        for (let i = 0; i < 4; i++) {
            const randomIndex = Math.floor(Math.random() * possibleValues.length);
            sideCards.push({
                id: `card-${Date.now()}-${i}`,
                value: possibleValues[randomIndex]
            });
        }
        
        return sideCards;
    }

    startGame() {
        if (this.gameState !== 'waiting') return false;
        
        // In single player, add a dealer
        if (!this.isMultiplayer && Object.keys(this.players).length === 1) {
            this.addPlayer('dealer');
            this.players['dealer'].isDealer = true;
        }
        
        // Validate we have enough players
        if (Object.keys(this.players).length < 2) return false;
        
        this.gameState = 'playing';
        this.turnStartTime = Date.now();
        
        // Deal first card to each player
        for (const playerId in this.players) {
            this.dealCard(playerId);
        }
        
        return true;
    }

    dealCard(playerId) {
        if (!this.players[playerId]) return null;
        
        // Draw a random card from 1-10
        const cardValue = Math.floor(Math.random() * 10) + 1;
        this.players[playerId].board.push({
            id: `board-${Date.now()}-${playerId}-${this.players[playerId].board.length}`,
            value: cardValue
        });
        
        // Update score
        this.updatePlayerScore(playerId);
        
        return cardValue;
    }

    updatePlayerScore(playerId) {
        if (!this.players[playerId]) return;
        
        let score = 0;
        this.players[playerId].board.forEach(card => {
            score += card.value;
        });
        
        this.players[playerId].score = score;
    }

    playSideCard(playerId, cardId, targetPlayerId) {
        if (!this.isValidMove(playerId)) return false;
        
        const player = this.players[playerId];
        const cardIndex = player.hand.findIndex(card => card.id === cardId);
        
        if (cardIndex === -1) return false;
        
        // Get the card
        const card = player.hand[cardIndex];
        
        // Apply card to target player's board
        const targetPlayer = this.players[targetPlayerId];
        if (!targetPlayer) return false;
        
        // Add the card to target's board
        targetPlayer.board.push({
            id: `side-${Date.now()}-${cardId}`,
            value: card.value,
            isSideCard: true,
            playedBy: playerId
        });
        
        // Remove from hand
        player.hand.splice(cardIndex, 1);
        
        // Update score
        this.updatePlayerScore(targetPlayerId);
        
        // Check if game is over
        this.checkGameEnd();
        
        // Switch turn if not in multiplayer mode or if player is done
        if (!this.isMultiplayer || this.players[playerId].hasStood) {
            this.switchTurn();
        }
        
        return true;
    }

    stand(playerId) {
        if (!this.isValidMove(playerId)) return false;
        
        this.players[playerId].hasStood = true;
        
        // Switch turn
        this.switchTurn();
        
        // Check if game is over
        this.checkGameEnd();
        
        return true;
    }

    hit(playerId) {
        if (!this.isValidMove(playerId)) return false;
        
        // Deal a card to the player
        this.dealCard(playerId);
        
        // Check if player busts (over 20)
        if (this.players[playerId].score > 20) {
            this.players[playerId].hasStood = true;
            // Player busts, switch turn
            this.switchTurn();
        }
        
        // Check if game is over
        this.checkGameEnd();
        
        return true;
    }

    isValidMove(playerId) {
        // Check if it's this player's turn
        if (this.currentPlayer !== playerId) return false;
        
        // Check if game is in progress
        if (this.gameState !== 'playing') return false;
        
        // Check if player has stood
        if (this.players[playerId].hasStood) return false;
        
        return true;
    }

    switchTurn() {
        // In single player game, just switch between player and dealer
        if (!this.isMultiplayer) {
            const playerIds = Object.keys(this.players);
            const currentPlayerIndex = playerIds.indexOf(this.currentPlayer);
            const nextPlayerIndex = (currentPlayerIndex + 1) % playerIds.length;
            this.currentPlayer = playerIds[nextPlayerIndex];
            
            // If we're back to the first player, it's a new round
            if (this.currentPlayer === Object.keys(this.players)[0]) {
                // Dealer AI logic
                if (this.currentPlayer === 'dealer') {
                    this.executeDealerTurn();
                }
            }
        } else {
            // In multiplayer, just switch to next player
            const playerIds = Object.keys(this.players);
            const currentPlayerIndex = playerIds.indexOf(this.currentPlayer);
            const nextPlayerIndex = (currentPlayerIndex + 1) % playerIds.length;
            this.currentPlayer = playerIds[nextPlayerIndex];
            
            // Skip players who have stood
            if (this.players[this.currentPlayer].hasStood) {
                this.switchTurn();
            }
        }
        
        this.turnStartTime = Date.now();
    }

    executeDealerTurn() {
        // Simple dealer AI
        const dealer = this.players['dealer'];
        
        // Dealer stands on 20
        if (dealer.score === 20) {
            this.stand('dealer');
            return;
        }
        
        // Dealer hits if score is less than 15
        if (dealer.score < 15) {
            this.hit('dealer');
            return;
        }
        
        // Between 15-19, 70% chance to hit
        if (dealer.score >= 15 && dealer.score < 20) {
            if (Math.random() < 0.7) {
                this.hit('dealer');
                return;
            }
        }
        
        // Otherwise stand
        this.stand('dealer');
    }

    checkGameEnd() {
        // Game ends when all players have stood or busted
        const allPlayersDone = Object.keys(this.players).every(playerId => {
            return this.players[playerId].hasStood || this.players[playerId].score > 20;
        });
        
        if (allPlayersDone) {
            this.gameState = 'finished';
            return true;
        }
        
        return false;
    }

    getWinner() {
        if (this.gameState !== 'finished') return null;
        
        // Find all players with 20 or under
        const validPlayers = Object.keys(this.players)
            .filter(playerId => this.players[playerId].score <= 20)
            .sort((a, b) => this.players[b].score - this.players[a].score);
            
        // If no players have valid scores, it's a draw
        if (validPlayers.length === 0) return null;
        
        // Return the player with highest score
        return validPlayers[0];
    }

    getGameState() {
        return {
            gameId: this.gameId,
            gameState: this.gameState,
            currentPlayer: this.currentPlayer,
            players: this.players,
            isMultiplayer: this.isMultiplayer,
            turnTimeLeft: this.turnTimeout - (Date.now() - this.turnStartTime)
        };
    }
}

module.exports = PazaakGame;