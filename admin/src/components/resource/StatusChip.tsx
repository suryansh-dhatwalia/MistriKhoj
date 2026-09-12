import React from 'react';
import { Chip } from '@mui/material';
import type { ContentStatus } from '../../types/content.types';

export const StatusChip: React.FC<{ status: ContentStatus }> = ({ status }) => {
  const active = status === 'ACTIVE';
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        fontWeight: 700,
        fontSize: '0.6875rem',
        backgroundColor: active ? '#F0FDF4' : '#F3F4F6',
        color: active ? '#16A34A' : '#6B7280',
      }}
    />
  );
};
