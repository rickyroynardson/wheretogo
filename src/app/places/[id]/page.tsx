import { AtSign, Globe, Navigation } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BackButton } from "@/components/back-button";
import { LocalTimeNote, TripOpenStatus } from "@/components/open-status";
import { OpeningHours } from "@/components/opening-hours";
import { CATEGORIES } from "@/data/constants";
import { PLACES, type Place } from "@/data/places";

type Params = PageProps<"/places/[id]">["params"];

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
}: PageProps<"/places/[id]">): Promise<Metadata> {
  const place = findPlace((await params).id);
  if (!place) return {};
  return { title: place.name, description: place.description };
}

// Reading params suspends, so it sits inside Suspense to keep navigation instant
export default function PlacePage({ params }: PageProps<"/places/[id]">) {
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

  const main = place.categories[0];
  const { plural } = CATEGORIES[main];
  const directions = directionsUrl(place);

  return (
    <article className="flex flex-col gap-6 pt-2 pb-4">
      <BackButton
        fallback={`/places?view=list&category=${main}`}
        label={`Back to ${plural}`}
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
              Photo by:{" "}
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
          {place.categories.map((category) => {
            const { icon: Icon, label } = CATEGORIES[category];
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
            Navigate
          </a>
          {place.link && <PlaceLink url={place.link} name={place.name} />}
        </div>
      </section>

      {place.description && (
        <section className="flex flex-col gap-2">
          <h2 className="font-semibold">About</h2>
          <p className="text-sm">{place.description}</p>
        </section>
      )}

      {place.hours && (
        <section className="flex flex-col gap-2">
          <h2 className="font-semibold">Opening hours</h2>
          <OpeningHours hours={place.hours} />
          {place.timezone && <LocalTimeNote timezone={place.timezone} />}
        </section>
      )}
    </article>
  );
}

// Icon-only button to the place's website or social profile
function PlaceLink({ url, name }: { url: string; name: string }) {
  const host = new URL(url).hostname.replace(/^www\./, "");
  const social = SOCIAL[host];
  const LinkIcon = social ? AtSign : Globe;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${name} on ${social ?? "its website"}`}
      title={host}
      className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-muted px-4 py-3 text-lg font-medium text-foreground"
    >
      <LinkIcon className="size-5" aria-hidden />
      {social ?? "Website"}
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
