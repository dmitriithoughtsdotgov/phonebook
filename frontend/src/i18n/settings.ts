import type { InitOptions, Resource } from "i18next";
import cs from "@/locales/cs/translation.json";
import en from "@/locales/en/translation.json";

export const languages = ["cs", "en"] as const;
export type Language = (typeof languages)[number];

export const defaultLanguage: Language = "cs";

/** Cookie that remembers the chosen language, read by both the server and the browser. */
export const languageCookie = "lang";

/** Locale used for formatting dates and numbers in each language. */
export const dateLocales: Record<Language, string> = { cs: "cs-CZ", en: "en-GB" };

/**
 * Dates are rendered both on the server (UTC inside Docker) and in the browser, so the time
 * zone is fixed to keep both renders identical.
 */
export const timeZone = "Europe/Prague";

const resources: Resource = {
  cs: { translation: cs },
  en: { translation: en },
};

export function toLanguage(value: string | undefined): Language {
  return languages.find((l) => l === value) ?? defaultLanguage;
}

export function i18nOptions(lng: Language): InitOptions {
  return {
    resources,
    lng,
    fallbackLng: defaultLanguage,
    supportedLngs: languages,
    // Resources are bundled, so initialisation can finish synchronously.
    initAsync: false,
    // React escapes rendered values itself.
    interpolation: { escapeValue: false },
  };
}
