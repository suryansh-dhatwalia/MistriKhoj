import React, { useState } from 'react';
import { ArrowLeft, Check, Upload, Building2, Phone, Mail, Image as ImageIcon, Film, CreditCard } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AdvertisePageProps {
  onBackToHome: () => void;
}

export const AdvertisePage: React.FC<AdvertisePageProps> = ({ onBackToHome }) => {
  const { t } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isSubmitted) {
    return (
      <div className="py-20 px-6 max-w-2xl mx-auto text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 stroke-[3]" />
        </div>
        <h2 className="text-3xl font-black mb-4">Request Submitted!</h2>
        <p className="text-gray-600 mb-8">
          Thank you for your interest in advertising with MistriKhoj. Our team will review your request and contact you within 24 hours to finalize your campaign setup.
        </p>
        <button
          onClick={onBackToHome}
          className="bg-black text-[#FFB800] px-8 py-4 rounded-xl font-black text-lg hover:bg-gray-800 transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Back navigation */}
      <button
        onClick={onBackToHome}
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-black mb-6 transition-colors bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Homepage</span>
      </button>

      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
          Advertise <span className="text-[#FFB800]">With Us</span>
        </h1>
        <p className="text-gray-600 font-medium max-w-2xl mx-auto">
          Showcase your brand, products, or services directly to thousands of homeowners and local technicians across our platform.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-black text-[#FFB800] p-6 sm:p-8">
          <h2 className="text-xl font-black flex items-center gap-3">
            <Building2 className="w-6 h-6" />
            Submit Your Ad Request
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Fill out the details below to request ad placement on our homepage banner.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {/* Company Details */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-900 border-b pb-2 uppercase tracking-wide">
              1. Business Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700">Company / Brand Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    required
                    type="text"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-black focus:border-black transition-all outline-none"
                    placeholder="E.g., Asian Paints, Local Hardware"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700">Contact Number *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    required
                    type="tel"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-black focus:border-black transition-all outline-none"
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    required
                    type="email"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-black focus:border-black transition-all outline-none"
                    placeholder="For business inquiries and billing"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ad Setup */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-900 border-b pb-2 uppercase tracking-wide">
              2. Advertisement Setup
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700">Ad Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="cursor-pointer">
                    <input type="radio" name="adType" value="image" className="peer sr-only" defaultChecked />
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-xl peer-checked:border-black peer-checked:bg-gray-50 transition-all">
                      <ImageIcon className="w-6 h-6 mb-2 text-gray-600" />
                      <span className="text-xs font-bold">Image Banner</span>
                    </div>
                  </label>
                  <label className="cursor-pointer">
                    <input type="radio" name="adType" value="video" className="peer sr-only" />
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-xl peer-checked:border-black peer-checked:bg-gray-50 transition-all">
                      <Film className="w-6 h-6 mb-2 text-gray-600" />
                      <span className="text-xs font-bold">Video Ad</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700">Duration *</label>
                <select 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-black focus:border-black transition-all outline-none h-full"
                >
                  <option value="">Select duration...</option>
                  <option value="1_week">1 Week (₹5,000)</option>
                  <option value="1_month">1 Month (₹15,000)</option>
                  <option value="3_months">3 Months (₹40,000)</option>
                  <option value="6_months">6 Months (₹70,000)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700">Upload Banner or Video *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                <Upload className="w-8 h-8 mx-auto text-gray-400 group-hover:text-black transition-colors mb-3" />
                <p className="text-sm font-bold text-gray-700">Click to upload your ad creative</p>
                <p className="text-xs text-gray-500 mt-1">Images (1200x400) up to 5MB, Video up to 20MB</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700">Target URL (Optional)</label>
              <input
                type="url"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-black focus:border-black transition-all outline-none"
                placeholder="Where should users go when they click your ad? (e.g. https://yourwebsite.com)"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="w-full bg-black text-[#FFB800] py-4 rounded-xl font-black text-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-xl shadow-black/10"
            >
              <CreditCard className="w-5 h-5" />
              <span>Submit Ad Request & Proceed</span>
            </button>
            <p className="text-[10px] text-center text-gray-500 mt-4">
              By submitting, you agree to our Advertising Terms and Conditions. Our team will verify the creative before it goes live.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
