import { ChevronLeft, MapPin, Navigation } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LocalTimeNote, OpenStatus } from "@/components/open-status";
import { OpeningHours } from "@/components/opening-hours";
import { CATEGORIES } from "@/data/constants";
import { PLACES } from "@/data/places";

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

  const { icon: Icon, label, plural } = CATEGORIES[place.category];
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;

  return (
    <article className="flex flex-col gap-6 pt-2 pb-4">
      <Link
        href={`/places?view=list&category=${place.category}`}
        aria-label={`Back to ${plural}`}
        className="-ml-1.5 self-start text-foreground"
      >
        <ChevronLeft className="size-7" aria-hidden />
      </Link>

      {place.image && (
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
      )}

      <header className="flex flex-col gap-2">
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
            <Icon className="size-3.5" strokeWidth={2.25} aria-hidden />
          </span>
          {label}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">{place.name}</h1>
        {place.hours && place.timezone && (
          <OpenStatus hours={place.hours} timezone={place.timezone} />
        )}
        {place.description && <p>{place.description}</p>}
      </header>

      <section className="flex flex-col gap-3">
        {place.address && (
          <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
            {place.address}
          </p>
        )}
        <a
          href={directions}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 self-start rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Navigation className="size-4" aria-hidden />
          Get directions
        </a>
      </section>

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
