/**
 * Construye un resumen textual del tiempo de los últimos 7 días
 * a partir de datos diarios de Open-Meteo.
 */
export const buildWeeklyWeatherSummary = (meteo, { city, lang = "es" }) => {
  const days = meteo?.daily?.time || [];
  const t = meteo?.daily?.temperature_2m_mean || [];
  const p = meteo?.daily?.precipitation_sum || [];
  const w = meteo?.daily?.wind_speed_10m_max || [];
  const c = meteo?.daily?.cloud_cover_mean || [];
  const codes = meteo?.daily?.weather_code || [];

  if (!days.length) {
    throw new Error("No daily weather data to summarize");
  }

  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const min = (arr) => Math.min(...arr);
  const max = (arr) => Math.max(...arr);
  const sum = (arr) => arr.reduce((a, b) => a + b, 0);

  const avgTemp = avg(t);
  const minTemp = min(t);
  const maxTemp = max(t);
  const totalRain = sum(p);
  const maxWind = max(w);
  const avgCloud = avg(c);

  const start = days[0];
  const end = days[days.length - 1];

  const dominantCode = mode(codes);
  const dominantText = weatherCodeToText(dominantCode, lang);

  if (lang === "en") {
    return [
      `Weather summary for ${city} from ${start} to ${end}.`,
      `The average temperature was ${avgTemp.toFixed(1)}°C, ranging from ${minTemp.toFixed(1)}°C to ${maxTemp.toFixed(1)}°C.`,
      `Total precipitation reached ${totalRain.toFixed(1)} millimeters.`,
      `Maximum wind speed was ${maxWind.toFixed(1)} kilometers per hour.`,
      `Average cloud coverage was ${avgCloud.toFixed(0)} percent.`,
      `Dominant conditions were ${dominantText}.`,
    ].join(" ");
  }

  // Español por defecto
  return [
    `Resumen del tiempo en ${city} del ${start} al ${end}.`,
    `La temperatura media fue de ${avgTemp.toFixed(1)} °C, con una mínima de ${minTemp.toFixed(1)} °C y una máxima de ${maxTemp.toFixed(1)} °C.`,
    `La precipitación acumulada fue de ${totalRain.toFixed(1)} mm.`,
    `El viento máximo alcanzó ${maxWind.toFixed(1)} km/h.`,
    `La nubosidad media fue del ${avgCloud.toFixed(0)} %.`,
    `El estado predominante fue ${dominantText}.`,
  ].join(" ");
}

/* =========================
   Helpers internos
   ========================= */

const mode = (arr) => {
  const counts = new Map();
  for (const v of arr) counts.set(v, (counts.get(v) || 0) + 1);
  let best = arr[0], bestN = 0;
  for (const [k, n] of counts.entries()) {
    if (n > bestN) {
      best = k;
      bestN = n;
    }
  }
  return best;
}

const weatherCodeToText = (code, lang) => {
  const es = {
    0: "cielo despejado",
    1: "principalmente despejado",
    2: "parcialmente nublado",
    3: "nublado",
    61: "lluvia ligera",
    63: "lluvia moderada",
    65: "lluvia intensa",
    95: "tormentas",
  };

  const en = {
    0: "clear skies",
    1: "mainly clear conditions",
    2: "partly cloudy skies",
    3: "cloudy skies",
    61: "light rain",
    63: "moderate rain",
    65: "heavy rain",
    95: "thunderstorms",
  };

  const map = lang === "en" ? en : es;
  return map[code] || (lang === "en" ? "mixed conditions" : "condiciones variables");
}
