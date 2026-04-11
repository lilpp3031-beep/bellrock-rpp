import { v4 as uuidv4 } from 'uuid';
import pino from 'pino';
import { ScraperService } from './scraper.service';
import { ExtractorService } from './extractor.service';
import { TemplateRenderer } from './template-renderer';
import { GenerationJob, JobStatus, GenerationResult, ScrapedContent, ExtractedMetadata, DesignAnalysis } from '../types';

const logger = pino();

export class OrchestratorService {
  private scraperService: ScraperService;
  private extractorService: ExtractorService;
  private templateRendererService: TemplateRenderer;
  private jobs: Map<string, GenerationJob> = new Map();
  private jobQueue: string[] = [];
  private isProcessing = false;
  private maxConcurrentJobs = 1; // Process one job at a time for now

  constructor() {
    this.scraperService = new ScraperService();
    this.extractorService = new ExtractorService();
    this.templateRendererService = new TemplateRenderer();
  }

  async initialize(): Promise<void> {
    await this.scraperService.initialize();
    logger.info('Orchestrator service initialized');
  }

  async cleanup(): Promise<void> {
    await this.scraperService.cleanup();
    logger.info('Orchestrator service cleaned up');
  }

  /**
   * Queue a new LP generation job
   */
  queueJob(url: string, options?: { asins?: string[]; tone?: string; referenceUrl?: string }): GenerationJob {
    const jobId = uuidv4();
    const job: GenerationJob = {
      id: jobId,
      url: options?.asins ? `amazon-asins:${options.asins.join(',')}` : url,
      status: 'queued',
      progress: 0,
      createdAt: new Date(),
      tone: (options?.tone as any) || 'casual',
    };

    // Store additional options for processing
    (job as any).asins = options?.asins;
    (job as any).referenceUrl = options?.referenceUrl;

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
  getJob(jobId: string): GenerationJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Process the job queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.jobQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.jobQueue.length > 0) {
      const jobId = this.jobQueue.shift();
      if (!jobId) break;

      const job = this.jobs.get(jobId);
      if (!job) continue;

      try {
        await this.processJob(job);
      } catch (error) {
        logger.error({ error, jobId }, 'Failed to process job');
      }
    }

    this.isProcessing = false;
  }

  /**
   * Process a single job through the full pipeline
   */
  private async processJob(job: GenerationJob): Promise<void> {
    job.status = 'processing';
    job.startedAt = new Date();
    job.progress = 0;

    try {
      // Step 1: Scrape content
      logger.info({ jobId: job.id, url: job.url }, 'Scraping content');
      job.progress = 10;

      let scrapedContent: ScrapedContent;
      const asins = (job as any).asins;
      let amazonReferenceText: string | undefined;

      if (asins && asins.length > 0) {
        // Fetch Amazon products by ASIN
        scrapedContent = await this.scraperService.fetchAmazonProducts(asins);
      } else {
        // Fetch regular URL
        scrapedContent = await this.scraperService.fetchPageContent(job.url);
      }

      // Step 1.5: Extract Amazon reference text if provided
      const referenceUrl = (job as any).referenceUrl;
      if (referenceUrl) {
        logger.info({ jobId: job.id, referenceUrl }, 'Extracting Amazon reference text');
        job.progress = 25;
        try {
          amazonReferenceText = await this.scraperService.extractAmazonLPText(referenceUrl);
        } catch (error) {
          logger.warn({ jobId: job.id, referenceUrl, error }, 'Failed to extract Amazon reference text, continuing without it');
        }
      }

      // Step 2: Extract metadata
      logger.info({ jobId: job.id }, 'Extracting metadata');
      job.progress = 40;
      const extractedMetadata = await this.extractorService.analyzeContent(scrapedContent, {
        category: 'product',
        tone: job.tone as any,
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
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : String(error);
      job.completedAt = new Date();

      logger.error({ jobId: job.id, error }, 'Job failed');
    }
  }

  /**
   * Get all jobs
   */
  getAllJobs(): GenerationJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Get queue length
   */
  getQueueLength(): number {
    return this.jobQueue.length;
  }

  /**
   * Analyze Amazon product page design (Phase 1)
   */
  async analyzeAmazonDesign(url: string): Promise<DesignAnalysis> {
    logger.info({ url }, 'Starting Amazon design analysis via orchestrator');
    return await this.scraperService.analyzeAmazonDesign(url);
  }
}
