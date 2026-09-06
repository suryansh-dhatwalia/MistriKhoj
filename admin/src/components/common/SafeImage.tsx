import React, { useState } from 'react';
import { Box, Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ImageIcon from '@mui/icons-material/Image';
import { brandColors } from '../../theme/theme';

interface SafeImageProps {
  src?: string | null;
  alt: string;
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
  isAvatar?: boolean;
  className?: string;
  onClick?: () => void;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  width = 44,
  height = 44,
  borderRadius = 8,
  isAvatar = false,
  className,
  onClick,
}) => {
  const [hasError, setHasError] = useState<boolean>(false);

  if (!src || hasError) {
    if (isAvatar) {
      return (
        <Avatar
          sx={{
            width,
            height,
            backgroundColor: brandColors.warmWhiteDarker,
            color: brandColors.textSecondary,
            border: `1px solid ${brandColors.border}`,
            borderRadius,
            cursor: onClick ? 'pointer' : 'default',
          }}
          onClick={onClick}
          aria-label={alt}
        >
          <PersonIcon sx={{ fontSize: typeof width === 'number' ? width * 0.55 : 24 }} />
        </Avatar>
      );
    }

    return (
      <Box
        sx={{
          width,
          height,
          backgroundColor: brandColors.warmWhiteDarker,
          color: brandColors.textSecondary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius,
          border: `1px solid ${brandColors.border}`,
          cursor: onClick ? 'pointer' : 'default',
        }}
        onClick={onClick}
        aria-label={alt}
      >
        <ImageIcon sx={{ fontSize: typeof width === 'number' ? width * 0.5 : 24, color: brandColors.textDisabled }} />
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      referrerPolicy="no-referrer"
      onClick={onClick}
      className={className}
      sx={{
        width,
        height,
        objectFit: 'cover',
        borderRadius,
        border: `1px solid ${brandColors.border}`,
        cursor: onClick ? 'pointer' : 'default',
        display: 'block',
        backgroundColor: brandColors.warmWhiteDarker,
      }}
    />
  );
};
