import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { Box, CircularProgress, Typography } from '@mui/material';
import { brandColors } from '../theme/theme';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: brandColors.warmWhite,
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 2,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              backgroundColor: brandColors.black,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: brandColors.mustard,
              fontWeight: 800,
              fontSize: '1.25rem',
            }}
          >
            MK
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
              MistriKhoj
            </Typography>
            <Typography variant="caption" sx={{ color: brandColors.textSecondary, fontWeight: 600 }}>
              ADMIN PORTAL
            </Typography>
          </Box>
        </Box>
        <CircularProgress size={36} sx={{ color: brandColors.mustard }} />
        <Typography variant="body2" sx={{ color: brandColors.textSecondary }}>
          Verifying administrator session...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
