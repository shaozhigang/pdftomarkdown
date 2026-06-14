import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AboutPage } from "@/components/AboutPage";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "About" });

  return {
    title: { absolute: t("metaTitle") },
    description: t("metaDescription"),
    alternates: localeAlternates(locale, "/about"),
    robots: { index: true, follow: true },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `/${locale}/about`,
      siteName: "PDF to Markdown",
      type: "website",
    },
  };
}

export default async function Page({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  setRequestLocale(locale);

  return <AboutPage />;
}
