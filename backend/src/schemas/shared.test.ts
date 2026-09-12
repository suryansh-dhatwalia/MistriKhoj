import assert from "node:assert/strict";
import test from "node:test";
import { httpUrlSchema, imageInputSchema, mediaInputSchema, phoneSchema } from "./shared.js";

test("normalises valid Indian phone numbers", () => {
  assert.equal(phoneSchema.parse("+91 98765 43210"), "9876543210");
  assert.equal(phoneSchema.safeParse("12345").success, false);
});

test("only accepts safe public URLs", () => {
  assert.equal(httpUrlSchema().safeParse("https://example.com/page").success, true);
  assert.equal(httpUrlSchema().safeParse("http://localhost:3000/page").success, true);
  assert.equal(httpUrlSchema().safeParse("http://example.com/page").success, false);
  assert.equal(httpUrlSchema().safeParse("javascript:alert(1)").success, false);
});

test("accepts supported image and video uploads", () => {
  assert.equal(imageInputSchema.safeParse("data:image/png;base64,iVBORw0KGgo=").success, true);
  assert.equal(mediaInputSchema.safeParse("data:video/mp4;base64,AAAA").success, true);
  assert.equal(mediaInputSchema.safeParse("data:text/html;base64,AAAA").success, false);
});
