# MistriKhoj public website

The public React application runs locally on port 5173.

Copy .env.example to .env, set VITE_API_URL, install dependencies with npm ci, and run npm run dev.

For production, run npm run build and publish the dist directory on a static website host. Configure unknown routes to fall back to index.html. See the repository README for the full release checklist.
