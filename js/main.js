/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                    REDMARK STUDIO - MAIN JS                       ║
 * ║              Core Application Logic & Navigation                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════
// APPLICATION STATE
// ═══════════════════════════════════════════════════════════════════

const AppState = {
    currentPage: 'home',
    isLoading: true
};

// ═══════════════════════════════════════════════════════════════════
// NAVIGATION SYSTEM
// ═══════════════════════════════════════════════════════════════════

/**
 * Navigate to a specific page
 */
function navigateTo(pageName) {
    // Hide current page
    const currentPageEl = document.getElementById(`${AppState.currentPage}-page`);
    if (currentPageEl) {
        currentPageEl.classList.remove('active');
    }
    
    // Update state
    AppState.currentPage = pageName;
    
    // Show new page
    const newPageEl = document.getElementById(`${pageName}-page`);
    if (newPageEl) {
        newPageEl.classList.add('active');
    }
    
    // Update navigation
    updateNavigation(pageName);
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Page-specific initialization
    if (pageName === 'home') {
        loadHomeGames();
    } else if (pageName === 'games') {
        loadAllGames();
    }
}

/**
 * Update active navigation state
 */
function updateNavigation(pageName) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });
}

// ═══════════════════════════════════════════════════════════════════
// GAMES LOADING SYSTEM
// ═══════════════════════════════════════════════════════════════════

/**
 * Load games grid for home page
 */
function loadHomeGames() {
    const grid = document.getElementById('home-games-grid');
    if (!grid) return;
    
    const playableGames = GamesConfig.getPlayableGames();
    grid.innerHTML = playableGames.map(game => createGameCard(game)).join('');
}

/**
 * Load all games for games page
 */
function loadAllGames() {
    const grid = document.getElementById('games-page-grid');
    if (!grid) return;
    
    const playableGames = GamesConfig.getPlayableGames();
    grid.innerHTML = playableGames.map(game => createGameCard(game)).join('');
}

/**
 * Create a game card HTML element
 */
function createGameCard(game) {
    return `
        <a class="game-card" href="${game.path}">
            <div class="game-thumbnail">
                <span class="game-icon">${game.icon}</span>
            </div>
            <div class="game-info">
                <h3 class="game-title">${game.title}</h3>
                <p class="game-description">${game.shortDescription}</p>
                <div class="game-tags">
                    <span class="game-tag primary">${game.genre}</span>
                    <span class="game-tag">${game.stats.difficulty}</span>
                    <span class="game-tag">${game.stats.plays} plays</span>
                </div>
            </div>
        </a>
    `;
}


// ═══════════════════════════════════════════════════════════════════
// ANIMATED COUNTERS
// ═══════════════════════════════════════════════════════════════════

function animateCounters() {
    const stats = GamesConfig.getTotalStats();
    
    // Animate game count
    animateNumber('games', stats.totalGames);
    
    // Animate plays count
    animateNumber('plays', stats.totalPlays);
    
    // Animate updates count
    animateNumber('updates', 24);
}

/**
 * Animate a number counter
 */
function animateNumber(elementId, target) {
    const element = document.querySelector(`[data-count="${elementId}"]`);
    if (!element) return;
    
    const duration = 2000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// ═══════════════════════════════════════════════════════════════════
// LOADING & INITIALIZATION
// ═══════════════════════════════════════════════════════════════════

/**
 * Hide loading screen
 */
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 800);
    }
    AppState.isLoading = false;
}

/**
 * Initialize the application
 */
function initApp() {
    console.log('🚀 Initializing Redmark Studio...');
    
    // Load initial content
    loadHomeGames();
    
    // Hide loading screen after a delay
    setTimeout(hideLoadingScreen, 1800);
    
    // Animate counters
    setTimeout(animateCounters, 2200);
    
    console.log('✅ Redmark Studio initialized successfully');
}

// ═══════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Show toast notification
 */
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: rgba(139, 0, 0, 0.9);
        color: white;
        padding: 12px 24px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.75rem;
        letter-spacing: 1px;
        border-radius: 4px;
        z-index: 10001;
        animation: toastIn 0.3s ease forwards;
        box-shadow: 0 0 30px rgba(139, 0, 0, 0.4);
    `;
    
    // Add animation keyframes if not present
    if (!document.getElementById('toast-styles')) {
        const styles = document.createElement('style');
        styles.id = 'toast-styles';
        styles.textContent = `
            @keyframes toastIn {
                to {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                }
            }
            @keyframes toastOut {
                to {
                    transform: translateX(-50%) translateY(20px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

/**
 * Debounce function for performance
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ═══════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════

window.App = {
    state: AppState,
    navigate: navigateTo,
    showToast
};

// ═══════════════════════════════════════════════════════════════════
// INITIALIZE ON DOM READY
// ═══════════════════════════════════════════════════════════════════

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
