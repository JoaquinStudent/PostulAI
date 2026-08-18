"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { LimitRulerDemo } from "@/components/limit-ruler-demo";
import {
  FileText,
  Link2,
  PenTool,
  Shield,
  Lock,
  Trash2,
  Eye,
  ArrowRight,
  Target,
  Sparkles,
  Ruler,
  Search,
  Lightbulb,
  BarChart3,
  Mic,
  MessageCircle,
  FolderGit2,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleToggle } from "@/components/locale-toggle";
import { useT } from "@/lib/i18n";

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.2, 0, 0, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl border border-rule/20 bg-surface/50 backdrop-blur-xl shadow-[0_2px_24px_rgba(0,0,0,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const t = useT();
  return (
    <div className="flex flex-col min-h-full overflow-x-hidden">
      {/* ─── NAV ─── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 xl:px-16 py-2 glass border-b border-rule/20">
        <div className="flex items-center">
          <img src="/logo.svg" alt="PostulAI" className="h-10" />
        </div>
        <nav className="hidden md:flex items-center gap-6 xl:gap-8">
          {[
            ["#como-funciona", t("Cómo funciona")],
            ["#features", t("Funciones")],
            ["#seguridad", t("Seguridad")],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="text-sm text-ink-muted hover:text-ink transition-colors duration-200"
            >
              {label}
            </a>
          ))}
          <LocaleToggle />
          <ThemeToggle />
          <Link
            href="/contexto"
            className="inline-flex items-center justify-center h-9 px-5 rounded-full bg-stamp text-white text-sm font-medium hover:bg-stamp/90 active:scale-[0.97] transition-all duration-200"
          >
            {t("Empezar gratis")}
          </Link>
        </nav>
        <div className="md:hidden flex items-center gap-2">
          <LocaleToggle />
          <ThemeToggle />
          <Link
            href="/contexto"
            className="inline-flex items-center justify-center h-9 px-5 rounded-full bg-stamp text-white text-sm font-medium active:scale-[0.97]"
          >
            {t("Empezar")}
          </Link>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative px-6 md:px-10 xl:px-16 2xl:px-24 pt-20 pb-16 md:pt-28 md:pb-20 lg:pt-36 lg:pb-28 xl:pt-44 xl:pb-32 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] xl:w-[1000px] xl:h-[1000px] rounded-full bg-stamp/8 blur-[120px] lg:blur-[160px]" />
          <div className="absolute bottom-[-30%] right-[-10%] w-[500px] h-[500px] lg:w-[700px] lg:h-[700px] xl:w-[900px] xl:h-[900px] rounded-full bg-confirm/6 blur-[100px] lg:blur-[140px]" />
        </div>

        <div className="relative w-full max-w-[1400px] 2xl:max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
          {/* Left: text */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-stamp/15 bg-surface/60 backdrop-blur-sm mb-8"
            >
              <Sparkles className="size-3.5 text-stamp" />
              <span className="text-xs font-medium tracking-wide text-stamp">
                {t("IA que trabaja para ti")}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.2, 0, 0, 1] }}
              className="font-display text-[44px] md:text-[56px] lg:text-[64px] xl:text-[76px] 2xl:text-[88px] font-bold leading-[1.02] tracking-[-0.04em] text-ink"
            >
              {t("Tu copiloto")}
              <br />
              <span className="text-stamp">{t("para postulaciones.")}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.2, 0, 0, 1] }}
              className="mt-6 text-lg md:text-xl xl:text-[22px] leading-relaxed text-ink-muted max-w-xl lg:max-w-none"
            >
              {t("Analiza convocatorias, evalúa tu encaje, mejora tu CV o portafolio, prepara tu pitch y redacta respuestas con evidencia real.")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.2, 0, 0, 1] }}
              className="mt-10 flex flex-col sm:flex-row lg:justify-start justify-center gap-3"
            >
              <Link
                href="/contexto"
                className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-full bg-stamp text-white font-medium text-base hover:bg-stamp/90 active:scale-[0.97] transition-all duration-200 shadow-[0_4px_20px_rgba(0,113,227,0.3)]"
              >
                {t("Empezar ahora")}
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center h-14 px-10 rounded-full border border-rule/40 bg-surface/60 backdrop-blur-sm text-ink font-medium text-base hover:bg-surface/80 active:scale-[0.97] transition-all duration-200"
              >
                {t("Ver cómo funciona")}
              </a>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-5 text-xs text-ink-muted/60 tracking-wide"
            >
              {t("Sin registro · Sin servidor · Tu clave API, tu control")}
            </motion.p>
          </div>

          {/* Right: demo + stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.2, 0, 0, 1] }}
            className="space-y-5"
          >
            <GlassCard className="p-1.5 overflow-hidden">
              <div className="rounded-[14px] overflow-hidden bg-paper/80">
                <LimitRulerDemo />
              </div>
            </GlassCard>

            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "85%", label: t("Menos tiempo"), sub: "6 min vs 40 min" },
                { value: "STAR", label: t("Método estándar"), sub: t("Situación + Resultado") },
                { value: "100%", label: t("Privacidad"), sub: t("Todo en tu navegador") },
              ].map((stat) => (
                <GlassCard key={stat.label} className="p-4 xl:p-5 text-center">
                  <p className="font-display text-xl xl:text-2xl font-bold text-stamp">
                    {stat.value}
                  </p>
                  <p className="text-xs font-medium text-ink mt-1">{stat.label}</p>
                  <p className="text-[11px] text-ink-muted mt-0.5">{stat.sub}</p>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF ─── */}
      <FadeIn>
        <div className="mx-6 md:mx-10 xl:mx-16 2xl:mx-24">
          <GlassCard className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-6 xl:px-10 py-5 xl:py-6">
            <div className="flex flex-wrap items-center justify-center gap-x-10 xl:gap-x-16 gap-y-3">
              {[
                "Hackathons",
                "Becas",
                "Aceleradoras",
                "Voluntariados",
                "Empleos",
                "Eventos",
              ].map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-confirm" />
                  <span className="text-sm font-medium text-ink/80">{t(type)}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </FadeIn>

      {/* ─── HOW IT WORKS ─── */}
      <section id="como-funciona" className="px-6 md:px-10 xl:px-16 2xl:px-24 py-24 md:py-36 lg:py-44">
        <div className="w-full max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
          <FadeIn className="text-center mb-16 xl:mb-20">
            <p className="text-sm font-medium text-stamp tracking-wide mb-3">
              {t("CÓMO FUNCIONA")}
            </p>
            <h2 className="font-display text-[36px] md:text-[52px] lg:text-[60px] font-bold tracking-[-0.03em] leading-[1.05]">
              {t("Tres pasos. Cero fricción.")}
            </h2>
            <p className="mt-4 text-ink-muted max-w-lg mx-auto leading-relaxed lg:text-lg">
              {t("De tener 10 convocatorias abiertas a saber tu encaje, mejorar tu perfil y tener las respuestas listas.")}
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 xl:gap-6">
            {[
              {
                step: "01",
                icon: FileText,
                title: t("Sube tu perfil"),
                desc: t("Tu contexto profesional y CV o portafolio. PostulAI lo usa como única fuente de verdad — nunca inventa datos."),
              },
              {
                step: "02",
                icon: Link2,
                title: t("Agrega convocatorias"),
                desc: t("URLs, PDFs o texto pegado. Extrae requisitos, evalúa tu encaje y te dice qué mejorar en tu perfil."),
              },
              {
                step: "03",
                icon: PenTool,
                title: t("Prepara y postula"),
                desc: t("Pitch personalizado, tips de entrevista, mejoras de CV o portafolio, y respuestas listas para copiar."),
              },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 0.1}>
                <GlassCard className="p-7 xl:p-9 h-full">
                  <div className="w-12 h-12 xl:w-14 xl:h-14 rounded-2xl bg-stamp/8 flex items-center justify-center mb-5">
                    <item.icon className="size-6 xl:size-7 text-stamp" />
                  </div>
                  <p className="text-xs font-medium text-stamp tracking-wider mb-2">
                    PASO {item.step}
                  </p>
                  <h3 className="font-display text-xl xl:text-2xl font-bold tracking-[-0.01em]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm xl:text-base leading-relaxed text-ink-muted">
                    {item.desc}
                  </p>
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="px-6 md:px-10 xl:px-16 2xl:px-24 py-24 md:py-36 lg:py-44 relative">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] lg:w-[600px] lg:h-[600px] rounded-full bg-stamp/5 blur-[100px] lg:blur-[140px]" />
        </div>

        <div className="relative w-full max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
          <FadeIn className="text-center mb-16 xl:mb-20">
            <p className="text-sm font-medium text-stamp tracking-wide mb-3">
              {t("FUNCIONES")}
            </p>
            <h2 className="font-display text-[36px] md:text-[52px] lg:text-[60px] font-bold tracking-[-0.03em] leading-[1.05]">
              {t("Más que rellenar campos")}
            </h2>
            <p className="mt-4 text-ink-muted max-w-lg mx-auto leading-relaxed lg:text-lg">
              {t("Análisis por sector, coaching de perfil y respuestas que venden tu experiencia real con precisión.")}
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6">
            {[
              {
                icon: Target,
                title: t("Análisis de encaje"),
                desc: t("Cruza tu perfil con los criterios de cada convocatoria y te dice tu porcentaje de coincidencia."),
              },
              {
                icon: FolderGit2,
                title: t("CV o portafolio"),
                desc: t("Para empleos y becas mejora tu CV. Para hackathons y aceleradoras te recomienda proyectos concretos."),
              },
              {
                icon: Mic,
                title: t("Elevator pitch"),
                desc: t("Pitch personalizado con tus datos reales, adaptado al sector. Estructura lista para practicar."),
              },
              {
                icon: MessageCircle,
                title: t("Tips de entrevista"),
                desc: t("Consejos específicos para cada convocatoria basados en tus fortalezas y gaps reales."),
              },
              {
                icon: Sparkles,
                title: t("Coaching de perfil"),
                desc: t("Certificaciones, habilidades y experiencias alcanzables que mejoran tu encaje con cada oportunidad."),
              },
              {
                icon: Ruler,
                title: t("Respuestas calibradas"),
                desc: t("Método STAR con evidencia real, ajustadas al límite exacto de cada campo. Listas para copiar."),
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={(i % 3) * 0.1}>
                <GlassCard className="p-6 xl:p-8 h-full group">
                  <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-xl bg-stamp/8 flex items-center justify-center mb-4 group-hover:bg-stamp/12 transition-colors duration-300">
                    <item.icon className="size-5 xl:size-6 text-stamp" />
                  </div>
                  <h3 className="font-display text-lg xl:text-xl font-bold tracking-[-0.01em]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm xl:text-base leading-relaxed text-ink-muted">
                    {item.desc}
                  </p>
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECURITY ─── */}
      <section id="seguridad" className="px-6 md:px-10 xl:px-16 2xl:px-24 py-24 md:py-36 lg:py-44 relative">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] lg:w-[600px] lg:h-[600px] rounded-full bg-confirm/5 blur-[100px] lg:blur-[140px]" />
        </div>

        <div className="relative w-full max-w-[1100px] 2xl:max-w-[1300px] mx-auto">
          <FadeIn className="text-center mb-16 xl:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-confirm/15 bg-confirm/5 mb-5">
              <Shield className="size-3.5 text-confirm" />
              <span className="text-xs font-medium tracking-wide text-confirm">
                {t("Privacidad por diseño")}
              </span>
            </div>
            <h2 className="font-display text-[36px] md:text-[52px] lg:text-[60px] font-bold tracking-[-0.03em] leading-[1.05]">
              {t("Tu clave API")}
              <br />
              {t("nunca toca un servidor")}
            </h2>
            <p className="mt-5 text-ink-muted max-w-lg mx-auto leading-relaxed lg:text-lg">
              {t("PostulAI es 100% cliente. Tu clave va directo de tu navegador a OpenRouter. No hay backend, no hay proxy.")}
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xl:gap-5">
            {[
              {
                icon: Eye,
                title: t("Sin cuenta ni registro"),
                desc: t("No hay base de datos de usuarios. Empiezas directamente."),
              },
              {
                icon: Lock,
                title: t("Cifrado local opcional"),
                desc: t("AES-256-GCM en tu navegador. La clave nunca sale en texto plano."),
              },
              {
                icon: Trash2,
                title: t("Sesión temporal"),
                desc: t("Al cerrar la pestaña, contexto, clave y respuestas desaparecen."),
              },
              {
                icon: Shield,
                title: t("Código abierto"),
                desc: t("Todo el código es auditable. Sin telemetría, sin tracking."),
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.08}>
                <GlassCard className="p-5 xl:p-6 flex items-start gap-4 h-full">
                  <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-xl bg-confirm/8 flex items-center justify-center shrink-0">
                    <item.icon className="size-4 xl:size-5 text-confirm" />
                  </div>
                  <div>
                    <p className="font-medium text-sm xl:text-base">{item.title}</p>
                    <p className="text-sm text-ink-muted mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-6 md:px-10 xl:px-16 2xl:px-24 py-24 md:py-36">
        <FadeIn>
          <div className="relative max-w-[1100px] 2xl:max-w-[1300px] mx-auto overflow-hidden rounded-[2rem] xl:rounded-[2.5rem] bg-gradient-to-br from-stamp via-stamp to-[#0060c0] p-12 md:p-16 xl:p-24 text-center text-white">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute top-[-30%] right-[-20%] w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] rounded-full bg-white/10 blur-[80px]" />
              <div className="absolute bottom-[-20%] left-[-10%] w-[200px] h-[200px] lg:w-[300px] lg:h-[300px] rounded-full bg-white/5 blur-[60px]" />
            </div>
            <div className="relative">
              <h2 className="font-display text-[32px] md:text-[46px] lg:text-[54px] font-bold tracking-[-0.03em] leading-[1.05]">
                {t("Mejora tu perfil.")}
                <br />
                {t("Postula con confianza.")}
              </h2>
              <p className="mt-5 text-white/60 max-w-md mx-auto leading-relaxed lg:text-lg">
                {t("PostulAI analiza, te prepara y redacta. Tú revisas y envías.")}
              </p>
              <Link
                href="/contexto"
                className="inline-flex items-center justify-center gap-2 h-14 px-10 mt-10 rounded-full bg-surface text-stamp font-medium text-base hover:bg-surface/90 active:scale-[0.97] transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
              >
                {t("Empezar ahora")}
                <ArrowRight className="size-4" />
              </Link>
              <p className="mt-4 text-xs text-white/40 tracking-wide">
                {t("Solo necesitas una clave de OpenRouter")}
              </p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="px-6 md:px-10 xl:px-16 2xl:px-24 py-10 xl:py-12 border-t border-rule/20">
        <div className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="PostulAI" className="h-10" />
            <span className="text-ink-muted text-xs">
              {t("— Tu copiloto de postulaciones con IA")}
            </span>
          </div>
          <p className="text-xs text-ink-muted/60 tracking-wide">
            {t("Todo ocurre en tu navegador · Nada se guarda al cerrar")}
          </p>
        </div>
      </footer>
    </div>
  );
}
