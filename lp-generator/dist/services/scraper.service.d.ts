import { Page } from 'playwright';
import { ScrapedContent } from '../types';
export declare class ScraperService {
    private browser?;
    private claudeClient;
    constructor();
    initialize(): Promise<void>;
    cleanup(): Promise<void>;
    /**
     * Fetch and merge content from multiple Amazon ASINs
     */
    fetchAmazonProducts(asins: string[]): Promise<ScrapedContent>;
    /**
     * Fetch and scrape page content from URL
     */
    fetchPageContent(url: string, timeout?: number): Promise<ScrapedContent>;
    /**
     * Extract images from page - supports multiple image sources
     */
    private extractImages;
    /**
     * Extract structured product information
     */
    extractProductInfo(page: Page, selectors: {
        title?: string[];
        description?: string[];
        specs?: string[];
    }): Promise<Record<string, any>>;
    /**
     * Extract text content from Amazon URL for reference
     */
    extractAmazonLPText(url: string): Promise<string>;
}
//# sourceMappingURL=scraper.service.d.ts.map