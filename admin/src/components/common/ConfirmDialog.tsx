import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Box,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { brandColors } from '../../theme/theme';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  severity?: 'primary' | 'success' | 'error' | 'warning';
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  severity = 'primary',
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  const isDanger = severity === 'error';
  const isWarning = severity === 'warning';
  const isSuccess = severity === 'success';

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="confirm-dialog-title"
    >
      <DialogTitle id="confirm-dialog-title" sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {isDanger || isWarning ? (
            <WarningAmberIcon
              sx={{ color: isDanger ? brandColors.error : brandColors.warning, fontSize: 28 }}
            />
          ) : isSuccess ? (
            <CheckCircleIcon sx={{ color: brandColors.success, fontSize: 28 }} />
          ) : null}
          <Box sx={{ fontWeight: 700, fontSize: '1.125rem' }}>{title}</Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        {typeof message === 'string' ? (
          <DialogContentText sx={{ color: brandColors.textSecondary, fontSize: '0.9375rem' }}>
            {message}
          </DialogContentText>
        ) : (
          message
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={isLoading}
          variant="outlined"
          sx={{
            borderColor: brandColors.borderDark,
            color: brandColors.textPrimary,
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          variant="contained"
          sx={{
            backgroundColor: isDanger
              ? brandColors.error
              : isSuccess
              ? brandColors.success
              : isWarning
              ? brandColors.mustard
              : brandColors.black,
            color: isWarning ? brandColors.black : brandColors.white,
            '&:hover': {
              backgroundColor: isDanger
                ? '#b71c1c'
                : isSuccess
                ? '#14632e'
                : isWarning
                ? brandColors.mustardDark
                : brandColors.blackLight,
            },
          }}
        >
          {isLoading ? <CircularProgress size={20} color="inherit" /> : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
