import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE_URL } from "@/lib/landing";

interface AboutSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export async function AboutPage() {
  const t = await getTranslations("About");
  const sections = t.raw("sections") as AboutSection[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PDF to Markdown",
    url: SITE_URL,
    description: t("metaDescription"),
    email: "privacy@pdftomarkdown.run",
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("h1")}
          </h1>
          <p className="mt-4 text-slate-600">{t("intro")}</p>
        </header>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <div className="mt-3 space-y-3 text-slate-600">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets && section.bullets.length > 0 && (
                  <ul className="list-disc space-y-2 pl-5">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
          <Link href="/contact" className="text-brand-dark hover:underline">
            {t("contactLink")}
          </Link>
          <Link href="/privacy-policy" className="text-brand-dark hover:underline">
            {t("privacyLink")}
          </Link>
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
