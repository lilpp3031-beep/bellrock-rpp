import { GenerationJob } from '../types';
export declare class OrchestratorService {
    private scraperService;
    private extractorService;
    private templateRendererService;
    private jobs;
    private jobQueue;
    private isProcessing;
    private maxConcurrentJobs;
    constructor();
    initialize(): Promise<void>;
    cleanup(): Promise<void>;
    /**
     * Queue a new LP generation job
     */
    queueJob(url: string, options?: {
        asins?: string[];
        tone?: string;
        referenceUrl?: string;
    }): GenerationJob;
    /**
     * Get job status
     */
    getJob(jobId: string): GenerationJob | undefined;
    /**
     * Process the job queue
     */
    private processQueue;
    /**
     * Process a single job through the full pipeline
     */
    private processJob;
    /**
     * Get all jobs
     */
    getAllJobs(): GenerationJob[];
    /**
     * Get queue length
     */
    getQueueLength(): number;
}
//# sourceMappingURL=orchestrator.service.d.ts.map