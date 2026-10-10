import { z } from "zod";
import { CATEGORIES, type Category, DAYS } from "./constants";
import placesJson from "./places.json";

// "09:00-22:00". End may pass midnight ("18:00-02:00"); "00:00-24:00" = all day.
const timeRange = z
  .string()
  .regex(
    /^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-4]):[0-5]\d$/,
    "Use HH:MM-HH:MM",
  );

// A missing day means closed that day
const hours = z
  .object(
    Object.fromEntries(
      DAYS.map((day) => [day, z.array(timeRange).min(1).optional()]),
    ) as Record<
      (typeof DAYS)[number],
      z.ZodOptional<z.ZodArray<typeof timeRange>>
    >,
  )
  .strict();

// IANA name like "Asia/Jakarta"; the browser's Intl rejects unknown ones
const timezone = z.string().refine((tz) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}, "Unknown timezone, use an IANA name like Asia/Jakarta");

const place = z
  .object({
    // Required: needed for the map and for URLs
    id: z.number().int().positive(),
    name: z.string().min(1),
    category: z.enum(Object.keys(CATEGORIES) as [Category, ...Category[]]),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    // Optional: only rendered when present
    image: z
      .string()
      .startsWith("/")
      .or(z.url({ protocol: /^https$/ }))
      .optional(),
    address: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    // Hours are in this timezone (the place's local time)
    hours: hours.optional(),
    timezone: timezone.optional(),
  })
  // Typos like "adress" fail instead of silently disappearing
  .strict()
  .refine((p) => !p.hours || p.timezone, {
    message: "Places with hours need a timezone",
    path: ["timezone"],
  });

export type Place = z.infer<typeof place>;
export type Hours = NonNullable<Place["hours"]>;

// Validated once when the module loads, so bad data fails the build
export const PLACES: Place[] = z
  .array(place)
  .refine(
    (places) => new Set(places.map((p) => p.id)).size === places.length,
    "Duplicate place id",
  )
  .parse(placesJson);
