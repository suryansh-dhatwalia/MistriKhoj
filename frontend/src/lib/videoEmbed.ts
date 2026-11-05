/**
 * Turns a video link saved in Admin → Advertising → Videos into something the homepage
 * can play. Pure (no React, no DOM) so it can be unit-tested.
 *
 *   - Vimeo:   player.vimeo.com/video/ID?h=..., vimeo.com/ID, vimeo.com/ID/HASH
 *   - YouTube: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID, youtube.com/embed/ID
 *   - Direct files (.mp4 / .webm / .ogg / .mov, incl. Cloudinary) play in a <video> tag.
 *
 * Anything else, or any non-https link, returns null and is not rendered.
 */
export type VideoEmbed = { kind: 'iframe'; src: string } | { kind: 'file'; src: string };

const YOUTUBE_ID = /^[\w-]{11}$/;
const NUMERIC_ID = /^\d+$/;
const FILE_EXTENSION = /\.(mp4|webm|ogg|mov)$/i;

export function toVideoEmbed(link: string): VideoEmbed | null {
  let url: URL;
  try {
    url = new URL(link.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;

  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  const parts = url.pathname.split('/').filter(Boolean);

  if (host === 'player.vimeo.com' && parts[0] === 'video' && NUMERIC_ID.test(parts[1] ?? '')) {
    const hash = url.searchParams.get('h');
    return { kind: 'iframe', src: vimeoSrc(parts[1], hash) };
  }
  if (host === 'vimeo.com' && NUMERIC_ID.test(parts[0] ?? '')) {
    // Unlisted videos carry their privacy hash as a second path segment.
    const hash = parts[1] && /^[\da-f]+$/i.test(parts[1]) ? parts[1] : url.searchParams.get('h');
    return { kind: 'iframe', src: vimeoSrc(parts[0], hash) };
  }

  let youtubeId: string | null = null;
  if (host === 'youtu.be') youtubeId = parts[0] ?? null;
  else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    youtubeId = parts[0] === 'watch' ? url.searchParams.get('v') : ['embed', 'shorts', 'live'].includes(parts[0] ?? '') ? parts[1] ?? null : null;
  }
  if (youtubeId && YOUTUBE_ID.test(youtubeId)) {
    return { kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0` };
  }

  if (FILE_EXTENSION.test(url.pathname) || (host === 'res.cloudinary.com' && parts.includes('video'))) {
    return { kind: 'file', src: url.toString() };
  }
  return null;
}

function vimeoSrc(id: string, hash: string | null): string {
  const params = new URLSearchParams();
  if (hash && /^[\da-f]+$/i.test(hash)) params.set('h', hash);
  params.set('dnt', '1');
  return `https://player.vimeo.com/video/${id}?${params.toString()}`;
}
