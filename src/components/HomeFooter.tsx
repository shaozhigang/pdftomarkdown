import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { TOOL_LINKS } from "@/lib/landing";
import { BrandMark } from "@/components/home/BrandMark";

export async function HomeFooter() {
  const t = await getTranslations("Home");
  const tNav = await getTranslations("Nav");
  const tFooter = await getTranslations("Footer");

  const legal = [
    { href: "/about" as const, label: tFooter("about") },
    { href: "/contact" as const, label: tFooter("contact") },
    { href: "/how-to-convert-pdf-to-markdown" as const, label: tFooter("guide") },
    { href: "/privacy-policy" as const, label: tFooter("privacyPolicy") },
  ];

  return (
    <footer className="home-footer">
      <div className="home-wrap flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="home-logo">
            <BrandMark />
            <span>PDF to Markdown</span>
          </Link>
          <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label={t("footer.aria")}>
            <a href="#problem">{t("nav.problem")}</a>
            <a href="#markdown">{t("nav.markdown")}</a>
            <a href="#how">{t("nav.how")}</a>
            <a href="#use-cases">{t("nav.use")}</a>
            <a href="#faq">{t("nav.faq")}</a>
            <a href="#convert">{t("footer.convert")}</a>
          </nav>
        </div>
        <p className="m-0 text-[#7d7a73]">{t("footer.line")}</p>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label={tNav("tools")}>
          <Link href="/">{tNav("home")}</Link>
          {TOOL_LINKS.map((item) => (
            <Link key={item.slug} href={`/${item.slug}`}>
              {tNav(item.msgKey)}
            </Link>
          ))}
          {legal.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="m-0 font-home-mono text-xs text-[#7d7a73]">{tFooter("tagline")}</p>
      </div>
    </footer>
  );
}
