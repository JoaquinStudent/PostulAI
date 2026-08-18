"use client";

import { useState, useEffect } from "react";
import type { Source } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

const STATUS_LABELS: Record<Source["status"], string> = {
  pending: "EN COLA",
  extracting: "LEYENDO EL SITIO",
  extracted: "EXTRAÍDO",
  analyzing: "COMPARANDO CON TU PERFIL",
  ready: "LISTA",
  failed: "NO SE PUDO LEER",
};

function statusColor(status: Source["status"]): string {
  if (status === "ready") return "text-confirm";
  if (status === "failed") return "text-alert";
  if (status === "extracting" || status === "analyzing") return "text-stamp";
  return "text-ink-muted";
}

export function SourceQueueItem({
  source,
  onPasteManual,
  onRemove,
}: {
  source: Source;
  onPasteManual: (id: string, text: string) => void;
  onRemove: (id: string) => void;
}) {
  const [showPaste, setShowPaste] = useState(false);

  useEffect(() => {
    if (source.status === "failed" && source.failure?.cause === "blocked") {
      setShowPaste(true);
    }
  }, [source.status, source.failure?.cause]);
  const [pastedText, setPastedText] = useState("");

  const isSpinning = source.status === "extracting" || source.status === "analyzing";
  const domain = source.kind === "url"
    ? new URL(source.origin).hostname.replace(/^www\./, "")
    : source.origin;

  return (
    <div className="flex items-start gap-4 py-4 border-b border-rule/30 last:border-b-0">
      {/* Status icon */}
      <div className="w-12 shrink-0 flex justify-center pt-1">
        {isSpinning && <Loader2 className="size-5 text-stamp animate-spin" />}
        {source.status === "ready" && (
          <span className="font-display text-lg font-bold text-ink-muted">
            {source.wordCount ? `${Math.round(source.wordCount / 100) * 100}` : "—"}
          </span>
        )}
        {source.status === "failed" && (
          <AlertCircle className="size-5 text-alert" />
        )}
        {source.status === "pending" && (
          <span className="size-2 rounded-full bg-rule" />
        )}
        {source.status === "extracted" && (
          <CheckCircle className="size-5 text-confirm" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{domain}</p>
        <p className="font-mono text-[11px] text-ink-muted truncate">{source.origin}</p>
        {source.failure && (
          <p className="text-sm text-alert mt-1">{source.failure.message}</p>
        )}

        {/* Paste manual fallback */}
        {source.status === "failed" && !showPaste && (
          <div className="mt-2 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPaste(true)}
            >
              Pegar texto
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(source.id)}
            >
              Quitar
            </Button>
          </div>
        )}

        {showPaste && (
          <div className="mt-3">
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Pega aquí el texto de la convocatoria..."
              className="w-full h-32 p-3 text-sm border border-rule rounded bg-surface resize-y font-body"
            />
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                disabled={pastedText.trim().length < 50}
                onClick={() => {
                  onPasteManual(source.id, pastedText.trim());
                  setShowPaste(false);
                }}
              >
                Usar este texto
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPaste(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Status badge */}
      <span
        className={`shrink-0 font-mono text-[11px] uppercase tracking-[0.08em] ${statusColor(source.status)}`}
      >
        {STATUS_LABELS[source.status]}
      </span>
    </div>
  );
}
