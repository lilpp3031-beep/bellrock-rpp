const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const contexts = browser.contexts();
    const page = contexts[0].pages()[0];
    
    const url = 'https://detail.1688.com/offer/654424222725.html';
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);
    
    const SELECTORS = {
      alibaba_1688: {
        specs: ['.ant-descriptions', '.module-od-product-attributes', '[class*="attr"]', '.spec-table', '.property', '[data-attribute]', '.specs-container', '.propPc'],
      }
    };
    
    console.log('\n=== Testing Each Spec Selector ===\n');
    
    for (const selector of SELECTORS.alibaba_1688.specs) {
      const result = await page.evaluate((sel) => {
        const elem = document.querySelector(sel);
        if (!elem) return { found: false, text: '' };
        const text = elem.innerText?.trim() || '';
        return { found: true, text: text.substring(0, 200), length: text.length };
      }, selector);
      
      console.log(`Selector: "${selector}"`);
      console.log(`  Found: ${result.found}`);
      if (result.found) {
        console.log(`  Length: ${result.length} chars`);
        console.log(`  Preview: "${result.text}"`);
      }
      console.log('');
    }
    
    await browser.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
