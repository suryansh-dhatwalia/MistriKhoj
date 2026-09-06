import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2,
  PhoneCall,
  UserCheck,
  Zap,
  Tag,
  Award
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const TrustAndSafety: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="trust-section" className="py-16 sm:py-24 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-xs font-black tracking-[0.2em] text-gray-500 uppercase">
              {t('trust_badge', 'TRUST & SAFETY')}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFB800]"></span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-[#111827] tracking-tight">
            {t('trust_title', '100% Verified & Safe Services')}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-3 max-w-xl mx-auto leading-relaxed font-medium">
            {t('trust_subtitle', 'Rigorous background checks to ensure complete safety and peace of mind for your family.')}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 max-w-5xl mx-auto">
          
          {/* Card 1: Large Photo Card (Top Left - 7 cols) */}
          <div className="lg:col-span-7 h-72 sm:h-80 md:h-96 rounded-2xl overflow-hidden relative group shadow-sm border-2 border-black">
            <img 
              src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1000&auto=format&fit=crop&q=80" 
              alt="Technicians working together"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-[#FFB800] text-black font-black text-[10px] uppercase tracking-wider rounded">
                {t('trust_direct_tag', 'Direct Contact')}
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h3 className="font-display text-xl sm:text-2xl font-black tracking-tight text-white mb-1.5">
                {t('trust_direct_title', 'Direct Phone & WhatsApp Connect')}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 max-w-md leading-relaxed">
                {t('trust_direct_desc', 'Connect instantly with certified ustads in your locality—no waiting in queues, no app commission cuts.')}
              </p>
            </div>
          </div>

          {/* Card 2: 100% Aadhaar & Background Checked (Top Right - 5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-[#0D0F12] text-white flex flex-col justify-between border-2 border-black relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFB800]/10 rounded-full blur-2xl pointer-events-none"></div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-[#FFB800] text-black flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-black text-[#FFB800] uppercase tracking-widest block mb-1">
                {t('trust_card1_title', 'Background Checked')}
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-black tracking-tight text-white mb-3">
                {t('trust_card1_title', 'Aadhaar KYC Certified')}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                {t('trust_card1_desc', 'Every listed technician submits government identity proof and address verification.')}
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-800 flex items-center gap-2 text-xs font-bold text-gray-300">
              <CheckCircle2 className="w-4 h-4 text-[#FFB800]" />
              <span>{t('trust_multilayer', 'Multi-layer physical verification')}</span>
            </div>
          </div>

          {/* Card 3: 0% Platform Commission (Bottom Left - 5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-xl bg-black text-[#FFB800] flex items-center justify-center mb-6">
                <Tag className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block mb-1">
                {t('trust_fair_wages', 'Fair Wages')}
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-black tracking-tight text-black mb-3">
                {t('trust_card3_title', '0% Platform Commission')}
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                {t('trust_card3_desc', 'Direct connection between customers and workers. Zero commission markups.')}
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-amber-200 flex items-center gap-2 text-xs font-bold text-gray-900">
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span>{t('trust_100_payment', '100% of payment goes to the craftsman')}</span>
            </div>
          </div>

          {/* Card 4: 24/7 SOS Emergency (Bottom Right - 7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-white border-2 border-black flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest block mb-1">
                  {t('trust_immediate_dispatch', 'Immediate Dispatch')}
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-black tracking-tight text-black mb-3">
                  {t('trust_card4_title', '24/7 Emergency SOS Line')}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md">
                  {t('trust_card4_desc', 'Immediate dispatch for short circuits, water pipe bursts, or door lock emergencies.')}
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-center justify-center p-3 rounded-xl bg-gray-100 border border-gray-200">
                <span className="font-heading-impact text-2xl font-black text-red-600">15 min</span>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{t('trust_avg_response', 'Avg Response')}</span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-600" />
                <span>{t('trust_round_the_clock', 'Round-the-clock technician availability')}</span>
              </div>
              <span className="text-[11px] text-gray-400">{t('trust_emergency_desk', 'Emergency Desk')}</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
