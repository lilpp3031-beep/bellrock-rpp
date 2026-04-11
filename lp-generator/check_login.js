const { chromium } = require('playwright');

(async () => {
  try {
    console.log('Connecting to Chrome CDP on localhost:9222...');
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    console.log('Connected!');
    
    const contexts = browser.contexts();
    if (!contexts || contexts.length === 0) {
      console.log('No contexts found');
      await browser.close();
      return;
    }
    
    const pages = contexts[0].pages();
    if (!pages || pages.length === 0) {
      console.log('No pages found');
      await browser.close();
      return;
    }
    
    const page = pages[0];
    console.log('Got page:', page.url());
    
    // Take screenshot
    await page.screenshot({ 
      path: '/tmp/1688_login_check.png'
    });
    console.log('Screenshot saved to /tmp/1688_login_check.png');
    
    await browser.close();
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
  }
})();
