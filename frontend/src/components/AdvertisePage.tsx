import React, { useRef, useState } from 'react';
import { ArrowLeft, Check, Upload, Building2, Phone, Mail, Image as ImageIcon, Film, CreditCard, Loader2 } from 'lucide-react';
import axios from 'axios';
import { api } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';

interface AdvertisePageProps {
  onBackToHome: () => void;
}

const MAX_CREATIVE_BYTES = 5 * 1024 * 1024;
const ALLOWED_CREATIVE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_VIDEO_BYTES = 45 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsDataURL(file);
  });

export const AdvertisePage: React.FC<AdvertisePageProps> = ({ onBackToHome }) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [companyName, setCompanyName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [adType, setAdType] = useState<'image' | 'video'>('image');
  const [duration, setDuration] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [message, setMessage] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [videoDataUrl, setVideoDataUrl] = useState('');
  const [videoFileName, setVideoFileName] = useState('');
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    setFieldErrors((prev) => ({ ...prev, creative: '' }));
    if (!file) return;
    if (!ALLOWED_CREATIVE_TYPES.includes(file.type)) {
      setFieldErrors((prev) => ({ ...prev, creative: 'Use a PNG, JPEG or WebP image.' }));
      return;
    }
    if (file.size > MAX_CREATIVE_BYTES) {
      setFieldErrors((prev) => ({ ...prev, creative: 'Image must be 5 MB or smaller.' }));
      return;
    }
    try {
      setImageDataUrl(await fileToDataUrl(file));
      setImageFileName(file.name);
    } catch {
      setFieldErrors((prev) => ({ ...prev, creative: 'Could not read that file.' }));
    }
  };

  const handleVideoFile = async (file: File | undefined) => {
    setFieldErrors((prev) => ({ ...prev, creative: '' }));
    if (!file) return;
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      setFieldErrors((prev) => ({ ...prev, creative: 'Use an MP4, WebM or MOV video.' }));
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setFieldErrors((prev) => ({ ...prev, creative: 'Video must be 45 MB or smaller.' }));
      return;
    }
    try {
      setVideoDataUrl(await fileToDataUrl(file));
      setVideoFileName(file.name);
    } catch {
      setFieldErrors((prev) => ({ ...prev, creative: 'Could not read that file.' }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    const creative = adType === 'image' ? imageDataUrl : videoDataUrl;

    try {
      await api.post('/advertise', {
        companyName: companyName.trim(),
        contactNumber: contactNumber.trim(),
        email: email.trim(),
        adType,
        duration,
        targetUrl: targetUrl.trim() || undefined,
        creative: creative || undefined,
        message: message.trim() || undefined,
      });
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      if (axios.isAxiosError<{ message?: string; errors?: Record<string, string[]> }>(error)) {
        const data = error.response?.data;
        if (data?.errors) {
          setFieldErrors(
            Object.fromEntries(
              Object.entries(data.errors).map(([field, messages]) => [field, messages[0] ?? 'Invalid value']),
            ),
          );
        }
        setFormError(
          data?.message ??
            (error.response ? 'The request could not be submitted.' : 'The server could not be reached. Is the backend running?'),
        );
      } else {
        setFormError('An unexpected error occurred. Please try again.');
      }
      window.scrollTo({ top: 200, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldError = (name: string) =>
    fieldErrors[name] ? <p className="text-[11px] font-semibold text-red-600 mt-1">{fieldErrors[name]}</p> : null;

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
          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {formError}
            </div>
          )}

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
                    name="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-black focus:border-black transition-all outline-none"
                    placeholder="E.g., Asian Paints, Local Hardware"
                  />
                </div>
                {fieldError('companyName')}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700">Contact Number *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    required
                    type="tel"
                    name="contactNumber"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-black focus:border-black transition-all outline-none"
                    placeholder="10-digit mobile number"
                  />
                </div>
                {fieldError('contactNumber')}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    required
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-black focus:border-black transition-all outline-none"
                    placeholder="For business inquiries and billing"
                  />
                </div>
                {fieldError('email')}
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
                    <input
                      type="radio"
                      name="adType"
                      value="image"
                      checked={adType === 'image'}
                      onChange={() => setAdType('image')}
                      className="peer sr-only"
                    />
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-xl peer-checked:border-black peer-checked:bg-gray-50 transition-all">
                      <ImageIcon className="w-6 h-6 mb-2 text-gray-600" />
                      <span className="text-xs font-bold">Image Banner</span>
                    </div>
                  </label>
                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="adType"
                      value="video"
                      checked={adType === 'video'}
                      onChange={() => setAdType('video')}
                      className="peer sr-only"
                    />
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
                  name="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-black focus:border-black transition-all outline-none h-full"
                >
                  <option value="">Select duration...</option>
                  <option value="1_week">1 Week (₹5,000)</option>
                  <option value="1_month">1 Month (₹15,000)</option>
                  <option value="3_months">3 Months (₹40,000)</option>
                  <option value="6_months">6 Months (₹70,000)</option>
                </select>
                {fieldError('duration')}
              </div>
            </div>

            {adType === 'image' ? (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700">Upload Banner Image</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  {imageDataUrl ? (
                    <img src={imageDataUrl} alt="preview" className="mx-auto max-h-32 rounded-lg object-contain" />
                  ) : (
                    <Upload className="w-8 h-8 mx-auto text-gray-400 group-hover:text-black transition-colors mb-3" />
                  )}
                  <p className="text-sm font-bold text-gray-700 mt-3">
                    {imageFileName || 'Click to upload your ad creative'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPEG or WebP · up to 5MB · any orientation (portrait, square or landscape — it is shown uncropped)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_CREATIVE_TYPES.join(',')}
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                {fieldError('creative')}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700">Upload Ad Video</label>
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  {videoDataUrl ? (
                    <video
                      src={videoDataUrl}
                      muted
                      loop
                      playsInline
                      controls
                      className="mx-auto max-h-40 rounded-lg bg-black"
                    />
                  ) : (
                    <Film className="w-8 h-8 mx-auto text-gray-400 group-hover:text-black transition-colors mb-3" />
                  )}
                  <p className="text-sm font-bold text-gray-700 mt-3">
                    {videoFileName || 'Click to upload your video ad'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    MP4, WebM or MOV · up to 45MB · any orientation (plays muted on loop, shown uncropped)
                  </p>
                </div>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept={ALLOWED_VIDEO_TYPES.join(',')}
                  className="hidden"
                  onChange={(e) => handleVideoFile(e.target.files?.[0])}
                />
                {fieldError('creative')}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700">Target URL (Optional)</label>
              <input
                type="url"
                name="targetUrl"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-black focus:border-black transition-all outline-none"
                placeholder="Where should users go when they click your ad? (e.g. https://yourwebsite.com)"
              />
              {fieldError('targetUrl')}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700">Anything else? (Optional)</label>
              <textarea
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-black focus:border-black transition-all outline-none"
                placeholder="Campaign goals, preferred start date, target cities…"
              />
              {fieldError('message')}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-[#FFB800] py-4 rounded-xl font-black text-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-xl shadow-black/10 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
              <span>{isSubmitting ? 'Submitting…' : 'Submit Ad Request'}</span>
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
