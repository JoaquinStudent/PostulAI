"use client";

import { useI18n, LOCALE_LABELS, type Locale } from "@/lib/i18n";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function LocaleToggle() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-rule/20 transition-colors text-sm"
        aria-label="Language"
      >
        <Globe className="size-4" />
        <span className="hidden sm:inline uppercase text-xs font-medium">
          {locale}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-surface border border-rule/40 rounded-xl shadow-lg py-1 min-w-[140px] z-50">
          {(Object.keys(LOCALE_LABELS) as Locale[]).map((l) => (
            <button
              key={l}
              onClick={() => {
                setLocale(l);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-rule/10 transition-colors ${
                l === locale ? "text-stamp font-medium" : "text-ink"
              }`}
            >
              {LOCALE_LABELS[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
