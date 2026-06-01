import Link from "next/link";
import { SECONDARY_PAGES } from "@/lib/landing";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/" className="text-slate-600 hover:text-slate-900">
            Home
          </Link>
          {SECONDARY_PAGES.map((p) => (
            <Link
              key={p.slug}
              href={`/${p.slug}`}
              className="text-slate-600 hover:text-slate-900"
            >
              {p.h1}
            </Link>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-400">
          PDF to Markdown · all conversions run locally in your browser, your
          files never leave your device.
        </p>
      </div>
    </footer>
  );
}
