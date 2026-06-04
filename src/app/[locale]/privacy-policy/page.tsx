import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PrivacyPolicyPage } from "@/components/PrivacyPolicyPage";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "PrivacyPolicy" });

  return {
    title: { absolute: t("metaTitle") },
    description: t("metaDescription"),
    alternates: { canonical: `/${locale}/privacy-policy` },
    robots: { index: true, follow: true },
  };
}

export default async function Page({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  return <PrivacyPolicyPage />;
}
