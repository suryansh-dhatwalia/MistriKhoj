import React from 'react';
import { 
  Building2, 
  Target, 
  Eye, 
  CheckCircle2,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useContent } from '../context/ContentContext';

export const AboutSection: React.FC = () => {
  const { t } = useLanguage();
  const { states } = useContent();
  const stateCount = states.length;

  return (
    <section id="about-section" className="py-16 sm:py-24 bg-[#FAFAFA] border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-xs font-black tracking-[0.2em] text-gray-500 uppercase">
              {t('about_badge', 'ABOUT US')}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFB800]"></span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-[#111827] tracking-tight">
            {t('about_title', 'About MistriKhoj')}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-2.5 max-w-lg mx-auto leading-relaxed font-medium">
            {t('about_subtitle', 'Bridging the digital divide for Bharat’s finest master technicians and local craftsmen.')}
          </p>
        </div>

        {/* Story Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          
          <div className="lg:col-span-6 space-y-4">
            <h3 className="font-display text-2xl sm:text-3xl font-black text-[#111827] leading-tight">
              {t('about_headline', 'Empowering 15,000+ Skilled Craftsmen with Digital Identity', { count: stateCount })}
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
              {t('about_p1')}
            </p>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
              {t('about_p2')}
            </p>

            <div className="pt-2 grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-white border-2 border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-black text-black">
                  <Target className="w-4 h-4 text-black" />
                  <span>{t('about_mission_title', 'Our Mission')}</span>
                </div>
                <p className="text-[11px] text-gray-600 mt-1 leading-normal font-medium">
                  {t('about_mission_desc', 'Direct, zero-commission discovery connecting verified craftsmen with home & commercial clients.')}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border-2 border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-black text-black">
                  <Eye className="w-4 h-4 text-black" />
                  <span>{t('about_vision_title', 'Our Vision')}</span>
                </div>
                <p className="text-[11px] text-gray-600 mt-1 leading-normal font-medium">
                  {t('about_vision_desc', 'Bharat’s most trusted verified craftsmen network across all Tier-1, Tier-2, and Tier-3 cities.')}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Infographic Card */}
          <div className="lg:col-span-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-black shadow-lg relative overflow-hidden">
              
              <div className="flex items-center justify-between pb-5 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFB800] text-black flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-black">{t('about_network_title', 'MistriKhoj Verified Network')}</div>
                    <div className="text-xs text-gray-500 font-semibold">{t('about_network_sub', 'Pan-India Regional Operations')}</div>
                  </div>
                </div>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-black text-[#FFB800]">
                  {t('about_badge_active', 'Active 2026')}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="font-heading-impact text-3xl font-black text-black">{t('about_stat_states', '{count} States', { count: stateCount })}</div>
                  <div className="text-xs text-gray-600 font-semibold mt-0.5">{t('about_stat_states_desc', 'Assam, MH, RJ, UP, WB, NE')}</div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="font-heading-impact text-3xl font-black text-black">{t('about_stat_cities', '50+ Cities')}</div>
                  <div className="text-xs text-gray-600 font-semibold mt-0.5">{t('about_stat_cities_desc', 'Dedicated local coverage')}</div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="font-heading-impact text-3xl font-black text-black">{t('about_stat_mistris', '15,400+')}</div>
                  <div className="text-xs text-gray-600 font-semibold mt-0.5">{t('about_stat_mistris_desc', 'Registered Technicians')}</div>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="font-heading-impact text-3xl font-black text-amber-900">{t('about_stat_commission', '0% Cut')}</div>
                  <div className="text-xs text-amber-900 font-semibold mt-0.5">{t('about_stat_commission_desc', '100% earnings to workers')}</div>
                </div>
              </div>

              <div className="mt-5 p-3 rounded-xl bg-[#0D0F12] text-white text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-[#FFB800] stroke-[3]" />
                <span>{t('about_verified_note', 'All listed mistris have verified physical ID & police clearances.')}</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
