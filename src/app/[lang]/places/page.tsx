import type { Metadata } from "next";
import { PlacesView } from "@/components/places-view";
import { PLACES } from "@/data/places";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.browser.allPlaces };
}

export default function AllPlacesPage() {
  return <PlacesView places={PLACES} />;
}
