import React, { useState } from 'react';
import { Alert, Box, Button, MenuItem, Snackbar, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { brandColors } from '../../theme/theme';
import { parseApiError } from '../../utils/error.utils';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { ErrorAlert } from '../common/ErrorAlert';
import { TableSkeleton } from '../common/LoadingSkeleton';
import type { ColumnDef, FieldDef, ResourceApiLike } from './resourceConfig';
import { ResourceFormDialog } from './ResourceFormDialog';
import { ResourceTable } from './ResourceTable';
import { useResourceList } from './useResourceList';

interface ResourcePageProps<T> {
  title: string;
  subtitle?: string;
  api: ResourceApiLike<T>;
  columns: ColumnDef<T>[];
  fields: FieldDef[];
  toFormValues: (row: T) => Record<string, any>;
  emptyFormValues: Record<string, any>;
  fixedParams?: Record<string, unknown>;
  /** Constant values merged into every create/update payload (e.g. a locked ad placement). */
  hiddenFormValues?: Record<string, unknown>;
  sortableKeys?: string[];
  defaultSortBy?: string;
  defaultSortOrder?: 'asc' | 'desc';
  pageSize?: number;
  searchPlaceholder?: string;
  createLabel?: string;
  singularLabel: string;
  rowId?: (row: T) => number;
  rowLabel?: (row: T) => string;
  extraActions?: (row: T) => React.ReactNode;
  readOnly?: boolean;
  /** Hide the "Add" button while still allowing edit/delete (e.g. records created elsewhere). */
  canCreate?: boolean;
  headerExtra?: React.ReactNode;
}

export function ResourcePage<T>({
  title,
  subtitle,
  api,
  columns,
  fields,
  toFormValues,
  emptyFormValues,
  fixedParams,
  hiddenFormValues,
  sortableKeys = [],
  defaultSortBy,
  defaultSortOrder = 'asc',
  pageSize = 10,
  searchPlaceholder = 'Search…',
  createLabel,
  singularLabel,
  rowId = (row) => (row as { id: number }).id,
  rowLabel,
  extraActions,
  readOnly = false,
  canCreate = true,
  headerExtra,
}: ResourcePageProps<T>) {
  const list = useResourceList<T>(api, { fixedParams, defaultSortBy, defaultSortOrder, pageSize });

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingRow, setEditingRow] = useState<T | null>(null);

  const [deleteRow, setDeleteRow] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const openCreate = () => {
    setFormMode('create');
    setEditingRow(null);
    setFormOpen(true);
  };

  const openEdit = (row: T) => {
    setFormMode('edit');
    setEditingRow(row);
    setFormOpen(true);
  };

  const handleSaved = (_row: T, mode: 'create' | 'edit') => {
    setToast({
      open: true,
      message: `${singularLabel} ${mode === 'create' ? 'created' : 'updated'}.`,
      severity: 'success',
    });
    list.refresh();
  };

  const confirmDelete = async () => {
    if (!deleteRow) return;
    setDeleting(true);
    try {
      await api.remove(rowId(deleteRow));
      setToast({ open: true, message: `${singularLabel} deleted.`, severity: 'success' });
      setDeleteRow(null);
      list.refresh();
    } catch (err) {
      setToast({ open: true, message: parseApiError(err).message, severity: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = list.search.trim() !== '' || list.statusFilter !== '';

  return (
    <Box>
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
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: brandColors.textSecondary, mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={list.refresh}
            disabled={list.isLoading}
            sx={{ borderColor: brandColors.borderDark, color: brandColors.textPrimary, backgroundColor: brandColors.white }}
          >
            Refresh
          </Button>
          {!readOnly && canCreate && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={openCreate}
              sx={{ backgroundColor: brandColors.mustard, color: brandColors.black }}
            >
              {createLabel ?? `Add ${singularLabel}`}
            </Button>
          )}
        </Stack>
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ mb: 2, alignItems: { sm: 'center' } }}
      >
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={list.search}
          onChange={(event) => list.setSearch(event.target.value)}
          sx={{ minWidth: 260, backgroundColor: brandColors.white }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={list.statusFilter}
          onChange={(event) => list.setStatusFilter(event.target.value as '' | 'ACTIVE' | 'INACTIVE')}
          sx={{ minWidth: 150, backgroundColor: brandColors.white }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="ACTIVE">Active</MenuItem>
          <MenuItem value="INACTIVE">Inactive</MenuItem>
        </TextField>
        {headerExtra}
      </Stack>

      {list.error && (
        <ErrorAlert
          title={`Could not load ${title}`}
          message={list.error.message}
          isNetworkError={list.error.isNetworkError}
          onRetry={list.refresh}
        />
      )}

      {list.isLoading && <TableSkeleton rows={pageSize} columns={columns.length + 1} />}

      {!list.isLoading && !list.error && (
        list.rows.length === 0 ? (
          <EmptyState
            title={`No ${title} found`}
            description={
              hasFilters
                ? 'Nothing matches your current search or filter.'
                : `Nothing here yet. Use “${createLabel ?? `Add ${singularLabel}`}” to create the first one.`
            }
            actionText={hasFilters ? 'Clear filters' : undefined}
            onAction={
              hasFilters
                ? () => {
                    list.setSearch('');
                    list.setStatusFilter('');
                  }
                : undefined
            }
          />
        ) : (
          <ResourceTable<T>
            rows={list.rows}
            columns={columns}
            page={list.page}
            pageSize={list.pageSize}
            total={list.total}
            totalPages={list.totalPages}
            sortBy={list.sortBy}
            sortOrder={list.sortOrder}
            sortableKeys={sortableKeys}
            onSort={list.setSort}
            onPageChange={list.setPage}
            onEdit={readOnly ? undefined : openEdit}
            onDelete={readOnly ? undefined : setDeleteRow}
            extraActions={extraActions}
            rowId={rowId}
          />
        )
      )}

      {formOpen && (
        <ResourceFormDialog<T>
          open={formOpen}
          mode={formMode}
          title={formMode === 'create' ? `New ${singularLabel}` : `Edit ${singularLabel}`}
          fields={fields}
          values={editingRow ? toFormValues(editingRow) : emptyFormValues}
          editingId={editingRow ? rowId(editingRow) : undefined}
          api={api}
          hiddenValues={hiddenFormValues}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteRow)}
        title={`Delete ${singularLabel}`}
        message={
          deleteRow
            ? `Permanently delete “${rowLabel ? rowLabel(deleteRow) : `#${rowId(deleteRow)}`}”? This cannot be undone.`
            : ''
        }
        confirmText="Delete"
        severity="error"
        isLoading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteRow(null)}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((prev) => ({ ...prev, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
