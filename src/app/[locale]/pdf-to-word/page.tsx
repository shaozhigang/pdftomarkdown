import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LandingPage, type ComparisonTable } from "@/components/LandingPage";
import { PdfToWord } from "@/components/PdfToWord";
import { SITE_URL, type Feature, type Faq, type RelatedPage } from "@/lib/landing";
import { localeAlternates } from "@/lib/seo";

const SLUG = "pdf-to-word";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "PdfToWord" });
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
      images: ["/opengraph-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      images: ["/opengraph-image.png"],
      title: t("metaTitle"),
      description: t("metaDescription"),
    },
  };
}

export default async function PdfToWordPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  setRequestLocale(locale);

  const t = await getTranslations("PdfToWord");
  const tHome = await getTranslations("Home");
  const tMd = await getTranslations("MdToPdf");
  const tImages = await getTranslations("Images");

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
      slug: "markdown-to-pdf",
      h1: tMd("h1"),
      subtitle: tMd("subtitle"),
    },
    {
      slug: "pdf-to-markdown-with-images",
      h1: tImages("h1"),
      subtitle: tImages("subtitle"),
    },
  ];

  const audience = {
    title: t("audienceTitle"),
    items: t.raw("audience") as { title: string; body: string }[],
  };

  const comparison: ComparisonTable = {
    title: t("comparisonTitle"),
    columns: t.raw("comparisonColumns") as string[],
    rows: t.raw("comparisonRows") as string[][],
  };

  const pageUrl = `${SITE_URL}/${SLUG}`;

  return (
    <LandingPage
      content={content}
      related={related}
      pageUrl={pageUrl}
      tool={<PdfToWord />}
      showExamples={false}
      audience={audience}
      comparison={comparison}
      howTo={{
        name: t("howToName"),
        steps: t.raw("howToSteps") as string[],
      }}
    />
  );
}
