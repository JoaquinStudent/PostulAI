export type StorageMode = "memory" | "session" | "vault";

export interface UserContext {
  raw: string;
  fileName: string;
  sizeBytes: number;
  loadedAt: number;
  summary: ContextSummary | null;
  cvRaw: string | null;
  cvFileName: string | null;
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
  | "no_text_layer"
  | "ai";

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
  category: OpportunityCategory;
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
  keywordMatch?: number | null;
}

export interface FitPoint {
  claim: string;
  evidence: string | null;
  improvement?: string | null;
}

export interface CvRecommendation {
  section: string;
  action: "add" | "modify" | "remove";
  current: string | null;
  suggested: string;
  reason: string;
}

export interface ProjectIdea {
  name: string;
  demonstrates: string;
  description: string;
  stack: string;
  hours: string;
  ods: string;
}

export interface ProfileCoach {
  certifications: string[];
  skills: string[];
  experiences: string[];
  cvChanges: CvRecommendation[];
  idealCvOutline: string;
  portfolioProjects: ProjectIdea[];
  elevatorPitch: string;
  interviewTips: string[];
}

export interface EffortEstimate {
  questionCount: number | null;
  approxWords: number | null;
  note: string | null;
}

export type SortBy = "fit" | "deadline" | "effort";

// Sprint 3 — Drafting

export type LimitUnit = "characters" | "words";

export interface Question {
  id: string;
  index: number;
  text: string;
  limit: { value: number; unit: LimitUnit; detected: boolean } | null;
  raw: string;
}

export type AnswerStatus =
  | "empty"
  | "generating"
  | "draft"
  | "over_limit"
  | "approved";

export interface Answer {
  questionId: string;
  text: string;
  status: AnswerStatus;
  charCount: number;
  wordCount: number;
  withinLimit: boolean;
  evidence: Evidence[];
  gaps: Gap[];
  history: string[];
  generatedAt: number | null;
}

export interface Evidence {
  ref: number;
  origin: "user_context" | "opportunity";
  section: string;
  quote: string;
  supportsCriterion: string | null;
}

export interface Gap {
  id: string;
  description: string;
  placeholder: string;
  improvement?: string | null;
  resolved: boolean;
  userInput: string | null;
}

export type ExportFormat = "markdown" | "text" | "json" | "clipboard";

export type OpportunityCategory =
  | "hackathon"
  | "beca"
  | "aceleradora"
  | "evento"
  | "voluntariado"
  | "empleo"
  | "otro";

export interface AnswerScore {
  keywords: number;
  impact: number;
  narrative: number;
}
