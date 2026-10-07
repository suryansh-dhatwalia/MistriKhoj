import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, Button, Chip, MenuItem, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { analyticsApi } from '../api/ads.api';
import { Stack } from '../components/common/Stack';
import { citiesApi, statesApi } from '../api/content.api';
import { brandColors } from '../theme/theme';
import type { AnalyticsOverview } from '../types/ads.types';
import type { CityItem, StateItem } from '../types/content.types';
import { parseApiError } from '../utils/error.utils';
import { LIFECYCLE_COLOR, SCOPE_LABEL } from '../utils/ads.utils';

const isoDay = (date: Date) => date.toISOString().slice(0, 10);
const daysAgo = (n: number) => isoDay(new Date(Date.now() - n * 86_400_000));
const num = (value: number | null) => (value === null ? 'n/a' : value.toLocaleString('en-IN'));
const PAGE_LABEL: Record<string, string> = {
  '/': 'Homepage', '/mistris': 'Search results', '/mistri/:id': 'Mistri profile pages', '/register': 'Register', '/advertise': 'Advertise',
};

const Metric: React.FC<{ label: string; value: string; note: string }> = ({ label, value, note }) => (
  <Paper variant="outlined" sx={{ p: 2, flex: 1, minWidth: 200 }}>
    <Typography variant="caption" sx={{ color: brandColors.textSecondary, fontWeight: 700, textTransform: 'uppercase' }}>{label}</Typography>
    <Typography variant="h4" sx={{ fontWeight: 800 }}>{value}</Typography>
    <Typography variant="caption" sx={{ color: brandColors.textSecondary }}>{note}</Typography>
  </Paper>
);

/** Plain horizontal bars — no chart dependency, readable by screen readers via the table beside them. */
const Bars: React.FC<{ rows: Array<{ label: string; value: number }>; }> = ({ rows }) => {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <Stack gap={1}>
      {rows.map((row) => (
        <Box key={row.label}>
          <Stack direction="row" justifyContent="space-between"><Typography variant="body2">{row.label}</Typography><Typography variant="body2" sx={{ fontWeight: 700 }}>{num(row.value)}</Typography></Stack>
          <Box sx={{ height: 8, bgcolor: brandColors.borderLight, borderRadius: 1 }}>
            <Box sx={{ height: '100%', width: `${(row.value / max) * 100}%`, bgcolor: brandColors.mustard, borderRadius: 1 }} />
          </Box>
        </Box>
      ))}
    </Stack>
  );
};

export const AnalyticsPage: React.FC = () => {
  const [from, setFrom] = useState(daysAgo(29));
  const [to, setTo] = useState(daysAgo(0));
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [states, setStates] = useState<StateItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { void statesApi.list({ pageSize: 100, sortBy: 'name', sortOrder: 'asc' }).then((r) => setStates(r.data)).catch(() => undefined); }, []);
  const stateId = states.find((s) => s.name === state)?.id;
  useEffect(() => {
    if (!stateId) { setCities([]); return; }
    void citiesApi.list({ pageSize: 100, sortBy: 'name', sortOrder: 'asc', stateId } as never).then((r) => setCities(r.data)).catch(() => setCities([]));
  }, [stateId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setData(await analyticsApi.overview({ from, to, state: state || undefined, city: city || undefined })); }
    catch (err) { setError(parseApiError(err).message); }
    finally { setLoading(false); }
  }, [from, to, state, city]);
  useEffect(() => { void load(); }, [load]);

  const preset = (days: number) => { setFrom(daysAgo(days - 1)); setTo(daysAgo(0)); };
  const filtered = Boolean(state);

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} mb={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Website Analytics</Typography>
          <Typography variant="body2" sx={{ color: brandColors.textSecondary }}>
            Anonymous and privacy-friendly: no names, phone numbers or raw IP addresses are stored. Admin previews and bots are never counted.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load} disabled={loading}>Refresh</Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} gap={2} alignItems={{ md: 'center' }} flexWrap="wrap">
          <TextField size="small" type="date" label="From" value={from} slotProps={{ inputLabel: { shrink: true } }} onChange={(e) => setFrom(e.target.value)} />
          <TextField size="small" type="date" label="To" value={to} slotProps={{ inputLabel: { shrink: true } }} onChange={(e) => setTo(e.target.value)} />
          {[7, 30, 90].map((d) => <Chip key={d} label={`Last ${d} days`} onClick={() => preset(d)} variant="outlined" />)}
          <TextField select size="small" label="State" value={state} sx={{ minWidth: 170 }} onChange={(e) => { setState(e.target.value); setCity(''); }}>
            <MenuItem value="">All states</MenuItem>{states.map((s) => <MenuItem key={s.id} value={s.name}>{s.name}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="City" value={city} disabled={!state} sx={{ minWidth: 170 }} onChange={(e) => setCity(e.target.value)}>
            <MenuItem value="">All cities</MenuItem>{cities.map((c) => <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>)}
          </TextField>
        </Stack>
        {filtered && <Typography variant="caption" sx={{ color: brandColors.textSecondary }}>Location filter on: page views count search-results pages for that place, and unique visitors are unavailable (visitors are not tied to a place).</Typography>}
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={load}>Retry</Button>}>{error}</Alert>}

      {loading && !data ? <Skeleton variant="rounded" height={140} /> : data && (
        <>
          <Stack direction={{ xs: 'column', md: 'row' }} gap={2} mb={3} flexWrap="wrap">
            <Metric label="Page views" value={num(data.totals.pageViews)} note="Every counted page load, all pages" />
            <Metric label="Unique visitors" value={num(data.totals.uniqueVisitors)} note="Distinct visitors per day, summed over the range" />
            <Metric label="Profile views" value={num(data.totals.profileViews)} note="Mistri profile opens, repeat refreshes excluded" />
            <Metric label="Ad impressions" value={num(data.totals.adImpressions)} note="Times an ad scrolled into view" />
          </Stack>

          <Stack direction={{ xs: 'column', lg: 'row' }} gap={2} mb={3}>
            <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Page views by page</Typography>
              {data.byPage.length === 0 ? <Typography variant="body2" color="text.secondary">No page views in this range.</Typography>
                : <Bars rows={data.byPage.map((r) => ({ label: PAGE_LABEL[r.page] ?? r.page, value: r.views }))} />}
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Most-viewed Mistri profiles</Typography>
              <TableContainer>
                <Table size="small" aria-label="Most viewed Mistri profiles">
                  <TableHead><TableRow><TableCell>Mistri</TableCell><TableCell>Location</TableCell><TableCell align="right">In range</TableCell><TableCell align="right">All time</TableCell></TableRow></TableHead>
                  <TableBody>
                    {data.topProfiles.map((p) => (
                      <TableRow key={p.id}><TableCell>{p.fullName}<br /><Typography variant="caption" color="text.secondary">{p.category}</Typography></TableCell>
                        <TableCell>{p.city}, {p.state}</TableCell><TableCell align="right">{num(p.viewsInRange)}</TableCell><TableCell align="right">{num(p.viewsTotal)}</TableCell></TableRow>
                    ))}
                    {data.topProfiles.length === 0 && <TableRow><TableCell colSpan={4} align="center">No profile views in this range.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Stack>

          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Advertisement impressions</Typography>
            <TableContainer>
              <Table size="small" aria-label="Advertisement impressions">
                <TableHead><TableRow><TableCell>Ad</TableCell><TableCell>Category</TableCell><TableCell>Target</TableCell><TableCell>Status</TableCell><TableCell align="right">In range</TableCell><TableCell align="right">All time</TableCell></TableRow></TableHead>
                <TableBody>
                  {data.ads.map((ad) => (
                    <TableRow key={ad.id}><TableCell>{ad.title || '—'}<br /><Typography variant="caption" color="text.secondary">{ad.companyName}</Typography></TableCell>
                      <TableCell>{ad.scope ? SCOPE_LABEL[ad.scope] : '—'}</TableCell>
                      <TableCell>{ad.scope === 'HOME' ? 'Homepage' : [ad.city, ad.state].filter(Boolean).join(', ') || '—'}</TableCell>
                      <TableCell><Chip size="small" color={LIFECYCLE_COLOR[ad.lifecycle]} label={ad.lifecycle.toLowerCase()} /></TableCell>
                      <TableCell align="right">{num(ad.impressionsInRange)}</TableCell><TableCell align="right">{num(ad.impressionsTotal)}</TableCell></TableRow>
                  ))}
                  {data.ads.length === 0 && <TableRow><TableCell colSpan={6} align="center">No advertisements.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Daily breakdown</Typography>
            <TableContainer sx={{ maxHeight: 420 }}>
              <Table size="small" stickyHeader aria-label="Daily analytics">
                <TableHead><TableRow><TableCell>Day</TableCell><TableCell align="right">Page views</TableCell><TableCell align="right">Unique visitors</TableCell><TableCell align="right">Profile views</TableCell><TableCell align="right">Ad impressions</TableCell></TableRow></TableHead>
                <TableBody>
                  {[...data.daily].reverse().map((d) => (
                    <TableRow key={d.day}><TableCell>{d.day}</TableCell><TableCell align="right">{num(d.pageViews)}</TableCell><TableCell align="right">{num(d.uniqueVisitors)}</TableCell><TableCell align="right">{num(d.profileViews)}</TableCell><TableCell align="right">{num(d.adImpressions)}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
};
