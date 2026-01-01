/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                REDMARK STUDIO - GAMES CONFIG                      ║
 * ║            Central registry for all web games                     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

const GamesConfig = {
    version: '1.0.0',

    // ───────────────────────────────────────────────────────────────
    // GAME LIST
    // ───────────────────────────────────────────────────────────────
    games: [
        {
            id: 'chess',
            title: 'Cosmic Chess',
            description:
                'A handcrafted chess experience with full rule validation, AI opponent, and smooth animations.',
            shortDescription: 'Strategic chess with AI',
            genre: 'Strategy',
            tags: ['Chess', 'Board', 'AI'],
            icon: '♟️',
            path: 'games/chess/index.html',
            playable: true,
            featured: true,

            stats: {
                plays: '50+',          // ✅ FIXED VALUE
                rating: 4.8,
                difficulty: 'Medium'
            },

            instructions: [
                'Tap a piece to see valid moves',
                'White always starts first',
                'Supports castling, en passant, and promotion',
                'Defeat the opponent by checkmate'
            ]
        },

        // ───────────────────────────────────────────────────────────
        // EXAMPLE: ADD A NEW GAME LIKE THIS
        // ───────────────────────────────────────────────────────────
        {
            id: 'Leaf-Frog',
            title: 'FrogJump',
            description: 'A new game is currently under development.',
            shortDescription: 'More fun on the way',
            genre: 'Casual',
            tags: ['New'],
            icon: '🎮',
            path: 'games/Leaf-Frog/',
            playable: true,
            featured: true,

            stats: {
                plays: '10',
                rating: 8,
                difficulty: 'Easy'
            },

            instructions: ['Coming soon']
        }
    ],


    
    // ───────────────────────────────────────────────────────────────
    // HELPERS
    // ───────────────────────────────────────────────────────────────

    getPlayableGames() {
        return this.games.filter(game => game.playable);
    },

    getFeaturedGames() {
        return this.games.filter(game => game.featured && game.playable);
    },

    getGameById(id) {
        return this.games.find(game => game.id === id);
    },

    getTotalStats() {
        const playable = this.getPlayableGames();
        return {
            totalGames: playable.length,
            totalPlays: '50+',
            featuredCount: this.getFeaturedGames().length
        };
    }
};

// ───────────────────────────────────────────────────────────────────
// EXPORT
// ───────────────────────────────────────────────────────────────────

window.GamesConfig = GamesConfig;
