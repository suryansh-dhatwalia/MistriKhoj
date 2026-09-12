# MistriKhoj

MistriKhoj contains a public React website, a protected React admin dashboard, and a shared Express, Prisma, and MySQL API.

The deployment is intentionally simple for current traffic and can grow without an application-level registration limit.

## Requirements

- Node.js 20.19 or newer; Node.js 22 LTS is recommended.
- MySQL or MariaDB.
- Cloudinary credentials when image or video uploads are enabled.

## Local development

Copy each environment example to an environment file and fill in the real values. Never commit environment files.

Install dependencies:

    npm --prefix frontend ci
    npm --prefix admin ci
    npm --prefix backend ci

Run the backend, public site, and admin site in separate terminals:

    npm --prefix backend run dev
    npm --prefix frontend run dev
    npm --prefix admin run dev

The defaults are ports 3000, 5173, and 5174 respectively.

## Release verification

Run this from the repository root:

    npm run check

It checks TypeScript, runs backend validation tests, and builds all three applications.

## Production

For the backend, configure backend/.env from backend/.env.example, then run:

    npm ci
    npm run prisma:migrate:deploy
    npm run build
    npm start

The backend runs compiled JavaScript from dist. Use /api/health for liveness and /api/ready for database readiness.

For each frontend, set its VITE variables before running npm ci and npm run build. Publish its dist directory on a static host and configure unknown routes to fall back to index.html.

The backend ADMIN_URL must exactly match the admin website origin. Use ADMIN_COOKIE_SAME_SITE=none only when the admin and API are on different sites and both use HTTPS. Otherwise, lax is preferred.

Before each release, back up the database, deploy migrations, run npm run check, and retain server logs containing requestId values for troubleshooting.

