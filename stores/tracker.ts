import { create } from "zustand";

export type TrackerStage =
  | "investigando"
  | "analizando"
  | "postulando"
  | "enviada"
  | "entrevista"
  | "resultado";

export const TRACKER_STAGES: TrackerStage[] = [
  "investigando",
  "analizando",
  "postulando",
  "enviada",
  "entrevista",
  "resultado",
];

export interface TrackedItem {
  opportunityId: string;
  title: string;
  organizer: string | null;
  score: number;
  deadline: string | null;
  stage: TrackerStage;
  updatedAt: number;
  notes: string;
}

interface TrackerState {
  items: TrackedItem[];
  add: (item: Omit<TrackedItem, "stage" | "updatedAt" | "notes">) => void;
  move: (opportunityId: string, stage: TrackerStage) => void;
  updateNotes: (opportunityId: string, notes: string) => void;
  remove: (opportunityId: string) => void;
}

const STORAGE_KEY = "postulai-tracker";

function loadItems(): TrackedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(items: TrackedItem[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ponytail: sessionStorage full, silently fail
  }
}

export const useTracker = create<TrackerState>((set, get) => ({
  items: loadItems(),

  add: (item) => {
    if (get().items.some((i) => i.opportunityId === item.opportunityId)) return;
    const newItem: TrackedItem = {
      ...item,
      stage: "investigando",
      updatedAt: Date.now(),
      notes: "",
    };
    const items = [...get().items, newItem];
    persist(items);
    set({ items });
  },

  move: (opportunityId, stage) => {
    const items = get().items.map((i) =>
      i.opportunityId === opportunityId
        ? { ...i, stage, updatedAt: Date.now() }
        : i,
    );
    persist(items);
    set({ items });
  },

  updateNotes: (opportunityId, notes) => {
    const items = get().items.map((i) =>
      i.opportunityId === opportunityId ? { ...i, notes } : i,
    );
    persist(items);
    set({ items });
  },

  remove: (opportunityId) => {
    const items = get().items.filter((i) => i.opportunityId !== opportunityId);
    persist(items);
    set({ items });
  },
}));
