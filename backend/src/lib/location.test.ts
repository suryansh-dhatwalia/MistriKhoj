import assert from "node:assert/strict";
import test from "node:test";
import { sameLocation, slugify } from "./location.js";

test("slugify makes URL-safe location slugs", () => {
  assert.equal(slugify("Uttar Pradesh"), "uttar-pradesh");
  assert.equal(slugify("  Guwahati "), "guwahati");
  assert.equal(slugify("Jammu & Kashmir"), "jammu-and-kashmir");
});

test("sameLocation ignores case, spacing and slug vs name", () => {
  assert.equal(sameLocation("Assam", "assam"), true);
  assert.equal(sameLocation("Uttar Pradesh", "uttar-pradesh"), true);
  assert.equal(sameLocation("Assam", "Bihar"), false);
  assert.equal(sameLocation(null, "Assam"), false);
});
