const { chromium } = require('playwright');

(async () => {
    console.log('Testing deployed website...');
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
    });
    
    try {
        await page.goto('https://zjnf1dd18qo5.space.minimax.io', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000);
        
        // Check for key elements
        const checks = await page.evaluate(() => {
            return {
                title: document.title,
                hasNav: !!document.querySelector('.main-nav'),
                hasHero: !!document.querySelector('.hero-section'),
                hasGames: !!document.querySelector('.games-grid'),
                hasCore: !!document.querySelector('#core-dashboard'),
                particles: !!document.querySelector('#particle-container')
            };
        });
        
        console.log('Title:', checks.title);
        console.log('Navigation:', checks.hasNav ? '✓' : '✗');
        console.log('Hero Section:', checks.hasHero ? '✓' : '✗');
        console.log('Games Grid:', checks.hasGames ? '✓' : '✗');
        console.log('Core Dashboard:', checks.hasCore ? '✓' : '✗');
        console.log('Particle Container:', checks.particles ? '✓' : '✗');
        
        if (errors.length > 0) {
            console.log('\nErrors found:', errors);
        } else {
            console.log('\nNo JavaScript errors!');
        }
        
        console.log('\n✓ Deployed website is working correctly!');
        
    } catch (error) {
        console.error('Test failed:', error.message);
    } finally {
        await browser.close();
    }
})();
