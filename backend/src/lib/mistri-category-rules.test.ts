import { test } from "node:test";
import assert from "node:assert/strict";
import { MAX_EXTRA_CATEGORIES, normalizeExtraCategories } from "./mistri-category-rules.js";

test("drops the primary category, blanks and duplicates regardless of case or spacing", () => {
  assert.deepEqual(
    normalizeExtraCategories("Electrician", ["electrician", " Plumber ", "plumber", "", "AC  Repair", "AC Repair"]),
    ["Plumber", "AC Repair"],
  );
});

test("keeps the chosen order and caps the list", () => {
  const many = ["A1", "B2", "C3", "D4", "E5", "F6"];
  const result = normalizeExtraCategories("Carpenter", many);
  assert.equal(result.length, MAX_EXTRA_CATEGORIES);
  assert.deepEqual(result, many.slice(0, MAX_EXTRA_CATEGORIES));
});

test("returns an empty list when nothing extra was chosen", () => {
  assert.deepEqual(normalizeExtraCategories("Painter", []), []);
});
