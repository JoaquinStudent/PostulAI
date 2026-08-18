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

// Sprint 2 — Sources & Batch

export type SourceKind = "url" | "pdf" | "pasted";

export type SourceStatus =
  | "pending"
  | "extracting"
  | "extracted"
  | "analyzing"
  | "ready"
  | "failed";

export type FailureCause =
  | "timeout"
  | "blocked"
  | "not_found"
  | "unsupported"
  | "empty"
  | "network"
  | "no_text_layer";

export interface SourceFailure {
  cause: FailureCause;
  message: string;
  canRetry: boolean;
}

export interface Source {
  id: string;
  kind: SourceKind;
  origin: string;
  status: SourceStatus;
  text: string | null;
  wordCount: number | null;
  failure: SourceFailure | null;
  opportunityId: string | null;
}

// Sprint 2 — Opportunity

export interface Opportunity {
  id: string;
  sourceIds: string[];
  title: string;
  organizer: string | null;
  type: string | null;
  modality: string | null;
  deadline: string | null;
  prize: string | null;
  language: "es" | "en" | "pt" | "other";
  brief: OpportunityBrief;
  fit: FitAssessment;
  effort: EffortEstimate;
  discarded: boolean;
  analyzedAt: number;
}

export interface OpportunityBrief {
  seeking: string;
  criteria: EvaluationCriterion[];
  tone: string[];
  redFlags: string[];
  eligibility: string[];
  confidence: "high" | "medium" | "low";
}

export interface EvaluationCriterion {
  name: string;
  weight: number | null;
  description: string;
}

export interface FitAssessment {
  score: number;
  strengths: FitPoint[];
  gaps: FitPoint[];
  blocking: boolean;
}

export interface FitPoint {
  claim: string;
  evidence: string | null;
}

export interface EffortEstimate {
  questionCount: number | null;
  approxWords: number | null;
  note: string | null;
}

export type SortBy = "fit" | "deadline" | "effort";
