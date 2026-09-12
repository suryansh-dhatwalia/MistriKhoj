type PublicUrlKey = 'VITE_API_URL' | 'VITE_PUBLIC_WEBSITE_URL';

function readPublicUrl(name: PublicUrlKey, developmentFallback: string): string {
  const value = import.meta.env[name]?.trim();

  if (!value) {
    if (import.meta.env.PROD) {
      throw new Error(`${name} must be configured for a production build.`);
    }
    return developmentFallback;
  }

  const url = new URL(value);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`${name} must use http or https.`);
  }

  return value.replace(/\/$/, '');
}

export const clientEnv = Object.freeze({
  apiUrl: readPublicUrl('VITE_API_URL', 'http://localhost:3000/api'),
  publicWebsiteUrl: readPublicUrl('VITE_PUBLIC_WEBSITE_URL', 'http://localhost:5173'),
});
