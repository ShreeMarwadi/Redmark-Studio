/* =====================================================
   REDMARK STUDIO - Particle System
   Animated background particles
   ===================================================== */

class ParticleSystem {
    constructor(container) {
        this.container = container;
        this.particles = [];
        this.maxParticles = 50;
        this.animationId = null;
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.init();
    }
    
    init() {
        this.createParticles();
        this.setupMouseTracking();
        this.animate();
    }
    
    createParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.createParticle();
        }
    }
    
    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 4 + 2;
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const delay = Math.random() * 10;
        const opacity = Math.random() * 0.5 + 0.2;
        
        const colors = ['#00E5FF', '#6C63FF', '#14F1D9', '#FFFFFF'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            opacity: ${opacity};
            pointer-events: none;
            left: ${x}px;
            top: ${y}px;
            box-shadow: 0 0 ${size * 2}px ${color};
            transition: opacity 0.3s ease;
        `;
        
        this.container.appendChild(particle);
        
        this.particles.push({
            element: particle,
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: size,
            color: color,
            delay: delay
        });
    }
    
    setupMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        document.addEventListener('mouseleave', () => {
            this.mouseX = -1000;
            this.mouseY = -1000;
        });
    }
    
    animate() {
        const time = Date.now() / 1000;
        
        this.particles.forEach((particle) => {
            if (time < particle.delay) return;
            
            particle.vx += (Math.random() - 0.5) * 0.02;
            particle.vy += (Math.random() - 0.5) * 0.02;
            
            const dx = this.mouseX - particle.x;
            const dy = this.mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 200 && distance > 0) {
                const force = (200 - distance) / 200;
                particle.vx += (dx / distance) * force * 0.01;
                particle.vy += (dy / distance) * force * 0.01;
            }
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            particle.vx *= 0.99;
            particle.vy *= 0.99;
            
            if (particle.x < 0) particle.x = window.innerWidth;
            if (particle.x > window.innerWidth) particle.x = 0;
            if (particle.y < 0) particle.y = window.innerHeight;
            if (particle.y > window.innerHeight) particle.y = 0;
            
            particle.element.style.left = particle.x + 'px';
            particle.element.style.top = particle.y + 'px';
            
            const pulse = Math.sin(time * 2) * 0.3 + 0.7;
            particle.element.style.opacity = pulse * 0.5;
            particle.element.style.boxShadow = `0 0 ${particle.size * 2 * pulse}px ${particle.color}`;
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    setDimmed(dimmed) {
        this.particles.forEach(particle => {
            particle.element.style.transition = 'opacity 0.5s ease';
            particle.element.style.opacity = dimmed ? '0.15' : '0.5';
        });
    }
    
    setStatic(isStatic) {
        if (isStatic) {
            cancelAnimationFrame(this.animationId);
            this.particles.forEach(particle => {
                particle.element.style.opacity = '0.1';
            });
        } else {
            this.animate();
        }
    }
}

window.ParticleSystem = ParticleSystem;
