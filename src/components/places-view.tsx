import { Suspense } from "react";
import { BackButton } from "@/components/back-button";
import { PlacesBrowser } from "@/components/places-browser";
import type { Place } from "@/data/places";
import { getI18n } from "@/i18n/server";

export async function PlacesView({ places }: { places: Place[] }) {
  const { t, path } = await getI18n();
  return (
    <>
      <div className="flex flex-col gap-1 pt-2 pb-2">
        <BackButton fallback={path("/")} />
      </div>

      {/* useSearchParams needs Suspense; the static shell shows the fallback */}
      <Suspense
        fallback={
          <>
            <h1 className="sr-only">{t.browser.allPlaces}</h1>
            <div className="h-90 animate-pulse rounded-2xl bg-muted" />
          </>
        }
      >
        <PlacesBrowser places={places} />
      </Suspense>
    </>
  );
}
