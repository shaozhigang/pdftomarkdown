import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ToolsMenu } from "@/components/ToolsMenu";
import { BrandMark } from "@/components/home/BrandMark";

export async function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-home-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-home-ink"
        >
          <BrandMark className="h-7 w-7" />
          <span>PDF&nbsp;to&nbsp;Markdown</span>
        </Link>
        <div className="flex items-center gap-2">
          <ToolsMenu />
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
