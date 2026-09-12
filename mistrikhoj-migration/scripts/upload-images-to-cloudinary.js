/**
 * Step 1 of the migration: re-host every image the old database references.
 *
 * The dump (dbmistri.sql) only ever stores filenames like "8365450.jpg" in
 * tbl_mistri.profile_pic / gallery1-3, tbl_ads_banner.link, and
 * tbl_ads_category.link. The actual image BYTES are not in the SQL file —
 * they live in a folder on the old server (wherever it kept uploads).
 *
 * This script walks that folder, uploads every file to Cloudinary, and
 * writes a lookup file (image-map.json) of:
 *   { "8365450.jpg": { "url": "https://res.cloudinary.com/.../8365450.jpg",
 *                        "public_id": "mistrikhoj/8365450" } }
 *
 * migrate.js reads that file to fill in profile_photo_url / gallery_images /
 * advertisements.image_url when it inserts rows into the new schema.
 *
 * Usage:
 *   1. Copy .env.example to .env and fill in CLOUDINARY_* and OLD_UPLOADS_DIR.
 *   2. npm install
 *   3. npm run upload-images
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

const OLD_UPLOADS_DIR = process.env.OLD_UPLOADS_DIR || './old-uploads';
const IMAGE_MAP_FILE = process.env.IMAGE_MAP_FILE || './image-map.json';
const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'mistrikhoj';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

async function uploadOne(filePath) {
  const filename = path.basename(filePath);
  const publicId = `${CLOUDINARY_FOLDER}/${path.parse(filename).name}`;
  const result = await cloudinary.uploader.upload(filePath, {
    public_id: publicId,
    overwrite: false,
    resource_type: 'image',
  });
  return { filename, url: result.secure_url, public_id: result.public_id };
}

async function main() {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.error('Missing CLOUDINARY_CLOUD_NAME (and API key/secret) in .env — nothing to do.');
    process.exit(1);
  }
  if (!fs.existsSync(OLD_UPLOADS_DIR)) {
    console.error(
      `OLD_UPLOADS_DIR "${OLD_UPLOADS_DIR}" does not exist.\n` +
      'This script needs the actual image files from the old server (the SQL dump only has filenames, not bytes).\n' +
      'Point OLD_UPLOADS_DIR at that folder and re-run.'
    );
    process.exit(1);
  }

  // Resume support: keep whatever was already uploaded on a previous run.
  let map = {};
  if (fs.existsSync(IMAGE_MAP_FILE)) {
    map = JSON.parse(fs.readFileSync(IMAGE_MAP_FILE, 'utf8'));
    console.log(`Resuming — ${Object.keys(map).length} files already uploaded previously.`);
  }

  const files = walk(OLD_UPLOADS_DIR).filter((f) => !path.basename(f).startsWith('.'));
  console.log(`Found ${files.length} files under ${OLD_UPLOADS_DIR}.`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const filePath of files) {
    const filename = path.basename(filePath);
    if (map[filename]) {
      skipped++;
      continue;
    }
    try {
      const result = await uploadOne(filePath);
      map[filename] = { url: result.url, public_id: result.public_id };
      uploaded++;
      if (uploaded % 25 === 0) {
        fs.writeFileSync(IMAGE_MAP_FILE, JSON.stringify(map, null, 2));
        console.log(`  ...${uploaded} uploaded so far (checkpoint saved)`);
      }
    } catch (err) {
      failed++;
      console.error(`  FAILED: ${filename} — ${err.message}`);
    }
  }

  fs.writeFileSync(IMAGE_MAP_FILE, JSON.stringify(map, null, 2));
  console.log('\nDone.');
  console.log(`  uploaded this run: ${uploaded}`);
  console.log(`  already had:       ${skipped}`);
  console.log(`  failed:             ${failed}`);
  console.log(`  total in map now:   ${Object.keys(map).length}`);
  console.log(`  map written to:     ${IMAGE_MAP_FILE}`);
  if (failed > 0) {
    console.log('\nRe-run this script to retry the failed ones (already-uploaded files are skipped).');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
