import { ScrapedContent, ExtractedMetadata } from '../types';
export declare class ExtractorService {
    private client;
    constructor();
    /**
     * Analyze scraped content and extract product metadata
     */
    analyzeContent(scrapedContent: ScrapedContent, context?: {
        brand?: string;
        category?: string;
        tone?: 'serious' | 'casual' | 'luxury' | 'playful' | 'technical';
        amazonReferenceText?: string;
    }): Promise<ExtractedMetadata>;
    /**
     * Analyze images with Claude Vision API
     * Note: Currently disabled - requires base64-encoded images
     */
    analyzeImages(imageUrls: string[]): Promise<Array<{
        url: string;
        description: string;
    }>>;
    /**
     * Generate Japanese product description from raw text with tone
     */
    generateDescription(rawText: string, productName: string, maxLength?: number, tone?: string): Promise<string>;
    /**
     * Build extraction prompt with tone awareness
     */
    private buildExtractionPrompt;
    /**
     * Get tone-specific instructions
     */
    private getToneInstructions;
    /**
     * Parse Claude API extraction response
     */
    private parseExtractionResponse;
    /**
     * Fallback extraction without Claude API
     */
    private fallbackExtraction;
}
//# sourceMappingURL=extractor.service.d.ts.map