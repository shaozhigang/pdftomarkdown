import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { SPECIALIZED_MODE_LINKS } from "@/lib/examples";
import type { ConvertProfile } from "@/lib/types";

interface ExampleShowcaseProps {
  profile: ConvertProfile;
}

export async function ExampleShowcase({ profile }: ExampleShowcaseProps) {
  const t = await getTranslations("Examples");
  const steps = t.raw(`${profile}.steps`) as string[];
  const resultPreview = t(`${profile}.resultPreview`);

  return (
    <section className="mt-14">
      <h2 className="mb-6 text-xl font-semibold tracking-tight">{t("title")}</h2>

      <div className="grid gap-6 sm:grid-cols-2">
        <ol className="space-y-5">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-zinc-200 bg-zinc-50 font-mono text-xs font-medium text-brand-dark">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="pt-1 text-sm text-zinc-600">{step}</p>
            </li>
          ))}
        </ol>

        <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
          <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-100 px-4 py-2.5">
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
            </span>
            <span className="font-mono text-xs text-zinc-500">output.md</span>
            <span className="sr-only">{t("resultTitle")}</span>
          </div>
          <div className="max-h-64 overflow-auto p-4">
            <MarkdownPreview markdown={resultPreview} />
          </div>
        </div>
      </div>

      {profile === "general" && (
        <div className="mt-8">
          <h3 className="mb-3 text-base font-semibold tracking-tight text-zinc-800">
            {t("specializedTitle")}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SPECIALIZED_MODE_LINKS.map((link) => (
              <Link
                key={link.profile}
                href={`/${link.slug}`}
                className="group rounded-md border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 hover:bg-zinc-50"
              >
                <span className="font-medium text-zinc-900 group-hover:text-brand-dark">
                  {t(`cards.${link.msgKey}.title`)}
                </span>
                <p className="mt-1 text-sm text-zinc-600">
                  {t(`cards.${link.msgKey}.subtitle`)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
