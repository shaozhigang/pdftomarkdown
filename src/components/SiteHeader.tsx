import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ToolsMenu } from "@/components/ToolsMenu";

export async function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded bg-zinc-950 font-mono text-sm text-white">
            M↓
          </span>
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
