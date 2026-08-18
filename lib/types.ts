export type StorageMode = "memory" | "session" | "vault";

export interface UserContext {
  raw: string;
  fileName: string;
  sizeBytes: number;
  loadedAt: number;
  summary: ContextSummary | null;
}

export interface ContextSummary {
  profile: string;
  sections: ContextSection[];
  warnings: ContextWarning[];
}

export interface ContextSection {
  key: "profile" | "projects" | "achievements" | "skills";
  label: string;
  itemCount: number;
  preview: string;
}

export type ContextWarningCode =
  | "no_metrics"
  | "too_short"
  | "no_projects"
  | "no_dates";

export interface ContextWarning {
  code: ContextWarningCode;
  message: string;
  suggestion: string;
}

export type ConnectionStatus = "disconnected" | "connected" | "invalid";

export interface AiConnection {
  status: ConnectionStatus;
  method: "oauth" | "manual";
  keyMasked: string;
  storageMode: StorageMode;
  credit: { remaining: number; limit: number | null } | null;
  preset: ModelPreset;
  models: Record<ModelPreset, string>;
}

export type ModelPreset = "economy" | "balanced" | "quality";
