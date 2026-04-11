"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const pino_1 = __importDefault(require("pino"));
const orchestrator_service_1 = require("./services/orchestrator.service");
// Initialize environment variables
dotenv_1.default.config();
// Create logger
const logger = (0, pino_1.default)(process.env.NODE_ENV === 'production'
    ? undefined
    : { transport: { target: 'pino-pretty' } });
// Initialize Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Initialize Orchestrator Service
const orchestrator = new orchestrator_service_1.OrchestratorService();
// Middleware
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN || '*' }));
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API Routes
app.post('/api/lp/generate', (req, res) => {
    try {
        const { url, asins, tone, referenceUrl, options } = req.body;
        if (!url && (!asins || asins.length === 0)) {
            return res.status(400).json({ error: 'Either URL or ASINs are required' });
        }
        // Queue the job with either URL or ASINs, and optional referenceUrl
        const job = orchestrator.queueJob(url || '', { asins, tone, referenceUrl });
        const response = {
            jobId: job.id,
            status: job.status,
            message: 'Job queued successfully',
        };
        res.status(202).json(response);
    }
    catch (error) {
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
        const response = {
            id: job.id,
            status: job.status,
            progress: job.progress,
            error: job.error,
            result: job.result,
        };
        res.json(response);
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
        logger.error(error, 'Error downloading job result');
        res.status(500).json({ error: 'Failed to download result' });
    }
});
// Static files
app.use(express_1.default.static('public'));
// Error handling middleware
app.use((err, req, res, next) => {
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
    }
    catch (error) {
        logger.error(error, 'Failed to initialize orchestrator service');
        process.exit(1);
    }
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    try {
        await orchestrator.cleanup();
    }
    catch (error) {
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
    }
    catch (error) {
        logger.error(error, 'Error during orchestrator cleanup');
    }
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});
exports.default = app;
//# sourceMappingURL=server.js.map