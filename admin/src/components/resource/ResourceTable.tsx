import React from 'react';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteForever';
import { brandColors } from '../../theme/theme';
import type { ColumnDef } from './resourceConfig';

interface ResourceTableProps<T> {
  rows: T[];
  columns: ColumnDef<T>[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  sortableKeys?: string[];
  onSort: (key: string) => void;
  onPageChange: (page: number) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  extraActions?: (row: T) => React.ReactNode;
  rowId: (row: T) => number;
}

export function ResourceTable<T>({
  rows,
  columns,
  page,
  pageSize,
  total,
  totalPages,
  sortBy,
  sortOrder,
  sortableKeys = [],
  onSort,
  onPageChange,
  onEdit,
  onDelete,
  extraActions,
  rowId,
}: ResourceTableProps<T>) {
  const hasActions = Boolean(onEdit || onDelete || extraActions);
  const firstRow = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastRow = Math.min(page * pageSize, total);

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: '6px',
        border: `1px solid ${brandColors.border}`,
        overflow: 'hidden',
        backgroundColor: brandColors.white,
      }}
    >
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => {
                const isSortable = sortableKeys.includes(column.key);
                return (
                  <TableCell key={column.key} align={column.align} sx={{ width: column.width }}>
                    {isSortable ? (
                      <TableSortLabel
                        active={sortBy === column.key}
                        direction={sortBy === column.key ? sortOrder : 'asc'}
                        onClick={() => onSort(column.key)}
                      >
                        {column.header}
                      </TableSortLabel>
                    ) : (
                      column.header
                    )}
                  </TableCell>
                );
              })}
              {hasActions && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={rowId(row)} hover>
                {columns.map((column) => (
                  <TableCell key={column.key} align={column.align}>
                    {column.render
                      ? column.render(row)
                      : String((row as Record<string, unknown>)[column.key] ?? '—')}
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end', alignItems: 'center' }}>
                      {extraActions?.(row)}
                      {onEdit && (
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => onEdit(row)} sx={{ color: brandColors.textSecondary }}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {onDelete && (
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => onDelete(row)} sx={{ color: brandColors.error }}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          px: 3,
          py: 2,
          borderTop: `1px solid ${brandColors.borderLight}`,
        }}
      >
        <Typography variant="body2" sx={{ color: brandColors.textSecondary }}>
          Showing {firstRow} to {lastRow} of {total} entries
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            sx={{ borderColor: brandColors.borderDark, color: brandColors.textPrimary }}
          >
            Previous
          </Button>
          <Button
            size="small"
            variant="outlined"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            sx={{ borderColor: brandColors.borderDark, color: brandColors.textPrimary }}
          >
            Next
          </Button>
        </Box>
      </Box>
    </TableContainer>
  );
}
