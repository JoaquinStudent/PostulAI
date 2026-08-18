"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleToggle } from "@/components/locale-toggle";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { SessionBar } from "@/components/session-bar";
import { useSession } from "@/stores/session";
import {
  getAnalysisModels,
  getGenerationModels,
  RECOMMENDED_COMBOS,
} from "@/lib/ai/models";
import { clearAll as clearStorage } from "@/lib/storage";
import type { StorageMode } from "@/lib/types";
import { Zap, PenTool } from "lucide-react";

export default function AjustesPage() {
  const router = useRouter();
  const {
    context,
    connection,
    disconnect,
    setPreset,
    setStorageMode,
    clearAll,
  } = useSession();
  const [section, setSection] = useState<"provider" | "context" | "privacy">(
    "provider",
  );

  const handleClearAll = async () => {
    await clearStorage();
    sessionStorage.clear();
    clearAll();
    router.push("/");
  };

  const t = useT();

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 md:px-10 h-14 glass border-b border-rule/30">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="PostulAI" className="h-10" />
        </Link>
        <div className="flex items-center gap-4">
          {connection.credit && (
            <span className="font-mono text-xs text-ink-muted">
              {t("Créditos restantes")}: {connection.credit.remaining.toFixed(2)}
            </span>
          )}
          <LocaleToggle />
          <ThemeToggle />
        </div>
      </header>
      <SessionBar />

      <main className="flex-1 flex justify-center px-6 py-12">
        <div className="w-full max-w-[1100px] flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <nav className="md:w-56 shrink-0">
            <h1 className="font-display text-2xl font-bold mb-6">{t("Ajustes")}</h1>
            {(
              [
                ["provider", t("Proveedor de IA")],
                ["context", t("Tu contexto")],
                ["privacy", t("Privacidad")],
              ] as ["provider" | "context" | "privacy", string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSection(key)}
                className={`block w-full text-left px-4 py-2.5 text-sm rounded transition-colors ${
                  section === key
                    ? "bg-stamp text-white font-medium"
                    : "text-ink hover:bg-paper"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {section === "provider" && (
              <ProviderSection
                connection={connection}
                onDisconnect={disconnect}
              />
            )}
            {section === "context" && (
              <ContextSection context={context} />
            )}
            {section === "privacy" && (
              <PrivacySection
                storageMode={connection.storageMode}
                onStorageModeChange={setStorageMode}
                onClearAll={handleClearAll}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ProviderSection({
  connection,
  onDisconnect,
}: {
  connection: import("@/lib/types").AiConnection;
  onDisconnect: () => void;
}) {
  const { setModels } = useSession();

  const handleModelChange = (role: "economy" | "balanced", modelId: string) => {
    setModels({
      ...connection.models,
      [role]: modelId,
      ...(role === "balanced" ? { quality: modelId } : {}),
    });
  };

  const handleCombo = (combo: typeof RECOMMENDED_COMBOS[number]) => {
    setModels({
      economy: combo.analysis,
      balanced: combo.generation,
      quality: combo.generation,
    });
  };

  const analysisModels = getAnalysisModels().filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i);
  const generationModels = getGenerationModels().filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i);

  const t = useT();

  return (
    <>
      <h2 className="font-display text-xl font-semibold">{t("Proveedor de IA")}</h2>

      <div className="mt-6 flex items-center gap-3 flex-wrap">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
          API Key
        </span>
        <span className="font-mono text-sm">{connection.keyMasked || "—"}</span>
        {connection.status === "connected" && (
          <Badge className="bg-confirm/10 text-confirm border-0">
            {t("Conectada")}
          </Badge>
        )}
        {connection.status === "connected" && (
          <div className="flex gap-4 ml-auto">
            <Link
              href="/conectar"
              className="text-sm underline text-ink hover:text-stamp"
            >
              {t("Reemplazar")}
            </Link>
            <button
              onClick={onDisconnect}
              className="text-sm underline text-alert hover:text-alert/80"
            >
              {t("Desconectar")}
            </button>
          </div>
        )}
      </div>

      {connection.credit && (
        <div className="mt-6 pt-6 border-t border-rule">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
            {t("Créditos restantes")}
          </span>
          <p className="font-display text-4xl font-bold mt-1">
            {connection.credit.remaining.toFixed(0)}
          </p>
          <div className="mt-2 h-1 bg-rule/30 rounded overflow-hidden max-w-xs">
            <div
              className="h-full bg-stamp rounded"
              style={{
                width: connection.credit.limit
                  ? `${Math.min(
                      (connection.credit.remaining / connection.credit.limit) * 100,
                      100,
                    )}%`
                  : "100%",
              }}
            />
          </div>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-rule space-y-5">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
          {t("Combinaciones recomendadas")}
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {RECOMMENDED_COMBOS.map((combo) => {
            const isActive =
              connection.models.economy === combo.analysis &&
              connection.models.balanced === combo.generation;
            return (
              <button
                key={combo.name}
                onClick={() => handleCombo(combo)}
                className={`p-4 rounded-xl border-2 text-left transition-all active:scale-[0.98] ${
                  isActive ? "border-stamp bg-stamp/5" : "border-rule/40 hover:border-rule"
                }`}
              >
                <p className={`text-sm font-bold ${isActive ? "text-stamp" : ""}`}>{combo.name}</p>
                <p className="text-[11px] text-ink-muted mt-1">{combo.costEstimate}/postulación</p>
              </button>
            );
          })}
        </div>

        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted block pt-2">
          {t("O elige por separado")}
        </span>

        <div className="bg-surface border border-rule/40 rounded-xl p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <Zap className="size-4 text-confirm" />
            <div>
              <p className="text-sm font-medium">{t("Modelo de análisis")}</p>
              <p className="text-[11px] text-ink-muted">{t("Extracción, encaje, gaps")}</p>
            </div>
          </div>
          <select
            value={connection.models.economy}
            onChange={(e) => handleModelChange("economy", e.target.value)}
            className="w-full px-3 py-2.5 bg-paper border border-rule/40 rounded-lg text-sm appearance-none cursor-pointer"
          >
            {analysisModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} ({m.provider}) — {m.inputPrice} input
              </option>
            ))}
          </select>
        </div>

        <div className="bg-surface border border-rule/40 rounded-xl p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <PenTool className="size-4 text-stamp" />
            <div>
              <p className="text-sm font-medium">{t("Modelo de redacción")}</p>
              <p className="text-[11px] text-ink-muted">{t("Generación y refinamiento")}</p>
            </div>
          </div>
          <select
            value={connection.models.balanced}
            onChange={(e) => handleModelChange("balanced", e.target.value)}
            className="w-full px-3 py-2.5 bg-paper border border-rule/40 rounded-lg text-sm appearance-none cursor-pointer"
          >
            {generationModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} ({m.provider}) — {m.inputPrice} input
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}

function ContextSection({
  context,
}: {
  context: import("@/lib/types").UserContext | null;
}) {
  const t = useT();
  return (
    <>
      <h2 className="font-display text-xl font-semibold">{t("Tu contexto")}</h2>
      {context ? (
        <div className="mt-6 bg-surface border border-rule rounded p-5">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-medium">
              {context.fileName}
            </span>
            <span className="font-mono text-xs text-ink-muted">
              {(context.sizeBytes / 1024).toFixed(0)} KB
            </span>
          </div>
          <p className="mt-2 text-sm text-ink-muted">
            Cargado en esta sesión. Se pierde al cerrar la pestaña.
          </p>
          <Link
            href="/contexto"
            className="inline-block mt-3 text-sm underline text-stamp hover:text-stamp/80"
          >
            Reemplazar contexto
          </Link>
        </div>
      ) : (
        <div className="mt-6 text-sm text-ink-muted">
          No hay contexto cargado.{" "}
          <Link href="/contexto" className="underline text-stamp">
            Adjuntar uno
          </Link>
          .
        </div>
      )}
    </>
  );
}

function PrivacySection({
  storageMode,
  onStorageModeChange,
  onClearAll,
}: {
  storageMode: StorageMode;
  onStorageModeChange: (m: StorageMode) => void;
  onClearAll: () => void;
}) {
  const t = useT();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <h2 className="font-display text-xl font-semibold">{t("Privacidad")}</h2>

      <div className="mt-6 flex items-start gap-4">
        <Switch disabled />
        <div>
          <p className="text-sm font-medium">
            Recordar mi contexto en este dispositivo
          </p>
          <p className="text-sm text-ink-muted">
            Almacena localmente tus preferencias y configuraciones para futuras
            sesiones.
          </p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-rule">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
          Nivel de seguridad de clave
        </span>
        <RadioGroup
          value={storageMode}
          onValueChange={(v) => onStorageModeChange(v as StorageMode)}
          className="mt-3 space-y-3"
        >
          <label className="flex items-center gap-3 cursor-pointer">
            <RadioGroupItem value="memory" />
            <span className="text-sm">
              Almacenar en memoria temporal (se borra al cerrar)
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <RadioGroupItem value="vault" />
            <span className="text-sm">
              Cifrar en almacenamiento local del navegador
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <RadioGroupItem value="session" />
            <span className="text-sm">
              Requerir ingreso manual en cada sesión
            </span>
          </label>
        </RadioGroup>
      </div>

      {/* Danger zone */}
      <div className="mt-8 border border-alert/30 rounded p-6 bg-alert/5">
        <h3 className="font-medium text-alert">{t("Borrar todo")}</h3>
        <p className="mt-2 text-sm text-ink-muted">
          Esto eliminará permanentemente la API Key, tu contexto guardado y
          cerrará la sesión actual de forma inmediata. No se puede deshacer.
        </p>
        {confirmDelete ? (
          <div className="mt-4 flex gap-3">
            <Button variant="destructive" onClick={onClearAll}>
              {t("Confirmar borrado")}
            </Button>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              {t("Cancelar")}
            </Button>
          </div>
        ) : (
          <Button
            variant="destructive"
            className="mt-4"
            onClick={() => setConfirmDelete(true)}
          >
            {t("Borrar todos mis datos")}
          </Button>
        )}
      </div>
    </>
  );
}
