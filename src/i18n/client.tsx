"use client";

import { createContext, type ReactNode, use } from "react";
import type { Locale } from "./config";
import { type I18n, i18n } from "./index";

const I18nContext = createContext<I18n | null>(null);

// Mounted once in the root layout with the URL's locale
export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return <I18nContext value={i18n(locale)}>{children}</I18nContext>;
}

// For Client Components: { locale, t, intl, path }
export function useI18n() {
  const value = use(I18nContext);
  if (!value) throw new Error("useI18n needs <I18nProvider> above it");
  return value;
}
