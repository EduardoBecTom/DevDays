# Tareas entregable nivel 0

## 1. Implementación del put

En primer lugar, en **user.service.js** defino y exporto la función "updateUser", la cuál toma un id y la información del usuario y actualiza nuestra memoria con los datos proporcionados, en nuestro caso el único dato que tiene sentido que sea modificado es el nombre.
``` 
export const updateUser = (id, userData) =>{
    const user = users.find(u => u.id === id);
    if(user){
        user.name = userData.name || user.name;
        return user;
    }
}
```
A continuación, importamos nuestra función "updateUser" en nuestro archivo **user.controller.js**, la cuál utilizaremos en la función que hemos llamado "modifyUser", la cuál tomará el id de los parámetros de la URL y la información del cuerpo de la petición y llamará a nuestra función anteriormente mencionada

```
import { getAllUsers, getUserById, createUser, deleteUser, updateUser } from '../services/user.service.js';

export const modifyUser = (req, res) => {
    try{
        const {id} = req.params;
        const updatedUser = updateUser(id, req.body);
        if(updatedUser){
            res.status(200).json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}
```
Por último, en nuestro archivo **user.routes.js** importamos nuestra función "modifyUser" y añadiremos nuestro endpoint PUT

```
import { addUser, getUser, getUsers, removeUser, modifyUser } from "../controllers/user.controller.js";

userRouter.put('/users/:id', modifyUser);
```
## 2. Modificación del middleware

Para añadir el máximo de 50 caracteres cuando se haga POST a nuestro endpoint, debemos añadir el siguiente fragmento de código a las restricciones de nuestro 'name'

```
.isLength({ max: 50 }).withMessage('Name must be at most 50 characters long')
```
## 3. Añadir fecha de actualización al esquema

Para añadir la fecha de actualización al esquema de nuestras issues, en nuestro archivo **issue.model.js** añadimos el siguiente elemento a nuestro JSON
```
updatedAt: {
        type: Date,
        required: true,
    }
```

## 4. Almacenar la fecha de actualización de los issue

Para almacenar la fecha de actualización, debemos modificar la función "saveIssues" dentro de nuestro archivo **issue.service.js** sustituyendo la constante newIssue por la siguiente:

```
const newIssue = {
                issueId: issueData.id,
                number: issueData.number,
                title: issueData.title,
                body: issueData.body,
                url: issueData.html_url,
                state: issueData.state,
                createdAt: issueData.created_at,
                updatedAt: issueData.updated_at,
            };
```
# Tareas entregable nivel 1

## N1-1 Función recursiva: paginación de datos de la API de GitHub.

Esta función recursiva genérica ha ubicado en el archivo `github.services.js`, en ella se sigue la documentación de github para la cabecera, añadiendo la posibilidad de autenticación para poder tener 5000 peticiones por hora en lugar de 60 si no se está autenticado.

Para almacenar toda la información a través de las distintas llamadas a la función se ha diseñado una memoria local la cual asciende a través de las llamadas.

Para detectar el enlace de la siguiente página, se busca una coincidencia con un enlace entre signos `<` y `>`, y posteriormente `rel="next"`

```
import axios from 'axios';

const headers = {
    'Accept': 'application/vnd.github.v3+json'
};

if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
}

const githubClient = axios.create({
    baseURL: 'https://api.github.com',
    headers: headers
});


export const fetchAllPages = async (url, accumulatedData = []) => {
    try {
        const response = await githubClient.get(url);
        const newData = accumulatedData.concat(response.data);
        const linkHeader = response.headers.link;
        const nextMatch = linkHeader?.match(/<([^>]+)>;\s*rel="next"/);
        const nextUrl = nextMatch ? nextMatch[1] : null;

        if (nextUrl) {
            return await fetchAllPages(nextUrl, newData);
        }

        return newData;

    } catch (error) {
        console.error(`Error consultando GitHub (${url}):`, error.message);
        throw error;
    }
};
```
## N1-2 Creación de métricas personalizadas

Un aspecto importante es la monitorización de los recursos utilizados por nuestros procesos, para monitorizar la cantidad de memoria RAM utilizada por nuestro proceso Node.js, se ha utilizado la función `process.memoryUsage()`, y se ha escogido la variable `heapUsed`, como este valor no va siempre en aumento si no que va variando, se ha creado un instrumento de tipo `Gauge`.
Además se ha almacenado en un Meter distinto para una mayor claridad de los datos posteriormente, ya que no tiene relación con los Meter creados hasta el momento.

```
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
```

## N1-3 Integración de proveedores IA.

Para uilizar ollama en lugar de OpenIA, hemos creado `ollama.service.js`, en el cual se crea una conexión a nuestro servidor local de ollama en el que se encuenta nuestro modelo:

```
import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: 'http://localhost:11434/v1',
    apiKey: 'ollama',
});

export const generateText = async (prompt) => {
    const response = await openai.responses.create({
        model: 'llama3.1:8b',
        input: prompt,
    });
    return response.output_text;
};
```

La apiKey no puede estar vacía, pero se puede poner lo que uno quiera, se ha utilizado un modelo relativamente grande para un portátil ya que ollama es bastante flexible en lo que memoria se refiere, no necesariamente debe caber el modelo en la VRAM de nuestra tarjeta gráfica.

Lo único que hay que hacer para utlizar nuestro modelo local es importar `generateText`de nuestro archivo `ollama.service.js` en lugar de `openai.service.js`

# Propuesta 2 nivel 2
## N2-P2-A Auditoría sobre datos meteorológicos.

En un primer lugar, se decidió almacenar los datos que se consultaban en memoria, pero se descartó esta versión por varias razones:

1. Por claridad del código
2. Fiabilidad de los datos almacenados. Como los datos consultados son recientes, la posibilidad de que se ajusten valores no es baja, si almacenamos los datos cabe la posibilidad de perder precisión, y consutar constantemente los datos para actualizarlos resulta en más inconvenientes que ventajas.

Para trabajar con la API de OpenMeteo hay dos principales inconvenientes en la petición, el primero se debe pasar la logitud, longitud y uso horario de la cuidad en cuestión, para ello se ha utilizado la API `geocoding` que ellos proporcionan. La función que consulta esta api se ha decidido integrar en el archivo `weather.service.js`, ya que solo va a ser utilizada para este propósito.

```
export const getCoordinates = async (city) => {
  if (!city || typeof city !== "string") {
    throw new Error("city must be a non-empty string");
  }

  const resp = await http.get("https://geocoding-api.open-meteo.com/v1/search", {
    params: { name: city.trim(), count: 1, language: "es", format: "json" },
  });

  const r = resp.data?.results?.[0];
  if (!r) throw new Error(`City not found: ${city}`);

  return {
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone || "auto",
    country: r.country,
    admin1: r.admin1,
  };
```

El segundo inconveniente, es el formato de la fecha, mientras que la función `Date` trabaja con las fechas en formato UTC, `OpenMeteo` requiere la fecha en formato ISO, para esta conversión y operaciones con fechas que se usarán más adelante, se ha creado el archivo `date.js` dentro de la carpeta `utils`, el cuál proporciona funciones auxiliares para ello.

Para la llamada a la API y para obtener directamente los datos de los últimos N días, se han desarrollado dos funciones `fetchOpenMeteoDaily` y `fetchLastNDaysDaily` respectivamente en el archivo `weather.service.js`.

Una vez que las herramientas están preparadas, se desarrolló en `audit.services.js` una función que auditará las 4 últimas semanas, se ha tomado 4 como valor arbitrario, ya que en el enunciado no se detalla el número exacto. Esta función llamada `auditWeatherLast4Weeks` comienza con comprobaciones básicas de los parámetros pasados y estableciendo las fechas de inicio y fin que se le pasarán al fetch:

```
export const auditWeatherLast4Weeks = async ({ city, threshold = 18 }) => {
    if (!city || typeof city !== "string") {
        throw new Error("city is required");
    }
    const thr = Number(threshold);
    if (!Number.isFinite(thr)) {
        throw new Error("threshold must be a number");
    }
    const todayUTC = new Date();

    const oneWeekAgo = new Date(Date.UTC(
        todayUTC.getUTCFullYear(),
        todayUTC.getUTCMonth(),
        todayUTC.getUTCDate() - 7
    ));

    const end = dateUtils.endOfWeekSundayUTC(oneWeekAgo); 
    const start = new Date(end.getTime());
    start.setUTCDate(start.getUTCDate() - 27); 

    const meteo = await weatherService.fetchOpenMeteoDaily({
        city,
        start,
        end,
        dailyVars: ["temperature_2m_mean"],
    });
```

Posteriormente, procesa los datos obtenidos, creando las evidencias (la descripción del estado de cada semana observada), y el compliant:

```
    const { startDate, endDate } = meteo.period;
    const times = meteo.daily?.time || [];
    const temps = meteo.daily?.temperature_2m_mean || [];
    if (times.length !== temps.length) {
        throw new Error("Open-Meteo daily data is inconsistent");
    }

    if (times.length !== 28) {
        throw new Error(`Expected 28 days (4 full weeks), got ${times.length}`);
    }
    const evidences = [];
    for (let w = 0; w < 4; w++) {
        const startIdx = w * 7;
        const endIdx = startIdx + 6;

        const weekTemps = temps.slice(startIdx, endIdx + 1);
        const avg = weekTemps.reduce((a, b) => a + b, 0) / 7;

        evidences.push({
            weekIndex: w + 1,
            start: times[startIdx],
            end: times[endIdx],      
            daysUsed: 7,
            avgTemperature: avg,
            aboveThreshold: avg > thr,
        });
    }

    const compliant = evidences.every(e => e.aboveThreshold);
```
Finalmente, almacena los datos en nuestro modelo audit, se utiliza `Date.now` para crear auditorías distintas en producción, lo ideal sería utilizar las fechas de inicio y fin para sobreescribir con la más reciente de la cuidad en concreto:

```
    const auditRecord = {
        auditId: `audit-weather-4weeks-${city.trim().toLowerCase()}-${Date.now()}`,
        createdAt: new Date(),
        compliant,
        metadata: {
            type: "WEATHER_LAST_4_WEEKS_NATURAL_WEEKS_THRESHOLD",
            city,
            threshold: thr,
            period: { startDate, endDate },
            source: "open-meteo",
            dailyVars: ["temperature_2m_mean"],
            rule: "each natural week (Mon–Sun) avgTemperature > threshold",
            generatedAt: dateUtils.toISODateUTC(new Date()),
        },
        evidences,
    };

    return auditRepository.create(auditRecord);
```
## N2-P2-B Audio resumen del tiempo pasado con IA.

Para obtener un audio resumen del tiempo, se ha hecho en dos partes, primero se ha hecho una petición a una función , la cuál se llama `fetchLastNDaysDaily` y se ecuentra en el archivo `weather.service.js`, esta recibe una cuidad, un entero y un array de variables, y llama al fetch que se ha creado para la api de openmeteo para todos los días desde hace N+1 días hasta ayer, devolviendo las variables solicitadas.

Esta función descrita se utiliza para obtener los datos meteorológicos de los últimos 7 días en la función `getLast7DaysWeatherAudio`, que se encuentra en el archivo `ai.controller.js`, esta función va a ser la orquestadora del proceso, y se le pueden pasar por parámetros en el body de la petición la ciudad, el idioma y la voz que queremos que tenga el audio, dentro de las posibilidades del modelo.

```
export const getLast7DaysWeatherAudio = async (req, res) => {
    try {
        const { city, lang = "es", voice = "ash" } = req.body || {};
        if (!city || typeof city !== "string" || city.trim() === "") {
            return res.status(400).json({ message: "Field 'city' is required (string)." });
        }

        const meteo = await weatherService.fetchLastNDaysDaily({
            city,
            days: 7,
            dailyVars: [
                "temperature_2m_mean",
                "precipitation_sum",
                "wind_speed_10m_max",
                "cloud_cover_mean",
                "weather_code",
            ],
        });


        const text = await generateText(`Eres un experto en meteorología, hazme un resumen en español del tiempo en los últimos 7 días, a continuación te paso los datos, resume bastante y se conciso:\n\n${JSON.stringify(meteo)}\n\nSummary:`);

        const audioBuffer = await textToSpeech({
            text,
            voice,
            lang,
            format: "mp3",
        });
        const audioDir = path.join(process.cwd(), 'audio_output');
        await fs.mkdir(audioDir, { recursive: true });

        const filename = `weather-${city.trim()}-${Date.now()}.mp3`;
        const filepath = path.join(audioDir, filename);
        await fs.writeFile(filepath, audioBuffer);

        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="weather-${city.trim()}-${Date.now()}.mp3"`
        );

        return res.status(200).send(audioBuffer);
    } catch (err) {
        console.error("getLast7DaysWeatherAudio error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
```
Como se puede observar, una vez se obtienen los datos de la API, se genera el texto del resumen con `generateText`, para posteriormente obtener el audio con la función `textToSpeech`, ambas importadas del archivo `openai.services.js`.

Por último se devuelve dicho audio y se almacena en local en la carpeta `audio_output` para poder comprobar el resultado con facilidad.

A countinuación se muestra la función `textToSpeech`

```
export const textToSpeech = async ({ text, voice = "ash", format = "mp3" }) => {
  const response = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice,
    format,
    input: text,
  });

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
```
Esta función definida en el controlador se expone en una ruta post
```
aiRouter.post('/ai/weather-audio', getLast7DaysWeatherAudio);
```

## N2-P2-C Instrumenta y mide el tiempo de respuesta de la API de Weather.

Este ejercicio, al tener un solo endpoint desarrollado en N2-P2-A para la auditoría de datos meteorológicos, se han creado dos métricas, `openMeteoMeter`, la cuál va a almacenar el tiempo de respuesta de los fetch tanto a la api `archive` como `geocoding`
y `httpMeter`, la cual va a registrar el tiempo de respuesta de todos las endpoints de mi aplicación a través de un middleware.

```
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
```

La primera métrica se mide de la siguiente forma (se pone como ejemplo geocoding, pero archive es análogo), con performance, que es lo adecuado para este tipo de mediciones:

```
  const startTime = performance.performance.now();
  const resp = await http.get("https://geocoding-api.open-meteo.com/v1/search", {
    params: { name: city.trim(), count: 1, language: "es", format: "json" },
  });
  const endTime = performance.performance.now();
  
  const durationMs = endTime - startTime;
  timeHistogram.record(durationMs, { service: "openmeteo", endpoint: "geocoding" });
  ```
  Para la métrica de HTTP, se ha desarrollado un middleware en `prometheus.middleware.js`, el cuál utiliza una función auxiliar `getRouteTemplate` para parsear la ruta de la petición y pasarla como atributo, y utiliza otra vez performance para medir el tiempo que se tarda en servir la petición:

  ```
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
```

Una vez se tienen estas métricas, se deben almacenar en un backend para poder ser posteriormente consumidas, en este caso se ha escogido `Prometheus` como backend y `Grafana` para la visualización de los datos.

Para que prometheus pueda leer las métricas que hemos desarrollado, necesitamos hacer uso de `PrometheusExporter`, el cuál añadiremos como reader en nuestro meterProvider y le servirá a prometheus las métricas.

```
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
```
Una vez hecho esto, ya no necesitamos tocar más nuestra aplicación, nos dirigimos a grafana, desarrollamos un dashboard para visualizar nuestros datos y lo exportamos. No se explicará aquí como importar el dashboard personalizado que se ha desarrollado.

# RETOS EXTRA
## N2-EX-1 Hacer que la IA devuelva una respuesta estructurada en formato JSON.

Para ello, hacendo uso de structured outputs y de la librería `Zod`, como se recomienda en la documentación de OpenIA, se estructura el posible UML y se le indica al LLM cómo lo tiene que parsear:

```
const ClassEntity = z.object({
  identifier: z.string().describe("Nombre de la clase"),
  properties: z.array(z.string()).describe("Atributos sin símbolos de visibilidad"),
  functions: z.array(z.string()).describe("Métodos sin símbolos de visibilidad")
});

const LinkEntity = z.object({
  source: z.string(),
  target: z.string(),
  type: z.enum(["inheritance", "composition", "aggregation", "association"])
});

const BlueprintSchema = z.object({
  entities: z.array(ClassEntity),
  links: z.array(LinkEntity)
});

export const generateUml = async (prompt) => {
  const response = await openai.responses.parse({
    model: 'gpt-4o-mini',
    input: `Genera un JSON que represente el siguiente diagrama UML: ${prompt}.`,
    text: { format: zodTextFormat(BlueprintSchema, "blueprint_format") },
  });
  
  return response.output_parsed;
};
```
Esto se ha expuesto en el endpoint:
```
aiRouter.post('/ai/uml', httpMetricsMiddleware, generateUMLDiagram);
```
Al cuál hay que pasarle únicamente en el body el parámetro "umlText"