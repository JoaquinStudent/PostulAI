"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleToggle } from "@/components/locale-toggle";
import { useT } from "@/lib/i18n";
import {
  Settings,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Award,
  Briefcase,
  FileText,
  Loader2,
  Mic,
  MessageCircle,
  FolderGit2,
  ChevronDown,
  Search,
  Shield,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Download,
  Clock,
  Code,
  Globe,
  Mail,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SessionBar } from "@/components/session-bar";
import { useSession } from "@/stores/session";
import { useBatch } from "@/stores/batch";
import { complete } from "@/lib/ai/client";
import { safeguardModel } from "@/lib/ai/models";
import { buildPR09Messages, parsePR09Response } from "@/lib/prompts/pr-09";
import { buildPR10Messages, parsePR10Response } from "@/lib/prompts/pr-10";
import { getCompactSkill, CATEGORY_META } from "@/lib/prompts/sector-skills";
import { windowContext } from "@/lib/ai/context-window";
import { InterviewSim } from "@/components/interview-sim";
import { scoreAts, extractCriteriaKeywords, type AtsBreakdown } from "@/lib/ai/ats-score";
import { exportBundle } from "@/lib/export";
import type { ProfileCoach, OpportunityCategory, Opportunity } from "@/lib/types";

type Tab = "analisis" | "carta" | "preparacion" | "mejora";

// ponytail: window.print() with print stylesheet — 0 dependencies
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function downloadAnalysisPdf(
  opp: Opportunity,
  category: OpportunityCategory,
  coach: ProfileCoach | null,
  sectorSkill: ReturnType<typeof import("@/lib/prompts/sector-skills").getCompactSkill>,
  isCvSector: boolean,
) {
  const sections: string[] = [];

  sections.push(`<h1>${esc(opp.title)}</h1>`);
  sections.push(`<p class="meta">${esc([opp.organizer, opp.modality, opp.deadline, opp.prize].filter(Boolean).join(" · "))} · ${esc(category)}</p>`);

  // Fit
  sections.push(`<h2>Encaje: ${opp.fit.score}%</h2>`);
  if (opp.fit.strengths.length > 0) {
    sections.push("<h3>Fortalezas</h3><ul>" + opp.fit.strengths.map((s) => `<li><span class="strength">✓</span> ${esc(s.claim)}</li>`).join("") + "</ul>");
  }
  if (opp.fit.gaps.length > 0) {
    sections.push("<h3>Brechas</h3><ul>" + opp.fit.gaps.map((g) => `<li><span class="gap">⚠</span> ${esc(g.claim)}${g.improvement ? `<br><small>${esc(g.improvement)}</small>` : ""}</li>`).join("") + "</ul>");
  }

  // Analysis
  sections.push(`<h2>Qué buscan</h2><p>${esc(opp.brief.seeking)}</p>`);
  if (opp.brief.criteria.length > 0) {
    sections.push("<h3>Criterios</h3><ul>" + opp.brief.criteria.map((c) => `<li>${esc(c.name)}${c.weight != null ? ` (${c.weight}%)` : ""}: ${esc(c.description)}</li>`).join("") + "</ul>");
  }

  // Pitch
  sections.push(`<h2>Elevator Pitch (${sectorSkill.pitchTemplate.maxSeconds}s)</h2>`);
  if (coach?.elevatorPitch) {
    sections.push(`<blockquote>${esc(coach.elevatorPitch)}</blockquote>`);
  } else {
    sections.push(`<p><strong>Estructura:</strong> ${esc(sectorSkill.pitchTemplate.structure)}</p>`);
  }

  // Interview tips
  sections.push("<h2>Tips de entrevista</h2>");
  if (coach && coach.interviewTips.length > 0) {
    sections.push("<h3>Personalizados</h3><ol>" + coach.interviewTips.map((t) => `<li>${esc(t)}</li>`).join("") + "</ol>");
  }
  sections.push("<h3>Guía general</h3><ul>" + sectorSkill.interviewTips.map((t) => `<li><strong>${esc(t.topic)}:</strong> ${esc(t.advice)}</li>`).join("") + "</ul>");

  // Coach
  if (coach) {
    sections.push("<h2>Mejora tu perfil</h2>");
    if (coach.certifications.length > 0) {
      sections.push("<h3>Certificaciones</h3><ul>" + coach.certifications.map((c) => `<li>${esc(c)}</li>`).join("") + "</ul>");
    }
    if (coach.skills.length > 0) {
      sections.push("<h3>Habilidades a desarrollar</h3><ul>" + coach.skills.map((s) => `<li>${esc(s)}</li>`).join("") + "</ul>");
    }
    if (coach.experiences.length > 0) {
      sections.push("<h3>Experiencias sugeridas</h3><ul>" + coach.experiences.map((e) => `<li>${esc(e)}</li>`).join("") + "</ul>");
    }
    if (isCvSector && coach.cvChanges.length > 0) {
      sections.push("<h3>Cambios en tu CV</h3>" + coach.cvChanges.map((c) =>
        `<div class="cv-change"><span class="badge">${esc(c.action.toUpperCase())}</span> <strong>${esc(c.section)}</strong>${c.current ? `<br><s>${esc(c.current)}</s>` : ""}<br>${esc(c.suggested)}<br><small>${esc(c.reason)}</small></div>`
      ).join(""));
    }
    if (coach.portfolioProjects.length > 0) {
      sections.push("<h3>Proyectos recomendados</h3>" + coach.portfolioProjects.map((p) =>
        `<div class="project"><strong>${esc(p.name)}</strong><br><em>Demuestra: ${esc(p.demonstrates)}</em><br>${esc(p.description)}<br><small>Stack: ${esc(p.stack)} · ${esc(p.hours)}</small>${p.ods ? `<br><small style="color:#059669">🌍 ${esc(p.ods)}</small>` : ""}</div>`
      ).join(""));
    }
    if (coach.idealCvOutline) {
      sections.push(`<h3>${isCvSector ? "CV ideal" : "Perfil ideal"}</h3><pre>${esc(coach.idealCvOutline)}</pre>`);
    }
  }

  const scoreColor = opp.fit.score >= 70 ? "#059669" : opp.fit.score >= 40 ? "#d97706" : "#dc2626";
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(opp.title)} — PostulAI</title>
<style>
*{box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;max-width:750px;margin:0 auto;padding:2rem 1.5rem;color:#1e293b;line-height:1.7;background:#fff}
.header{background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;padding:1.5rem 2rem;border-radius:12px;margin-bottom:2rem}
.header h1{font-size:1.5rem;margin:0 0 0.25rem;color:#fff}
.header .meta{color:rgba(255,255,255,0.8);font-size:0.85rem;margin:0}
.score-badge{display:inline-flex;align-items:center;gap:0.4rem;background:rgba(255,255,255,0.2);padding:0.4rem 1rem;border-radius:20px;font-weight:700;font-size:1.1rem;margin-top:0.75rem}
.score-dot{width:10px;height:10px;border-radius:50%;background:${scoreColor}}
h2{font-size:1.15rem;margin-top:2rem;color:#1e40af;border-bottom:2px solid #dbeafe;padding-bottom:0.3rem}
h3{font-size:0.95rem;margin-top:1.25rem;color:#334155}
blockquote{border-left:4px solid #3b82f6;padding:0.75rem 1rem;background:#eff6ff;margin:0.75rem 0;font-style:italic;border-radius:0 8px 8px 0;color:#1e40af}
ul,ol{padding-left:1.5rem}li{margin:0.4rem 0}
li::marker{color:#3b82f6}
small{color:#64748b}s{color:#94a3b8;text-decoration:line-through}
.cv-change{border:1px solid #dbeafe;border-radius:10px;padding:0.85rem 1rem;margin:0.5rem 0;background:#f8fafc}
.project{border:1px solid #d1fae5;border-radius:10px;padding:0.85rem 1rem;margin:0.5rem 0;background:#f0fdf4}
.badge{display:inline-block;padding:2px 8px;border-radius:6px;font-size:0.7rem;font-weight:700;background:#dbeafe;color:#1e40af;text-transform:uppercase;letter-spacing:0.03em}
pre{white-space:pre-wrap;background:#f1f5f9;padding:1rem;border-radius:10px;font-size:0.85rem;border:1px solid #e2e8f0}
.strength{color:#059669}
.gap{color:#d97706}
footer{margin-top:3rem;padding-top:1rem;border-top:2px solid #dbeafe;color:#94a3b8;font-size:0.75rem;text-align:center}
@media print{body{margin:0;max-width:100%}.header{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<div class="header"><h1>${esc(opp.title)}</h1><p class="meta">${esc([opp.organizer, opp.modality, opp.deadline, opp.prize].filter(Boolean).join(" · "))} · ${esc(category)}</p><div class="score-badge"><span class="score-dot"></span> Encaje: ${opp.fit.score}%</div></div>
${sections.slice(1).join("\n")}
<footer>Generado con PostulAI</footer></body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.print(); };
}

function Collapse({
  title,
  icon: Icon,
  defaultOpen = false,
  badge,
  children,
}: {
  title: string;
  icon: React.ElementType;
  defaultOpen?: boolean;
  badge?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-rule/30 rounded-2xl overflow-hidden bg-surface/50">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-surface/80 transition-colors"
      >
        <Icon className="size-4 text-stamp shrink-0" />
        <span className="text-sm font-medium flex-1">{title}</span>
        {badge && (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-stamp/10 text-stamp">
            {badge}
          </span>
        )}
        <ChevronDown
          className={`size-4 text-ink-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-5 pb-5 pt-0">{children}</div>}
    </div>
  );
}

export default function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useT();
  const { connection, context } = useSession();
  const { opportunities, sources, discard, undiscard, updateBrief } = useBatch();
  const [editingBrief, setEditingBrief] = useState(false);
  const [coach, setCoach] = useState<ProfileCoach | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState<string | null>(null);
  const [letter, setLetter] = useState<string | null>(null);
  const [letterLoading, setLetterLoading] = useState(false);
  const [letterError, setLetterError] = useState<string | null>(null);
  const [letterCopied, setLetterCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("analisis");
  const [atsOpen, setAtsOpen] = useState(false);

  const opp = opportunities.find((o) => o.id === id);

  if (!opp) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-ink-muted">Convocatoria no encontrada.</p>
      </div>
    );
  }

  const oppSource = sources.find((s) => s.opportunityId === opp.id);
  const category: OpportunityCategory = oppSource?.category ?? "otro";
  const sectorSkill = getCompactSkill(category);
  const isCvSector = CATEGORY_META[category].needsCv;

  const atsBreakdown: AtsBreakdown | null = context
    ? scoreAts(context.raw, extractCriteriaKeywords(opp.brief.seeking, opp.brief.criteria.map((c) => c.name)))
    : null;

  const handleGenerateCoach = async () => {
    if (!context) return;
    setCoachLoading(true);
    setCoachError(null);
    try {
      const model = safeguardModel(connection.models.economy || "openai/gpt-4o-mini");
      const messages = buildPR09Messages(opp.brief, context.raw, context.cvRaw, category);
      const response = await complete({ model, messages, temperature: 0.2 });
      setCoach(parsePR09Response(response));
    } catch (err) {
      setCoachError(err instanceof Error ? err.message : "Error al generar recomendaciones");
    } finally {
      setCoachLoading(false);
    }
  };

  const handleGenerateLetter = async () => {
    if (!context) return;
    setLetterLoading(true);
    setLetterError(null);
    try {
      const model = safeguardModel(connection.models.economy || "openai/gpt-4o-mini");
      const skill = getCompactSkill(category);
      const windowed = windowContext(context.raw, opp.brief.seeking, opp.brief, skill.keywords);
      const messages = buildPR10Messages({
        context: windowed,
        brief: opp.brief,
        title: opp.title,
        organizer: opp.organizer,
        language: opp.language === "en" ? "en" : opp.language === "pt" ? "pt" : "es",
        category,
      });
      const response = await complete({ model, messages, temperature: 0.3 });
      const parsed = parsePR10Response(response);
      setLetter(parsed.text);
    } catch (err) {
      setLetterError(err instanceof Error ? err.message : "Error al generar carta");
    } finally {
      setLetterLoading(false);
    }
  };

  const handleCopyLetter = async () => {
    if (!letter) return;
    await navigator.clipboard.writeText(letter);
    setLetterCopied(true);
    setTimeout(() => setLetterCopied(false), 2000);
  };

  const maxWeight = Math.max(...opp.brief.criteria.map((c) => c.weight ?? 0), 1);
  const scoreColor =
    opp.fit.score >= 70 ? "text-confirm" : opp.fit.score >= 40 ? "text-marker" : "text-alert";
  const scoreBg =
    opp.fit.score >= 70 ? "bg-confirm" : opp.fit.score >= 40 ? "bg-marker" : "bg-alert";

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "analisis", label: t("Análisis"), icon: Search },
    { key: "carta", label: t("Carta"), icon: Mail },
    { key: "preparacion", label: t("Preparación"), icon: Mic },
    { key: "mejora", label: t("Mejora tu perfil"), icon: Sparkles },
  ];

  return (
    <div className="flex flex-col min-h-full">
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 md:px-10 h-14 glass border-b border-rule/30">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="PostulAI" className="h-10" />
        </Link>
        <div className="flex items-center gap-4">
          {connection.credit && (
            <span className="font-mono text-xs text-ink-muted">
              {t("Créditos restantes")}: {connection.credit.remaining.toFixed(2)}
            </span>
          )}
          <LocaleToggle />
          <ThemeToggle />
          <Link href="/ajustes" className="text-ink-muted hover:text-ink transition-colors duration-200">
            <Settings className="size-5" />
          </Link>
        </div>
      </header>
      <SessionBar />

      <main className="flex-1 px-6 py-8 md:py-12">
        <div className="mx-auto max-w-[1200px]">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
            <Link href="/lote" className="hover:text-stamp underline">{t("ANALIZAR")}</Link>
            <span>/</span>
            <span className="text-stamp">{opp.title.toUpperCase()}</span>
          </div>

          {/* Hero card — title + score side by side */}
          <div className="mt-6 flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight">
                {opp.title}
              </h1>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                {[
                  opp.organizer,
                  opp.modality,
                  opp.deadline
                    ? new Date(opp.deadline).toLocaleDateString("es", { day: "2-digit", month: "short" })
                    : null,
                  opp.prize,
                ].filter(Boolean).join(" · ")}
              </p>

              {/* Quick stats row */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-rule/30 text-xs font-medium">
                  <span className={`inline-block w-2 h-2 rounded-full ${scoreBg}`} />
                  {opp.fit.score}% encaje
                </span>
                {atsBreakdown && (
                  <button
                    onClick={() => setAtsOpen(!atsOpen)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-rule/30 text-xs font-medium hover:border-stamp/40 transition-colors"
                  >
                    <Search className="size-3 text-ink-muted" />
                    {atsBreakdown.total}% ATS
                    <ChevronDown className={`size-3 transition-transform ${atsOpen ? "rotate-180" : ""}`} />
                  </button>
                )}
                {opp.effort.questionCount && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-rule/30 text-xs font-medium">
                    <FileText className="size-3 text-ink-muted" />
                    {opp.effort.questionCount} preguntas
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stamp/8 border border-stamp/15 text-xs font-medium text-stamp capitalize">
                  {category}
                </span>
              </div>

              {/* ATS Breakdown */}
              {atsOpen && atsBreakdown && (
                <div className="mt-3 p-4 bg-surface border border-rule/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">{t("Desglose ATS")} · 0 tokens AI</h4>
                    <span className={`font-display text-lg font-bold ${atsBreakdown.total >= 70 ? "text-confirm" : atsBreakdown.total >= 40 ? "text-stamp" : "text-alert"}`}>
                      {atsBreakdown.total}%
                    </span>
                  </div>

                  {[
                    { label: t("Keywords exactos"), value: atsBreakdown.exactMatch, weight: "40%" },
                    { label: t("Match semántico"), value: atsBreakdown.semanticMatch, weight: "20%" },
                    { label: t("Verbos de acción"), value: atsBreakdown.actionVerbs, weight: "15%" },
                    { label: t("Estructura"), value: atsBreakdown.structure, weight: "10%" },
                    { label: t("Datos cuantificables"), value: atsBreakdown.quantifiable, weight: "15%" },
                  ].map((dim) => (
                    <div key={dim.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-ink-muted">{dim.label} <span className="text-ink-muted/50">({dim.weight})</span></span>
                        <span className="text-xs font-mono font-bold">{dim.value}</span>
                      </div>
                      <div className="h-1.5 bg-rule/20 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${dim.value >= 70 ? "bg-confirm" : dim.value >= 40 ? "bg-stamp" : "bg-alert"}`}
                          style={{ width: `${dim.value}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  {atsBreakdown.missingKeywords.length > 0 && (
                    <div className="pt-2 border-t border-rule/20">
                      <p className="text-xs font-medium text-alert mb-1.5">{t("Keywords faltantes")}:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {atsBreakdown.missingKeywords.slice(0, 12).map((kw) => (
                          <span key={kw} className="px-2 py-0.5 text-[10px] bg-alert/8 text-alert rounded-full border border-alert/20">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {atsBreakdown.suggestions.length > 0 && (
                    <div className="pt-2 border-t border-rule/20">
                      <ul className="space-y-1">
                        {atsBreakdown.suggestions.map((s, i) => (
                          <li key={i} className="text-xs text-ink-muted flex items-start gap-1.5">
                            <Zap className="size-3 text-stamp shrink-0 mt-0.5" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Score ring */}
            <div className="shrink-0 flex flex-col items-center gap-2">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-rule/20" />
                  <circle
                    cx="50" cy="50" r="42" fill="none" strokeWidth="6" strokeLinecap="round"
                    className={scoreColor}
                    strokeDasharray={`${opp.fit.score * 2.64} 264`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`font-display text-2xl font-bold ${scoreColor}`}>{opp.fit.score}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted">Encaje</span>
            </div>
          </div>

          {/* Strengths & Gaps — horizontal cards */}
          {(opp.fit.strengths.length > 0 || opp.fit.gaps.length > 0) && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {opp.fit.strengths.length > 0 && (
                <div className="p-4 rounded-2xl border border-confirm/20 bg-confirm/5">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="size-4 text-confirm" />
                    <span className="text-xs font-medium text-confirm uppercase tracking-wider">
                      {t("Fortalezas")} ({opp.fit.strengths.length})
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {opp.fit.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-confirm shrink-0 mt-0.5">✓</span>
                        <span>{s.claim}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {opp.fit.gaps.length > 0 && (
                <div className="p-4 rounded-2xl border border-marker/20 bg-marker/5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="size-4 text-marker" />
                    <span className="text-xs font-medium text-marker uppercase tracking-wider">
                      Brechas ({opp.fit.gaps.length})
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {opp.fit.gaps.map((g, i) => (
                      <li key={i} className="text-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-marker shrink-0 mt-0.5">–</span>
                          <span>{g.claim}</span>
                        </div>
                        {g.improvement && (
                          <p className="ml-5 mt-1 text-xs text-stamp bg-stamp/5 px-2 py-1 rounded">
                            {g.improvement}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Tab bar */}
          <div className="mt-8 flex gap-1 p-1 bg-surface border border-rule/30 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? "bg-surface shadow-sm text-ink"
                    : "text-ink-muted hover:text-ink hover:bg-surface/50"
                }`}
              >
                <tab.icon className="size-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="mt-6">
            {/* ─── TAB: ANÁLISIS ─── */}
            {activeTab === "analisis" && (
              <div className="space-y-4">
                {/* What they're looking for */}
                <Collapse title={t("Qué buscan")} icon={Search} defaultOpen>
                  <div className="flex items-center justify-end mb-2">
                    <button
                      onClick={() => setEditingBrief(!editingBrief)}
                      className="font-mono text-[11px] uppercase tracking-[0.08em] text-stamp hover:underline"
                    >
                      {editingBrief ? "GUARDAR" : "EDITAR"}
                    </button>
                  </div>
                  {editingBrief ? (
                    <textarea
                      defaultValue={opp.brief.seeking}
                      onBlur={(e) => updateBrief(opp.id, { seeking: e.target.value })}
                      className="w-full p-3 text-sm border border-rule rounded-lg bg-paper resize-y leading-relaxed"
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm text-ink leading-relaxed">{opp.brief.seeking}</p>
                  )}
                </Collapse>

                {/* Evaluation criteria */}
                {opp.brief.criteria.length > 0 && (
                  <Collapse
                    title={t("Criterios de evaluación")}
                    icon={Zap}
                    badge={`${opp.brief.criteria.length}`}
                    defaultOpen
                  >
                    <div className="space-y-3">
                      {opp.brief.criteria.map((criterion, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium truncate">{criterion.name}</span>
                              {criterion.weight != null && (
                                <span className="font-mono text-xs text-ink-muted shrink-0 ml-2">{criterion.weight}%</span>
                              )}
                            </div>
                            {criterion.weight != null && (
                              <div className="h-2 bg-rule/15 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-stamp rounded-full transition-all duration-500"
                                  style={{ width: `${(criterion.weight / maxWeight) * 100}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Collapse>
                )}

                {/* Tone */}
                {opp.brief.tone.length > 0 && (
                  <Collapse title={t("Tono esperado")} icon={MessageCircle}>
                    <div className="flex gap-2 flex-wrap">
                      {opp.brief.tone.map((t, i) => (
                        <span key={i} className="px-3 py-1.5 text-xs font-medium border border-rule/40 rounded-full bg-surface/60">
                          {t}
                        </span>
                      ))}
                    </div>
                  </Collapse>
                )}

                {/* Red flags */}
                {opp.brief.redFlags.length > 0 && (
                  <Collapse title={t("Señales de alerta")} icon={Shield} badge={`${opp.brief.redFlags.length}`}>
                    <ul className="space-y-2">
                      {opp.brief.redFlags.map((flag, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-alert shrink-0 mt-0.5">■</span>
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </Collapse>
                )}

                {opp.brief.confidence === "low" && (
                  <p className="text-xs text-marker bg-marker/10 px-4 py-2.5 rounded-xl">
                    Los datos de la convocatoria son incompletos — el análisis puede ser aproximado.
                  </p>
                )}
              </div>
            )}

            {/* ─── TAB: CARTA ─── */}
            {activeTab === "carta" && (
              <div className="space-y-4">
                {letter ? (
                  <div className="bg-surface border border-rule/40 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display text-lg font-semibold">{t("Carta de presentación")}</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopyLetter} className="gap-1.5">
                          {letterCopied ? <CheckCircle2 className="size-3.5" /> : <Copy className="size-3.5" />}
                          {letterCopied ? t("Copiado") : t("Copiar")}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setLetter(null)}>
                          {t("Regenerar")}
                        </Button>
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none text-ink whitespace-pre-wrap leading-relaxed">
                      {letter}
                    </div>
                    <p className="mt-4 text-xs text-ink-muted font-mono">
                      {letter.split(/\s+/).length} {t("palabras")}
                    </p>
                  </div>
                ) : (
                  <div className="bg-surface border border-rule/40 rounded-xl p-8 text-center">
                    <Mail className="size-8 text-ink-muted mx-auto mb-3" />
                    <h3 className="font-display text-lg font-semibold">{t("Carta de presentación")}</h3>
                    <p className="mt-2 text-sm text-ink-muted max-w-md mx-auto">
                      {t("Genera una carta personalizada para esta convocatoria basada en tu contexto y el análisis de encaje.")}
                    </p>
                    {letterError && (
                      <p className="mt-3 text-sm text-alert">{letterError}</p>
                    )}
                    <Button
                      className="mt-4"
                      disabled={letterLoading || !context}
                      onClick={handleGenerateLetter}
                    >
                      {letterLoading ? (
                        <><Loader2 className="size-4 animate-spin mr-2" />{t("Generando...")}</>
                      ) : (
                        <>{t("Generar carta")} (~$0.001)</>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB: PREPARACIÓN ─── */}
            {activeTab === "preparacion" && (
              <div className="space-y-4">
                {/* Elevator Pitch */}
                <Collapse title={`Elevator pitch (${sectorSkill.pitchTemplate.maxSeconds}s)`} icon={Mic} defaultOpen>
                  {coach?.elevatorPitch ? (
                    <div className="p-4 bg-stamp/5 border border-stamp/15 rounded-xl">
                      <p className="text-sm leading-relaxed italic">&ldquo;{coach.elevatorPitch}&rdquo;</p>
                      <p className="mt-3 text-[11px] text-ink-muted">
                        Personalizado con tu perfil · {sectorSkill.pitchTemplate.maxSeconds}s max
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <p className="text-[11px] font-medium text-ink-muted uppercase tracking-wider mb-2">Estructura</p>
                        <p className="text-sm leading-relaxed p-3 bg-surface/60 rounded-lg border border-rule/20">
                          {sectorSkill.pitchTemplate.structure}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-ink-muted uppercase tracking-wider mb-2">Ejemplo</p>
                        <p className="text-sm leading-relaxed italic text-ink/70 p-3 bg-surface/60 rounded-lg border border-rule/20">
                          &ldquo;{sectorSkill.pitchTemplate.example}&rdquo;
                        </p>
                      </div>
                      <p className="text-xs text-ink-muted">
                        Genera tu pitch personalizado en la pestaña &quot;Mejora tu perfil&quot;.
                      </p>
                    </div>
                  )}
                </Collapse>

                {/* Interview Tips — personalized first */}
                {coach && coach.interviewTips.length > 0 && (
                  <Collapse
                    title={t("Tips para esta convocatoria")}
                    icon={Sparkles}
                    badge="Personalizado"
                    defaultOpen
                  >
                    <ul className="space-y-2">
                      {coach.interviewTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm p-3 bg-stamp/5 rounded-xl">
                          <span className="text-stamp shrink-0 mt-0.5 font-bold">{i + 1}</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </Collapse>
                )}

                {/* Interview simulator */}
                <Collapse
                  title={t("Simulador de entrevista")}
                  icon={MessageCircle}
                  badge={`${sectorSkill.interviewTips.length} ${t("preguntas")}`}
                >
                  {context ? (
                    <InterviewSim
                      tips={sectorSkill.interviewTips}
                      brief={opp.brief}
                      contextRaw={context.raw}
                      category={category}
                      model={connection.models.economy || "openai/gpt-4o-mini"}
                    />
                  ) : (
                    <div className="space-y-2">
                      {sectorSkill.interviewTips.map((tip, i) => (
                        <div key={i} className="p-3 bg-surface/60 border border-rule/20 rounded-xl">
                          <p className="text-xs font-semibold text-stamp mb-1">{tip.topic}</p>
                          <p className="text-sm text-ink-muted leading-relaxed">{tip.advice}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Collapse>

                {!coach && (
                  <div className="flex items-center gap-3 p-4 bg-stamp/5 border border-stamp/15 rounded-xl">
                    <Sparkles className="size-5 text-stamp shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Tips personalizados disponibles</p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Analiza tu perfil en la pestaña &quot;Mejora tu perfil&quot; para recibir consejos específicos para esta convocatoria.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB: MEJORA TU PERFIL ─── */}
            {activeTab === "mejora" && (
              <div className="space-y-4">
                {/* CTA to generate */}
                {!coach && !coachLoading && (
                  <div className="text-center p-8 border-2 border-dashed border-rule/40 rounded-2xl">
                    <Sparkles className="size-8 text-stamp mx-auto mb-3" />
                    <h3 className="font-display text-lg font-bold">
                      Analiza tu perfil para esta convocatoria
                    </h3>
                    <p className="mt-2 text-sm text-ink-muted max-w-md mx-auto">
                      Obtén pitch personalizado, tips de entrevista, y recomendaciones de{" "}
                      {isCvSector ? "CV y certificaciones" : "portafolio y proyectos"}{" "}
                      {context?.cvRaw ? "basadas en tu CV" : ""}.
                    </p>

                    {isCvSector && !context?.cvRaw && (
                      <p className="mt-3 text-xs text-marker bg-marker/10 px-3 py-2 rounded-lg inline-block">
                        Sube tu CV en Contexto para recomendaciones más precisas
                      </p>
                    )}

                    <Button onClick={handleGenerateCoach} className="mt-5 gap-2">
                      <Sparkles className="size-4" />
                      Analizar mi perfil
                    </Button>
                  </div>
                )}

                {coachLoading && (
                  <div className="text-center p-8 border border-rule/30 rounded-2xl">
                    <Loader2 className="size-6 animate-spin text-stamp mx-auto mb-3" />
                    <p className="text-sm text-ink-muted">
                      Analizando tu perfil{context?.cvRaw ? " y CV" : ""} contra esta convocatoria...
                    </p>
                  </div>
                )}

                {coachError && (
                  <div className="p-4 bg-alert/8 border border-alert/20 rounded-xl text-sm text-alert">
                    {coachError}
                  </div>
                )}

                {coach && (
                  <>
                    {/* Elevator pitch result */}
                    {coach.elevatorPitch && (
                      <Collapse title={t("Tu elevator pitch")} icon={Mic} defaultOpen>
                        <div className="p-4 bg-stamp/5 border border-stamp/15 rounded-xl">
                          <p className="text-sm leading-relaxed italic">&ldquo;{coach.elevatorPitch}&rdquo;</p>
                          <p className="mt-2 text-[11px] text-ink-muted">
                            {sectorSkill.pitchTemplate.maxSeconds}s max · Basado en tu perfil real
                          </p>
                        </div>
                      </Collapse>
                    )}

                    {/* Certifications */}
                    {coach.certifications.length > 0 && (
                      <Collapse
                        title={t("Certificaciones recomendadas")}
                        icon={Award}
                        badge={`${coach.certifications.length}`}
                        defaultOpen
                      >
                        <ul className="space-y-2">
                          {coach.certifications.map((c, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm p-3 bg-surface/60 rounded-xl border border-rule/20">
                              <Award className="size-4 text-stamp shrink-0 mt-0.5" />
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </Collapse>
                    )}

                    {/* Skills */}
                    {coach.skills.length > 0 && (
                      <Collapse
                        title={t("Habilidades a desarrollar")}
                        icon={BookOpen}
                        badge={`${coach.skills.length}`}
                      >
                        <ul className="space-y-2">
                          {coach.skills.map((s, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm p-3 bg-surface/60 rounded-xl border border-rule/20">
                              <BookOpen className="size-4 text-stamp shrink-0 mt-0.5" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </Collapse>
                    )}

                    {/* Experiences */}
                    {coach.experiences.length > 0 && (
                      <Collapse
                        title={t("Experiencias sugeridas")}
                        icon={Briefcase}
                        badge={`${coach.experiences.length}`}
                      >
                        <ul className="space-y-2">
                          {coach.experiences.map((e, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm p-3 bg-surface/60 rounded-xl border border-rule/20">
                              <Briefcase className="size-4 text-stamp shrink-0 mt-0.5" />
                              <span>{e}</span>
                            </li>
                          ))}
                        </ul>
                      </Collapse>
                    )}

                    {/* CV Changes (CV-first only) */}
                    {isCvSector && coach.cvChanges.length > 0 && (
                      <Collapse
                        title={t("Cambios en tu CV")}
                        icon={FileText}
                        badge={`${coach.cvChanges.length}`}
                        defaultOpen
                      >
                        <div className="space-y-3">
                          {coach.cvChanges.map((change, i) => (
                            <div key={i} className="p-4 bg-surface/60 border border-rule/20 rounded-xl">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                                  change.action === "add"
                                    ? "bg-confirm/10 text-confirm"
                                    : change.action === "remove"
                                      ? "bg-alert/10 text-alert"
                                      : "bg-stamp/10 text-stamp"
                                }`}>
                                  {change.action === "add" ? "AGREGAR" : change.action === "remove" ? "QUITAR" : "MODIFICAR"}
                                </span>
                                <span className="text-xs font-medium text-ink-muted">{change.section}</span>
                              </div>
                              {change.current && (
                                <p className="text-xs text-ink-muted line-through mb-1">{change.current}</p>
                              )}
                              <p className="text-sm">{change.suggested}</p>
                              <p className="text-xs text-ink-muted mt-2">{change.reason}</p>
                            </div>
                          ))}
                        </div>
                      </Collapse>
                    )}

                    {/* Portfolio Projects (portfolio-first only) */}
                    {coach.portfolioProjects.length > 0 && (
                      <Collapse
                        title={t("Proyectos recomendados")}
                        icon={FolderGit2}
                        badge={`${coach.portfolioProjects.length}`}
                        defaultOpen
                      >
                        <div className="space-y-3">
                          {coach.portfolioProjects.map((p, i) => (
                            <div key={i} className="p-4 bg-surface/60 border border-rule/20 rounded-xl">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <FolderGit2 className="size-4 text-stamp shrink-0" />
                                  <h4 className="text-sm font-semibold">{p.name}</h4>
                                </div>
                                <span className="flex items-center gap-1 text-[11px] text-ink-muted shrink-0">
                                  <Clock className="size-3" />
                                  {p.hours}
                                </span>
                              </div>
                              <p className="mt-1 ml-6 text-xs text-stamp font-medium">Demuestra: {p.demonstrates}</p>
                              <p className="mt-2 ml-6 text-sm text-ink-muted leading-relaxed">{p.description}</p>
                              <div className="mt-2 ml-6 flex items-center gap-1.5">
                                <Code className="size-3 text-ink-muted" />
                                <span className="text-xs text-ink-muted">{p.stack}</span>
                              </div>
                              {p.ods && (
                                <div className="mt-1.5 ml-6 flex items-center gap-1.5">
                                  <Globe className="size-3 text-emerald-600" />
                                  <span className="text-xs text-emerald-700 font-medium">{p.ods}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </Collapse>
                    )}

                    {/* Ideal CV / Profile */}
                    {coach.idealCvOutline && (
                      <Collapse
                        title={isCvSector ? (context?.cvRaw ? "CV ideal para este puesto" : "Qué debería tener tu CV") : "Perfil ideal para esta convocatoria"}
                        icon={FileText}
                      >
                        <div className="p-4 bg-stamp/5 border border-stamp/15 rounded-xl text-sm leading-relaxed whitespace-pre-line">
                          {coach.idealCvOutline}
                        </div>
                      </Collapse>
                    )}

                    {/* LinkedIn */}
                    {(coach.linkedinHeadline || coach.linkedinSummary) && (
                      <Collapse title={t("LinkedIn optimizado")} icon={Globe}>
                        <div className="space-y-3">
                          {coach.linkedinHeadline && (
                            <div className="p-4 bg-surface/60 border border-rule/20 rounded-xl">
                              <p className="text-xs font-medium text-ink-muted mb-1">{t("Titular")} (120 chars)</p>
                              <p className="text-sm font-semibold">{coach.linkedinHeadline}</p>
                            </div>
                          )}
                          {coach.linkedinSummary && (
                            <div className="p-4 bg-surface/60 border border-rule/20 rounded-xl">
                              <p className="text-xs font-medium text-ink-muted mb-1">{t("Resumen")}</p>
                              <p className="text-sm leading-relaxed whitespace-pre-line">{coach.linkedinSummary}</p>
                            </div>
                          )}
                        </div>
                      </Collapse>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Bottom actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href={`/lote/${id}/preparar`} className="flex-1">
              <Button className="w-full h-12 text-base">{t("RESPONDER FORMULARIO")}</Button>
            </Link>
            <button
              onClick={() => downloadAnalysisPdf(opp, category, coach, sectorSkill, isCvSector)}
              className="h-12 px-6 text-sm font-medium text-stamp border border-stamp/30 rounded-lg hover:bg-stamp/5 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="size-4" />
              PDF
            </button>
            <button
              onClick={() => exportBundle({ opp, coach, letter, ats: atsBreakdown })}
              className="h-12 px-6 text-sm font-medium text-ink-muted border border-rule/30 rounded-lg hover:bg-surface transition-colors flex items-center justify-center gap-2"
            >
              <Download className="size-4" />
              ZIP
            </button>
            <button
              onClick={() => (opp.discarded ? undiscard(opp.id) : discard(opp.id))}
              className="h-12 px-6 text-sm text-ink-muted border border-rule/30 rounded-lg hover:bg-surface transition-colors"
            >
              {opp.discarded ? "Restaurar" : "Descartar"}
            </button>
          </div>

          {/* Back nav */}
          <div className="mt-8">
            <Link href="/lote" className="inline-flex items-center gap-2 text-sm text-stamp hover:text-stamp/80">
              <ArrowLeft className="size-4" />
              Volver a convocatorias
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
