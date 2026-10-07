import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Info } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import type { HomeAd } from '../data/ads';
import { analytics, type AdContext } from '../lib/analytics';
import { AD_GRID_CLASS, AD_MEDIA_FIT_CLASS, AD_MEDIA_FRAME_CLASS } from '../lib/adLayout';

interface AdCardProps {
  ad: HomeAd;
  navKey: string;
  context: AdContext;
}

const isWebLink = (value: string) => /^https?:\/\//i.test(value);

/**
 * One sponsor card. The media sits in a fixed-ratio frame and is letter-boxed with
 * `object-contain` (never cropped, stretched or overflowing); the text sits below it so
 * every card in a row has the same media size and the same height.
 */
const AdCard: React.FC<AdCardProps> = ({ ad, navKey, context }) => {
  const cardRef = useRef<HTMLElement | null>(null);
  const [mediaFailed, setMediaFailed] = useState(false);
  const numericId = Number(ad.id);

  // Count an impression once, the first time at least half of the card is on screen.
  useEffect(() => {
    const element = cardRef.current;
    if (!element || !Number.isInteger(numericId) || numericId <= 0) return;

    if (typeof IntersectionObserver === 'undefined') {
      analytics.trackAdImpression(navKey, numericId, context);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          analytics.trackAdImpression(navKey, numericId, context);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(element);
    return () => observer.disconnect();
    // `context` is rebuilt each render; its values are what matter.
  }, [navKey, numericId, context.state, context.city, context.category]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasLink = isWebLink(ad.link);

  return (
    <article
      ref={cardRef}
      data-testid="ad-card"
      className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
    >
      <div className={AD_MEDIA_FRAME_CLASS} data-testid="ad-media-frame">
        {mediaFailed ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 px-4 text-center text-sm font-bold text-gray-500">
            {ad.companyName}
          </div>
        ) : ad.type === 'video' && ad.videoUrl ? (
          <video
            src={ad.videoUrl}
            controls
            playsInline
            preload="metadata"
            controlsList="nodownload"
            aria-label={`${ad.title || ad.companyName} (video advertisement)`}
            onError={() => setMediaFailed(true)}
            className={`${AD_MEDIA_FIT_CLASS} bg-black`}
          />
        ) : ad.imageUrl ? (
          <>
            {/* Blurred copy fills the letter-box so any aspect ratio looks intentional. */}
            <img
              src={ad.imageUrl}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-xl"
            />
            <img
              src={ad.imageUrl}
              alt={ad.title || ad.companyName}
              loading="lazy"
              decoding="async"
              onError={() => setMediaFailed(true)}
              className={`${AD_MEDIA_FIT_CLASS} relative`}
            />
          </>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2 inline-flex w-max max-w-full items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[10px] font-bold text-gray-600">
          <Info className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="truncate">Sponsored by {ad.companyName}</span>
        </div>

        {ad.title && (
          <h3 className="line-clamp-2 text-base font-black leading-tight text-[#111827] sm:text-lg">{ad.title}</h3>
        )}
        {ad.description && (
          <p className="mt-1 line-clamp-2 text-xs font-medium text-gray-600 sm:text-sm">{ad.description}</p>
        )}

        {hasLink && (
          <a
            href={ad.link}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="mt-auto inline-flex w-max items-center justify-center gap-1.5 rounded-xl bg-[#FFB800] px-4 py-2 text-xs font-bold text-black shadow-sm transition-colors hover:bg-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            <span>{ad.ctaText}</span>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
};

interface AdGridProps {
  ads: HomeAd[];
  /** Where the ads are shown: empty for the homepage, state/city for results pages. */
  context?: AdContext;
  ariaLabel?: string;
}

/** Two columns from `sm` up (1 & 2 on the first row, 3 & 4 on the second, ...), one on phones. */
export const AdGrid: React.FC<AdGridProps> = ({ ads, context = {}, ariaLabel = 'Sponsored advertisements' }) => {
  const { key } = useLocation();
  if (ads.length === 0) return null;

  return (
    <ul className={`${AD_GRID_CLASS} list-none p-0`} aria-label={ariaLabel} data-testid="ad-grid">
      {ads.map((ad) => (
        <li key={ad.id} className="flex min-w-0">
          <AdCard ad={ad} navKey={key} context={context} />
        </li>
      ))}
    </ul>
  );
};
