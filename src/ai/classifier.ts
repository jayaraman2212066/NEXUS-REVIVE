let pipeline: any = null;

async function getClassifier() {
  if (!pipeline) {
    const { pipeline: createPipeline } = await import("@xenova/transformers");
    pipeline = await createPipeline("text-classification", "Xenova/distilbert-base-uncased-finetuned-sst-2-english", {
      cache_dir: process.env.AI_MODELS_PATH || "./storage/ai-models",
    });
  }
  return pipeline;
}

export async function classifyDocument(text: string): Promise<string> {
  try {
    if (!text || text.trim().length < 20) return "unknown";
    const snippet = text.substring(0, 512);
    const classifier = await getClassifier();
    const result = await classifier(snippet);
    return result?.[0]?.label?.toLowerCase() || "unknown";
  } catch {
    return "unknown";
  }
}
