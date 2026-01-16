//import { generateText } from '../services/openai.service.js' ; // or '../services/ollama.service.js' if we want to try Ollama
import weatherService from "../services/weather.service.js";
import { textToSpeech } from '../services/openai.service.js';
import fs from 'fs/promises';
import path from 'path';
import { generateText, generateUml } from '../services/openai.service.js';

export const generateAIResponse = async (req, res) => {
    try {
        const { prompt } = req.body;

        const aiResponse = await generateText(prompt);
        res.status(200).json({ response: aiResponse });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const generateUMLDiagram = async (req, res) => {
    try {
        const { umlText } = req.body;

        const umlJson = await generateUml(umlText);
        res.status(200).json({ uml: umlJson });
    } catch (error) {
        console.error("generateUMLDiagram error:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}



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
