import { getApiKey } from "@/stores/session";

const BASE_URL = "https://openrouter.ai/api/v1";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CompletionOptions {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

export class AiError extends Error {
  constructor(
    message: string,
    public code: "auth" | "credit" | "rate_limit" | "server" | "parse",
    public status?: number,
  ) {
    super(message);
  }
}

function getHeaders(): HeadersInit {
  const key = getApiKey();
  if (!key) throw new AiError("No hay clave de API configurada.", "auth");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "",
    "X-Title": "PostulAI",
  };
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = 3,
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, init);

    if (res.status === 401) throw new AiError("Clave inválida o expirada.", "auth", 401);
    if (res.status === 402) throw new AiError("Sin crédito disponible.", "credit", 402);

    if (res.status === 429 && attempt < retries) {
      const delay = Math.min(1000 * 2 ** attempt, 8000);
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }

    if (res.status >= 500 && attempt < 1) {
      await new Promise((r) => setTimeout(r, 1000));
      continue;
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new AiError(
        `Error del proveedor: ${res.status}${body ? ` — ${body.slice(0, 200)}` : ""}`,
        res.status === 429 ? "rate_limit" : "server",
        res.status,
      );
    }

    return res;
  }
  throw new AiError("Límite de reintentos alcanzado.", "rate_limit");
}

export async function complete(opts: CompletionOptions): Promise<string> {
  const res = await fetchWithRetry(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      stream: false,
      temperature: opts.temperature ?? 0.3,
      max_tokens: opts.max_tokens,
    }),
  });

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new AiError("Respuesta del modelo vacía o malformada.", "parse");
  }
  return content;
}

export async function* streamComplete(
  opts: CompletionOptions,
): AsyncGenerator<string, void, undefined> {
  const res = await fetchWithRetry(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      stream: true,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.max_tokens,
    }),
  });

  const reader = res.body?.getReader();
  if (!reader) throw new AiError("Streaming no soportado.", "server");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data: ")) continue;
      const payload = trimmed.slice(6);
      if (payload === "[DONE]") return;

      try {
        const json = JSON.parse(payload);
        const delta = json.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta) yield delta;
      } catch {
        // skip malformed SSE chunks
      }
    }
  }
}

export async function validateKey(key: string): Promise<{
  valid: boolean;
  credit: { remaining: number; limit: number | null } | null;
}> {
  const res = await fetch(`${BASE_URL}/auth/key`, {
    headers: {
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "",
      "X-Title": "PostulAI",
    },
  });

  if (!res.ok) return { valid: false, credit: null };

  const data = await res.json();
  return {
    valid: true,
    credit: {
      remaining: data.data?.limit_remaining ?? 0,
      limit: data.data?.limit ?? null,
    },
  };
}
