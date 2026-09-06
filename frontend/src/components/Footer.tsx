import React from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Phone,
  HardHat
} from 'lucide-react';
import { SUPPORTED_STATES } from '../data/locations';
import { SERVICE_CATEGORIES } from '../data/categories';
import { SupportedState } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onSelectState: (state: SupportedState) => void;
  onSelectCategory: (category: string) => void;
  onNavigateHome: () => void;
  onNavigateRegister: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectState,
  onSelectCategory,
  onNavigateHome,
  onNavigateRegister
}) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#0D0F12] text-white border-t border-black pt-16 pb-48">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-gray-800">

          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFB800] text-black flex items-center justify-center font-black shadow">
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                  <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-heading-impact text-2xl tracking-wide text-white leading-none">
                  MISTRI<span className="text-[#FFB800]">KHOJ</span>
                </span>
                <span className="text-[9px] uppercase tracking-[0.25em] text-gray-400 font-bold">
                  {t('nav_brand_subtitle', 'DIRECT VERIFIED DIRECTORY')}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-400 max-w-sm leading-relaxed font-normal">
              {t('footer_desc', 'Bharat’s premier open discovery directory for certified local technicians and craftsmen. 0% Commission.')}
            </p>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={onNavigateRegister}
                className="px-5 py-2.5 rounded-xl bg-[#FFB800] hover:bg-[#F59E0B] text-black text-xs font-black transition-colors cursor-pointer"
              >
                {t('nav_register_mistri', 'Register Mistri')}
              </button>
              <a
                href="tel:18008896478"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-colors flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-[#FFB800]" />
                <span>{t('footer_helpline', 'Call Helpline')}</span>
              </a>
            </div>
          </div>

          {/* Col 2: Supported 8 States */}
          <div className="space-y-3">
            <h4 className="font-display font-black text-xs uppercase tracking-widest text-[#FFB800]">
              {t('footer_states_title', 'Supported 8 States')}
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-400 font-medium">
              {SUPPORTED_STATES.map((st) => (
                <li key={st.name}>
                  <button
                    onClick={() => {
                      onSelectState(st.name);
                      onNavigateHome();
                      setTimeout(() => {
                        const el = document.getElementById('directory-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="hover:text-white transition-colors text-left"
                  >
                    {st.name} ({st.code})
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Popular Crafts */}
          <div className="space-y-3">
            <h4 className="font-display font-black text-xs uppercase tracking-widest text-[#FFB800]">
              {t('footer_crafts_title', 'Craft Categories')}
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-400 font-medium">
              {SERVICE_CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat.name);
                      onNavigateHome();
                      setTimeout(() => {
                        const el = document.getElementById('directory-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="hover:text-white transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Trust & Verification */}
          <div className="space-y-3">
            <h4 className="font-display font-black text-xs uppercase tracking-widest text-[#FFB800]">
              {t('footer_safety_title', 'Safety & Verification')}
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#FFB800] shrink-0 mt-0.5" />
                <span>{t('footer_aadhaar_check', 'Aadhaar Identity Proofs')}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#FFB800] shrink-0 mt-0.5" />
                <span>{t('footer_police_check', 'Local Police Verification')}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#FFB800] shrink-0 mt-0.5" />
                <span>{t('footer_rate_cards', 'Standardized Rate Cards')}</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#FFB800] shrink-0 mt-0.5" />
                <span>{t('footer_sos_desk', '24/7 SOS Emergency Desk')}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright & Disclaimer Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© 2026 MistriKhoj (मिस्त्री खोज). Connecting India’s skilled craftsmen with local homeowners.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Assam HQ • Pan-India Regional Operations</span>
            <span>•</span>
            <span className="text-[#FFB800] font-bold">100% Commission-Free</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
