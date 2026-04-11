/**
 * Test Script: Amazon Design Analysis (Phase 1)
 * Analyzes 3 product pages: Beauty, Tools, Furniture
 */

import dotenv from 'dotenv';
import { ScraperService } from './src/services/scraper.service';
import pino from 'pino';

// Load environment variables
dotenv.config({ path: '.env.local' });

const logger = pino();

interface TestResult {
  url: string;
  category: string;
  status: 'success' | 'error';
  analysis?: any;
  error?: string;
}

async function runTests() {
  const testUrls = [
    {
      name: 'コスメ・ビューティー',
      url: 'https://www.amazon.co.jp/NILE-%E6%BF%83%E5%AF%86%E6%B3%A1%E3%82%B9%E3%82%AB%E3%83%AB%E3%83%97%E3%82%B7%E3%83%A3%E3%83%B3%E3%83%97%E3%83%BC/dp/B0DLJP1FMD',
    },
    {
      name: '雑貨・工具',
      url: 'https://www.amazon.co.jp/Goreson-%E3%83%97%E3%83%A9%E3%83%A2%E3%83%87%E3%83%AB%E7%94%A8%E5%B7%A5%E5%85%B7/dp/B08JLRNR6K',
    },
    {
      name: '家具',
      url: 'https://www.amazon.co.jp/IKSTAR-%E7%AC%AC%E5%9B%9B%E4%B8%96%E4%BB%A3-%E3%83%98%E3%83%AB%E3%82%B9%E3%82%B1%E3%82%A2%E5%BA%A7%E5%B8%83%E5%9B%A3/dp/B072HG7HNG',
    },
  ];

  // Verify API key
  if (!process.env.CLAUDE_API_KEY) {
    logger.error('❌ CLAUDE_API_KEY not set! Please set it before running tests.');
    logger.info('Example: export CLAUDE_API_KEY="sk-..."');
    process.exit(1);
  }

  logger.info(`✓ CLAUDE_API_KEY is set (${process.env.CLAUDE_API_KEY.substring(0, 10)}...)`);
  logger.info(`\n🚀 Starting Amazon Design Analysis Tests\n`);

  // Initialize scraper
  const scraper = new ScraperService();
  await scraper.initialize();

  const results: TestResult[] = [];

  // Analyze each URL
  for (const test of testUrls) {
    logger.info(`\n📊 Analyzing: ${test.name}`);
    logger.info(`URL: ${test.url}`);

    try {
      const analysis = await scraper.analyzeAmazonDesign(test.url);

      results.push({
        url: test.url,
        category: analysis.category,
        status: 'success',
        analysis: {
          title: analysis.textAnalysis.title,
          category: analysis.category,
          sections: analysis.designAnalysis.sections.map((s) => ({
            name: s.name,
            order: s.order,
            contentType: s.contentType,
          })),
          colors: {
            primary: analysis.designAnalysis.colors.primary,
            secondary: analysis.designAnalysis.colors.secondary,
          },
          layout: analysis.designAnalysis.layout,
          typography: {
            heading: analysis.designAnalysis.typography.heading,
            cta: analysis.designAnalysis.typography.cta,
          },
          imagery: analysis.designAnalysis.imagery,
        },
      });

      logger.info(`✅ Analysis successful!`);
      logger.info(`   Category: ${analysis.category}`);
      logger.info(`   Sections: ${analysis.designAnalysis.sections.length}`);
      logger.info(`   Colors: ${analysis.designAnalysis.colors.primary.length} primary, ${analysis.designAnalysis.colors.secondary.length} secondary`);
      logger.info(`   Layout: ${analysis.designAnalysis.layout.type} (${analysis.designAnalysis.layout.alignment})`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
      logger.error(`❌ Analysis failed: ${errorMsg}`);

      results.push({
        url: test.url,
        category: 'error',
        status: 'error',
        error: errorMsg,
      });
    }
  }

  // Cleanup
  await scraper.cleanup();

  // Summary
  logger.info(`\n\n📋 TEST SUMMARY\n`);
  logger.info(`Total: ${results.length} | Success: ${results.filter((r) => r.status === 'success').length} | Failed: ${results.filter((r) => r.status === 'error').length}`);

  // Save results to file
  const fs = await import('fs').then((m) => m.promises);
  await fs.writeFile(
    './design-analysis-results.json',
    JSON.stringify(results, null, 2)
  );

  logger.info(`\n✅ Results saved to: design-analysis-results.json`);

  // Exit with success if all passed
  process.exit(results.some((r) => r.status === 'error') ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  logger.error({ error }, 'Test execution failed');
  process.exit(1);
});
