import React from 'react';
import { Star, MapPin, CheckCircle2 } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { useLanguage } from '../context/LanguageContext';

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
            <div
              key={tItem.id}
              className="p-6 sm:p-7 rounded-2xl bg-[#FAFAFA] border-2 border-gray-200 hover:border-black transition-all flex flex-col justify-between shadow-sm"
            >
              <div>
                {/* Rating stars & service badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(tItem.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#FFB800] text-[#FFB800]" />
                    ))}
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-black text-[#FFB800] uppercase tracking-wider">
                    {tItem.serviceCategory}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                  "{tItem.comment}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 flex items-center gap-3">
                <img
                  src={tItem.avatarUrl}
                  alt={tItem.author}
                  className="w-10 h-10 rounded-full object-cover border border-gray-300"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#111827] truncate">{tItem.author}</div>
                  <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-black" />
                    <span>{tItem.location}, {tItem.state}</span>
                  </div>
                </div>
                <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5 shrink-0 bg-emerald-50 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{t('test_verified', 'Verified')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
