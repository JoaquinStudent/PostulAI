"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSession } from "@/stores/session";
import { setApiKey } from "@/stores/session";
import { validateKey } from "@/lib/ai/client";
import { fetchModels } from "@/lib/ai/models";
import { encrypt } from "@/lib/vault";
import { saveVaultBlob } from "@/lib/storage";
import type { StorageMode } from "@/lib/types";

export default function ConectarPage() {
  const router = useRouter();
  const { context, connection, connect, setStorageMode, setModels } = useSession();
  const [key, setKey] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [storageMode, setLocalStorageMode] = useState<StorageMode>("memory");
  const [passphrase, setPassphrase] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if no context
  if (!context) {
    if (typeof window !== "undefined") router.replace("/contexto");
    return null;
  }

  // Already connected
  if (connection.status === "connected") {
    router.replace("/lote");
    return null;
  }

  const handleConnect = useCallback(async () => {
    if (!key.trim()) return;
    setError(null);
    setLoading(true);

    try {
      const result = await validateKey(key.trim());
      if (!result.valid) {
        setError("La clave no es válida. Verifica que la copiaste correctamente.");
        return;
      }

      // Store key according to mode
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

      setStorageMode(storageMode);
      connect(key.trim(), result.credit);

      // Fetch available models
      const models = await fetchModels(key.trim());
      setModels(models);

      router.push("/lote");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al validar la clave.");
    } finally {
      setLoading(false);
    }
  }, [key, storageMode, passphrase, connect, setStorageMode, setModels, router]);

  return (
    <div className="flex flex-col min-h-full">
      <header className="flex items-center justify-between px-6 md:px-10 h-14 bg-surface border-b border-rule">
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          <span className="inline-flex items-center gap-2">
            <span className="w-4 h-4 rounded-sm bg-stamp text-white flex items-center justify-center text-[10px] font-bold">C</span>
            CALCO
          </span>
        </Link>
      </header>

      <main className="flex-1 flex justify-center px-6 py-12">
        <div className="w-full max-w-[800px]">
          <h1 className="font-display text-3xl md:text-[36px] font-bold leading-tight tracking-[-0.02em]">
            Conecta tu proveedor de IA
          </h1>
          <p className="mt-3 text-ink-muted leading-relaxed">
            Tú pones la clave y tú pagas el consumo. Calco no cobra ni
            intermedia.
          </p>

          {/* OAuth card — deferred */}
          <div className="mt-8 bg-surface border border-rule rounded p-6">
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

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-rule" />
            <span className="text-sm text-ink-muted">o</span>
            <div className="flex-1 h-px bg-rule" />
          </div>

          {/* Manual key */}
          <div className="bg-surface border border-rule rounded p-6">
            <h2 className="font-medium text-lg">Pegar una clave manualmente</h2>

            <div className="mt-4 relative">
              <Input
                type={revealed ? "text" : "password"}
                placeholder="sk-or-..."
                value={key}
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

            {/* Warning */}
            <div className="mt-3 p-3 bg-marker/15 border border-marker/30 rounded flex gap-2 items-start">
              <AlertTriangle className="size-4 text-marker mt-0.5 shrink-0" style={{ color: "#8B7500" }} />
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] leading-relaxed" style={{ color: "#8B7500" }}>
                Crea una clave nueva con límite de 5 dólares. Si algo sale mal
                pierdes 5 dólares, no tu cuenta.
              </p>
            </div>

            {/* Storage mode */}
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
              disabled={!key.trim() || loading}
              onClick={handleConnect}
            >
              {loading ? "Validando..." : "Entrar"}
            </Button>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
          Todo ocurre en tu navegador. Calco no guarda nada.
        </p>
      </footer>
    </div>
  );
}
