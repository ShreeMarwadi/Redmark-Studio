const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const errors = [];
    const logs = [];
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
        logs.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    page.on('pageerror', err => {
        errors.push(err.message);
    });
    
    const filePath = path.join(__dirname, 'index.html');
    await page.goto(`file://${filePath}`);
    
    // Wait for game to initialize
    await page.waitForTimeout(2000);
    
    // Check if canvas exists
    const canvasExists = await page.$('#gameCanvas');
    console.log('Canvas exists:', !!canvasExists);
    
    // Check if menu is visible
    const menuVisible = await page.$eval('#menu', el => !el.classList.contains('hidden'));
    console.log('Menu visible:', menuVisible);
    
    // Check high score display
    const highScoreText = await page.$eval('#highScoreDisplay', el => el.textContent);
    console.log('High score display:', highScoreText);
    
    // Click start button
    await page.click('#startBtn');
    await page.waitForTimeout(1000);
    
    // Check if game started
    const menuHidden = await page.$eval('#menu', el => el.classList.contains('hidden'));
    console.log('Game started (menu hidden):', menuHidden);
    
    // Test keyboard input briefly
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(300);
    await page.keyboard.up('ArrowRight');
    
    console.log('\n--- Console Logs ---');
    logs.forEach(log => console.log(log));
    
    console.log('\n--- Errors ---');
    if (errors.length === 0) {
        console.log('No errors found!');
    } else {
        errors.forEach(err => console.log('ERROR:', err));
    }
    
    await browser.close();
    
    process.exit(errors.length > 0 ? 1 : 0);
})();
