"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Settings } from "lucide-react";
import { SessionBar } from "@/components/session-bar";
import { useSession } from "@/stores/session";

export default function LotePage() {
  const router = useRouter();
  const { context, connection } = useSession();

  if (!context) {
    if (typeof window !== "undefined") router.replace("/contexto");
    return null;
  }
  if (connection.status !== "connected") {
    if (typeof window !== "undefined") router.replace("/conectar");
    return null;
  }

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
          <Link href="/ajustes" className="text-ink-muted hover:text-ink">
            <Settings className="size-5" />
          </Link>
        </div>
      </header>
      <SessionBar />

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="text-center max-w-md">
          <h1 className="font-display text-2xl font-bold">
            Pega tus convocatorias
          </h1>
          <p className="mt-3 text-ink-muted leading-relaxed">
            Aquí pegarás los enlaces de las convocatorias que quieras analizar.
            Esta funcionalidad llega en el Sprint 2.
          </p>
          <p className="mt-6 font-mono text-xs text-ink-muted uppercase tracking-[0.08em]">
            Contexto cargado: {context.fileName} · Modelo:{" "}
            {connection.preset}
          </p>
        </div>
      </main>
    </div>
  );
}
