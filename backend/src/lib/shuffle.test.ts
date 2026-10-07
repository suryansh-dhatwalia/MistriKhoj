import assert from "node:assert/strict";
import test from "node:test";
import { shuffleRank } from "./shuffle.js";

const order = (seed: string) =>
  Array.from({ length: 30 }, (_, i) => i + 1).sort((a, b) => shuffleRank(seed, a) - shuffleRank(seed, b));

test("the same seed always gives the same order (stable paging)", () => {
  assert.deepEqual(order("abc"), order("abc"));
});

test("different seeds give different orders", () => {
  assert.notDeepEqual(order("abc"), order("xyz"));
});

test("ranks are within [0, 1)", () => {
  for (let id = 1; id < 200; id++) {
    const rank = shuffleRank("seed", id);
    assert.ok(rank >= 0 && rank < 1);
  }
});
