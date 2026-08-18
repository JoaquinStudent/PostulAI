import type { ModelPreset } from "@/lib/types";

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  promptPrice: number;
  completionPrice: number;
}

// ponytail: curated models that work with OpenRouter /chat/completions
// Each has been verified to NOT be batch-only
export interface CuratedModel {
  id: string;
  label: string;
  provider: string;
  tier: "economy" | "balanced" | "quality";
  role: "analysis" | "generation" | "both";
  inputPrice: string;
  outputPrice: string;
}

export const CURATED_MODELS: CuratedModel[] = [
  // Economy — fast and cheap, for extraction/fit/gaps
  { id: "openai/gpt-4o-mini", label: "GPT-4o Mini", provider: "OpenAI", tier: "economy", role: "both", inputPrice: "$0.15/M", outputPrice: "$0.60/M" },
  { id: "google/gemini-flash-1.5", label: "Gemini 1.5 Flash", provider: "Google", tier: "economy", role: "both", inputPrice: "$0.075/M", outputPrice: "$0.30/M" },
  { id: "meta-llama/llama-3.1-8b-instruct", label: "Llama 3.1 8B", provider: "Meta", tier: "economy", role: "analysis", inputPrice: "$0.06/M", outputPrice: "$0.06/M" },
  { id: "deepseek/deepseek-chat-v3-0324", label: "DeepSeek V3", provider: "DeepSeek", tier: "economy", role: "both", inputPrice: "$0.14/M", outputPrice: "$0.28/M" },
  // Balanced — good quality, reasonable cost, for drafting
  { id: "anthropic/claude-sonnet-4", label: "Claude Sonnet 4", provider: "Anthropic", tier: "balanced", role: "both", inputPrice: "$3/M", outputPrice: "$15/M" },
  { id: "openai/gpt-4o-mini", label: "GPT-4o Mini", provider: "OpenAI", tier: "balanced", role: "analysis", inputPrice: "$0.15/M", outputPrice: "$0.60/M" },
  { id: "meta-llama/llama-3.1-70b-instruct", label: "Llama 3.1 70B", provider: "Meta", tier: "balanced", role: "generation", inputPrice: "$0.59/M", outputPrice: "$0.79/M" },
  // Quality — best results, higher cost
  { id: "anthropic/claude-opus-4", label: "Claude Opus 4", provider: "Anthropic", tier: "quality", role: "generation", inputPrice: "$15/M", outputPrice: "$75/M" },
  { id: "openai/gpt-4o", label: "GPT-4o", provider: "OpenAI", tier: "quality", role: "both", inputPrice: "$2.50/M", outputPrice: "$10/M" },
  { id: "anthropic/claude-sonnet-4", label: "Claude Sonnet 4", provider: "Anthropic", tier: "quality", role: "analysis", inputPrice: "$3/M", outputPrice: "$15/M" },
];

export interface ModelCombo {
  name: string;
  description: string;
  analysis: string;
  generation: string;
  costEstimate: string;
  tier: "economy" | "balanced" | "quality";
}

export const RECOMMENDED_COMBOS: ModelCombo[] = [
  {
    name: "Económico",
    description: "Rápido y barato. Ideal para explorar muchas convocatorias.",
    analysis: "openai/gpt-4o-mini",
    generation: "openai/gpt-4o-mini",
    costEstimate: "~$0.01",
    tier: "economy",
  },
  {
    name: "Equilibrado",
    description: "Análisis rápido + redacción de calidad. La mejor relación costo-resultado.",
    analysis: "openai/gpt-4o-mini",
    generation: "anthropic/claude-sonnet-4",
    costEstimate: "~$0.08",
    tier: "balanced",
  },
  {
    name: "Máxima calidad",
    description: "La mejor redacción posible. Para postulaciones importantes.",
    analysis: "anthropic/claude-sonnet-4",
    generation: "anthropic/claude-opus-4",
    costEstimate: "~$0.25",
    tier: "quality",
  },
];

export function getAnalysisModels(): CuratedModel[] {
  return CURATED_MODELS.filter((m) => m.role === "analysis" || m.role === "both");
}

export function getGenerationModels(): CuratedModel[] {
  return CURATED_MODELS.filter((m) => m.role === "generation" || m.role === "both");
}

// ponytail: models that crash on /chat/completions — checked at runtime as safety net
// ponytail: IDs that don't work on OpenRouter /chat/completions (batch-only or non-existent)
const BLOCKED_IDS = new Set([
  "google/gemini-2.5-flash",
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash-preview-04-17",
  "google/gemini-2.5-pro-preview-03-25",
  "google/gemini-2.0-flash-001",
]);

export function isBlocked(modelId: string): boolean {
  return BLOCKED_IDS.has(modelId);
}

export function safeguardModel(modelId: string): string {
  return isBlocked(modelId) ? "openai/gpt-4o-mini" : modelId;
}

const DEFAULT_MODELS: Record<ModelPreset, string> = {
  economy: "openai/gpt-4o-mini",
  balanced: "anthropic/claude-sonnet-4",
  quality: "anthropic/claude-opus-4",
};

export const PRESET_META: Record<ModelPreset, { label: string; description: string }> = {
  economy: { label: "Económico", description: "Análisis básico y rápido." },
  balanced: { label: "Equilibrado", description: "Balance costo-calidad." },
  quality: { label: "Máxima calidad", description: "Análisis profundo detallado." },
};

export async function fetchAvailableModels(apiKey: string): Promise<ModelInfo[]> {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "",
        "X-Title": "PostulAI",
      },
    });
    if (!res.ok) return [];

    const data = await res.json();
    const models: ModelInfo[] = (data.data as Record<string, unknown>[])
      .filter((m) => {
        const id = m.id as string;
        if (BLOCKED_IDS.has(id)) return false;
        if (id.includes("/auto") || id.includes("openrouter/")) return false;
        return true;
      })
      .map((m) => {
        const id = m.id as string;
        const parts = id.split("/");
        const provider = parts[0] ?? id;
        const pricing = m.pricing as Record<string, string> | undefined;
        return {
          id,
          name: (m.name as string) ?? id,
          provider,
          promptPrice: parseFloat(pricing?.prompt ?? "0") * 1_000_000,
          completionPrice: parseFloat(pricing?.completion ?? "0") * 1_000_000,
        };
      })
      .sort((a, b) => a.promptPrice - b.promptPrice);

    return models;
  } catch {
    return [];
  }
}

export async function fetchModels(apiKey: string): Promise<Record<ModelPreset, string>> {
  return { ...DEFAULT_MODELS };
}

export function formatPrice(perMillion: number): string {
  if (perMillion === 0) return "gratis";
  if (perMillion < 0.01) return "<$0.01/M";
  return `$${perMillion.toFixed(2)}/M`;
}
