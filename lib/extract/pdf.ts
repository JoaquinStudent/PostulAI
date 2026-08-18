import { normalizeText } from "./normalize";

export type PdfResult =
  | { ok: true; text: string; wordCount: number; pageCount: number }
  | { ok: false; cause: "no_text_layer" | "empty" }

export async function extractPdfText(file: File): Promise<PdfResult> {
  const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");

  // ponytail: use bundled worker via CDN-free local path
  GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;

  const pages: string[] = [];
  let totalChars = 0;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(pageText);
    totalChars += pageText.replace(/\s/g, "").length;
  }

  // ponytail: if less than 100 non-whitespace chars total, it's a scanned PDF
  if (totalChars < 100) {
    return { ok: false, cause: "no_text_layer" };
  }

  const text = normalizeText(pages.join("\n\n"));
  if (text.length < 50) {
    return { ok: false, cause: "empty" };
  }

  return {
    ok: true,
    text,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    pageCount: pdf.numPages,
  };
}
