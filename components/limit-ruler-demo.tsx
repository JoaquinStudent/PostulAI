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
    <div className="p-6">
      <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted/60 mb-2">
        Campo 4B · Experiencia relevante
      </p>
      <p className="text-sm font-medium text-ink leading-snug mb-4">
        Describa un proyecto reciente donde aplicó metodologías ágiles y su
        impacto en la eficiencia del equipo.
      </p>
      <div className="rounded-xl bg-surface/60 border border-rule/20 p-4 min-h-[130px] font-mono text-sm leading-relaxed text-ink">
        {displayed}
        <span className="inline-block w-[2px] h-4 bg-stamp animate-pulse ml-0.5 align-text-bottom rounded-full" />
      </div>

      <div className="mt-4">
        <div className="h-1.5 bg-ink/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-stamp rounded-full transition-all duration-100"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-[11px] text-ink-muted/50 tracking-wide">
            Limite estricto
          </span>
          <span className="font-mono text-sm font-medium text-stamp">
            {count}/{limit}
          </span>
        </div>
      </div>
    </div>
  );
}
