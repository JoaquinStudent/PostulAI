const MAX_SIZE = 500 * 1024; // 500 KB

type ValidationResult =
  | { ok: true; text: string }
  | { ok: false; error: string }

export function validateContextFile(file: File): Promise<ValidationResult> {
  if (file.size === 0) {
    return Promise.resolve({ ok: false, error: "El archivo está vacío." });
  }
  if (file.size > MAX_SIZE) {
    return Promise.resolve({
      ok: false,
      error: `El archivo excede el límite de 500 KB (${(file.size / 1024).toFixed(0)} KB).`,
    });
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext !== "md" && ext !== "txt") {
    return Promise.resolve({
      ok: false,
      error: "Solo se aceptan archivos .md o .txt.",
    });
  }

  return file.text().then((text) => {
    // ponytail: null byte check catches binary files disguised as .txt
    if (text.includes("\0")) {
      return { ok: false as const, error: "El archivo parece ser binario, no texto." };
    }
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      return { ok: false as const, error: "El archivo no tiene contenido." };
    }
    return { ok: true as const, text: trimmed };
  });
}
