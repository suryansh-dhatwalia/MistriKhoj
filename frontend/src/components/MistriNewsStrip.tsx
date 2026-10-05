import React from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { useLanguage } from '../context/LanguageContext';

/** Slow, continuous scrolling strip for admin-managed news — e.g. a new government
    law or scheme affecting Mistris — each item linking out to the full article.
    Sits between the hero and the ad banners; renders nothing when there's no news. */
export const MistriNewsStrip: React.FC = () => {
  const { t } = useLanguage();
  const { mistriNews } = useContent();

  if (mistriNews.length === 0) return null;

  // Slower for more content so nothing whips past unread, but never crawling either.
  const durationSeconds = Math.min(90, Math.max(25, mistriNews.length * 12));

  // The track is duplicated once so the `-50%` loop point lines up seamlessly.
  const track = [...mistriNews, ...mistriNews];

  return (
    <div className="bg-[#FFB800] border-y-2 border-black overflow-hidden shadow-[0_4px_0_0_rgba(0,0,0,0.9)]">
      <div className="max-w-[1400px] mx-auto flex items-stretch">
        <div className="shrink-0 flex items-center gap-2 px-3 sm:px-5 py-3 sm:py-4 bg-black text-[#FFB800] text-xs sm:text-sm font-black uppercase tracking-wider z-10">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#FFB800] opacity-75 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#FFB800]" />
          </span>
          <Newspaper className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span>{t('news_strip_badge', 'Mistri News')}</span>
        </div>

        <div className="relative flex-1 min-w-0 overflow-hidden group">
          <div
            className="flex items-center gap-12 py-3 sm:py-4 pl-6 whitespace-nowrap w-max animate-[marquee_linear_infinite] group-hover:[animation-play-state:paused]"
            style={{ animationDuration: `${durationSeconds}s` }}
          >
            {track.map((item, idx) => (
              <a
                key={`${item.id}-${idx}`}
                href={item.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-black hover:underline underline-offset-4 text-sm sm:text-base font-bold transition-colors"
              >
                <span>{item.message}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
