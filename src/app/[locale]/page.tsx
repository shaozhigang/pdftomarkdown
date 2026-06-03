import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LandingPage } from "@/components/LandingPage";
import { SITE_URL, type Feature, type Faq, type RelatedPage } from "@/lib/landing";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "Home" });
  return {
    title: { absolute: t("metaTitle") },
    description: t("metaDescription"),
    keywords: t.raw("keywords") as string[],
    alternates: { canonical: `/${locale}` },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `/${locale}`,
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

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  setRequestLocale(locale);

  const t = await getTranslations("Home");
  const tObs = await getTranslations("Obsidian");
  const tChat = await getTranslations("ChatGPT");
  const tTable = await getTranslations("Table");

  const content = {
    slug: "",
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
    {
      slug: "pdf-to-markdown-for-obsidian",
      h1: tObs("h1"),
      subtitle: tObs("subtitle"),
    },
    {
      slug: "pdf-to-markdown-for-chatgpt",
      h1: tChat("h1"),
      subtitle: tChat("subtitle"),
    },
    {
      slug: "pdf-table-to-markdown",
      h1: tTable("h1"),
      subtitle: tTable("subtitle"),
    },
  ];

  const pageUrl = SITE_URL;

  return <LandingPage content={content} related={related} pageUrl={pageUrl} />;
}
