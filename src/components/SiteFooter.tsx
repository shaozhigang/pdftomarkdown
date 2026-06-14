import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { NAV_ITEMS } from "@/lib/landing";

export async function SiteFooter() {
  const tNav = await getTranslations("Nav");
  const tFooter = await getTranslations("Footer");

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/" className="text-slate-600 hover:text-slate-900">
            {tNav("home")}
          </Link>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.slug}
              href={`/${item.slug}`}
              className="text-slate-600 hover:text-slate-900"
            >
              {tNav(item.msgKey)}
            </Link>
          ))}
          <Link
            href="/about"
            className="text-slate-600 hover:text-slate-900"
          >
            {tFooter("about")}
          </Link>
          <Link
            href="/contact"
            className="text-slate-600 hover:text-slate-900"
          >
            {tFooter("contact")}
          </Link>
          <Link
            href="/how-to-convert-pdf-to-markdown"
            className="text-slate-600 hover:text-slate-900"
          >
            {tFooter("guide")}
          </Link>
          <Link
            href="/privacy-policy"
            className="text-slate-600 hover:text-slate-900"
          >
            {tFooter("privacyPolicy")}
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-400">{tFooter("tagline")}</p>
      </div>
    </footer>
  );
}
