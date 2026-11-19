import { DAYS } from "@/data/constants";
import type { Hours } from "@/data/places";

const DAY = 24 * 60;
const WEEK = 7 * DAY;
const SHORT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export type Day = (typeof DAYS)[number];

// Structured so each language can word it its own way (see i18n dictionaries)
export type OpenStatus =
  | { kind: "always"; open: true }
  | { kind: "open"; open: true; closes: string }
  | { kind: "never"; open: false }
  | {
      kind: "closed";
      open: false;
      opens: string;
      on: "today" | "tomorrow" | Day;
    };

// Minutes since Monday 00:00, in the place's timezone
function weekMinute(now: Date, timeZone: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  const day = SHORT_DAYS.indexOf(parts.weekday);
  return day * DAY + Number(parts.hour) * 60 + Number(parts.minute);
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// Every open range as [start, end) in week minutes, merged so back-to-back
// ranges (e.g. 24h days, or 18:00-02:00 then 02:00-...) read as one.
function intervals(hours: Hours) {
  const list: [number, number][] = [];
  DAYS.forEach((day, i) => {
    for (const range of hours[day] ?? []) {
      const [from, to] = range.split("-").map(toMinutes);
      const start = i * DAY + from;
      // An end at or before the start runs past midnight
      list.push([start, i * DAY + to + (to <= from ? DAY : 0)]);
    }
  });
  list.sort((a, b) => a[0] - b[0]);

  const merged: [number, number][] = [];
  for (const [start, end] of list) {
    const last = merged.at(-1);
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }
  // Sunday night running into Monday morning
  const first = merged[0];
  const last = merged.at(-1);
  if (first && last && first !== last && last[1] >= first[0] + WEEK) {
    merged.shift();
    last[1] = Math.max(last[1], first[1] + WEEK);
  }
  return merged;
}

const clock = (minute: number) => {
  const m = ((minute % DAY) + DAY) % DAY;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

export function openStatus(
  hours: Hours,
  timeZone: string,
  now = new Date(),
): OpenStatus {
  const ranges = intervals(hours);
  if (ranges.length === 0) return { kind: "never", open: false };
  if (ranges.length === 1 && ranges[0][1] - ranges[0][0] >= WEEK) {
    return { kind: "always", open: true };
  }

  const t = weekMinute(now, timeZone);
  // Check this week and, for ranges spilling past Sunday, last week's too
  for (const [start, end] of ranges) {
    for (const shift of [0, -WEEK]) {
      if (start + shift <= t && t < end + shift) {
        return { kind: "open", open: true, closes: clock(end) };
      }
    }
  }

  const next = ranges.find(([start]) => start > t)?.[0] ?? ranges[0][0] + WEEK;
  const today = Math.floor(t / DAY);
  const nextDay = Math.floor(next / DAY);
  const on =
    nextDay === today
      ? "today"
      : nextDay === today + 1
        ? "tomorrow"
        : DAYS[nextDay % 7];
  return { kind: "closed", open: false, opens: clock(next), on };
}
