// Client-safe constants. Keep zod and places.json out of this file so it can
// be imported by client components without bloating the browser bundle.
import {
  Coffee,
  type LucideIcon,
  ShoppingBag,
  Trees,
  UtensilsCrossed,
  Wine,
} from "lucide-react";

// Order here is the order of the buttons on the home page
export const CATEGORIES = {
  restaurant: {
    label: "Restaurant",
    plural: "Restaurants",
    icon: UtensilsCrossed,
  },
  cafe: {
    label: "Coffee Shop",
    plural: "Coffee Shops",
    icon: Coffee,
  },
  mall: {
    label: "Mall",
    plural: "Malls",
    icon: ShoppingBag,
  },
  park: {
    label: "Park",
    plural: "Parks",
    icon: Trees,
  },
  bar: {
    label: "Bar",
    plural: "Bars",
    icon: Wine,
  },
} satisfies Record<string, { label: string; plural: string; icon: LucideIcon }>;

export type Category = keyof typeof CATEGORIES;

export const isCategory = (value: string): value is Category =>
  Object.hasOwn(CATEGORIES, value);

export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
