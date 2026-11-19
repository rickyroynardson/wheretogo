// Run: bun src/lib/pick.check.ts
import assert from "node:assert/strict";
import { type Candidate, pickOne } from "./pick";

const c = (item: string, open: boolean | null, km: number | null = null) =>
  ({ item, open, km }) satisfies Candidate<string>;
// random() -> 0 picks the first of the pool, 0.99 the last
const first = { random: () => 0 };
const last = { random: () => 0.99 };

assert.equal(pickOne([]), null, "nothing to pick");
assert.equal(
  pickOne([c("closed", false), c("open", true)], last),
  "open",
  "open beats closed",
);
assert.equal(
  pickOne([c("closed", false), c("unknown", null)], first),
  "unknown",
  "unknown beats closed",
);
assert.equal(
  pickOne([c("a", false), c("b", false)], last),
  "b",
  "all closed still gives an answer",
);

const near = [
  c("far", true, 9),
  c("1km", true, 1),
  c("3km", true, 3),
  c("2km", true, 2),
  c("closed-near", false, 0.1),
];
assert.equal(pickOne(near, first), "1km", "nearest open first");
assert.equal(pickOne(near, last), "3km", "only the nearest 3 open");

assert.equal(
  pickOne([c("a", true), c("b", true)], { ...first, avoid: "a" }),
  "b",
  "skips the last pick",
);
assert.equal(
  pickOne([c("a", true)], { avoid: "a" }),
  "a",
  "repeats when it's the only one",
);
console.log("pick ok");
