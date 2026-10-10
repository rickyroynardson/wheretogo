import { ChevronRight, Map as MapIcon } from "lucide-react";
import Link from "next/link";
import { TripWizard } from "@/components/trip-wizard";

export default function Home() {
  return (
    <>
      <div className="pt-28 pb-10">
        <h1 className="text-4xl font-bold tracking-tight">
          Find a place to go.
        </h1>
      </div>

      <TripWizard />

      <Link
        href="/places"
        className="mt-6 flex items-center gap-3 border-t border-border py-4 font-medium group"
      >
        <MapIcon className="size-6 text-primary" aria-hidden />
        <span className="group-hover:underline underline-offset-4">
          Browse all places
        </span>
        <ChevronRight
          className="ml-auto size-5 text-muted-foreground"
          aria-hidden
        />
      </Link>
    </>
  );
}
