import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Calco",
  description:
    "Pega tus convocatorias, adjunta tu contexto y sal con las respuestas escritas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}
