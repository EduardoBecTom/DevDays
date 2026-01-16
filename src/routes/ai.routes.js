import { generateAIResponse } from '../controllers/ai.controller.js';
import { Router } from 'express';
import { getLast7DaysWeatherAudio, generateUMLDiagram } from '../controllers/ai.controller.js';
import { httpMetricsMiddleware } from '../middlewares/prometheus.middleware.js';

const aiRouter = Router();

aiRouter.post('/ai/chat', httpMetricsMiddleware, generateAIResponse);
aiRouter.post('/ai/weather-audio', httpMetricsMiddleware, getLast7DaysWeatherAudio);
aiRouter.post('/ai/uml', httpMetricsMiddleware, generateUMLDiagram);
export { aiRouter };