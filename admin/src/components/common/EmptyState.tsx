import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { brandColors } from '../../theme/theme';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <Box
      sx={{
        py: 8,
        px: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        backgroundColor: brandColors.white,
        borderRadius: 3,
        border: `1px dashed ${brandColors.borderDark}`,
        my: 2,
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          backgroundColor: brandColors.warmWhiteDarker,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: brandColors.textSecondary,
          mb: 2,
        }}
      >
        {icon || <SearchOffIcon sx={{ fontSize: 32 }} />}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: brandColors.textPrimary, mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: brandColors.textSecondary, maxWidth: 440, mb: actionText ? 2.5 : 0 }}>
        {description}
      </Typography>
      {actionText && onAction && (
        <Button
          variant="outlined"
          size="small"
          onClick={onAction}
          sx={{
            borderColor: brandColors.borderDark,
            color: brandColors.textPrimary,
            fontWeight: 600,
          }}
        >
          {actionText}
        </Button>
      )}
    </Box>
  );
};
