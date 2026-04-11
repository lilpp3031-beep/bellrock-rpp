import express, { Express } from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import pino from 'pino';
import { OrchestratorService } from './services/orchestrator.service';
import { GenerateLPRequest, GenerateLPResponse, JobStatusResponse } from './types';

// Initialize environment variables
dotenv.config();

// Create logger
const logger = pino(
  process.env.NODE_ENV === 'production'
    ? undefined
    : { transport: { target: 'pino-pretty' } }
);

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || 3001;

// Initialize Orchestrator Service
const orchestrator = new OrchestratorService();

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.post('/api/lp/generate', (req, res) => {
  try {
    const { url, asins, tone, referenceUrl, options } = req.body as GenerateLPRequest;

    if (!url && (!asins || asins.length === 0)) {
      return res.status(400).json({ error: 'Either URL or ASINs are required' });
    }

    // Queue the job with either URL or ASINs, and optional referenceUrl
    const job = orchestrator.queueJob(url || '', { asins, tone, referenceUrl });

    const response: GenerateLPResponse = {
      jobId: job.id,
      status: job.status,
      message: 'Job queued successfully',
    };

    res.status(202).json(response);
  } catch (error) {
    logger.error(error, 'Error queuing LP generation job');
    res.status(500).json({ error: 'Failed to queue job' });
  }
});

app.get('/api/lp/:jobId/status', (req, res) => {
  try {
    const { jobId } = req.params;
    const job = orchestrator.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const response: JobStatusResponse = {
      id: job.id,
      status: job.status,
      progress: job.progress,
      error: job.error,
      result: job.result,
    };

    res.json(response);
  } catch (error) {
    logger.error(error, 'Error fetching job status');
    res.status(500).json({ error: 'Failed to fetch job status' });
  }
});

app.get('/api/lp/:jobId/preview', (req, res) => {
  try {
    const { jobId } = req.params;
    const job = orchestrator.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (!job.result) {
      return res.status(400).json({ error: 'Job not yet completed' });
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(job.result.htmlContent);
  } catch (error) {
    logger.error(error, 'Error fetching job preview');
    res.status(500).json({ error: 'Failed to fetch preview' });
  }
});

app.get('/api/lp/:jobId/download', (req, res) => {
  try {
    const { jobId } = req.params;
    const { format = 'html' } = req.query;
    const job = orchestrator.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (!job.result) {
      return res.status(400).json({ error: 'Job not yet completed' });
    }

    // For now, only support HTML format
    if (format !== 'html') {
      return res.status(400).json({ error: 'Only HTML format is supported for now' });
    }

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="lp-${jobId}.html"`);
    res.send(job.result.htmlContent);
  } catch (error) {
    logger.error(error, 'Error downloading job result');
    res.status(500).json({ error: 'Failed to download result' });
  }
});

// Phase 1: Amazon Design Analysis Endpoint
app.post('/api/design/analyze', async (req, res) => {
  try {
    const { urls } = req.body as { urls: string[] };

    if (!urls || urls.length === 0) {
      return res.status(400).json({ error: 'At least one Amazon URL is required' });
    }

    logger.info({ urlCount: urls.length }, 'Starting Amazon design analysis');

    const analyses = [];
    const errors: { url: string; error: string }[] = [];

    // Analyze each URL
    for (const url of urls) {
      try {
        logger.info({ url }, 'Analyzing Amazon product page');
        const analysis = await orchestrator.analyzeAmazonDesign(url);
        analyses.push(analysis);
        logger.info({ url, category: analysis.category }, '✓ Design analysis completed');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
        logger.error({ url, errorMsg }, 'Failed to analyze URL');
        errors.push({ url, error: errorMsg });
      }
    }

    res.status(200).json({
      success: analyses.length > 0,
      analysisCount: analyses.length,
      analyses,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(error, 'Error in design analysis endpoint');
    res.status(500).json({ error: 'Failed to analyze designs' });
  }
});

// Static files
app.use(express.static('public'));

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err, 'Unhandled error');
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const server = app.listen(PORT, async () => {
  try {
    await orchestrator.initialize();
    logger.info(`LP Generator server running on port ${PORT}`);
  } catch (error) {
    logger.error(error, 'Failed to initialize orchestrator service');
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  try {
    await orchestrator.cleanup();
  } catch (error) {
    logger.error(error, 'Error during orchestrator cleanup');
  }
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  try {
    await orchestrator.cleanup();
  } catch (error) {
    logger.error(error, 'Error during orchestrator cleanup');
  }
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;
