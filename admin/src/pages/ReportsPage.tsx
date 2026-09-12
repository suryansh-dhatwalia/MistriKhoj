import React, { useEffect, useState } from 'react';
import { Box, Button, Card, Grid, Stack, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { reportsApi } from '../api/content.api';
import type { RankedRow, ReportsOverview } from '../types/content.types';
import { parseApiError } from '../utils/error.utils';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { CardGridSkeleton } from '../components/common/LoadingSkeleton';
import { brandColors } from '../theme/theme';

const StatCard: React.FC<{ label: string; value: number | string; tone?: string }> = ({ label, value, tone }) => (
  <Card sx={{ p: 3 }}>
    <Typography
      sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: brandColors.textSecondary, mb: 1 }}
    >
      {label}
    </Typography>
    <Typography sx={{ fontSize: '1.875rem', fontWeight: 900, color: tone ?? brandColors.textPrimary, lineHeight: 1 }}>
      {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
    </Typography>
  </Card>
);

const RankedBars: React.FC<{ title: string; rows: RankedRow[] }> = ({ title, rows }) => {
  const max = Math.max(1, ...rows.map((row) => row.count));
  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: brandColors.textSecondary, mb: 2 }}>
        {title}
      </Typography>
      <Stack spacing={1.25}>
        {rows.length === 0 && (
          <Typography variant="body2" sx={{ color: brandColors.textSecondary }}>
            No data yet.
          </Typography>
        )}
        {rows.map((row) => (
          <Box key={row.label}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {row.label || '—'}
              </Typography>
              <Typography variant="body2" sx={{ color: brandColors.textSecondary }}>
                {row.count}
              </Typography>
            </Box>
            <Box sx={{ height: 6, borderRadius: 3, backgroundColor: brandColors.borderLight }}>
              <Box
                sx={{
                  height: 6,
                  borderRadius: 3,
                  width: `${(row.count / max) * 100}%`,
                  backgroundColor: brandColors.mustard,
                }}
              />
            </Box>
          </Box>
        ))}
      </Stack>
    </Card>
  );
};

export const ReportsPage: React.FC = () => {
  const [data, setData] = useState<ReportsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; isNetworkError: boolean } | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    reportsApi
      .overview()
      .then(setData)
      .catch((err) => {
        const parsed = parseApiError(err);
        setError({ message: parsed.message, isNetworkError: parsed.isNetworkError });
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const seriesMax = data ? Math.max(1, ...data.registrationsByDay.map((point) => point.count)) : 1;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Reports
          </Typography>
          <Typography variant="body2" sx={{ color: brandColors.textSecondary, mt: 0.5 }}>
            Registration trends, top states and categories, referral performance and content counts.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={load}
          disabled={loading}
          sx={{ borderColor: brandColors.borderDark, color: brandColors.textPrimary, backgroundColor: brandColors.white }}
        >
          Refresh
        </Button>
      </Box>

      {error && <ErrorAlert title="Could not load reports" message={error.message} isNetworkError={error.isNetworkError} onRetry={load} />}
      {loading && <CardGridSkeleton count={4} />}

      {!loading && !error && data && (
        <Stack spacing={3}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCard label="Pending Review" value={data.mistris.pending} tone={brandColors.mustardDark} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCard label="Approved Mistris" value={data.mistris.approved} tone={brandColors.success} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCard label="Total Registrations" value={data.mistris.total} />
            </Grid>
          </Grid>

          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: brandColors.textSecondary, mb: 2 }}>
              Registrations · last 30 days
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: 120 }}>
              {data.registrationsByDay.map((point) => (
                <Box
                  key={point.date}
                  title={`${point.date}: ${point.count}`}
                  sx={{
                    flex: 1,
                    minWidth: 4,
                    height: `${Math.max(2, (point.count / seriesMax) * 100)}%`,
                    backgroundColor: point.count > 0 ? brandColors.mustard : brandColors.borderLight,
                    borderRadius: '2px 2px 0 0',
                  }}
                />
              ))}
            </Box>
          </Card>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <RankedBars title="Top states" rows={data.byState} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <RankedBars title="Top categories" rows={data.byCategory} />
            </Grid>
          </Grid>

          <RankedBars
            title="Referral leaderboard"
            rows={data.referralLeaderboard.map((row) => ({
              label: row.name ? `${row.name} (${row.code})` : row.code,
              count: row.count,
            }))}
          />

          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: brandColors.textSecondary, mb: 2 }}>
              Content library
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(data.contentTotals).map(([key, value]) => (
                <Grid size={{ xs: 6, sm: 4, md: 3 }} key={key}>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: brandColors.textSecondary, textTransform: 'capitalize' }}>
                    {key}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Stack>
      )}
    </Box>
  );
};
