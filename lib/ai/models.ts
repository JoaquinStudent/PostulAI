import type { ModelPreset } from "@/lib/types";

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  costPerRequest: string;
}

const DEFAULT_MODELS: Record<ModelPreset, string> = {
  economy: "google/gemini-2.0-flash-001",
  balanced: "anthropic/claude-sonnet-4",
  quality: "anthropic/claude-opus-4",
};

export const PRESET_META: Record<ModelPreset, { label: string; description: string }> = {
  economy: { label: "Económico", description: "Análisis básico y rápido." },
  balanced: { label: "Equilibrado", description: "Balance costo-calidad." },
  quality: { label: "Máxima calidad", description: "Análisis profundo detallado." },
};

export async function fetchModels(apiKey: string): Promise<Record<ModelPreset, string>> {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "",
        "X-Title": "Calco",
      },
    });
    if (!res.ok) return { ...DEFAULT_MODELS };

    const data = await res.json();
    const available = new Set(
      (data.data as { id: string }[]).map((m) => m.id),
    );

    const resolved: Record<ModelPreset, string> = { ...DEFAULT_MODELS };
    for (const [preset, defaultId] of Object.entries(DEFAULT_MODELS) as [ModelPreset, string][]) {
      if (!available.has(defaultId)) {
        // ponytail: fallback — just keep the default, UI will show if unavailable
        resolved[preset] = defaultId;
      }
    }
    return resolved;
  } catch {
    return { ...DEFAULT_MODELS };
  }
}
