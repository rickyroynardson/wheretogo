// Client-safe constants. Keep zod and places.json out of this file so it can
// be imported by client components without bloating the browser bundle.
import {
  Baby,
  BadgeCheck,
  CakeSlice,
  Cigarette,
  Coffee,
  Laptop,
  type LucideIcon,
  ShoppingBag,
  SquareParking,
  Sun,
  Trees,
  UtensilsCrossed,
  Wifi,
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

// What a place offers, beyond what it is. Filters match places that have
// every picked tag. Order here is the order in filters and on place pages;
// names live in the i18n dictionaries (tags.*).
export const TAGS = {
  wifi: { icon: Wifi },
  // Seats, sockets and a vibe where a laptop for hours is fine
  work: { icon: Laptop },
  outdoor: { icon: Sun },
  halal: { icon: BadgeCheck },
  parking: { icon: SquareParking },
  kids: { icon: Baby },
  smoking: { icon: Cigarette },
} satisfies Record<string, { icon: LucideIcon }>;

export type Tag = keyof typeof TAGS;

export const isTag = (value: string): value is Tag =>
  Object.hasOwn(TAGS, value);

// Typical spend per person: 1 under Rp 50k, 2 Rp 50-150k, 3 over Rp 150k
export const PRICES = [1, 2, 3] as const;
export type Price = (typeof PRICES)[number];

export const isPrice = (value: number): value is Price =>
  (PRICES as readonly number[]).includes(value);

// "$$" for 2
export const priceSymbol = (price: Price) => "$".repeat(price);

export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
