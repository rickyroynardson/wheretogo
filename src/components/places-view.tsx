import { Suspense } from "react";
import { BackButton } from "@/components/back-button";
import { PlacesBrowser } from "@/components/places-browser";
import type { Place } from "@/data/places";

export function PlacesView({ places }: { places: Place[] }) {
  return (
    <>
      <div className="flex flex-col gap-1 pt-2 pb-2">
        <BackButton fallback="/" />
      </div>

      {/* useSearchParams needs Suspense; the static shell shows the fallback */}
      <Suspense
        fallback={
          <>
            <h1 className="sr-only">All places</h1>
            <div className="h-90 animate-pulse rounded-2xl bg-muted" />
          </>
        }
      >
        <PlacesBrowser places={places} />
      </Suspense>
    </>
  );
}
