import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactPage } from "@/components/ContactPage";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "Contact" });

  return {
    title: { absolute: t("metaTitle") },
    description: t("metaDescription"),
    alternates: localeAlternates(locale, "/contact"),
    robots: { index: true, follow: true },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `/${locale}/contact`,
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

  return <ContactPage locale={locale} />;
}
