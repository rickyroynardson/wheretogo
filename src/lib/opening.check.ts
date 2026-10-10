// Run: bun src/lib/opening.check.ts
import assert from "node:assert/strict";
import { openStatus } from "./opening";

const JKT = "Asia/Jakarta"; // UTC+7, no DST
// Helper: a Jakarta wall-clock time as a real instant. 2026-10-05 is a Monday.
const at = (date: string, time: string) => new Date(`${date}T${time}:00+07:00`);
const MON = "2026-10-05";
const TUE = "2026-10-06";
const SAT = "2026-10-10";
const SUN = "2026-10-11";

const mall = {
  mon: ["10:00-22:00"],
  tue: ["10:00-22:00"],
  sat: ["10:00-22:00"],
};
const s = (h: object, d: string, t: string, tz = JKT) =>
  openStatus(h, tz, at(d, t)).label;

assert.equal(s(mall, MON, "12:00"), "Open · Closes 22:00");
assert.equal(s(mall, MON, "09:59"), "Closed · Opens 10:00");
assert.equal(s(mall, MON, "22:00"), "Closed · Opens tomorrow 10:00");
assert.equal(s(mall, TUE, "23:00"), "Closed · Opens Sat 10:00");
assert.equal(
  s(mall, SUN, "12:00"),
  "Closed · Opens tomorrow 10:00",
  "wraps to Monday",
);

// Past midnight: Saturday 18:00-02:00 is still open early Sunday
const bar = { sat: ["18:00-02:00"] };
assert.equal(s(bar, SAT, "23:00"), "Open · Closes 02:00");
assert.equal(s(bar, SUN, "01:30"), "Open · Closes 02:00");
assert.equal(s(bar, SUN, "02:00"), "Closed · Opens Sat 18:00");

// Sunday night into Monday morning wraps around the week
const late = { sun: ["20:00-03:00"] };
assert.equal(s(late, MON, "02:00"), "Open · Closes 03:00");

// Split shifts
const cafe = { mon: ["08:00-12:00", "16:00-23:00"] };
assert.equal(s(cafe, MON, "13:00"), "Closed · Opens 16:00");

// 24/7 and never-open
const allDay = Object.fromEntries(
  ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((d) => [
    d,
    ["00:00-24:00"],
  ]),
);
assert.equal(s(allDay, MON, "03:00"), "Open 24 hours");
assert.equal(s({}, MON, "12:00"), "Closed");

// Same instant, different place timezone: 21:30 Jakarta = 22:30 Makassar
assert.equal(
  s(mall, MON, "21:30", "Asia/Makassar"),
  "Closed · Opens tomorrow 10:00",
);
assert.equal(s(mall, MON, "21:30", JKT), "Open · Closes 22:00");

console.log("opening ok");
