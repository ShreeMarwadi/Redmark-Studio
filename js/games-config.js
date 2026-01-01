const GamesConfig = {
    version: '1.0.0',

    games: [
        {
            id: 'chess',
            title: 'Cosmic Chess',
            ...
        },
        {
            id: 'leaf-frog',
            title: 'FrogJump',
            ...
        }
    ],

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

window.GamesConfig = GamesConfig;
