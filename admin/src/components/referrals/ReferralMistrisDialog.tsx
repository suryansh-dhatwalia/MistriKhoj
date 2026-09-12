import React, { useEffect, useState } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { referralExtrasApi } from '../../api/content.api';
import type { ReferralItem, ReferralMistriRow } from '../../types/content.types';
import { parseApiError } from '../../utils/error.utils';
import { formatDateOnly, formatPhoneNumber } from '../../utils/format.utils';
import { EmptyState } from '../common/EmptyState';
import { brandColors } from '../../theme/theme';

interface ReferralMistrisDialogProps {
  referral: ReferralItem | null;
  open: boolean;
  onClose: () => void;
}

export const ReferralMistrisDialog: React.FC<ReferralMistrisDialogProps> = ({ referral, open, onClose }) => {
  const [rows, setRows] = useState<ReferralMistriRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !referral) return;
    let active = true;
    setLoading(true);
    setError(null);
    referralExtrasApi
      .mistris(referral.id, { pageSize: 100 })
      .then((response) => {
        if (!active) return;
        setRows(response.data);
        setTotal(response.total);
      })
      .catch((err) => active && setError(parseApiError(err).message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [open, referral]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
        <span>
          Registrations via {referral?.code}
          {referral ? ` — ${referral.name}` : ''}
        </span>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        )}
        {!loading && error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
        {!loading && !error && rows.length === 0 && (
          <EmptyState title="No registrations yet" description="No Mistri has registered with this referral code." />
        )}
        {!loading && !error && rows.length > 0 && (
          <>
            <Typography variant="body2" sx={{ color: brandColors.textSecondary, mb: 1.5 }}>
              {total} registration{total === 1 ? '' : 's'}
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Registered</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell sx={{ fontWeight: 600 }}>{row.fullName}</TableCell>
                    <TableCell>{formatPhoneNumber(row.primaryPhone)}</TableCell>
                    <TableCell>{[row.city, row.state].filter(Boolean).join(', ')}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.status}
                        sx={{
                          backgroundColor: row.status === 'APPROVED' ? '#F0FDF4' : '#FFFBEB',
                          color: row.status === 'APPROVED' ? '#16A34A' : '#D97706',
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
                    <TableCell>{formatDateOnly(row.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
