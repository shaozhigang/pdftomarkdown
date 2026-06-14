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
      <h2 className="mb-6 text-xl font-semibold">{t("title")}</h2>

      <div className="grid gap-6 sm:grid-cols-2">
        <ol className="space-y-4">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
                {i + 1}
              </span>
              <p className="pt-0.5 text-sm text-slate-600">{step}</p>
            </li>
          ))}
        </ol>

        <div className="rounded-xl border border-slate-200 bg-slate-50">
          <div className="border-b border-slate-200 px-4 py-2.5">
            <span className="text-sm font-medium text-slate-700">
              {t("resultTitle")}
            </span>
          </div>
          <div className="max-h-64 overflow-auto p-4">
            <MarkdownPreview markdown={resultPreview} />
          </div>
        </div>
      </div>

      {profile === "general" && (
        <div className="mt-8">
          <h3 className="mb-3 text-base font-semibold text-slate-800">
            {t("specializedTitle")}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SPECIALIZED_MODE_LINKS.map((link) => (
              <Link
                key={link.profile}
                href={`/${link.slug}`}
                className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-brand/60 hover:shadow-sm"
              >
                <span className="font-medium text-brand-dark">
                  {t(`cards.${link.msgKey}.title`)}
                </span>
                <p className="mt-1 text-sm text-slate-600">
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
