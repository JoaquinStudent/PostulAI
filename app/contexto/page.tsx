"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, Check, Upload, FileText, AlertTriangle, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GENERATOR_PROMPT } from "@/lib/prompts/pr-01";
import { validateContextFile } from "@/lib/extract/text";
import { extractPdfText } from "@/lib/extract/pdf";
import { useSession } from "@/stores/session";
import { saveContext } from "@/lib/storage";
import type { UserContext, ContextSummary, ContextWarning } from "@/lib/types";

type View = "generator" | "upload";

export default function ContextoPage() {
  const router = useRouter();
  const { context, setContext } = useSession();
  const [view, setView] = useState<View>(context ? "upload" : "generator");

  return (
    <div className="flex flex-col min-h-full">
      <Header
        view={view}
        onSkip={() => setView("upload")}
      />
      <main className="flex-1 flex justify-center px-6 py-12">
        <div className="w-full max-w-[800px]">
          {view === "generator" ? (
            <GeneratorView onContinue={() => setView("upload")} />
          ) : (
            <UploadView
              existingContext={context}
              onContextLoaded={(ctx) => {
                setContext(ctx);
                router.push("/conectar");
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function Header({ view, onSkip }: { view: View; onSkip: () => void }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 md:px-10 h-14 glass border-b border-rule/30">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-6 h-6 bg-stamp rounded-md flex items-center justify-center">
          <span className="text-white text-[11px] font-bold">P</span>
        </div>
        <span className="font-display text-xl font-bold tracking-tight">
          PostulAI
        </span>
      </Link>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-1.5 text-xs tracking-wide">
          <span className="px-2.5 py-0.5 rounded-full bg-stamp text-white text-[11px] font-medium">1</span>
          <span className="text-stamp font-medium">Contexto</span>
          <span className="text-ink-muted/40 mx-1">—</span>
          <span className="text-ink-muted/60">2 Conectar</span>
          <span className="text-ink-muted/40 mx-1">—</span>
          <span className="text-ink-muted/60">3 Analizar</span>
        </div>
        {view === "generator" && (
          <button
            onClick={onSkip}
            className="text-sm text-ink-muted hover:text-stamp transition-colors duration-200"
          >
            Ya tengo mi archivo
          </button>
        )}
      </div>
    </header>
  );
}

function GeneratorView({ onContinue }: { onContinue: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(GENERATOR_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <>
      <h1 className="font-display text-3xl md:text-[36px] font-bold leading-tight tracking-[-0.02em]">
        Arma tu contexto una sola vez
      </h1>
      <p className="mt-3 text-ink-muted leading-relaxed">
        Es un archivo de texto con quién eres, qué has hecho y en qué eres
        bueno; se reutiliza en todas tus postulaciones.
      </p>

      <div className="mt-8 bg-surface border border-rule/40 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-rule/30">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
            Prompt generador
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-1.5"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copiado" : "Copiar"}
          </Button>
        </div>
        <pre className="p-6 font-mono text-sm leading-relaxed text-ink whitespace-pre-wrap">
          {GENERATOR_PROMPT}
        </pre>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: "Incluye números",
            desc: 'Los datos empíricos dan credibilidad a las respuestas redactadas. Un "aumenté la eficiencia un 20%" es mejor que "mejoré procesos".',
          },
          {
            title: "Escribe los fracasos también",
            desc: "Explicar qué salió mal y cómo lo solucionaste demuestra madurez profesional y verdadera capacidad de iteración.",
          },
          {
            title: "No lo hagas un CV",
            desc: "El contexto debe ser narrativo y profundo. Evita hacer una lista cronológica de fechas y cargos vacíos de significado.",
          },
        ].map((tip) => (
          <div key={tip.title} className="bg-surface border border-rule/40 rounded-xl p-5">
            <p className="font-medium text-sm text-ink">{tip.title}</p>
            <p className="mt-2 text-sm text-ink-muted leading-relaxed">
              {tip.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-stamp/5 border border-stamp/10 rounded-xl p-4 flex gap-3 items-start">
        <span className="text-stamp mt-0.5">ℹ</span>
        <p className="text-sm text-ink-muted">
          Sirve cualquier IA (ChatGPT, Claude, Gemini) y el resultado debe
          guardarse como archivo .md para adjuntarlo en el siguiente paso.
        </p>
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-rule pt-6">
        <Link href="/" className="text-sm underline text-ink hover:text-stamp">
          Volver
        </Link>
        <Button size="lg" onClick={onContinue}>
          Continuar →
        </Button>
      </div>
    </>
  );
}

function UploadView({
  existingContext,
  onContextLoaded,
}: {
  existingContext: UserContext | null;
  onContextLoaded: (ctx: UserContext) => void;
}) {
  const [file, setFile] = useState<{ name: string; size: number; text: string } | null>(
    existingContext ? { name: existingContext.fileName, size: existingContext.sizeBytes, text: existingContext.raw } : null,
  );
  const [cvFile, setCvFile] = useState<{ name: string; text: string } | null>(
    existingContext?.cvRaw ? { name: existingContext.cvFileName ?? "cv.pdf", text: existingContext.cvRaw } : null,
  );
  const [cvLoading, setCvLoading] = useState(false);
  const [summary, setSummary] = useState<ContextSummary | null>(
    existingContext?.summary ?? null,
  );
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [persist, setPersist] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(async (f: File) => {
    setError(null);
    const result = await validateContextFile(f);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setFile({ name: f.name, size: f.size, text: result.text });
    setSummary(null);
    analyzeSummary(result.text);
  }, []);

  const analyzeSummary = useCallback(async (text: string) => {
    setAnalyzing(true);
    try {
      // ponytail: offline summary heuristic — no AI call needed for Sprint 1 demo
      // Real PR-02 call comes when OpenRouter is connected
      const lines = text.split("\n");
      const sections: ContextSummary["sections"] = [];
      const warnings: ContextWarning[] = [];

      const profileMatch = text.match(/## Perfil\n([\s\S]*?)(?=\n## |$)/);
      sections.push({
        key: "profile",
        label: "Perfil",
        itemCount: 1,
        preview: profileMatch?.[1]?.trim().split("\n")[0]?.slice(0, 100) || "Perfil detectado",
      });

      const projectsMatch = text.match(/## Proyectos\n([\s\S]*?)(?=\n## |$)/);
      const projectCount = projectsMatch?.[1]?.split(/\n###\s/).length ?? 0;
      sections.push({
        key: "projects",
        label: "Proyectos",
        itemCount: Math.max(projectCount - 1, 0) || (projectsMatch ? 1 : 0),
        preview: projectsMatch?.[1]?.trim().split("\n")[0]?.slice(0, 100) || "",
      });

      const achievementsMatch = text.match(/## Logros\n([\s\S]*?)(?=\n## |$)/);
      const hasMetrics = /\d+%|\d+\s*(usuarios|users|ms|segundos|seconds|horas|hours|días|days|USD|\$)/i.test(text);
      sections.push({
        key: "achievements",
        label: "Logros",
        itemCount: achievementsMatch?.[1]?.split("\n-").length ?? 0,
        preview: achievementsMatch?.[1]?.trim().split("\n")[0]?.slice(0, 100) || "",
      });

      const skillsMatch = text.match(/## Habilidades\n([\s\S]*?)(?=\n## |$)/);
      const skillItems = skillsMatch?.[1]?.match(/(^|\n)- /g)?.length ?? 0;
      const commaSkills = skillsMatch?.[1]?.split(",").length ?? 0;
      sections.push({
        key: "skills",
        label: "Habilidades",
        itemCount: Math.max(skillItems, commaSkills),
        preview: skillsMatch?.[1]?.trim().split("\n")[0]?.slice(0, 100) || "",
      });

      if (!hasMetrics) {
        warnings.push({
          code: "no_metrics",
          message: "Sin datos medibles",
          suggestion: "Incluye métricas como % o tiempos para mejorar tus respuestas.",
        });
      }
      const wordCount = text.split(/\s+/).length;
      if (wordCount < 200) {
        warnings.push({
          code: "too_short",
          message: "Contexto muy breve",
          suggestion: "Un contexto más detallado produce mejores respuestas.",
        });
      }
      if (!projectsMatch) {
        warnings.push({
          code: "no_projects",
          message: "Sin proyectos",
          suggestion: "Describe al menos 2-3 proyectos con tu rol y resultados.",
        });
      }
      if (!/\b20\d{2}\b/.test(text)) {
        warnings.push({
          code: "no_dates",
          message: "Sin fechas",
          suggestion: "Agrega fechas y duraciones a tus proyectos y logros.",
        });
      }

      setSummary({
        profile: sections[0].preview,
        sections,
        warnings,
      });
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const handleCvFile = useCallback(async (f: File) => {
    setCvLoading(true);
    try {
      const result = await extractPdfText(f);
      if (result.ok) {
        setCvFile({ name: f.name, text: result.text });
      } else {
        setError("No se pudo leer el PDF del CV.");
      }
    } catch {
      setError("Error al procesar el PDF del CV.");
    } finally {
      setCvLoading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const handleContinue = async () => {
    if (!file) return;
    const ctx: UserContext = {
      raw: file.text,
      fileName: file.name,
      sizeBytes: file.size,
      loadedAt: Date.now(),
      summary,
      cvRaw: cvFile?.text ?? null,
      cvFileName: cvFile?.name ?? null,
    };
    if (persist) {
      await saveContext(file.text);
    }
    onContextLoaded(ctx);
  };

  return (
    <>
      <h1 className="font-display text-3xl md:text-[36px] font-bold leading-tight tracking-[-0.02em]">
        Adjunta tu contexto
      </h1>
      <p className="mt-3 text-ink-muted leading-relaxed">
        Se lee en tu navegador y se descarta al cerrar. No se sube a ningún
        servidor.
      </p>

      {/* Drop zone / file info */}
      <div
        className={`mt-8 bg-surface border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200 ${
          dragOver ? "border-stamp bg-stamp/5" : "border-rule/50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-confirm/10 flex items-center justify-center text-confirm">
              <Check className="size-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-medium">{file.name}</span>
              <span className="font-mono text-xs text-ink-muted">
                {(file.size / 1024).toFixed(0)} KB
              </span>
            </div>
            <label className="inline-flex items-center justify-center px-4 py-2 rounded border border-rule text-sm cursor-pointer hover:bg-paper transition-colors">
              Reemplazar
              <input
                type="file"
                accept=".md,.txt"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </label>
          </div>
        ) : (
          <label className="flex flex-col items-center gap-3 cursor-pointer">
            <Upload className="size-8 text-ink-muted" />
            <p className="text-sm text-ink-muted">
              Arrastra tu archivo .md o .txt aquí o{" "}
              <span className="underline text-stamp">selecciónalo</span>
            </p>
            <input
              type="file"
              accept=".md,.txt"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-alert/8 border border-alert rounded flex gap-2 items-start">
          <AlertTriangle className="size-4 text-alert mt-0.5 shrink-0" />
          <p className="text-sm text-alert">{error}</p>
        </div>
      )}

      {/* Context summary */}
      {analyzing && (
        <div className="mt-8">
          <div className="h-0.5 bg-rule overflow-hidden rounded">
            <div className="h-full bg-stamp w-1/3 animate-pulse" />
          </div>
          <p className="mt-2 text-sm text-ink-muted">Analizando contexto...</p>
        </div>
      )}

      {summary && !analyzing && (
        <div className="mt-8">
          <h2 className="font-display text-xl font-semibold">Lo que PostulAI leyó</h2>
          <div className="mt-4 bg-surface border border-rule/40 rounded-xl divide-y divide-rule/30">
            {summary.sections.map((section) => (
              <div
                key={section.key}
                className="flex items-start justify-between px-5 py-4 gap-4"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted w-24 shrink-0 pt-0.5">
                    {section.label}
                  </span>
                  <div className="min-w-0">
                    {section.key === "achievements" &&
                      summary.warnings.some((w) => w.code === "no_metrics") && (
                        <span className="inline-block mb-1 px-2 py-0.5 rounded-full bg-alert/10 font-mono text-[11px] uppercase tracking-[0.08em] text-alert">
                          Sin datos medibles
                        </span>
                      )}
                    <p className="text-sm text-ink-muted truncate">
                      {section.preview || "—"}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs text-ink-muted whitespace-nowrap">
                  {section.itemCount}{" "}
                  {section.itemCount === 1 ? "registro" : "registros"}
                </span>
              </div>
            ))}
          </div>

          {summary.warnings
            .filter((w) => w.code !== "no_metrics")
            .map((w) => (
              <div
                key={w.code}
                className="mt-3 p-3 bg-alert/8 border border-alert/20 rounded"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-alert">
                  {w.message}
                </p>
                <p className="mt-1 text-sm text-ink-muted">{w.suggestion}</p>
              </div>
            ))}
        </div>
      )}

      {/* CV upload (optional) */}
      {file && (
        <div className="mt-8">
          <h2 className="font-display text-xl font-semibold">CV (opcional)</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Sube tu CV en PDF y PostulAI te dirá qué cambiar para cada convocatoria.
          </p>
          <div className="mt-4 bg-surface border border-rule/40 rounded-xl p-5">
            {cvFile ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="size-5 text-confirm" />
                  <div>
                    <p className="font-mono text-sm font-medium">{cvFile.name}</p>
                    <p className="text-xs text-ink-muted">
                      {cvFile.text.split(/\s+/).length} palabras extraídas
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-stamp cursor-pointer hover:underline">
                    Reemplazar
                    <input
                      type="file"
                      accept=".pdf"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleCvFile(f);
                      }}
                    />
                  </label>
                  <button
                    onClick={() => setCvFile(null)}
                    className="text-sm text-ink-muted hover:text-alert"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex items-center gap-4 cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-stamp/10 flex items-center justify-center shrink-0">
                  <FileUp className="size-5 text-stamp" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {cvLoading ? "Leyendo PDF..." : "Subir CV en PDF"}
                  </p>
                  <p className="text-xs text-ink-muted">
                    PostulAI analizará tu CV contra cada convocatoria y te recomendará qué mejorar.
                  </p>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  className="sr-only"
                  disabled={cvLoading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleCvFile(f);
                  }}
                />
              </label>
            )}
          </div>
        </div>
      )}

      {/* Persist toggle */}
      {file && (
        <div className="mt-8 flex items-start gap-4">
          <Switch
            checked={persist}
            onCheckedChange={setPersist}
            className="mt-0.5"
          />
          <div>
            <p className="text-sm font-medium">
              Recordar mi contexto en este dispositivo
            </p>
            <p className="text-sm text-ink-muted font-mono">
              Se guarda solo en este navegador. Puedes borrarlo cuando quieras
              desde ajustes.
            </p>
          </div>
        </div>
      )}

      {/* Continue */}
      <div className="mt-10">
        <Button
          size="lg"
          className="w-full"
          disabled={!file}
          onClick={handleContinue}
        >
          Continuar
        </Button>
      </div>
    </>
  );
}
