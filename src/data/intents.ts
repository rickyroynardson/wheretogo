// Home page options: what the user wants to do, not what a place is.
// Each maps to the place categories that fit; results filter by those.
// Edit freely: order here is the order on the home page.
import { Coffee, type LucideIcon, Users, Utensils } from "lucide-react";
import type { Category } from "./constants";

export type Intent = {
  id: string;
  label: string;
  icon: LucideIcon;
  categories: Category[];
};

export const INTENTS = [
  {
    id: "coffee",
    label: "Coffee or a chill spot",
    icon: Coffee,
    categories: ["cafe"],
  },
  {
    id: "hangout",
    label: "Hang out with friends",
    icon: Users,
    categories: ["cafe", "mall", "park", "bar"],
  },
  {
    id: "eat",
    label: "Something to eat",
    icon: Utensils,
    categories: ["restaurant", "cafe"],
  },
] satisfies Intent[];
