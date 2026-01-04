const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testWebsite() {
    console.log('Starting Redmark Studio website test...');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Collect console messages
    const consoleMessages = [];
    const consoleErrors = [];
    
    page.on('console', msg => {
        const text = msg.text();
        consoleMessages.push({ type: msg.type(), text });
        if (msg.type() === 'error') {
            consoleErrors.push(text);
        }
    });
    
    page.on('pageerror', error => {
        consoleErrors.push(error.message);
    });
    
    try {
        // Load the main HTML file
        const htmlPath = path.join(__dirname, 'index.html');
        const fileUrl = `file://${htmlPath}`;
        
        console.log(`Loading: ${fileUrl}`);
        await page.goto(fileUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        // Wait for JavaScript to initialize
        await page.waitForTimeout(2000);
        
        // Check if main elements are present
        const checks = [];
        
        // Check navigation
        const navExists = await page.$('.main-nav');
        checks.push({ name: 'Navigation', pass: !!navExists });
        
        // Check particle container
        const particlesExists = await page.$('#particle-container');
        checks.push({ name: 'Particle Container', pass: !!particlesExists });
        
        // Check home page
        const homeExists = await page.$('#home');
        checks.push({ name: 'Home Page', pass: !!homeExists });
        
        // Check games page
        const gamesExists = await page.$('#games');
        checks.push({ name: 'Games Page', pass: !!gamesExists });
        
        // Check about page
        const aboutExists = await page.$('#about');
        checks.push({ name: 'About Page', pass: !!aboutExists });
        
        // Check contact page
        const contactExists = await page.$('#contact');
        checks.push({ name: 'Contact Page', pass: !!contactExists });
        
        // Check core dashboard
        const coreExists = await page.$('#core-dashboard');
        checks.push({ name: 'Core Dashboard', pass: !!coreExists });
        
        // Check hero section
        const heroExists = await page.$('.hero-section');
        checks.push({ name: 'Hero Section', pass: !!heroExists });
        
        // Check games grid
        const gridExists = await page.$('.games-grid');
        checks.push({ name: 'Games Grid', pass: !!gridExists });
        
        // Print results
        console.log('\n=== Element Checks ===');
        checks.forEach(check => {
            const status = check.pass ? '✓' : '✗';
            console.log(`${status} ${check.name}`);
        });
        
        // Check console errors
        console.log('\n=== Console Analysis ===');
        const errorCount = consoleErrors.length;
        const totalMessages = consoleMessages.length;
        
        console.log(`Total messages: ${totalMessages}`);
        console.log(`Errors: ${errorCount}`);
        
        if (errorCount > 0) {
            console.log('\nErrors found:');
            consoleErrors.forEach((err, i) => {
                console.log(`${i + 1}. ${err}`);
            });
        } else {
            console.log('No JavaScript errors detected!');
        }
        
        // Overall result
        const allPassed = checks.every(c => c.pass) && errorCount === 0;
        console.log('\n=== Test Result ===');
        console.log(allPassed ? '✓ All tests passed!' : '✗ Some tests failed');
        
        return allPassed;
        
    } catch (error) {
        console.error('Test failed with error:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// Run test if called directly
if (require.main === module) {
    testWebsite().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { testWebsite };
