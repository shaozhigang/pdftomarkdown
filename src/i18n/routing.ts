import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Add "zh" here when translations in messages/zh.json are ready
  locales: ["en"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
