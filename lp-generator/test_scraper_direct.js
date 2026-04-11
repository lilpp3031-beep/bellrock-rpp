const { ScraperService } = require('./dist/services/scraper.service');

(async () => {
  const scraper = new ScraperService();
  
  try {
    console.log('Initializing scraper...');
    await scraper.initialize();
    
    console.log('Scraping URL...');
    const url = 'https://detail.1688.com/offer/654424222725.html';
    const content = await scraper.fetchPageContent(url);
    
    console.log('\n=== SCRAPED CONTENT ===\n');
    console.log('URL:', content.url);
    console.log('Title:', content.pageTitle);
    console.log('Images:', content.images.length);
    console.log('\nText Content (first 500 chars):');
    console.log(content.textContent.substring(0, 500));
    console.log('\nFull text content:');
    console.log(content.textContent);
    
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
