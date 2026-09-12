import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Phone,
  Award,
  Upload,
  Image as ImageIcon,
  X,
  Check,
  CheckCircle2,
  Tag,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Printer,
  Crown,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import axios from 'axios';
import { api } from '../lib/api';
import type {
  MistriRegistrationFormData,
  PaidSlotStatusResponse,
  RegistrationApiError,
  RegistrationApiResponse,
  SupportedState,
  Technician
} from '../types';
import { REGISTRATION_PLANS, PAID_PLAN_PRICE_INR } from '../data/registrationPlans';
import { DEFAULT_AVATAR_URI, avatarOrDefault } from '../lib/avatar';
import { useLanguage } from '../context/LanguageContext';
import { useContent } from '../context/ContentContext';

const formatSlotDate = (iso: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const normalizeIndianPhone = (phone: string) =>
  phone.replace(/[\s()-]/g, '').replace(/^(?:\+91|91)/, '');

const getImageValidationError = (file: File): string | null => {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return 'Only JPEG, PNG, and WebP images are allowed.';
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'Each image must be smaller than 4 MB.';
  }

  return null;
};

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('The selected image could not be read.'));
    reader.readAsDataURL(file);
  });

interface RegisterPageProps {
  onBackToHome: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onBackToHome
}) => {
  const { t } = useLanguage();
  const { states: SUPPORTED_STATES, categories: SERVICE_CATEGORIES, getCitiesForState } = useContent();
  const [formData, setFormData] = useState<MistriRegistrationFormData>({
    state: 'Assam',
    city: 'Guwahati',
    category: 'Electrician',
    fullName: '',
    primaryPhone: '',
    alternatePhone: '',
    qualification: 'ITI Certified (Govt / NCVT Recognized)',
    address: '',
    pincode: '',
    experienceYears: 5,
    servicesOffered: [
      'Short Circuit & MCB Repair',
      'Ceiling Fan & Chandelier Fitting',
      'Inverter & Battery Wiring'
    ],
    customServiceInput: '',
    shortIntro: '',
    profilePhoto: null,
    galleryImages: [],
    referralCode: '',
    subscriptionPlan: 'FREE',
    acceptedTerms: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [referralStatus, setReferralStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [registeredMistri, setRegisteredMistri] = useState<Technician | null>(null);
  const [paidSlot, setPaidSlot] = useState<PaidSlotStatusResponse | null>(null);
  const [isCheckingPaidSlot, setIsCheckingPaidSlot] = useState(false);

  const availableCities = formData.state ? getCitiesForState(formData.state) : [];

  // Advisory check: is the paid top slot for this state + city + category open?
  // Only fetched while the Paid plan is selected. The real decision is made when
  // an admin approves the registration.
  useEffect(() => {
    if (formData.subscriptionPlan !== 'PAID' || !formData.state || !formData.city || !formData.category) {
      setPaidSlot(null);
      return;
    }

    const controller = new AbortController();
    setIsCheckingPaidSlot(true);
    api
      .get<PaidSlotStatusResponse>('/mistris/paid-slot', {
        params: { state: formData.state, city: formData.city, category: formData.category },
        signal: controller.signal
      })
      .then((response) => setPaidSlot(response.data))
      .catch((error) => {
        if (!axios.isCancel(error)) setPaidSlot(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsCheckingPaidSlot(false);
      });

    return () => controller.abort();
  }, [formData.subscriptionPlan, formData.state, formData.city, formData.category]);

  const qualificationsList = [
    'ITI Certified (Govt / NCVT Recognized)',
    'Vocational Diploma in Engineering / Craft',
    'Master Craftsman / Ustad Apprenticeship (10+ Yrs)',
    'Senior Secondary / 12th Pass with Trade Skills',
    'Matriculate / 10th Pass with Practical Experience',
    'Graduate / Polytechnic Certified',
    'Company Authorized Certified Technician (LG/Asian Paints/Daikin/Jaquar)'
  ];

  const handleCategoryChange = (newCat: string) => {
    const foundCat = SERVICE_CATEGORIES.find(c => c.name === newCat);
    const suggested = foundCat ? foundCat.popularServices.slice(0, 3) : [];
    setFormData(prev => ({
      ...prev,
      category: newCat,
      servicesOffered: suggested
    }));
  };

  const toggleServiceOffer = (service: string) => {
    setFormData(prev => {
      const exists = prev.servicesOffered.includes(service);
      return {
        ...prev,
        servicesOffered: exists 
          ? prev.servicesOffered.filter(s => s !== service)
          : [...prev.servicesOffered, service]
      };
    });
  };

  const handleAddCustomService = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const tag = formData.customServiceInput.trim();
    if (tag && !formData.servicesOffered.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        servicesOffered: [...prev.servicesOffered, tag],
        customServiceInput: ''
      }));
    }
  };

  const clearFieldError = (field: string) => {
    setErrors((previousErrors) => {
      if (!previousErrors[field]) return previousErrors;
      const nextErrors = { ...previousErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = getImageValidationError(file);
    if (validationError) {
      setErrors((previousErrors) => ({ ...previousErrors, profilePhoto: validationError }));
      e.target.value = '';
      return;
    }

    try {
      const imageData = await readFileAsDataUrl(file);
      setFormData((previousData) => ({ ...previousData, profilePhoto: imageData }));
      clearFieldError('profilePhoto');
    } catch (error) {
      setErrors((previousErrors) => ({
        ...previousErrors,
        profilePhoto: error instanceof Error ? error.message : 'The image could not be read.'
      }));
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    const remainingSlots = 3 - formData.galleryImages.length;
    const filesToProcess = selectedFiles.slice(0, remainingSlots);

    if (filesToProcess.length === 0) return;

    const invalidFileMessage = filesToProcess
      .map(getImageValidationError)
      .find((message): message is string => Boolean(message));

    if (invalidFileMessage) {
      setErrors((previousErrors) => ({ ...previousErrors, galleryImages: invalidFileMessage }));
      e.target.value = '';
      return;
    }

    try {
      const imageData = await Promise.all(filesToProcess.map(readFileAsDataUrl));
      setFormData((previousData) => ({
        ...previousData,
        galleryImages: [...previousData.galleryImages, ...imageData].slice(0, 3)
      }));
      clearFieldError('galleryImages');
    } catch (error) {
      setErrors((previousErrors) => ({
        ...previousErrors,
        galleryImages: error instanceof Error ? error.message : 'The images could not be read.'
      }));
    } finally {
      e.target.value = '';
    }
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleApplyReferral = () => {
    if (!formData.referralCode.trim()) return;
    setReferralStatus('Referral code added. It will be checked with your registration.');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.primaryPhone.trim()) {
      newErrors.primaryPhone = 'Primary phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(normalizeIndianPhone(formData.primaryPhone))) {
      newErrors.primaryPhone = 'Enter a valid 10-digit Indian mobile number';
    }

    if (formData.alternatePhone.trim()) {
      if (!/^[6-9]\d{9}$/.test(normalizeIndianPhone(formData.alternatePhone))) {
        newErrors.alternatePhone = 'Alternate phone must be a valid 10-digit number';
      }
    }

    if (!formData.state) newErrors.state = 'Please select a state';
    if (!formData.city || formData.city === 'All') newErrors.city = 'Please select a city';
    if (!formData.category) newErrors.category = 'Please select a primary category';
    if (!formData.address.trim()) newErrors.address = 'Workshop or home address is required';
    if (formData.pincode.trim() && !/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Enter a valid 6-digit PIN code';
    }
    if (formData.servicesOffered.length === 0) newErrors.servicesOffered = 'Select or add at least one service offered';
    if (!formData.acceptedTerms) newErrors.acceptedTerms = 'You must accept the terms and safety policies';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    if (!validateForm()) {
      window.scrollTo({ top: 200, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post<RegistrationApiResponse>(
        '/mistris/register',
        formData
      );

      const savedMistri = response.data.data;
      const galleryUrls = savedMistri.galleryImages?.map((image) => image.url) ?? [];

      const newMistri: Technician = {
        id: `MST-${String(savedMistri.id).padStart(6, '0')}`,
        name: formData.fullName,
        primaryPhone: `+91 ${normalizeIndianPhone(formData.primaryPhone)}`,
        alternatePhone: formData.alternatePhone
          ? `+91 ${normalizeIndianPhone(formData.alternatePhone)}`
          : undefined,
        state: formData.state as SupportedState,
        city: formData.city,
        category: formData.category,
        qualification: formData.qualification,
        address: formData.address + (formData.pincode ? `, Pin - ${formData.pincode}` : ''),
        experienceYears: formData.experienceYears,
        servicesOffered: formData.servicesOffered,
        intro: formData.shortIntro || `Certified ${formData.category} offering professional services in ${formData.city}, ${formData.state}. ${formData.experienceYears}+ years experience.`,
        photoUrl: avatarOrDefault(savedMistri.profilePhotoUrl),
        galleryImages: galleryUrls,
        rating: 0,
        reviewsCount: 0,
        isVerified: false,
        badgeLevel: 'Standard Verified',
        isEmergencyAvailable: false,
        startingPrice: 299,
        completedJobs: 0,
        policeVerified: false,
        skillTestCertified: false,
        memberSince: savedMistri.createdAt,
        plan: formData.subscriptionPlan,
        isFeatured: false,
        featuredUntil: null
      };

      setRegisteredMistri(newMistri);

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // Registration remains successful even if the optional animation fails.
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: unknown) {
      if (axios.isAxiosError<RegistrationApiError>(error)) {
        const backendResponse = error.response?.data;

        if (backendResponse?.errors) {
          const backendErrors = Object.fromEntries(
            Object.entries(backendResponse.errors).map(([field, messages]) => [
              field,
              messages[0] ?? 'Invalid value'
            ])
          );
          setErrors(backendErrors);
        }

        // A 409 on the paid slot (should not happen at register time today, but
        // keep it wired) surfaces on the plan selector.
        if (error.response?.status === 409 && backendResponse?.message) {
          setErrors((previousErrors) => ({
            ...previousErrors,
            subscriptionPlan: backendResponse.message
          }));
        }

        setSubmissionError(
          backendResponse?.message ??
            (error.response
              ? 'The registration could not be completed.'
              : 'The server could not be reached. Check that the backend is running.')
        );
      } else {
        setSubmissionError('An unexpected error occurred. Please try again.');
      }

      window.scrollTo({ top: 200, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Screen with Digital Identity Card
  if (registeredMistri) {
    return (
      <div className="py-12 md:py-20 bg-[#FAFAFA] min-h-screen text-[#111827]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          
          <div className="p-8 sm:p-12 rounded-3xl bg-white border-2 border-black shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#FFB800] border-2 border-black flex items-center justify-center mx-auto text-black shadow-md">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-xs font-black px-3.5 py-1 rounded-full bg-black text-[#FFB800] uppercase tracking-wider">
                Registration Received • Verification Pending
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-[#111827] mt-3 tracking-tight">
                Welcome to MistriKhoj, {registeredMistri.name}!
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-lg mx-auto font-medium">
                Your application has been saved successfully. Your details will be reviewed before your profile becomes visible to homeowners in {registeredMistri.city}, {registeredMistri.state}.
              </p>
              {registeredMistri.plan === 'PAID' && (
                <p className="text-xs sm:text-sm text-amber-800 mt-3 max-w-lg mx-auto font-bold bg-[#FFF9EC] border border-[#FFB800]/50 rounded-xl px-4 py-2.5">
                  {t(
                    'reg_success_paid',
                    `Your ₹${PAID_PLAN_PRICE_INR} / year Paid top listing is reserved. It goes live at the top of search for ${registeredMistri.city} · ${registeredMistri.category} once an admin approves your profile. Our team will contact you for payment.`
                  )}
                </p>
              )}
            </div>

            {/* Generated Official Mistri Digital ID Card */}
            <div className="max-w-md mx-auto p-6 rounded-2xl bg-[#0D0F12] text-white border-2 border-black text-left relative shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFB800]/10 rounded-full blur-2xl pointer-events-none"></div>

              {/* ID Card Top Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FFB800] text-black flex items-center justify-center font-black text-xs">
                    MK
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">MISTRIKHOJ REGISTRATION</div>
                    <div className="text-[10px] text-gray-400 font-semibold">Application received</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#FFB800] font-black uppercase tracking-wider">Application ID</div>
                  <div className="text-xs font-mono font-black text-white">{registeredMistri.id}</div>
                </div>
              </div>

              {/* Card Body */}
              <div className="mt-4 flex items-center gap-4">
                <img
                  src={registeredMistri.photoUrl}
                  alt={registeredMistri.name}
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_AVATAR_URI;
                  }}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-[#FFB800] bg-[#EAE3D6]"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-base font-black text-white truncate">
                    {registeredMistri.name}
                  </div>
                  <div className="text-xs font-bold text-[#FFB800]">
                    {registeredMistri.category}
                  </div>
                  <div className="text-[11px] text-gray-300 flex items-center gap-1 mt-1 font-medium">
                    <MapPin className="w-3 h-3 text-[#FFB800]" />
                    <span>{registeredMistri.city}, {registeredMistri.state}</span>
                  </div>
                  <div className="text-[11px] text-amber-300 font-bold flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verification pending</span>
                  </div>
                </div>
              </div>

              {/* Card Specs */}
              <div className="mt-4 pt-3 border-t border-gray-800 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 block">Direct Phone:</span>
                  <span className="font-bold text-white">{registeredMistri.primaryPhone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Experience:</span>
                  <span className="font-bold text-white">{registeredMistri.experienceYears} Years</span>
                </div>
              </div>

              <div className="mt-3 text-[10px] text-center text-gray-400 border-t border-gray-800 pt-2 font-medium">
                mistrikhoj.in/mst/{registeredMistri.id} • 0% Commission Guarantee
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border-2 border-black hover:bg-gray-100 text-xs font-black text-black flex items-center justify-center gap-2 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>{t('reg_print_id', 'Print ID Card')}</span>
              </button>

              <button
                onClick={onBackToHome}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-black text-[#FFB800] text-xs font-black hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>{t('reg_back_home', 'Back to Homepage')}</span>
                <Check className="w-4 h-4 text-[#FFB800] stroke-[3]" />
              </button>
            </div>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="py-10 md:py-16 bg-[#FAFAFA] min-h-screen text-[#111827]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back navigation */}
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-black mb-6 transition-colors bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('reg_back_home', 'Back to Homepage & Directory')}</span>
        </button>

        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-xs font-black tracking-[0.2em] text-gray-500 uppercase">
              {t('reg_page_badge', 'JOIN 15,000+ USTADS')}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFB800]"></span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black text-[#111827] tracking-tight">
            {t('reg_page_title', 'Register as a Verified Mistri')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-2 font-medium">
            {t('reg_page_subtitle', 'Free & Paid Plans • 0% Platform Commission • Direct WhatsApp & Phone Calls From Local Homeowners.')}
          </p>
        </div>

        {/* Registration Form Card */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white border-2 border-gray-200 shadow-sm">
          
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Step 1: Location & Category */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-black text-black uppercase tracking-wider pb-2 border-b border-gray-200">
                <MapPin className="w-4 h-4 text-black" />
                <span>{t('reg_step1', '1. State, City & Craft Category')}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* State Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {t('reg_state_label', 'State ({count} States Supported) *', { count: SUPPORTED_STATES.length })}
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => {
                      const st = e.target.value as SupportedState;
                      const cities = getCitiesForState(st);
                      setFormData(prev => ({
                        ...prev,
                        state: st,
                        city: cities[0] || ''
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:border-black focus:outline-none"
                    id="register-state-select"
                  >
                    {SUPPORTED_STATES.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dependent City Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    City / Town *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:border-black focus:outline-none"
                    id="register-city-select"
                  >
                    {availableCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Trade / Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:border-black focus:outline-none"
                    id="register-category-select"
                  >
                    {SERVICE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Personal & Contact Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-black text-black uppercase tracking-wider pb-2 border-b border-gray-200">
                <Phone className="w-4 h-4 text-black" />
                <span>{t('reg_step2', '2. Personal & Contact Information')}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Full Name (as per Aadhaar) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rameshwar Sharma"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs font-bold text-gray-900 focus:outline-none ${
                      errors.fullName ? 'border-red-500' : 'border-gray-200 focus:border-black'
                    }`}
                    id="register-fullname-input"
                  />
                  {errors.fullName && <p className="text-[11px] text-red-500 font-bold mt-1">{errors.fullName}</p>}
                </div>

                {/* Primary Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Primary Phone (Direct Calls & WhatsApp) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-black">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="98765 43210"
                      value={formData.primaryPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, primaryPhone: e.target.value }))}
                      className={`w-full pl-12 pr-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs font-bold text-gray-900 focus:outline-none ${
                        errors.primaryPhone ? 'border-red-500' : 'border-gray-200 focus:border-black'
                      }`}
                      id="register-primary-phone"
                    />
                  </div>
                  {errors.primaryPhone && <p className="text-[11px] text-red-500 font-bold mt-1">{errors.primaryPhone}</p>}
                </div>

                {/* Alternate Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Alternate Phone (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-black">
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="98765 00000"
                      value={formData.alternatePhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, alternatePhone: e.target.value }))}
                      className="w-full pl-12 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:border-black focus:outline-none"
                      id="register-alt-phone"
                    />
                  </div>
                  {errors.alternatePhone && <p className="text-[11px] text-red-500 font-bold mt-1">{errors.alternatePhone}</p>}
                </div>
              </div>
            </div>

            {/* Step 3: Qualifications, Address & Experience */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-black text-black uppercase tracking-wider pb-2 border-b border-gray-200">
                <Award className="w-4 h-4 text-black" />
                <span>{t('reg_step3', '3. Qualification, Experience & Workshop Address')}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Qualification */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Trade Qualification / Certificate *
                  </label>
                  <select
                    value={formData.qualification}
                    onChange={(e) => setFormData(prev => ({ ...prev, qualification: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:border-black focus:outline-none"
                    id="register-qualification-select"
                  >
                    {qualificationsList.map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Experience in Years */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-gray-700">
                      Experience in Years *
                    </label>
                    <span className="text-xs font-black text-black px-2.5 py-0.5 rounded-full bg-[#FFB800]">
                      {formData.experienceYears} Years
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={35}
                    value={formData.experienceYears}
                    onChange={(e) => setFormData(prev => ({ ...prev, experienceYears: Number(e.target.value) }))}
                    className="w-full accent-black cursor-pointer"
                    id="register-experience-slider"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 font-bold mt-1">
                    <span>1 Year</span>
                    <span>10 Years (Senior Ustad)</span>
                    <span>35+ Years (Master)</span>
                  </div>
                </div>
              </div>

              {/* Address & Pin Code */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Workshop or Permanent Residence Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Shop/House number, Street, Area landmark..."
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs font-medium text-gray-900 focus:outline-none ${
                      errors.address ? 'border-red-500' : 'border-gray-200 focus:border-black'
                    }`}
                    id="register-address-input"
                  />
                  {errors.address && <p className="text-[11px] text-red-500 font-bold mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Postal PIN Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 781024"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                    className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs font-bold text-gray-900 focus:outline-none ${
                      errors.pincode ? 'border-red-500' : 'border-gray-200 focus:border-black'
                    }`}
                    id="register-pincode-input"
                  />
                  {errors.pincode && <p className="text-[11px] text-red-500 font-bold mt-1">{errors.pincode}</p>}
                </div>
              </div>
            </div>

            {/* Step 4: Services Offered & Bio */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-black text-black uppercase tracking-wider pb-2 border-b border-gray-200">
                <Tag className="w-4 h-4 text-black" />
                <span>{t('reg_step4', '4. Services Offered & Short Bio')}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Select Services You Provide (or add custom specialties) *
                </label>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {SERVICE_CATEGORIES.find(c => c.name === formData.category)?.popularServices.map((srv) => {
                    const isSelected = formData.servicesOffered.includes(srv);
                    return (
                      <button
                        key={srv}
                        type="button"
                        onClick={() => toggleServiceOffer(srv)}
                        className={`text-xs px-3 py-1.5 rounded-xl border-2 flex items-center gap-1.5 transition-all font-bold ${
                          isSelected
                            ? 'bg-black text-[#FFB800] border-black'
                            : 'bg-gray-50 text-gray-800 border-gray-200 hover:border-black'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#FFB800] stroke-[3]" />}
                        <span>{srv}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom tag adder */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add additional custom service tag (e.g. 'Copper Gas Piping', 'Texture Wall Design')..."
                    value={formData.customServiceInput}
                    onChange={(e) => setFormData(prev => ({ ...prev, customServiceInput: e.target.value }))}
                    onKeyDown={handleAddCustomService}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-medium focus:border-black focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomService}
                    className="px-4 py-2 bg-black hover:bg-gray-800 text-[#FFB800] text-xs font-bold rounded-xl transition-colors shrink-0"
                  >
                    Add Tag
                  </button>
                </div>
                {errors.servicesOffered && <p className="text-[11px] text-red-500 font-bold mt-1">{errors.servicesOffered}</p>}
              </div>

              {/* Short Intro / Bio */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Short Introduction / Bio for Customers
                </label>
                <textarea
                  rows={3}
                  placeholder="Introduce your craftsmanship, diagnostic equipment, response time, and customer guarantee..."
                  value={formData.shortIntro}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortIntro: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-medium focus:border-black focus:outline-none resize-none"
                  id="register-intro-textarea"
                />
              </div>
            </div>

            {/* Step 5: Profile Photograph & Gallery Images */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-black text-black uppercase tracking-wider pb-2 border-b border-gray-200">
                <ImageIcon className="w-4 h-4 text-black" />
                <span>{t('reg_step5', '5. Profile Photograph & Gallery Work Images')}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Profile Photo Uploader */}
                <div className="md:col-span-4 p-5 rounded-2xl bg-[#FAFAFA] border-2 border-gray-200 text-center space-y-3">
                  <div className="text-xs font-black text-black">
                    Profile Photograph <span className="text-gray-400 font-bold">(Optional)</span>
                  </div>

                  <div className="relative w-28 h-28 mx-auto rounded-2xl overflow-hidden border-2 border-gray-300 bg-white group shadow-sm">
                    <img
                      src={formData.profilePhoto || DEFAULT_AVATAR_URI}
                      alt={formData.profilePhoto ? 'Profile preview' : 'Default profile avatar'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <label className="inline-block px-4 py-2 rounded-xl bg-black hover:bg-gray-800 text-[#FFB800] text-xs font-bold cursor-pointer transition-colors shadow-sm">
                    <span>{formData.profilePhoto ? 'Change Photo' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleProfilePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {formData.profilePhoto && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((previousData) => ({ ...previousData, profilePhoto: null }));
                        clearFieldError('profilePhoto');
                      }}
                      className="block mx-auto text-[10px] font-bold text-gray-500 hover:text-black underline"
                    >
                      Remove photo
                    </button>
                  )}
                  <p className="text-[10px] text-gray-500 font-medium">
                    Optional — a real photo builds customer trust. A default avatar is used if you skip it.
                  </p>
                  {errors.profilePhoto && <p className="text-[11px] text-red-500 font-bold">{errors.profilePhoto}</p>}
                </div>

                {/* 3 Optional Gallery Images */}
                <div className="md:col-span-8 p-5 rounded-2xl bg-[#FAFAFA] border-2 border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-black text-black">
                      Previous Work Photos (Up to 3 Images)
                    </div>
                    <span className="text-[10px] text-gray-600 font-bold px-2 py-0.5 rounded-full bg-gray-200">
                      {formData.galleryImages.length} / 3 Uploaded
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {formData.galleryImages.map((img, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden border-2 border-gray-200 aspect-video group shadow-sm">
                        <img
                          src={img}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                          title="Remove photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {formData.galleryImages.length < 3 && (
                      <label className="rounded-xl border-2 border-dashed border-gray-300 hover:border-black aspect-video flex flex-col items-center justify-center cursor-pointer transition-colors bg-white text-gray-500 hover:text-black">
                        <Upload className="w-5 h-5 mb-1 text-black" />
                        <span className="text-[10px] font-bold">Add Work Photo</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          onChange={handleGalleryUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium">Showcase past installations, electrical switchboards, or plumbing work.</p>
                  {errors.galleryImages && <p className="text-[11px] text-red-500 font-bold">{errors.galleryImages}</p>}
                </div>

              </div>
            </div>

            {/* Step 6: Referral / Partner Code (Optional) & Free Lifetime Benefits */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-black text-black uppercase tracking-wider pb-2 border-b border-gray-200">
                <Sparkles className="w-4 h-4 text-black" />
                <span>{t('reg_step6', '6. Verification & Partner Code')}</span>
              </div>

              {/* 100% Free Verification Banner */}
              <div className="p-5 rounded-2xl bg-[#0D0F12] text-white border-2 border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFB800] text-black flex items-center justify-center font-bold shrink-0">
                    <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white flex items-center gap-2">
                      <span>Verified Registration & Direct Customer Access</span>
                      <span className="text-[10px] bg-[#FFB800] text-black font-black px-2 py-0.5 rounded uppercase">0% Commission</span>
                    </div>
                    <div className="text-xs text-gray-300 font-medium mt-0.5">
                      No lead deductions and zero hidden platform charges. Every rupee you earn from a job stays with you.
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional Referral Code Box */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Have a Partner or Referral Code? (Optional)
                </label>
                <div className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    placeholder="e.g. MISTRI50, USTAD100, BHARAT"
                    value={formData.referralCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, referralCode: e.target.value.toUpperCase() }))}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-black uppercase tracking-wider focus:border-black focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyReferral}
                    className="px-5 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-[#FFB800] text-xs font-black transition-all shrink-0 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {referralStatus && (
                  <p className="text-xs text-emerald-700 font-bold mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{referralStatus}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Listing Plan: Free vs Paid */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-black text-black uppercase tracking-wider pb-2 border-b border-gray-200">
                <Crown className="w-4 h-4 text-black" />
                <span>{t('reg_step_plan', '7. Choose Your Listing Plan')}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {REGISTRATION_PLANS.map((plan) => {
                  const isSelected = formData.subscriptionPlan === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, subscriptionPlan: plan.id }));
                        clearFieldError('subscriptionPlan');
                      }}
                      className={`text-left p-5 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? 'border-black bg-[#FFF9EC] shadow-md'
                          : 'border-gray-200 bg-white hover:border-black'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-black text-black flex items-center gap-1.5">
                            {plan.id === 'PAID' && <Crown className="w-4 h-4 text-[#FFB800]" />}
                            <span>{plan.name}</span>
                          </div>
                          <div className="text-[11px] font-bold text-gray-500 mt-0.5">{plan.tagline}</div>
                        </div>
                        <span
                          className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 ${
                            isSelected ? 'border-black bg-black' : 'border-gray-300 bg-white'
                          }`}
                        />
                      </div>

                      <div className="mt-3 flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-black">{plan.price}</span>
                        <span className="text-[11px] font-bold text-gray-500">{plan.priceNote}</span>
                      </div>

                      <ul className="mt-3 space-y-1.5">
                        {plan.features.map((feature) => (
                          <li key={feature} className="text-[11px] text-gray-700 font-medium flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#FFB800] stroke-[3] shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>

              {formData.subscriptionPlan === 'PAID' && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[11px] font-bold">
                  {isCheckingPaidSlot ? (
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {t('reg_plan_checking', 'Checking availability for your area…')}
                    </span>
                  ) : paidSlot && !paidSlot.available && paidSlot.heldUntil ? (
                    <span className="text-amber-700">
                      {t(
                        'reg_plan_taken',
                        `The paid top spot for ${formData.city} · ${formData.category} is currently held until ${formatSlotDate(
                          paidSlot.heldUntil
                        )}. You can still register on the Paid plan — an admin will confirm the spot when your profile is approved.`
                      )}
                    </span>
                  ) : paidSlot && paidSlot.available ? (
                    <span className="text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t(
                        'reg_plan_open',
                        `The paid top spot for ${formData.city} · ${formData.category} is open. It is confirmed once an admin approves your profile.`
                      )}
                    </span>
                  ) : (
                    <span className="text-gray-500">
                      {t(
                        'reg_plan_paid_hint',
                        `₹${PAID_PLAN_PRICE_INR} per year, fixed. Our team collects payment offline after you register. Your top spot goes live once an admin approves your profile.`
                      )}
                    </span>
                  )}
                </div>
              )}
              {errors.subscriptionPlan && (
                <p className="text-[11px] text-red-500 font-bold">{errors.subscriptionPlan}</p>
              )}
            </div>

            {/* Terms & Policies Checkbox */}
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={formData.acceptedTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, acceptedTerms: e.target.checked }))}
                  className="mt-0.5 rounded border-gray-300 text-black focus:ring-0 w-4 h-4"
                  id="register-terms-checkbox"
                />
                <span className="text-xs text-gray-800 leading-relaxed font-medium">
                  I agree to the <strong className="text-black font-black">MistriKhoj Code of Conduct, Aadhaar Background Verification Policy, and 0% Commission Guarantee</strong>. I declare that all trade certificates, workshop address, and mobile numbers provided are genuine.
                </span>
              </label>
              {errors.acceptedTerms && <p className="text-[11px] text-red-500 font-bold">{errors.acceptedTerms}</p>}
            </div>

            {/* Submit Register Button */}
            <div>
              {submissionError && (
                <div
                  role="alert"
                  className="mb-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-xs font-bold text-red-700"
                >
                  {submissionError}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-8 rounded-2xl bg-[#FFB800] hover:bg-[#F59E0B] text-black text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-md cursor-pointer border-2 border-black"
                id="register-submit-btn"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin"></span>
                    <span>Uploading & Saving Registration...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-black stroke-[2.5]" />
                    <span>{t('reg_btn_submit', 'Submit Registration')}</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};
