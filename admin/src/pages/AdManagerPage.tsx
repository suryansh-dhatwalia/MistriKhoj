import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Paper,
  Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow,
  TextField, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import { adsApi } from '../api/ads.api';
import { Stack } from '../components/common/Stack';
import { citiesApi, statesApi } from '../api/content.api';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { ImageUploadField } from '../components/resource/ImageUploadField';
import { brandColors } from '../theme/theme';
import type { AdLifecycle, AdListQuery, AdRateCard, AdScope, ManagedAd } from '../types/ads.types';
import type { CityItem, StateItem } from '../types/content.types';
import { parseApiError } from '../utils/error.utils';
import {
  buildAdPayload, LIFECYCLE_COLOR, SCOPE_LABEL, toLocalInput, validateAdForm, type AdFormValues,
} from '../utils/ads.utils';

const emptyForm = (rates: AdRateCard | null): AdFormValues => ({
  scope: 'HOME', title: '', companyName: '', description: '', ctaText: '', linkUrl: '', state: '', city: '',
  priceInr: rates ? String(rates.HOME) : '', startsAt: '', endsAt: '', status: 'ACTIVE', mediaType: 'image', media: '',
});

const inr = (value: number | null) => (value === null ? '—' : `₹${value.toLocaleString('en-IN')}`);
const day = (iso: string | null) => (iso ? new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

const AdMedia: React.FC<{ ad: Pick<ManagedAd, 'imageUrl' | 'videoUrl' | 'title'>; size?: number }> = ({ ad, size = 64 }) => {
  const sx = { width: size * 1.6, height: size, objectFit: 'contain' as const, bgcolor: '#000', borderRadius: 1, border: `1px solid ${brandColors.border}` };
  if (ad.videoUrl && !ad.imageUrl) return <Box component="video" src={ad.videoUrl} muted preload="metadata" sx={sx} />;
  return ad.imageUrl ? <Box component="img" src={ad.imageUrl} alt={ad.title ?? ''} sx={sx} /> : <>—</>;
};

export const AdManagerPage: React.FC = () => {
  const [rows, setRows] = useState<ManagedAd[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<{ search: string; scope: '' | AdScope; lifecycle: '' | AdLifecycle; sortBy: NonNullable<AdListQuery['sortBy']> }>(
    { search: '', scope: '', lifecycle: '', sortBy: 'createdAt' },
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const [rates, setRates] = useState<AdRateCard | null>(null);
  const [rateDraft, setRateDraft] = useState<Record<keyof AdRateCard, string> | null>(null);
  const [states, setStates] = useState<StateItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);

  const [editing, setEditing] = useState<ManagedAd | 'new' | null>(null);
  const [form, setForm] = useState<AdFormValues>(emptyForm(null));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<ManagedAd | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adsApi.list({
        page: page + 1, pageSize, search: filters.search || undefined, scope: filters.scope || undefined,
        lifecycle: filters.lifecycle || undefined, sortBy: filters.sortBy, sortOrder: 'desc',
      });
      setRows(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    void adsApi.getRateCard().then((card) => { setRates(card); setRateDraft({ HOME: String(card.HOME), STATE: String(card.STATE), CITY: String(card.CITY) }); }).catch(() => undefined);
    void statesApi.list({ pageSize: 100, sortBy: 'name', sortOrder: 'asc' }).then((r) => setStates(r.data)).catch(() => undefined);
  }, []);

  const selectedState = states.find((s) => s.name === form.state);
  useEffect(() => {
    if (!selectedState) { setCities([]); return; }
    void citiesApi.list({ pageSize: 100, sortBy: 'name', sortOrder: 'asc', stateId: selectedState.id } as never).then((r) => setCities(r.data)).catch(() => setCities([]));
  }, [selectedState?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => { setForm(emptyForm(rates)); setErrors({}); setEditing('new'); };
  const openEdit = (ad: ManagedAd) => {
    setForm({
      scope: ad.scope ?? 'STATE', title: ad.title ?? '', companyName: ad.companyName ?? '', description: ad.description ?? '',
      ctaText: ad.ctaText ?? '', linkUrl: ad.linkUrl ?? '', state: ad.state ?? '', city: ad.city ?? '',
      priceInr: ad.priceInr === null ? '' : String(ad.priceInr), startsAt: toLocalInput(ad.startsAt), endsAt: toLocalInput(ad.endsAt),
      status: ad.status, mediaType: ad.mediaType, media: ad.mediaType === 'video' ? ad.videoUrl ?? '' : ad.imageUrl ?? '',
    });
    setErrors({});
    setEditing(ad);
  };

  const set = <K extends keyof AdFormValues>(key: K, value: AdFormValues[K]) => setForm((c) => ({ ...c, [key]: value }));

  const changeScope = (scope: AdScope) =>
    setForm((c) => ({
      ...c, scope,
      state: scope === 'HOME' ? '' : c.state, city: scope === 'CITY' ? c.city : '',
      // Switching tier re-suggests that tier's rate-card price (the admin can still override it).
      priceInr: rates ? String(rates[scope]) : c.priceInr,
    }));

  const save = async () => {
    const isEdit = editing !== 'new' && editing !== null;
    const found = validateAdForm(form, isEdit);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    try {
      const payload = buildAdPayload(form, isEdit ? (editing.mediaType === 'video' ? editing.videoUrl : editing.imageUrl) : null);
      if (isEdit) await adsApi.update(editing.id, payload); else await adsApi.create(payload);
      setToast({ message: isEdit ? 'Advertisement updated.' : 'Advertisement created.', severity: 'success' });
      setEditing(null);
      await load();
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.fieldErrors) setErrors(parsed.fieldErrors);
      setToast({ message: parsed.message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (ad: ManagedAd) => {
    try {
      await adsApi.setStatus(ad.id, ad.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');
      await load();
    } catch (err) { setToast({ message: parseApiError(err).message, severity: 'error' }); }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await adsApi.remove(deleting.id);
      setToast({ message: 'Advertisement deleted.', severity: 'success' });
      setDeleting(null);
      await load();
    } catch (err) { setToast({ message: parseApiError(err).message, severity: 'error' }); setDeleting(null); }
  };

  const saveRates = async () => {
    if (!rateDraft) return;
    try {
      const saved = await adsApi.saveRateCard({ HOME: Number(rateDraft.HOME), STATE: Number(rateDraft.STATE), CITY: Number(rateDraft.CITY) });
      setRates(saved);
      setToast({ message: 'Rate card saved.', severity: 'success' });
    } catch (err) { setToast({ message: parseApiError(err).message, severity: 'error' }); }
  };

  const rateInvalid = useMemo(() => {
    if (!rateDraft) return null;
    const [h, s, c] = [Number(rateDraft.HOME), Number(rateDraft.STATE), Number(rateDraft.CITY)];
    return h <= s || h <= c ? 'Homepage price must be higher than state and city prices.' : null;
  }, [rateDraft]);

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2} mb={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Advertisements</Typography>
          <Typography variant="body2" sx={{ color: brandColors.textSecondary }}>
            Homepage ads appear only on the homepage. State and city ads appear only on matching Mistri search-results pages.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>New advertisement</Button>
      </Stack>

      {/* Rate card */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Rate card (₹ per ad)</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} alignItems={{ sm: 'flex-start' }}>
          {(['HOME', 'STATE', 'CITY'] as const).map((scope) => (
            <TextField key={scope} size="small" label={SCOPE_LABEL[scope]} value={rateDraft?.[scope] ?? ''} disabled={!rateDraft}
              onChange={(e) => setRateDraft((c) => (c ? { ...c, [scope]: e.target.value.replace(/\D/g, '') } : c))} sx={{ width: { sm: 200 } }} />
          ))}
          <Button variant="outlined" disabled={!rateDraft || Boolean(rateInvalid)} onClick={saveRates}>Save prices</Button>
        </Stack>
        {rateInvalid && <Typography variant="caption" color="error">{rateInvalid}</Typography>}
      </Paper>

      {/* Filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} mb={2}>
        <TextField size="small" label="Search" value={filters.search} onChange={(e) => { setPage(0); setFilters((c) => ({ ...c, search: e.target.value })); }} sx={{ minWidth: 200 }} />
        <TextField select size="small" label="Category" value={filters.scope} onChange={(e) => { setPage(0); setFilters((c) => ({ ...c, scope: e.target.value as AdScope | '' })); }} sx={{ minWidth: 180 }}>
          <MenuItem value="">All categories</MenuItem>
          {(Object.keys(SCOPE_LABEL) as AdScope[]).map((s) => <MenuItem key={s} value={s}>{SCOPE_LABEL[s]}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Status" value={filters.lifecycle} onChange={(e) => { setPage(0); setFilters((c) => ({ ...c, lifecycle: e.target.value as AdLifecycle | '' })); }} sx={{ minWidth: 150 }}>
          <MenuItem value="">All statuses</MenuItem>
          {(['LIVE', 'SCHEDULED', 'PAUSED', 'EXPIRED'] as const).map((s) => <MenuItem key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Sort by" value={filters.sortBy} onChange={(e) => setFilters((c) => ({ ...c, sortBy: e.target.value as typeof c.sortBy }))} sx={{ minWidth: 150 }}>
          <MenuItem value="createdAt">Newest</MenuItem>
          <MenuItem value="impressions">Most impressions</MenuItem>
          <MenuItem value="priceInr">Price</MenuItem>
          <MenuItem value="endsAt">End date</MenuItem>
        </TextField>
      </Stack>

      {error && <ErrorAlert title="Could not load advertisements" message={error} isNetworkError={false} onRetry={load} />}

      <Paper variant="outlined">
        <TableContainer>
          <Table size="small" aria-label="Advertisements">
            <TableHead>
              <TableRow>
                <TableCell>Creative</TableCell><TableCell>Ad</TableCell><TableCell>Category</TableCell><TableCell>Target</TableCell>
                <TableCell align="right">Price</TableCell><TableCell>Schedule</TableCell><TableCell>Status</TableCell>
                <TableCell align="right">Impressions</TableCell><TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((ad) => (
                <TableRow key={ad.id} hover>
                  <TableCell><AdMedia ad={ad} size={40} /></TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{ad.title || '—'}</Typography>
                    <Typography variant="caption" sx={{ color: brandColors.textSecondary }}>{ad.companyName || '—'} · {ad.mediaType}</Typography>
                  </TableCell>
                  <TableCell>{ad.scope ? SCOPE_LABEL[ad.scope] : <Chip size="small" color="warning" label="Needs targeting" />}</TableCell>
                  <TableCell>{ad.scope === 'HOME' ? 'Homepage' : [ad.city, ad.state].filter(Boolean).join(', ') || '—'}</TableCell>
                  <TableCell align="right">{inr(ad.priceInr)}</TableCell>
                  <TableCell><Typography variant="caption">{day(ad.startsAt)}<br />→ {day(ad.endsAt)}</Typography></TableCell>
                  <TableCell><Chip size="small" color={LIFECYCLE_COLOR[ad.lifecycle]} label={ad.lifecycle.charAt(0) + ad.lifecycle.slice(1).toLowerCase()} /></TableCell>
                  <TableCell align="right">{ad.impressions.toLocaleString('en-IN')}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title={ad.status === 'ACTIVE' ? 'Pause' : 'Activate'}>
                      <IconButton size="small" aria-label={ad.status === 'ACTIVE' ? `Pause ${ad.title}` : `Activate ${ad.title}`} onClick={() => toggle(ad)}>
                        {ad.status === 'ACTIVE' ? <PauseCircleIcon /> : <PlayCircleIcon />}
                      </IconButton>
                    </Tooltip>
                    <IconButton size="small" aria-label={`Edit ${ad.title}`} onClick={() => openEdit(ad)}><EditIcon /></IconButton>
                    <IconButton size="small" aria-label={`Delete ${ad.title}`} onClick={() => setDeleting(ad)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && rows.length === 0 && (
                <TableRow><TableCell colSpan={9} align="center" sx={{ py: 5, color: brandColors.textSecondary }}>No advertisements match these filters.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={total} page={page} rowsPerPage={pageSize} rowsPerPageOptions={[10, 25, 50]}
          onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }} />
      </Paper>

      {/* Create / edit */}
      <Dialog open={editing !== null} onClose={() => !saving && setEditing(null)} fullWidth maxWidth="md" aria-labelledby="ad-dialog-title">
        <DialogTitle id="ad-dialog-title">{editing === 'new' ? 'New advertisement' : 'Edit advertisement'}</DialogTitle>
        <DialogContent dividers>
          <Stack gap={2} mt={0.5}>
            <TextField select label="Ad category" value={form.scope} onChange={(e) => changeScope(e.target.value as AdScope)}
              helperText="Homepage ads cost more and show only on the homepage. State/city ads show only on matching results pages.">
              {(Object.keys(SCOPE_LABEL) as AdScope[]).map((s) => <MenuItem key={s} value={s}>{SCOPE_LABEL[s]}{rates ? ` — ₹${rates[s]}` : ''}</MenuItem>)}
            </TextField>

            {form.scope !== 'HOME' && (
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
                <TextField select fullWidth required label="State" value={form.state} error={Boolean(errors.state)} helperText={errors.state}
                  onChange={(e) => setForm((c) => ({ ...c, state: e.target.value, city: '' }))}>
                  {states.map((s) => <MenuItem key={s.id} value={s.name}>{s.name}</MenuItem>)}
                </TextField>
                {form.scope === 'CITY' && (
                  <TextField select fullWidth required label="City" value={form.city} disabled={!form.state} error={Boolean(errors.city)}
                    helperText={errors.city ?? (form.state ? '' : 'Choose a state first')} onChange={(e) => set('city', e.target.value)}>
                    {cities.map((c) => <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>)}
                  </TextField>
                )}
              </Stack>
            )}

            <TextField required label="Headline" value={form.title} error={Boolean(errors.title)} helperText={errors.title} onChange={(e) => set('title', e.target.value)} />
            <TextField label="Sponsor / company name" value={form.companyName} onChange={(e) => set('companyName', e.target.value)} />
            <TextField label="Description" multiline minRows={2} value={form.description} onChange={(e) => set('description', e.target.value)} />
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
              <TextField fullWidth label="Button text" value={form.ctaText} onChange={(e) => set('ctaText', e.target.value)} />
              <TextField fullWidth label="Button link" placeholder="https://…" value={form.linkUrl} error={Boolean(errors.linkUrl)} helperText={errors.linkUrl} onChange={(e) => set('linkUrl', e.target.value)} />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
              <TextField fullWidth label="Price (₹)" value={form.priceInr} error={Boolean(errors.priceInr)}
                helperText={errors.priceInr ?? (rates ? `Rate card: ₹${rates[form.scope]}. Targeted ads must stay below ₹${rates.HOME}.` : '')}
                onChange={(e) => set('priceInr', e.target.value.replace(/\D/g, ''))} />
              <TextField fullWidth label="Starts" type="datetime-local" value={form.startsAt} slotProps={{ inputLabel: { shrink: true } }} onChange={(e) => set('startsAt', e.target.value)} helperText="Blank = immediately" />
              <TextField fullWidth label="Ends" type="datetime-local" value={form.endsAt} slotProps={{ inputLabel: { shrink: true } }} error={Boolean(errors.endsAt)} helperText={errors.endsAt ?? 'Blank = no end'} onChange={(e) => set('endsAt', e.target.value)} />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
              <TextField select label="Creative type" value={form.mediaType} sx={{ minWidth: 180 }}
                onChange={(e) => setForm((c) => ({ ...c, mediaType: e.target.value as 'image' | 'video', media: '' }))}>
                <MenuItem value="image">Image</MenuItem><MenuItem value="video">Video</MenuItem>
              </TextField>
              <TextField select label="Status" value={form.status} sx={{ minWidth: 180 }} onChange={(e) => set('status', e.target.value as 'ACTIVE' | 'INACTIVE')}>
                <MenuItem value="ACTIVE">Active</MenuItem><MenuItem value="INACTIVE">Paused</MenuItem>
              </TextField>
            </Stack>

            <ImageUploadField kind={form.mediaType} label={form.mediaType === 'video' ? 'Ad video' : 'Ad image'} required value={form.media}
              onChange={(v) => set('media', v)} error={errors.media ?? errors.image ?? errors.video}
              helperText="Any aspect ratio — shown letter-boxed (never cropped or stretched) on the site." />

            {form.media && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Preview (as shown on the site)</Typography>
                <Box sx={{ mt: 0.5, maxWidth: 360, border: `1px solid ${brandColors.border}`, borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ aspectRatio: '16 / 10', bgcolor: '#0D0F12', position: 'relative' }}>
                    {form.mediaType === 'video'
                      ? <Box component="video" src={form.media} controls preload="metadata" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
                      : <Box component="img" src={form.media} alt="Ad preview" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />}
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="caption" sx={{ color: brandColors.textSecondary }}>Sponsored by {form.companyName || 'Sponsor'}</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{form.title || 'Headline'}</Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save advertisement'}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={deleting !== null} title="Delete advertisement?" severity="error" confirmText="Delete"
        message={`“${deleting?.title ?? ''}” and its impression history will be permanently removed.`}
        onConfirm={confirmDelete} onClose={() => setDeleting(null)} />

      <Snackbar open={toast !== null} autoHideDuration={5000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {toast ? <Alert severity={toast.severity} onClose={() => setToast(null)}>{toast.message}</Alert> : undefined}
      </Snackbar>
    </Box>
  );
};
