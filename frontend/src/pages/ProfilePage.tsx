import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  Award,
  Check,
  ChevronLeft,
  Eye,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  Phone,
  Share2,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { RateMistriBox } from '../components/RateMistriBox';
import { useLanguage } from '../context/LanguageContext';
import { analytics } from '../lib/analytics';
import { DEFAULT_AVATAR_URI } from '../lib/avatar';
import { apiErrorMessage, fetchMistriProfile } from '../lib/mistri.api';
import { buildResultsPath } from '../lib/searchParams';
import { usePageMeta } from '../lib/seo';
import { contactTechnician, toTechnician } from '../lib/technician';
import type { Technician } from '../types';

type LoadState =
  | { status: 'loading' }
  | { status: 'notfound' }
  | { status: 'error'; message: string }
  | { status: 'ready'; tech: Technician; viewCount: number };

export const ProfilePage: React.FC = () => {
  const { id } = useParams();
  const { key } = useLocation();
  const { t } = useLanguage();
  const mistriId = Number(id);
  const [load, setLoad] = useState<LoadState>({ status: 'loading' });
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState({ rating: 0, reviewsCount: 0 });
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!Number.isInteger(mistriId) || mistriId <= 0) {
      setLoad({ status: 'notfound' });
      return;
    }
    const controller = new AbortController();
    setLoad({ status: 'loading' });
    fetchMistriProfile(mistriId, controller.signal)
      .then((mistri) => {
        const tech = toTechnician(mistri);
        setRating({ rating: tech.rating, reviewsCount: tech.reviewsCount });
        setLoad({ status: 'ready', tech, viewCount: mistri.viewCount ?? 0 });
        // Only a profile that actually loaded is counted; the server dedupes repeat opens.
        void analytics.trackProfileView(key, mistriId).then((total) => {
          if (total !== null && !controller.signal.aborted) {
            setLoad((current) => (current.status === 'ready' ? { ...current, viewCount: total } : current));
          }
        });
      })
      .catch((error: unknown) => {
        if (axios.isCancel(error)) return;
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setLoad({ status: 'notfound' });
          return;
        }
        setLoad({ status: 'error', message: apiErrorMessage(error, 'Could not load this profile.') });
      });
    return () => controller.abort();
  }, [mistriId, key, retry]);

  const tech = load.status === 'ready' ? load.tech : null;
  usePageMeta({
    title: tech ? `${tech.name} — ${tech.category} in ${tech.city}, ${tech.state}` : 'Mistri profile',
    description: tech
      ? `${tech.name} is a ${tech.category} in ${tech.city}, ${tech.state} with ${tech.experienceYears} years of experience. Call or WhatsApp directly on MistriKhoj.`
      : 'View a verified Mistri profile on MistriKhoj.',
    canonicalPath: `/mistri/${id}`,
    noindex: load.status !== 'ready',
  });

  if (load.status === 'loading') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16" role="status" aria-live="polite">
        <div className="h-64 animate-pulse rounded-3xl border border-[#EAE3D6] bg-white" />
        <span className="sr-only">Loading profile…</span>
      </div>
    );
  }
  if (load.status !== 'ready') {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center" role={load.status === 'error' ? 'alert' : undefined}>
        <h1 className="text-2xl font-black text-[#111827]">
          {load.status === 'notfound' ? 'This profile is not available' : 'Unable to load profile'}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {load.status === 'notfound'
            ? 'It may have been removed or is temporarily hidden.'
            : load.message}
        </p>
        <div className="mt-5 flex justify-center gap-3">
          {load.status === 'error' && (
            <button type="button" onClick={() => setRetry((n) => n + 1)} className="rounded-xl bg-[#FFB800] px-5 py-2.5 text-xs font-bold">
              Try Again
            </button>
          )}
          <Link to="/mistris" className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold">
            Browse Mistris
          </Link>
        </div>
      </div>
    );
  }

  const { viewCount } = load;
  const backPath = buildResultsPath({ state: tech!.state, city: tech!.city });
  const handleShare = () => {
    void navigator.clipboard?.writeText(window.location.origin + `/mistri/${mistriId}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };
  const card = 'rounded-2xl border border-[#EAE3D6] bg-[#FAF7F2] p-4';
  const heading = 'text-xs font-bold uppercase tracking-wider text-[#161616]';

  return (
    <div className="bg-white text-[#161616]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link to={backPath} className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-black">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Back to {tech!.city} results
          </Link>
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-full border border-[#EAE3D6] bg-white px-3 py-1.5 text-xs font-medium hover:bg-[#FAF7F2]"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[#4C5943]" aria-hidden="true" /> : <Share2 className="h-3.5 w-3.5" aria-hidden="true" />}
            <span>{copied ? t('modal_copied', 'Copied') : t('modal_share', 'Share')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <div className={`${card} flex flex-col items-start gap-4 sm:flex-row`}>
              <img
                src={tech!.photoUrl}
                alt={tech!.name}
                onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR_URI; }}
                className="h-28 w-28 shrink-0 rounded-2xl border border-[#EAE3D6] bg-[#EAE3D6] object-cover"
              />
              <div className="min-w-0 flex-1">
                <span className="rounded-full border border-[#EAE3D6] bg-white px-2.5 py-0.5 text-xs font-semibold">{tech!.badgeLevel}</span>
                <h1 className="font-display mt-1.5 text-2xl font-normal sm:text-3xl">{tech!.name}</h1>
                <p className="text-xs font-semibold text-[#161616]/70">{tech!.category}</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-[#161616]/65">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{tech!.city}, {tech!.state}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-[#161616]" aria-hidden="true" />
                    {rating.reviewsCount > 0 ? rating.rating : 'New'}
                    <span className="font-normal text-[#161616]/50">({rating.reviewsCount} {t('dir_reviews', 'reviews')})</span>
                  </span>
                  <span>{tech!.experienceYears} {t('modal_yrs_exp', 'Yrs Exp')}</span>
                </div>
              </div>
            </div>

            {/* Profile views */}
            <section aria-label="Profile views" className={`${card} flex items-center gap-3`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#161616] text-[#FFB800]">
                <Eye className="h-5 w-5" aria-hidden="true" />
              </span>
              <div aria-live="polite">
                <div className="text-2xl font-black leading-none" data-testid="profile-view-count">
                  {viewCount.toLocaleString('en-IN')}
                </div>
                <div className="mt-0.5 text-[11px] font-semibold text-[#161616]/60">
                  {viewCount === 1 ? 'time this profile has been viewed' : 'times this profile has been viewed'}
                </div>
              </div>
            </section>

            <div className={card}>
              <div className={`${heading} mb-1 flex items-center gap-1.5`}><Award className="h-3.5 w-3.5" aria-hidden="true" />{t('modal_qualification_title', 'Qualification & Certifications')}</div>
              <p className="text-xs font-medium text-[#161616]/80">{tech!.qualification}</p>
            </div>
            <div className={card}>
              <div className={`${heading} mb-1 flex items-center gap-1.5`}><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{t('modal_address_title', 'Workshop / Base Address')}</div>
              <p className="text-xs text-[#161616]/75">{tech!.address}</p>
            </div>
            <div className={card}>
              <h2 className={`${heading} mb-2.5`}>{t('modal_services_title', 'Specialized Services Offered')}</h2>
              <ul className="flex list-none flex-wrap gap-2 p-0">
                {tech!.servicesOffered.map((service) => (
                  <li key={service} className="flex items-center gap-1.5 rounded-full border border-[#EAE3D6] bg-white px-3 py-1 text-xs">
                    <Check className="h-3 w-3 text-[#4C5943]" aria-hidden="true" />{service}
                  </li>
                ))}
              </ul>
            </div>
            <div className={card}>
              <h2 className={`${heading} mb-2`}>{t('modal_about_title', 'About')} {tech!.name}</h2>
              <p className="text-xs leading-relaxed text-[#161616]/75">{tech!.intro}</p>
            </div>
            {tech!.galleryImages.length > 0 && (
              <div className={card}>
                <h2 className={`${heading} mb-3 flex items-center gap-1.5`}><ImageIcon className="h-4 w-4" aria-hidden="true" />{t('modal_gallery_title', 'Previous Work Gallery')}</h2>
                <ul className="grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3">
                  {tech!.galleryImages.map((src, index) => (
                    <li key={src} className="aspect-video overflow-hidden rounded-xl border border-[#EAE3D6]">
                      <img src={src} alt={`Work sample ${index + 1} by ${tech!.name}`} loading="lazy" className="h-full w-full object-cover" />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-4 lg:col-span-5">
            <div className="space-y-3 rounded-3xl border border-[#EAE3D6] bg-[#FAF7F2] p-5">
              <div className={`${heading} border-b border-[#EAE3D6] pb-3`}>{t('modal_contact_directly', 'Contact Mistri Directly')}</div>
              <button type="button" onClick={() => contactTechnician(tech!, 'phone')} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#161616] px-4 py-3 text-xs font-semibold text-[#FAF7F2] hover:bg-[#2A2A2A]">
                <Phone className="h-4 w-4" aria-hidden="true" />{t('modal_call_primary', 'Call Primary')}: {tech!.primaryPhone}
              </button>
              {tech!.alternatePhone && (
                <a href={`tel:${tech!.alternatePhone.replace(/\D/g, '')}`} className="flex w-full items-center justify-center gap-2 rounded-full border border-[#EAE3D6] bg-white px-4 py-2.5 text-xs font-semibold hover:bg-[#FAF7F2]">
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />{t('modal_alt_contact', 'Alt Contact')}: {tech!.alternatePhone}
                </a>
              )}
              <button type="button" onClick={() => contactTechnician(tech!, 'whatsapp')} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#4C5943] px-4 py-3 text-xs font-semibold text-white hover:bg-[#3d4835]">
                <MessageSquare className="h-4 w-4" aria-hidden="true" />{t('modal_chat_whatsapp', 'Chat on WhatsApp')}
              </button>
              <p className="flex items-center justify-center gap-1 text-[11px] text-[#161616]/60">
                <ShieldCheck className="h-3.5 w-3.5 text-[#4C5943]" aria-hidden="true" />
                {t('modal_zero_comm_note', 'Zero commission • 100% direct payment to mistri')}
              </p>
            </div>
            <RateMistriBox mistriId={mistriId} onRated={(avg, count) => setRating({ rating: avg, reviewsCount: count })} />
          </div>
        </div>
      </div>
    </div>
  );
};
