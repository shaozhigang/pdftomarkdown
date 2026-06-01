import Link from "next/link";
import { Converter } from "@/components/Converter";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  SITE_URL,
  type LandingContent,
  SECONDARY_PAGES,
} from "@/lib/landing";

export function LandingPage({ content }: { content: LandingContent }) {
  const url = content.slug ? `${SITE_URL}/${content.slug}` : SITE_URL;
  const related = SECONDARY_PAGES.filter((p) => p.slug !== content.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: content.h1,
        url,
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

        <Converter />

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
          <h2 className="mb-4 text-xl font-semibold">
            Frequently asked questions
          </h2>
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
            <h2 className="mb-4 text-xl font-semibold">Related tools</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/${p.slug}`}
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
