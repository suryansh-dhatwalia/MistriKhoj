import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { PendingMistrisPage } from '../pages/PendingMistrisPage';
import { ApprovedMistrisPage } from '../pages/ApprovedMistrisPage';
import { ProfilePage } from '../pages/ProfilePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { StatesPage } from '../pages/StatesPage';
import { CitiesPage } from '../pages/CitiesPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { ReferralsPage } from '../pages/ReferralsPage';
import { BannerAdsPage } from '../pages/BannerAdsPage';
import { CategoryAdsPage } from '../pages/CategoryAdsPage';
import { VideosPage } from '../pages/VideosPage';
import { AdRequestsPage } from '../pages/AdRequestsPage';
import { TestimonialsPage } from '../pages/TestimonialsPage';
import { PlansPage } from '../pages/PlansPage';
import { ReportsPage } from '../pages/ReportsPage';
import { AuditLogPage } from '../pages/AuditLogPage';
import { SettingsPage } from '../pages/SettingsPage';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/mistris/pending" element={<PendingMistrisPage />} />
        <Route path="/mistris/approved" element={<ApprovedMistrisPage />} />

        <Route path="/content/states" element={<StatesPage />} />
        <Route path="/content/cities" element={<CitiesPage />} />
        <Route path="/content/categories" element={<CategoriesPage />} />
        <Route path="/content/referrals" element={<ReferralsPage />} />
        <Route path="/content/ads/banners" element={<BannerAdsPage />} />
        <Route path="/content/ads/category" element={<CategoryAdsPage />} />
        <Route path="/content/ads/requests" element={<AdRequestsPage />} />
        <Route path="/content/videos" element={<VideosPage />} />
        <Route path="/content/testimonials" element={<TestimonialsPage />} />
        <Route path="/content/plans" element={<PlansPage />} />

        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/reports/audit" element={<AuditLogPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
