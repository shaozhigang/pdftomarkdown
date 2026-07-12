import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Converter } from "@/components/Converter";
import { ExampleShowcase } from "@/components/ExampleShowcase";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { type LandingContent, type RelatedPage } from "@/lib/landing";
import { slugToProfile } from "@/lib/profiles";
import type { ConvertProfile } from "@/lib/types";

export interface ComparisonTable {
  title: string;
  /** Column headers; the first is the feature/row label column. */
  columns: string[];
  /** Each row: [featureLabel, cell, cell, …]. Use "✓" / "✗" for icons. */
  rows: string[][];
}

interface LandingPageProps {
  content: LandingContent;
  related: RelatedPage[];
  pageUrl: string;
  /** Override the default PDF→Markdown converter with a custom tool. */
  tool?: ReactNode;
  /** Override the HowTo structured data (defaults to the Examples profile). */
  howTo?: { name: string; steps: string[] };
  /** Show the PDF example showcase (default true). Disable for non-PDF tools. */
  showExamples?: boolean;
  /** Optional feature-comparison table rendered before the FAQ. */
  comparison?: ComparisonTable;
  /** Optional "who uses it" section rendered after the feature cards. */
  audience?: { title: string; items: { title: string; body: string }[] };
}

export async function LandingPage({
  content,
  related,
  pageUrl,
  tool,
  howTo,
  showExamples = true,
  comparison,
  audience,
}: LandingPageProps) {
  const t = await getTranslations("Landing");
  const profile: ConvertProfile = slugToProfile(content.slug);

  let steps: string[];
  let howToName: string;
  if (howTo) {
    steps = howTo.steps;
    howToName = howTo.name;
  } else {
    const tExamples = await getTranslations("Examples");
    steps = tExamples.raw(`${profile}.steps`) as string[];
    howToName = tExamples(`${profile}.howToName`);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: content.h1,
        url: pageUrl,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "FAQPage",
        mainEntity: content.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "HowTo",
        name: howToName,
        step: steps.map((text, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          text,
        })),
      },
    ],
  };

  return (
    <>
      <SiteHeader />
      <main className="relative px-4 py-12">
        <div
          aria-hidden="true"
          className="hero-dots pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        />
        <header className="relative mx-auto mb-10 max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-sm bg-brand" />
            {content.badge}
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
            {content.h1}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-zinc-600">
            {content.subtitle}
          </p>
        </header>

        <div className="relative mx-auto max-w-5xl">
          {tool ?? <Converter profile={profile} />}
        </div>

        <div className="mx-auto max-w-3xl">
          {showExamples && <ExampleShowcase profile={profile} />}

          <section className="mt-14 grid gap-5 sm:grid-cols-3">
          {content.features.map((f) => (
            <div
              key={f.title}
              className="rounded-md border border-zinc-200 bg-white p-5"
            >
              <h2 className="text-base font-semibold tracking-tight">{f.title}</h2>
              <p className="mt-2 text-sm text-zinc-600">{f.body}</p>
            </div>
          ))}
        </section>

        {audience && (
          <section className="mt-14">
            <h2 className="mb-4 text-xl font-semibold tracking-tight">{audience.title}</h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {audience.items.map((a) => (
                <div key={a.title} className="rounded-md border border-zinc-200 bg-white p-5">
                  <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-700">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM22 20v-2a4 4 0 0 0-3-3.87M16 4.13A4 4 0 0 1 16 12"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold tracking-tight">{a.title}</h3>
                  <p className="mt-1 text-sm text-zinc-600">{a.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {comparison && (
          <section className="mt-14">
            <h2 className="mb-4 text-xl font-semibold tracking-tight">{comparison.title}</h2>
            <div className="overflow-x-auto rounded-md border border-zinc-200">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-zinc-50">
                    {comparison.columns.map((col, i) => (
                      <th
                        key={col}
                        className={`border-b border-zinc-200 px-4 py-3 font-semibold ${
                          i === 0 ? "text-left text-zinc-700" : "text-center"
                        } ${i === 1 ? "text-zinc-950" : "text-zinc-600"}`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.rows.map((row) => (
                    <tr key={row[0]} className="even:bg-zinc-50/50">
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className={`border-b border-zinc-100 px-4 py-3 ${
                            ci === 0
                              ? "text-left font-medium text-zinc-700"
                              : "text-center"
                          }`}
                        >
                          <ComparisonCell value={cell} highlight={ci === 1} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="mt-14">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">{t("faqTitle")}</h2>
          <div className="space-y-3">
            {content.faqs.map((f) => (
              <details
                key={f.q}
                className="faq rounded-md border border-zinc-200 bg-white p-4"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-3 font-medium">
                  {f.q}
                </summary>
                <p className="mt-2 text-sm text-zinc-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-4 text-xl font-semibold tracking-tight">{t("relatedTitle")}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map((p) => (
                <Link
                  key={p.slug || "home"}
                  href={p.slug ? `/${p.slug}` : "/"}
                  className="group rounded-md border border-zinc-200 bg-white p-4 transition hover:border-zinc-400"
                >
                  <span className="font-medium text-zinc-900 group-hover:text-brand-dark">
                    {p.h1}
                  </span>
                  <p className="mt-1 text-sm text-zinc-600">{p.subtitle}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
        </div>
      </main>
      <SiteFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}

function ComparisonCell({
  value,
  highlight,
}: {
  value: string;
  highlight: boolean;
}) {
  if (value === "✓") {
    return (
      <span
        className={`inline-flex ${
          highlight ? "text-brand" : "text-teal-500"
        }`}
        aria-label="Yes"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="m5 13 4 4L19 7"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (value === "✗") {
    return (
      <span className="inline-flex text-zinc-300" aria-label="No">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 6l12 12M18 6 6 18"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }
  return <span className="text-zinc-500">{value}</span>;
}
