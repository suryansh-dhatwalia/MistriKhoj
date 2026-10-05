import React, { useState, useMemo, useEffect } from 'react';
import {
  MapPin,
  Wrench,
  Phone,
  MessageSquare,
  Star,
  ShieldCheck,
  Award,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { DirectorySortOption, Technician, SupportedState } from '../types';
import { DEFAULT_AVATAR_URI } from '../lib/avatar';
import { useLanguage } from '../context/LanguageContext';

const DIRECTORY_PAGE_SIZE = 18;

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
  minExperience: number;
  setMinExperience: (years: number) => void;
  onlyGoldPartner: boolean;
  setOnlyGoldPartner: (value: boolean) => void;
  sortBy: DirectorySortOption;
  setSortBy: (value: DirectorySortOption) => void;
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
  minExperience,
  setMinExperience,
  onlyGoldPartner,
  setOnlyGoldPartner,
  sortBy,
  setSortBy,
  onSelectTechnician,
  onDirectContact
}) => {
  const { t } = useLanguage();
  const [visibleCount, setVisibleCount] = useState<number>(DIRECTORY_PAGE_SIZE);

  // A random order per Mistri, re-rolled only when the fetched list itself changes
  // (a fresh page load, a retry, a new registration) — not on every filter/search
  // keystroke, so "Shuffled" gives every non-paid Mistri a fair shot at the top on
  // each visit without the list jumping around while someone is browsing it.
  const shuffleWeights = useMemo(() => {
    const weights = new Map<string, number>();
    technicians.forEach((tech) => weights.set(tech.id, Math.random()));
    return weights;
  }, [technicians]);

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
        // Paid "Top Listed" Mistris are always pinned above the rest of the
        // current result set; the chosen Sort By only orders within each group.
        if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
        if (sortBy === 'random') return (shuffleWeights.get(a.id) ?? 0) - (shuffleWeights.get(b.id) ?? 0);
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
        if (sortBy === 'jobs') return b.completedJobs - a.completedJobs;
        if (sortBy === 'price') return a.startingPrice - b.startingPrice;
        return 0;
      });
  }, [technicians, selectedState, selectedCity, selectedCategory, minExperience, onlyGoldPartner, searchQuery, sortBy, shuffleWeights]);

  // Collapse back to the first page whenever the result set changes underneath it,
  // so "Show More" always starts fresh instead of leaving a stale, too-long list.
  useEffect(() => {
    setVisibleCount(DIRECTORY_PAGE_SIZE);
  }, [selectedState, selectedCity, selectedCategory, minExperience, onlyGoldPartner, searchQuery, sortBy]);

  const visibleTechnicians = filteredTechnicians.slice(0, visibleCount);
  const hasMoreTechnicians = visibleCount < filteredTechnicians.length;

  const handleResetFilters = () => {
    setSelectedState('All');
    setSelectedCity('All');
    setSelectedCategory('All');
    setSearchQuery('');
    setMinExperience(0);
    setOnlyGoldPartner(false);
    setSortBy('random');
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
            <div className="flex flex-col gap-1">
              <div className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-gray-600">Showing: </span>
                <span className="font-extrabold text-black text-sm">{filteredTechnicians.length}</span>
                <span className="text-gray-600"> Registered Mistris</span>
              </div>
              {filteredTechnicians.some((tech) => tech.isFeatured) && (
                <p className="text-[10px] text-gray-500 font-semibold pl-1">
                  {t('dir_top_listed_note', '★ Top Listed profiles are on a paid yearly plan.')}
                </p>
              )}
            </div>
            {(selectedState !== 'All' || selectedCategory !== 'All' || searchQuery || minExperience > 0) && (
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
            {visibleTechnicians.map((tech) => (
              <div
                key={tech.id}
                className={`group rounded-2xl bg-white border-2 transition-all duration-200 shadow-sm hover:shadow-xl flex flex-col justify-between overflow-hidden ${
                  tech.isFeatured
                    ? 'border-[#FFB800] ring-2 ring-[#FFB800]/40 hover:border-[#FFB800]'
                    : 'border-gray-200 hover:border-black'
                }`}
              >
                {/* Card Top / Header */}
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    
                    {/* Photo with verification badge */}
                    <div className="relative shrink-0">
                      <img
                        src={tech.photoUrl}
                        alt={tech.name}
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_AVATAR_URI;
                        }}
                        className="w-16 h-16 rounded-xl object-cover border border-gray-200 bg-gray-100"
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
                        {tech.isFeatured && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider bg-[#FFB800] text-black flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-black" />
                            {t('dir_top_listed', 'Top Listed')}
                          </span>
                        )}
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                          tech.badgeLevel === 'Gold Master'
                            ? 'bg-[#FFB800] text-black'
                            : tech.badgeLevel === 'Platinum Partner'
                            ? 'bg-black text-[#FFB800]'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {tech.badgeLevel}
                        </span>
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

        {hasMoreTechnicians && (
          <div className="mt-10 flex flex-col items-center gap-2">
            <button
              onClick={() => setVisibleCount((prev) => prev + DIRECTORY_PAGE_SIZE)}
              className="px-8 py-3 rounded-xl bg-[#FFB800] text-black text-sm font-bold hover:bg-[#F59E0B] transition-colors shadow-sm cursor-pointer"
            >
              {t('dir_show_more', 'Show More Mistris')}
            </button>
            <p className="text-xs text-gray-500 font-medium">
              {t('dir_showing_count', 'Showing {shown} of {total}', {
                shown: visibleTechnicians.length,
                total: filteredTechnicians.length,
              })}
            </p>
          </div>
        )}

      </div>
    </section>
  );
};
