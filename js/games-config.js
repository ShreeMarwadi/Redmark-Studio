

const GamesConfig = {
    // Current version of the platform
    version: '1.0.0',
    
    // Game registry - Add new games here
    games: [
        {
            id: 'chess',
            title: 'Cosmic Chess',
            description: 'Experience chess in a whole new dimension. Complete move validation, special moves, and an elegant dark-themed interface.',
            shortDescription: 'Strategic chess in space',
            genre: 'Strategy',
            tags: ['Chess', 'Strategy', 'Board Game'],
            icon: '♟️',
            path: 'games/chess/',
            playable: true,
            featured: true,
            stats: {
                plays: getPlayCount('chess')
                rating: 4.8,
                difficulty: 'Medium'
            },
            instructions: [
                'Click a piece to select it (highlighted squares show valid moves)',
                'Click a destination square to move the piece',
                'White always moves first',
                'Capture the enemy king to win (checkmate)',
                'Special moves: Castling, En Passant, and Pawn Promotion are supported'
            ]
        }
        // FUTURE GAMES - Add new games following this format:
        /*
        {
            id: 'game-id',
            title: 'Game Title',
            description: 'Full description of the game',
            shortDescription: 'Brief description',
            genre: 'Puzzle',
            tags: ['Puzzle', 'Logic', 'Casual'],
            icon: '🎮',
            path: 'games/your-game-folder/',
            playable: true,
            featured: false,
            stats: {
                plays: 0,
                rating: 0,
                difficulty: 'Easy'
            },
            instructions: [
                'Step 1: Do this',
                'Step 2: Do that',
                'Step 3: Win!'
            ]
        }
        */
    ],
    
    // Get all playable games
    getPlayableGames() {
        return this.games.filter(game => game.playable);
    },
    
    // Get game by ID
    getGameById(id) {
        return this.games.find(game => game.id === id);
    },
    
    // Get featured games
    getFeaturedGames() {
        return this.games.filter(game => game.featured && game.playable);
    },
    
    // Increment play count
    incrementPlayCount(id) {
        const game = this.getGameById(id);
        if (game) {
            game.stats.plays++;
            this.saveStats();
        }
    },
    
    // Save stats to localStorage
    saveStats() {
        try {
            localStorage.setItem('nebula_games_stats', JSON.stringify(
                this.games.map(g => ({ id: g.id, plays: g.stats.plays }))
            ));
        } catch (e) {
            console.warn('Could not save game stats');
        }
    },
    
    // Load stats from localStorage
    loadStats() {
        try {
            const saved = localStorage.getItem('nebula_games_stats');
            if (saved) {
                const stats = JSON.parse(saved);
                stats.forEach(s => {
                    const game = this.getGameById(s.id);
                    if (game) {
                        game.stats.plays = s.plays;
                    }
                });
            }
        } catch (e) {
            console.warn('Could not load game stats');
        }
    },
    
    // Get total stats
    getTotalStats() {
        const playable = this.getPlayableGames();
        return {
            totalGames: playable.length,
            totalPlays: playable.reduce((sum, g) => sum + g.stats.plays, 0),
            featuredCount: this.getFeaturedGames().length
        };
    }
};

// Load saved stats on initialization
GamesConfig.loadStats();

// Export for use
window.GamesConfig = GamesConfig;

const STORAGE_KEY = 'redmark_games_plays';

function loadPlays() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
}

function savePlays(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getPlayCount(gameId) {
    const data = loadPlays();
    return data[gameId] || 0;
}

function incrementPlayCount(gameId) {
    const data = loadPlays();
    data[gameId] = (data[gameId] || 0) + 1;
    savePlays(data);
}

