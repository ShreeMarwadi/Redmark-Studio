// =======================================
// Redmark Studio - Games Configuration
// Pure data file (NO logic, NO storage)
// =======================================

const GamesConfig = {
    // Platform version
    version: '1.0.0',

    // Game registry
    games: [
        {
            id: 'chess',
            title: 'Cosmic Chess',
            description:
                'Experience chess in a whole new dimension. Complete move validation, special moves, and an elegant dark-themed interface.',
            shortDescription: 'Strategic chess in space',
            genre: 'Strategy',
            tags: ['Chess', 'Strategy', 'Board Game'],
            icon: '♟️',
            path: 'games/chess/',
            playable: true,
            featured: true,

            // Stats (STATIC for now, safe)
            stats: {
                plays: 0,
                rating: 4.8,
                difficulty: 'Medium'
            },

            instructions: [
                'Click a piece to select it (highlighted squares show valid moves)',
                'Click a destination square to move the piece',
                'White always moves first',
                'Win by checkmating the opponent king',
                'Special moves: Castling, En Passant, and Pawn Promotion are supported'
            ]
        }

        // Future games can be added here safely
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

    // Get total stats (safe, no storage)
    getTotalStats() {
        const playable = this.getPlayableGames();
        return {
            totalGames: playable.length,
            totalPlays: playable.reduce((sum, g) => sum + g.stats.plays, 0),
            featuredCount: this.getFeaturedGames().length
        };
    }
};

// Expose globally
window.GamesConfig = GamesConfig;
