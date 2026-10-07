import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ChevronRight, MapPin, MessageSquare, Phone, ShieldCheck, Star } from 'lucide-react';
import type { Technician } from '../types';
import { DEFAULT_AVATAR_URI } from '../lib/avatar';
import { toMistriNumericId } from '../lib/technician';
import { useLanguage } from '../context/LanguageContext';

interface MistriCardProps {
  tech: Technician;
  onDirectContact: (tech: Technician, method: 'phone' | 'whatsapp') => void;
}

/** One search result. The name, photo and "View Full Profile" all link to the profile page. */
export const MistriCard: React.FC<MistriCardProps> = ({ tech, onDirectContact }) => {
  const { t } = useLanguage();
  const profilePath = `/mistri/${toMistriNumericId(tech.id)}`;

  return (
    <article
      data-testid="mistri-card"
      className={`group flex h-full flex-col justify-between overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition-all duration-200 hover:shadow-xl ${
        tech.isFeatured
          ? 'border-[#FFB800] ring-2 ring-[#FFB800]/40 hover:border-[#FFB800]'
          : 'border-gray-200 hover:border-black'
      }`}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <Link to={profilePath} tabIndex={-1} aria-hidden="true" className="relative shrink-0">
            <img
              src={tech.photoUrl}
              alt=""
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_AVATAR_URI;
              }}
              className="h-16 w-16 rounded-xl border border-gray-200 bg-gray-100 object-cover"
            />
            {tech.isVerified && (
              <div className="absolute -bottom-1 -right-1 rounded-full bg-black p-0.5 text-[#FFB800] shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
            )}
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {tech.isFeatured && (
                <span className="flex items-center gap-0.5 rounded bg-[#FFB800] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-black">
                  <Star className="h-2.5 w-2.5 fill-black" aria-hidden="true" />
                  {t('dir_top_listed', 'Top Listed')}
                </span>
              )}
              <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-gray-800">
                {tech.badgeLevel}
              </span>
            </div>

            <h3 className="mt-1.5 truncate text-base font-extrabold text-[#111827]">
              <Link
                to={profilePath}
                className="hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                {tech.name}
              </Link>
            </h3>
            <p className="text-xs font-bold text-gray-600">{tech.category}</p>
            <div className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-gray-500">
              <MapPin className="h-3 w-3 shrink-0 text-black" aria-hidden="true" />
              <span className="truncate">
                {tech.city}, {tech.state}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 text-center text-xs">
          <div className="rounded-xl bg-gray-50 p-2">
            <div className="flex items-center justify-center gap-1 font-black text-black">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" aria-hidden="true" />
              <span>{tech.reviewsCount > 0 ? tech.rating : 'New'}</span>
            </div>
            <div className="mt-0.5 text-[10px] font-semibold text-gray-500">
              {tech.reviewsCount} {t('dir_reviews', 'reviews')}
            </div>
          </div>
          <div className="rounded-xl bg-gray-50 p-2">
            <div className="font-black text-black">
              {tech.experienceYears} {t('dir_yrs', 'Yrs')}
            </div>
            <div className="mt-0.5 text-[10px] font-semibold text-gray-500">{t('dir_exp_years', 'Experience')}</div>
          </div>
          <div className="rounded-xl bg-gray-50 p-2">
            <div className="font-black text-black">{tech.completedJobs > 0 ? `${tech.completedJobs}+` : 'New'}</div>
            <div className="mt-0.5 text-[10px] font-semibold text-gray-500">{t('dir_jobs_done', 'Jobs Done')}</div>
          </div>
        </div>

        <div className="mt-3 flex items-start gap-1.5 rounded-lg border border-amber-200/60 bg-amber-50/70 px-3 py-1.5 text-[11px] font-medium text-amber-950">
          <Award className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" aria-hidden="true" />
          <span className="line-clamp-1">{tech.qualification}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {tech.servicesOffered.slice(0, 3).map((service) => (
            <span key={service} className="rounded-md bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-800">
              {service}
            </span>
          ))}
          {tech.servicesOffered.length > 3 && (
            <span className="rounded-md bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-black">
              +{tech.servicesOffered.length - 3}
            </span>
          )}
        </div>

        <p className="mt-3 line-clamp-2 text-xs font-normal leading-relaxed text-gray-600">{tech.intro}</p>
      </div>

      <div className="space-y-2.5 border-t border-gray-200 bg-gray-50 p-5">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onDirectContact(tech, 'phone')}
            aria-label={`Call ${tech.name} directly`}
            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-black px-3 py-2.5 text-xs font-bold text-[#FFB800] shadow-sm transition-all hover:bg-gray-800"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t('dir_call_now', 'Call Now')}</span>
          </button>
          <button
            type="button"
            onClick={() => onDirectContact(tech, 'whatsapp')}
            aria-label={`Chat with ${tech.name} on WhatsApp`}
            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#1EBE5D]"
          >
            <MessageSquare className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            <span>{t('dir_whatsapp', 'WhatsApp')}</span>
          </button>
        </div>

        <Link
          to={profilePath}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-900 transition-all hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          <span>View Full Profile</span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
};
