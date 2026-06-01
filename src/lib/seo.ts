import type { Metadata } from "next";
import type { LandingContent } from "@/lib/landing";

export function landingMetadata(content: LandingContent): Metadata {
  const path = content.slug ? `/${content.slug}` : "/";
  return {
    title: { absolute: content.metaTitle },
    description: content.metaDescription,
    keywords: content.keywords,
    alternates: { canonical: path },
    openGraph: {
      title: content.metaTitle,
      description: content.metaDescription,
      url: path,
      siteName: "PDF to Markdown",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: content.metaTitle,
      description: content.metaDescription,
    },
  };
}
