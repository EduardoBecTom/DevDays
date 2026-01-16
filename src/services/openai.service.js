import OpenAI from 'openai';
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const generateText = async (prompt) => {
  const response = await openai.responses.create({
    model: 'gpt-4o-mini',
    input: prompt,
  });
  return response.output_text;
};



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
