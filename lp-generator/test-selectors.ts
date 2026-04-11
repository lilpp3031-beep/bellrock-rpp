import { chromium } from 'playwright';

async function debugImageSelectors() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled']
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  });
  const page = await context.newPage();

  try {
    const url = 'https://detail.1688.com/offer/654424222725.html?kj_agent_plugin=aliprice&fromkv=xytTrace:212b9de517743601527122077e11b7&token=4lUm9D5vfH34gPDPUFCTE5ulk%2BZtg9lZyfVMm9rCW81CR9NF3wazVPVrIzV%2F1p%2BE';
    console.log(`\n🔍 Analyzing: ${url}\n`);

    // Add headers to look like a real browser
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Wait for dynamic content and multiple rounds of loading
    console.log('⏳ Waiting for dynamic content...');
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(1500);
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight * 0.5);
      });
    }
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });

    // Get page content to see what's actually loaded
    const pageTitle = await page.title();
    const bodyHTML = await page.evaluate(() => document.body.innerHTML.substring(0, 500));

    console.log(`Title: ${pageTitle}`);
    console.log(`Body HTML preview: ${bodyHTML}\n`);

    // Get all visible elements with src attributes
    const allElements = await page.evaluate(() => {
      const els: any[] = [];

      // Get all img elements
      document.querySelectorAll('img').forEach((img) => {
        if (img.src || img.getAttribute('data-src')) {
          els.push({
            type: 'img',
            src: img.src || img.getAttribute('data-src'),
            classes: img.className,
            visible: img.offsetHeight > 0 && img.offsetWidth > 0,
          });
        }
      });

      // Get elements with background images
      document.querySelectorAll('[style*="background"]').forEach((el) => {
        const style = (el as HTMLElement).getAttribute('style') || '';
        if (style.includes('url')) {
          els.push({
            type: 'bg-style',
            html: style.substring(0, 150),
            classes: (el as HTMLElement).className,
          });
        }
      });

      return els.slice(0, 20);
    });

    console.log('📊 Found elements with images:\n');
    console.log(JSON.stringify(allElements, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

debugImageSelectors();
