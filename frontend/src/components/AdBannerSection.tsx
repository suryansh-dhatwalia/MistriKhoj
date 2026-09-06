import React, { useState, useEffect } from 'react';
import { ExternalLink, Info, Megaphone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AdBannerSectionProps {
  onAdvertiseClick: () => void;
}

const SAMPLE_ADS = [
  {
    id: 'ad-1',
    companyName: 'UltraTech Cement',
    title: 'Build Beautiful Homes',
    description: 'The Engineer\'s Choice. Get 10% off on bulk orders for your next big project.',
    imageUrl: 'https://images.unsplash.com/photo-1541888086425-d81bb19240f5?auto=format&fit=crop&q=80&w=1200&h=400',
    ctaText: 'View Offers',
    link: '#',
    type: 'image'
  },
  {
    id: 'ad-2',
    companyName: 'Local Hardware Pros',
    title: 'Premium Tools on Sale',
    description: 'Upgrade your toolkit with premium brands at 30% discount.',
    videoUrl: 'https://cdn.pixabay.com/video/2021/08/25/86236-592750692_tiny.mp4',
    ctaText: 'Shop Now',
    link: '#',
    type: 'video'
  },
  {
    id: 'ad-3',
    companyName: 'Asian Paints',
    title: 'Bring Colors to Life',
    description: 'Explore the new Royale range. Water-proof, dust-proof, and vibrant.',
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=1200&h=400',
    ctaText: 'Explore Colors',
    link: '#',
    type: 'image'
  }
];

export const AdBannerSection: React.FC<AdBannerSectionProps> = ({ onAdvertiseClick }) => {
  const { t } = useLanguage();
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % SAMPLE_ADS.length);
    }, 6000); // Switch every 6 seconds
    return () => clearInterval(timer);
  }, []);

  const currentAd = SAMPLE_ADS[currentAdIndex];

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-gray-500 mb-4 md:mb-0">
          <Megaphone className="w-4 h-4 text-[#FFB800]" />
          <span className="text-xs font-bold uppercase tracking-wider">Featured Partners</span>
        </div>
        
        <button 
          onClick={onAdvertiseClick}
          className="text-xs font-bold bg-white border border-gray-200 px-4 py-2 rounded-lg hover:border-black transition-colors"
        >
          {t('advertise_with_us', 'Advertise With Us')}
        </button>
      </div>

      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-black group h-[250px] md:h-[300px]">
        {/* Background Asset */}
        <div className="absolute inset-0">
          {SAMPLE_ADS.map((ad, idx) => (
            <div 
              key={ad.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                idx === currentAdIndex ? 'opacity-100' : 'opacity-0 z-0'
              } ${idx === currentAdIndex ? 'z-10' : ''}`}
            >
              {ad.type === 'video' ? (
                <video 
                  src={ad.videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={ad.imageUrl}
                  alt={ad.companyName}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ))}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-20"></div>
        </div>

        {/* Ad Content */}
        <div className="relative z-30 h-full flex flex-col justify-center p-6 md:p-12 w-full md:w-2/3">
          <div className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-white/90 text-[10px] font-bold px-2.5 py-1 rounded-full mb-4 w-max border border-white/10">
            <Info className="w-3 h-3" />
            <span>Sponsored by {currentAd.companyName}</span>
          </div>
          
          <h3 className="text-2xl md:text-4xl font-black text-white mb-3 leading-tight drop-shadow-sm">
            {currentAd.title}
          </h3>
          <p className="text-sm md:text-base text-gray-200 font-medium mb-6 max-w-lg drop-shadow">
            {currentAd.description}
          </p>
          
          <a
            href={currentAd.link}
            className="inline-flex items-center justify-center gap-2 bg-[#FFB800] text-black px-6 py-3 rounded-xl font-bold text-sm w-max hover:bg-yellow-400 transition-colors shadow-lg"
          >
            <span>{currentAd.ctaText}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {SAMPLE_ADS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentAdIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentAdIndex ? 'bg-[#FFB800] w-6' : 'bg-white/50 hover:bg-white'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
