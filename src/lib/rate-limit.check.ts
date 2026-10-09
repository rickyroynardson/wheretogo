// Run: bun src/lib/rate-limit.check.ts
import assert from "node:assert/strict";
import { isRateLimited } from "./rate-limit";

const t = 0;
for (let i = 0; i < 5; i++) assert.equal(isRateLimited("a", t), false);
assert.equal(isRateLimited("a", t), true, "6th hit in window is limited");
assert.equal(isRateLimited("b", t), false, "other keys unaffected");
assert.equal(isRateLimited("a", t + 10 * 60 * 1000), false, "window resets");
console.log("rate-limit ok");
