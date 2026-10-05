import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  X,
  MapPin,
  Phone,
  MessageSquare,
  Star,
  ShieldCheck,
  Award,
  CheckCircle2,
  Share2,
  Check,
  FileBadge,
  Image as ImageIcon
} from 'lucide-react';
import { Technician } from '../types';
import { DEFAULT_AVATAR_URI, avatarOrDefault } from '../lib/avatar';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../lib/api';

/** "MST-000123" -> 123, the raw Mistri id the backend rating endpoint expects. */
const toMistriNumericId = (formattedId: string): number => Number(formattedId.replace(/^MST-/, ''));

const ratedStorageKey = (mistriId: number) => `mistrikhoj_rated_mistri_${mistriId}`;

/** Anonymous 1-5 star rating widget. No comments/reviews — just a star count,
    submitted once per browser per Mistri (a soft, local-only guard; the real
    anti-abuse limit is server-side, keyed by IP + Mistri). */
const RateMistriBox: React.FC<{
  mistriId: number;
  onRated: (avgRating: number, ratingsCount: number) => void;
}> = ({ mistriId, onRated }) => {
  const { t } = useLanguage();
  const [hovered, setHovered] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyRated, setAlreadyRated] = useState(false);

  useEffect(() => {
    setAlreadyRated(Boolean(localStorage.getItem(ratedStorageKey(mistriId))));
    setError(null);
    setHovered(0);
  }, [mistriId]);

  const submitRating = async (stars: number) => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await api.post<{ success: boolean; data: { avgRating: number; ratingsCount: number } }>(
        `/mistris/${mistriId}/rating`,
        { rating: stars }
      );
      localStorage.setItem(ratedStorageKey(mistriId), String(stars));
      setAlreadyRated(true);
      onRated(response.data.data.avgRating, response.data.data.ratingsCount);
    } catch (err: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message || 'Could not submit your rating. Please try again.'
        : 'Could not submit your rating. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (alreadyRated) {
    return (
      <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] text-center">
        <div className="flex items-center justify-center gap-1 text-[#4C5943] text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>{t('modal_rating_thanks', 'Thanks — your rating was recorded!')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] text-center space-y-2">
      <div className="text-xs font-bold text-[#161616] uppercase tracking-wider">
        {t('modal_rate_title', 'Rate this Mistri')}
      </div>
      <div className="flex items-center justify-center gap-1" onMouseLeave={() => setHovered(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={submitting}
            onMouseEnter={() => setHovered(star)}
            onClick={() => submitRating(star)}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            className="p-0.5 disabled:opacity-50 cursor-pointer"
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                star <= hovered ? 'fill-[#FFB800] text-[#FFB800]' : 'fill-transparent text-[#161616]/30'
              }`}
            />
          </button>
        ))}
      </div>
      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
    </div>
  );
};

interface TechnicianModalProps {
  technician: Technician | null;
  onClose: () => void;
  onDirectContact: (tech: Technician, method: 'phone' | 'whatsapp') => void;
}

export const TechnicianModal: React.FC<TechnicianModalProps> = ({
  technician,
  onClose,
  onDirectContact
}) => {
  const { t } = useLanguage();
  const [copiedLink, setCopiedLink] = useState(false);
  const [liveRating, setLiveRating] = useState({ rating: 0, reviewsCount: 0 });

  useEffect(() => {
    if (technician) {
      setLiveRating({ rating: technician.rating, reviewsCount: technician.reviewsCount });
    }
  }, [technician]);

  if (!technician) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      
      <div className="relative w-full max-w-4xl bg-white border border-[#EAE3D6] rounded-3xl shadow-xl overflow-hidden my-8 text-[#161616]">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#EAE3D6] bg-[#FAF7F2]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white text-[#161616] border border-[#EAE3D6] flex items-center gap-1">
              {technician.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-[#4C5943]" />}
              <span>{technician.isVerified ? t('modal_verified_id', 'Verified ID') : 'Registration ID'}: {technician.id}</span>
            </span>
            <span className="text-xs text-[#161616]/60 hidden sm:inline">
              {t('modal_member_since', 'Member since')} {new Date(technician.memberSince).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#EAE3D6] text-xs font-medium text-[#161616] flex items-center gap-1.5"
              title="Share profile link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#4C5943]" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? t('modal_copied', 'Copied') : t('modal_share', 'Share')}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-black/5 text-[#161616]/60 hover:text-[#161616] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[80vh] overflow-y-auto">
          
          {/* Left Column: Profile, Credentials & Gallery */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header info card */}
            <div className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6]">
              <div className="relative shrink-0">
                <img
                  src={avatarOrDefault(technician.photoUrl)}
                  alt={technician.name}
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_AVATAR_URI;
                  }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-[#EAE3D6] bg-[#EAE3D6]"
                />
                <div className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full bg-[#161616] text-[9px] font-bold text-[#FAF7F2] flex items-center gap-0.5 shadow-sm">
                  {technician.isVerified && <ShieldCheck className="w-3 h-3" />}
                  <span>{technician.isVerified ? t('modal_verified_badge', 'VERIFIED') : 'REGISTERED'}</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white text-[#161616] border border-[#EAE3D6]">
                    {technician.badgeLevel}
                  </span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-normal text-[#161616] mt-1.5">
                  {technician.name}
                </h3>
                <p className="text-xs font-semibold text-[#161616]/70">{technician.category}</p>

                <div className="flex items-center gap-1 text-xs text-[#161616]/65 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#161616]/60 shrink-0" />
                  <span>{technician.city}, {technician.state}</span>
                </div>

                <div className="flex items-center gap-3 text-xs mt-3">
                  <div className="flex items-center gap-1 text-[#161616] font-semibold">
                    <Star className="w-4 h-4 fill-[#161616] text-[#161616]" />
                    <span>{liveRating.reviewsCount > 0 ? liveRating.rating : 'New'}</span>
                    <span className="text-[#161616]/50">({liveRating.reviewsCount} {t('dir_reviews', 'reviews')})</span>
                  </div>
                  <span className="text-[#EAE3D6]">|</span>
                  <span className="text-[#161616]/75 font-semibold">{technician.completedJobs > 0 ? `${technician.completedJobs}+` : 'New'} {t('modal_jobs', 'Jobs')}</span>
                  <span className="text-[#EAE3D6]">|</span>
                  <span className="text-[#161616]/75 font-semibold">{technician.experienceYears} {t('modal_yrs_exp', 'Yrs Exp')}</span>
                </div>
              </div>
            </div>

            {/* Official Verification Audit Matrix */}
            {technician.isVerified ? (
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#161616] uppercase tracking-wider">
                <FileBadge className="w-4 h-4 text-[#161616]/60" />
                <span>{t('modal_checklist_title', 'Verification Checklist')}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-[#EAE3D6] flex items-center gap-2 text-[#161616]">
                  <CheckCircle2 className="w-4 h-4 text-[#4C5943] shrink-0" />
                  <div>
                    <div className="font-semibold">{t('modal_govt_id', 'Government ID Checked')}</div>
                    <div className="text-[10px] text-[#161616]/60">{t('modal_govt_id_desc', 'Aadhaar & PAN authenticated')}</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-[#EAE3D6] flex items-center gap-2 text-[#161616]">
                  <CheckCircle2 className="w-4 h-4 text-[#4C5943] shrink-0" />
                  <div>
                    <div className="font-semibold">{t('modal_police_check', 'Police Background Clear')}</div>
                    <div className="text-[10px] text-[#161616]/60">{t('modal_police_check_desc', 'No adverse record logged')}</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-[#EAE3D6] flex items-center gap-2 text-[#161616]">
                  <CheckCircle2 className="w-4 h-4 text-[#4C5943] shrink-0" />
                  <div>
                    <div className="font-semibold">{t('modal_skills_assessed', 'Skill & Tools Assessed')}</div>
                    <div className="text-[10px] text-[#161616]/60">{t('modal_skills_assessed_desc', 'Field tested on safety standards')}</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-[#EAE3D6] flex items-center gap-2 text-[#161616]">
                  <CheckCircle2 className="w-4 h-4 text-[#4C5943] shrink-0" />
                  <div>
                    <div className="font-semibold">{t('modal_zero_comm', 'Zero Commission')}</div>
                    <div className="text-[10px] text-[#161616]/60">{t('modal_zero_comm_desc', 'Direct payment to the mistri')}</div>
                  </div>
                </div>
              </div>
            </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                This profile is registered on MistriKhoj. Verification details have not been added yet.
              </div>
            )}

            {/* Qualification & Address */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6]">
                <div className="font-semibold text-[#161616] mb-1 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#161616]/60" />
                  <span>{t('modal_qualification_title', 'Qualification & Certifications')}</span>
                </div>
                <p className="text-[#161616]/80 font-medium">{technician.qualification}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6]">
                <div className="font-semibold text-[#161616] mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#161616]/60" />
                  <span>{t('modal_address_title', 'Workshop / Base Address')}</span>
                </div>
                <p className="text-[#161616]/75">{technician.address}</p>
              </div>
            </div>

            {/* Services Offered Pills */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6]">
              <div className="text-xs font-bold text-[#161616] uppercase tracking-wider mb-2.5">
                {t('modal_services_title', 'Specialized Services Offered')}
              </div>
              <div className="flex flex-wrap gap-2">
                {technician.servicesOffered.map((srv, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1 rounded-full bg-white text-[#161616] border border-[#EAE3D6] flex items-center gap-1.5"
                  >
                    <Check className="w-3 h-3 text-[#4C5943]" />
                    {srv}
                  </span>
                ))}
              </div>
            </div>

            {/* About / Bio */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6]">
              <div className="text-xs font-bold text-[#161616] uppercase tracking-wider mb-2">
                {t('modal_about_title', 'About')} {technician.name}
              </div>
              <p className="text-xs text-[#161616]/75 leading-relaxed">
                {technician.intro}
              </p>
            </div>

            {/* Gallery Images */}
            {technician.galleryImages.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6]">
                <div className="text-xs font-bold text-[#161616] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#161616]/60" />
                  <span>{t('modal_gallery_title', 'Previous Work Gallery')} ({technician.galleryImages.length} {t('modal_photos', 'Photos')})</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {technician.galleryImages.map((img, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden border border-[#EAE3D6] aspect-video group">
                      <img
                        src={img}
                        alt={`Work proof ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Direct Contact & Instant Connect Box */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Direct Connect Box */}
            <div className="p-5 rounded-3xl bg-[#FAF7F2] border border-[#EAE3D6] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D6]">
                <div>
                  <div className="text-xs font-bold text-[#161616] uppercase tracking-wider">{t('modal_direct_access', 'Direct Access')}</div>
                  <div className="text-sm font-semibold text-[#161616]">{t('modal_contact_directly', 'Contact Mistri Directly')}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#161616]/60">{t('modal_starting_fee', 'Starting Fee')}</div>
                  <div className="text-sm font-bold text-[#161616]">
                    {technician.startingPrice > 0 ? `₹${technician.startingPrice}` : 'Ask for quote'}
                  </div>
                </div>
              </div>

              {/* Call Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => onDirectContact(technician, 'phone')}
                  className="w-full py-3 px-4 rounded-full bg-[#161616] hover:bg-[#2A2A2A] text-[#FAF7F2] text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-all"
                >
                  <Phone className="w-4 h-4 text-[#FAF7F2]" />
                  <span>{t('modal_call_primary', 'Call Primary')}: {technician.primaryPhone}</span>
                </button>

                {technician.alternatePhone && (
                  <button
                    onClick={() => onDirectContact(technician, 'phone')}
                    className="w-full py-2.5 px-4 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#EAE3D6] text-xs font-semibold text-[#161616] flex items-center justify-center gap-2 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#161616]/70" />
                    <span>{t('modal_alt_contact', 'Alt Contact')}: {technician.alternatePhone}</span>
                  </button>
                )}

                <button
                  onClick={() => onDirectContact(technician, 'whatsapp')}
                  className="w-full py-3 px-4 rounded-full bg-[#4C5943] hover:bg-[#3d4835] text-white text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-all"
                >
                  <MessageSquare className="w-4 h-4 text-white" />
                  <span>{t('modal_chat_whatsapp', 'Chat on WhatsApp')}</span>
                </button>
              </div>

              <div className="text-[11px] text-[#161616]/60 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4C5943]" />
                <span>{t('modal_zero_comm_note', 'Zero commission • 100% direct payment to mistri')}</span>
              </div>
            </div>

            {/* Rate this Mistri */}
            <RateMistriBox
              mistriId={toMistriNumericId(technician.id)}
              onRated={(avgRating, ratingsCount) => setLiveRating({ rating: avgRating, reviewsCount: ratingsCount })}
            />

          </div>

        </div>

      </div>

    </div>
  );
};
