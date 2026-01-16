import { recordHttpDuration } from '../otel.js';
import performance from 'perf_hooks';

function getRouteTemplate(req) {
  if (req.route && req.route.path) {
    const base = req.baseUrl || '';
    return `${base}${req.route.path}`;
  }
  return 'unmatched';
}

export function httpMetricsMiddleware(req, res, next) {
  const start = performance.performance.now();

  res.on('finish', () => {
    const durationMs = performance.performance.now() - start;
    recordHttpDuration(durationMs, {
      'http.method': req.method,
      'http.route': getRouteTemplate(req),
      'http.status_code': res.statusCode,
    });
  });

  next();
}
