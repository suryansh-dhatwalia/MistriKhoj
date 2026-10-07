import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle2, Star } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../lib/api';

const ratedStorageKey = (mistriId: number) => `mistrikhoj_rated_mistri_${mistriId}`;

/** Anonymous 1-5 star rating widget. No comments/reviews — just a star count,
    submitted once per browser per Mistri (a soft, local-only guard; the real
    anti-abuse limit is server-side, keyed by IP + Mistri). */
export const RateMistriBox: React.FC<{
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
