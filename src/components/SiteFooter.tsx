import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { TOOL_LINKS } from "@/lib/landing";

export async function SiteFooter() {
  const tNav = await getTranslations("Nav");
  const tFooter = await getTranslations("Footer");

  return (
    <footer className="border-t border-black/10 bg-home-paper-2">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/" className="text-home-ink-soft hover:text-home-ink">
            {tNav("home")}
          </Link>
          {TOOL_LINKS.map((item) => (
            <Link
              key={item.slug}
              href={`/${item.slug}`}
              className="text-home-ink-soft hover:text-home-ink"
            >
              {tNav(item.msgKey)}
            </Link>
          ))}
          <Link
            href="/about"
            className="text-home-ink-soft hover:text-home-ink"
          >
            {tFooter("about")}
          </Link>
          <Link
            href="/contact"
            className="text-home-ink-soft hover:text-home-ink"
          >
            {tFooter("contact")}
          </Link>
          <Link
            href="/how-to-convert-pdf-to-markdown"
            className="text-home-ink-soft hover:text-home-ink"
          >
            {tFooter("guide")}
          </Link>
          <Link
            href="/privacy-policy"
            className="text-home-ink-soft hover:text-home-ink"
          >
            {tFooter("privacyPolicy")}
          </Link>
        </div>
        <p className="mt-4 font-mono text-xs text-home-muted">{tFooter("tagline")}</p>
      </div>
    </footer>
  );
}
