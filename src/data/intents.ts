// Home page options: what the user wants to do, not what a place is.
// Each maps to the place categories that fit; results filter by those.
// Edit freely: order here is the order on the home page.
import { Coffee, Laptop, type LucideIcon, Users, Utensils } from "lucide-react";
import type { Dictionary } from "@/i18n";
import type { Category, Tag } from "./constants";

export type Intent = {
  // Also the key of its label in the i18n dictionaries (intents.*)
  id: keyof Dictionary["intents"];
  icon: LucideIcon;
  categories: Category[];
  // Optional: places must also have every one of these tags
  tags?: Tag[];
};

export const INTENTS = [
  {
    id: "coffee",
    icon: Coffee,
    categories: ["cafe", "dessert"],
  },
  {
    id: "hangout",
    icon: Users,
    categories: ["cafe", "mall", "park", "bar"],
  },
  {
    id: "eat",
    icon: Utensils,
    categories: ["restaurant", "cafe", "dessert"],
  },
  {
    id: "work",
    icon: Laptop,
    categories: ["cafe"],
    tags: ["work"],
  },
] satisfies Intent[];

// Whether any place fits; the home page hides intents with no results
export const intentHasPlaces = (
  intent: Intent,
  places: { categories: Category[]; tags?: Tag[] }[],
) =>
  places.some(
    (place) =>
      place.categories.some((c) => intent.categories.includes(c)) &&
      (intent.tags ?? []).every((tag) => place.tags?.includes(tag)),
  );
