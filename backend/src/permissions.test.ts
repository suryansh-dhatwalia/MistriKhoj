import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import test, { after, before } from "node:test";

/**
 * Black-box permission checks against the real Express app. Requests without an admin
 * session cookie must be rejected before any database access, so no database is needed.
 */
let base = "";
let close: () => Promise<void>;

before(async () => {
  process.env.DATABASE_URL ??= "mysql://test:test@127.0.0.1:3306/test";
  process.env.NODE_ENV = "test";
  const { app } = await import("./app.js");
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  close = () => new Promise((resolve) => server.close(() => resolve()));
});

after(async () => {
  await close?.();
  // The Prisma pool is lazy and never connected; exit explicitly so the runner does not wait.
  setTimeout(() => process.exit(0), 50).unref();
});

const adminHeaders = { "x-mistrikhoj-admin": "1", "content-type": "application/json" };

const protectedRoutes: Array<[string, string]> = [
  ["GET", "/api/admin/ads"],
  ["GET", "/api/admin/ads/1"],
  ["POST", "/api/admin/ads"],
  ["PATCH", "/api/admin/ads/1"],
  ["PATCH", "/api/admin/ads/1/status"],
  ["DELETE", "/api/admin/ads/1"],
  ["GET", "/api/admin/ads/rate-card"],
  ["PUT", "/api/admin/ads/rate-card"],
  ["GET", "/api/admin/analytics/overview"],
  ["GET", "/api/admin/mistris?status=APPROVED&sortBy=views"],
];

for (const [method, path] of protectedRoutes) {
  test(`${method} ${path} requires an admin session`, async () => {
    const response = await fetch(base + path, {
      method,
      headers: adminHeaders,
      body: method === "GET" || method === "DELETE" ? undefined : "{}",
    });
    assert.equal(response.status, 401);
  });
}

test("admin writes from a non-admin origin are refused before auth", async () => {
  const response = await fetch(`${base}/api/admin/ads`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://evil.example" },
    body: "{}",
  });
  assert.equal(response.status, 403);
});

test("public analytics endpoints ignore garbage without erroring", async () => {
  const response = await fetch(`${base}/api/analytics/page-view`, {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": "curl/8.0" },
    body: JSON.stringify({ path: "/wp-admin" }),
  });
  assert.equal(response.status, 202);
  const body = (await response.json()) as { counted: boolean };
  assert.equal(body.counted, false);
});
