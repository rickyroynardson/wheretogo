// Client-safe constants. Keep zod and places.json out of this file so it can
// be imported by client components without bloating the browser bundle.
import {
  CakeSlice,
  Coffee,
  type LucideIcon,
  ShoppingBag,
  Trees,
  UtensilsCrossed,
  Wine,
} from "lucide-react";

// Order here is the order of the buttons on the home page.
// Names live in the i18n dictionaries (categories.*).
export const CATEGORIES = {
  restaurant: {
    icon: UtensilsCrossed,
  },
  // Coffee, tea, brunch; "Café" rather than "Coffee Shop" so cake places fit
  cafe: {
    icon: Coffee,
  },
  // Patisseries, bakeries, ice cream, dessert bars
  dessert: {
    icon: CakeSlice,
  },
  mall: {
    icon: ShoppingBag,
  },
  park: {
    icon: Trees,
  },
  bar: {
    icon: Wine,
  },
} satisfies Record<string, { icon: LucideIcon }>;

export type Category = keyof typeof CATEGORIES;

export const isCategory = (value: string): value is Category =>
  Object.hasOwn(CATEGORIES, value);

export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
