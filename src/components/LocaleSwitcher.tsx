"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALE_LABELS } from "@/i18n/locales";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const current = LOCALE_LABELS[locale] ?? {
    short: locale.toUpperCase(),
    native: locale,
  };

  const switchLocale = (next: string) => {
    setOpen(false);
    router.replace(pathname, { locale: next });
  };

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative text-xs">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1 rounded px-1.5 py-0.5 font-medium ring-1 ring-brand text-brand transition hover:bg-indigo-50"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Select language"
      >
        <span>{current.short}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Languages"
          className="absolute right-0 z-50 mt-1 min-w-[9rem] overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg"
        >
          {routing.locales.map((l) => {
            const label = LOCALE_LABELS[l] ?? {
              short: l.toUpperCase(),
              native: l,
            };
            const selected = l === locale;

            return (
              <li key={l} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => switchLocale(l)}
                  className={`flex w-full items-center justify-between px-3 py-1.5 text-left transition ${
                    selected
                      ? "bg-indigo-50 font-medium text-brand"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span>{label.native}</span>
                  {selected && <span aria-hidden="true">✓</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
