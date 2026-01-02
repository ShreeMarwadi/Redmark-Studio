/**
 * Redmark Studio - Main JavaScript
 * Handles navigation, game loading, animations, and modal functionality
 */

// =====================================================
// Game Configuration - Add new games here!
// =====================================================
const gamesConfig = [
    {
        id: 'snake-game',
        title: 'Snake Classic',
        genre: 'Arcade',
        description: 'The classic snake game you know and love, with a modern redmark twist.',
        thumbnail: 'assets/images/snake-thumb.svg',
        gamePath: 'games/snake-game/index.html',
        featured: true
    },
    {
        id: 'puzzle-blocks',
        title: 'Puzzle Blocks',
        genre: 'Puzzle',
        'description': 'Test your spatial reasoning with this addictive block puzzle game.',
        thumbnail: 'assets/images/puzzle-thumb.svg',
        gamePath: 'games/puzzle-blocks/index.html',
        featured: false
    },
    {
        id: 'space-dodge',
        title: 'Space Dodge',
        genre: 'Arcade',
        description: 'Navigate through an asteroid field in this fast-paced space survival game.',
        thumbnail: 'assets/images/space-thumb.svg',
        gamePath: 'games/space-dodge/index.html',
        featured: false
    },

    {
    id: 'chess',
    title: 'Royal Chess',
    genre: 'Strategy',
    description: 'Jump across floating leaves, climb higher, and survive as long as you can.',
    thumbnail: 'assets/images/ChessCardView.png',
    gamePath: 'games/chess/index.html'
    
},

    {
    id: 'Leaf-Frog',
    title: 'Frog Jump',
    genre: 'Endless',
    description: 'Jump across floating leaves, climb higher, and survive as long as you can.',
    thumbnail: 'assets/images/FrogJumpCardView.jpeg',
    gamePath: 'games/Leaf-Frog/index.html'
    
}
];

// =====================================================
// DOM Elements
// =====================================================
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.nav-link');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileNavLinks = document.querySelector('.nav-links');
const mobileNavSocial = document.querySelector('.nav-social');
const gamesGrid = document.getElementById('games-grid');
const gameModal = document.getElementById('game-modal');
const modalOverlay = document.getElementById('modal-overlay');
const closeModalBtn = document.getElementById('close-modal');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const modalTitle = document.getElementById('modal-title');
const gameFrame = document.getElementById('game-frame');

// =====================================================
// Navigation
// =====================================================

// Scroll effect for navbar
function handleScroll() {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Update active nav link based on scroll position
    updateActiveNavLink();
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        const link = document.querySelector(`.nav-link[href="#${id}"]`);
        
        if (link && scrollPos >= top && scrollPos < top + height) {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        }
    });
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            closeMobileMenu();
        }
    });
});

// Mobile menu toggle
function toggleMobileMenu() {
    mobileMenuBtn.classList.toggle('active');
    mobileNavLinks.classList.toggle('active');
    mobileNavSocial?.classList.toggle('active');
    document.body.style.overflow = mobileNavLinks.classList.contains('active') ? 'hidden' : '';
}

function closeMobileMenu() {
    mobileMenuBtn.classList.remove('active');
    mobileNavLinks.classList.remove('active');
    mobileNavSocial?.classList.remove('active');
    document.body.style.overflow = '';
}

// =====================================================
// Game Grid Rendering
// =====================================================
function renderGames() {
    if (!gamesGrid) return;
    
    gamesGrid.innerHTML = '';
    
    gamesConfig.forEach((game, index) => {
        const card = createGameCard(game, index);
        gamesGrid.appendChild(card);
    });
}

function createGameCard(game, index) {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.setAttribute('data-game-id', game.id);
    card.style.animationDelay = `${index * 0.1}s`;
    
    card.innerHTML = `
        <div class="game-thumbnail">
            <img src="${game.thumbnail}" alt="${game.title}" loading="lazy">
            <div class="game-thumbnail-overlay">
                <button class="play-btn" data-game-path="${game.gamePath}" data-game-title="${game.title}">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                    Play Now
                </button>
            </div>
        </div>
        <div class="game-info">
            <span class="game-genre">${game.genre}</span>
            <h3 class="game-title">${game.title}</h3>
            <p class="game-description">${game.description}</p>
        </div>
    `;
    
    // Add click event to card
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.play-btn')) {
            openGame(game.gamePath, game.title);
        }
    });
    
    return card;
}

function getGenreIcon(genre) {
    const icons = {
        'Arcade': '◉',
        'Puzzle': '◈',
        'Action': '◆',
        'Strategy': '▣',
        'Adventure': '◇'
    };
    return icons[genre] || '●';
}

// =====================================================
// Game Modal
// =====================================================
function openGame(gamePath, gameTitle) {
    if (!gameModal || !gameFrame || !modalTitle) return;
    
    modalTitle.textContent = gameTitle;
    gameFrame.src = gamePath;
    gameModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Play button sound effect (optional)
    playSoundEffect();
}

function closeGame() {
    if (!gameModal || !gameFrame) return;
    
    gameModal.classList.remove('active');
    gameModal.classList.remove('fullscreen');
    gameFrame.src = '';
    document.body.style.overflow = '';
}

function toggleFullscreen() {
    gameModal.classList.toggle('fullscreen');
    
    if (gameModal.classList.contains('fullscreen')) {
        document.documentElement.requestFullscreen?.();
    } else {
        document.exitFullscreen?.();
    }
}

// =====================================================
// Sound Effects (Optional)
// =====================================================
function playSoundEffect() {
    // Create a simple click sound using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // Audio not supported, ignore
    }
}

// =====================================================
// Intersection Observer for Animations
// =====================================================
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements that should animate on scroll
    document.querySelectorAll('.game-card, .feature, .about-card').forEach(el => {
        observer.observe(el);
    });
}

// =====================================================
// Keyboard Navigation
// =====================================================
function handleKeyboard(e) {
    // Close modal with Escape key
    if (e.key === 'Escape' && gameModal?.classList.contains('active')) {
        closeGame();
    }
    
    // Fullscreen with F key
    if (e.key === 'f' && gameModal?.classList.contains('active')) {
        toggleFullscreen();
    }
}

// =====================================================
// Initialize
// =====================================================
function init() {
    // Event listeners
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('keydown', handleKeyboard);
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeGame);
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeGame);
    }
    
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
    
    // Delegate play button clicks
    document.addEventListener('click', (e) => {
        const playBtn = e.target.closest('.play-btn');
        if (playBtn) {
            const gamePath = playBtn.dataset.gamePath;
            const gameTitle = playBtn.dataset.gameTitle;
            openGame(gamePath, gameTitle);
        }
    });
    
    // Render games
    renderGames();
    
    // Setup scroll animations
    setupScrollAnimations();
    
    // Initial scroll check
    handleScroll();
}

// Start the application
document.addEventListener('DOMContentLoaded', init);

// =====================================================
// Utility Functions
// =====================================================

/**
 * Add a new game to the studio
 * @param {Object} game - Game configuration object
 */
function addGame(game) {
    gamesConfig.push(game);
    renderGames();
}

/**
 * Remove a game from the studio
 * @param {string} gameId - The ID of the game to remove
 */
function removeGame(gameId) {
    const index = gamesConfig.findIndex(g => g.id === gameId);
    if (index > -1) {
        gamesConfig.splice(index, 1);
        renderGames();
    }
}

/**
 * Update game configuration
 * @param {string} gameId - The ID of the game to update
 * @param {Object} updates - Object containing updated properties
 */
function updateGame(gameId, updates) {
    const index = gamesConfig.findIndex(g => g.id === gameId);
    if (index > -1) {
        gamesConfig[index] = { ...gamesConfig[index], ...updates };
        renderGames();
    }
}

// Export functions for external use
window.RedmarkStudio = {
    addGame,
    removeGame,
    updateGame,
    openGame,
    closeGame
};
