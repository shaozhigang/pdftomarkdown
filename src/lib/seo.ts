import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/landing";

/**
 * Path after the locale segment, e.g. "" for home or "/privacy-policy".
 */
function normalizePathSuffix(pathSuffix: string): string {
  if (!pathSuffix || pathSuffix === "/") return "";
  return pathSuffix.startsWith("/") ? pathSuffix : `/${pathSuffix}`;
}

/** Canonical + hreflang alternates for a localized route. */
export function localeAlternates(
  locale: string,
  pathSuffix = "",
): NonNullable<Metadata["alternates"]> {
  const path = normalizePathSuffix(pathSuffix);

  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `${SITE_URL}/${l}${path}`;
  }
  languages["x-default"] = `${SITE_URL}/${routing.defaultLocale}${path}`;

  return {
    canonical: `/${locale}${path}`,
    languages,
  };
}
