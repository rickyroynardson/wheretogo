import type { Metadata } from "next";
import { PlacesView } from "@/components/places-view";
import { PLACES } from "@/data/places";

export const metadata: Metadata = { title: "All places" };

export default function AllPlacesPage() {
  return <PlacesView places={PLACES} />;
}
