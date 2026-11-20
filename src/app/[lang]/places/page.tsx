import type { Metadata } from "next";
import { PlacesView } from "@/components/places-view";
import { PLACES } from "@/data/places";
import { pageMetadata } from "@/i18n/metadata";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getI18n();
  return pageMetadata({
    locale,
    path: "/places",
    title: t.meta.placesTitle,
    description: t.meta.description,
  });
}

export default function AllPlacesPage() {
  return <PlacesView places={PLACES} />;
}
