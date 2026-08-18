import { create } from "zustand";
import type {
  UserContext,
  AiConnection,
  StorageMode,
  ModelPreset,
} from "@/lib/types";

// ponytail: key lives outside the store as a closure ref — never serializable
let _apiKey: string | null = null;

export function getApiKey() {
  return _apiKey;
}

export function setApiKey(key: string | null) {
  _apiKey = key;
}

function maskKey(key: string): string {
  if (key.length <= 8) return "•".repeat(key.length);
  return key.slice(0, 4) + "•".repeat(key.length - 8) + key.slice(-4);
}

const initialConnection: AiConnection = {
  status: "disconnected",
  method: "manual",
  keyMasked: "",
  storageMode: "memory",
  credit: null,
  preset: "balanced",
  models: { economy: "", balanced: "", quality: "" },
};

interface SessionState {
  context: UserContext | null;
  connection: AiConnection;
  hasUnexportedWork: boolean;

  setContext: (ctx: UserContext | null) => void;
  connect: (key: string, credit: AiConnection["credit"]) => void;
  disconnect: () => void;
  setStorageMode: (mode: StorageMode) => void;
  setPreset: (preset: ModelPreset) => void;
  setModels: (models: Record<ModelPreset, string>) => void;
  setHasUnexportedWork: (v: boolean) => void;
  clearAll: () => void;
}

export const useSession = create<SessionState>((set) => ({
  context: null,
  connection: initialConnection,
  hasUnexportedWork: false,

  setContext: (ctx) => set({ context: ctx }),

  connect: (key, credit) => {
    setApiKey(key);
    set((s) => ({
      connection: {
        ...s.connection,
        status: "connected",
        method: "manual",
        keyMasked: maskKey(key),
        credit,
      },
    }));
  },

  disconnect: () => {
    setApiKey(null);
    set((s) => ({
      connection: { ...initialConnection, storageMode: s.connection.storageMode },
    }));
  },

  setStorageMode: (mode) =>
    set((s) => ({ connection: { ...s.connection, storageMode: mode } })),

  setPreset: (preset) =>
    set((s) => ({ connection: { ...s.connection, preset } })),

  setModels: (models) =>
    set((s) => ({ connection: { ...s.connection, models } })),

  setHasUnexportedWork: (v) => set({ hasUnexportedWork: v }),

  clearAll: () => {
    setApiKey(null);
    sessionStorage.clear();
    set({ context: null, connection: initialConnection, hasUnexportedWork: false });
  },
}));
