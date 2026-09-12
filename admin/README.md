# MistriKhoj admin dashboard

The protected React administration application runs locally on port 5174.

Copy .env.example to .env, set VITE_API_URL and VITE_PUBLIC_WEBSITE_URL, install dependencies with npm ci, and run npm run dev.

For production, run npm run build and publish the dist directory on a static website host. Configure unknown routes to fall back to index.html. The backend ADMIN_URL must exactly match the deployed admin origin.
