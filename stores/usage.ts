import { create } from "zustand";

export interface UsageEntry {
  prompt: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  timestamp: number;
}

interface UsageState {
  entries: UsageEntry[];
  log: (entry: UsageEntry) => void;
  clear: () => void;
}

// ponytail: cost per token varies by model, rough estimates for economy tier
const COST_TABLE: Record<string, { input: number; output: number }> = {
  "openai/gpt-4o-mini": { input: 0.15e-6, output: 0.6e-6 },
  "google/gemini-2.5-flash": { input: 0.15e-6, output: 0.6e-6 },
  "google/gemini-2.0-flash-001": { input: 0.1e-6, output: 0.4e-6 },
  "anthropic/claude-3.5-haiku": { input: 0.8e-6, output: 4e-6 },
  "anthropic/claude-sonnet-4": { input: 3e-6, output: 15e-6 },
  "openai/gpt-4o": { input: 2.5e-6, output: 10e-6 },
};

export function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const rates = COST_TABLE[model] ?? { input: 0.5e-6, output: 2e-6 };
  return inputTokens * rates.input + outputTokens * rates.output;
}

const STORAGE_KEY = "postulai-usage";

function loadEntries(): UsageEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(entries: UsageEntry[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

export const useUsage = create<UsageState>((set, get) => ({
  entries: loadEntries(),

  log: (entry) => {
    const entries = [...get().entries, entry];
    persist(entries);
    set({ entries });
  },

  clear: () => {
    persist([]);
    set({ entries: [] });
  },
}));
