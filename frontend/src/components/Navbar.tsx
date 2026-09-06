import React, { useState } from 'react';
import {
  MapPin,
  ArrowRight,
  Menu,
  X,
  ChevronDown,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { SUPPORTED_STATES } from '../data/locations';
import { SERVICE_CATEGORIES } from '../data/categories';
import { SupportedState } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

interface NavbarProps {
  currentView: 'home' | 'register' | 'advertise';
  setCurrentView: (
    view: 'home' | 'register' | 'advertise',
  ) => void;
  selectedState: SupportedState | 'All';
  setSelectedState: (
    state: SupportedState | 'All',
  ) => void;
  onOpenSOSModal: () => void;
  onSelectCategory?: (category: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  selectedState,
  setSelectedState,
  onOpenSOSModal,
  onSelectCategory,
}) => {
  const { t } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);
  const [stateDropdownOpen, setStateDropdownOpen] =
    useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] =
    useState(false);

  const handleNavClick = (sectionId: string) => {
    if (currentView !== 'home') {
      setCurrentView('home');

      setTimeout(() => {
        const element =
          document.getElementById(sectionId);

        element?.scrollIntoView({
          behavior: 'smooth',
        });
      }, 150);
    } else {
      const element =
        document.getElementById(sectionId);

      element?.scrollIntoView({
        behavior: 'smooth',
      });
    }

    setMobileMenuOpen(false);
    setServicesDropdownOpen(false);
  };

  const handleHomeClick = () => {
    setCurrentView('home');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    setMobileMenuOpen(false);
  };

  const handleBookService = () => {
    if (currentView !== 'home') {
      setCurrentView('home');

      setTimeout(() => {
        const element =
          document.getElementById('search-filter-box') ||
          document.getElementById('directory-section');

        element?.scrollIntoView({
          behavior: 'smooth',
        });
      }, 150);

      return;
    }

    const element =
      document.getElementById('search-filter-box') ||
      document.getElementById('directory-section');

    element?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-[0_1px_3px_rgba(0,0,0,0.05)] backdrop-blur-md">
      <div className="mx-auto w-full max-w-[1600px] px-2 min-[420px]:px-4 sm:px-6 xl:px-8">
        <div className="flex h-14 items-center justify-between gap-2 min-[420px]:h-16 min-[420px]:gap-5 xl:h-[72px]">
          {/* Brand */}
          <button
            type="button"
            onClick={handleHomeClick}
            id="brand-logo-btn"
            className="group flex min-w-0 items-center gap-2 text-left min-[420px]:shrink-0 min-[420px]:gap-3"
          >
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFB800] shadow-sm transition-transform group-hover:scale-105 min-[420px]:h-10 min-[420px]:w-10">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-current text-black min-[420px]:h-6 min-[420px]:w-6"
                stroke="none"
                aria-hidden="true"
              >
                <path d="M12 2L2 10.5V21C2 21.5523 2.44772 22 3 22H21C21.5523 22 22 21.5523 22 21V10.5L12 2ZM12 5.5L18.5 11V20H15V13.5L12 16.2L9 13.5V20H5.5V11L12 5.5Z" />
              </svg>
            </span>

            <span className="flex min-w-0 flex-col">
              <span className="truncate font-display text-xl font-extrabold leading-none tracking-tight text-[#111827] min-[420px]:text-2xl">
                MistriKhoj
              </span>

              <span className="mt-1 hidden whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.18em] text-[#6B7280] min-[420px]:block">
                {t(
                  'nav_brand_subtitle',
                  'DIRECT VERIFIED DIRECTORY',
                )}
              </span>
            </span>
          </button>

          {/* Desktop navigation */}
          <nav className="hidden flex-1 items-center justify-center gap-5 whitespace-nowrap text-sm font-semibold text-[#374151] xl:flex 2xl:gap-7">
            <button
              type="button"
              onClick={handleHomeClick}
              className="transition-colors hover:text-[#111827]"
            >
              {t('nav_home', 'Home')}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setServicesDropdownOpen(
                    (open) => !open,
                  )
                }
                onMouseEnter={() =>
                  setServicesDropdownOpen(true)
                }
                className="flex items-center gap-1 py-2 transition-colors hover:text-[#111827]"
              >
                <span>
                  {t('nav_categories', 'Services')}
                </span>

                <ChevronDown
                  className={`h-4 w-4 text-gray-500 transition-transform ${
                    servicesDropdownOpen
                      ? 'rotate-180'
                      : ''
                  }`}
                />
              </button>

              {servicesDropdownOpen && (
                <div
                  onMouseLeave={() =>
                    setServicesDropdownOpen(false)
                  }
                  className="absolute left-0 z-50 mt-1 grid w-64 animate-in grid-cols-1 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white py-2 shadow-xl fade-in slide-in-from-top-1"
                >
                  <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t(
                      'nav_popular_services',
                      'Popular Home Services',
                    )}
                  </div>

                  <div className="py-1">
                    {SERVICE_CATEGORIES.map(
                      (category) => (
                        <button
                          type="button"
                          key={category.id}
                          onClick={() => {
                            onSelectCategory?.(
                              category.name,
                            );

                            handleNavClick(
                              'directory-section',
                            );
                          }}
                          className="flex w-full items-center justify-between px-4 py-2 text-left text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-black"
                        >
                          <span>{category.name}</span>

                          <span className="text-[10px] font-normal text-gray-400">
                            {
                              category.techniciansAvailable
                            }
                            +{' '}
                            {t('cat_pros', 'pros')}
                          </span>
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                handleNavClick('trust-section')
              }
              className="transition-colors hover:text-[#111827]"
            >
              {t(
                'nav_why_mistrikhoj',
                'Why MistriKhoj',
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentView('register');

                window.scrollTo({
                  top: 0,
                  behavior: 'smooth',
                });
              }}
              className="transition-colors hover:text-[#111827]"
            >
              {t(
                'nav_register_mistri',
                'Register Mistri',
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                handleNavClick(
                  'how-it-works-section',
                )
              }
              className="transition-colors hover:text-[#111827]"
            >
              {t(
                'nav_how_it_works',
                'How It Works',
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                handleNavClick('about-section')
              }
              className="transition-colors hover:text-[#111827]"
            >
              {t('nav_about', 'About Us')}
            </button>

            <button
              type="button"
              onClick={() =>
                handleNavClick('contact-section')
              }
              className="transition-colors hover:text-[#111827]"
            >
              {t(
                'nav_contact',
                'FAQ & Contact',
              )}
            </button>
          </nav>

          {/* Desktop controls */}
          <div className="hidden shrink-0 items-center gap-3 xl:flex">
            <div className="rounded-xl bg-gray-900 p-0.5">
              <LanguageSelector variant="navbar" />
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setStateDropdownOpen(
                    (open) => !open,
                  )
                }
                id="navbar-location-btn"
                className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-gray-100 px-3.5 py-2.5 text-xs font-bold text-[#1F2937] transition-colors hover:bg-gray-200 hover:text-black"
              >
                <MapPin className="h-3.5 w-3.5 fill-black text-black" />

                <span>
                  {selectedState === 'All'
                    ? '8 States'
                    : selectedState}
                </span>

                <ChevronDown className="h-3.5 w-3.5 text-gray-600" />
              </button>

              {stateDropdownOpen && (
                <div className="absolute right-0 z-50 mt-2 w-56 animate-in rounded-xl border border-gray-200 bg-white py-2 shadow-xl fade-in">
                  <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {t(
                      'nav_select_service_area',
                      'Select Your Service Area',
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedState('All');
                      setStateDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-xs transition-colors hover:bg-amber-50/50 ${
                      selectedState === 'All'
                        ? 'bg-amber-50 font-bold text-black'
                        : 'text-gray-700'
                    }`}
                  >
                    <span>
                      {t(
                        'nav_all_supported_regions',
                        'All Supported Regions (8 States)',
                      )}
                    </span>

                    {selectedState === 'All' && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#FFB800]" />
                    )}
                  </button>

                  {SUPPORTED_STATES.map((state) => (
                    <button
                      type="button"
                      key={state.name}
                      onClick={() => {
                        setSelectedState(state.name);
                        setStateDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-3.5 py-1.5 text-left text-xs transition-colors hover:bg-amber-50/50 ${
                        selectedState === state.name
                          ? 'bg-amber-50 font-bold text-black'
                          : 'text-gray-700'
                      }`}
                    >
                      <span>
                        {state.name} ({state.code})
                      </span>

                      {selectedState ===
                        state.name && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#FFB800]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleBookService}
              id="header-book-service-btn"
              className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-[#FFB800] px-5 py-2.5 text-xs font-extrabold tracking-tight text-black shadow-sm transition-all hover:bg-[#F59E0B] hover:shadow active:scale-95"
            >
              <span>
                {t(
                  'nav_book_service',
                  'Book a Service',
                )}
              </span>

              <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Mobile controls */}
          <div className="flex shrink-0 items-center gap-1 min-[420px]:gap-2 xl:hidden">
            {/* Hidden below 360px and available inside the menu */}
            <div className="hidden scale-90 rounded-xl bg-gray-900 p-0.5 min-[360px]:block">
              <LanguageSelector variant="navbar" />
            </div>

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(
                  (open) => !open,
                )
              }
              id="mobile-hamburger-btn"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="shrink-0 rounded-xl border border-gray-200 p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-black min-[420px]:p-2.5"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 min-[420px]:h-6 min-[420px]:w-6" />
              ) : (
                <Menu className="h-5 w-5 min-[420px]:h-6 min-[420px]:w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="animate-in space-y-3 border-t border-gray-200 bg-white px-3 pb-6 pt-3 shadow-xl slide-in-from-top-2 min-[420px]:px-4 xl:hidden">
          {/* Language access below 360px */}
          <div className="flex items-center justify-between rounded-xl bg-gray-900 px-3 py-2 min-[360px]:hidden">
            <span className="text-xs font-bold text-white">
              {t('nav_language', 'Language')}
            </span>

            <LanguageSelector variant="navbar" />
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={handleHomeClick}
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-gray-800 hover:bg-gray-50"
            >
              {t('nav_home', 'Home')}
            </button>

            <button
              type="button"
              onClick={() =>
                handleNavClick('directory-section')
              }
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t(
                'nav_directory',
                'Mistri Directory',
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                handleNavClick('trust-section')
              }
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t(
                'trust_badge',
                'Trust & Safety',
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentView('register');
                setMobileMenuOpen(false);

                window.scrollTo({
                  top: 0,
                  behavior: 'smooth',
                });
              }}
              className="w-full rounded-lg bg-amber-50 px-3 py-2 text-left text-sm font-bold text-black hover:bg-amber-100"
            >
              {t(
                'nav_register_mistri',
                'Register Mistri',
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                handleNavClick(
                  'how-it-works-section',
                )
              }
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t(
                'nav_how_it_works',
                'How It Works',
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                handleNavClick('about-section')
              }
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('nav_about', 'About Us')}
            </button>

            <button
              type="button"
              onClick={() =>
                handleNavClick('contact-section')
              }
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t(
                'nav_contact',
                'FAQ & Contact',
              )}
            </button>
          </div>

          <div className="flex flex-col gap-2 border-t border-gray-100 pt-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSOSModal();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-black text-[#FFB800]"
            >
              <Zap className="h-4 w-4 fill-[#FFB800]" />

              <span>
                {t(
                  'nav_emergency_sos',
                  '24/7 Emergency SOS Line',
                )}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleBookService();
              }}
              className="w-full rounded-xl bg-[#FFB800] px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-black"
            >
              {t(
                'nav_book_service',
                'Book a Service',
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};