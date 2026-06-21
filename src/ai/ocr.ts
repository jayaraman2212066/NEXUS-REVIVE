import { createWorker } from "tesseract.js";

export async function extractTextFromImage(buffer: Buffer, lang = "eng"): Promise<string> {
  const worker = await createWorker(lang, 1, {
    cachePath: process.env.AI_MODELS_PATH || "./storage/ai-models",
    logger: () => {},
  });

  try {
    const { data } = await worker.recognize(buffer);
    return data.text || "";
  } finally {
    await worker.terminate();
  }
}
