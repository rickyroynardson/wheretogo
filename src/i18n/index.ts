// Client-safe: both dictionaries are small, so they ship together and any
// component can look one up synchronously.
import { INTL_LOCALE, type Locale, localePath } from "./config";
import { type Dictionary, en } from "./dictionaries/en";
import { id } from "./dictionaries/id";

export type { Dictionary };

const DICTIONARIES: Record<Locale, Dictionary> = { en, id };

// Everything a component needs to speak the current language
export function i18n(locale: Locale) {
  return {
    locale,
    t: DICTIONARIES[locale],
    // Tag for Intl APIs, e.g. toLocaleString(intl, ...)
    intl: INTL_LOCALE[locale],
    // "/places" -> "/id/places"
    path: (to: string) => localePath(locale, to),
  };
}

export type I18n = ReturnType<typeof i18n>;
