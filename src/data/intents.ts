// Home page options: what the user wants to do, not what a place is.
// Each maps to the place categories that fit; results filter by those.
// Edit freely: order here is the order on the home page.
import { Coffee, type LucideIcon, Users, Utensils } from "lucide-react";
import type { Dictionary } from "@/i18n";
import type { Category } from "./constants";

export type Intent = {
  // Also the key of its label in the i18n dictionaries (intents.*)
  id: keyof Dictionary["intents"];
  icon: LucideIcon;
  categories: Category[];
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
] satisfies Intent[];
