import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Chip,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import HandymanIcon from '@mui/icons-material/Handyman';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import VerifiedIcon from '@mui/icons-material/Verified';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { Mistri } from '../../types/mistri.types';
import { SafeImage } from '../common/SafeImage';
import { formatDate, formatExperience, formatPhoneNumber } from '../../utils/format.utils';
import { brandColors } from '../../theme/theme';

interface MistriDetailsDialogProps {
  mistri: Mistri | null;
  open: boolean;
  onClose: () => void;
  onEdit: (mistri: Mistri) => void;
  onApprove?: (mistri: Mistri) => void;
  onRejectOrDelete: (mistri: Mistri) => void;
}

export const MistriDetailsDialog: React.FC<MistriDetailsDialogProps> = ({
  mistri,
  open,
  onClose,
  onEdit,
  onApprove,
  onRejectOrDelete,
}) => {
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);

  if (!mistri) return null;

  const isPending = mistri.status === 'PENDING';

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        aria-labelledby="mistri-details-title"
      >
        <DialogTitle
          id="mistri-details-title"
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${brandColors.border}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Mistri Registration Profile
            </Typography>
            <Chip
              label={`#${mistri.id}`}
              size="small"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                backgroundColor: brandColors.warmWhiteDarker,
                border: `1px solid ${brandColors.border}`,
              }}
            />
            <Chip
              icon={isPending ? <PendingActionsIcon /> : <VerifiedIcon />}
              label={mistri.status}
              size="small"
              sx={{
                fontWeight: 700,
                backgroundColor: isPending ? brandColors.mustardLight : brandColors.successLight,
                color: isPending ? brandColors.black : brandColors.success,
                border: `1px solid ${isPending ? brandColors.mustard : brandColors.success}`,
              }}
            />
          </Box>
          <IconButton size="small" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {/* Header Card: Photo, Name, Contact, Status */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 3,
              alignItems: { xs: 'center', sm: 'flex-start' },
              p: 2.5,
              borderRadius: 2.5,
              backgroundColor: brandColors.warmWhite,
              border: `1px solid ${brandColors.border}`,
              mb: 3,
            }}
          >
            <SafeImage
              src={mistri.profilePhotoUrl}
              alt={mistri.fullName}
              width={100}
              height={100}
              borderRadius={3}
              isAvatar
            />

            <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: brandColors.textPrimary }}>
                {mistri.fullName}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: brandColors.textSecondary, fontWeight: 600 }}>
                {mistri.category}
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                  mt: 1.5,
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <PhoneIcon sx={{ fontSize: 16, color: brandColors.textSecondary }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                    {formatPhoneNumber(mistri.primaryPhone)}
                  </Typography>
                </Box>

                {mistri.alternatePhone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Typography variant="caption" sx={{ color: brandColors.textSecondary }}>
                      Alt:
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {formatPhoneNumber(mistri.alternatePhone)}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <LocationOnIcon sx={{ fontSize: 16, color: brandColors.textSecondary }} />
                  <Typography variant="body2" sx={{ color: brandColors.textSecondary }}>
                    {[mistri.city, mistri.state].filter(Boolean).join(', ')}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Details Grid */}
          <Grid container spacing={3}>
            {/* Professional Info */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  p: 2.5,
                  height: '100%',
                  borderRadius: 2,
                  border: `1px solid ${brandColors.border}`,
                  backgroundColor: brandColors.white,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: brandColors.textSecondary,
                    mb: 2,
                  }}
                >
                  Professional Credentials
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: brandColors.textSecondary, display: 'block' }}>
                      Years of Experience
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                      <WorkHistoryIcon sx={{ fontSize: 18, color: brandColors.mustardDark }} />
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        {formatExperience(mistri.experienceYears)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: brandColors.textSecondary, display: 'block' }}>
                      Qualification / Certifications
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                      <SchoolIcon sx={{ fontSize: 18, color: brandColors.textSecondary }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {mistri.qualification || 'Not specified'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: brandColors.textSecondary, display: 'block' }}>
                      Referral Code
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {mistri.referralCode || 'None'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Address & Timestamps */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  p: 2.5,
                  height: '100%',
                  borderRadius: 2,
                  border: `1px solid ${brandColors.border}`,
                  backgroundColor: brandColors.white,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: brandColors.textSecondary,
                    mb: 2,
                  }}
                >
                  Location & Registration Info
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: brandColors.textSecondary, display: 'block' }}>
                      Complete Address
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.25 }}>
                      {mistri.address || '—'}
                    </Typography>
                    {mistri.pincode && (
                      <Typography variant="caption" sx={{ color: brandColors.textSecondary, display: 'block', mt: 0.5 }}>
                        PIN Code: <strong>{mistri.pincode}</strong>
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: brandColors.textSecondary, display: 'block' }}>
                      Registration Date
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                      <CalendarMonthIcon sx={{ fontSize: 16, color: brandColors.textSecondary }} />
                      <Typography variant="body2">{formatDate(mistri.createdAt)}</Typography>
                    </Box>
                  </Box>

                  {mistri.approvedAt && (
                    <Box>
                      <Typography variant="caption" sx={{ color: brandColors.textSecondary, display: 'block' }}>
                        Approved Date
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                        <VerifiedIcon sx={{ fontSize: 16, color: brandColors.success }} />
                        <Typography variant="body2" sx={{ color: brandColors.success, fontWeight: 600 }}>
                          {formatDate(mistri.approvedAt)}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* Services Offered */}
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: `1px solid ${brandColors.border}`,
                  backgroundColor: brandColors.white,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <HandymanIcon sx={{ fontSize: 18, color: brandColors.mustardDark }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Services Offered ({mistri.servicesOffered?.length || 0})
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {mistri.servicesOffered && mistri.servicesOffered.length > 0 ? (
                    mistri.servicesOffered.map((srv, idx) => (
                      <Chip
                        key={idx}
                        label={srv}
                        size="small"
                        sx={{
                          backgroundColor: brandColors.warmWhiteDarker,
                          border: `1px solid ${brandColors.border}`,
                          fontWeight: 500,
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: brandColors.textSecondary, fontStyle: 'italic' }}>
                      No specific services listed.
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* Short Introduction */}
            {mistri.shortIntro && (
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: `1px solid ${brandColors.border}`,
                    backgroundColor: brandColors.white,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Short Introduction
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: brandColors.textPrimary }}>
                    {mistri.shortIntro}
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* Gallery Images */}
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: `1px solid ${brandColors.border}`,
                  backgroundColor: brandColors.white,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Work Portfolio / Gallery Images ({mistri.galleryImages?.length || 0})
                </Typography>
                {mistri.galleryImages && mistri.galleryImages.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {mistri.galleryImages.map((imgUrl, i) => (
                      <Tooltip key={i} title="Click to view full image">
                        <Box sx={{ cursor: 'pointer' }} onClick={() => setSelectedGalleryImage(imgUrl)}>
                          <SafeImage
                            src={imgUrl}
                            alt={`Portfolio image ${i + 1}`}
                            width={90}
                            height={90}
                            borderRadius={2}
                          />
                        </Box>
                      </Tooltip>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: brandColors.textSecondary, fontStyle: 'italic' }}>
                    No gallery images uploaded for this Mistri.
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ borderColor: brandColors.borderDark, color: brandColors.textPrimary }}
          >
            Close
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => {
                onClose();
                onEdit(mistri);
              }}
              sx={{ borderColor: brandColors.borderDark, color: brandColors.textPrimary }}
            >
              Edit Profile
            </Button>

            {isPending && onApprove && (
              <Button
                variant="contained"
                startIcon={<CheckCircleIcon />}
                onClick={() => {
                  onClose();
                  onApprove(mistri);
                }}
                sx={{
                  backgroundColor: brandColors.success,
                  color: brandColors.white,
                  '&:hover': { backgroundColor: '#14632e' },
                }}
              >
                Approve Registration
              </Button>
            )}

            <Button
              variant="contained"
              startIcon={<DeleteForeverIcon />}
              onClick={() => {
                onClose();
                onRejectOrDelete(mistri);
              }}
              sx={{
                backgroundColor: brandColors.error,
                color: brandColors.white,
                '&:hover': { backgroundColor: '#b71c1c' },
              }}
            >
              {isPending ? 'Reject & Delete' : 'Delete Profile'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Gallery Image Lightbox Modal */}
      <Dialog
        open={Boolean(selectedGalleryImage)}
        onClose={() => setSelectedGalleryImage(null)}
        maxWidth="md"
      >
        <Box sx={{ position: 'relative', p: 1, backgroundColor: brandColors.black }}>
          <IconButton
            onClick={() => setSelectedGalleryImage(null)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: brandColors.white,
              backgroundColor: 'rgba(0,0,0,0.6)',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' },
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedGalleryImage && (
            <SafeImage
              src={selectedGalleryImage}
              alt="Gallery Preview"
              width="100%"
              height="auto"
              borderRadius={1}
            />
          )}
        </Box>
      </Dialog>
    </>
  );
};
