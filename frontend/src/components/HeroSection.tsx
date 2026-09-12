import React, { useState } from 'react';
import {
  Search,
  MapPin,
  ChevronDown,
  ShieldCheck,
  Tag,
  CalendarCheck,
  Star,
  HardHat,
  Home,
  Sparkles,
  Wrench,
  Zap,
  Droplet,
  Hammer,
  Paintbrush,
  AirVent,
  Tv,
  Sparkle,
  LayoutGrid,
  Check,
  CheckCircle2,
  Users
} from 'lucide-react';
import { SupportedState } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useContent } from '../context/ContentContext';

interface HeroSectionProps {
  selectedState: SupportedState | 'All';
  setSelectedState: (st: SupportedState | 'All') => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearchSubmit: () => void;
  onRegisterClick: () => void;
  totalRegisteredCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  selectedState,
  setSelectedState,
  selectedCity,
  setSelectedCity,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  onRegisterClick,
  totalRegisteredCount
}) => {
  const { t, language } = useLanguage();
  const { states: SUPPORTED_STATES, getCitiesForState } = useContent();
  const stateCount = SUPPORTED_STATES.length;
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const availableCities = selectedState !== 'All' ? getCitiesForState(selectedState) : [];

  const handleStateSelect = (st: SupportedState | 'All') => {
    setSelectedState(st);
    setSelectedCity('All');
    setIsLocationDropdownOpen(false);
  };

  const handleCategorySelect = (catName: string) => {
    setSelectedCategory(catName);
    setIsCategoryDropdownOpen(false);
  };

  const quickCategories = [
    { name: t('cat_electrician', 'Electrician'), icon: Zap, categoryKey: 'Electrician' },
    { name: t('cat_plumber', 'Plumber'), icon: Droplet, categoryKey: 'Plumber' },
    { name: t('cat_carpenter', 'Carpenter'), icon: Hammer, categoryKey: 'Carpenter' },
    { name: t('cat_painter', 'Painter'), icon: Paintbrush, categoryKey: 'Painter' },
    { name: t('cat_appliance', 'AC & Appliance Repair'), icon: AirVent, categoryKey: 'AC & Appliance Repair' },
    { name: t('cat_cleaning', 'Cleaning & Housekeeping'), icon: Sparkle, categoryKey: 'Cleaning & Housekeeping' },
    { name: t('dir_all_categories', 'All Services'), icon: LayoutGrid, categoryKey: 'All' },
  ];

  return (
    <div className="relative bg-[#FAFAFA] border-b border-gray-200 overflow-hidden">

      {/* Top Main Hero Split Container */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-12 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

          {/* LEFT COLUMN: High Impact Typography, Search Bar & Trust Stats */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-6 min-w-0">

            {/* Top Sub-Tag (● TRUSTED HOME SERVICE PLATFORM) */}
            <div className="inline-flex items-center gap-2 max-w-full">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFB800] shrink-0"></span>
              <span className="text-xs font-extrabold tracking-[0.2em] text-[#1F2937] uppercase">
                {t('hero_emergency_badge', '100% FREE DIRECT CALL • 0% COMMISSION')}
              </span>
            </div>

            {/* Massive Typographic Headline */}
            <div className="space-y-0.5 sm:space-y-1">
              <h1 className="font-heading-impact text-4xl sm:text-5xl md:text-6xl xl:text-[70px] leading-[0.95] tracking-tight font-black uppercase text-[#111827]">
                <span className="block text-[#111827]">{t('hero_headline_1', 'FIND THE RIGHT')}</span>
                <span className="block text-stroke-black">MISTRI KHOJ</span>
                <span className="inline-block bg-[#FFB800] text-black px-3 sm:px-4 py-0.5 sm:py-1 mt-1 shadow-sm">
                  {t('hero_headline_2', 'FOR EVERY HOME NEED.')}
                </span>
              </h1>
            </div>

            {/* Subtitle Description */}
            <p className="text-base sm:text-lg text-gray-700 max-w-xl font-normal leading-relaxed">
              {t('hero_subheadline', 'Find 15,000+ Aadhaar & police background checked local master craftsmen across {count} Indian states. Direct phone & WhatsApp calling.', { count: stateCount })}
            </p>

            {/* Unified Search Bar Box */}
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white border-2 border-gray-900 shadow-[0_8px_20px_rgba(0,0,0,0.06)] relative z-20" id="search-filter-box">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">

                {/* Location Picker Section */}
                <div className="relative sm:w-48 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLocationDropdownOpen(!isLocationDropdownOpen);
                      setIsCategoryDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-xs sm:text-sm font-bold text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
                    id="hero-location-btn"
                  >
                    <div className="flex items-center gap-1.5 truncate min-w-0">
                      <MapPin className="w-4 h-4 text-black fill-black shrink-0" />
                      <span className="truncate">
                        {selectedCity !== 'All' ? selectedCity : selectedState === 'All' ? t('hero_all_states', 'All {count} States', { count: stateCount }) : selectedState}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 shrink-0 ml-1" />
                  </button>

                  {/* Dropdown Menu */}
                  {isLocationDropdownOpen && (
                    <div className="absolute left-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-xl shadow-2xl p-2 z-50 max-h-80 overflow-y-auto">
                      <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {t('hero_search_state', 'Select State / Region')}
                      </div>
                      <button
                        onClick={() => handleStateSelect('All')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                          selectedState === 'All' ? 'bg-[#FFB800]/20 text-black font-bold' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{t('hero_all_states', 'All {count} States', { count: stateCount })}</span>
                        {selectedState === 'All' && <Check className="w-3.5 h-3.5 text-black" />}
                      </button>

                      <div className="my-1 border-t border-gray-100"></div>

                      {SUPPORTED_STATES.map((st) => (
                        <div key={st.name} className="py-0.5">
                          <button
                            onClick={() => handleStateSelect(st.name)}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                              selectedState === st.name ? 'bg-[#FFB800]/20 text-black font-bold' : 'text-gray-800 hover:bg-gray-50'
                            }`}
                          >
                            <span>{st.name} ({st.code})</span>
                            {selectedState === st.name && <Check className="w-3.5 h-3.5 text-black" />}
                          </button>

                          {/* If selected state, show cities list */}
                          {selectedState === st.name && (
                            <div className="pl-4 pr-1 py-1 space-y-0.5">
                              {getCitiesForState(st.name).map((c) => (
                                <button
                                  key={c}
                                  onClick={() => {
                                    setSelectedCity(c);
                                    setIsLocationDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-2.5 py-1 rounded text-[11px] font-medium flex items-center justify-between ${
                                    selectedCity === c ? 'bg-amber-100 text-black font-bold' : 'text-gray-600 hover:bg-gray-100'
                                  }`}
                                >
                                  <span>{c}</span>
                                  {selectedCity === c && <Check className="w-3 h-3 text-black" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Vertical Divider */}
                <div className="hidden sm:block w-px h-7 bg-gray-200 shrink-0"></div>

                {/* Service Query Input */}
                <div className="relative flex-1 min-w-0">
                  <input
                    type="text"
                    placeholder={t('nav_search_placeholder', 'Search Electrician, Plumber, Carpenter...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onSearchSubmit();
                      }
                    }}
                    className="w-full px-3 py-2 text-xs sm:text-sm font-medium text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none"
                    id="hero-service-input"
                  />
                </div>

                {/* Mustard Yellow Search Button */}
                <button
                  type="button"
                  onClick={onSearchSubmit}
                  className="px-5 py-2.5 rounded-xl bg-[#FFB800] hover:bg-[#F59E0B] text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 shrink-0 cursor-pointer"
                  id="hero-find-mistri-btn"
                >
                  <Search className="w-4 h-4 text-black stroke-[2.5] shrink-0" />
                  <span>{t('hero_search_btn', 'Find Mistri')}</span>
                </button>

              </div>
            </div>

            {/* Feature Pills Below Search Bar */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-gray-700 pt-1">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-gray-900 shrink-0" />
                <span>{t('trust_card1_title', 'Aadhaar KYC Certified')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-gray-900 shrink-0" />
                <span>{t('dir_zero_comm', '0% Commission')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarCheck className="w-4 h-4 text-gray-900 shrink-0" />
                <span>{t('hero_direct_calls', 'Direct Calling & WhatsApp')}</span>
              </div>
            </div>

            {/* 3 Metric Stat Boxes */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-2">

              {/* Stat 1: Registered Mistris from the database */}
              <div className="min-w-0 p-3 sm:p-4 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-between gap-1">
                <div className="min-w-0">
                  <div className="text-lg sm:text-2xl font-black text-[#111827] tracking-tight truncate">
                    {totalRegisteredCount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Registered Mistris
                  </div>
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-800 shrink-0">
                  <HardHat className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>

              {/* Stat 2: 50+ Cities */}
              <div className="min-w-0 p-3 sm:p-4 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-between gap-1">
                <div className="min-w-0">
                  <div className="text-lg sm:text-2xl font-black text-[#111827] tracking-tight">
                    50+ Cities
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {t('about_stat_states', '{count} States', { count: stateCount })}
                  </div>
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-800 shrink-0">
                  <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>

              {/* Stat 3: 4.8/5 Customer Rating */}
              <div className="min-w-0 p-3 sm:p-4 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-between gap-1">
                <div className="min-w-0">
                  <div className="text-lg sm:text-2xl font-black text-[#111827] tracking-tight truncate">
                    4.8/5
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Rating
                  </div>
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-800 shrink-0">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-amber-400" />
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: Mustard Yellow Graphic Container with Technicians Montage & Badges */}
          <div className="lg:col-span-6 xl:col-span-6 relative">
            <div className="relative w-full rounded-2xl sm:rounded-3xl bg-[#FFB800] overflow-hidden border-2 border-black shadow-[0_12px_30px_rgba(0,0,0,0.12)] min-h-[480px] sm:min-h-[540px] md:min-h-[580px] flex flex-col justify-end">

              {/* Left Hazard Tape Vertical Stripe */}
              <div className="absolute left-0 top-0 bottom-0 w-4 sm:w-5 bg-hazard-stripes z-20 border-r border-black/40"></div>

              {/* Blueprint Grid Watermark Layer */}
              <div className="absolute inset-0 bg-blueprint-grid opacity-60 pointer-events-none"></div>

              {/* Top Left Floating Tag: ⌈ SERVICE • ELECTRICAL REPAIR ⌋ */}
              <div className="absolute top-4 sm:top-6 left-7 sm:left-9 z-20 max-[400px]:max-w-[128px]">
                <div className="px-3 sm:px-4 py-1.5 bg-white border border-black/80 rounded shadow-sm flex items-center gap-1 text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-black min-w-0">
                  <span className="font-mono text-gray-400 shrink-0">⌈</span>
                  <span className="max-[400px]:truncate min-w-0">SERVICE • MISTRIKHOJ</span>
                  <span className="font-mono text-gray-400 shrink-0">⌋</span>
                </div>
              </div>

              {/* Top Right Floating Badge: DIRECT CONTACT ✓ */}
              <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20 max-[400px]:max-w-[104px]">
                <div className="px-3 sm:px-4 py-1.5 bg-black text-white rounded-md shadow-md flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider min-w-0">
                  <span className="max-[400px]:truncate min-w-0">{t('dir_zero_comm', '0% COMMISSION')}</span>
                  <Check className="w-3.5 h-3.5 text-[#FFB800] stroke-[3] shrink-0" />
                </div>
              </div>

              {/* Center Technician Montage Photo */}
              <div className="relative w-full h-full flex items-end justify-center pt-16 z-10">
                <div className="relative w-full max-w-[500px] h-[380px] sm:h-[450px] flex items-end justify-center">

                  {/* Left Plumber Worker Cutout */}
                  <div className="absolute left-2 sm:left-4 bottom-0 w-[42%] z-10 group">
                    <img
                      src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=600&q=80"
                      alt="MistriKhoj Plumber"
                      className="w-full h-full object-cover object-top drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)] filter contrast-105"
                      style={{ clipPath: 'polygon(0 15%, 100% 0, 100% 100%, 0 100%)' }}
                    />
                    <div className="absolute top-1/4 -left-2 px-2 py-0.5 bg-white border border-black rounded text-[9px] font-black uppercase tracking-wider text-black shadow">
                      {t('cat_plumber', 'PLUMBING')}
                    </div>
                  </div>

                  {/* Right Painter Worker Cutout */}
                  <div className="absolute right-2 sm:right-4 bottom-0 w-[42%] z-10 group">
                    <img
                      src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80"
                      alt="MistriKhoj Painter"
                      className="w-full h-full object-cover object-top drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)] filter contrast-105"
                      style={{ clipPath: 'polygon(0 0, 100% 15%, 100% 100%, 0 100%)' }}
                    />
                    <div className="absolute top-1/4 -right-2 px-2 py-0.5 bg-white border border-black rounded text-[9px] font-black uppercase tracking-wider text-black shadow">
                      {t('cat_painter', 'PAINTING')}
                    </div>
                  </div>

                  {/* Center Electrician Master Ustad */}
                  <div className="relative z-20 w-[58%] sm:w-[60%] flex flex-col items-center">
                    <div className="relative">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 px-2 py-0.5 bg-[#FFB800] border-2 border-black rounded-full shadow-md flex items-center gap-1 text-[9px] font-black text-black">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 text-black fill-current">
                          <path d="M12 2L2 10.5V21C2 21.5523 2.44772 22 3 22H21C21.5523 22 22 21.5523 22 21V10.5L12 2ZM12 5.5L18.5 11V20H15V13.5L12 16.2L9 13.5V20H5.5V11L12 5.5Z" />
                        </svg>
                        <span>MISTRIKHOJ</span>
                      </div>

                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"
                        alt="Master Electrician Mistri"
                        className="w-full h-auto object-cover object-top drop-shadow-[0_15px_25px_rgba(0,0,0,0.4)] rounded-t-full border-t-4 border-l-2 border-r-2 border-black"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Bottom Left Floating Card */}
              <div className="absolute bottom-4 sm:bottom-6 left-7 sm:left-9 z-30 max-[400px]:max-w-[150px]">
                <div className="p-3 sm:p-3.5 bg-white border-2 border-black rounded-xl shadow-xl flex flex-col gap-1.5 min-w-0">
                  <div className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-black truncate">
                    {t('hero_trusted_craftsmen', 'TRUSTED CRAFTSMEN')}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-gray-600 font-semibold">
                    {t('hero_across_states', 'Across {count} States & 50+ Cities', { count: stateCount })}
                  </div>

                  <div className="flex items-center -space-x-2 pt-1">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      alt="Customer 1"
                      className="w-6 h-6 rounded-full border-2 border-white object-cover"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80"
                      alt="Customer 2"
                      className="w-6 h-6 rounded-full border-2 border-white object-cover"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                      alt="Customer 3"
                      className="w-6 h-6 rounded-full border-2 border-white object-cover"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                      alt="Customer 4"
                      className="w-6 h-6 rounded-full border-2 border-white object-cover"
                    />
                    <div className="w-6 h-6 rounded-full bg-black text-[#FFB800] border-2 border-white flex items-center justify-center text-[8px] font-bold">
                      50K+
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Right Floating Circular Quality Seal */}
              <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 z-30">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#FFB800] border-2 border-black p-1 shadow-2xl flex items-center justify-center relative animate-[spin_20s_linear_infinite]">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <path
                      id="circlePath"
                      d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                      fill="transparent"
                    />
                    <text className="text-[7.5px] font-black uppercase tracking-[0.14em] fill-black">
                      <textPath href="#circlePath" startOffset="0%">
                        • QUALITY WORK • VERIFIED • RELIABLE SERVICE
                      </textPath>
                    </text>
                  </svg>

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-[#FFB800]">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                        <path d="M12 2L2 10.5V21C2 21.5523 2.44772 22 3 22H21C21.5523 22 22 21.5523 22 21V10.5L12 2ZM12 5.5L18.5 11V20H15V13.5L12 16.2L9 13.5V20H5.5V11L12 5.5Z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM MARQUEE BAR: Jet Black Ribbon with Hazard End Stripes & Category Icons */}
      <div className="w-full bg-[#0D0F12] text-white py-3.5 border-t border-b border-black">
        <div className="max-w-[1400px] mx-auto px-4 flex items-center justify-between gap-4">

          <div className="w-10 sm:w-16 h-5 bg-hazard-stripes shrink-0 rounded-sm"></div>

          <div className="flex-1 min-w-0 flex items-center justify-around sm:justify-center sm:gap-8 md:gap-12 overflow-x-auto no-scrollbar py-1">
            {quickCategories.map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setSelectedCategory(item.categoryKey);
                    onSearchSubmit();
                  }}
                  className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-200 hover:text-[#FFB800] transition-colors shrink-0 group cursor-pointer"
                >
                  <IconComp className="w-4 h-4 text-[#FFB800] group-hover:scale-110 transition-transform shrink-0" />
                  <span className="whitespace-nowrap">{item.name}</span>
                </button>
              );
            })}
          </div>

          <div className="w-10 sm:w-16 h-5 bg-hazard-stripes shrink-0 rounded-sm"></div>

        </div>
      </div>

    </div>
  );
};
