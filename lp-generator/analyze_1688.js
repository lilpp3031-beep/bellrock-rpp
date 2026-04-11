const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const contexts = browser.contexts();
    const page = contexts[0].pages()[0];
    
    const url = 'https://detail.1688.com/offer/654424222725.html';
    console.log('Navigating to:', url);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);
    
    // Analyze HTML structure for text extraction
    const analysis = await page.evaluate(() => {
      const results = {
        title: null,
        description: null,
        specs: null,
        features: null,
        price: null,
        selectors: {}
      };
      
      // Try different selectors for title
      const titleSelectors = [
        'h1',
        '.product-title',
        '[data-product-name]',
        '.main-title',
        '.offer-title',
        '.title'
      ];
      
      for (let sel of titleSelectors) {
        const elem = document.querySelector(sel);
        if (elem) {
          results.selectors.title = sel;
          results.title = elem.innerText?.substring(0, 200);
          break;
        }
      }
      
      // Try different selectors for description/details
      const descSelectors = [
        '.description',
        '[data-description]',
        '.detail-text',
        '.product-description',
        '.content',
        '.txt-bd',
        '.detail-content',
        '.ql-editor'
      ];
      
      for (let sel of descSelectors) {
        const elem = document.querySelector(sel);
        if (elem) {
          const text = elem.innerText?.substring(0, 500);
          if (text && text.length > 50) {
            results.selectors.description = sel;
            results.description = text;
            break;
          }
        }
      }
      
      // Try to find specs/properties table
      const specSelectors = [
        '.spec-table',
        '.property',
        '[data-attribute]',
        '.specs-container',
        '.propPc',
        'table.specs',
        '.attr-content'
      ];
      
      for (let sel of specSelectors) {
        const elem = document.querySelector(sel);
        if (elem) {
          results.selectors.specs = sel;
          results.specs = elem.innerText?.substring(0, 300);
          break;
        }
      }
      
      // Get all visible text snippets
      const allText = [];
      document.querySelectorAll('p, div[class*="desc"], div[class*="detail"], li').forEach(el => {
        const text = el.innerText?.trim();
        if (text && text.length > 30 && text.length < 500) {
          allText.push({
            tag: el.tagName,
            class: el.className.substring(0, 50),
            text: text.substring(0, 200)
          });
        }
      });
      
      results.textElements = allText.slice(0, 10);
      
      return results;
    });
    
    console.log('\n=== 1688 Page Structure Analysis ===\n');
    console.log('Title found:', !!analysis.title);
    if (analysis.title) console.log('  Selector:', analysis.selectors.title);
    console.log('  Content:', analysis.title);
    
    console.log('\nDescription found:', !!analysis.description);
    if (analysis.description) console.log('  Selector:', analysis.selectors.description);
    console.log('  Content:', analysis.description);
    
    console.log('\nSpecs found:', !!analysis.specs);
    if (analysis.specs) console.log('  Selector:', analysis.selectors.specs);
    console.log('  Content:', analysis.specs);
    
    console.log('\n=== Sample Text Elements ===');
    analysis.textElements.forEach((el, i) => {
      console.log(`\n${i+1}. <${el.tag}> class="${el.class}"`);
      console.log(`   "${el.text}"`);
    });
    
    await browser.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
