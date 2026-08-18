"use client";

import Link from "next/link";

export function SessionBar() {
  return (
    <div className="h-7 md:h-[28px] flex items-center justify-between px-4 bg-marker/15 backdrop-blur-sm font-mono text-[11px] md:text-xs uppercase tracking-[0.08em] text-ink/70 select-none">
      <span>Sesión temporal · Nada se guarda al cerrar</span>
      <Link href="/ajustes" className="underline hover:text-stamp">
        Exportar ahora
      </Link>
    </div>
  );
}
