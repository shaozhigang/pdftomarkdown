import Link from "next/link";
import { SECONDARY_PAGES } from "@/lib/landing";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-brand text-sm text-white">
            M
          </span>
          <span>PDF&nbsp;to&nbsp;Markdown</span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm text-slate-600 sm:flex">
          {SECONDARY_PAGES.map((p) => (
            <Link
              key={p.slug}
              href={`/${p.slug}`}
              className="rounded-md px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900"
            >
              {p.h1.replace(/^PDF (to )?/i, "").replace(" to Markdown", "")}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
