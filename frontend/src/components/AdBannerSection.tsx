import React, { useRef, useState } from 'react';
import { ExternalLink, Info, Megaphone, Play, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useContent } from '../context/ContentContext';
import { SAMPLE_ADS as FALLBACK_ADS, type HomeAd } from '../data/ads';

interface AdBannerSectionProps {
  onAdvertiseClick: () => void;
}

/** One sponsor's own card — every approved ad gets a permanent slot side by side,
    instead of taking turns in a single rotating banner. */
const AdCard: React.FC<{ ad: HomeAd }> = ({ ad }) => {
  const [muted, setMuted] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isVideo = ad.type === 'video';

  const manualPlay = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = muted;
    el.play()
      .then(() => setAutoplayBlocked(false))
      .catch(() => setAutoplayBlocked(true));
  };

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-[#0D0F12] group h-64 sm:h-72">
      {isVideo ? (
        <video
          ref={videoRef}
          src={ad.videoUrl}
          autoPlay
          muted={muted}
          loop
          playsInline
          onPlay={() => setAutoplayBlocked(false)}
          onError={() => setAutoplayBlocked(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <img
          src={ad.imageUrl}
          alt={ad.companyName}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Readability scrim */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />

      {/* Tap-to-play fallback if the browser blocked muted autoplay entirely. */}
      {isVideo && autoplayBlocked && (
        <button
          onClick={manualPlay}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/30"
          aria-label="Play video"
        >
          <span className="w-14 h-14 rounded-full bg-white/90 text-black flex items-center justify-center shadow-xl">
            <Play className="w-6 h-6 translate-x-0.5 fill-black" />
          </span>
        </button>
      )}

      <div className="absolute inset-x-0 bottom-0 z-20 p-4 sm:p-5">
        <div className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-white/90 text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 w-max border border-white/10">
          <Info className="w-3 h-3" />
          <span>Sponsored by {ad.companyName}</span>
        </div>

        <h3 className="text-base sm:text-lg font-black text-white mb-1 leading-tight drop-shadow-sm line-clamp-2">
          {ad.title}
        </h3>
        <p className="text-xs text-gray-200 font-medium mb-3 drop-shadow line-clamp-2">
          {ad.description}
        </p>

        <a
          href={ad.link}
          className="inline-flex items-center justify-center gap-1.5 bg-[#FFB800] text-black px-4 py-2 rounded-xl font-bold text-xs w-max hover:bg-yellow-400 transition-colors shadow-lg"
        >
          <span>{ad.ctaText}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Mute / unmute — only for video ads */}
      {isVideo && !autoplayBlocked && (
        <button
          onClick={() => {
            setMuted((m) => !m);
            if (videoRef.current) videoRef.current.muted = !muted;
          }}
          className="absolute bottom-3 right-3 z-20 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center border border-white/15 hover:bg-black/70 transition-colors"
          aria-label={muted ? 'Unmute video' : 'Mute video'}
        >
          {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );
};

export const AdBannerSection: React.FC<AdBannerSectionProps> = ({ onAdvertiseClick }) => {
  const { t } = useLanguage();
  const { homeAds } = useContent();
  const ads = homeAds.length > 0 ? homeAds : FALLBACK_ADS;

  if (ads.length === 0) return null;

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.map((ad) => (
          <AdCard key={ad.id} ad={ad} />
        ))}
      </div>
    </section>
  );
};
