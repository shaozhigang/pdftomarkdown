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
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-black/10 bg-home-paper font-mono text-xs font-medium text-home-md">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="pt-1 text-sm text-home-ink-soft">{step}</p>
            </li>
          ))}
        </ol>

        <div className="overflow-hidden rounded-2xl border border-black/10 bg-home-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-black/10 bg-home-paper-2 px-4 py-2.5">
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-home-cream" />
              <span className="h-2.5 w-2.5 rounded-full bg-home-cream" />
              <span className="h-2.5 w-2.5 rounded-full bg-home-cream" />
            </span>
            <span className="font-mono text-xs text-home-muted">output.md</span>
            <span className="sr-only">{t("resultTitle")}</span>
          </div>
          <div className="max-h-64 overflow-auto p-4">
            <MarkdownPreview markdown={resultPreview} />
          </div>
        </div>
      </div>

      {profile === "general" && (
        <div className="mt-8">
          <h3 className="mb-3 text-base font-semibold tracking-tight text-home-ink">
            {t("specializedTitle")}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SPECIALIZED_MODE_LINKS.map((link) => (
              <Link
                key={link.profile}
                href={`/${link.slug}`}
                className="group rounded-2xl border border-black/10 bg-home-white p-4 shadow-sm transition hover:border-home-cream hover:bg-home-paper"
              >
                <span className="font-medium text-home-ink group-hover:text-home-md">
                  {t(`cards.${link.msgKey}.title`)}
                </span>
                <p className="mt-1 text-sm text-home-ink-soft">
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
