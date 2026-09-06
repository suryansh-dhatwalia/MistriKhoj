import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Wrench, 
  Phone, 
  MessageSquare, 
  Star, 
  ShieldCheck, 
  Award, 
  ChevronRight, 
  Zap,
  RotateCcw,
  CheckCircle2,
  HardHat
} from 'lucide-react';
import { Technician, SupportedState } from '../types';
import { SUPPORTED_STATES, getCitiesForState } from '../data/locations';
import { SERVICE_CATEGORIES } from '../data/categories';
import { useLanguage } from '../context/LanguageContext';

interface TechnicianDirectoryProps {
  technicians: Technician[];
  isLoading: boolean;
  loadError: string | null;
  onRetry: () => void;
  selectedState: SupportedState | 'All';
  setSelectedState: (st: SupportedState | 'All') => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectTechnician: (tech: Technician) => void;
  onDirectContact: (tech: Technician, method: 'phone' | 'whatsapp') => void;
}

export const TechnicianDirectory: React.FC<TechnicianDirectoryProps> = ({
  technicians,
  isLoading,
  loadError,
  onRetry,
  selectedState,
  setSelectedState,
  selectedCity,
  setSelectedCity,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  onSelectTechnician,
  onDirectContact
}) => {
  const { t } = useLanguage();
  const [minExperience, setMinExperience] = useState<number>(0);
  const [onlyEmergency, setOnlyEmergency] = useState<boolean>(false);
  const [onlyGoldPartner, setOnlyGoldPartner] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'jobs' | 'price'>('rating');

  const availableCities = selectedState !== 'All' ? getCitiesForState(selectedState) : [];

  const filteredTechnicians = useMemo(() => {
    return technicians
      .filter((tech) => {
        // State check
        if (selectedState !== 'All' && tech.state !== selectedState) return false;
        // City check
        if (selectedCity !== 'All' && tech.city !== selectedCity) return false;
        // Category check
        if (selectedCategory !== 'All' && !tech.category.toLowerCase().includes(selectedCategory.toLowerCase())) return false;
        // Experience check
        if (tech.experienceYears < minExperience) return false;
        // Emergency check
        if (onlyEmergency && !tech.isEmergencyAvailable) return false;
        // Gold / Platinum Partner filter
        if (onlyGoldPartner && tech.badgeLevel !== 'Gold Master' && tech.badgeLevel !== 'Platinum Partner') return false;
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = tech.name.toLowerCase().includes(q);
          const matchCity = tech.city.toLowerCase().includes(q);
          const matchState = tech.state.toLowerCase().includes(q);
          const matchCat = tech.category.toLowerCase().includes(q);
          const matchServices = tech.servicesOffered.some((s) => s.toLowerCase().includes(q));
          const matchIntro = tech.intro.toLowerCase().includes(q);
          const matchQual = tech.qualification.toLowerCase().includes(q);
          if (!matchName && !matchCity && !matchState && !matchCat && !matchServices && !matchIntro && !matchQual) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
        if (sortBy === 'jobs') return b.completedJobs - a.completedJobs;
        if (sortBy === 'price') return a.startingPrice - b.startingPrice;
        return 0;
      });
  }, [technicians, selectedState, selectedCity, selectedCategory, minExperience, onlyEmergency, onlyGoldPartner, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSelectedState('All');
    setSelectedCity('All');
    setSelectedCategory('All');
    setSearchQuery('');
    setMinExperience(0);
    setOnlyEmergency(false);
    setOnlyGoldPartner(false);
    setSortBy('rating');
  };

  return (
    <section id="directory-section" className="py-16 sm:py-24 bg-[#FAFAFA] border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="text-xs font-black tracking-[0.2em] text-gray-500 uppercase">
                MISTRI DIRECTORY
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFB800]"></span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-[#111827] tracking-tight">
              Find Craftsmen in Your Area
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 font-medium">
              {t('dir_subtitle', 'Call your preferred electrician, plumber, or mechanic directly without paying any middleman commission.')}
            </p>
          </div>

          {/* Quick Counter */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-gray-600">Showing: </span>
              <span className="font-extrabold text-black text-sm">{filteredTechnicians.length}</span>
              <span className="text-gray-600"> Registered Mistris</span>
            </div>
            {(selectedState !== 'All' || selectedCategory !== 'All' || searchQuery || minExperience > 0 || onlyEmergency) && (
              <button
                onClick={handleResetFilters}
                className="px-3.5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-xs font-bold text-black flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mb-8 p-5 rounded-2xl bg-white border-2 border-gray-200 shadow-sm space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            
            {/* State Filter */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                {t('dir_state_filter', 'State')}
              </label>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value as SupportedState | 'All');
                  setSelectedCity('All');
                }}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:border-black focus:outline-none"
              >
                <option value="All">{t('hero_all_states', 'All 8 States')}</option>
                {SUPPORTED_STATES.map((st) => (
                  <option key={st.name} value={st.name}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                {t('dir_city_filter', 'City')}
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={selectedState === 'All'}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:border-black focus:outline-none disabled:opacity-50"
              >
                <option value="All">
                  {selectedState === 'All' ? t('hero_all_cities', 'All Cities') : `All in ${selectedState}`}
                </option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                {t('dir_cat_filter', 'Category')}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:border-black focus:outline-none"
              >
                <option value="All">{t('hero_all_categories', 'All Categories')}</option>
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Filter */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                {t('dir_exp_years', 'Experience')}
              </label>
              <select
                value={minExperience}
                onChange={(e) => setMinExperience(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:border-black focus:outline-none"
              >
                <option value={0}>{t('dir_all_exp', 'Any Experience')}</option>
                <option value={5}>5+ {t('dir_exp_years', 'Years')}</option>
                <option value={10}>10+ {t('dir_exp_years', 'Years')}</option>
                <option value={15}>15+ {t('dir_exp_years', 'Years')}</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                {t('dir_sort_by', 'Sort By')}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:border-black focus:outline-none"
              >
                <option value="rating">{t('dir_sort_rating', 'Highest Rating (★ 4.9+)')}</option>
                <option value="experience">{t('dir_sort_experience', 'Most Experienced')}</option>
                <option value="jobs">{t('dir_sort_jobs', 'Most Jobs Completed')}</option>
                <option value="price">{t('dir_sort_price', 'Starting Rate (Lowest)')}</option>
              </select>
            </div>

          </div>

          {/* Secondary Quick Toggles */}
          <div className="flex flex-wrap items-center justify-between pt-3 border-t border-gray-100 gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-black transition-colors">
                <input
                  type="checkbox"
                  checked={onlyEmergency}
                  onChange={(e) => setOnlyEmergency(e.target.checked)}
                  className="rounded border-gray-300 text-black focus:ring-0"
                />
                <span className="flex items-center gap-1 font-bold text-gray-900">
                  <Zap className="w-3.5 h-3.5 text-red-600" />
                  {t('dir_filter_emergency', '24/7 Emergency Available Only')}
                </span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer select-none bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-black transition-colors">
                <input
                  type="checkbox"
                  checked={onlyGoldPartner}
                  onChange={(e) => setOnlyGoldPartner(e.target.checked)}
                  className="rounded border-gray-300 text-black focus:ring-0"
                />
                <span className="flex items-center gap-1 font-bold text-gray-900">
                  <Award className="w-3.5 h-3.5 text-[#FFB800]" />
                  {t('dir_filter_gold', 'Gold Master & Platinum Only')}
                </span>
              </label>
            </div>

            <div className="text-[11px] text-gray-500 font-semibold">
              {t('dir_zero_comm', '0% commission')} • {t('trust_direct_tag', 'Direct Connect')}
            </div>
          </div>

        </div>

        {/* Technician Cards Grid */}
        {isLoading ? (
          <div className="text-center py-16 px-4 bg-white rounded-2xl border-2 border-gray-200">
            <Wrench className="w-12 h-12 text-[#FFB800] mx-auto mb-3 animate-pulse" />
            <h3 className="text-lg font-bold text-black">Loading registered Mistris...</h3>
          </div>
        ) : loadError ? (
          <div className="text-center py-16 px-4 bg-white rounded-2xl border-2 border-red-200">
            <Wrench className="w-12 h-12 text-red-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-black">Unable to load Mistris</h3>
            <p className="text-xs text-red-700 mt-1">{loadError}</p>
            <button
              onClick={onRetry}
              className="mt-4 px-5 py-2.5 rounded-xl bg-[#FFB800] text-black text-xs font-bold hover:bg-[#F59E0B] transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : filteredTechnicians.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-2xl border-2 border-gray-200">
            <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-black">{t('dir_no_results', 'No technicians found for the selected filters.')}</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto font-medium">
              {t('dir_no_results_desc', 'Try selecting all states or resetting your filter criteria to see all available technicians.')}
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-5 py-2.5 rounded-xl bg-[#FFB800] text-black text-xs font-bold hover:bg-[#F59E0B] transition-colors cursor-pointer"
            >
              {t('dir_reset', 'Reset All Filters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTechnicians.map((tech) => (
              <div
                key={tech.id}
                className="group rounded-2xl bg-white border-2 border-gray-200 hover:border-black transition-all duration-200 shadow-sm hover:shadow-xl flex flex-col justify-between overflow-hidden"
              >
                {/* Card Top / Header */}
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    
                    {/* Photo with verification badge */}
                    <div className="relative shrink-0">
                      <img
                        src={tech.photoUrl}
                        alt={tech.name}
                        className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                      />
                      {tech.isVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-black text-[#FFB800] rounded-full p-0.5 shadow-sm" title="Police & Skill Verified">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Basic info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                          tech.badgeLevel === 'Gold Master' 
                            ? 'bg-[#FFB800] text-black' 
                            : tech.badgeLevel === 'Platinum Partner'
                            ? 'bg-black text-[#FFB800]'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {tech.badgeLevel}
                        </span>

                        {tech.isEmergencyAvailable && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5 text-red-600" /> SOS
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-extrabold text-[#111827] mt-1.5 truncate">
                        {tech.name}
                      </h3>

                      <p className="text-xs font-bold text-gray-600">
                        {tech.category}
                      </p>

                      <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5 font-medium">
                        <MapPin className="w-3 h-3 text-black shrink-0" />
                        <span className="truncate">{tech.city}, {tech.state}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating & Stats Strip */}
                  <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-gray-50">
                      <div className="flex items-center justify-center gap-1 font-black text-black">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>{tech.reviewsCount > 0 ? tech.rating : 'New'}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-semibold mt-0.5">{tech.reviewsCount} {t('dir_reviews', 'reviews')}</div>
                    </div>

                    <div className="p-2 rounded-xl bg-gray-50">
                      <div className="font-black text-black">{tech.experienceYears} {t('dir_yrs', 'Yrs')}</div>
                      <div className="text-[10px] text-gray-500 font-semibold mt-0.5">{t('dir_exp_years', 'Experience')}</div>
                    </div>

                    <div className="p-2 rounded-xl bg-gray-50">
                      <div className="font-black text-black">{tech.completedJobs > 0 ? `${tech.completedJobs}+` : 'New'}</div>
                      <div className="text-[10px] text-gray-500 font-semibold mt-0.5">{t('dir_jobs_done', 'Jobs Done')}</div>
                    </div>
                  </div>

                  {/* Qualification Tag */}
                  <div className="mt-3 text-[11px] bg-amber-50/70 border border-amber-200/60 px-3 py-1.5 rounded-lg text-amber-950 flex items-start gap-1.5 font-medium">
                    <Award className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{tech.qualification}</span>
                  </div>

                  {/* Key services tags */}
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1.5">
                      {tech.servicesOffered.slice(0, 3).map((srv, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-800 font-medium"
                        >
                          {srv}
                        </span>
                      ))}
                      {tech.servicesOffered.length > 3 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-200 text-black font-bold">
                          +{tech.servicesOffered.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Short Bio */}
                  <p className="mt-3 text-xs text-gray-600 line-clamp-2 leading-relaxed font-normal">
                    {tech.intro}
                  </p>
                </div>

                {/* Card Bottom CTA Actions */}
                <div className="p-5 bg-gray-50 border-t border-gray-200 space-y-2.5">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500 font-semibold">{t('dir_starting_inspect', 'Starting Inspection')}:</span>
                    <span className="font-black text-black">
                      {tech.startingPrice > 0 ? `₹${tech.startingPrice} ${t('dir_onwards', 'onwards')}` : 'Contact for quote'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Direct Call Button */}
                    <button
                      onClick={() => onDirectContact(tech, 'phone')}
                      className="py-2.5 px-3 rounded-xl bg-black text-[#FFB800] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-gray-800 transition-all shadow-sm cursor-pointer"
                      title={`Call ${tech.name} directly`}
                    >
                      <Phone className="w-3.5 h-3.5 text-[#FFB800]" />
                      <span>{t('dir_call_now', 'Call Now')}</span>
                    </button>

                    {/* Direct WhatsApp Button */}
                    <button
                      onClick={() => onDirectContact(tech, 'whatsapp')}
                      className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      title={`Chat with ${tech.name} on WhatsApp`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-white fill-current" />
                      <span>{t('dir_whatsapp', 'WhatsApp')}</span>
                    </button>
                  </div>

                  {/* View Full Profile & Verified ID Button */}
                  <button
                    onClick={() => onSelectTechnician(tech)}
                    className="w-full py-2 px-3 rounded-xl bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>View Full Profile</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
