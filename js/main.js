/* =====================================================
   REDMARK STUDIO - Main Initialization
   Application startup and utilities
   ===================================================== */

class RedmarkStudio {
    constructor() {
        this.particles = null;
        this.navigation = null;
        this.games = null;
        this.core = null;
        
        this.init();
    }
    
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }
    
    start() {
        const container = document.getElementById('particle-container');
        if (container) {
            this.particles = new ParticleSystem(container);
            window.particles = this.particles;
        }
        
        this.navigation = new Navigation();
        window.navigation = this.navigation;
        
        if (this.particles) {
            this.navigation.setParticles(this.particles);
        }
        
        this.games = new GamesManager();
        window.gamesManager = this.games;
        
        this.core = new CoreDashboard();
        window.coreDashboard = this.core;
        
        this.animateStats();
        
        console.log('Redmark Studio initialized successfully');
    }
    
    animateStats() {
        const stats = document.querySelectorAll('.stat-number');
        stats.forEach(stat => {
            const endValue = parseFloat(stat.dataset.count);
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !stat.dataset.animated) {
                        stat.dataset.animated = 'true';
                        this.countUp(stat, endValue);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(stat);
        });
    }
    
    countUp(element, endValue) {
        const duration = 2000;
        const startTime = performance.now();
        const isDecimal = String(endValue).includes('.');
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 4);
            const current = endValue * easeOut;
            
            if (isDecimal) {
                element.textContent = current.toFixed(1);
            } else if (endValue >= 1000) {
                element.textContent = Math.floor(current).toLocaleString();
            } else {
                element.textContent = Math.floor(current);
            }
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }
}

window.RedmarkStudio = RedmarkStudio;
