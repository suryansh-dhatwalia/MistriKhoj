import React from 'react';
import { Box, Switch, Tooltip, Typography } from '@mui/material';
import { Mistri } from '../../types/mistri.types';
import { brandColors } from '../../theme/theme';

interface AvailabilityToggleProps {
  mistri: Pick<Mistri, 'isActive'>;
  onToggle: () => void;
}

/** Active / Inactive switch: inactive Mistris stay approved but are hidden from the public site. */
export const AvailabilityToggle: React.FC<AvailabilityToggleProps> = ({ mistri, onToggle }) => {
  const isActive = mistri.isActive !== false;

  return (
    <Tooltip
      title={
        isActive
          ? 'Active: visible on the website. Switch off to hide temporarily.'
          : 'Inactive: hidden from the website. Switch on to show again.'
      }
    >
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        <Switch
          size="small"
          checked={isActive}
          onChange={onToggle}
          slotProps={{ input: { 'aria-label': isActive ? 'Set inactive' : 'Set active' } }}
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': { color: brandColors.success },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: brandColors.success,
            },
          }}
        />
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: isActive ? brandColors.success : brandColors.textSecondary,
          }}
        >
          {isActive ? 'Active' : 'Inactive'}
        </Typography>
      </Box>
    </Tooltip>
  );
};
