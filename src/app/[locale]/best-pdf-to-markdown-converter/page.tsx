import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LandingPage, type ComparisonTable } from "@/components/LandingPage";
import { SITE_URL, type Feature, type Faq, type RelatedPage } from "@/lib/landing";
import { localeAlternates } from "@/lib/seo";

const SLUG = "best-pdf-to-markdown-converter";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "Best" });
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

export default async function BestPdfToMarkdownConverterPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  setRequestLocale(locale);

  const t = await getTranslations("Best");
  const tOcr = await getTranslations("Ocr");
  const tImages = await getTranslations("Images");
  const tBatch = await getTranslations("Batch");

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

  const comparison: ComparisonTable = {
    title: t("comparisonTitle"),
    columns: t.raw("comparisonColumns") as string[],
    rows: t.raw("comparisonRows") as string[][],
  };

  const related: RelatedPage[] = [
    {
      slug: "scanned-pdf-to-markdown",
      h1: tOcr("h1"),
      subtitle: tOcr("subtitle"),
    },
    {
      slug: "pdf-to-markdown-with-images",
      h1: tImages("h1"),
      subtitle: tImages("subtitle"),
    },
    {
      slug: "batch-pdf-to-markdown",
      h1: tBatch("h1"),
      subtitle: tBatch("subtitle"),
    },
  ];

  const pageUrl = `${SITE_URL}/${SLUG}`;

  return (
    <LandingPage
      content={content}
      related={related}
      pageUrl={pageUrl}
      showExamples={false}
      comparison={comparison}
      howTo={{
        name: t("howToName"),
        steps: t.raw("howToSteps") as string[],
      }}
    />
  );
}
