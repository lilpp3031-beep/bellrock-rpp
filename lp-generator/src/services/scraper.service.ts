import { chromium, Browser, Page } from 'playwright';
import { ScrapedContent, ImageUrl, DesignAnalysis, LayoutSection } from '../types';
import pino from 'pino';
import Anthropic from '@anthropic-ai/sdk';

const logger = pino();

/**
 * CSS selectors for common product page patterns
 */
const SELECTORS = {
  amazon: {
    images: ['img.a-dynamic-image', 'img.imageThumbnail', 'img[data-old-hires]'],
    title: ['span#productTitle', 'h1 span', '[data-feature-name="title"]'],
    description: ['div#feature-bullets ul', 'div#featurebullets_feature_div', 'div.feature'],
    price: ['span.a-price-whole', 'span.aok-offscreen', 'span.a-price span'],
    rating: ['span#acrPopover', 'div.a-icon-star span'],
  },
  alibaba_1688: {
    // Extended selectors for 1688/Alibaba pages - multiple patterns for different page layouts
    images: [
      // Primary image containers
      'img[src*="alicdn.com"]',
      'img[src*="aliyun"]',
      '[class*="image"] img',
      '[class*="gallery"] img',
      '[class*="product"] img',
      '[class*="detail"] img',
      // Specific patterns observed on 1688
      '.carousel img',
      '.slide-item img',
      '.upload-list img',
      '.upload-list-item img',
      '.normal-img',
      '.thumb-img',
      '[data-src*="alicdn"]',
      '[data-image]',
      '.gallery-img',
      '.product-image',
      'img.primary-image',
      'picture source',
      // Background images as fallback
      '[style*="background-image"]',
    ],
    title: ['.offer-title', '.main-title', 'h1', '.product-title', '[data-product-name]', '.title'],
    description: ['.detail-content', '.ql-editor', '.description', '[data-description]', '.detail-text', '.product-description', '.content', '.txt-bd'],
    specs: ['.ant-descriptions', '.module-od-product-attributes', '[class*="attr"]', '.spec-table', '.property', '[data-attribute]', '.specs-container', '.propPc'],
    price: ['.price', '[data-price]', '.product-price', '[class*="price"]'],
  },
  generic: {
    images: ['img', 'picture source', '[data-src]'],
    title: ['h1', 'h2', '.title', '[property="og:title"]'],
    description: ['p', '.text', '.content', '.description'],
    specs: ['table', '.specs', '[data-specs]'],
  },
};

export class ScraperService {
  private browser?: Browser;
  private claudeClient!: Anthropic;

  constructor() {
    if (!process.env.CLAUDE_API_KEY) {
      logger.warn('CLAUDE_API_KEY not set - Vision API will fail');
    }
    this.claudeClient = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY || '',
    });
  }

  async initialize(): Promise<void> {
    // Try to connect to an existing Chrome instance via CDP (for 1688/Alibaba with user session)
    // User must run: /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 &
    try {
      const cdpEndpoint = 'http://localhost:9222';
      logger.info({ endpoint: cdpEndpoint }, 'Attempting to connect to Chrome via CDP...');
      this.browser = await chromium.connectOverCDP(cdpEndpoint);
      logger.info('✅ Connected to existing Chrome instance (CDP mode)');
    } catch (cdpError) {
      // Fallback to launching a new headless browser
      logger.warn(`CDP connection failed (${cdpError instanceof Error ? cdpError.message : 'unknown error'}), launching new headless browser`);
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      logger.info('Playwright browser launched (headless mode - may encounter bot detection on some sites)');
    }
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      logger.info('Playwright browser closed');
    }
  }

  /**
   * Fetch and merge content from multiple Amazon ASINs
   */
  async fetchAmazonProducts(asins: string[]): Promise<ScrapedContent> {
    if (asins.length === 0) {
      throw new Error('At least one ASIN must be provided');
    }

    const allImages: ImageUrl[] = [];
    const allTextContent: string[] = [];
    let primaryProductData: any = null;

    // Fetch content for each ASIN
    for (let i = 0; i < asins.length; i++) {
      const asin = asins[i];
      const url = `https://www.amazon.com/dp/${asin}`;

      try {
        logger.info({ asin }, 'Fetching Amazon product');
        const content = await this.fetchPageContent(url);

        // Collect images from all products
        allImages.push(...content.images);

        // Collect text content
        if (content.textContent) {
          allTextContent.push(content.textContent);
        }

        // Use first product as primary for title and description
        if (i === 0) {
          primaryProductData = content;
        }
      } catch (error) {
        logger.warn({ asin, error }, 'Failed to fetch Amazon product');
        // Continue with other ASINs if one fails
      }
    }

    // Merge all collected data
    const mergedContent: ScrapedContent = {
      url: `amazon-multi-asin:${asins.join(',')}`,
      pageTitle: primaryProductData?.pageTitle || `Amazon Products (${asins.length} items)`,
      pageDescription: primaryProductData?.pageDescription || '',
      images: allImages.slice(0, 20), // Limit to 20 images total
      textContent: allTextContent.slice(0, 3).join('\n\n'), // Keep top 3 products' text
      structuredData: primaryProductData?.structuredData,
      metadata: {
        scrapedAt: new Date(),
        userAgent: 'Playwright Bot',
        sourceAsins: asins,
      },
    };

    return mergedContent;
  }

  /**
   * Fetch and scrape page content from URL
   */
  async fetchPageContent(url: string, timeout: number = 30000): Promise<ScrapedContent> {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    // Verify CDP connection is still valid
    try {
      const contexts = this.browser.contexts();
      if (!contexts || contexts.length === 0) {
        logger.warn('Browser contexts lost, reinitializing...');
        await this.initialize();
      }
    } catch (e) {
      logger.warn('Browser connection invalid, reinitializing...');
      await this.initialize();
    }

    // For CDP connections, try to reuse existing page to preserve user session
    let page;
    let shouldClosePage = false; // Track if we created this page (should close it) or reused it (don't close)
    try {
      const contexts = this.browser?.contexts();
      if (contexts && contexts.length > 0) {
        const pages = contexts[0].pages();
        if (pages && pages.length > 0) {
          logger.info('Reusing existing page with user session (CDP mode)');
          page = pages[0];
          shouldClosePage = false; // Don't close existing page - we'll reuse it
        } else {
          logger.info('Creating new page in existing context (CDP mode)');
          page = await contexts[0].newPage();
          shouldClosePage = true; // Close pages we created
        }
      } else {
        logger.info('No contexts found, creating new page');
        page = await this.browser!.newPage();
        shouldClosePage = true; // Close pages we created
      }
    } catch (e) {
      logger.warn(`Failed to get page from context: ${e instanceof Error ? e.message : 'unknown error'}`);
      page = await this.browser!.newPage();
      shouldClosePage = true; // Close pages we created
    }

    try {
      logger.info({ url }, 'Fetching page content');

      // Navigate with timeout - use 'domcontentloaded' for faster response and dynamic content
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout });

      // Wait a bit for dynamic content and images to load
      await page.waitForTimeout(1500);

      // Scroll to trigger lazy-loading
      await page.evaluate(() => {
        for (let i = 0; i < 3; i++) {
          window.scrollBy(0, window.innerHeight * 0.5);
        }
        window.scrollTo(0, 0);
      });

      const pageTitle = await page.title();
      const pageContent = await page.content();

      // For 1688/Alibaba, verify we're on a real product page by checking for product elements
      if (url.includes('1688.com') || url.includes('alibaba.com')) {
        // Check if page title suggests login page
        const isLikelyLoginPage = pageTitle.toLowerCase().includes('login') ||
                                  pageTitle.toLowerCase().includes('sign') ||
                                  pageTitle.toLowerCase().includes('登录');

        // Check if the page has actual product page structure (at minimum, some images or product data)
        const hasProductContent = await page.evaluate(() => {
          const imageCount = document.querySelectorAll('img').length;
          const hasPrice = document.body.textContent.match(/¥|RMB|人民币/) ? true : false;
          return imageCount > 3 || hasPrice;
        });

        if (isLikelyLoginPage && !hasProductContent) {
          logger.warn({ url, pageTitle }, '⚠️ 1688/Alibaba login page detected - bot likely blocked.');
          throw new Error('Bot detection: login page returned. Please use authenticated Chrome session via CDP: /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222 &');
        }

        if (!hasProductContent) {
          logger.warn({ url }, '⚠️ Could not find product content on 1688 page. May be rate limited or login required.');
        }
      }

      // Detect Amazon error pages
      if ((url.includes('amazon.com') || url.includes('amazon.co.jp')) &&
          (pageContent.includes('404') || pageContent.includes('Page Not Found') ||
           pageTitle.includes('Error') || pageTitle.includes('Page Not Found'))) {
        logger.warn({ url }, '⚠️ Amazon returned error page - ASIN may be invalid or blocked by bot detection');
        throw new Error('Amazon returned error page. ASIN may be invalid or the request was blocked. Try another ASIN or use Chrome DevTools Protocol with authenticated session.');
      }

      // Get page metadata
      let pageDescription = '';
      try {
        const descElement = page.locator('meta[name="description"]');
        const hasDescription = await descElement.isVisible().catch(() => false);
        if (hasDescription) {
          pageDescription = (await descElement.getAttribute('content')) || '';
        }
      } catch (e) {
        // Description element not found, use empty string
        logger.debug({ url }, 'Description meta tag not found');
      }

      // Detect site type and extract content
      const siteType = detectSiteType(url);
      const selectors = siteType === 'alibaba_1688' ? SELECTORS.alibaba_1688 : SELECTORS.generic;

      // Extract images
      const images = await this.extractImages(page, selectors.images);

      // Extract text content using selectors
      let textContent = '';
      let title = '';
      let description = '';
      let specs = '';

      // Extract title
      for (const selector of selectors.title) {
        try {
          const titleText = await page.evaluate((sel) => {
            const elem = document.querySelector(sel) as HTMLElement;
            return elem?.innerText?.trim() || '';
          }, selector);
          if (titleText && titleText.length > 10) {
            title = titleText.substring(0, 300);
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }

      // Extract specs FIRST (before description, as some selectors may overlap)
      for (const selector of selectors.specs) {
        try {
          const specsText = await page.evaluate((sel) => {
            const elem = document.querySelector(sel) as HTMLElement;
            return elem?.innerText?.trim() || '';
          }, selector);
          if (specsText && specsText.length > 20) {
            logger.info({ selector, textLength: specsText.length }, '✓ Specs extracted');
            specs = specsText.substring(0, 800);
            break;
          }
        } catch (e) {
          logger.debug({ selector }, 'Specs selector test failed');
        }
      }

      // Extract description
      for (const selector of selectors.description) {
        try {
          const descText = await page.evaluate((sel) => {
            const elem = document.querySelector(sel) as HTMLElement;
            return elem?.innerText?.trim() || '';
          }, selector);
          if (descText && descText.length > 20) {
            description = descText.substring(0, 1000);
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }

      // Combine extracted content
      textContent = [title, description, specs].filter(t => t.length > 0).join('\n\n');

      // Try to extract structured data (JSON-LD)
      let structuredData = undefined;
      try {
        const scriptContent = await page.$eval(
          'script[type="application/ld+json"]',
          (el) => el.textContent
        );
        if (scriptContent) {
          structuredData = JSON.parse(scriptContent);
        }
      } catch (e) {
        // Structured data not found, continue
      }

      return {
        url,
        pageTitle,
        pageDescription,
        images,
        textContent,
        structuredData,
        metadata: {
          scrapedAt: new Date(),
          userAgent: 'Playwright Bot',
        },
      };
    } finally {
      // Only close page if we created it. Don't close reused pages from existing context.
      if (shouldClosePage) {
        await page.close();
      }
    }
  }

  /**
   * Extract images from page - supports multiple image sources
   */
  private async extractImages(
    page: Page,
    imageSelectors: string[]
  ): Promise<ImageUrl[]> {
    const images: ImageUrl[] = [];
    const seenUrls = new Set<string>();

    // Scroll page to trigger lazy loading
    await page.evaluate(() => {
      for (let i = 0; i < 5; i++) {
        window.scrollBy(0, window.innerHeight * 0.5);
      }
      window.scrollTo(0, 0);
    });

    for (const selector of imageSelectors) {
      try {
        const elements = await page.$$(selector);

        for (const element of elements) {
          let imageUrl: string | null = null;
          let alt = '';
          let title = '';

          // Try different attributes for regular img elements
          const attrs = ['src', 'data-src', 'data-image', 'href'];
          for (const attr of attrs) {
            imageUrl = await element.getAttribute(attr);
            if (imageUrl && imageUrl.trim()) break;
          }

          // If no URL found in attributes, try to extract from background-image CSS
          if (!imageUrl) {
            const tagName = await element.evaluate((el: any) => el.tagName.toLowerCase());
            if (tagName !== 'img' && tagName !== 'picture') {
              const style = await element.getAttribute('style');
              if (style && style.includes('background-image')) {
                const match = style.match(/url\(['"]*([^'")+]+)['"]*\)/);
                if (match && match[1]) {
                  imageUrl = match[1];
                }
              }
            }
          }

          if (imageUrl && imageUrl.trim() && !seenUrls.has(imageUrl.trim())) {
            // Get image dimensions
            alt = (await element.getAttribute('alt')) || '';
            title = (await element.getAttribute('title')) || '';

            const dimensions = await element.evaluate((el: any) => {
              if (el.tagName.toLowerCase() === 'img') {
                return {
                  width: el.naturalWidth || el.width || undefined,
                  height: el.naturalHeight || el.height || undefined,
                };
              }
              return {};
            });

            const normalizedUrl = normalizeUrl(imageUrl.trim());
            if (normalizedUrl) {
              images.push({
                url: normalizedUrl,
                alt,
                title,
                ...dimensions,
              });
              seenUrls.add(imageUrl.trim());
            }
          }
        }
      } catch (e) {
        logger.debug({ selector, error: e }, 'Failed to extract from selector');
      }
    }

    return images.slice(0, 20); // Limit to first 20 images
  }

  /**
   * Extract structured product information
   */
  async extractProductInfo(
    page: Page,
    selectors: { title?: string[]; description?: string[]; specs?: string[] }
  ): Promise<Record<string, any>> {
    const info: Record<string, any> = {};

    // Extract title
    if (selectors.title) {
      for (const selector of selectors.title) {
        try {
          const text = await page.textContent(selector);
          if (text) {
            info.title = text.trim();
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
    }

    // Extract description
    if (selectors.description) {
      for (const selector of selectors.description) {
        try {
          const text = await page.textContent(selector);
          if (text) {
            info.description = text.trim().substring(0, 1000);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
    }

    // Extract specs
    if (selectors.specs) {
      for (const selector of selectors.specs) {
        try {
          const table = await page.evaluate((sel: string) => {
            const el = document.querySelector(sel);
            if (el && el.tagName === 'TABLE') {
              const rows: Record<string, string>[] = [];
              el.querySelectorAll('tr').forEach((row: Element) => {
                const cells = row.querySelectorAll('td, th');
                if (cells.length >= 2) {
                  rows.push({
                    key: (cells[0].textContent?.trim()) || '',
                    value: (cells[1].textContent?.trim()) || '',
                  });
                }
              });
              return rows;
            }
            return null;
          }, selector);

          if (table) {
            info.specs = table;
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
    }

    return info;
  }

  /**
   * Extract text content from Amazon URL for reference
   */
  async extractAmazonLPText(url: string): Promise<string> {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    let page;
    let shouldClosePage = false;
    try {
      const contexts = this.browser?.contexts();
      if (contexts && contexts.length > 0) {
        const pages = contexts[0].pages();
        if (pages && pages.length > 0) {
          page = pages[0];
          shouldClosePage = false;
        } else {
          page = await contexts[0].newPage();
          shouldClosePage = true;
        }
      } else {
        page = await this.browser!.newPage();
        shouldClosePage = true;
      }
    } catch (e) {
      page = await this.browser!.newPage();
      shouldClosePage = true;
    }

    try {
      logger.info({ url }, 'Extracting Amazon product images for Vision analysis');
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1500);

      // Extract product images and basic info
      const extractedData = await page.evaluate(() => {
        const imageUrls: string[] = [];
        const textParts: string[] = [];

        // Extract images
        const imgSelectors = ['img.a-dynamic-image', 'img[src*="images-amazon.com"]', 'img.imageThumbnail'];
        for (const selector of imgSelectors) {
          const imgs = document.querySelectorAll(selector);
          imgs.forEach((img) => {
            if (img instanceof HTMLImageElement && img.src) {
              const src = img.src.replace(/\._.*?_\./, '._SL1000_.'); // Standardize image size
              if (!imageUrls.includes(src) && src.includes('images-amazon.com')) {
                imageUrls.push(src);
              }
            }
          });
          if (imageUrls.length >= 3) break; // Get up to 3 images
        }

        // Extract title
        const titleEl = document.querySelector('span[id="productTitle"]') || document.querySelector('h1 span');
        if (titleEl && titleEl instanceof HTMLElement) {
          const title = titleEl.innerText?.trim();
          if (title) textParts.push(`【タイトル】${title}`);
        }

        // Extract bullets/features
        const bulletEl = document.querySelector('#feature-bullets');
        if (bulletEl) {
          const bullets = Array.from(bulletEl.querySelectorAll('li')).slice(0, 5).map(li => {
            if (li instanceof HTMLElement) return li.innerText?.trim() || '';
            return '';
          }).filter(t => t);
          if (bullets.length > 0) {
            textParts.push(`【特徴】\n${bullets.join('\n')}`);
          }
        }

        return { imageUrls, textInfo: textParts.join('\n') };
      });

      logger.info({ url, imageCount: extractedData.imageUrls.length }, 'Extracted Amazon product images');

      if (extractedData.imageUrls.length === 0) {
        logger.warn({ url }, 'No product images found on Amazon page');
        return extractedData.textInfo || '商品情報を取得できませんでした。';
      }

      // Analyze images with Claude Vision
      logger.info({ url, imageCount: extractedData.imageUrls.length }, 'Analyzing Amazon product images with Claude Vision');

      const imageContent: any[] = extractedData.imageUrls.slice(0, 3).map(imageUrl => ({
        type: 'image',
        source: {
          type: 'url',
          url: imageUrl,
        },
      }));

      const response = await this.claudeClient.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              ...(imageContent as any[]),
              {
                type: 'text',
                text: `これはAmazonの商品ページの画像です。以下の情報を分析して、説得力のある商品説明を日本語で生成してください：

画像から認識できる：
- 製品の外観、色、デザイン
- 使用シーン
- 製品の機能や特徴
- 品質感

${extractedData.textInfo ? `参考情報：\n${extractedData.textInfo}` : ''}

以下の形式で出力してください：
【商品特徴】
- 特徴1
- 特徴2
- 特徴3

【商品説明】
画像から見られる製品の特徴、品質、使用感などを自然な日本語で150-200字で説明してください。`,
              } as any,
            ] as any,
          },
        ],
      });

      const visionText = response.content[0].type === 'text' ? response.content[0].text : '';
      logger.info({ url, textLength: visionText.length }, '✓ Amazon product images analyzed with Claude Vision');
      return visionText;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
      logger.error({ url, errorMsg }, 'Failed to extract Amazon LP text');
      throw new Error(`Failed to extract Amazon LP text: ${errorMsg}`);
    } finally {
      if (shouldClosePage) {
        await page.close();
      }
    }
  }

  /**
   * Analyze Amazon product page design using Vision API
   * Extracts design information: sections, colors, layout, typography
   */
  async analyzeAmazonDesign(url: string): Promise<DesignAnalysis> {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    let page;
    let shouldClosePage = false;
    try {
      const contexts = this.browser?.contexts();
      if (contexts && contexts.length > 0) {
        const pages = contexts[0].pages();
        if (pages && pages.length > 0) {
          page = pages[0];
          shouldClosePage = false;
        } else {
          page = await contexts[0].newPage();
          shouldClosePage = true;
        }
      } else {
        page = await this.browser!.newPage();
        shouldClosePage = true;
      }
    } catch (e) {
      page = await this.browser!.newPage();
      shouldClosePage = true;
    }

    try {
      logger.info({ url }, 'Analyzing Amazon product page design');

      // Use aggressive timeout settings to avoid hung states
      await Promise.race([
        page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Page load timeout')), 25000))
      ]).catch(() => {
        // Timeout is acceptable - page might be loaded enough
      });

      // Short wait for basic page rendering
      await page.waitForTimeout(1000);

      // Detect category from URL or page content
      const category = this.detectProductCategory(url);

      // Get page content for analysis (skip problematic screenshot)
      let screenshotBase64: string | null = null;
      try {
        logger.info({ url }, 'Attempting screenshot capture...');
        const screenshotBuffer = await Promise.race([
          page.screenshot({ fullPage: false, type: 'jpeg' }),
          new Promise<Buffer>((_, reject) =>
            setTimeout(() => reject(new Error('Screenshot timeout')), 15000)
          )
        ]);
        screenshotBase64 = screenshotBuffer.toString('base64');
      } catch (e) {
        logger.warn({ url, error: String(e) }, 'Screenshot capture failed, proceeding with text analysis only');
      }

      // If screenshot failed, use a fallback approach
      const base64Screenshot = screenshotBase64 || '';
      const base64Screenshot2 = screenshotBase64 || '';

      // Extract text content for reference
      const textData = await page.evaluate(() => {
        const titleEl = document.querySelector('span[id="productTitle"]');
        const title = titleEl instanceof HTMLElement ? titleEl.innerText?.trim() || '' : '';

        const featuresEl = document.querySelector('#feature-bullets');
        const features = featuresEl
          ? Array.from(featuresEl.querySelectorAll('li'))
              .slice(0, 5)
              .map(li => (li instanceof HTMLElement ? li.innerText?.trim() || '' : ''))
              .filter(f => f)
          : [];

        const descEl = document.querySelector('[data-a-dynamic-attribute="description"]') ||
                      document.querySelector('.feature-bullets-btf-message-block');
        const description = descEl instanceof HTMLElement ? descEl.innerText?.trim().substring(0, 300) || '' : '';

        return { title, features, description };
      });

      logger.info({ url, category }, 'Extracted Amazon page text data');

      // Build Vision API content array
      const visionContent: any[] = [];

      // Add images only if we have them
      if (base64Screenshot) {
        visionContent.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: base64Screenshot,
          },
        });
      }

      if (base64Screenshot2) {
        visionContent.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: base64Screenshot2,
          },
        });
      }

      // Add text prompt
      const promptText = base64Screenshot
        ? 'このAmazonの商品ページのデザインを詳細に分析してください。'
        : `このAmazonの商品ページの情報から、推定されるデザイン構成を分析してください。以下の情報があります：
- 商品名: ${textData.title}
- 特徴: ${textData.features.join(', ')}
`;

      visionContent.push({
        type: 'text',
        text: promptText + `

以下の形式でJSON を返してください：

{
  "sections": [
    {"name": "Hero/Header", "order": 1, "backgroundColor": "#ffffff", "height": "tall", "contentType": "image"},
    {"name": "Product Gallery", "order": 2, "backgroundColor": "#f9f9f9", "height": "medium", "contentType": "image"},
    {"name": "Features/Bullets", "order": 3, "backgroundColor": "#ffffff", "height": "medium", "contentType": "text"},
    {"name": "Specifications", "order": 4, "backgroundColor": "#f9f9f9", "height": "short", "contentType": "text"},
    {"name": "CTA/Reviews", "order": 5, "backgroundColor": "#ffffff", "height": "medium", "contentType": "mixed"}
  ],
  "colors": {
    "primary": ["#FF9900", "#146EB4"],
    "secondary": ["#37475A", "#146EB4"],
    "background": ["#FFFFFF", "#F9F9F9"],
    "text": ["#0F1419", "#565959"]
  },
  "layout": {
    "type": "grid",
    "alignment": "center",
    "spacing": "normal"
  },
  "typography": {
    "heading": {
      "size": "24px-32px",
      "weight": "bold",
      "fontFamily": "Amazon Ember, Arial, sans-serif"
    },
    "body": {
      "size": "14px-16px",
      "weight": "normal",
      "fontFamily": "Amazon Ember, Arial, sans-serif",
      "lineHeight": "1.5"
    },
    "cta": {
      "size": "16px",
      "weight": "bold",
      "style": "button"
    }
  },
  "imagery": {
    "style": "product-showcase",
    "imageCount": 6,
    "aspectRatio": "square"
  }
}`,
      });


      // Add closing text to vision content
      const closingPrompt = `

分析のポイント：
- ページ上部から下部へのセクション構成を把握
- 各セクションの背景色を識別
- 主要な色（プライマリ、セカンダリ、背景、テキスト）を抽出
- レイアウトの種類（グリッド、フレックス、スタックなど）を判定
- タイポグラフィの大きさ、太さ、フォントを推定
- 画像の使用パターン（ギャラリー、カルーセル、プロダクトショーケースなど）を分類`;

      // Update last content item to include closing prompt
      const lastContent = visionContent[visionContent.length - 1];
      if (lastContent.type === 'text') {
        lastContent.text += closingPrompt;
      } else {
        visionContent.push({ type: 'text', text: closingPrompt });
      }

      // Make Vision API call with prepared content
      const designAnalysisResponse = await this.claudeClient.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: visionContent as any,
          },
        ],
      });

      const analysisText =
        designAnalysisResponse.content[0].type === 'text' ? designAnalysisResponse.content[0].text : '{}';

      logger.info({ url, analysisLength: analysisText.length }, 'Received design analysis from Claude Vision');

      // Parse JSON response
      let designData = this.parseDesignAnalysis(analysisText);

      // Build DesignAnalysis result
      const result: DesignAnalysis = {
        url,
        category,
        textAnalysis: {
          title: textData.title,
          features: textData.features,
          description: textData.description,
        },
        designAnalysis: {
          sections: designData.sections || [],
          colors: designData.colors || {
            primary: ['#FF9900'],
            secondary: ['#146EB4'],
            background: ['#FFFFFF', '#F9F9F9'],
            text: ['#0F1419'],
          },
          layout: designData.layout || {
            type: 'grid',
            alignment: 'center',
            spacing: 'normal',
          },
          typography: designData.typography || {
            heading: {
              size: '24px',
              weight: 'bold',
              fontFamily: 'Amazon Ember, Arial, sans-serif',
            },
            body: {
              size: '14px',
              weight: 'normal',
              fontFamily: 'Amazon Ember, Arial, sans-serif',
              lineHeight: '1.5',
            },
            cta: {
              size: '16px',
              weight: 'bold',
              style: 'button',
            },
          },
          imagery: designData.imagery || {
            style: 'product-showcase',
            imageCount: 5,
            aspectRatio: 'square',
          },
        },
        timestamp: new Date(),
      };

      logger.info(
        { url, category, sections: result.designAnalysis.sections.length },
        '✓ Amazon page design analyzed successfully'
      );

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
      logger.error({ url, errorMsg }, 'Failed to analyze Amazon page design');
      throw new Error(`Failed to analyze Amazon design: ${errorMsg}`);
    } finally {
      if (shouldClosePage) {
        await page.close();
      }
    }
  }

  /**
   * Detect product category from URL or page content
   */
  private detectProductCategory(url: string): string {
    if (url.includes('/dp/B0DLJP1FMD') || url.includes('NILE') || url.includes('シャンプー')) {
      return 'beauty';
    }
    if (url.includes('/dp/B08JLRNR6K') || url.includes('Goreson') || url.includes('工具')) {
      return 'tools';
    }
    if (url.includes('/dp/B072HG7HNG') || url.includes('IKSTAR') || url.includes('椅子')) {
      return 'furniture';
    }
    return 'other';
  }

  /**
   * Parse design analysis JSON response from Claude Vision
   */
  private parseDesignAnalysis(responseText: string): Partial<DesignAnalysis['designAnalysis']> {
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        logger.warn('No JSON found in design analysis response');
        return {};
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        sections: parsed.sections || [],
        colors: parsed.colors || {},
        layout: parsed.layout || {},
        typography: parsed.typography || {},
        imagery: parsed.imagery || {},
      };
    } catch (error) {
      logger.warn({ error, responseText: responseText.substring(0, 200) }, 'Failed to parse design analysis');
      return {};
    }
  }
}

/**
 * Detect site type from URL
 */
function detectSiteType(url: string): 'amazon' | 'alibaba_1688' | 'generic' {
  if (url.includes('amazon.com') || url.includes('amazon.co.jp')) {
    return 'amazon';
  }
  if (url.includes('1688.com') || url.includes('alibaba.com')) {
    return 'alibaba_1688';
  }
  return 'generic';
}

/**
 * Normalize image URL (make absolute)
 */
function normalizeUrl(url: string, baseUrl?: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  if (url.startsWith('//')) {
    return 'https:' + url;
  }

  if (baseUrl) {
    try {
      return new URL(url, baseUrl).toString();
    } catch (e) {
      return url;
    }
  }

  return url;
}
