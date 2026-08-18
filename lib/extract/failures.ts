import type { FailureCause, SourceFailure } from "@/lib/types";

const FAILURE_MAP: Record<FailureCause, { message: string; canRetry: boolean }> = {
  timeout: {
    message: "El sitio tardó demasiado en responder.",
    canRetry: true,
  },
  blocked: {
    message: "El sitio requiere inicio de sesión o bloqueó el acceso.",
    canRetry: false,
  },
  not_found: {
    message: "La página no existe o fue eliminada.",
    canRetry: true,
  },
  unsupported: {
    message: "El tipo de contenido no es compatible (solo HTML y PDF).",
    canRetry: false,
  },
  empty: {
    message: "Se descargó la página pero no contiene texto útil. Probablemente requiere JavaScript.",
    canRetry: false,
  },
  network: {
    message: "Error de red al intentar acceder al sitio.",
    canRetry: true,
  },
  no_text_layer: {
    message: "El PDF es una imagen escaneada sin capa de texto.",
    canRetry: false,
  },
};

export function makeFailure(cause: FailureCause): SourceFailure {
  const info = FAILURE_MAP[cause];
  return { cause, ...info };
}
