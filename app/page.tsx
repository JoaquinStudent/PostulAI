import Link from "next/link";
import { LimitRulerDemo } from "@/components/limit-ruler-demo";

export default function Home() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-10 h-14 bg-surface border-b border-rule">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-stamp" />
          <span className="font-display text-xl font-bold tracking-tight">
            Calco
          </span>
        </div>
        <a href="#como-funciona" className="text-sm underline text-ink hover:text-stamp">
          Cómo funciona
        </a>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 py-16 md:py-24">
        <div className="w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left */}
          <div>
            <h1 className="font-display text-4xl md:text-[56px] font-bold leading-[1.1] tracking-[-0.02em] text-ink">
              Pega todas tus convocatorias.{" "}
              <br className="hidden md:block" />
              Sal con las respuestas escritas.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-ink-muted max-w-md">
              Calco lee las bases de cualquier postulación, filtra los
              requisitos cruzándolos con tu perfil profesional y redacta
              respuestas con la longitud y formato exactos requeridos. Sin
              desviaciones.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                href="/contexto"
                className="inline-flex items-center justify-center h-12 px-8 rounded bg-stamp text-white font-medium text-base hover:bg-stamp/90 transition-colors"
              >
                Empezar
              </Link>
              <button
                type="button"
                className="inline-flex items-center justify-center h-12 px-8 rounded border border-stamp text-stamp font-medium text-base hover:bg-stamp/5 transition-colors"
              >
                Ver ejemplo
              </button>
            </div>
          </div>

          {/* Right — LimitRuler demo */}
          <LimitRulerDemo />
        </div>
      </main>

      {/* Steps */}
      <section
        id="como-funciona"
        className="px-6 pb-16 md:pb-24"
      >
        <div className="w-full max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: "01",
              title: "Adjunta tu contexto",
              desc: "Sube tu CV, portafolio o un documento base definiendo tu perfil. Calco lo usará como la única fuente de verdad para extraer datos empíricos.",
            },
            {
              step: "02",
              title: "Pega los enlaces",
              desc: "Introduce las URLs de las convocatorias o copia el texto de las bases. El sistema analizará los requisitos obligatorios y deseables automáticamente.",
            },
            {
              step: "03",
              title: "Exporta las respuestas",
              desc: "Obtén formularios completados con redacción precisa, calibrados para cumplir con límites de caracteres y tonos formales. Listos para enviar.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-surface border border-rule rounded p-6"
            >
              <p className="font-mono text-xs uppercase tracking-[0.08em] text-stamp font-medium">
                {item.step} {item.title}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
          Todo ocurre en tu navegador. Calco no guarda nada.
        </p>
      </footer>
    </div>
  );
}
