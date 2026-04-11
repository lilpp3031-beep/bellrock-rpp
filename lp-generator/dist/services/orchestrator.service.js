"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestratorService = void 0;
const uuid_1 = require("uuid");
const pino_1 = __importDefault(require("pino"));
const scraper_service_1 = require("./scraper.service");
const extractor_service_1 = require("./extractor.service");
const template_renderer_1 = require("./template-renderer");
const logger = (0, pino_1.default)();
class OrchestratorService {
    constructor() {
        this.jobs = new Map();
        this.jobQueue = [];
        this.isProcessing = false;
        this.maxConcurrentJobs = 1; // Process one job at a time for now
        this.scraperService = new scraper_service_1.ScraperService();
        this.extractorService = new extractor_service_1.ExtractorService();
        this.templateRendererService = new template_renderer_1.TemplateRenderer();
    }
    async initialize() {
        await this.scraperService.initialize();
        logger.info('Orchestrator service initialized');
    }
    async cleanup() {
        await this.scraperService.cleanup();
        logger.info('Orchestrator service cleaned up');
    }
    /**
     * Queue a new LP generation job
     */
    queueJob(url, options) {
        const jobId = (0, uuid_1.v4)();
        const job = {
            id: jobId,
            url: options?.asins ? `amazon-asins:${options.asins.join(',')}` : url,
            status: 'queued',
            progress: 0,
            createdAt: new Date(),
            tone: options?.tone || 'casual',
        };
        // Store additional options for processing
        job.asins = options?.asins;
        job.referenceUrl = options?.referenceUrl;
        this.jobs.set(jobId, job);
        this.jobQueue.push(jobId);
        logger.info({ jobId, url: job.url, asins: options?.asins, referenceUrl: options?.referenceUrl, tone: job.tone }, 'Job queued');
        // Start processing if not already running
        this.processQueue().catch((error) => {
            logger.error({ error, jobId }, 'Error processing queue');
        });
        return job;
    }
    /**
     * Get job status
     */
    getJob(jobId) {
        return this.jobs.get(jobId);
    }
    /**
     * Process the job queue
     */
    async processQueue() {
        if (this.isProcessing || this.jobQueue.length === 0) {
            return;
        }
        this.isProcessing = true;
        while (this.jobQueue.length > 0) {
            const jobId = this.jobQueue.shift();
            if (!jobId)
                break;
            const job = this.jobs.get(jobId);
            if (!job)
                continue;
            try {
                await this.processJob(job);
            }
            catch (error) {
                logger.error({ error, jobId }, 'Failed to process job');
            }
        }
        this.isProcessing = false;
    }
    /**
     * Process a single job through the full pipeline
     */
    async processJob(job) {
        job.status = 'processing';
        job.startedAt = new Date();
        job.progress = 0;
        try {
            // Step 1: Scrape content
            logger.info({ jobId: job.id, url: job.url }, 'Scraping content');
            job.progress = 10;
            let scrapedContent;
            const asins = job.asins;
            let amazonReferenceText;
            if (asins && asins.length > 0) {
                // Fetch Amazon products by ASIN
                scrapedContent = await this.scraperService.fetchAmazonProducts(asins);
            }
            else {
                // Fetch regular URL
                scrapedContent = await this.scraperService.fetchPageContent(job.url);
            }
            // Step 1.5: Extract Amazon reference text if provided
            const referenceUrl = job.referenceUrl;
            if (referenceUrl) {
                logger.info({ jobId: job.id, referenceUrl }, 'Extracting Amazon reference text');
                job.progress = 25;
                try {
                    amazonReferenceText = await this.scraperService.extractAmazonLPText(referenceUrl);
                }
                catch (error) {
                    logger.warn({ jobId: job.id, referenceUrl, error }, 'Failed to extract Amazon reference text, continuing without it');
                }
            }
            // Step 2: Extract metadata
            logger.info({ jobId: job.id }, 'Extracting metadata');
            job.progress = 40;
            const extractedMetadata = await this.extractorService.analyzeContent(scrapedContent, {
                category: 'product',
                tone: job.tone,
                amazonReferenceText,
            });
            // Step 3: Render template
            logger.info({ jobId: job.id }, 'Rendering template');
            job.progress = 70;
            // Map ExtractedMetadata to ProductMetadata
            const productMetadata = {
                name: extractedMetadata.productName,
                description: extractedMetadata.description,
                features: extractedMetadata.features,
                specs: extractedMetadata.specifications,
                images: scrapedContent.images
                    .slice(0, 10)
                    .map((img, idx) => ({
                    id: `img-${idx}`,
                    url: img.url,
                    alt: img.alt || extractedMetadata.productName,
                    width: img.width,
                    height: img.height,
                })),
                sourceUrl: job.url,
                generatedAt: new Date(),
            };
            const htmlContent = this.templateRendererService.renderHTML(productMetadata);
            // Create result
            job.progress = 100;
            job.result = {
                htmlContent,
                cssContent: '', // CSS is embedded in HTML
                metadata: productMetadata,
                images: productMetadata.images,
            };
            job.status = 'completed';
            job.completedAt = new Date();
            logger.info({ jobId: job.id }, 'Job completed successfully');
        }
        catch (error) {
            job.status = 'failed';
            job.error = error instanceof Error ? error.message : String(error);
            job.completedAt = new Date();
            logger.error({ jobId: job.id, error }, 'Job failed');
        }
    }
    /**
     * Get all jobs
     */
    getAllJobs() {
        return Array.from(this.jobs.values());
    }
    /**
     * Get queue length
     */
    getQueueLength() {
        return this.jobQueue.length;
    }
}
exports.OrchestratorService = OrchestratorService;
//# sourceMappingURL=orchestrator.service.js.map