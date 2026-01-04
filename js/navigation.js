/* =====================================================
   REDMARK STUDIO - Navigation System
   Page routing and navigation handling
   ===================================================== */

class Navigation {
    constructor() {
        this.currentPage = 'home';
        this.isTransitioning = false;
        this.pages = document.querySelectorAll('.page');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.particles = null;
        
        this.init();
    }
    
    init() {
        this.setupNavigation();
        this.setupScrollEffects();
        this.setupKeyboardNavigation();
    }
    
    setupNavigation() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateTo(page);
            });
        });
        
        window.addEventListener('hashchange', () => {
            this.handleHashChange();
        });
        
        this.handleHashChange();
    }
    
    handleHashChange() {
        const hash = window.location.hash.slice(1);
        
        if (hash.startsWith('game=')) {
            const gameId = hash.split('=')[1];
            this.navigateTo('game', gameId);
        } else if (hash) {
            this.navigateTo(hash);
        } else {
            this.navigateTo('home');
        }
    }
    
    navigateTo(page, gameId = null) {
        if (this.isTransitioning) return;
        if (page === this.currentPage && !gameId) return;
        
        this.isTransitioning = true;
        
        if (gameId) {
            window.location.hash = `game=${gameId}`;
        } else {
            window.location.hash = page;
        }
        
        this.pages.forEach(p => {
            p.classList.remove('active');
            p.style.display = 'none';
        });
        
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });
        
        if (page === 'game' && gameId) {
            this.loadGamePage(gameId);
        }
        
        const targetPage = document.getElementById(page);
        if (targetPage) {
            targetPage.style.display = 'block';
            targetPage.offsetHeight;
            targetPage.classList.add('active');
            this.updateParticleBehavior(page);
        }
        
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        this.currentPage = page;
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, 300);
    }
    
    loadGamePage(gameId) {
        const gamePageContainer = document.getElementById('gamePageContainer');
        const game = GAMES_CONFIG.find(g => g.id === gameId);

        if (!game) {
            gamePageContainer.innerHTML = `
                <div class="game-not-found">
                    <h2>Game Not Found</h2>
                    <p>The game you're looking for doesn't exist.</p>
                    <button class="btn btn-primary" onclick="navigateTo('games')">Back to Games</button>
                </div>
            `;
            return;
        }

        gamePageContainer.innerHTML = `
            <div class="game-header">
                <button class="game-back-btn" onclick="navigateTo('games')">
                    <span>←</span>
                    <span>Back to Arcade</span>
                </button>
                <div class="game-header-badges">
                    ${game.new ? '<span class="card-badge new">New</span>' : ''}
                    ${game.popular ? '<span class="card-badge popular">Popular</span>' : ''}
                    ${game.multiplayer ? '<span class="card-badge multiplayer">Multiplayer</span>' : ''}
                </div>
                <h1 class="game-header-title">${game.title}</h1>
                <p class="game-header-tagline">${game.tagline}</p>
                <div class="game-header-tags">
                    ${game.tags.map(tag => `<span class="card-tag">${tag}</span>`).join('')}
                </div>
            </div>

            <div class="game-container">
                <div class="game-frame-wrapper">
                    <div class="game-frame-header">
                        <div class="game-frame-dots">
                            <div class="game-frame-dot"></div>
                            <div class="game-frame-dot"></div>
                            <div class="game-frame-dot"></div>
                        </div>
                        <span class="game-frame-title">${game.title}</span>
                        <button class="game-frame-btn" onclick="gameFullscreen()">Fullscreen</button>
                    </div>
                    <div class="game-frame" id="gameFrame">
                        <iframe
                            id="gameIframe"
                            src="${game.file}"
                            style="width:100%;height:100%;border:none;background:#0B0E14;"
                            allowfullscreen
                        ></iframe>
                    </div>
                </div>

                <div class="game-sidebar">
                    <div class="sidebar-section">
                        <h3 class="sidebar-title">Controls</h3>
                        <div class="controls-list">
                            ${game.controls.map(control => `
                                <div class="control-item">
                                    <div class="control-key">
                                        ${control.keys.map(key => `<span>${key}</span>`).join(' + ')}
                                    </div>
                                    <span class="control-desc">${control.action}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="sidebar-section">
                        <h3 class="sidebar-title">Version Info</h3>
                        <div class="version-info">
                            <span class="version-number">v${game.version}</span>
                            <span class="version-date">${game.releaseDate}</span>
                        </div>
                        <div class="changelog-list">
                            ${game.changelog.map(log => `
                                <div class="changelog-item">${log}</div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="sidebar-section">
                        <h3 class="sidebar-title">Stats</h3>
                        <div class="game-stats">
                            <div class="game-stat">
                                <div class="game-stat-value">${game.plays}</div>
                                <div class="game-stat-label">Plays</div>
                            </div>
                            <div class="game-stat">
                                <div class="game-stat-value">${game.rating}</div>
                                <div class="game-stat-label">Rating</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    updateParticleBehavior(page) {
        if (!this.particles) return;
        
        switch (page) {
            case 'home':
                this.particles.setDimmed(false);
                this.particles.setStatic(false);
                break;
            case 'games':
                this.particles.setDimmed(true);
                this.particles.setStatic(false);
                break;
            case 'game':
                this.particles.setStatic(true);
                break;
            default:
                this.particles.setDimmed(false);
                this.particles.setStatic(false);
        }
    }
    
    setupScrollEffects() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const nav = document.getElementById('mainNav');
            
            if (scrolled > 50) {
                nav.style.background = 'rgba(11, 14, 20, 0.95)';
                nav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
            } else {
                nav.style.background = 'rgba(11, 14, 20, 0.8)';
                nav.style.boxShadow = 'none';
            }
        });
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '4' && !e.ctrlKey && !e.metaKey) {
                const pages = ['home', 'games', 'about', 'contact'];
                const index = parseInt(e.key) - 1;
                if (index < pages.length) {
                    this.navigateTo(pages[index]);
                }
            }
        });
    }
    
    setParticles(particles) {
        this.particles = particles;
    }
}

window.Navigation = Navigation;
