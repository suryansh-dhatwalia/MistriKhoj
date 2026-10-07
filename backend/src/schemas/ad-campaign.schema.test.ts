import assert from "node:assert/strict";
import test from "node:test";
import { adCampaignSchema, adminAdListQuerySchema, analyticsQuerySchema } from "./ad-campaign.schema.js";

const PNG = `data:image/png;base64,${Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]).toString("base64")}`;
const base = { scope: "HOME", title: "Mistri Tools Sale", image: PNG };

const issuePaths = (input: unknown) => {
  const result = adCampaignSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join("."));
};

test("accepts a valid homepage ad", () => {
  assert.equal(adCampaignSchema.safeParse(base).success, true);
});

test("a city-targeted ad needs a city (and a state)", () => {
  assert.ok(issuePaths({ ...base, scope: "CITY", state: "Assam" }).includes("city"));
  assert.ok(issuePaths({ ...base, scope: "CITY", city: "Guwahati" }).includes("state"));
  assert.equal(adCampaignSchema.safeParse({ ...base, scope: "CITY", state: "Assam", city: "Guwahati" }).success, true);
});

test("a state-wide ad needs a state", () => {
  assert.ok(issuePaths({ ...base, scope: "STATE" }).includes("state"));
  assert.equal(adCampaignSchema.safeParse({ ...base, scope: "STATE", state: "Assam" }).success, true);
});

test("end date must be after start date; empty dates mean unscheduled", () => {
  assert.ok(issuePaths({ ...base, startsAt: "2026-10-10", endsAt: "2026-10-09" }).includes("endsAt"));
  const open = adCampaignSchema.parse({ ...base, startsAt: "", endsAt: "" });
  assert.equal(open.startsAt, null);
  assert.equal(open.endsAt, null);
});

test("upload checks: wrong file contents, both media, oversized or unsafe values are rejected", () => {
  const disguised = `data:image/png;base64,${Buffer.from("<html>not a png at all</html>").toString("base64")}`;
  assert.ok(issuePaths({ ...base, image: disguised }).includes("image"));
  const mp4 = `data:video/mp4;base64,${Buffer.from([0, 0, 0, 0x18, ...Buffer.from("ftypmp42")]).toString("base64")}`;
  assert.ok(issuePaths({ ...base, video: mp4 }).includes("video")); // image + video together
  assert.equal(adCampaignSchema.safeParse({ ...base, image: undefined, video: mp4 }).success, true);
  assert.ok(issuePaths({ ...base, image: "javascript:alert(1)" }).includes("image"));
  assert.ok(issuePaths({ ...base, linkUrl: "http://evil.example" }).includes("linkUrl"));
});

test("price must be a non-negative whole number", () => {
  assert.ok(issuePaths({ ...base, priceInr: -5 }).includes("priceInr"));
  assert.ok(issuePaths({ ...base, priceInr: 10.5 }).includes("priceInr"));
  assert.equal(adCampaignSchema.parse({ ...base, priceInr: "2500" }).priceInr, 2500);
  assert.equal(adCampaignSchema.parse(base).priceInr, undefined);
});

test("list and analytics queries tolerate junk filters", () => {
  assert.equal(adminAdListQuerySchema.parse({ scope: "NOPE", lifecycle: "??" }).scope, undefined);
  assert.equal(analyticsQuerySchema.parse({ limit: "9999" }).limit, 10);
});
