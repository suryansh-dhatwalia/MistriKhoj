import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { auditApi } from '../api/content.api';
import type { AuditLogItem } from '../types/content.types';
import { parseApiError } from '../utils/error.utils';
import { formatDate } from '../utils/format.utils';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { brandColors } from '../theme/theme';

const PAGE_SIZE = 20;

export const AuditLogPage: React.FC = () => {
  const [rows, setRows] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [filters, setFilters] = useState<{ actions: string[]; entityTypes: string[] }>({
    actions: [],
    entityTypes: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; isNetworkError: boolean } | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    auditApi
      .list({ page, pageSize: PAGE_SIZE, action: action || undefined, entityType: entityType || undefined })
      .then((response) => {
        if (!active) return;
        setRows(response.data);
        setTotal(response.total);
        setFilters(response.filters);
      })
      .catch((err) => {
        if (!active) return;
        const parsed = parseApiError(err);
        setError({ message: parsed.message, isNetworkError: parsed.isNetworkError });
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [page, action, entityType]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Audit Log
          </Typography>
          <Typography variant="body2" sx={{ color: brandColors.textSecondary, mt: 0.5 }}>
            Every create, update, approval and deletion made through the admin dashboard.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => setPage((value) => value)}
          sx={{ borderColor: brandColors.borderDark, color: brandColors.textPrimary, backgroundColor: brandColors.white }}
        >
          Refresh
        </Button>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          select
          size="small"
          label="Action"
          value={action}
          onChange={(event) => {
            setAction(event.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 220, backgroundColor: brandColors.white }}
        >
          <MenuItem value="">All actions</MenuItem>
          {filters.actions.map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Entity"
          value={entityType}
          onChange={(event) => {
            setEntityType(event.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 200, backgroundColor: brandColors.white }}
        >
          <MenuItem value="">All entities</MenuItem>
          {filters.entityTypes.map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {error && <ErrorAlert title="Could not load audit log" message={error.message} isNetworkError={error.isNetworkError} onRetry={() => setPage((value) => value)} />}
      {loading && <TableSkeleton rows={10} columns={5} />}

      {!loading && !error && rows.length === 0 && (
        <EmptyState title="No audit entries" description="Nothing matches these filters yet." />
      )}

      {!loading && !error && rows.length > 0 && (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '6px', border: `1px solid ${brandColors.border}` }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>When</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Entity</TableCell>
                <TableCell>ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap', color: brandColors.textSecondary }}>{formatDate(row.createdAt)}</TableCell>
                  <TableCell>{row.admin?.name ?? '—'}</TableCell>
                  <TableCell>
                    <Chip size="small" label={row.action} sx={{ fontFamily: 'monospace', fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>{row.entityType ?? '—'}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{row.entityId ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2, borderTop: `1px solid ${brandColors.borderLight}` }}>
            <Typography variant="body2" sx={{ color: brandColors.textSecondary }}>
              Page {page} of {totalPages} · {total} entries
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} sx={{ borderColor: brandColors.borderDark, color: brandColors.textPrimary }}>
                Previous
              </Button>
              <Button size="small" variant="outlined" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} sx={{ borderColor: brandColors.borderDark, color: brandColors.textPrimary }}>
                Next
              </Button>
            </Stack>
          </Box>
        </TableContainer>
      )}
    </Box>
  );
};
