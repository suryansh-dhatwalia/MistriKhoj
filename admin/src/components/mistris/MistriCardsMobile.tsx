import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Divider,
  Pagination,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import { Mistri } from '../../types/mistri.types';
import { SafeImage } from '../common/SafeImage';
import { formatDateOnly, formatExperience, formatPhoneNumber } from '../../utils/format.utils';
import { brandColors } from '../../theme/theme';

interface MistriCardsMobileProps {
  mistris: Mistri[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onView: (mistri: Mistri) => void;
  onEdit: (mistri: Mistri) => void;
  onApprove?: (mistri: Mistri) => void;
  onRejectOrDelete: (mistri: Mistri) => void;
  isPendingTable?: boolean;
}

export const MistriCardsMobile: React.FC<MistriCardsMobileProps> = ({
  mistris,
  total,
  page,
  pageSize,
  onPageChange,
  onView,
  onEdit,
  onApprove,
  onRejectOrDelete,
  isPendingTable = false,
}) => {
  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {mistris.map((mistri) => (
        <Card
          key={mistri.id}
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2.5,
            border: `1px solid ${brandColors.border}`,
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
            <SafeImage
              src={mistri.profilePhotoUrl}
              alt={mistri.fullName}
              width={56}
              height={56}
              borderRadius={2}
              isAvatar
              onClick={() => onView(mistri)}
            />

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: brandColors.textPrimary, lineHeight: 1.2 }}
                  onClick={() => onView(mistri)}
                >
                  {mistri.fullName}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    backgroundColor: brandColors.warmWhiteDarker,
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 1,
                    fontSize: '0.6875rem',
                  }}
                >
                  #{mistri.id}
                </Typography>
              </Box>

              <Chip
                label={mistri.category}
                size="small"
                sx={{
                  mt: 0.5,
                  height: 22,
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  backgroundColor: brandColors.warmWhiteDarker,
                  color: brandColors.textPrimary,
                }}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, my: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon sx={{ fontSize: 16, color: brandColors.textSecondary }} />
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                {formatPhoneNumber(mistri.primaryPhone)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon sx={{ fontSize: 16, color: brandColors.textSecondary }} />
              <Typography variant="body2" sx={{ color: brandColors.textSecondary }}>
                {[mistri.city, mistri.state].filter(Boolean).join(', ') || 'Location not provided'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.5 }}>
              <Typography variant="caption" sx={{ color: brandColors.textSecondary }}>
                Exp: <strong>{formatExperience(mistri.experienceYears)}</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: brandColors.textSecondary }}>
                Reg: {formatDateOnly(mistri.createdAt)}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 1.5, borderColor: brandColors.border }} />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={() => onView(mistri)}
              sx={{ borderColor: brandColors.borderDark, color: brandColors.textPrimary, fontSize: '0.75rem' }}
            >
              View
            </Button>

            <Button
              size="small"
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => onEdit(mistri)}
              sx={{ borderColor: brandColors.borderDark, color: brandColors.textPrimary, fontSize: '0.75rem' }}
            >
              Edit
            </Button>

            {isPendingTable && onApprove && (
              <Button
                size="small"
                variant="contained"
                startIcon={<CheckCircleIcon />}
                onClick={() => onApprove(mistri)}
                sx={{
                  backgroundColor: brandColors.success,
                  color: brandColors.white,
                  fontSize: '0.75rem',
                  '&:hover': { backgroundColor: '#14632e' },
                }}
              >
                Approve
              </Button>
            )}

            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<DeleteForeverIcon />}
              onClick={() => onRejectOrDelete(mistri)}
              sx={{ fontSize: '0.75rem' }}
            >
              {isPendingTable ? 'Reject & Delete' : 'Delete'}
            </Button>
          </Box>
        </Card>
      ))}

      {/* Mobile Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 1 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, newPage) => onPageChange(newPage)}
          size="medium"
          color="primary"
        />
      </Box>
    </Box>
  );
};
