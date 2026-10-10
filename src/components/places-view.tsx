import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { PlacesBrowser } from "@/components/places-browser";
import type { Place } from "@/data/places";

export function PlacesView({ places }: { places: Place[] }) {
  return (
    <>
      <div className="flex flex-col gap-1 pt-2 pb-2">
        <Link
          href="/"
          aria-label="Back"
          className="-ml-1.5 self-start text-foreground"
        >
          <ChevronLeft className="size-7" aria-hidden />
        </Link>
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
