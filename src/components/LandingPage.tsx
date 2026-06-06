import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Converter } from "@/components/Converter";
import { ExampleShowcase } from "@/components/ExampleShowcase";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { type LandingContent, type RelatedPage } from "@/lib/landing";
import { slugToProfile } from "@/lib/profiles";
import type { ConvertProfile } from "@/lib/types";

interface LandingPageProps {
  content: LandingContent;
  related: RelatedPage[];
  pageUrl: string;
}

export async function LandingPage({
  content,
  related,
  pageUrl,
}: LandingPageProps) {
  const t = await getTranslations("Landing");
  const tExamples = await getTranslations("Examples");
  const profile: ConvertProfile = slugToProfile(content.slug);
  const steps = tExamples.raw(`${profile}.steps`) as string[];
  const howToName = tExamples(`${profile}.howToName`);

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
      <main className="mx-auto max-w-3xl px-4 py-12">
        <header className="mb-8 text-center">
          <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-brand-dark">
            {content.badge}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {content.h1}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            {content.subtitle}
          </p>
        </header>

        <Converter profile={profile} />

        <ExampleShowcase profile={profile} />

        <section className="mt-14 grid gap-5 sm:grid-cols-3">
          {content.features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <h2 className="text-base font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{f.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-14">
          <h2 className="mb-4 text-xl font-semibold">{t("faqTitle")}</h2>
          <div className="space-y-3">
            {content.faqs.map((f) => (
              <details
                key={f.q}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <summary className="cursor-pointer font-medium">{f.q}</summary>
                <p className="mt-2 text-sm text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-4 text-xl font-semibold">{t("relatedTitle")}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map((p) => (
                <Link
                  key={p.slug || "home"}
                  href={p.slug ? `/${p.slug}` : "/"}
                  className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-brand/60 hover:shadow-sm"
                >
                  <span className="font-medium text-brand-dark">{p.h1}</span>
                  <p className="mt-1 text-sm text-slate-600">{p.subtitle}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
