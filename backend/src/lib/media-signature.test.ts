import assert from "node:assert/strict";
import test from "node:test";
import { dataUrlMatchesDeclaredType } from "./media-signature.js";

const b64 = (bytes: number[]) => Buffer.from(bytes).toString("base64");
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0];

test("accepts files whose bytes match their declared type", () => {
  assert.equal(dataUrlMatchesDeclaredType(`data:image/png;base64,${b64(PNG)}`), true);
  assert.equal(dataUrlMatchesDeclaredType(`data:image/jpeg;base64,${b64([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0])}`), true);
  const mp4 = [0, 0, 0, 0x18, ...Buffer.from("ftypmp42")];
  assert.equal(dataUrlMatchesDeclaredType(`data:video/mp4;base64,${b64(mp4)}`), true);
  const webp = [...Buffer.from("RIFF"), 0, 0, 0, 0, ...Buffer.from("WEBP")];
  assert.equal(dataUrlMatchesDeclaredType(`data:image/webp;base64,${b64(webp)}`), true);
});

test("rejects mislabelled or disguised uploads", () => {
  const html = [...Buffer.from("<html><script>alert(1)</script>")];
  assert.equal(dataUrlMatchesDeclaredType(`data:image/png;base64,${b64(html)}`), false);
  assert.equal(dataUrlMatchesDeclaredType(`data:video/mp4;base64,${b64(PNG)}`), false);
  assert.equal(dataUrlMatchesDeclaredType(`data:image/svg+xml;base64,${b64(html)}`), false);
  assert.equal(dataUrlMatchesDeclaredType("data:text/html;base64,PGh0bWw+"), false);
});

test("plain https URLs are not inspected", () => {
  assert.equal(dataUrlMatchesDeclaredType("https://res.cloudinary.com/x/ad.png"), true);
});
