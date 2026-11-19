import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { isLocale } from "./config";
import { i18n } from "./index";

// For Server Components: reads the locale from the URL's [lang] segment
export async function getI18n() {
  const locale = await lang();
  if (!isLocale(locale)) notFound();
  return i18n(locale);
}
