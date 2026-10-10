// Run: bun src/lib/distance.check.ts
import assert from "node:assert/strict";
import { distanceKm, formatDistance } from "./distance";

const batam = { lat: 1.1301, lng: 104.0305 };
assert.equal(distanceKm(batam, batam), 0);
// Batam -> Singapore (Marina Bay) is ~25 km
const sg = { lat: 1.2834, lng: 103.8607 };
assert.ok(
  Math.abs(distanceKm(batam, sg) - 25.4) < 1,
  String(distanceKm(batam, sg)),
);
assert.equal(formatDistance(0.234), "230 m");
assert.equal(formatDistance(0.996), "1.0 km");
assert.equal(formatDistance(1.234), "1.2 km");
assert.equal(formatDistance(12.6), "13 km");
console.log("distance ok");
