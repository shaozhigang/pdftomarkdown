"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ToolsMenu } from "@/components/ToolsMenu";
import { BrandMark } from "@/components/home/BrandMark";

const NAV = [
  { href: "#problem", key: "nav.problem" as const },
  { href: "#markdown", key: "nav.markdown" as const },
  { href: "#how", key: "nav.how" as const },
  { href: "#use-cases", key: "nav.use" as const },
  { href: "#faq", key: "nav.faq" as const },
];

export function HomeHeader() {
  const t = useTranslations("Home");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="home-header">
      <div className="home-header-inner">
        <Link href="/" className="home-logo" aria-label="PDF to Markdown home">
          <BrandMark />
          <span>PDF to Markdown</span>
        </Link>

        <nav
          id="home-nav-links"
          className={`home-nav-links ${open ? "is-open" : ""}`}
        >
          {NAV.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {t(item.key)}
            </a>
          ))}
          <a
            className="home-btn home-btn-light home-nav-cta"
            href="#convert"
            onClick={() => setOpen(false)}
          >
            {t("nav.convert")}
          </a>
        </nav>

        <div className="home-header-actions ml-auto flex items-center gap-2 md:ml-2">
          <ToolsMenu tone="dark" />
          <LocaleSwitcher tone="dark" />
          <a className="home-btn home-btn-light home-nav-cta home-header-cta" href="#convert">
            {t("nav.convert")}
          </a>
        </div>

        <button
          type="button"
          className="home-nav-toggle"
          aria-expanded={open}
          aria-controls="home-nav-links"
          aria-label={open ? t("nav.close") : t("nav.open")}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
