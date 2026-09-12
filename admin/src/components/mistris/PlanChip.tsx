import React from 'react';
import { Chip } from '@mui/material';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { Mistri } from '../../types/mistri.types';
import { formatDateOnly } from '../../utils/format.utils';
import { brandColors } from '../../theme/theme';

interface PlanChipProps {
  mistri: Pick<Mistri, 'plan' | 'slotActive' | 'featuredUntil'>;
  size?: 'small' | 'medium';
}

/** Free / Paid plan badge shared by the Mistri table, mobile cards, and details dialog. */
export const PlanChip: React.FC<PlanChipProps> = ({ mistri, size = 'small' }) => {
  const isPaid = mistri.plan === 'PAID';

  if (!isPaid) {
    return (
      <Chip
        icon={<CardGiftcardIcon />}
        label="Free"
        size={size}
        sx={{
          fontWeight: 700,
          fontSize: '0.6875rem',
          backgroundColor: brandColors.warmWhiteDarker,
          color: brandColors.textSecondary,
          border: `1px solid ${brandColors.border}`,
        }}
      />
    );
  }

  const suffix = mistri.slotActive && mistri.featuredUntil
    ? ` · till ${formatDateOnly(mistri.featuredUntil)}`
    : mistri.plan === 'PAID' && !mistri.slotActive
      ? ' · slot pending'
      : '';

  return (
    <Chip
      icon={<WorkspacePremiumIcon />}
      label={`Paid${suffix}`}
      size={size}
      sx={{
        fontWeight: 700,
        fontSize: '0.6875rem',
        backgroundColor: brandColors.mustard,
        color: brandColors.black,
        border: `1px solid ${brandColors.mustardDark}`,
        '& .MuiChip-icon': { color: brandColors.black },
      }}
    />
  );
};
