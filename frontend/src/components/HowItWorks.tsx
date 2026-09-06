import React, { useState } from 'react';
import { 
  Search, 
  PhoneCall, 
  ShieldCheck, 
  UserPlus, 
  CheckCircle2, 
  Award, 
  ArrowRight, 
  Zap,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HowItWorksProps {
  onRegisterClick: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onRegisterClick }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'customer' | 'mistri'>('customer');

  const customerSteps = [
    {
      step: '01',
      title: t('how_step1_title', '1. Select Location & Trade'),
      description: t('how_step1_desc', 'Filter by your state, city, and required service category to view certified technicians.'),
      icon: Search,
      highlight: t('how_hl_direct_search', 'Direct Search')
    },
    {
      step: '02',
      title: t('how_step2_title', '2. Review ID & Past Work'),
      description: t('how_step2_desc', 'Check customer ratings, experience years, Aadhaar badges, and previous installation photos.'),
      icon: ShieldCheck,
      highlight: t('how_hl_bg_checked', '100% Background Checked')
    },
    {
      step: '03',
      title: t('how_step3_title', '3. Call Directly & Hire'),
      description: t('how_step3_desc', 'Connect immediately via Phone or WhatsApp with 0% middleman commission.'),
      icon: PhoneCall,
      highlight: t('how_hl_zero_comm', 'Zero Commission')
    }
  ];

  const mistriSteps = [
    {
      step: '01',
      title: t('how_step1_mistri_title', '1. Create Free Profile'),
      description: t('how_step1_mistri_desc', 'Enter your name, mobile number, craft skills, and workshop address in under 2 minutes.'),
      icon: UserPlus,
      highlight: t('how_hl_free_onboarding', 'Free Onboarding')
    },
    {
      step: '02',
      title: t('how_step2_mistri_title', '2. Get KYC Verified'),
      description: t('how_step2_mistri_desc', 'Receive your official MistriKhoj Digital Identity Card and Gold Master badge.'),
      icon: Award,
      highlight: t('how_hl_verified_id', 'Verified ID Card')
    },
    {
      step: '03',
      title: t('how_step3_mistri_title', '3. Receive Direct Inquiries'),
      description: t('how_step3_mistri_desc', 'Get calls directly from local customers and keep 100% of your daily earnings.'),
      icon: Zap,
      highlight: t('how_hl_keep_earnings', 'Keep 100% Earnings')
    }
  ];

  const currentSteps = activeTab === 'customer' ? customerSteps : mistriSteps;

  return (
    <section id="how-it-works-section" className="py-16 sm:py-24 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="text-xs font-black tracking-[0.2em] text-gray-500 uppercase">
                {t('how_badge', 'HOW IT WORKS')}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFB800]"></span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-[#111827] tracking-tight">
              {t('how_title', 'How It Works')}
            </h2>
          </div>

          {/* Handwritten script note */}
          <div className="md:text-right">
            <span className="font-handwriting text-3xl sm:text-4xl text-gray-800 -rotate-2 inline-block">
              {t('how_handwritten', 'Home services, made easy!')}
            </span>
          </div>
        </div>

        {/* Audience Perspective Toggle Tabs */}
        <div className="flex justify-start mb-8">
          <div className="inline-flex p-1 rounded-xl bg-gray-100 border border-gray-200">
            <button
              onClick={() => setActiveTab('customer')}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'customer'
                  ? 'bg-black text-[#FFB800] shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              {t('how_tab_customer', 'For Homeowners')}
            </button>
            <button
              onClick={() => setActiveTab('mistri')}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'mistri'
                  ? 'bg-black text-[#FFB800] shadow-sm'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              {t('how_tab_mistri', 'For Technicians & Mistris')}
            </button>
          </div>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentSteps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div 
                key={idx}
                className="group relative p-8 rounded-2xl bg-white border-2 border-gray-200 hover:border-black transition-all hover:shadow-xl flex flex-col justify-between"
              >
                {/* Step indicator top right */}
                <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 group-hover:bg-[#FFB800] transition-colors flex items-center justify-center text-black">
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>
                  <span className="font-heading-impact text-3xl text-gray-400 group-hover:text-black transition-colors">
                    {s.step}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-black mb-3">
                    {s.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {s.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    {s.highlight}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-[#FFB800]" />
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA banner below steps */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-[#0D0F12] text-white flex flex-col sm:flex-row items-center justify-between gap-6 border-2 border-[#FFB800]/20">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-black text-white">
              {t('how_cta_title', 'Are you a professional craftsman looking for direct client calls?')}
            </h4>
            <p className="text-xs text-gray-400">
              {t('how_cta_subtitle', 'Join 15,000+ verified professionals across 8 states. 100% free registration.')}
            </p>
          </div>

          <button
            onClick={onRegisterClick}
            className="px-6 py-3.5 rounded-xl bg-[#FFB800] hover:bg-[#F59E0B] text-black font-extrabold text-xs tracking-wider uppercase transition-transform hover:scale-105 active:scale-95 shrink-0 flex items-center gap-2 cursor-pointer shadow-md"
          >
            <span>{t('nav_register_mistri', 'Register Mistri')}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

      </div>
    </section>
  );
};
