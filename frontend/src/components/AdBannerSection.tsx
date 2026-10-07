import React from 'react';
import { Megaphone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useContent } from '../context/ContentContext';
import { AdGrid } from './AdGrid';

interface AdBannerSectionProps {
  onAdvertiseClick: () => void;
}

/**
 * Homepage advertising area. It shows only the homepage/global ads the content API
 * returned for the HOME_BANNER placement; location-targeted ads live on results pages.
 */
export const AdBannerSection: React.FC<AdBannerSectionProps> = ({ onAdvertiseClick }) => {
  const { t } = useLanguage();
  const { homeAds } = useContent();

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" aria-labelledby="featured-partners-heading">
      <div className="mb-4 flex flex-col items-center justify-between gap-3 md:flex-row">
        <div className="flex items-center gap-2 text-gray-500">
          <Megaphone className="h-4 w-4 text-[#FFB800]" aria-hidden="true" />
          <h2 id="featured-partners-heading" className="text-xs font-bold uppercase tracking-wider">
            Featured Partners
          </h2>
        </div>

        <button
          type="button"
          onClick={onAdvertiseClick}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold transition-colors hover:border-black"
        >
          {t('advertise_with_us', 'Advertise With Us')}
        </button>
      </div>

      <AdGrid ads={homeAds} ariaLabel="Featured partner advertisements" />
    </section>
  );
};
