import React from 'react';
import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ContentProvider } from './context/ContentContext';
import { LocationsProvider, useLocations } from './context/LocationsContext';
import { MainApp } from './MainApp';
import { HomePage } from './pages/HomePage';
import { ResultsPage } from './pages/ResultsPage';
import { ProfilePage } from './pages/ProfilePage';
import { RegisterPage } from './components/RegisterPage';
import { AdvertisePage } from './components/AdvertisePage';
import { usePageMeta } from './lib/seo';

const RegisterRoute: React.FC = () => {
  const navigate = useNavigate();
  const { reload } = useLocations();
  usePageMeta({ title: 'Register as a Mistri', description: 'Register your trade on MistriKhoj and get found by customers near you.' });
  return (
    <RegisterPage
      onBackToHome={() => {
        reload();
        navigate('/');
      }}
    />
  );
};

const AdvertiseRoute: React.FC = () => {
  const navigate = useNavigate();
  usePageMeta({ title: 'Advertise With Us', description: 'Reach customers and Mistris across India with MistriKhoj advertising.' });
  return <AdvertisePage onBackToHome={() => navigate('/')} />;
};

const NotFound: React.FC = () => {
  usePageMeta({ title: 'Page not found', description: 'This page does not exist.', noindex: true });
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-black">Page not found</h1>
      <Link to="/" className="mt-4 inline-block rounded-xl bg-[#FFB800] px-5 py-2.5 text-xs font-bold text-black">
        Go to homepage
      </Link>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ContentProvider>
        <LanguageProvider>
          <LocationsProvider>
            <Routes>
              <Route element={<MainApp />}>
                <Route index element={<HomePage />} />
                <Route path="mistris" element={<ResultsPage />} />
                <Route path="mistri/:id" element={<ProfilePage />} />
                <Route path="register" element={<RegisterRoute />} />
                <Route path="advertise" element={<AdvertiseRoute />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </LocationsProvider>
        </LanguageProvider>
      </ContentProvider>
    </BrowserRouter>
  );
}
