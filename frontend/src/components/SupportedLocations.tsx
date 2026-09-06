import React, { useState } from 'react';
import { 
  MapPin, 
  ChevronRight, 
  ArrowRight
} from 'lucide-react';
import { SUPPORTED_STATES } from '../data/locations';
import { SupportedState } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface SupportedLocationsProps {
  onSelectLocation: (state: SupportedState, city?: string) => void;
}

export const SupportedLocations: React.FC<SupportedLocationsProps> = ({ onSelectLocation }) => {
  const { t } = useLanguage();
  const [activeStateTab, setActiveStateTab] = useState<SupportedState>(SUPPORTED_STATES[0].name);

  const currentStateData = SUPPORTED_STATES.find(s => s.name === activeStateTab) || SUPPORTED_STATES[0];

  return (
    <section id="locations-section" className="py-16 sm:py-24 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-xs font-black tracking-[0.2em] text-gray-500 uppercase">
              {t('loc_badge', 'LOCAL NETWORK')}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFB800]"></span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-[#111827] tracking-tight">
            {t('loc_title', 'Supported 8 Indian States & 50+ Cities')}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-2.5 max-w-lg mx-auto leading-relaxed font-medium">
            {t('loc_subtitle', 'Select any state to explore active city hubs and discover local verified craftsmen in your area.')}
          </p>
        </div>

        {/* State Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 mb-8 max-w-5xl mx-auto">
          {SUPPORTED_STATES.map((st) => (
            <button
              key={st.name}
              onClick={() => setActiveStateTab(st.name)}
              className={`p-3 rounded-xl text-center border-2 transition-all cursor-pointer ${
                activeStateTab === st.name
                  ? 'bg-black text-[#FFB800] border-black shadow-md font-bold'
                  : 'bg-gray-50 text-gray-800 border-gray-200 hover:border-black font-semibold'
              }`}
            >
              <div className="text-xs font-extrabold truncate">{st.name}</div>
              <div className={`text-[10px] mt-0.5 font-bold ${activeStateTab === st.name ? 'text-gray-300' : 'text-gray-500'}`}>
                {st.cities.length} {t('loc_cities_count', 'Cities')}
              </div>
            </button>
          ))}
        </div>

        {/* Active State Detail Showcase Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#FAFAFA] border-2 border-gray-200 shadow-sm max-w-5xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-200 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2.5 py-0.5 rounded bg-[#FFB800] text-black">
                  {currentStateData.code}
                </span>
                <span className="text-xs text-gray-500 font-semibold">{currentStateData.regionalTitle}</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-black text-[#111827] mt-1">
                {currentStateData.name}
              </h3>
              <p className="text-xs text-black font-semibold">{currentStateData.tagline}</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onSelectLocation(currentStateData.name)}
                className="px-5 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-[#FFB800] text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>{t('loc_find_all', 'Find All Ustads in')} {currentStateData.name}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FFB800]" />
              </button>
            </div>
          </div>

          {/* Cities Grid */}
          <div className="mt-6">
            <div className="text-xs font-black text-gray-500 uppercase tracking-wider mb-4">
              {t('loc_supported_cities', 'Supported Cities in')} {currentStateData.name} ({currentStateData.cities.length} {t('loc_cities_count', 'Hubs')})
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {currentStateData.cities.map((city) => (
                <button
                  key={city}
                  onClick={() => onSelectLocation(currentStateData.name, city)}
                  className="p-3 rounded-xl bg-white hover:bg-amber-50/50 border border-gray-200 hover:border-black text-left transition-all group flex items-center justify-between shadow-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold text-gray-900 truncate">
                      {city}
                    </div>
                    <div className="text-[10px] text-gray-500 flex items-center gap-0.5 mt-0.5 font-medium">
                      <MapPin className="w-2.5 h-2.5 text-black" />
                      <span>{t('loc_active_hub', 'Active Hub')}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-black group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
