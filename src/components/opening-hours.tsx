import { DAYS } from "@/data/constants";
import type { Hours } from "@/data/places";
import type { Dictionary } from "@/i18n";
import { getI18n } from "@/i18n/server";

export async function OpeningHours({ hours }: { hours: Hours }) {
  const { t } = await getI18n();
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-sm">
      {DAYS.map((day) => (
        <div key={day} className="contents">
          <dt className="text-muted-foreground">{t.hours.days[day]}</dt>
          <dd>{formatRanges(hours[day], t)}</dd>
        </div>
      ))}
    </dl>
  );
}

function formatRanges(ranges: string[] | undefined, t: Dictionary) {
  if (!ranges) return t.hours.closed;
  if (ranges.includes("00:00-24:00")) return t.hours.allDay;
  return ranges.map((range) => range.replace("-", "–")).join(", ");
}
