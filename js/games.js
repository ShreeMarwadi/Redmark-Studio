/* =====================================================
   REDMARK STUDIO - Games Manager
   Games data, grid rendering, and filtering
   ===================================================== */

class GamesManager {
    constructor() {
        this.games = GAMES_CONFIG;
        this.filteredGames = [...this.games];
        this.currentFilter = 'all';
        this.currentSort = 'new';
        this.grid = null;
        
        this.init();
    }
    
    init() {
        this.grid = document.getElementById('gamesGrid');
        this.renderGames();
        this.setupFilters();
        this.setupSorting();
    }
    
    renderGames() {
        if (!this.grid) return;
        
        this.applyFilters();
        
        if (this.filteredGames.length === 0) {
            this.grid.innerHTML = `
                <div class="games-empty">
                    <div class="games-empty-icon">🎮</div>
                    <p class="games-empty-text">No games found in this category</p>
                </div>
            `;
            return;
        }
        
        this.grid.innerHTML = this.filteredGames.map((game, index) => `
            <div class="game-card" 
                 data-game="${game.id}" 
                 data-index="${index}">
                <div class="card-thumbnail">
                    <div class="card-thumbnail-bg" style="
                        background: linear-gradient(135deg, 
                            ${this.getGradientColor(game.genre, 0)} 0%, 
                            ${this.getGradientColor(game.genre, 1)} 100%);
                    "></div>
                    <div class="card-thumbnail-overlay"></div>
                    <div class="card-badges">
                        ${game.new ? '<span class="card-badge new">New</span>' : ''}
                        ${game.popular ? '<span class="card-badge popular">Popular</span>' : ''}
                        ${game.multiplayer ? '<span class="card-badge multiplayer">Multiplayer</span>' : ''}
                    </div>
                    <div class="card-play-btn" onclick="navigateTo('game', '${game.id}')">▶</div>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${game.title}</h3>
                    <p class="card-description">${game.description}</p>
                    <div class="card-meta">
                        <div class="card-tags">
                            ${game.tags.map(tag => `<span class="card-tag">${tag}</span>`).join('')}
                        </div>
                        <span class="card-play-text">Play Now</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        this.animateCardsIn();
    }
    
    getGradientColor(genre, index) {
        const colors = {
            'action': ['#00E5FF', '#6C63FF'],
            'puzzle': ['#14F1D9', '#00E5FF'],
            'strategy': ['#6C63FF', '#4834D4']
        };
        
        const themeColors = colors[genre] || ['#00E5FF', '#6C63FF'];
        return themeColors[index];
    }
    
    animateCardsIn() {
        const cards = this.grid.querySelectorAll('.game-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    setupFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.renderGames();
            });
        });
    }
    
    setupSorting() {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentSort = btn.dataset.sort;
                this.renderGames();
            });
        });
    }
    
    applyFilters() {
        if (this.currentFilter === 'all') {
            this.filteredGames = [...this.games];
        } else {
            this.filteredGames = this.games.filter(game => 
                game.genre === this.currentFilter ||
                game.tags.some(tag => tag.toLowerCase().includes(this.currentFilter))
            );
        }
        
        this.filteredGames.sort((a, b) => {
            if (this.currentSort === 'new') {
                if (a.new && !b.new) return -1;
                if (!a.new && b.new) return 1;
                return b.popular ? 1 : -1;
            } else if (this.currentSort === 'popular') {
                if (a.popular && !b.popular) return -1;
                if (!a.popular && b.popular) return 1;
                return 0;
            }
            return 0;
        });
    }
}

window.GamesManager = GamesManager;
