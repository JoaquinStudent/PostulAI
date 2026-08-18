"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { SessionBar } from "@/components/session-bar";
import { useSession } from "@/stores/session";
import { PRESET_META } from "@/lib/ai/models";
import { clearAll as clearStorage } from "@/lib/storage";
import type { ModelPreset, StorageMode } from "@/lib/types";

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

  return (
    <div className="flex flex-col min-h-full">
      <header className="flex items-center justify-between px-6 md:px-10 h-14 bg-surface border-b border-rule">
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          CALCO
        </Link>
        <div className="flex items-center gap-4">
          {connection.credit && (
            <span className="font-mono text-xs text-ink-muted">
              Créditos: {connection.credit.remaining.toFixed(2)}
            </span>
          )}
        </div>
      </header>
      <SessionBar />

      <main className="flex-1 flex justify-center px-6 py-12">
        <div className="w-full max-w-[1100px] flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <nav className="md:w-56 shrink-0">
            <h1 className="font-display text-2xl font-bold mb-6">Ajustes</h1>
            {(
              [
                ["provider", "Proveedor de IA"],
                ["context", "Tu contexto"],
                ["privacy", "Privacidad"],
              ] as const
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
                onPresetChange={setPreset}
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
  onPresetChange,
}: {
  connection: import("@/lib/types").AiConnection;
  onDisconnect: () => void;
  onPresetChange: (p: ModelPreset) => void;
}) {
  return (
    <>
      <h2 className="font-display text-xl font-semibold">Proveedor de IA</h2>

      {/* Key info */}
      <div className="mt-6 flex items-center gap-3 flex-wrap">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
          API Key
        </span>
        <span className="font-mono text-sm">{connection.keyMasked || "—"}</span>
        {connection.status === "connected" && (
          <Badge className="bg-confirm/10 text-confirm border-0">
            Conectada
          </Badge>
        )}
        {connection.status === "connected" && (
          <div className="flex gap-4 ml-auto">
            <Link
              href="/conectar"
              className="text-sm underline text-ink hover:text-stamp"
            >
              Reemplazar
            </Link>
            <button
              onClick={onDisconnect}
              className="text-sm underline text-alert hover:text-alert/80"
            >
              Desconectar
            </button>
          </div>
        )}
      </div>

      {/* Credits */}
      {connection.credit && (
        <div className="mt-6 pt-6 border-t border-rule">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
            Créditos restantes
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

      {/* Presets */}
      <div className="mt-6 pt-6 border-t border-rule">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
          Selector de modelo
        </span>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          {(Object.keys(PRESET_META) as ModelPreset[]).map((preset) => {
            const meta = PRESET_META[preset];
            const selected = connection.preset === preset;
            return (
              <button
                key={preset}
                onClick={() => onPresetChange(preset)}
                className={`text-left p-4 rounded border transition-colors ${
                  selected
                    ? "border-stamp bg-stamp/5"
                    : "border-rule hover:border-ink-muted"
                }`}
              >
                <p className="font-medium text-sm">{meta.label}</p>
                <p className="text-sm text-ink-muted mt-1">{meta.description}</p>
              </button>
            );
          })}
        </div>
        <p className="mt-3 font-mono text-[11px] text-ink-muted leading-relaxed">
          El análisis del lote usa siempre el modelo económico; la redacción usa
          el seleccionado.
        </p>
      </div>
    </>
  );
}

function ContextSection({
  context,
}: {
  context: import("@/lib/types").UserContext | null;
}) {
  return (
    <>
      <h2 className="font-display text-xl font-semibold">Tu contexto</h2>
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
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <h2 className="font-display text-xl font-semibold">Privacidad</h2>

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
        <h3 className="font-medium text-alert">Borrar todo</h3>
        <p className="mt-2 text-sm text-ink-muted">
          Esto eliminará permanentemente la API Key, tu contexto guardado y
          cerrará la sesión actual de forma inmediata. No se puede deshacer.
        </p>
        {confirmDelete ? (
          <div className="mt-4 flex gap-3">
            <Button variant="destructive" onClick={onClearAll}>
              Confirmar borrado
            </Button>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
          </div>
        ) : (
          <Button
            variant="destructive"
            className="mt-4"
            onClick={() => setConfirmDelete(true)}
          >
            Borrar todos mis datos
          </Button>
        )}
      </div>
    </>
  );
}
