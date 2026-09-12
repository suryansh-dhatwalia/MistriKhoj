import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link as MuiLink, Typography, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import { brandColors } from '../../theme/theme';

const routeNames: Record<string, string> = {
  dashboard: 'Dashboard',
  mistris: 'Mistris',
  pending: 'Pending Registrations',
  approved: 'Approved Mistris',
  profile: 'Admin Profile',
  content: 'Content',
  states: 'States',
  cities: 'Cities',
  categories: 'Categories',
  referrals: 'Referrals',
  ads: 'Advertising',
  banners: 'Banner Ads',
  category: 'Category Ads',
  requests: 'Ad Requests',
  videos: 'Videos',
  testimonials: 'Testimonials',
  plans: 'Plans',
  reports: 'Reports',
  audit: 'Audit Log',
  settings: 'Site Settings',
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard')) {
    return null;
  }

  return (
    <Box sx={{ mb: 2.5 }}>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" sx={{ color: brandColors.textDisabled }} />}
        aria-label="breadcrumb"
      >
        <MuiLink
          component={Link}
          to="/dashboard"
          underline="hover"
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: brandColors.textSecondary,
            fontSize: '0.8125rem',
            fontWeight: 500,
          }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Dashboard
        </MuiLink>

        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const label = routeNames[value] || value;

          if (value === 'dashboard') return null;

          return last ? (
            <Typography
              key={to}
              sx={{
                color: brandColors.textPrimary,
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}
            >
              {label}
            </Typography>
          ) : (
            <MuiLink
              key={to}
              component={Link}
              to={to}
              underline="hover"
              sx={{
                color: brandColors.textSecondary,
                fontSize: '0.8125rem',
                fontWeight: 500,
              }}
            >
              {label}
            </MuiLink>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};
