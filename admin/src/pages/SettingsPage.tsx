import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  FormControlLabel,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { settingsApi } from '../api/content.api';
import type { SiteSetting } from '../types/content.types';
import { parseApiError } from '../utils/error.utils';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { CardGridSkeleton } from '../components/common/LoadingSkeleton';
import { brandColors } from '../theme/theme';

type DraftValue = string | number | boolean;

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [draft, setDraft] = useState<Record<string, DraftValue>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<{ message: string; isNetworkError: boolean } | null>(null);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const load = () => {
    setLoading(true);
    setError(null);
    settingsApi
      .list()
      .then((rows) => {
        setSettings(rows);
        const next: Record<string, DraftValue> = {};
        for (const row of rows) {
          next[row.key] =
            typeof row.value === 'boolean' || typeof row.value === 'number'
              ? row.value
              : String(row.value ?? '');
        }
        setDraft(next);
      })
      .catch((err) => {
        const parsed = parseApiError(err);
        setError({ message: parsed.message, isNetworkError: parsed.isNetworkError });
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const groups = useMemo(() => {
    const map = new Map<string, SiteSetting[]>();
    for (const setting of settings) {
      const list = map.get(setting.settingGroup) ?? [];
      list.push(setting);
      map.set(setting.settingGroup, list);
    }
    return Array.from(map, ([group, items]) => ({ group, items }));
  }, [settings]);

  const dirty = settings.some((setting) => {
    const original =
      typeof setting.value === 'boolean' || typeof setting.value === 'number'
        ? setting.value
        : String(setting.value ?? '');
    return draft[setting.key] !== original;
  });

  const save = async () => {
    setSaving(true);
    try {
      const payload = settings.map((setting) => ({ key: setting.key, value: draft[setting.key] }));
      const updated = await settingsApi.update(payload);
      setSettings(updated);
      setToast({ open: true, message: 'Settings saved.', severity: 'success' });
    } catch (err) {
      setToast({ open: true, message: parseApiError(err).message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Site Settings
          </Typography>
          <Typography variant="body2" sx={{ color: brandColors.textSecondary, mt: 0.5 }}>
            Contact numbers, homepage copy and feature toggles the public site reads at load.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<SaveIcon />}
          disabled={!dirty || saving}
          onClick={save}
          sx={{ backgroundColor: brandColors.mustard, color: brandColors.black }}
        >
          {saving ? <CircularProgress size={20} color="inherit" /> : 'Save changes'}
        </Button>
      </Box>

      {error && <ErrorAlert title="Could not load settings" message={error.message} isNetworkError={error.isNetworkError} onRetry={load} />}
      {loading && <CardGridSkeleton count={2} />}

      {!loading && !error && (
        <Stack spacing={3}>
          {groups.map(({ group, items }) => (
            <Card key={group} sx={{ p: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: brandColors.textSecondary, mb: 2 }}
              >
                {group}
              </Typography>
              <Stack spacing={2.5}>
                {items.map((setting) => {
                  const value = draft[setting.key];
                  if (typeof value === 'boolean') {
                    return (
                      <FormControlLabel
                        key={setting.key}
                        control={
                          <Switch
                            checked={value}
                            onChange={(event) =>
                              setDraft((prev) => ({ ...prev, [setting.key]: event.target.checked }))
                            }
                          />
                        }
                        label={setting.label}
                      />
                    );
                  }
                  const isNumber = typeof value === 'number';
                  return (
                    <TextField
                      key={setting.key}
                      label={setting.label}
                      type={isNumber ? 'number' : 'text'}
                      size="small"
                      fullWidth
                      value={value ?? ''}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          [setting.key]: isNumber ? Number(event.target.value) : event.target.value,
                        }))
                      }
                      helperText={setting.key}
                    />
                  );
                })}
              </Stack>
            </Card>
          ))}
          {groups.length === 0 && (
            <Alert severity="info">No settings found. Run the content seed script on the backend.</Alert>
          )}
        </Stack>
      )}

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
};
