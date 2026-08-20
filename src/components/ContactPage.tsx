import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE_URL } from "@/lib/landing";

interface ContactSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

const CONTACT_EMAIL = "privacy@pdftomarkdown.run";

interface ContactPageProps {
  locale: string;
}

export async function ContactPage({ locale }: ContactPageProps) {
  const t = await getTranslations("Contact");
  const sections = t.raw("sections") as ContactSection[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        name: t("h1"),
        url: `${SITE_URL}/${locale}/contact`,
        description: t("metaDescription"),
      },
      {
        "@type": "Organization",
        name: "PDF to Markdown",
        url: SITE_URL,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: CONTACT_EMAIL,
          availableLanguage: ["English", "Chinese", "Dutch", "Polish"],
        },
      },
    ],
  };

  return (
    <>
      <SiteHeader />
      <main className="bg-home-paper mx-auto max-w-3xl px-4 py-12 pb-16">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-home-ink sm:text-4xl">
            {t("h1")}
          </h1>
          <p className="mt-4 text-home-ink-soft">{t("intro")}</p>
        </header>

        <section className="rounded-2xl border border-black/10 bg-home-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">{t("emailHeading")}</h2>
          <p className="mt-2">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-home-md hover:text-home-md-bright hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="mt-3 text-sm text-home-ink-soft">{t("responseTime")}</p>
        </section>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <div className="mt-3 space-y-3 text-home-ink-soft">
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

        <div className="mt-10 flex flex-wrap gap-x-4 gap-y-2 text-sm text-home-muted">
          <Link href="/about" className="text-home-md hover:text-home-md-bright hover:underline">
            {t("aboutLink")}
          </Link>
          <Link href="/privacy-policy" className="text-home-md hover:text-home-md-bright hover:underline">
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
