import React from 'react';
import { 
  Zap, 
  Droplet, 
  Hammer, 
  AirVent, 
  Paintbrush, 
  Layers, 
  Flame, 
  ShieldCheck, 
  Sparkles, 
  Wrench,
  ArrowRight,
  Sparkle,
  Truck
} from 'lucide-react';
import { SERVICE_CATEGORIES } from '../data/categories';
import { useLanguage } from '../context/LanguageContext';

interface PopularCategoriesProps {
  onSelectCategory: (categoryName: string) => void;
}

export const PopularCategories: React.FC<PopularCategoriesProps> = ({ onSelectCategory }) => {
  const { t } = useLanguage();

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="w-5 h-5 text-black" />;
      case 'Droplet': return <Droplet className="w-5 h-5 text-black" />;
      case 'Hammer': return <Hammer className="w-5 h-5 text-black" />;
      case 'AirVent': return <AirVent className="w-5 h-5 text-black" />;
      case 'Paintbrush': return <Paintbrush className="w-5 h-5 text-black" />;
      case 'BrickWall': return <Layers className="w-5 h-5 text-black" />;
      case 'Flame': return <Flame className="w-5 h-5 text-black" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-black" />;
      case 'Sparkles': return <Sparkle className="w-5 h-5 text-black" />;
      default: return <Wrench className="w-5 h-5 text-black" />;
    }
  };

  return (
    <section id="services-section" className="py-16 sm:py-20 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="text-xs font-black tracking-[0.2em] text-gray-500 uppercase">
                {t('cat_badge', 'CRAFT CATEGORIES')}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFB800]"></span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
              {t('cat_title', 'Explore Master Trades')}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md font-medium">
            {t('cat_subtitle', 'From electrical wiring and plumbing to appliance repair and auto mechanics.')}
          </p>
        </div>

        {/* Categories Grid (2 rows x 4 cols on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {SERVICE_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.name);
                const el = document.getElementById('directory-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group p-5 rounded-2xl bg-gray-50/70 border border-gray-200 hover:border-black transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FFB800] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    {getCategoryIcon(cat.iconName)}
                  </div>
                  <span className="text-[10px] font-extrabold text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                    {cat.techniciansAvailable}+ {t('cat_pros', 'pros')}
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-sm sm:text-base text-[#111827] group-hover:text-black mb-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {cat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-center justify-between text-xs font-bold text-gray-700 group-hover:text-black">
                <span>{t('cat_view_mistris', 'View Mistris')}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
