const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const contexts = browser.contexts();
    const page = contexts[0].pages()[0];
    
    // Navigate to product page
    const url = 'https://detail.1688.com/offer/654424222725.html';
    console.log('Navigating to:', url);
    
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 30000 });
      console.log('✓ Page loaded successfully');
    } catch (err) {
      console.log('Navigation error:', err.message);
    }
    
    // Take screenshot
    await page.screenshot({ path: '/tmp/1688_product_test.png' });
    console.log('Screenshot saved');
    
    // Check page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check if we got a login page or product page
    const isLoginPage = await page.evaluate(() => {
      return document.body.innerText.includes('登録') || 
             document.body.innerText.includes('ログイン') ||
             document.querySelector('[class*="login"]') !== null;
    });
    
    console.log('Is login page?', isLoginPage);
    
    // Get page content snippet
    const content = await page.evaluate(() => {
      return document.body.innerText.substring(0, 500);
    });
    
    console.log('Page content snippet:');
    console.log(content);
    
    await browser.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
