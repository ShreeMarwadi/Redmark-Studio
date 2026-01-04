const GAMES_CONFIG = [
    {
        id: 'cyber-chess',
        title: 'Cyber Chess',
        description: 'A modern, smooth, and competitive chess experience built for web and mobile.',
        tagline: 'Classic chess. Modern feel.',
        tags: ['chess', 'strategy', 'board-game', 'ai'],
        genre: 'strategy',
        file: 'games/cyber-chess/index.html',
        new: true,
        popular: true,
        multiplayer: true,
        plays: '12,450',
        rating: '4.8',
        version: '1.2.0',
        releaseDate: 'Dec 15, 2024',
        controls: [
            { keys: ['Click'], action: 'Select Piece' },
            { keys: ['Click'], action: 'Move Piece' }
        ],
        changelog: [
            'Improved AI difficulty',
            'Mobile controls optimized',
            'UI polish'
        ]
    },

    {
        id: 'leaf-frog',
        title: 'Frog Jump',
        description: 'How high can you go?',
        tagline: 'Jump. Dodge. Survive.',
        tags: ['endless', 'platformer'],
        genre: 'platformer',
        file: 'games/Leaf-Frog/index.html',
        new: true,
        popular: false,
        multiplayer: false,
        plays: '50+',
        rating: '4.0',
        version: '1.0.0',
        releaseDate: 'Jan 2025',
        controls: [
            { keys: ['A', '←'], action: 'Move Left' },
            { keys: ['D', '→'], action: 'Move Right' }
        ],
        changelog: [
            'Initial release'
        ]
    },

    {
        id: 'snake-game',
        title: 'Snake',
        description: 'Eat and grow your snake.',
        tagline: 'Classic arcade survival',
        tags: ['arcade', 'endless'],
        genre: 'arcade',
        file: 'games/snake-game/index.html',
        new: true,
        popular: false,
        multiplayer: false,
        plays: '50+',
        rating: '4.0',
        version: '1.0.0',
        releaseDate: 'Jan 2025',
        controls: [
            { keys: ['W', '↑'], action: 'Move Up' },
            { keys: ['S', '↓'], action: 'Move Down' },
            { keys: ['A', '←'], action: 'Move Left' },
            { keys: ['D', '→'], action: 'Move Right' }
        ],
        changelog: [
            'Initial release'
        ]
    },

    {
        id: 'space-dodge',
        title: 'Space Dodge',
        description: 'Protect your spaceship from falling asteroids.',
        tagline: 'Survive the void',
        tags: ['space', 'survival', 'arcade'],
        genre: 'survival',
        file: 'games/space-dodge/index.html',
        new: true,
        popular: false,
        multiplayer: false,
        plays: '50+',
        rating: '4.2',
        version: '1.0.0',
        releaseDate: 'Jan 2025',
        controls: [
            { keys: ['WASD', 'Arrow Keys'], action: 'Move Ship' },
            { keys: ['Touch'], action: 'Swipe to Move (Mobile)' }
        ],
        changelog: [
            'Mobile swipe controls added',
            'Performance improvements'
        ]
    }
];

window.GAMES_CONFIG = GAMES_CONFIG;
