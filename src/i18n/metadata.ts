import type { Metadata } from "next";
import { DEFAULT_LOCALE, LOCALES, type Locale, localePath } from "./config";

// og:locale wants language_TERRITORY
const OG_LOCALE: Record<Locale, string> = { en: "en_GB", id: "id_ID" };

// Per-page metadata that has to agree across languages: canonical URL,
// hreflang links to the same page in every language, and Open Graph.
// `path` is the page without its language, e.g. "/places/3".
export function pageMetadata({
  locale,
  path,
  title,
  description,
  ownImage = false,
}: {
  locale: Locale;
  path: string;
  title?: string;
  description?: string;
  // The page has its own opengraph-image file
  ownImage?: boolean;
}): Metadata {
  const url = localePath(locale, path);
  return {
    ...(title && { title }),
    ...(description && { description }),
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [l, localePath(l, path)])),
        "x-default": localePath(DEFAULT_LOCALE, path),
      },
    },
    // Child openGraph replaces the parent's, so every page sends all of it
    openGraph: {
      type: "website",
      siteName: "WhereToGo",
      url,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map(
        (l) => OG_LOCALE[l],
      ),
      ...(title && { title }),
      ...(description && { description }),
      // This openGraph replaces the layout's, image included, so point at
      // the site preview. An images entry here would beat the page's own
      // opengraph-image file, so leave it out for those pages.
      ...(!ownImage && {
        images: {
          url: localePath(locale, "/opengraph-image"),
          width: 1200,
          height: 630,
          alt: "WhereToGo",
        },
      }),
    },
  };
}
