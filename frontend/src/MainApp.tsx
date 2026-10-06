import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AdBannerSection } from './components/AdBannerSection';
import { MistriNewsStrip } from './components/MistriNewsStrip';
import { TechnicianDirectory } from './components/TechnicianDirectory';
import { PopularCategories } from './components/PopularCategories';
import { HowItWorks } from './components/HowItWorks';
import { TrustAndSafety } from './components/TrustAndSafety';
import { AboutSection } from './components/AboutSection';
import { SupportedLocations } from './components/SupportedLocations';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ContactSection } from './components/ContactSection';
import { RegisterPage } from './components/RegisterPage';
import { AdvertisePage } from './components/AdvertisePage';
import { Footer } from './components/Footer';
import { TechnicianModal } from './components/TechnicianModal';
import { FloatingActions } from './components/FloatingActions';
import { api } from './lib/api';
import { avatarOrDefault } from './lib/avatar';
import type {
  DirectorySortOption,
  MistriListApiResponse,
  MistriListItem,
  RegistrationApiError,
  SupportedState,
  Technician
} from './types';

const toTechnician = (mistri: MistriListItem): Technician => ({
  id: `MST-${String(mistri.id).padStart(6, '0')}`,
  name: mistri.fullName,
  primaryPhone: mistri.primaryPhone,
  alternatePhone: mistri.alternatePhone || undefined,
  state: mistri.state as SupportedState,
  city: mistri.city,
  category: mistri.category,
  qualification: mistri.qualification,
  address: `${mistri.address}${mistri.pincode ? `, PIN - ${mistri.pincode}` : ''}`,
  experienceYears: mistri.experienceYears,
  servicesOffered: mistri.servicesOffered,
  intro:
    mistri.shortIntro ||
    `${mistri.category} providing services in ${mistri.city}, ${mistri.state}.`,
  photoUrl: avatarOrDefault(mistri.profilePhotoUrl),
  galleryImages: mistri.galleryImages,
  rating: mistri.avgRating ?? 0,
  reviewsCount: mistri.ratingsCount ?? 0,
  isVerified: false,
  badgeLevel: 'New Registration',
  startingPrice: 0,
  completedJobs: 0,
  skillTestCertified: false,
  memberSince: mistri.createdAt,
  plan: mistri.plan ?? 'FREE',
  isFeatured: Boolean(mistri.isFeatured),
  featuredUntil: mistri.featuredUntil ?? null
});

export function MainApp() {
  const [currentView, setCurrentView] = useState<'home' | 'register' | 'advertise'>('home');
  const [selectedState, setSelectedState] = useState<SupportedState | 'All'>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minExperience, setMinExperience] = useState<number>(0);
  const [onlyGoldPartner, setOnlyGoldPartner] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<DirectorySortOption>('random');
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoadingTechnicians, setIsLoadingTechnicians] = useState(true);
  const [techniciansError, setTechniciansError] = useState<string | null>(null);
  const [activeTechnicianModal, setActiveTechnicianModal] = useState<Technician | null>(null);

  // Search only offers states / cities that currently have at least one live Mistri.
  const activeStates = useMemo(
    () => Array.from(new Set(technicians.map((tech) => tech.state).filter(Boolean))).sort(),
    [technicians],
  );
  const getActiveCities = useCallback(
    (stateName: string) =>
      Array.from(
        new Set(technicians.filter((tech) => tech.state === stateName).map((tech) => tech.city).filter(Boolean)),
      ).sort(),
    [technicians],
  );

  const loadTechnicians = useCallback(async (signal?: AbortSignal) => {
    setIsLoadingTechnicians(true);
    setTechniciansError(null);

    try {
      const response = await api.get<MistriListApiResponse>('/mistris', { signal });
      setTechnicians(response.data.data.map(toTechnician));
    } catch (error: unknown) {
      if (axios.isCancel(error)) return;

      const message = axios.isAxiosError<RegistrationApiError>(error)
        ? error.response?.data?.message || 'Could not load registered Mistris.'
        : 'Could not load registered Mistris.';

      setTechniciansError(message);
    } finally {
      if (!signal?.aborted) setIsLoadingTechnicians(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadTechnicians(controller.signal);

    return () => controller.abort();
  }, [loadTechnicians]);

  // Search submission scroll
  const handleSearchSubmit = () => {
    const el = document.getElementById('directory-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Direct Contact Handlers
  const handleDirectContact = (tech: Technician, method: 'phone' | 'whatsapp') => {
    const rawNumber = tech.primaryPhone.replace(/\D/g, '');
    if (method === 'phone') {
      window.location.href = `tel:${rawNumber}`;
    } else {
      const msg = encodeURIComponent(
        `Hello ${tech.name}, I found your profile on MistriKhoj for ${tech.category} services in ${tech.city}. Are you available for a site visit/repair?`
      );
      window.open(`https://wa.me/${rawNumber}?text=${msg}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#161616] flex flex-col selection:bg-[#161616] selection:text-[#FAF7F2]">
      
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedState={selectedState}
        activeStates={activeStates}
        setSelectedState={(st) => {
          setSelectedState(st);
          setSelectedCity('All');
        }}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' ? (
          <>
            {/* 1. Hero Search Engine */}
            <HeroSection
              selectedState={selectedState}
              setSelectedState={setSelectedState}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              minExperience={minExperience}
              setMinExperience={setMinExperience}
              onlyGoldPartner={onlyGoldPartner}
              setOnlyGoldPartner={setOnlyGoldPartner}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onSearchSubmit={handleSearchSubmit}
              onRegisterClick={() => {
                setCurrentView('register');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              totalRegisteredCount={technicians.length}
              activeStates={activeStates}
              getActiveCities={getActiveCities}
            />

            {/* Scrolling Mistri News Strip (admin-managed) */}
            <MistriNewsStrip />

            {/* Featured Ad Banner Section */}
            <AdBannerSection
              onAdvertiseClick={() => {
                setCurrentView('advertise');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
            />

            {/* 2. Interactive Verified Technician Directory */}
            <TechnicianDirectory
              technicians={technicians}
              isLoading={isLoadingTechnicians}
              loadError={techniciansError}
              onRetry={() => void loadTechnicians()}
              selectedState={selectedState}
              setSelectedState={setSelectedState}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              minExperience={minExperience}
              setMinExperience={setMinExperience}
              onlyGoldPartner={onlyGoldPartner}
              setOnlyGoldPartner={setOnlyGoldPartner}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onSelectTechnician={(tech) => setActiveTechnicianModal(tech)}
              onDirectContact={handleDirectContact}
            />

            {/* 3. Popular Service Categories */}
            <PopularCategories
              onSelectCategory={(catName) => {
                setSelectedCategory(catName);
                handleSearchSubmit();
              }}
            />

            {/* 4. How It Works (For Customers & Mistris) */}
            <HowItWorks
              onRegisterClick={() => {
                setCurrentView('register');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* 5. Trust & Safety Standards */}
            <TrustAndSafety />

            {/* 6. About MistriKhoj Story & Mission */}
            <AboutSection />

            {/* 7. Supported Indian States & Cities */}
            <SupportedLocations
              onSelectLocation={(state, city) => {
                setSelectedState(state);
                setSelectedCity(city || 'All');
                handleSearchSubmit();
              }}
            />

            {/* 8. Customer Testimonials Across States */}
            <TestimonialsSection />

            {/* 9. Contact & Support Center */}
            <ContactSection />
          </>
        ) : currentView === 'register' ? (
          /* Separate "Register Mistri" Dedicated Page */
          <RegisterPage
            onBackToHome={() => {
              setCurrentView('home');
              void loadTechnicians();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          /* Separate "Advertise With Us" Dedicated Page */
          <AdvertisePage
            onBackToHome={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Classy Footer */}
      <Footer
        onSelectState={(st) => {
          setSelectedState(st);
          setSelectedCity('All');
        }}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
        }}
        onNavigateHome={() => {
          setCurrentView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateRegister={() => {
          setCurrentView('register');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Floating Quick Action Widgets */}
      <FloatingActions />

      {/* Modal Profile / ID & Credentials Inspector */}
      <TechnicianModal
        technician={activeTechnicianModal}
        onClose={() => setActiveTechnicianModal(null)}
        onDirectContact={handleDirectContact}
      />
    </div>
  );
}
