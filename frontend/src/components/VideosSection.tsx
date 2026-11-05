import React from 'react';
import { PlayCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useContent } from '../context/ContentContext';
import { toVideoEmbed } from '../lib/videoEmbed';

/**
 * Homepage videos, managed in Admin → Advertising → Videos (Advertisement rows with
 * placement VIDEO, served by /api/content/videos). Renders nothing when there are none.
 */
export const VideosSection: React.FC = () => {
  const { t } = useLanguage();
  const { videos } = useContent();

  const playable = videos
    .map((video) => ({ ...video, embed: toVideoEmbed(video.link) }))
    .filter((video): video is typeof video & { embed: NonNullable<typeof video.embed> } => video.embed !== null);

  if (playable.length === 0) return null;

  const single = playable.length === 1;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" aria-labelledby="home-videos-heading">
      <div className="mb-5 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <PlayCircle className="h-5 w-5 text-[#FFB800]" aria-hidden="true" />
          <h2 id="home-videos-heading" className="text-xl font-black tracking-tight text-[#161616] sm:text-2xl">
            {t('home_videos_title', 'MistriKhoj Videos')}
          </h2>
        </div>
        <p className="text-sm text-gray-600">
          {t('home_videos_subtitle', 'See how MistriKhoj connects customers directly with trusted local Mistris.')}
        </p>
      </div>

      <div className={single ? 'mx-auto max-w-4xl' : 'grid grid-cols-1 gap-5 md:grid-cols-2'}>
        {playable.map((video) => (
          <figure
            key={video.id}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="relative aspect-video w-full bg-[#161616]">
              {video.embed.kind === 'iframe' ? (
                <iframe
                  src={video.embed.src}
                  title={video.title || 'MistriKhoj video'}
                  loading="lazy"
                  allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="absolute inset-0 h-full w-full border-0"
                />
              ) : (
                <video
                  src={video.embed.src}
                  controls
                  preload="metadata"
                  playsInline
                  className="absolute inset-0 h-full w-full object-contain"
                  aria-label={video.title || 'MistriKhoj video'}
                />
              )}
            </div>
            {video.title && (
              <figcaption className="flex items-center gap-2 border-t border-gray-100 px-4 py-3 text-sm font-bold text-[#161616]">
                <span className="h-2 w-2 shrink-0 rounded-full bg-[#FFB800]" aria-hidden="true" />
                {video.title}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
};
