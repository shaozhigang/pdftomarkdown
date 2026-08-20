import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

interface PolicySection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export async function PrivacyPolicyPage() {
  const t = await getTranslations("PrivacyPolicy");
  const sections = t.raw("sections") as PolicySection[];

  return (
    <>
      <SiteHeader />
      <main className="bg-home-paper mx-auto max-w-3xl px-4 py-12 pb-16">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-home-ink sm:text-4xl">
            {t("h1")}
          </h1>
          <p className="mt-3 font-mono text-xs text-home-muted">{t("lastUpdated")}</p>
          <p className="mt-4 text-home-ink-soft">{t("intro")}</p>
        </header>

        <div className="space-y-10">
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
      </main>
      <SiteFooter />
    </>
  );
}
