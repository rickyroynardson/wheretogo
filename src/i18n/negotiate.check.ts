// Run: bun src/i18n/negotiate.check.ts
import assert from "node:assert/strict";
import { swapLocale } from "./config";
import { fromAcceptLanguage as pick } from "./negotiate";

assert.equal(pick(null), "en", "no header -> default");
assert.equal(pick(""), "en");
assert.equal(pick("id-ID,id;q=0.9,en;q=0.8"), "id");
assert.equal(pick("en-US,en;q=0.9,id;q=0.8"), "en");
assert.equal(pick("fr-FR,fr;q=0.9,id;q=0.5"), "id", "skips unsupported");
assert.equal(pick("en;q=0.2,id;q=0.8"), "id", "sorts by q");
assert.equal(pick("in-ID"), "id", "legacy code");
assert.equal(pick("de"), "en", "nothing supported -> default");
assert.equal(pick("id;q=0,en"), "en", "q=0 means not wanted");

assert.equal(swapLocale("/en", "id"), "/id");
assert.equal(swapLocale("/en/places/3", "id"), "/id/places/3");
assert.equal(swapLocale("/places", "id"), "/id/places", "no prefix yet");
assert.equal(swapLocale("/", "en"), "/en");
console.log("negotiate ok");
