import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Mistri } from '../../types/mistri.types';
import { brandColors } from '../../theme/theme';

interface MistriRejectDialogProps {
  mistri: Mistri | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isPendingRegistration?: boolean;
}

export const MistriRejectDialog: React.FC<MistriRejectDialogProps> = ({
  mistri,
  open,
  onClose,
  onConfirm,
  isPendingRegistration = true,
}) => {
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!mistri) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onConfirm(reason.trim());
      setReason('');
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to reject and delete. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('');
      setErrorMessage(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="reject-dialog-title"
    >
      <DialogTitle id="reject-dialog-title" sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WarningAmberIcon sx={{ color: brandColors.error, fontSize: 30 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: brandColors.error }}>
              {isPendingRegistration ? 'Reject & Delete Registration' : 'Permanently Delete Profile'}
            </Typography>
            <Typography variant="caption" sx={{ color: brandColors.textSecondary }}>
              Mistri #{mistri.id}: {mistri.fullName} ({mistri.category})
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          <strong>Critical Warning:</strong> This operation is permanent and cannot be undone.
          {isPendingRegistration
            ? ' This registration will be permanently deleted from the database and associated media assets will be purged.'
            : ' This approved Mistri will be permanently removed from the public website and the database.'}
        </Alert>

        <DialogContentText sx={{ color: brandColors.textPrimary, mb: 2.5, fontSize: '0.9375rem' }}>
          Please confirm you want to permanently delete the profile of{' '}
          <strong>{mistri.fullName}</strong>.
        </DialogContentText>

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Rejection / Deletion Reason (Optional)"
          placeholder="e.g. Incomplete documentation, unreachable phone, duplicate registration..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={isSubmitting}
          helperText="Reason will be recorded for internal audit purposes"
        />

        {errorMessage && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
            {errorMessage}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={isSubmitting}
          variant="outlined"
          sx={{ borderColor: brandColors.borderDark, color: brandColors.textPrimary }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isSubmitting}
          variant="contained"
          sx={{
            backgroundColor: brandColors.error,
            color: brandColors.white,
            fontWeight: 700,
            '&:hover': { backgroundColor: '#b71c1c' },
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={20} color="inherit" />
          ) : isPendingRegistration ? (
            'Reject & Delete'
          ) : (
            'Permanently Delete'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
