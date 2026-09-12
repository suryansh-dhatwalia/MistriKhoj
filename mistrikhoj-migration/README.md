# Mistrikhoj legacy data migration — full workflow

Moves data from the old `dbmistri` dump (phpMyAdmin/MariaDB, `tbl_*` tables)
into the new mistrikhoj schema (`mistris`, `mistri_subscriptions`, `states`,
`cities`, `categories`, `referrals`, `advertisements`, `ad_requests`, ...).

This is **not** a raw SQL import — the two schemas are shaped differently,
so a script reads the old tables, transforms each row, and inserts it into
the new tables. Everything that script does is in `scripts/migrate.js`,
heavily commented.

## What is deliberately left out (per your decisions)

- **Aadhaar numbers** — `tbl_mistri.aadhar_no` is never read, not even into
  memory. It's not a column in the new schema and it shouldn't be.
- **IP addresses** — `tbl_pageview` (IP + user-agent logging) is skipped
  entirely. Nothing from it is migrated.
- **The old admin password** — `tbl_admin.password` looks like plaintext,
  not a bcrypt hash. It is not migrated; you'll create a fresh admin account
  by hand (step 7 below).
- **GPS coordinates**, old `tags`/`remarks`/`sortby`/`created_by` fields, and
  the old per-category pricing tiers (`plan1/2/3_amt`) — no matching column
  in the new schema, so they're dropped. The actual amount each mistri paid
  is preserved individually in `mistri_subscriptions.price_inr`, so nothing
  financial is lost — just the old "menu" of prices per category.
- **tbl_rating, tbl_user, tbl_enquiry_general, tbl_views, tbl_scrolling,
  tbl_video** — no destination table exists yet for these. If you want any
  of them (per-mistri reviews, visitor logins, a general contact form,
  view counts), that's a schema addition to make later, not part of this
  migration.

## Prerequisites

- Node.js 18+
- Access to a MySQL/MariaDB server you can create a **scratch/staging**
  database on (for restoring the old dump) — never restore it into
  anything you rely on.
- A **staging copy** of your current mistrikhoj database to migrate into
  first. Don't point this at production until you've verified the results.
- A Cloudinary account (free tier is fine).
- The actual **image files** from the old server. The SQL dump only
  contains filenames (e.g. `8365450.jpg`) — the bytes live wherever the old
  site stored uploads (ask whoever hosted it, or check that server's
  `public/uploads`-style folder). Without this folder, mistris will still
  import, just with a placeholder photo instead of their real one.

## Step-by-step

### 1. Restore the old dump into a scratch database

```bash
mysql -u root -p -e "CREATE DATABASE dbmistri_legacy CHARACTER SET utf8mb4"
mysql -u root -p dbmistri_legacy < dbmistri.sql
```

This is read-only for the rest of the process — the migration script never
writes back to it.

### 2. Get the old image files onto this machine

Copy (or mount) the old server's uploads folder somewhere local, e.g.
`./old-uploads`. It should contain files like `8365450.jpg`, `5299.jpg`,
etc. — matching the filenames referenced in `tbl_mistri` and
`tbl_ads_banner`/`tbl_ads_category`.

### 3. Install dependencies

```bash
cd mistrikhoj-migration
npm install
```

### 4. Configure environment variables

```bash
cp .env.example .env
```

Fill in:
- `LEGACY_DB_*` — connection details for the scratch DB from step 1.
- `NEW_DB_*` — connection details for your **staging** mistrikhoj DB.
- `CLOUDINARY_*` — from your Cloudinary dashboard.
- `OLD_UPLOADS_DIR` — path from step 2.

### 5. Upload images to Cloudinary

```bash
npm run upload-images
```

This walks `OLD_UPLOADS_DIR`, uploads every file, and writes
`image-map.json` (filename → Cloudinary URL + public_id). It's safe to
re-run — already-uploaded files are skipped, so a failed run can just be
run again.

### 6. Run the migration against staging

```bash
npm run migrate
```

This populates, in order: `states` → `cities` → `categories` → `referrals`
→ `mistris` → `mistri_subscriptions` → `advertisements` → `ad_requests`.
It prints a summary at the end, including a list of any mistris whose
photo file wasn't found in `image-map.json` (they get a placeholder photo
instead — go back and add those files to `OLD_UPLOADS_DIR` and re-run
`upload-images` + `migrate` if you want the real ones).

The script uses `ON DUPLICATE KEY UPDATE` / explicit id-mapping so it's
safe to re-run against the same staging DB without creating duplicate
states/cities/categories/referrals. `mistris` rows are only inserted once
per run, though — don't run `migrate` twice against a DB that already has
migrated mistris in it without clearing them first, or you'll get
duplicates there.

### 7. Recreate the admin login by hand

Don't migrate `tbl_admin`. Instead, insert one row into `admins` with a
properly hashed password (however your app already does its own admin
signup/seeding — e.g. bcrypt with a reasonable cost factor), so you have a
real login for the new system.

### 8. Verify before trusting it

- Compare row counts: `SELECT COUNT(*) FROM mistris` should equal 402 (or
  whatever `tbl_mistri`'s current count is).
- Spot-check a handful of mistris across different states/categories —
  phone numbers, photos, and status should look right.
- Check the `mistrisMissingPhoto` list the script printed and decide
  whether to fix those before going live.
- Confirm `mistri_subscriptions` has exactly one row per mistri (the
  `UNIQUE` constraint enforces this, but check the plan/price values make
  sense).

### 9. Cut over

Once staging looks right, point `NEW_DB_*` at production and run
`npm run migrate` again (with a fresh `LEGACY_DB` restore if you want a
completely clean pass), or — more safely — mysqldump the verified staging
`mistrikhoj` database and restore that dump into production directly,
skipping a second run of the script.

## Files in this folder

- `scripts/upload-images-to-cloudinary.js` — step 5.
- `scripts/migrate.js` — step 6, the actual table-by-table transform. Read
  the comments at the top of the file — they list exactly what's included,
  what's excluded, and the mapping rules (status, subscription plan, etc.)
  baked into the logic.
- `.env.example` — copy to `.env` and fill in.
- `package.json` — `npm install` to get `mysql2`, `cloudinary`, `dotenv`.
