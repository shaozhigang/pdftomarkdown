import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LandingPage } from "@/components/LandingPage";
import { BatchConverter } from "@/components/BatchConverter";
import { SITE_URL, type Feature, type Faq, type RelatedPage } from "@/lib/landing";
import { localeAlternates } from "@/lib/seo";

const SLUG = "batch-pdf-to-markdown";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "Batch" });
  return {
    title: { absolute: t("metaTitle") },
    description: t("metaDescription"),
    keywords: t.raw("keywords") as string[],
    alternates: localeAlternates(locale, `/${SLUG}`),
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `/${locale}/${SLUG}`,
      siteName: "PDF to Markdown",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: t("metaTitle"),
      description: t("metaDescription"),
    },
  };
}

export default async function BatchPdfToMarkdownPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  setRequestLocale(locale);

  const t = await getTranslations("Batch");
  const tHome = await getTranslations("Home");
  const tTable = await getTranslations("Table");
  const tObs = await getTranslations("Obsidian");

  const content = {
    slug: SLUG,
    metaTitle: t("metaTitle"),
    metaDescription: t("metaDescription"),
    keywords: t.raw("keywords") as string[],
    badge: t("badge"),
    h1: t("h1"),
    subtitle: t("subtitle"),
    features: t.raw("features") as Feature[],
    faqs: t.raw("faqs") as Faq[],
  };

  const related: RelatedPage[] = [
    { slug: "", h1: tHome("h1"), subtitle: tHome("subtitle") },
    {
      slug: "pdf-table-to-markdown",
      h1: tTable("h1"),
      subtitle: tTable("subtitle"),
    },
    {
      slug: "pdf-to-markdown-for-obsidian",
      h1: tObs("h1"),
      subtitle: tObs("subtitle"),
    },
  ];

  const pageUrl = `${SITE_URL}/${SLUG}`;

  return (
    <LandingPage
      content={content}
      related={related}
      pageUrl={pageUrl}
      tool={<BatchConverter />}
      showExamples={false}
      howTo={{
        name: t("howToName"),
        steps: t.raw("howToSteps") as string[],
      }}
    />
  );
}
