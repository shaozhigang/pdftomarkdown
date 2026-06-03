import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { NAV_ITEMS } from "@/lib/landing";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export async function SiteHeader() {
  const t = await getTranslations("Nav");

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-brand text-sm text-white">
            M
          </span>
          <span>PDF&nbsp;to&nbsp;Markdown</span>
        </Link>
        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-1 text-sm text-slate-600 sm:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.slug}
                href={`/${item.slug}`}
                className="rounded-md px-2.5 py-1.5 hover:bg-slate-100 hover:text-slate-900"
              >
                {t(item.msgKey)}
              </Link>
            ))}
          </nav>
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
