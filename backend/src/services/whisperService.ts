import OpenAI from "openai";
import fs from "fs";
import path from "path";

let openai: OpenAI;
function getOpenAI() {
  if (!openai) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "missing" });
  return openai;
}

export async function transcribeAudio(filePath: string): Promise<string> {
  const fileStream = fs.createReadStream(filePath);
  const ext = path.extname(filePath).toLowerCase();

  const mimeTypes: Record<string, string> = {
    ".webm": "audio/webm",
    ".wav": "audio/wav",
    ".mp3": "audio/mpeg",
    ".mp4": "audio/mp4",
    ".m4a": "audio/mp4",
    ".ogg": "audio/ogg",
    ".flac": "audio/flac",
  };

  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY ni nastavljen v .env");
  const response = await getOpenAI().audio.transcriptions.create({
    file: fileStream,
    model: "whisper-1",
    language: "sl",
    response_format: "text",
  });

  return response as unknown as string;
}
