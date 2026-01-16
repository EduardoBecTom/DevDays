import axios from "axios";
import dateUtils from '../utils/date.js';
import { timeHistogram } from "../otel.js";
import performance from 'perf_hooks';

const http = axios.create({ timeout: 25000 });

export const getCoordinates = async (city) => {
  if (!city || typeof city !== "string") {
    throw new Error("city must be a non-empty string");
  }

  const startTime = performance.performance.now();
  const resp = await http.get("https://geocoding-api.open-meteo.com/v1/search", {
    params: { name: city.trim(), count: 1, language: "es", format: "json" },
  });
  const endTime = performance.performance.now();
  
  const durationMs = endTime - startTime;
  timeHistogram.record(durationMs, { service: "openmeteo", endpoint: "geocoding" });

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
}


export const fetchOpenMeteoDaily = async ({
  city,
  start,
  end,
  dailyVars,
  temperatureUnit = "celsius",
}) => {
  if (!Array.isArray(dailyVars) || dailyVars.length === 0) {
    throw new Error("dailyVars must be a non-empty array");
  }
  if (!(start instanceof Date) || Number.isNaN(start.getTime())) {
    throw new Error("start must be a valid Date");
  }
  if (!(end instanceof Date) || Number.isNaN(end.getTime())) {
    throw new Error("end must be a valid Date");
  }

  const location = await getCoordinates(city);

  const startDate = dateUtils.toISODateUTC(start);
  const endDate = dateUtils.toISODateUTC(end);
  
  const startTime = performance.performance.now();
  const resp = await http.get("https://archive-api.open-meteo.com/v1/archive", {
    params: {
      latitude: location.latitude,
      longitude: location.longitude,
      start_date: startDate,
      end_date: endDate,
      timezone: location.timezone,
      daily: dailyVars.join(","),
      temperature_unit: temperatureUnit,
    },
  });

  const endTime = performance.performance.now();
  const durationMs = endTime - startTime;
  timeHistogram.record(durationMs, { service: "openmeteo", endpoint: "archive" });

  return {
    location,
    period: { startDate, endDate },
    units: resp.data?.daily_units,
    daily: resp.data?.daily,
    raw: resp.data,
  };
}


export const fetchLastNDaysDaily = ({ city, days, dailyVars }) => {
  if (!Number.isInteger(days) || days <= 0) throw new Error("days must be a positive integer");

  const todayUTC = new Date();
  const end = dateUtils.addDaysUTC(todayUTC, -1);
  const start = dateUtils.addDaysUTC(end, -(days - 1));

  return fetchOpenMeteoDaily({ city, start, end, dailyVars });
}

export default {
  getCoordinates,
  fetchOpenMeteoDaily,
  fetchLastNDaysDaily,
};
