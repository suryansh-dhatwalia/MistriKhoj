import React, { useEffect, useRef, useState } from 'react';
import { Star, MapPin, CheckCircle2, Play, Volume2, VolumeX, Video, Maximize2, X } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { useLanguage } from '../context/LanguageContext';
import type { TestimonialItem } from '../types';

/** How long the expand/collapse transition runs — the close handler waits this long
    before unmounting so the closing animation gets to finish. */
const LIGHTBOX_TRANSITION_MS = 250;

const VideoLightbox: React.FC<{ item: TestimonialItem; visible: boolean; onClose: () => void }> = ({
  item,
  visible,
  onClose
}) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-10 bg-black/80 backdrop-blur-sm transition-opacity duration-[250ms] ease-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black transition-all duration-[250ms] ease-out ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <video
          src={item.videoUrl}
          autoPlay
          controls
          playsInline
          className="absolute inset-0 w-full h-full object-contain"
        />
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/15 hover:bg-black/80 transition-colors"
          aria-label="Close video"
        >
          <X className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
};

const TestimonialCard: React.FC<{ item: TestimonialItem; verifiedLabel: string }> = ({ item, verifiedLabel }) => {
  const [muted, setMuted] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const manualPlay = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = muted;
    el.play()
      .then(() => setAutoplayBlocked(false))
      .catch(() => setAutoplayBlocked(true));
  };

  const openLightbox = () => {
    setLightboxOpen(true);
    // Mount hidden first, then flip to visible on the next frame so the opacity/scale
    // transition actually animates instead of snapping straight to its end state.
    requestAnimationFrame(() => requestAnimationFrame(() => setLightboxVisible(true)));
  };

  const closeLightbox = () => {
    setLightboxVisible(false);
    window.setTimeout(() => setLightboxOpen(false), LIGHTBOX_TRANSITION_MS);
  };

  return (
    <div className="p-6 sm:p-7 rounded-2xl bg-[#FAFAFA] border-2 border-gray-200 hover:border-black transition-all flex flex-col justify-between shadow-sm">
      <div>
        {/* Rating stars & service badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            {[...Array(item.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-[#FFB800] text-[#FFB800]" />
            ))}
          </div>
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-black text-[#FFB800] uppercase tracking-wider">
            {item.serviceCategory}
          </span>
        </div>

        {item.videoUrl ? (
          <div
            className="group relative rounded-xl overflow-hidden bg-black aspect-video cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
            onClick={openLightbox}
            role="button"
            aria-label="Expand video testimonial"
          >
            <video
              ref={videoRef}
              src={item.videoUrl}
              autoPlay
              muted={muted}
              loop
              playsInline
              onPlay={() => setAutoplayBlocked(false)}
              onError={() => setAutoplayBlocked(true)}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Darkens slightly on hover so the expand hint below reads clearly */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />

            <div className="absolute top-2 left-2 inline-flex items-center gap-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/10">
              <Video className="w-3 h-3" />
              <span>Video Testimonial</span>
            </div>

            {/* Expand hint — fades in on hover, hidden while the autoplay-blocked fallback owns the center */}
            {!autoplayBlocked && (
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="w-11 h-11 rounded-full bg-white/90 text-black flex items-center justify-center shadow-xl scale-90 group-hover:scale-100 transition-transform duration-200">
                  <Maximize2 className="w-4.5 h-4.5" />
                </span>
              </span>
            )}

            {autoplayBlocked && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  manualPlay();
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/30"
                aria-label="Play video"
              >
                <span className="w-12 h-12 rounded-full bg-white/90 text-black flex items-center justify-center shadow-xl">
                  <Play className="w-5 h-5 translate-x-0.5 fill-black" />
                </span>
              </button>
            )}

            {!autoplayBlocked && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMuted((m) => !m);
                  if (videoRef.current) videoRef.current.muted = !muted;
                }}
                className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center border border-white/15 hover:bg-black/70 transition-colors"
                aria-label={muted ? 'Unmute video' : 'Mute video'}
              >
                {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
            "{item.comment}"
          </p>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 flex items-center gap-3">
        <img
          src={item.avatarUrl}
          alt={item.author}
          className="w-10 h-10 rounded-full object-cover border border-gray-300"
        />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-[#111827] truncate">{item.author}</div>
          <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-black" />
            <span>{item.location}, {item.state}</span>
          </div>
        </div>
        <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5 shrink-0 bg-emerald-50 px-2 py-0.5 rounded">
          <CheckCircle2 className="w-3 h-3" />
          <span>{verifiedLabel}</span>
        </div>
      </div>

      {lightboxOpen && <VideoLightbox item={item} visible={lightboxVisible} onClose={closeLightbox} />}
    </div>
  );
};

export const TestimonialsSection: React.FC = () => {
  const { t } = useLanguage();
  const { testimonials: TESTIMONIALS } = useContent();

  return (
    <section id="testimonials-section" className="py-16 sm:py-24 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-xs font-black tracking-[0.2em] text-gray-500 uppercase">
              {t('test_badge', 'COMMUNITY VOICES')}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFB800]"></span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-[#111827] tracking-tight">
            {t('test_title', 'Loved by Homeowners Across Bharat')}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-2.5 max-w-lg mx-auto leading-relaxed font-medium">
            {t('test_subtitle', 'Real feedback from residents in Assam, Maharashtra, West Bengal, Rajasthan, Uttar Pradesh & Northeast states.')}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {TESTIMONIALS.map((tItem) => (
            <TestimonialCard key={tItem.id} item={tItem} verifiedLabel={t('test_verified', 'Verified')} />
          ))}
        </div>

      </div>
    </section>
  );
};
