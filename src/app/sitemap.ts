import type { MetadataRoute } from "next";
import { PLACES } from "@/data/places";
import { LOCALES, localePath } from "@/i18n/config";
import { siteUrl } from "@/lib/site";

// /sitemap.xml: every page in every language, each linked to its twins
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const paths = [
    "/",
    "/places",
    ...PLACES.map((place) => `/places/${place.id}`),
  ];
  return paths.flatMap((path) => {
    const languages = Object.fromEntries(
      LOCALES.map((l) => [l, base + localePath(l, path)]),
    );
    return LOCALES.map((locale) => ({
      url: base + localePath(locale, path),
      alternates: { languages },
    }));
  });
}
