import { NextRequest, NextResponse } from "next/server";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import dns from "node:dns/promises";
import { normalizeText } from "@/lib/extract/normalize";

const TIMEOUT_MS = 12_000;
const MAX_DOWNLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_REDIRECTS = 5;

function isPrivateHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();

  if (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "[::1]" ||
    h === "0.0.0.0" ||
    h.endsWith(".local") ||
    h.endsWith(".internal")
  ) {
    return true;
  }

  return isPrivateIp(h);
}

function isPrivateIp(ip: string): boolean {
  const PRIVATE_PATTERNS = [
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^0\./,
    /^100\.(6[4-9]|[7-9]\d|1[0-2]\d)\./,  // CGNAT
    /^fc00:/i,
    /^fd/i,
    /^fe80:/i,
    /^::1$/,
    /^::$/,
  ];
  return PRIVATE_PATTERNS.some((p) => p.test(ip));
}

// Resolve hostname to IPs and reject if any resolve to private addresses
async function validateHostnameIps(hostname: string): Promise<void> {
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname) || hostname.startsWith("[")) {
    return;
  }

  const results = await Promise.allSettled([
    dns.resolve4(hostname),
    dns.resolve6(hostname),
  ]);

  let hasAddresses = false;
  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const addr of result.value) {
      hasAddresses = true;
      // Catch IPv4-mapped IPv6 like ::ffff:10.0.0.1
      const mapped = addr.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
      const ipToCheck = mapped ? mapped[1] : addr;
      if (isPrivateIp(ipToCheck)) {
        throw new Error(`DNS rebinding: ${hostname} resolves to private IP ${addr}`);
      }
    }
  }

  if (!hasAddresses) {
    const allFailed = results.every((r) => r.status === "rejected");
    if (allFailed) return; // DNS failure — fetch will fail naturally
  }
}

function isAllowedUrl(url: string): URL | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (!["http:", "https:"].includes(parsed.protocol)) return null;
  if (isPrivateHostname(parsed.hostname)) return null;
  return parsed;
}

async function safeFetch(
  url: string,
  signal: AbortSignal,
): Promise<Response> {
  let currentUrl = url;

  for (let hops = 0; hops <= MAX_REDIRECTS; hops++) {
    const parsed = isAllowedUrl(currentUrl);
    if (!parsed) {
      throw new Error("URL no permitida");
    }

    await validateHostnameIps(parsed.hostname);

    const res = await fetch(currentUrl, {
      signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Calco/1.0; +https://calco.app)",
        Accept: "text/html, application/xhtml+xml, application/pdf",
      },
      redirect: "manual",
    });

    if (res.status >= 301 && res.status <= 308) {
      const location = res.headers.get("location");
      if (!location) throw new Error("Redirect sin Location");
      // Resolve relative redirects
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }

    return res;
  }

  throw new Error("Demasiados redirects");
}

export async function POST(req: NextRequest) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { url } = body;
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL requerida" }, { status: 400 });
  }

  if (!isAllowedUrl(url)) {
    return NextResponse.json(
      { error: "URL no permitida", cause: "blocked" as const },
      { status: 403 },
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const parsed = new URL(url);
    await validateHostnameIps(parsed.hostname);

    const res = await safeFetch(url, controller.signal);

    clearTimeout(timer);

    if (res.status === 404) {
      return NextResponse.json(
        { error: "Página no encontrada", cause: "not_found" as const },
        { status: 200 },
      );
    }

    if (res.status === 403 || res.status === 401) {
      return NextResponse.json(
        { error: "Acceso bloqueado", cause: "blocked" as const },
        { status: 200 },
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: `Error HTTP ${res.status}`, cause: "network" as const },
        { status: 200 },
      );
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (
      !contentType.includes("text/html") &&
      !contentType.includes("application/xhtml") &&
      !contentType.includes("application/pdf")
    ) {
      return NextResponse.json(
        { error: "Tipo de contenido no soportado", cause: "unsupported" as const },
        { status: 200 },
      );
    }

    const contentLength = Number(res.headers.get("content-length") ?? 0);
    if (contentLength > MAX_DOWNLOAD_BYTES) {
      return NextResponse.json(
        { error: "Archivo demasiado grande", cause: "unsupported" as const },
        { status: 200 },
      );
    }

    if (contentType.includes("application/pdf")) {
      return NextResponse.json(
        { error: "PDF detectado — usar extracción local", cause: "unsupported" as const, isPdf: true },
        { status: 200 },
      );
    }

    const html = await res.text();

    if (html.length > MAX_DOWNLOAD_BYTES) {
      return NextResponse.json(
        { error: "Contenido demasiado grande", cause: "unsupported" as const },
        { status: 200 },
      );
    }

    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article?.textContent || article.textContent.trim().length < 50) {
      return NextResponse.json(
        { error: "No se encontró texto útil en la página", cause: "empty" as const },
        { status: 200 },
      );
    }

    const text = normalizeText(article.textContent);
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const domain = new URL(url).hostname.replace(/^www\./, "");

    return NextResponse.json({
      title: article.title || null,
      text,
      wordCount,
      domain,
    });
  } catch (err) {
    clearTimeout(timer);

    if (err instanceof Error && err.message === "URL no permitida") {
      return NextResponse.json(
        { error: "URL no permitida", cause: "blocked" as const },
        { status: 403 },
      );
    }

    if (err instanceof DOMException && err.name === "AbortError") {
      return NextResponse.json(
        { error: "Tiempo de espera agotado", cause: "timeout" as const },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { error: "Error de red", cause: "network" as const },
      { status: 200 },
    );
  }
}
