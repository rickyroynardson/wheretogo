import { DAYS } from "@/data/constants";
import type { Hours } from "@/data/places";

const DAY_LABELS = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
} satisfies Record<(typeof DAYS)[number], string>;

export function OpeningHours({ hours }: { hours: Hours }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-sm">
      {DAYS.map((day) => (
        <div key={day} className="contents">
          <dt className="text-muted-foreground">{DAY_LABELS[day]}</dt>
          <dd>{formatRanges(hours[day])}</dd>
        </div>
      ))}
    </dl>
  );
}

function formatRanges(ranges: string[] | undefined) {
  if (!ranges) return "Closed";
  if (ranges.includes("00:00-24:00")) return "Open 24 hours";
  return ranges.map((range) => range.replace("-", "–")).join(", ");
}
