import React from 'react';
import { Box, Typography, Button, Alert, AlertTitle } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import ErrorIcon from '@mui/icons-material/Error';
import { brandColors } from '../../theme/theme';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  isNetworkError?: boolean;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title,
  message,
  onRetry,
  isNetworkError = false,
}) => {
  return (
    <Alert
      severity={isNetworkError ? 'warning' : 'error'}
      icon={isNetworkError ? <WifiOffIcon fontSize="inherit" /> : <ErrorIcon fontSize="inherit" />}
      action={
        onRetry && (
          <Button
            color="inherit"
            size="small"
            onClick={onRetry}
            startIcon={<RefreshIcon />}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              border: `1px solid ${isNetworkError ? brandColors.warning : brandColors.error}`,
              borderRadius: 1.5,
              px: 1.5,
            }}
          >
            Retry
          </Button>
        )
      }
      sx={{
        borderRadius: 2,
        border: `1px solid ${isNetworkError ? brandColors.warning : brandColors.error}`,
        my: 2,
        alignItems: 'center',
        backgroundColor: isNetworkError ? brandColors.warningLight : brandColors.errorLight,
      }}
    >
      {title && (
        <AlertTitle sx={{ fontWeight: 700, mb: 0.5 }}>
          {title}
        </AlertTitle>
      )}
      <Typography variant="body2" sx={{ color: brandColors.textPrimary }}>
        {message}
      </Typography>
      {isNetworkError && (
        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: brandColors.textSecondary }}>
          Expected backend: <code>{import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}</code>
        </Typography>
      )}
    </Alert>
  );
};
