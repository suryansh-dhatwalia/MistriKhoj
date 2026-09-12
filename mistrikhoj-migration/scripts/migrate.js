/**
 * Step 2 of the migration: read the legacy dbmistri tables and write them,
 * transformed, into the new mistrikhoj schema.
 *
 * WHAT THIS SCRIPT DELIBERATELY NEVER TOUCHES (by design, not by accident —
 * these columns are never even named in a SELECT below):
 *   - tbl_mistri.aadhar_no      (Aadhaar / government ID — dropped entirely)
 *   - tbl_mistri.gps_coordinates (no destination column, almost always empty)
 *   - tbl_pageview               (IP address + user-agent tracking — whole
 *                                 table is skipped, nothing is migrated)
 *   - tbl_admin.password         (looks like plaintext, not a bcrypt hash —
 *                                 recreate admin accounts by hand instead)
 *
 * TABLES SKIPPED ENTIRELY because the new schema has no matching table yet
 * (nothing is read from these — revisit later if you want to keep them):
 *   tbl_rating, tbl_user, tbl_enquiry_general, tbl_views, tbl_scrolling,
 *   tbl_video, and tbl_category's plan1/2/3 pricing columns.
 *
 * MAPPING RULES BAKED IN (change these functions if you want different
 * behaviour):
 *   - mistri.status:   ACTIVE -> APPROVED (approved_at = date_updated)
 *                       INACTIVE -> PENDING (approved_at = null)
 *   - subscription plan: latest tbl_subscription row per mistri;
 *                       amount_paid > 0 -> PAID, otherwise -> FREE.
 *                       Mistris with NO subscription row at all get a FREE
 *                       row with price 0 (mirrors the backfill already in
 *                       your Prisma migration for brand-new signups).
 *
 * Usage:
 *   1. Restore dbmistri.sql into its own scratch database (LEGACY_DB_NAME).
 *   2. Run scripts/upload-images-to-cloudinary.js first so image-map.json exists.
 *   3. Point NEW_DB_* at a STAGING copy of your real schema, not production.
 *   4. npm install && npm run migrate
 *   5. Check the summary printed at the end, spot-check a few rows, THEN
 *      repeat against production once you're confident.
 */

require('dotenv').config();
const fs = require('fs');
const mysql = require('mysql2/promise');

const IMAGE_MAP_FILE = process.env.IMAGE_MAP_FILE || './image-map.json';
const FALLBACK_PROFILE_PHOTO_URL =
  process.env.FALLBACK_PROFILE_PHOTO_URL ||
  'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg';

function loadImageMap() {
  if (!fs.existsSync(IMAGE_MAP_FILE)) {
    console.warn(
      `WARNING: ${IMAGE_MAP_FILE} not found — every photo will fall back to the placeholder URL.\n` +
      'Run scripts/upload-images-to-cloudinary.js first if you want real photos.'
    );
    return {};
  }
  return JSON.parse(fs.readFileSync(IMAGE_MAP_FILE, 'utf8'));
}

function cleanPhone(raw) {
  if (!raw) return '';
  return String(raw).replace(/\s+/g, '').trim();
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 75) || 'category';
}

async function main() {
  const legacy = await mysql.createConnection({
    host: process.env.LEGACY_DB_HOST,
    port: Number(process.env.LEGACY_DB_PORT || 3306),
    user: process.env.LEGACY_DB_USER,
    password: process.env.LEGACY_DB_PASSWORD,
    database: process.env.LEGACY_DB_NAME,
  });
  const db = await mysql.createConnection({
    host: process.env.NEW_DB_HOST,
    port: Number(process.env.NEW_DB_PORT || 3306),
    user: process.env.NEW_DB_USER,
    password: process.env.NEW_DB_PASSWORD,
    database: process.env.NEW_DB_NAME,
  });

  const imageMap = loadImageMap();
  const summary = {
    states: 0, cities: 0, categories: 0, referrals: 0,
    mistris: 0, subscriptions: 0, advertisements: 0, adRequests: 0,
    mistrisMissingPhoto: [],
  };

  try {
    // ---------------------------------------------------------------
    // 1. States
    // ---------------------------------------------------------------
    const [oldStates] = await legacy.query(
      'SELECT id, state, status FROM tbl_state'
    );
    for (const s of oldStates) {
      await db.execute(
        `INSERT INTO states (name, code, status, created_at, updated_at)
         VALUES (?, ?, ?, NOW(3), NOW(3))
         ON DUPLICATE KEY UPDATE status = VALUES(status)`,
        [s.state.trim(), s.state.trim().slice(0, 8).toUpperCase(), s.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE']
      );
    }
    summary.states = oldStates.length;

    const [newStates] = await db.query('SELECT id, name FROM states');
    const stateIdByName = new Map(newStates.map((r) => [r.name.trim().toLowerCase(), r.id]));

    // ---------------------------------------------------------------
    // 2. Cities
    // ---------------------------------------------------------------
    const [oldCities] = await legacy.query(
      'SELECT id, state, city, status FROM tbl_city'
    );
    for (const c of oldCities) {
      const stateId = stateIdByName.get(c.state.trim().toLowerCase());
      if (!stateId) {
        console.warn(`  skipping city "${c.city}" — unknown state "${c.state}"`);
        continue;
      }
      await db.execute(
        `INSERT INTO cities (state_id, name, status, created_at, updated_at)
         VALUES (?, ?, ?, NOW(3), NOW(3))
         ON DUPLICATE KEY UPDATE status = VALUES(status)`,
        [stateId, c.city.trim(), c.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE']
      );
    }
    summary.cities = oldCities.length;

    // ---------------------------------------------------------------
    // 3. Categories (name/status only — the old plan1/2/3 pricing columns
    //    have no destination column and are intentionally not read here)
    // ---------------------------------------------------------------
    const [oldCategories] = await legacy.query(
      'SELECT id, category, status FROM tbl_category'
    );
    const seenSlugs = new Set();
    for (const c of oldCategories) {
      let slug = slugify(c.category);
      let n = 1;
      while (seenSlugs.has(slug)) slug = `${slugify(c.category)}-${n++}`;
      seenSlugs.add(slug);
      await db.execute(
        `INSERT INTO categories (slug, name, status, created_at, updated_at)
         VALUES (?, ?, ?, NOW(3), NOW(3))
         ON DUPLICATE KEY UPDATE status = VALUES(status)`,
        [slug, c.category.trim(), c.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE']
      );
    }
    summary.categories = oldCategories.length;

    // ---------------------------------------------------------------
    // 4. Referrals
    // ---------------------------------------------------------------
    const [oldReferrals] = await legacy.query(
      'SELECT referral_code, referral_name, referral_phone, referral_status FROM tbl_referral'
    );
    for (const r of oldReferrals) {
      await db.execute(
        `INSERT INTO referrals (code, name, phone, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, NOW(3), NOW(3))
         ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), status = VALUES(status)`,
        [
          r.referral_code.trim(),
          r.referral_name.trim(),
          cleanPhone(r.referral_phone),
          r.referral_status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
        ]
      );
    }
    summary.referrals = oldReferrals.length;

    // ---------------------------------------------------------------
    // 5. Mistris
    //    Note the explicit column list below — aadhar_no and
    //    gps_coordinates are NOT in it, on purpose.
    // ---------------------------------------------------------------
    const [oldMistris] = await legacy.query(
      `SELECT id, state, city, category, name, phone_no, alternate_no, qualification,
              address, experience, tags, about, profile_pic, gallery1, gallery2, gallery3,
              referral_code, status, date_created, date_updated
       FROM tbl_mistri`
    );

    const oldToNewMistriId = new Map();

    for (const m of oldMistris) {
      const experienceYears = parseInt(m.experience, 10) || 0;

      const shortIntro = [m.about, m.tags].map((v) => (v || '').trim()).filter(Boolean).join(' | ') || null;

      // services_offered is a required JSON array with no clean source column
      // in the old data — default it to a single-item array from category.
      // Adjust this if you'd rather split m.tags on commas instead.
      const servicesOffered = JSON.stringify([m.category.trim()]);

      const photo = imageMap[m.profile_pic];
      if (!photo) summary.mistrisMissingPhoto.push({ oldId: m.id, name: m.name, file: m.profile_pic });
      const profilePhotoUrl = photo ? photo.url : FALLBACK_PROFILE_PHOTO_URL;
      const profilePhotoPublicId = photo ? photo.public_id : null;

      const galleryImages = [m.gallery1, m.gallery2, m.gallery3]
        .filter(Boolean)
        .map((f) => imageMap[f])
        .filter(Boolean)
        .map((img) => img.url);

      const status = m.status === 'ACTIVE' ? 'APPROVED' : 'PENDING';
      const approvedAt = status === 'APPROVED' ? m.date_updated : null;

      const [result] = await db.execute(
        `INSERT INTO mistris
           (state, city, category, full_name, primary_phone, alternate_phone, qualification,
            address, experience_years, services_offered, short_intro,
            profile_photo_url, profile_photo_public_id, gallery_images,
            referral_code, terms_accepted_at, terms_version, status, approved_at,
            created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          m.state.trim(),
          m.city.trim(),
          m.category.trim(),
          m.name.trim(),
          cleanPhone(m.phone_no),
          m.alternate_no ? cleanPhone(m.alternate_no) : null,
          m.qualification || '',
          m.address || '',
          experienceYears,
          servicesOffered,
          shortIntro,
          profilePhotoUrl,
          profilePhotoPublicId,
          galleryImages.length ? JSON.stringify(galleryImages) : null,
          m.referral_code || null,
          m.date_created,
          'v1.0',
          status,
          approvedAt,
          m.date_created,
          m.date_updated,
        ]
      );
      oldToNewMistriId.set(m.id, result.insertId);
    }
    summary.mistris = oldMistris.length;

    // ---------------------------------------------------------------
    // 6. Subscriptions — one row per mistri (matches the UNIQUE constraint).
    //    Take the latest tbl_subscription row per mistri; if a mistri has
    //    none, backfill a FREE row exactly like new signups get.
    // ---------------------------------------------------------------
    const [oldSubs] = await legacy.query(
      `SELECT mistri_id, date_subscribed, amount_paid, valid_till
       FROM tbl_subscription
       ORDER BY mistri_id, date_subscribed DESC`
    );
    const latestSubByOldMistriId = new Map();
    for (const s of oldSubs) {
      if (!latestSubByOldMistriId.has(s.mistri_id)) {
        latestSubByOldMistriId.set(s.mistri_id, s); // first row per mistri_id = latest, thanks to ORDER BY
      }
    }

    for (const m of oldMistris) {
      const newMistriId = oldToNewMistriId.get(m.id);
      const sub = latestSubByOldMistriId.get(m.id);

      const plan = sub && Number(sub.amount_paid) > 0 ? 'PAID' : 'FREE';
      const priceInr = sub ? Math.round(Number(sub.amount_paid) || 0) : 0;
      const startsAt = sub ? sub.date_subscribed : null;
      const expiresAt = sub ? sub.valid_till : null;

      await db.execute(
        `INSERT INTO mistri_subscriptions
           (mistri_id, plan, state, city, category, price_inr, starts_at, expires_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3))
         ON DUPLICATE KEY UPDATE plan = VALUES(plan), price_inr = VALUES(price_inr),
           starts_at = VALUES(starts_at), expires_at = VALUES(expires_at)`,
        [newMistriId, plan, m.state.trim(), m.city.trim(), m.category.trim(), priceInr, startsAt, expiresAt]
      );
      summary.subscriptions++;
    }

    // ---------------------------------------------------------------
    // 7. Advertisements — tbl_ads_banner (home banner) + tbl_ads_category
    //    (state/city/category targeted) collapse into one table.
    // ---------------------------------------------------------------
    const [oldBanners] = await legacy.query(
      'SELECT id, link, sortby, status FROM tbl_ads_banner'
    );
    for (const b of oldBanners) {
      const img = imageMap[b.link];
      await db.execute(
        `INSERT INTO advertisements
           (placement, image_url, image_public_id, sort_order, status, created_at, updated_at)
         VALUES ('HOME_BANNER', ?, ?, ?, ?, NOW(3), NOW(3))`,
        [img ? img.url : null, img ? img.public_id : null, b.sortby, b.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE']
      );
      summary.advertisements++;
    }

    const [oldCategoryAds] = await legacy.query(
      `SELECT id, state, city, category, ad_type, link, embed_code, sortby, status
       FROM tbl_ads_category`
    );
    for (const a of oldCategoryAds) {
      const img = imageMap[a.link];
      // tbl_ads_category stores a Vimeo iframe embed for video ads — pull the
      // player URL out of it if present, otherwise this is an image ad.
      const videoMatch = (a.embed_code || '').match(/src="([^"]+)"/);
      await db.execute(
        `INSERT INTO advertisements
           (placement, image_url, image_public_id, video_url, state, city, category,
            sort_order, status, created_at, updated_at)
         VALUES ('CATEGORY', ?, ?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3))`,
        [
          a.ad_type === 'VIDEO' ? null : (img ? img.url : null),
          a.ad_type === 'VIDEO' ? null : (img ? img.public_id : null),
          a.ad_type === 'VIDEO' && videoMatch ? videoMatch[1] : null,
          a.state.trim(),
          a.city.trim(),
          a.category.trim(),
          a.sortby,
          a.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
        ]
      );
      summary.advertisements++;
    }

    // ---------------------------------------------------------------
    // 8. Ad requests (advertiser enquiries)
    // ---------------------------------------------------------------
    const [oldAdEnquiries] = await legacy.query(
      `SELECT business_name, phone_number, email_address, status, remarks
       FROM tbl_enquiry_advertise`
    );
    const adStatusMap = { NEW: 'NEW', CONTACTED: 'CONTACTED', APPROVED: 'APPROVED', REJECTED: 'REJECTED' };
    for (const e of oldAdEnquiries) {
      await db.execute(
        `INSERT INTO ad_requests
           (company_name, contact_number, email, ad_type, duration, message, status, created_at, updated_at)
         VALUES (?, ?, ?, 'GENERAL', 'N/A', ?, ?, NOW(3), NOW(3))`,
        [
          e.business_name.trim(),
          cleanPhone(e.phone_number),
          e.email_address.trim(),
          e.remarks || null,
          adStatusMap[e.status] || 'NEW',
        ]
      );
      summary.adRequests++;
    }

    // ---------------------------------------------------------------
    // Summary
    // ---------------------------------------------------------------
    console.log('\n=== Migration complete ===');
    console.log(summary);
    console.log('\nTables intentionally NOT migrated (no destination / explicitly excluded):');
    console.log('  tbl_pageview (IP addresses), tbl_admin (plaintext-looking password),');
    console.log('  tbl_mistri.aadhar_no / gps_coordinates, tbl_rating, tbl_user,');
    console.log('  tbl_enquiry_general, tbl_views, tbl_scrolling, tbl_video,');
    console.log('  tbl_category plan1/2/3 pricing columns.');
    if (summary.mistrisMissingPhoto.length) {
      console.log(`\n${summary.mistrisMissingPhoto.length} mistris got the FALLBACK photo (file not found in image-map.json):`);
      for (const m of summary.mistrisMissingPhoto.slice(0, 20)) {
        console.log(`  old id ${m.oldId} (${m.name}) — missing file "${m.file}"`);
      }
      if (summary.mistrisMissingPhoto.length > 20) {
        console.log(`  ...and ${summary.mistrisMissingPhoto.length - 20} more.`);
      }
    }
  } finally {
    await legacy.end();
    await db.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
