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
import VerifiedIcon from '@mui/icons-material/Verified';
import { mistrisApi } from '../api/mistris.api';
import { Mistri, MistriQueryParams } from '../types/mistri.types';
import { MistriFilters } from '../components/mistris/MistriFilters';
import { MistriTable } from '../components/mistris/MistriTable';
import { MistriCardsMobile } from '../components/mistris/MistriCardsMobile';
import { MistriDetailsDialog } from '../components/mistris/MistriDetailsDialog';
import { MistriEditDialog } from '../components/mistris/MistriEditDialog';
import { MistriRejectDialog } from '../components/mistris/MistriRejectDialog';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { EmptyState } from '../components/common/EmptyState';
import { parseApiError } from '../utils/error.utils';
import { brandColors } from '../theme/theme';

export const ApprovedMistrisPage: React.FC = () => {
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
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  // Toast feedback
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const fetchApprovedMistris = useCallback(async () => {
    setIsLoading(true);
    setErrorInfo(null);

    const queryParams: MistriQueryParams = {
      status: 'APPROVED',
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
    fetchApprovedMistris();
  }, [fetchApprovedMistris]);

  const handleResetFilters = () => {
    setSearch('');
    setStateFilter('');
    setCityFilter('');
    setCategoryFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  // Delete Profile Handlers
  const handleDeleteClick = (mistri: Mistri) => {
    setSelectedMistri(mistri);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async (reason: string) => {
    if (!selectedMistri) return;
    try {
      await mistrisApi.rejectAndDeleteMistri(selectedMistri.id, { reason });
      setToast({
        open: true,
        message: `Approved profile for #${selectedMistri.id} (${selectedMistri.fullName}) was permanently deleted.`,
        severity: 'success',
      });
      setMistris((prev) => prev.filter((m) => m.id !== selectedMistri.id));
      setTotal((prev) => Math.max(0, prev - 1));
      fetchApprovedMistris();
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
      message: `Profile #${updated.id} (${updated.fullName}) updated successfully.`,
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
      {/* Page Header */}
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
              Approved Mistris
            </Typography>
            <Box
              sx={{
                px: 1.25,
                py: 0.25,
                borderRadius: '4px',
                backgroundColor: '#F0FDF4',
                color: '#16A34A',
                fontWeight: 700,
                fontSize: '0.8125rem',
              }}
            >
              {total} Live
            </Box>
          </Box>
          <Typography variant="body2" sx={{ color: brandColors.textSecondary, mt: 0.5 }}>
            Manage verified tradespersons who are currently published on the public MistriKhoj portal.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchApprovedMistris}
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

      {/* Error State */}
      {errorInfo && (
        <ErrorAlert
          title="Could Not Load Approved Mistris"
          message={errorInfo.message}
          isNetworkError={errorInfo.isNetworkError}
          onRetry={fetchApprovedMistris}
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
              icon={<VerifiedIcon sx={{ fontSize: 36 }} />}
              title="No Approved Mistris Found"
              description={
                search || stateFilter || cityFilter || categoryFilter
                  ? 'No approved Mistris match your search or filter options.'
                  : 'There are currently no approved Mistris on the platform. Review pending applications to approve profiles.'
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
              onRejectOrDelete={handleDeleteClick}
              isPendingTable={false}
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
              onRejectOrDelete={handleDeleteClick}
              isPendingTable={false}
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
        onRejectOrDelete={handleDeleteClick}
      />

      {/* Edit Dialog */}
      <MistriEditDialog
        mistri={selectedMistri}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={handleEditSuccess}
      />

      {/* Permanent Delete Dialog */}
      <MistriRejectDialog
        mistri={selectedMistri}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        isPendingRegistration={false}
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
