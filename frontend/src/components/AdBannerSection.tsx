import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, Info, Megaphone, Play, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useContent } from '../context/ContentContext';
import { SAMPLE_ADS as FALLBACK_ADS } from '../data/ads';

interface AdBannerSectionProps {
  onAdvertiseClick: () => void;
}

type Orientation = 'portrait' | 'landscape' | 'square';

const classifyOrientation = (width: number, height: number): Orientation => {
  if (!width || !height) return 'landscape';
  const ratio = width / height;
  if (ratio >= 1.15) return 'landscape';
  if (ratio <= 0.85) return 'portrait';
  return 'square';
};

// The frame grows for portrait / square creatives so nothing is cropped, and a
// wide landscape one gets a roomier 16:9-ish box (a bit taller for video). Height
// animates when the carousel rotates between differently-shaped ads.
const frameHeightClass = (orientation: Orientation, isVideo: boolean): string => {
  if (orientation === 'portrait') return 'h-[440px] sm:h-[560px]';
  if (orientation === 'square') return 'h-[360px] sm:h-[460px]';
  return isVideo ? 'h-[300px] sm:h-[380px] md:h-[460px]' : 'h-[240px] sm:h-[300px] md:h-[340px]';
};

export const AdBannerSection: React.FC<AdBannerSectionProps> = ({ onAdvertiseClick }) => {
  const { t } = useLanguage();
  const { homeAds, settings } = useContent();
  const ads = useMemo(() => (homeAds.length > 0 ? homeAds : FALLBACK_ADS), [homeAds]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [orientations, setOrientations] = useState<Record<string, Orientation>>({});
  const [muted, setMuted] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const videoEls = useRef<Map<string, HTMLVideoElement>>(new Map());

  const rotationMs = Math.max(2, Number(settings.ad_rotation_seconds) || 6) * 1000;

  useEffect(() => {
    setCurrentAdIndex(0);
  }, [ads.length]);

  const advance = useCallback(() => {
    setCurrentAdIndex((prev) => (ads.length ? (prev + 1) % ads.length : 0));
  }, [ads.length]);

  // Schedule the next ad. Images advance on the fixed rotation timer; a video ad
  // holds the banner until it finishes (see `onEnded`), with a long safety timer
  // in case the clip errors or never reports `ended`.
  useEffect(() => {
    if (ads.length <= 1) return;
    const current = ads[currentAdIndex];
    if (!current) return;

    const delay = current.type === 'video' ? 90_000 : rotationMs;
    const timer = window.setTimeout(advance, delay);
    return () => window.clearTimeout(timer);
  }, [currentAdIndex, ads, rotationMs, advance]);

  const currentAd = ads[currentAdIndex] ?? ads[0];

  const recordOrientation = (id: string, width: number, height: number) => {
    if (!width || !height) return;
    const next = classifyOrientation(width, height);
    setOrientations((prev) => (prev[id] === next ? prev : { ...prev, [id]: next }));
  };

  // Drive playback imperatively: play the active video, pause/reset the rest, and
  // apply the current mute state. Changing the `autoplay` attribute after mount
  // does nothing, so this is the only reliable way to start a rotated-in clip.
  useEffect(() => {
    setAutoplayBlocked(false);
    ads.forEach((ad, idx) => {
      const el = videoEls.current.get(ad.id);
      if (!el) return;
      if (idx === currentAdIndex && ad.type === 'video') {
        el.muted = muted;
        const attempt = el.play();
        if (attempt) {
          attempt.catch(() => {
            if (!el.muted) {
              // Sound is blocked without a gesture — retry muted.
              el.muted = true;
              setMuted(true);
              el.play().catch(() => setAutoplayBlocked(true));
            } else {
              setAutoplayBlocked(true);
            }
          });
        }
      } else {
        el.pause();
        try {
          el.currentTime = 0;
        } catch {
          /* seeking not ready yet — harmless */
        }
      }
    });
  }, [currentAdIndex, ads, muted]);

  const manualPlay = useCallback(() => {
    const el = videoEls.current.get(currentAd?.id ?? '');
    if (!el) return;
    el.muted = muted;
    el.play()
      .then(() => setAutoplayBlocked(false))
      .catch(() => setAutoplayBlocked(true));
  }, [currentAd, muted]);

  if (!currentAd) return null;

  const currentOrientation = orientations[currentAd.id] ?? 'landscape';
  const currentIsVideo = currentAd.type === 'video';

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-gray-500 mb-4 md:mb-0">
          <Megaphone className="w-4 h-4 text-[#FFB800]" />
          <span className="text-xs font-bold uppercase tracking-wider">Featured Partners</span>
        </div>

        <button
          onClick={onAdvertiseClick}
          className="text-xs font-bold bg-white border border-gray-200 px-4 py-2 rounded-lg hover:border-black transition-colors"
        >
          {t('advertise_with_us', 'Advertise With Us')}
        </button>
      </div>

      <div
        className={`relative rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-[#0D0F12] group transition-[height] duration-500 ease-out ${frameHeightClass(
          currentOrientation,
          currentIsVideo,
        )}`}
      >
        {/* Creative layers. Landscape fills the frame; portrait / square are shown
            whole (letterboxed) so nothing is cropped. */}
        {ads.map((ad, idx) => {
          const isActive = idx === currentAdIndex;
          const orientation = orientations[ad.id] ?? 'landscape';
          const fit = orientation === 'landscape' ? 'object-cover' : 'object-contain';
          return (
            <div
              key={ad.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
              aria-hidden={!isActive}
            >
              {ad.type === 'video' ? (
                <video
                  ref={(el) => {
                    if (el) videoEls.current.set(ad.id, el);
                    else videoEls.current.delete(ad.id);
                  }}
                  src={ad.videoUrl}
                  muted
                  // Loop only when it's the sole ad; otherwise play once, in full,
                  // then hand off to the next ad.
                  loop={ads.length <= 1}
                  playsInline
                  preload={isActive ? 'auto' : 'metadata'}
                  onLoadedMetadata={(e) =>
                    recordOrientation(ad.id, e.currentTarget.videoWidth, e.currentTarget.videoHeight)
                  }
                  onLoadedData={(e) =>
                    recordOrientation(ad.id, e.currentTarget.videoWidth, e.currentTarget.videoHeight)
                  }
                  onEnded={() => {
                    if (isActive && ads.length > 1) advance();
                  }}
                  onError={() => {
                    if (isActive && ads.length > 1) advance();
                  }}
                  className={`absolute inset-0 w-full h-full ${fit}`}
                />
              ) : (
                <>
                  {/* Blurred fill so portrait / square images sit on a soft backdrop
                      instead of hard black bars. */}
                  <img
                    src={ad.imageUrl}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-40"
                  />
                  <img
                    src={ad.imageUrl}
                    alt={ad.companyName}
                    onLoad={(e) =>
                      recordOrientation(
                        ad.id,
                        e.currentTarget.naturalWidth,
                        e.currentTarget.naturalHeight,
                      )
                    }
                    className={`absolute inset-0 w-full h-full ${fit}`}
                  />
                </>
              )}
            </div>
          );
        })}

        {/* Readability scrim — kept shallow so a video stays mostly visible. */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/45 to-transparent z-20" />

        {/* Tap-to-play fallback if the browser blocked muted autoplay entirely. */}
        {currentIsVideo && autoplayBlocked && (
          <button
            onClick={manualPlay}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/30"
            aria-label="Play video"
          >
            <span className="w-16 h-16 rounded-full bg-white/90 text-black flex items-center justify-center shadow-xl">
              <Play className="w-7 h-7 translate-x-0.5 fill-black" />
            </span>
          </button>
        )}

        {/* Ad copy, anchored to the bottom so it works for any orientation */}
        <div className="absolute inset-x-0 bottom-0 z-30 p-4 sm:p-7 md:p-9">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-white/90 text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 w-max border border-white/10">
              <Info className="w-3 h-3" />
              <span>Sponsored by {currentAd.companyName}</span>
            </div>

            <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-white mb-1.5 leading-tight drop-shadow-sm line-clamp-2">
              {currentAd.title}
            </h3>
            <p
              className={`text-xs sm:text-sm md:text-base text-gray-200 font-medium mb-3 drop-shadow ${
                currentIsVideo ? 'line-clamp-1' : 'line-clamp-2'
              }`}
            >
              {currentAd.description}
            </p>

            <a
              href={currentAd.link}
              className="inline-flex items-center justify-center gap-2 bg-[#FFB800] text-black px-5 py-2.5 rounded-xl font-bold text-sm w-max hover:bg-yellow-400 transition-colors shadow-lg"
            >
              <span>{currentAd.ctaText}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Mute / unmute — only for video ads */}
        {currentIsVideo && !autoplayBlocked && (
          <button
            onClick={() => setMuted((m) => !m)}
            className="absolute bottom-4 right-4 z-30 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center border border-white/15 hover:bg-black/70 transition-colors"
            aria-label={muted ? 'Unmute video' : 'Mute video'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}

        {/* Carousel indicators (top-right so they never clash with the copy) */}
        {ads.length > 1 && (
          <div className="absolute top-4 right-4 z-30 flex gap-1.5">
            {ads.map((ad, idx) => (
              <button
                key={ad.id}
                onClick={() => setCurrentAdIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentAdIndex ? 'bg-[#FFB800] w-6' : 'bg-white/50 hover:bg-white w-2'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
