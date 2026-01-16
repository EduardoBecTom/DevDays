import { Router } from "express";
import { getAllAudits, getAuditById, auditIssues, auditWeatherLast4Weeks} from "../controllers/audit.controller.js";
import { httpMetricsMiddleware } from "../middlewares/prometheus.middleware.js";
const auditRouter = Router();

auditRouter.get('/audits', httpMetricsMiddleware, getAllAudits);
auditRouter.get('/audits/:auditId', httpMetricsMiddleware, getAuditById);
auditRouter.post('/audits/issues', httpMetricsMiddleware, auditIssues);
auditRouter.post('/audits/weather', httpMetricsMiddleware, auditWeatherLast4Weeks);
export { auditRouter };