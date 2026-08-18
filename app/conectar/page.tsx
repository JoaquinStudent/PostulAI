"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertTriangle, Zap, PenTool, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSession } from "@/stores/session";
import { setApiKey } from "@/stores/session";
import { validateKey } from "@/lib/ai/client";
import {
  RECOMMENDED_COMBOS,
  getAnalysisModels,
  getGenerationModels,
  type ModelCombo,
  type CuratedModel,
} from "@/lib/ai/models";
import { encrypt } from "@/lib/vault";
import { saveVaultBlob } from "@/lib/storage";
import type { StorageMode } from "@/lib/types";

type Step = "key" | "models";

export default function ConectarPage() {
  const router = useRouter();
  const { context, connection, connect, setStorageMode, setModels } = useSession();
  const [key, setKey] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [storageMode, setLocalStorageMode] = useState<StorageMode>("memory");
  const [passphrase, setPassphrase] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState<Step>("key");
  const [selectedCombo, setSelectedCombo] = useState(1); // balanced by default
  const [customMode, setCustomMode] = useState(false);
  const [customAnalysis, setCustomAnalysis] = useState("openai/gpt-4o-mini");
  const [customGeneration, setCustomGeneration] = useState("anthropic/claude-sonnet-4");
  const [validatedCredit, setValidatedCredit] = useState<{ remaining: number; limit: number | null } | null>(null);

  const handleValidateKey = useCallback(async () => {
    if (!key.trim()) return;
    setError(null);
    setLoading(true);

    try {
      const result = await validateKey(key.trim());
      if (!result.valid) {
        setError("La clave no es válida. Verifica que la copiaste correctamente.");
        return;
      }

      setValidatedCredit(result.credit);

      if (storageMode === "session") {
        sessionStorage.setItem("or-key", key.trim());
      } else if (storageMode === "vault") {
        if (!passphrase) {
          setError("Ingresa una contraseña para cifrar la clave.");
          return;
        }
        const blob = await encrypt(key.trim(), passphrase);
        await saveVaultBlob(blob);
      }

      setStep("models");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al validar la clave.");
    } finally {
      setLoading(false);
    }
  }, [key, storageMode, passphrase]);

  const handleConfirmModels = useCallback(() => {
    const combo = customMode
      ? { analysis: customAnalysis, generation: customGeneration }
      : RECOMMENDED_COMBOS[selectedCombo];

    setStorageMode(storageMode);
    connect(key.trim(), validatedCredit);
    setModels({
      economy: combo.analysis,
      balanced: combo.generation,
      quality: combo.generation,
    });
    router.push("/lote");
  }, [key, storageMode, validatedCredit, selectedCombo, customMode, customAnalysis, customGeneration, connect, setStorageMode, setModels, router]);

  useEffect(() => {
    if (!context) router.replace("/contexto");
    else if (connection.status === "connected") router.replace("/lote");
  }, [context, connection.status, router]);

  if (!context || connection.status === "connected") return null;

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 md:px-10 h-14 glass border-b border-rule/30">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-stamp rounded-md flex items-center justify-center">
            <span className="text-white text-[11px] font-bold">P</span>
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            PostulAI
          </span>
        </Link>
        <div className="hidden sm:flex items-center gap-1.5 text-xs tracking-wide">
          <span className="text-confirm font-medium">✓ Contexto</span>
          <span className="text-ink-muted/40 mx-1">—</span>
          <span className="px-2.5 py-0.5 rounded-full bg-stamp text-white text-[11px] font-medium">2</span>
          <span className="text-stamp font-medium">Conectar</span>
          <span className="text-ink-muted/40 mx-1">—</span>
          <span className="text-ink-muted/60">3 Analizar</span>
        </div>
      </header>

      <main className="flex-1 flex justify-center px-6 py-12">
        <div className="w-full max-w-[800px]">
          <h1 className="font-display text-3xl md:text-[36px] font-bold leading-tight tracking-[-0.02em]">
            {step === "key" ? "Conecta tu proveedor de IA" : "Elige tu plan de consumo"}
          </h1>
          <p className="mt-3 text-ink-muted leading-relaxed">
            {step === "key"
              ? "Tú pones la clave y tú pagas el consumo. PostulAI no cobra ni intermedia."
              : "Elige qué modelos usar. Análisis = extracción y evaluación. Redacción = generar respuestas."}
          </p>

          {step === "key" ? (
            <KeyStep
              key_={key}
              setKey={setKey}
              revealed={revealed}
              setRevealed={setRevealed}
              storageMode={storageMode}
              setLocalStorageMode={setLocalStorageMode}
              passphrase={passphrase}
              setPassphrase={setPassphrase}
              loading={loading}
              error={error}
              onSubmit={handleValidateKey}
            />
          ) : (
            <ModelStep
              selectedCombo={selectedCombo}
              setSelectedCombo={setSelectedCombo}
              customMode={customMode}
              setCustomMode={setCustomMode}
              customAnalysis={customAnalysis}
              setCustomAnalysis={setCustomAnalysis}
              customGeneration={customGeneration}
              setCustomGeneration={setCustomGeneration}
              credit={validatedCredit}
              onBack={() => setStep("key")}
              onConfirm={handleConfirmModels}
            />
          )}
        </div>
      </main>

      <footer className="py-6 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
          Todo ocurre en tu navegador. PostulAI no guarda nada.
        </p>
      </footer>
    </div>
  );
}

function KeyStep({
  key_,
  setKey,
  revealed,
  setRevealed,
  storageMode,
  setLocalStorageMode,
  passphrase,
  setPassphrase,
  loading,
  error,
  onSubmit,
}: {
  key_: string;
  setKey: (v: string) => void;
  revealed: boolean;
  setRevealed: (v: boolean) => void;
  storageMode: StorageMode;
  setLocalStorageMode: (v: StorageMode) => void;
  passphrase: string;
  setPassphrase: (v: string) => void;
  loading: boolean;
  error: string | null;
  onSubmit: () => void;
}) {
  return (
    <>
      <div className="mt-8 bg-surface border border-rule/40 rounded-xl p-6">
        <h2 className="font-medium text-lg">Conectar con OpenRouter</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Es el método recomendado. El acceso se revoca cuando quieras y no
          necesitas manipular claves sensibles.
        </p>
        <Button className="mt-4" disabled>
          Conectar cuenta
        </Button>
        <p className="mt-2 font-mono text-[11px] text-ink-muted uppercase tracking-[0.08em]">
          Próximamente
        </p>
      </div>

      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-rule" />
        <span className="text-sm text-ink-muted">o</span>
        <div className="flex-1 h-px bg-rule" />
      </div>

      <div className="bg-surface border border-rule/40 rounded-xl p-6">
        <h2 className="font-medium text-lg">Pegar una clave manualmente</h2>

        <div className="mt-4 relative">
          <Input
            type={revealed ? "text" : "password"}
            placeholder="sk-or-..."
            value={key_}
            onChange={(e) => setKey(e.target.value)}
            className="pr-10 font-mono"
          />
          <button
            type="button"
            onClick={() => setRevealed(!revealed)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
          >
            {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>

        <div className="mt-3 p-3 bg-marker/10 border border-marker/20 rounded-lg flex gap-2 items-start">
          <AlertTriangle className="size-4 text-marker mt-0.5 shrink-0" style={{ color: "#8B7500" }} />
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] leading-relaxed" style={{ color: "#8B7500" }}>
            Crea una clave nueva con límite de 5 dólares. Si algo sale mal
            pierdes 5 dólares, no tu cuenta.
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-rule">
          <p className="text-sm font-medium">Dónde guardar la clave</p>
          <RadioGroup
            value={storageMode}
            onValueChange={(v) => setLocalStorageMode(v as StorageMode)}
            className="mt-3 space-y-3"
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <RadioGroupItem value="memory" className="mt-0.5" />
              <div>
                <p className="text-sm font-medium">
                  Solo durante esta sesión{" "}
                  <span className="text-ink-muted font-normal">(recomendado)</span>
                </p>
                <p className="text-sm text-ink-muted">
                  Se elimina inmediatamente al salir de la aplicación.
                </p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <RadioGroupItem value="session" className="mt-0.5" />
              <div>
                <p className="text-sm font-medium">Hasta cerrar la pestaña</p>
                <p className="text-sm text-ink-muted">
                  Se mantiene activa mientras navegues en esta ventana.
                </p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <RadioGroupItem value="vault" className="mt-0.5" />
              <div>
                <p className="text-sm font-medium">
                  Guardar cifrada con una contraseña
                </p>
                <p className="text-sm text-ink-muted">
                  Se guarda en este navegador protegida por una clave maestra
                  local.
                </p>
              </div>
            </label>
          </RadioGroup>

          {storageMode === "vault" && (
            <div className="mt-4 ml-7">
              <Input
                type="password"
                placeholder="Contraseña para cifrar"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
              />
              <p className="mt-1 text-xs text-ink-muted">
                Si olvidas esta contraseña, la clave no se puede recuperar.
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-alert/8 border border-alert rounded">
            <p className="text-sm text-alert">{error}</p>
          </div>
        )}

        <Button
          size="lg"
          className="w-full mt-6"
          disabled={!key_.trim() || loading}
          onClick={onSubmit}
        >
          {loading ? "Validando..." : "Siguiente"}
        </Button>
      </div>
    </>
  );
}

function ModelStep({
  selectedCombo,
  setSelectedCombo,
  customMode,
  setCustomMode,
  customAnalysis,
  setCustomAnalysis,
  customGeneration,
  setCustomGeneration,
  credit,
  onBack,
  onConfirm,
}: {
  selectedCombo: number;
  setSelectedCombo: (v: number) => void;
  customMode: boolean;
  setCustomMode: (v: boolean) => void;
  customAnalysis: string;
  setCustomAnalysis: (v: string) => void;
  customGeneration: string;
  setCustomGeneration: (v: string) => void;
  credit: { remaining: number; limit: number | null } | null;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const combo = RECOMMENDED_COMBOS[selectedCombo];
  const postulationsWithCredit = credit
    ? Math.floor(credit.remaining / parseCost(combo.costEstimate))
    : null;

  return (
    <div className="mt-8 space-y-6">
      {/* Preset combos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {RECOMMENDED_COMBOS.map((c, i) => {
          const selected = !customMode && selectedCombo === i;
          return (
            <button
              key={i}
              onClick={() => {
                setSelectedCombo(i);
                setCustomMode(false);
              }}
              className={`relative flex flex-col items-start p-5 rounded-xl border-2 transition-all duration-200 text-left active:scale-[0.98] ${
                selected
                  ? "border-stamp bg-stamp/5 shadow-sm"
                  : "border-rule/40 hover:border-rule"
              }`}
            >
              {i === 1 && (
                <span className="absolute -top-2.5 right-4 px-2 py-0.5 text-[10px] font-bold uppercase bg-stamp text-white rounded-full">
                  Recomendado
                </span>
              )}
              <p className={`font-display text-lg font-bold ${selected ? "text-stamp" : ""}`}>
                {c.name}
              </p>
              <p className="mt-1 text-xs text-ink-muted leading-snug">
                {c.description}
              </p>

              <div className="mt-4 w-full space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="size-3.5 text-confirm shrink-0" />
                  <span className="text-xs truncate">{getModelLabel(c.analysis)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PenTool className="size-3.5 text-stamp shrink-0" />
                  <span className="text-xs truncate">{getModelLabel(c.generation)}</span>
                </div>
              </div>

              <p className="mt-3 font-mono text-lg font-bold">
                {c.costEstimate}
                <span className="text-[11px] font-normal text-ink-muted"> /postulación</span>
              </p>

              {selected && (
                <div className="absolute top-4 right-4">
                  <Check className="size-5 text-stamp" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom option */}
      <div className={`border rounded-xl p-5 transition-all ${customMode ? "border-stamp bg-stamp/5" : "border-rule/40"}`}>
        <button
          onClick={() => setCustomMode(!customMode)}
          className="flex items-center justify-between w-full text-left"
        >
          <div>
            <p className="text-sm font-medium">Personalizar modelos</p>
            <p className="text-xs text-ink-muted">Elige combinaciones específicas</p>
          </div>
          <ChevronDown className={`size-4 text-ink-muted transition-transform ${customMode ? "rotate-180" : ""}`} />
        </button>

        {customMode && (
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="size-4 text-confirm" />
                <p className="text-sm font-medium">Modelo de análisis</p>
              </div>
              <CuratedSelect
                models={getAnalysisModels()}
                value={customAnalysis}
                onChange={setCustomAnalysis}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <PenTool className="size-4 text-stamp" />
                <p className="text-sm font-medium">Modelo de redacción</p>
              </div>
              <CuratedSelect
                models={getGenerationModels()}
                value={customGeneration}
                onChange={setCustomGeneration}
              />
            </div>
          </div>
        )}
      </div>

      {/* Cost summary */}
      {!customMode && (
        <div className="p-4 bg-stamp/5 border border-stamp/15 rounded-xl">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-paper rounded-lg">
              <p className="text-lg font-bold">{combo.costEstimate}</p>
              <p className="text-[11px] text-ink-muted">por postulación (6 preg.)</p>
            </div>
            <div className="p-3 bg-paper rounded-lg">
              <p className="text-lg font-bold">
                {postulationsWithCredit != null ? `~${postulationsWithCredit}` : "—"}
              </p>
              <p className="text-[11px] text-ink-muted">
                postulaciones con tu crédito
                {credit ? ` ($${credit.remaining.toFixed(2)})` : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Volver
        </Button>
        <Button onClick={onConfirm} className="flex-1">
          Empezar a postular
        </Button>
      </div>
    </div>
  );
}

function CuratedSelect({
  models,
  value,
  onChange,
}: {
  models: CuratedModel[];
  value: string;
  onChange: (v: string) => void;
}) {
  // Deduplicate by id
  const unique = models.filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-paper border border-rule/40 rounded-xl text-sm appearance-none cursor-pointer hover:border-rule transition-colors"
    >
      {unique.map((m) => (
        <option key={m.id} value={m.id}>
          {m.label} ({m.provider}) — {m.inputPrice} input
        </option>
      ))}
    </select>
  );
}

function getModelLabel(id: string): string {
  const labels: Record<string, string> = {
    "openai/gpt-4o-mini": "GPT-4o Mini",
    "google/gemini-flash-1.5": "Gemini 1.5 Flash",
    "anthropic/claude-sonnet-4": "Claude Sonnet 4",
    "anthropic/claude-opus-4": "Claude Opus 4",
    "openai/gpt-4o": "GPT-4o",
    "meta-llama/llama-3.1-8b-instruct": "Llama 3.1 8B",
    "meta-llama/llama-3.1-70b-instruct": "Llama 3.1 70B",
    "deepseek/deepseek-chat-v3-0324": "DeepSeek V3",
  };
  return labels[id] ?? id.split("/").pop() ?? id;
}

function parseCost(estimate: string): number {
  const match = estimate.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0.05;
}
