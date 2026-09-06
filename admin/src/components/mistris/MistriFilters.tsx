import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  InputAdornment,
  Button,
  Grid,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { brandColors } from '../../theme/theme';
import type { MistriQueryParams } from '../../types/mistri.types';

interface MistriFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  stateFilter: string;
  onStateChange: (value: string) => void;
  cityFilter: string;
  onCityChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: MistriQueryParams['sortBy']) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  onReset: () => void;
  availableStates?: string[];
  availableCategories?: string[];
}

export const MistriFilters: React.FC<MistriFiltersProps> = ({
  search,
  onSearchChange,
  stateFilter,
  onStateChange,
  cityFilter,
  onCityChange,
  categoryFilter,
  onCategoryChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onReset,
  availableStates = [],
  availableCategories = [],
}) => {
  const hasActiveFilters =
    search !== '' ||
    stateFilter !== '' ||
    cityFilter !== '' ||
    categoryFilter !== '' ||
    sortBy !== 'createdAt' ||
    sortOrder !== 'desc';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: '4px',
        border: `1px solid ${brandColors.border}`,
        backgroundColor: brandColors.white,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      <Grid container spacing={2} sx={{ alignItems: 'center' }}>
        {/* Search */}
        <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: brandColors.textSecondary }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => onSearchChange('')} edge="end">
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />
        </Grid>

        {/* State Filter */}
        <Grid size={{ xs: 6, sm: 3, md: 2 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="State"
            value={stateFilter}
            onChange={(e) => onStateChange(e.target.value)}
          >
            <MenuItem value="">All States</MenuItem>
            {availableStates.map((st) => (
              <MenuItem key={st} value={st}>
                {st}
              </MenuItem>
            ))}
            {availableStates.length === 0 && (
              <MenuItem value="custom" disabled>
                (Dynamic per results)
              </MenuItem>
            )}
          </TextField>
        </Grid>

        {/* City Filter (text or select) */}
        <Grid size={{ xs: 6, sm: 3, md: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="City"
            placeholder="Filter by city"
            value={cityFilter}
            onChange={(e) => onCityChange(e.target.value)}
          />
        </Grid>

        {/* Category Filter */}
        <Grid size={{ xs: 6, sm: 4, md: 2 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Category"
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <MenuItem value="">All Categories</MenuItem>
            {availableCategories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Sort */}
        <Grid size={{ xs: 6, sm: 4, md: 1.5 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Sort By"
            value={sortBy}
            onChange={(e) =>
              onSortByChange(e.target.value as NonNullable<MistriQueryParams['sortBy']>)
            }
          >
            <MenuItem value="createdAt">Date</MenuItem>
            <MenuItem value="experienceYears">Experience</MenuItem>
            <MenuItem value="fullName">Name</MenuItem>
            <MenuItem value="id">ID</MenuItem>
          </TextField>
        </Grid>

        {/* Reset / Sort Order */}
        <Grid
          size={{ xs: 12, sm: 4, md: 1 }}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}
        >
          <Tooltip title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
              sx={{
                minWidth: 40,
                px: 1,
                borderColor: brandColors.borderDark,
                color: brandColors.textPrimary,
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              {sortOrder.toUpperCase()}
            </Button>
          </Tooltip>

          {hasActiveFilters && (
            <Tooltip title="Reset all filters">
              <IconButton
                size="small"
                onClick={onReset}
                sx={{
                  color: brandColors.textSecondary,
                  border: `1px solid ${brandColors.border}`,
                  '&:hover': { color: brandColors.black, backgroundColor: brandColors.warmWhiteDarker },
                }}
              >
                <RestartAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};
