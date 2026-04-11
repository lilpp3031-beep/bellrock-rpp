const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const contexts = browser.contexts();
    const page = contexts[0].pages()[0];
    
    const url = 'https://detail.1688.com/offer/654424222725.html';
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Deep analysis of page structure
    const analysis = await page.evaluate(() => {
      const results = {
        selectors: {},
        elements: {}
      };
      
      // Test each selector
      const selectorsToTest = {
        'h1': 'h1',
        '.ant-descriptions': '.ant-descriptions',
        '.detail-content': '.detail-content',
        '.ql-editor': '.ql-editor',
        '[class*="description"]': '[class*="description"]',
        '[class*="spec"]': '[class*="spec"]',
        '[class*="attr"]': '[class*="attr"]',
      };
      
      for (const [name, selector] of Object.entries(selectorsToTest)) {
        const elem = document.querySelector(selector);
        if (elem) {
          results.selectors[name] = {
            found: true,
            tagName: elem.tagName,
            className: elem.className,
            textPreview: elem.innerText?.substring(0, 150)
          };
        } else {
          results.selectors[name] = { found: false };
        }
      }
      
      // Look for any elements with specs/attributes/properties
      const allElements = document.querySelectorAll('[class*="attr"], [class*="spec"], [class*="prop"], [class*="property"]');
      const elemList = [];
      allElements.forEach(el => {
        elemList.push({
          tag: el.tagName,
          class: el.className.substring(0, 100),
          text: el.innerText?.substring(0, 200)
        });
      });
      results.specLikeElements = elemList.slice(0, 10);
      
      // Look at page title and all h1/h2 elements
      results.pageInfo = {
        title: document.title,
        h1Elements: Array.from(document.querySelectorAll('h1')).map(el => el.innerText?.substring(0, 100))
      };
      
      return results;
    });
    
    console.log('\n=== Deep Page Analysis ===\n');
    console.log('Selectors Test Results:');
    for (const [name, result] of Object.entries(analysis.selectors)) {
      console.log(`\n${name}:`, result.found ? '✓ FOUND' : '✗ NOT FOUND');
      if (result.found) {
        console.log(`  Tag: <${result.tagName}>`);
        console.log(`  Class: ${result.className}`);
        console.log(`  Content: "${result.textPreview}"`);
      }
    }
    
    console.log('\n\n=== Elements with spec/attr/prop keywords ===');
    analysis.specLikeElements.forEach((el, i) => {
      console.log(`\n${i+1}. <${el.tag}> class="${el.class}"`);
      console.log(`   "${el.text}"`);
    });
    
    console.log('\n\n=== Page Info ===');
    console.log('Title:', analysis.pageInfo.title);
    console.log('H1 Elements:', analysis.pageInfo.h1Elements);
    
    await browser.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
