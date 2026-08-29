import { getRequestConfig } from "next-intl/server";
import { mergeMessages } from "./mergeMessages";
import { routing } from "./routing";

const enMessages = (await import("../../messages/en.json")).default;

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  const localeMessages =
    locale === routing.defaultLocale
      ? enMessages
      : mergeMessages(
          enMessages,
          (await import(`../../messages/${locale}.json`)).default,
        );

  return {
    locale,
    messages: localeMessages,
  };
});
