import { Router } from 'express';
import { traceExporter } from '../otel.js';
import decircular from 'decircular';
import { httpMetricsMiddleware } from '../middlewares/prometheus.middleware.js';

const telemetryRouter = Router();

telemetryRouter.get('/telemetry', httpMetricsMiddleware, (req, res) => {
    res.status(200).send(decircular(traceExporter.getFinishedSpans()));
});

export { telemetryRouter };