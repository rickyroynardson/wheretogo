// Client-safe locale settings, shared by the proxy, server and client code.
export const LOCALES = ["en", "id"] as const;
export type Locale = (typeof LOCALES)[number];

// Used when neither the cookie nor the browser's languages match
export const DEFAULT_LOCALE: Locale = "en";

// Set when someone picks a language, so bare URLs ("/places") remember it
export const LOCALE_COOKIE = "NEXT_LOCALE";

// Full tags for Intl (dates, lists, numbers)
export const INTL_LOCALE: Record<Locale, string> = {
  en: "en-GB",
  id: "id-ID",
};

// Each language's name in itself, for the switcher
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  id: "Bahasa Indonesia",
};

export const isLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value);

// "/places" -> "/id/places"; "/" -> "/id"
export const localePath = (locale: Locale, path: string) =>
  `/${locale}${path === "/" ? "" : path}`;

// "/en/places/3" -> "/id/places/3"
export function swapLocale(pathname: string, locale: Locale) {
  const [, first, ...rest] = pathname.split("/");
  const tail = first && isLocale(first) ? rest : [first, ...rest];
  return localePath(locale, `/${tail.filter(Boolean).join("/")}`);
}
