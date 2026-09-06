import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  Tooltip,
  TablePagination,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { Mistri } from '../../types/mistri.types';
import { SafeImage } from '../common/SafeImage';
import { formatDateOnly, formatExperience, formatPhoneNumber } from '../../utils/format.utils';
import { brandColors } from '../../theme/theme';

interface MistriTableProps {
  mistris: Mistri[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
  onView: (mistri: Mistri) => void;
  onEdit: (mistri: Mistri) => void;
  onApprove?: (mistri: Mistri) => void;
  onRejectOrDelete: (mistri: Mistri) => void;
  isPendingTable?: boolean;
}

export const MistriTable: React.FC<MistriTableProps> = ({
  mistris,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onView,
  onEdit,
  onApprove,
  onRejectOrDelete,
  isPendingTable = false,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '4px',
        border: `1px solid ${brandColors.border}`,
        overflow: 'hidden',
        backgroundColor: brandColors.white,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      <TableContainer sx={{ maxHeight: 720 }}>
        <Table stickyHeader aria-label="Mistri registrations table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 80 }}>ID</TableCell>
              <TableCell sx={{ width: 80 }}>Photo</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Primary Phone</TableCell>
              <TableCell>State</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Experience</TableCell>
              <TableCell>Registration Date</TableCell>
              <TableCell align="right" sx={{ pr: 3 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mistris.map((mistri) => (
              <TableRow key={mistri.id} hover>
                <TableCell>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      backgroundColor: '#F3F4F6',
                      px: 1,
                      py: 0.5,
                      borderRadius: '4px',
                      color: '#374151',
                    }}
                  >
                    #{mistri.id}
                  </Typography>
                </TableCell>

                <TableCell>
                  <SafeImage
                    src={mistri.profilePhotoUrl}
                    alt={mistri.fullName}
                    width={40}
                    height={40}
                    borderRadius={1}
                    isAvatar
                    onClick={() => onView(mistri)}
                  />
                </TableCell>

                <TableCell>
                  <Box>
                    <Typography
                      variant="body2"
                      onClick={() => onView(mistri)}
                      sx={{
                        fontWeight: 700,
                        color: brandColors.textPrimary,
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      {mistri.fullName}
                    </Typography>
                    {mistri.referralCode && (
                      <Typography
                        variant="caption"
                        sx={{ color: brandColors.textSecondary, display: 'block', fontSize: '0.6875rem' }}
                      >
                        Ref: {mistri.referralCode}
                      </Typography>
                    )}
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {formatPhoneNumber(mistri.primaryPhone)}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">{mistri.state || '—'}</Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">{mistri.city || '—'}</Typography>
                </TableCell>

                <TableCell>
                  <Box
                    component="span"
                    sx={{
                      px: 1,
                      py: 0.5,
                      backgroundColor: '#F3F4F6',
                      borderRadius: '4px',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: '#4B5563',
                      textTransform: 'uppercase',
                      display: 'inline-block',
                    }}
                  >
                    {mistri.category}
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" sx={{ color: '#4B5563', fontSize: '0.8125rem' }}>
                    {formatExperience(mistri.experienceYears)}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>
                    {formatDateOnly(mistri.createdAt)}
                  </Typography>
                </TableCell>

                <TableCell align="right" sx={{ pr: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                    <Button
                      size="small"
                      onClick={() => onView(mistri)}
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        backgroundColor: brandColors.mustard,
                        color: brandColors.black,
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                        minWidth: 0,
                        '&:hover': {
                          backgroundColor: brandColors.mustardDark,
                        },
                      }}
                    >
                      Review
                    </Button>

                    <Tooltip title="Edit Registration">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(mistri)}
                        sx={{
                          color: '#6B7280',
                          p: 0.75,
                          '&:hover': { color: brandColors.black, backgroundColor: '#F3F4F6' },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {isPendingTable && onApprove && (
                      <Tooltip title="Approve Registration">
                        <IconButton
                          size="small"
                          onClick={() => onApprove(mistri)}
                          sx={{
                            color: brandColors.success,
                            p: 0.75,
                            '&:hover': { backgroundColor: brandColors.successLight },
                          }}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    <Tooltip title={isPendingTable ? 'Reject & Delete Registration' : 'Permanently Delete Profile'}>
                      <IconButton
                        size="small"
                        onClick={() => onRejectOrDelete(mistri)}
                        sx={{
                          color: brandColors.error,
                          p: 0.75,
                          '&:hover': { backgroundColor: brandColors.errorLight },
                        }}
                      >
                        <DeleteForeverIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={total}
        rowsPerPage={pageSize}
        page={page - 1}
        onPageChange={(_, newPage) => onPageChange(newPage + 1)}
        onRowsPerPageChange={(e) => {
          onPageSizeChange(parseInt(e.target.value, 10));
          onPageChange(1);
        }}
        sx={{
          borderTop: `1px solid ${brandColors.border}`,
          backgroundColor: brandColors.warmWhiteDarker,
        }}
      />
    </Paper>
  );
};
