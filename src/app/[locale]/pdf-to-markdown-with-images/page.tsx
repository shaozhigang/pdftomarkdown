import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LandingPage } from "@/components/LandingPage";
import { Converter } from "@/components/Converter";
import { SITE_URL, type Feature, type Faq, type RelatedPage } from "@/lib/landing";
import { localeAlternates } from "@/lib/seo";

const SLUG = "pdf-to-markdown-with-images";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "Images" });
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

export default async function PdfToMarkdownWithImagesPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  setRequestLocale(locale);

  const t = await getTranslations("Images");
  const tHome = await getTranslations("Home");
  const tObs = await getTranslations("Obsidian");
  const tNotion = await getTranslations("Notion");

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
      slug: "pdf-to-markdown-for-obsidian",
      h1: tObs("h1"),
      subtitle: tObs("subtitle"),
    },
    {
      slug: "pdf-to-markdown-for-notion",
      h1: tNotion("h1"),
      subtitle: tNotion("subtitle"),
    },
  ];

  const pageUrl = `${SITE_URL}/${SLUG}`;

  return (
    <LandingPage
      content={content}
      related={related}
      pageUrl={pageUrl}
      tool={<Converter profile="images" />}
      showExamples={false}
      howTo={{
        name: t("howToName"),
        steps: t.raw("howToSteps") as string[],
      }}
    />
  );
}
