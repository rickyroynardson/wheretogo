import "server-only";
import type { Category } from "@/data/constants";
import { DAYS, priceSymbol } from "@/data/constants";
import type { Place } from "@/data/places";

// schema.org type per main category, so search engines know what it is
const TYPES: Record<Category, string> = {
  restaurant: "Restaurant",
  cafe: "CafeOrCoffeeShop",
  dessert: "Bakery",
  mall: "ShoppingCenter",
  park: "Park",
  bar: "BarOrPub",
};

const DAY_NAMES = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
} as const;

// Structured data for one place (schema.org LocalBusiness and friends).
// `base` is the site's absolute URL, `url` the page's own path.
export function placeJsonLd(place: Place, base: string, url: string) {
  const hours = place.hours;
  return {
    "@context": "https://schema.org",
    "@type": TYPES[place.categories[0]],
    name: place.name,
    url: base + url,
    ...(place.description && { description: place.description }),
    ...(place.image && {
      image: place.image.startsWith("https://")
        ? place.image
        : base + place.image,
    }),
    ...(place.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: place.address,
        addressLocality: "Batam",
        addressRegion: "Kepulauan Riau",
        addressCountry: "ID",
      },
    }),
    geo: {
      "@type": "GeoCoordinates",
      latitude: place.lat,
      longitude: place.lng,
    },
    ...(place.link && { sameAs: [place.link] }),
    ...(place.price && { priceRange: priceSymbol(place.price) }),
    // One entry per day and range; "18:00-02:00" stays as is, which
    // schema.org reads as closing after midnight
    ...(hours && {
      openingHoursSpecification: DAYS.flatMap((day) =>
        (hours[day] ?? []).map((range) => {
          const [opens, closes] = range.split("-");
          return {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: DAY_NAMES[day],
            opens,
            closes: closes === "24:00" ? "23:59" : closes,
          };
        }),
      ),
    }),
  };
}

// For a <script type="application/ld+json">: escape "<" so text from the
// data can never close the tag
export const jsonLdHtml = (data: object) =>
  JSON.stringify(data).replace(/</g, "\\u003c");
