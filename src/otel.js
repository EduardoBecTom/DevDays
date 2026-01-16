
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import {
    ATTR_SERVICE_NAME,
    ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ConsoleMetricExporter, MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { metrics } from '@opentelemetry/api';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

class SimpleExporter {
    _store = [];

    export(spans, resultCallback) {
        this._store.push(...spans);
        // console.log(`Exported ${spans.length} spans`);
        resultCallback({ code: 0 });
    }

    shutdown() {
        return Promise.resolve();
    }

    getFinishedSpans() {
        return this._store;
    }
}
export const traceExporter = new SimpleExporter();


const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'my-node-service',
    [ATTR_SERVICE_VERSION]: '1.0.0',
});

const tracerProvider = new NodeTracerProvider({
    resource,
    spanProcessors: [
        new SimpleSpanProcessor(new ConsoleSpanExporter()),
        new SimpleSpanProcessor(traceExporter),
    ],
});

tracerProvider.register();

registerInstrumentations({
    instrumentations: [
        new HttpInstrumentation({
            ignoreIncomingRequestHook(req) {
                return req.url?.includes('/telemetry');
            },
        }),
    ],
});

const prometheusExporter = new PrometheusExporter({
    port: 9464,
    endpoint: '/metrics',
}, () => {
    console.log('Prometheus metrics server started on http://localhost:9464/metrics');
    
});

const meterProvider = new MeterProvider({
  resource,
  readers: [
    new PeriodicExportingMetricReader({
      exporter: new ConsoleMetricExporter(),
      exportIntervalMillis: 5000,
    }),
    prometheusExporter
  ],
});

// Registrar globalmente
metrics.setGlobalMeterProvider(meterProvider);

const userMeter = metrics.getMeter('user-controller-meter');
export const userCreationCounter = userMeter.createCounter('user_creation_count', {
    description: 'Counts number of users created',
    unit: "users",
});



const systemMeter = metrics.getMeter('system-monitor');

const ramGauge = systemMeter.createObservableGauge('process_ram_usage', {
    description: 'Memoria RAM utilizada por el proceso de Node.js',
    unit: 'MB',
});

ramGauge.addCallback((result) => {
    const memoryInBytes = process.memoryUsage().heapUsed;
    const memoryInMB = memoryInBytes / 1024 / 1024;
    
    result.observe(memoryInMB);
});

const openMeteoMeter = metrics.getMeter('openmeteo-service');

export const timeHistogram = openMeteoMeter.createHistogram(
    'openmeteo_api_response_time', {
    description: 'Histograma del tiempo de respuesta de la API de OpenMeteo',
    unit: 'ms',
    advice: {
        buckets: [50, 100, 200, 400, 800, 1600, 3200, 6400],
    },
});

const httpMeter = metrics.getMeter('http-client');

const httpTimeHistogram = httpMeter.createHistogram(
    'http_request_duration', {
    description: 'Histograma del tiempo de respuesta HTTP',
    unit: 'ms',
    advice: {
        buckets: [10, 50, 100, 200, 400, 800, 1600, 3200, 6400],
    },
});

export const recordHttpDuration = (durationMs, attributes) => {
    httpTimeHistogram.record(durationMs, attributes);
};