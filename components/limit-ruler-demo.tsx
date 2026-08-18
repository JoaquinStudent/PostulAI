"use client";

import { useEffect, useState } from "react";

const DEMO_TEXT =
  "Lideré la transición a Scrum en el proyecto 'Atlas', reduciendo el tiempo de entrega en un 22%. Implementé sprints de dos semanas y retrospectivas estructuradas, mejorando la previsibilidad del equipo y reduciendo los cuellos de botella en la fase de QA de manera documentada.";

export function LimitRulerDemo() {
  const limit = 300;
  const [count, setCount] = useState(0);
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReduced) {
      setCount(DEMO_TEXT.length);
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      i += 3;
      if (i >= DEMO_TEXT.length) {
        i = DEMO_TEXT.length;
        clearInterval(interval);
      }
      setCount(i);
    }, 30);
    return () => clearInterval(interval);
  }, [prefersReduced]);

  const pct = Math.min((count / limit) * 100, 100);
  const displayed = DEMO_TEXT.slice(0, count);

  return (
    <div className="bg-surface border border-rule rounded p-6 max-w-md mx-auto md:mx-0">
      <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted mb-2">
        Campo 4B. Experiencia relevante
      </p>
      <p className="text-sm font-medium text-ink leading-snug mb-4">
        Describa un proyecto reciente donde aplicó metodologías ágiles y su
        impacto en la eficiencia del equipo.
      </p>
      <div className="border border-rule rounded p-4 min-h-[140px] font-mono text-sm leading-relaxed text-ink">
        {displayed}
        <span className="inline-block w-2 h-4 bg-stamp animate-pulse ml-0.5 align-text-bottom" />
      </div>

      {/* LimitRuler */}
      <div className="mt-4">
        <div className="h-[6px] bg-rule/30 rounded-sm overflow-hidden">
          <div
            className="h-full bg-stamp rounded-sm transition-all duration-100"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
            Límite estricto
          </span>
          <span className="font-mono text-sm font-medium text-stamp">
            {count} / {limit} caracteres
          </span>
        </div>
      </div>
    </div>
  );
}
