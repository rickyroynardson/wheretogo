import { AtSign, Globe, Navigation } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BackButton } from "@/components/back-button";
import { LocalTimeNote, TripOpenStatus } from "@/components/open-status";
import { OpeningHours } from "@/components/opening-hours";
import { SaveButton } from "@/components/save-button";
import { ShareButton } from "@/components/share-button";
import { CATEGORIES, priceSymbol, TAGS } from "@/data/constants";
import { PLACES, type Place } from "@/data/places";
import type { I18n } from "@/i18n";
import { pageMetadata } from "@/i18n/metadata";
import { getI18n } from "@/i18n/server";
import { jsonLdHtml, placeJsonLd } from "@/lib/json-ld";
import { siteUrl } from "@/lib/site";

type Params = PageProps<"/[lang]/places/[id]">["params"];

// Exact string match, so "/places/01" doesn't alias "/places/1"
const findPlace = (id: string) =>
  PLACES.find((place) => String(place.id) === id);

// One static page per place, built at deploy time
export function generateStaticParams() {
  const params = PLACES.map((place) => ({ id: String(place.id) }));
  // Cache Components requires at least one entry; with no data yet, prebuild
  // a placeholder that just renders "not found"
  return params.length > 0 ? params : [{ id: "0" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/places/[id]">): Promise<Metadata> {
  const place = findPlace((await params).id);
  if (!place) return {};
  const { t, locale } = await getI18n();
  return pageMetadata({
    locale,
    path: `/places/${place.id}`,
    ownImage: true,
    title: t.meta.placeTitle(
      place.name,
      t.categories[place.categories[0]].label,
    ),
    // No description yet: "Café · Jl. ..." still says what and where
    description:
      place.description ??
      [
        place.categories.map((c) => t.categories[c].label).join(", "),
        place.address,
      ]
        .filter(Boolean)
        .join(" · "),
  });
}

// Reading params suspends, so it sits inside Suspense to keep navigation instant
export default function PlacePage({
  params,
}: PageProps<"/[lang]/places/[id]">) {
  return (
    <Suspense
      fallback={
        <div className="mt-24 h-60 animate-pulse rounded-2xl bg-muted" />
      }
    >
      <PlaceDetails params={params} />
    </Suspense>
  );
}

async function PlaceDetails({ params }: { params: Params }) {
  const place = findPlace((await params).id);
  if (!place) notFound();
  const i18n = await getI18n();
  const { t, path } = i18n;

  const main = place.categories[0];
  const { plural } = t.categories[main];
  const directions = directionsUrl(place);

  return (
    <article className="flex flex-col gap-6 pt-2 pb-4">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD, "<" escaped by jsonLdHtml
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            placeJsonLd(place, siteUrl(), path(`/places/${place.id}`)),
          ),
        }}
      />
      <BackButton
        fallback={path(`/places?view=list&category=${main}`)}
        label={t.place.backTo(plural)}
      />

      {place.image && (
        <figure className="flex flex-col gap-1.5">
          <Image
            src={place.image}
            alt={place.name}
            width={1040}
            height={585}
            priority
            // Remote images skip Next's optimizer, so any https host works
            unoptimized={place.image.startsWith("https://")}
            className="aspect-video w-full rounded-2xl object-cover"
          />
          {place.imageCredit && (
            <figcaption className="text-xs text-muted-foreground">
              {t.place.photoBy}{" "}
              {place.imageCredit.url ? (
                <a
                  href={place.imageCredit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  {place.imageCredit.name}
                </a>
              ) : (
                place.imageCredit.name
              )}
            </figcaption>
          )}
        </figure>
      )}

      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">{place.name}</h1>
        {place.address && (
          <p className="text-muted-foreground">{place.address}</p>
        )}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {place.hours && place.timezone && (
            <TripOpenStatus
              hours={place.hours}
              timezone={place.timezone}
              badge
            />
          )}
          {place.price && (
            <span
              title={t.prices[place.price]}
              className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
            >
              {priceSymbol(place.price)}
              <span className="sr-only"> ({t.prices[place.price]})</span>
            </span>
          )}
          {place.categories.map((category) => {
            const { icon: Icon } = CATEGORIES[category];
            const { label } = t.categories[category];
            return (
              <span
                key={category}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                <Icon className="size-3.5" strokeWidth={2.25} aria-hidden />
                {label}
              </span>
            );
          })}
        </div>
      </header>

      <section className="flex flex-col gap-3">
        {/* Navigate fills the row; the place's own link sizes to its label */}
        <div className="flex gap-2">
          <a
            href={directions}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-lg font-medium text-primary-foreground"
          >
            <Navigation className="size-5" aria-hidden />
            {t.place.navigate}
          </a>
          {place.link && (
            <PlaceLink url={place.link} name={place.name} i18n={i18n} />
          )}
          <SaveButton
            id={place.id}
            name={place.name}
            className="bg-muted px-4 py-3"
          />
          <ShareButton
            // The plain page: a friend's trip starts from their own spot
            url={path(`/places/${place.id}`)}
            title={place.name}
            text={t.place.shareText(place.name)}
            label={t.common.share}
            className="px-4 py-3"
          />
        </div>
      </section>

      {place.description && (
        <section className="flex flex-col gap-2">
          <h2 className="font-semibold">{t.place.about}</h2>
          <p className="text-sm">{place.description}</p>
        </section>
      )}

      {place.tags && (
        <section className="flex flex-col gap-2">
          <h2 className="font-semibold">{t.place.goodToKnow}</h2>
          <ul className="flex flex-wrap gap-2">
            {/* TAGS order, not data order, so every page lists them alike */}
            {(Object.keys(TAGS) as (keyof typeof TAGS)[])
              .filter((tag) => place.tags?.includes(tag))
              .map((tag) => {
                const { icon: Icon } = TAGS[tag];
                return (
                  <li
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm"
                  >
                    <Icon
                      className="size-4 text-primary"
                      strokeWidth={2.25}
                      aria-hidden
                    />
                    {t.tags[tag]}
                  </li>
                );
              })}
          </ul>
        </section>
      )}

      {place.hours && (
        <section className="flex flex-col gap-2">
          <h2 className="font-semibold">{t.place.openingHours}</h2>
          <OpeningHours hours={place.hours} />
          {place.timezone && <LocalTimeNote timezone={place.timezone} />}
        </section>
      )}
    </article>
  );
}

// Icon-only button to the place's website or social profile
function PlaceLink({
  url,
  name,
  i18n: { t },
}: {
  url: string;
  name: string;
  i18n: I18n;
}) {
  const host = new URL(url).hostname.replace(/^www\./, "");
  const social = SOCIAL[host];
  const LinkIcon = social ? AtSign : Globe;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.place.on(name, social ?? t.place.itsWebsite)}
      title={host}
      className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-muted px-4 py-3 text-lg font-medium text-foreground"
    >
      <LinkIcon className="size-5" aria-hidden />
      {/* Icon only on small phones, so Navigate, Save and Share fit one row */}
      <span className="max-[480px]:hidden">{social ?? t.place.website}</span>
    </a>
  );
}

// Known social hosts get an @ icon and a readable name
const SOCIAL: Record<string, string> = {
  "instagram.com": "Instagram",
  "tiktok.com": "TikTok",
  "facebook.com": "Facebook",
  "x.com": "X",
  "twitter.com": "X",
};

// Google Maps directions. With a Place ID it opens the real listing (name,
// photos, entrance); `destination` is still required and is the fallback.
// Without one, exact coordinates beat a name search that might match wrong.
function directionsUrl(place: Place) {
  const params = new URLSearchParams({ api: "1" });
  if (place.googlePlaceId) {
    params.set(
      "destination",
      [place.name, place.address].filter(Boolean).join(", "),
    );
    params.set("destination_place_id", place.googlePlaceId);
  } else {
    params.set("destination", `${place.lat},${place.lng}`);
  }
  return `https://www.google.com/maps/dir/?${params}`;
}
