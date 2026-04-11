const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const page = browser.contexts()[0].pages()[0];
    
    // Navigate to product page
    const url = 'https://detail.1688.com/offer/654424222725.html';
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    
    // Test each selector individually
    console.log('\n=== DIRECT SELECTOR TESTS ===\n');
    
    const tests = [
      ['.ant-descriptions', 'ant-descriptions'],
      ['.module-od-product-attributes', 'product-attributes'],
      ['[class*="attr"]', 'class*=attr'],
      ['h1', 'h1 title'],
    ];
    
    for (const [sel, name] of tests) {
      const result = await page.evaluate((selector) => {
        const elem = document.querySelector(selector);
        if (!elem) return null;
        return {
          found: true,
          text: elem.innerText?.trim() || '',
          length: elem.innerText?.trim().length || 0,
          tagName: elem.tagName,
          className: elem.className
        };
      }, sel);
      
      console.log(`Selector: ${name} ("${sel}")`);
      if (result) {
        console.log(`  ✓ FOUND - ${result.length} chars`);
        console.log(`  Tag: <${result.tagName}> class="${result.className}"`);
        console.log(`  Text: "${result.text.substring(0, 100)}"`);
      } else {
        console.log(`  ✗ NOT FOUND`);
      }
      console.log('');
    }
    
    await browser.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
