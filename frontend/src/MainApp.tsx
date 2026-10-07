import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingActions } from './components/FloatingActions';
import { useLocations } from './context/LocationsContext';
import { analytics } from './lib/analytics';
import { buildResultsPath, parseResultsParams, slugify } from './lib/searchParams';
import type { SupportedState } from './types';

type View = 'home' | 'register' | 'advertise';

/** Site shell: navigation, footer and floating actions around the routed page. */
export function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeStates } = useLocations();

  const currentView: View =
    location.pathname === '/register' ? 'register' : location.pathname === '/advertise' ? 'advertise' : 'home';

  const browsing = location.pathname === '/mistris' ? parseResultsParams(new URLSearchParams(location.search)) : null;
  const selectedState: SupportedState | 'All' =
    activeStates.find((name) => slugify(name) === browsing?.state) ?? 'All';

  // One page view per navigation (deduped, so StrictMode / re-renders never double count).
  useEffect(() => {
    const filters =
      location.pathname === '/mistris' ? parseResultsParams(new URLSearchParams(location.search)) : null;
    analytics.trackPageView(location.key, location.pathname, filters ? { state: filters.state, city: filters.city } : undefined);
  }, [location.key, location.pathname, location.search]);

  // New page, new scroll position (unless the URL targets an in-page anchor).
  useEffect(() => {
    if (!location.hash) window.scrollTo({ top: 0 });
  }, [location.pathname]);

  const goTo = (view: View) => navigate(view === 'home' ? '/' : `/${view}`);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#161616] flex flex-col selection:bg-[#161616] selection:text-[#FAF7F2]">
      <Navbar
        currentView={currentView}
        setCurrentView={goTo}
        selectedState={selectedState}
        activeStates={activeStates}
        setSelectedState={(state) => navigate(buildResultsPath({ state: state === 'All' ? '' : state }))}
        onSelectCategory={(category) => navigate(buildResultsPath({ category: slugify(category) }))}
      />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer
        onSelectState={(state) => navigate(buildResultsPath({ state }))}
        onSelectCategory={(category) => navigate(buildResultsPath({ category: slugify(category) }))}
        onNavigateHome={() => goTo('home')}
        onNavigateRegister={() => goTo('register')}
      />

      <FloatingActions />
    </div>
  );
}
