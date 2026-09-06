import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import VerifiedIcon from '@mui/icons-material/Verified';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import TodayIcon from '@mui/icons-material/Today';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../api/dashboard.api';
import { mistrisApi } from '../api/mistris.api';
import { DashboardStatistics } from '../types/api.types';
import { Mistri } from '../types/mistri.types';
import { CardGridSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { EmptyState } from '../components/common/EmptyState';
import { SafeImage } from '../components/common/SafeImage';
import { MistriDetailsDialog } from '../components/mistris/MistriDetailsDialog';
import { MistriEditDialog } from '../components/mistris/MistriEditDialog';
import { MistriRejectDialog } from '../components/mistris/MistriRejectDialog';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { formatDateOnly, formatPhoneNumber, formatExperience } from '../utils/format.utils';
import { parseApiError } from '../utils/error.utils';
import { brandColors } from '../theme/theme';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorInfo, setErrorInfo] = useState<{ message: string; isNetworkError: boolean } | null>(null);

  // Dialog states for recent pending items
  const [selectedMistri, setSelectedMistri] = useState<Mistri | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [rejectOpen, setRejectOpen] = useState<boolean>(false);
  const [approveConfirmOpen, setApproveConfirmOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Notifications
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setErrorInfo(null);
    try {
      const data = await dashboardApi.getStatistics();
      setStats(data);
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorInfo({ message: parsed.message, isNetworkError: parsed.isNetworkError });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handlers for approval
  const handleApproveClick = (mistri: Mistri) => {
    setSelectedMistri(mistri);
    setApproveConfirmOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedMistri) return;
    setActionLoading(true);
    try {
      await mistrisApi.approveMistri(selectedMistri.id);
      setToast({
        open: true,
        message: `Successfully approved Mistri #${selectedMistri.id} (${selectedMistri.fullName}). Record is now public.`,
        severity: 'success',
      });
      setApproveConfirmOpen(false);
      fetchDashboardData();
    } catch (err) {
      const parsed = parseApiError(err);
      setToast({
        open: true,
        message: parsed.message || 'Failed to approve registration.',
        severity: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handlers for reject & delete
  const handleRejectClick = (mistri: Mistri) => {
    setSelectedMistri(mistri);
    setRejectOpen(true);
  };

  const handleConfirmReject = async (reason: string) => {
    if (!selectedMistri) return;
    try {
      await mistrisApi.rejectAndDeleteMistri(selectedMistri.id, { reason });
      setToast({
        open: true,
        message: `Mistri #${selectedMistri.id} (${selectedMistri.fullName}) was rejected and permanently deleted.`,
        severity: 'success',
      });
      fetchDashboardData();
    } catch (err) {
      const parsed = parseApiError(err);
      throw new Error(parsed.message);
    }
  };

  const handleEditSuccess = (updated: Mistri) => {
    setToast({
      open: true,
      message: `Updated registration for #${updated.id} (${updated.fullName}) successfully.`,
      severity: 'success',
    });
    fetchDashboardData();
  };

  return (
    <Box>
      {/* Top Header Section: Title, Subtitle, Refresh button */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: brandColors.textPrimary }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body2" sx={{ color: brandColors.textSecondary, mt: 0.5 }}>
            Real-time status of Mistri registrations, platform statistics, and pending approvals
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
          disabled={isLoading}
          sx={{
            borderColor: brandColors.borderDark,
            color: brandColors.textPrimary,
            backgroundColor: brandColors.white,
          }}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Error State with Retry Button */}
      {errorInfo && (
        <ErrorAlert
          title="Dashboard Statistics Unavailable"
          message={errorInfo.message}
          isNetworkError={errorInfo.isNetworkError}
          onRetry={fetchDashboardData}
        />
      )}

      {/* Loading Skeletons */}
      {isLoading && !stats && (
        <Box sx={{ mb: 4 }}>
          <CardGridSkeleton count={4} />
        </Box>
      )}

      {/* Statistics Cards */}
      {stats && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Pending Registrations Card */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '4px',
                  border: `1px solid ${brandColors.border}`,
                  backgroundColor: brandColors.white,
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    mb: 1.5,
                  }}
                >
                  Pending Review
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <Typography
                    sx={{
                      fontSize: '1.875rem', // text-3xl
                      fontWeight: 900,
                      color: brandColors.textPrimary,
                      lineHeight: 1,
                    }}
                  >
                    {stats.pendingRegistrations}
                  </Typography>
                  <Box
                    component="span"
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: brandColors.mustardDark,
                      px: 1,
                      py: 0.5,
                      backgroundColor: brandColors.mustardLight,
                      borderRadius: '4px',
                    }}
                  >
                    Action Required
                  </Box>
                </Box>
              </Card>
            </Grid>

            {/* Approved Mistris Card */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '4px',
                  border: `1px solid ${brandColors.border}`,
                  backgroundColor: brandColors.white,
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    mb: 1.5,
                  }}
                >
                  Approved Mistris
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <Typography
                    sx={{
                      fontSize: '1.875rem',
                      fontWeight: 900,
                      color: brandColors.textPrimary,
                      lineHeight: 1,
                    }}
                  >
                    {stats.approvedMistris.toLocaleString()}
                  </Typography>
                  <Box
                    component="span"
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#16A34A',
                      px: 1,
                      py: 0.5,
                      backgroundColor: '#F0FDF4',
                      borderRadius: '4px',
                    }}
                  >
                    Live Directory
                  </Box>
                </Box>
              </Card>
            </Grid>

            {/* Total Registrations Card */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '4px',
                  border: `1px solid ${brandColors.border}`,
                  backgroundColor: brandColors.white,
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    mb: 1.5,
                  }}
                >
                  Total Registrations
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <Typography
                    sx={{
                      fontSize: '1.875rem',
                      fontWeight: 900,
                      color: brandColors.textPrimary,
                      lineHeight: 1,
                    }}
                  >
                    {stats.totalMistris.toLocaleString()}
                  </Typography>
                  <Box
                    component="span"
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#2563EB',
                      px: 1,
                      py: 0.5,
                      backgroundColor: '#EFF6FF',
                      borderRadius: '4px',
                    }}
                  >
                    All Time
                  </Box>
                </Box>
              </Card>
            </Grid>

            {/* Registrations Today Card */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '4px',
                  border: `1px solid ${brandColors.border}`,
                  backgroundColor: brandColors.white,
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    mb: 1.5,
                  }}
                >
                  Received Today
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <Typography
                    sx={{
                      fontSize: '1.875rem',
                      fontWeight: 900,
                      color: brandColors.textPrimary,
                      lineHeight: 1,
                    }}
                  >
                    {stats.todayRegistrations}
                  </Typography>
                  <Box
                    component="span"
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#6B7280',
                      px: 1,
                      py: 0.5,
                      backgroundColor: '#F3F4F6',
                      borderRadius: '4px',
                    }}
                  >
                    Today
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>

          {/* Quick Review Banner for Pending registrations */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: '4px',
              border: `1px solid ${brandColors.border}`,
              backgroundColor: brandColors.white,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: brandColors.textPrimary }}>
                {stats.pendingRegistrations > 0
                  ? `${stats.pendingRegistrations} Pending Registrations Awaiting Approval`
                  : 'All registrations have been reviewed'}
              </Typography>
              <Typography variant="body2" sx={{ color: brandColors.textSecondary, mt: 0.5 }}>
                {stats.pendingRegistrations > 0
                  ? 'Verify identity, trades, and credentials before approving them to appear on the public directory.'
                  : 'New registrations submitted by Mistris on the public website will appear here for review.'}
              </Typography>
            </Box>

            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/mistris/pending')}
              sx={{
                backgroundColor: brandColors.mustard,
                color: brandColors.black,
                fontWeight: 700,
                flexShrink: 0,
                borderRadius: '4px',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '0.025em',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                '&:hover': {
                  backgroundColor: brandColors.mustardDark,
                },
              }}
            >
              Review Pending Mistris
            </Button>
          </Paper>

          {/* Recent Pending Registrations Card with Geometric Header */}
          <Box sx={{ mb: 4 }}>
            {stats.recentPending && stats.recentPending.length > 0 ? (
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  borderRadius: '4px',
                  border: `1px solid ${brandColors.border}`,
                  overflow: 'hidden',
                  backgroundColor: brandColors.white,
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                }}
              >
                {/* Header bar matching Geometric Balance */}
                <Box
                  sx={{
                    px: 3,
                    py: 2,
                    borderBottom: `1px solid ${brandColors.borderLight}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'rgba(249, 250, 251, 0.6)',
                  }}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: brandColors.textPrimary }}>
                    Recent Pending Registrations
                  </Typography>
                  <Typography
                    onClick={() => navigate('/mistris/pending')}
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: brandColors.mustardDark,
                      textTransform: 'uppercase',
                      letterSpacing: '0.025em',
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    View All Pending →
                  </Typography>
                </Box>

                <Table aria-label="Recent registrations table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 70 }}>ID</TableCell>
                      <TableCell sx={{ width: 70 }}>Photo</TableCell>
                      <TableCell>Full Name</TableCell>
                      <TableCell>Primary Phone</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Experience</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentPending.map((mistri) => (
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
                            width={38}
                            height={38}
                            borderRadius={1}
                            isAvatar
                            onClick={() => {
                              setSelectedMistri(mistri);
                              setDetailsOpen(true);
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                            onClick={() => {
                              setSelectedMistri(mistri);
                              setDetailsOpen(true);
                            }}
                          >
                            {mistri.fullName}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#4B5563' }}>
                            {formatPhoneNumber(mistri.primaryPhone)}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#4B5563', fontSize: '0.8125rem' }}>
                            {[mistri.city, mistri.state].filter(Boolean).join(', ') || '—'}
                          </Typography>
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

                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                            <Button
                              size="small"
                              onClick={() => {
                                setSelectedMistri(mistri);
                                setDetailsOpen(true);
                              }}
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
                            <Tooltip title="Approve">
                              <IconButton
                                size="small"
                                onClick={() => handleApproveClick(mistri)}
                                sx={{ color: brandColors.success, p: 0.75 }}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject & Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleRejectClick(mistri)}
                                sx={{ color: brandColors.error, p: 0.75 }}
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
            ) : (
              <EmptyState
                title="No Pending Registrations"
                description="There are currently no registrations awaiting approval. New applications will appear here."
              />
            )}
          </Box>
        </>
      )}

      {/* Details Dialog */}
      <MistriDetailsDialog
        mistri={selectedMistri}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onEdit={(m) => {
          setSelectedMistri(m);
          setEditOpen(true);
        }}
        onApprove={handleApproveClick}
        onRejectOrDelete={handleRejectClick}
      />

      {/* Edit Dialog */}
      <MistriEditDialog
        mistri={selectedMistri}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={handleEditSuccess}
      />

      {/* Reject & Delete Dialog */}
      <MistriRejectDialog
        mistri={selectedMistri}
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleConfirmReject}
        isPendingRegistration={true}
      />

      {/* Approve Confirmation Dialog */}
      <ConfirmDialog
        open={approveConfirmOpen}
        title="Approve Mistri Registration"
        message={
          selectedMistri ? (
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Are you sure you want to approve registration for{' '}
                <strong>{selectedMistri.fullName}</strong> (#{selectedMistri.id})?
              </Typography>
              <Typography variant="caption" sx={{ color: brandColors.textSecondary, display: 'block' }}>
                This tradesperson will immediately become visible on the public website at{' '}
                <code>http://localhost:5173</code>.
              </Typography>
            </Box>
          ) : (
            ''
          )
        }
        confirmText="Approve Mistri"
        cancelText="Cancel"
        severity="success"
        isLoading={actionLoading}
        onConfirm={handleConfirmApprove}
        onClose={() => setApproveConfirmOpen(false)}
      />

      {/* Snackbar notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
