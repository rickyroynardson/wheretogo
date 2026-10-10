// Run: bun src/data/areas.check.ts
import assert from "node:assert/strict";
import { searchAreas } from "./areas";

const names = (q: string) => searchAreas(q).map((a) => a.name);

assert.deepEqual(names(""), [], "empty query shows nothing");
assert.equal(names("nagoya")[0], "Nagoya", "exact");
assert.equal(names("NAG")[0], "Nagoya", "prefix, any case");
assert.equal(names("centre")[0], "Batam Centre", "word inside the name");
assert.equal(names("nagoia")[0], "Nagoya", "one typo");
assert.equal(names("tibn")[0], "Tiban", "missing letter");
assert.equal(names("jodoh")[0], "Nagoya", "alias");
assert.equal(names("bc")[0], "Batam Centre", "short alias");
assert.equal(
  names("batam-center")[0],
  "Batam Centre",
  "punctuation + alias spelling",
);
assert.ok(
  names("batu").includes("Batu Aji") && names("batu").includes("Batu Ampar"),
);
assert.deepEqual(names("zzzz"), [], "nonsense matches nothing");
assert.deepEqual(
  names("xy"),
  [],
  "short non-matching query has no typo matches",
);
console.log("areas search ok");
