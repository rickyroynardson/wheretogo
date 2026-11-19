import { ChevronRight, Map as MapIcon } from "lucide-react";
import Link from "next/link";
import { TripWizard } from "@/components/trip-wizard";
import { INTENTS, intentHasPlaces } from "@/data/intents";
import { PLACES } from "@/data/places";
import { getI18n } from "@/i18n/server";

export default async function Home() {
  const { t, path } = await getI18n();
  return (
    <>
      <div className="pt-28 pb-10">
        <h1 className="text-4xl font-bold tracking-tight">{t.home.title}</h1>
      </div>

      <TripWizard
        intentIds={INTENTS.filter((intent) =>
          intentHasPlaces(intent, PLACES),
        ).map((intent) => intent.id)}
      />

      <Link
        href={path("/places")}
        className="mt-6 flex items-center gap-3 border-t border-border py-4 font-medium group"
      >
        <MapIcon className="size-6 text-primary" aria-hidden />
        <span className="group-hover:underline underline-offset-4">
          {t.home.browseAll}
        </span>
        <ChevronRight
          className="ml-auto size-5 text-muted-foreground"
          aria-hidden
        />
      </Link>
    </>
  );
}
