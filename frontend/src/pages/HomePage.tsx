import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '../components/HeroSection';
import { AdBannerSection } from '../components/AdBannerSection';
import { MistriNewsStrip } from '../components/MistriNewsStrip';
import { PopularCategories } from '../components/PopularCategories';
import { HowItWorks } from '../components/HowItWorks';
import { TrustAndSafety } from '../components/TrustAndSafety';
import { AboutSection } from '../components/AboutSection';
import { SupportedLocations } from '../components/SupportedLocations';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { ContactSection } from '../components/ContactSection';
import { useLocations } from '../context/LocationsContext';
import { buildResultsPath, slugify } from '../lib/searchParams';
import { usePageMeta } from '../lib/seo';
import type { DirectorySortOption, SupportedState } from '../types';

/**
 * Homepage: hero search, news strip, homepage/global ads and marketing sections. It never
 * lists Mistri profiles — a search navigates to the shareable /mistris results page.
 */
export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { activeStates, getActiveCities, totalRegistered } = useLocations();
  const [selectedState, setSelectedState] = useState<SupportedState | 'All'>('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [minExperience, setMinExperience] = useState(0);
  const [sortBy, setSortBy] = useState<DirectorySortOption>('random');

  usePageMeta({
    title: 'MistriKhoj | Verified Local Technicians & Craftsmen in India',
    description:
      'Find verified electricians, plumbers, carpenters, painters, and technicians across India. Direct contacts, 0% commission.',
    canonicalPath: '/',
  });

  const goToResults = () =>
    navigate(
      buildResultsPath({
        state: selectedState === 'All' ? '' : selectedState,
        city: selectedCity === 'All' ? '' : selectedCity,
        category: selectedCategory === 'All' ? '' : selectedCategory,
        q: searchQuery,
        minExp: minExperience,
        sort: sortBy,
      }),
    );

  return (
    <>
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
        sortBy={sortBy}
        setSortBy={setSortBy}
        onSearchSubmit={goToResults}
        onRegisterClick={() => navigate('/register')}
        totalRegisteredCount={totalRegistered}
        activeStates={activeStates}
        getActiveCities={getActiveCities}
      />
      <MistriNewsStrip />
      <AdBannerSection onAdvertiseClick={() => navigate('/advertise')} />
      <PopularCategories onSelectCategory={(category) => navigate(buildResultsPath({ category: slugify(category) }))} />
      <HowItWorks onRegisterClick={() => navigate('/register')} />
      <TrustAndSafety />
      <AboutSection />
      <SupportedLocations
        onSelectLocation={(state, city) => navigate(buildResultsPath({ state, city: city ?? '' }))}
      />
      <TestimonialsSection />
      <ContactSection />
    </>
  );
};
