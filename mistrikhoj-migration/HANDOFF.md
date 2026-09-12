# Handoff: mistrikhoj legacy data migration

Paste this whole file to your local Claude (VS Code / Claude Code extension) as
context, along with the other files in this folder. This explains what the
project is, what's already been decided, and what to do next.

## What this is

Migrating data from an old legacy database (`dbmistri.sql`, a phpMyAdmin/
MariaDB dump with `tbl_*` tables — an old PHP admin system for "Mistri Khoj",
a directory of local technicians in India) into a new schema (Prisma-managed,
tables like `mistris`, `mistri_subscriptions`, `states`, `cities`,
`categories`, `referrals`, `advertisements`, `ad_requests`).

The two schemas are shaped differently, so this is a transform-and-load job:
a Node.js script reads the old tables and writes transformed rows into the
new ones. It is NOT a raw SQL import.

## Decisions already made (do not re-litigate these unless the user says otherwise)

- **No Aadhaar numbers.** The old `tbl_mistri.aadhar_no` column (Indian
  government ID numbers) must never be read or migrated anywhere. It isn't
  a column in the new schema, and the migration script never selects it.
- **No IP addresses.** The old `tbl_pageview` table (IP address + user-agent
  logging) is skipped entirely — not migrated at all.
- **Old admin password not migrated.** `tbl_admin.password` looks like
  plaintext, not a bcrypt hash. A fresh admin account should be created by
  hand instead of copying this row.
- **Images go through Cloudinary.** The old dump only has filenames (e.g.
  `8365450.jpg`), not image bytes. Images must be uploaded to Cloudinary
  first, producing a `filename -> {url, public_id}` map, which the main
  migration script then uses to fill in `profile_photo_url`,
  `profile_photo_public_id`, `gallery_images`, and advertisement image URLs.
- **Mistri status mapping:** old `ACTIVE` -> new `APPROVED` (with
  `approved_at` = old `date_updated`); old `INACTIVE` -> new `PENDING`.
- **Subscription plan mapping:** for each mistri, take their most recent
  `tbl_subscription` row. If `amount_paid > 0` -> `PAID`, otherwise -> `FREE`.
  A mistri with no subscription row at all gets a `FREE` row with price 0.
- **Tables intentionally dropped** (no destination table exists yet in the
  new schema, and the user has not asked to preserve them):
  `tbl_rating`, `tbl_user`, `tbl_enquiry_general`, `tbl_views`,
  `tbl_scrolling`, `tbl_video`, and `tbl_category`'s old per-category
  pricing columns (`plan1/2/3_amt` etc — the actual amount each mistri paid
  is still preserved individually via `mistri_subscriptions.price_inr`).

## Files in this folder

- `README.md` — full step-by-step workflow (restore dump, install deps,
  configure env, upload images, run migration, verify, cut over).
- `package.json` — dependencies: `mysql2`, `cloudinary`, `dotenv`.
- `.env` — already has the user's real Cloudinary credentials filled in.
  Still needs `LEGACY_DB_*`, `NEW_DB_*`, and `OLD_UPLOADS_DIR` filled in
  before the full migration can run (Cloudinary upload alone only needs
  `CLOUDINARY_*` and `OLD_UPLOADS_DIR`).
- `scripts/upload-images-to-cloudinary.js` — walks `OLD_UPLOADS_DIR`,
  uploads every file to Cloudinary, writes `image-map.json`. Resumable —
  safe to re-run, already-uploaded files are skipped.
- `scripts/migrate.js` — the main transform: reads every old table (via a
  connection to a scratch/staging copy of the legacy DB) and writes into the
  new schema (via a connection to a staging copy of the new DB — never run
  this against production first). Heavily commented with exactly which
  columns are read/excluded and why.

## Current status / what's been done so far

- The full schema comparison and mapping was already worked out (see
  README.md and the comments in `migrate.js` — read those before assuming
  anything needs re-deriving).
- The scripts were written and syntax-checked (`node --check`), but never
  actually run end-to-end, because the environment they were built in has
  no outbound network access to npm or Cloudinary (an org network policy
  in that cloud sandbox — not relevant to a local machine).
- The user tested with a small sample: 36 photos from their real image
  folder, zipped and shared, to prove the upload step works before running
  it against the full folder. They said to **hold off on the rest of the
  photos for now** — just get the pipeline working end-to-end on this
  sample first.

## What to do next

1. Confirm `npm install` works locally (this needs real internet access,
   which — unlike that cloud sandbox — your local machine should have).
2. Set `OLD_UPLOADS_DIR` in `.env` to the path of the user's local folder
   containing those sample photos (they have the original folder on their
   own machine already — no need to re-transfer anything).
3. Run `npm run upload-images` and confirm `image-map.json` gets created
   with entries for the sample photos.
4. Stop there and check in with the user before doing anything with the
   full photo folder, the legacy database restore, or `migrate.js` against
   any real database — those are bigger, harder-to-undo steps and the user
   has been explicit about wanting to review before changes happen.
5. When the user is ready to go further: restore `dbmistri.sql` into a
   scratch/staging MySQL database, fill in `LEGACY_DB_*` and `NEW_DB_*` in
   `.env` (staging copy of the new DB, not production), and follow the rest
   of README.md.

## Working style the user expects

They've asked to be told what's about to happen *before* any change is
made — to files, to a database, anything — rather than changes happening
silently. Narrate the plan, get a go-ahead, then act.
