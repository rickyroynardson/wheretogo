"use client";

import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/client";
import {
  LOCALE_COOKIE,
  LOCALE_NAMES,
  LOCALES,
  swapLocale,
} from "@/i18n/config";

// Two languages, so one button flips between them. Keeps the current page
// and its filters, and remembers the pick for bare URLs (see proxy.ts).
export function LanguageSwitcher() {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const other = LOCALES.find((l) => l !== locale) ?? locale;

  function switchLanguage() {
    try {
      // biome-ignore lint/suspicious/noDocumentCookie: one plain cookie, no need for the Cookie Store API
      document.cookie = `${LOCALE_COOKIE}=${other}; path=/; max-age=31536000; samesite=lax`;
    } catch {}
    // Full load: the root layout (<html lang>, theme script) belongs to the
    // language. Search params are read here so the header needn't suspend.
    window.location.replace(
      swapLocale(pathname, other) + window.location.search,
    );
  }

  return (
    <button
      type="button"
      onClick={switchLanguage}
      aria-label={t.header.switchTo}
      title={LOCALE_NAMES[other]}
      lang={other}
      className="grid h-10 min-w-10 place-items-center rounded-full px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase hover:bg-muted hover:cursor-pointer"
    >
      {other}
    </button>
  );
}
