import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { mistrisApi } from '../api/mistris.api';
import { Mistri, MistriQueryParams } from '../types/mistri.types';
import { MistriFilters } from '../components/mistris/MistriFilters';
import { MistriTable } from '../components/mistris/MistriTable';
import { MistriCardsMobile } from '../components/mistris/MistriCardsMobile';
import { MistriDetailsDialog } from '../components/mistris/MistriDetailsDialog';
import { MistriEditDialog } from '../components/mistris/MistriEditDialog';
import { MistriRejectDialog } from '../components/mistris/MistriRejectDialog';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { EmptyState } from '../components/common/EmptyState';
import { parseApiError } from '../utils/error.utils';
import { brandColors } from '../theme/theme';

export const PendingMistrisPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Data states
  const [mistris, setMistris] = useState<Mistri[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorInfo, setErrorInfo] = useState<{ message: string; isNetworkError: boolean } | null>(null);

  // Filter & Pagination states
  const [search, setSearch] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'experienceYears' | 'fullName' | 'id'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Filter options discovered from data
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Dialog states
  const [selectedMistri, setSelectedMistri] = useState<Mistri | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [rejectOpen, setRejectOpen] = useState<boolean>(false);
  const [approveConfirmOpen, setApproveConfirmOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Toast notifications
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const fetchPendingMistris = useCallback(async () => {
    setIsLoading(true);
    setErrorInfo(null);

    const queryParams: MistriQueryParams = {
      status: 'PENDING',
      page,
      pageSize,
      search: search.trim() || undefined,
      state: stateFilter || undefined,
      city: cityFilter.trim() || undefined,
      category: categoryFilter || undefined,
      sortBy,
      sortOrder,
    };

    try {
      const response = await mistrisApi.getMistris(queryParams);
      setMistris(response.data);
      setTotal(response.total);

      // Collect states & categories for filter menus
      if (response.data.length > 0) {
        setAvailableStates((prev) => {
          const set = new Set([...prev, ...response.data.map((m) => m.state).filter(Boolean)]);
          return Array.from(set);
        });
        setAvailableCategories((prev) => {
          const set = new Set([...prev, ...response.data.map((m) => m.category).filter(Boolean)]);
          return Array.from(set);
        });
      }
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorInfo({ message: parsed.message, isNetworkError: parsed.isNetworkError });
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, stateFilter, cityFilter, categoryFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchPendingMistris();
  }, [fetchPendingMistris]);

  const handleResetFilters = () => {
    setSearch('');
    setStateFilter('');
    setCityFilter('');
    setCategoryFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  // Approval Handlers
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
        message: `Mistri #${selectedMistri.id} (${selectedMistri.fullName}) approved successfully. Profile is now published.`,
        severity: 'success',
      });
      setApproveConfirmOpen(false);
      // Remove from list & update total
      setMistris((prev) => prev.filter((m) => m.id !== selectedMistri.id));
      setTotal((prev) => Math.max(0, prev - 1));
      fetchPendingMistris();
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

  // Reject and Delete Handlers
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
        message: `Registration #${selectedMistri.id} (${selectedMistri.fullName}) was rejected and permanently deleted.`,
        severity: 'success',
      });
      setMistris((prev) => prev.filter((m) => m.id !== selectedMistri.id));
      setTotal((prev) => Math.max(0, prev - 1));
      fetchPendingMistris();
    } catch (err) {
      const parsed = parseApiError(err);
      throw new Error(parsed.message);
    }
  };

  const handleEditClick = (mistri: Mistri) => {
    setSelectedMistri(mistri);
    setEditOpen(true);
  };

  const handleEditSuccess = (updated: Mistri) => {
    setToast({
      open: true,
      message: `Registration for #${updated.id} (${updated.fullName}) updated successfully.`,
      severity: 'success',
    });
    setMistris((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleViewClick = (mistri: Mistri) => {
    setSelectedMistri(mistri);
    setDetailsOpen(true);
  };

  return (
    <Box>
      {/* Header */}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: brandColors.textPrimary }}>
              Pending Registrations
            </Typography>
            <Box
              sx={{
                px: 1.25,
                py: 0.25,
                borderRadius: '4px',
                backgroundColor: brandColors.mustardLight,
                color: brandColors.mustardDark,
                fontWeight: 700,
                fontSize: '0.8125rem',
              }}
            >
              {total} Pending
            </Box>
          </Box>
          <Typography variant="body2" sx={{ color: brandColors.textSecondary, mt: 0.5 }}>
            Review new tradesperson applications, verify credentials, and approve or reject & delete records.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchPendingMistris}
          disabled={isLoading}
          sx={{
            borderColor: brandColors.borderDark,
            color: brandColors.textPrimary,
            backgroundColor: brandColors.white,
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Filters */}
      <MistriFilters
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        stateFilter={stateFilter}
        onStateChange={(val) => {
          setStateFilter(val);
          setPage(1);
        }}
        cityFilter={cityFilter}
        onCityChange={(val) => {
          setCityFilter(val);
          setPage(1);
        }}
        categoryFilter={categoryFilter}
        onCategoryChange={(val) => {
          setCategoryFilter(val);
          setPage(1);
        }}
        sortBy={sortBy}
        onSortByChange={(val) => {
          setSortBy(val);
          setPage(1);
        }}
        sortOrder={sortOrder}
        onSortOrderChange={(val) => {
          setSortOrder(val);
          setPage(1);
        }}
        onReset={handleResetFilters}
        availableStates={availableStates}
        availableCategories={availableCategories}
      />

      {/* Error state */}
      {errorInfo && (
        <ErrorAlert
          title="Could Not Load Pending Registrations"
          message={errorInfo.message}
          isNetworkError={errorInfo.isNetworkError}
          onRetry={fetchPendingMistris}
        />
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <TableSkeleton rows={pageSize} columns={10} />
      )}

      {/* Table / Cards */}
      {!isLoading && !errorInfo && (
        <>
          {mistris.length === 0 ? (
            <EmptyState
              icon={<PendingActionsIcon sx={{ fontSize: 36 }} />}
              title="No Pending Registrations Found"
              description={
                search || stateFilter || cityFilter || categoryFilter
                  ? 'No pending registrations matched your filter criteria. Try clearing some filters.'
                  : 'All tradesperson applications have been reviewed. New submissions from the public website will show up here.'
              }
              actionText={
                search || stateFilter || cityFilter || categoryFilter ? 'Clear All Filters' : undefined
              }
              onAction={handleResetFilters}
            />
          ) : isMobile ? (
            <MistriCardsMobile
              mistris={mistris}
              total={total}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onView={handleViewClick}
              onEdit={handleEditClick}
              onApprove={handleApproveClick}
              onRejectOrDelete={handleRejectClick}
              isPendingTable={true}
            />
          ) : (
            <MistriTable
              mistris={mistris}
              total={total}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              onView={handleViewClick}
              onEdit={handleEditClick}
              onApprove={handleApproveClick}
              onRejectOrDelete={handleRejectClick}
              isPendingTable={true}
            />
          )}
        </>
      )}

      {/* Details Dialog */}
      <MistriDetailsDialog
        mistri={selectedMistri}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onEdit={handleEditClick}
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

      {/* Reject & Delete Warning Dialog */}
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
        title="Approve Registration"
        message={
          selectedMistri ? (
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Are you sure you want to approve registration for{' '}
                <strong>{selectedMistri.fullName}</strong> (#{selectedMistri.id})?
              </Typography>
              <Typography variant="caption" sx={{ color: brandColors.textSecondary, display: 'block' }}>
                Upon approval, this profile will immediately be visible on the public MistriKhoj website.
              </Typography>
              {selectedMistri.plan === 'PAID' && (
                <Typography
                  variant="caption"
                  sx={{ color: brandColors.mustardDark, fontWeight: 700, display: 'block', mt: 1 }}
                >
                  This applicant chose the Paid plan — approving locks the 1-year top slot for{' '}
                  {selectedMistri.city} / {selectedMistri.category}. If that slot is already held,
                  approval is blocked and you can switch them to Free first.
                </Typography>
              )}
            </Box>
          ) : (
            ''
          )
        }
        confirmText="Approve Registration"
        cancelText="Cancel"
        severity="success"
        isLoading={actionLoading}
        onConfirm={handleConfirmApprove}
        onClose={() => setApproveConfirmOpen(false)}
      />

      {/* Snackbar feedback */}
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
