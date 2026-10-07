/**
 * Verifies that a base64 data URL really contains the kind of file its MIME type claims,
 * by checking the file's magic bytes. The declared `data:<mime>` prefix alone is trivially
 * forgeable. Plain https URLs are not inspected here.
 */

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0) =>
  signature.every((byte, index) => bytes[offset + index] === byte);

const ascii = (bytes: Uint8Array, text: string, offset: number) =>
  [...text].every((char, index) => bytes[offset + index] === char.charCodeAt(0));

const SIGNATURES: Record<string, (bytes: Uint8Array) => boolean> = {
  "image/png": (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  "image/jpeg": (b) => startsWith(b, [0xff, 0xd8, 0xff]),
  "image/jpg": (b) => startsWith(b, [0xff, 0xd8, 0xff]),
  "image/webp": (b) => ascii(b, "RIFF", 0) && ascii(b, "WEBP", 8),
  "video/mp4": (b) => ascii(b, "ftyp", 4),
  "video/quicktime": (b) => ascii(b, "ftyp", 4) || ascii(b, "moov", 4) || ascii(b, "wide", 4),
  "video/webm": (b) => startsWith(b, [0x1a, 0x45, 0xdf, 0xa3]),
  "video/ogg": (b) => ascii(b, "OggS", 0),
};

/** True for non-data URLs, or for a data URL whose bytes match its declared type. */
export function dataUrlMatchesDeclaredType(value: string): boolean {
  const match = /^data:([a-z0-9+.\/-]+);base64,([A-Za-z0-9+/=\s]*)$/i.exec(value);
  if (!match) return !value.startsWith("data:");
  const check = SIGNATURES[match[1].toLowerCase()];
  if (!check) return false;
  // 16 base64 chars decode to 12 bytes — enough for every signature above.
  const head = Buffer.from(match[2].replace(/\s/g, "").slice(0, 24), "base64");
  return check(new Uint8Array(head));
}
