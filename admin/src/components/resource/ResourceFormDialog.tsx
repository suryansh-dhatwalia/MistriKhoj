import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { brandColors } from '../../theme/theme';
import { parseApiError } from '../../utils/error.utils';
import type { FieldDef, ResourceApiLike, SelectOption } from './resourceConfig';
import { ImageUploadField } from './ImageUploadField';

interface ResourceFormDialogProps<T> {
  open: boolean;
  mode: 'create' | 'edit';
  title: string;
  fields: FieldDef[];
  values: Record<string, any>;
  editingId?: number;
  api: ResourceApiLike<T>;
  /** Constant values merged into every payload (e.g. a locked ad `placement`). */
  hiddenValues?: Record<string, unknown>;
  onClose: () => void;
  onSaved: (row: T, mode: 'create' | 'edit') => void;
}

const StringListInput: React.FC<{ value: string[]; onChange: (next: string[]) => void }> = ({
  value,
  onChange,
}) => {
  const [draft, setDraft] = useState('');
  const items = Array.isArray(value) ? value : [];

  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setDraft('');
  };

  return (
    <Box>
      <Stack direction="row" spacing={1}>
        <TextField
          size="small"
          fullWidth
          placeholder="Add an item and press Enter"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              add();
            }
          }}
        />
        <Button onClick={add} variant="outlined" startIcon={<AddIcon />} sx={{ flexShrink: 0 }}>
          Add
        </Button>
      </Stack>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
        {items.map((item, index) => (
          <Chip
            key={`${item}-${index}`}
            label={item}
            onDelete={() => onChange(items.filter((_, i) => i !== index))}
          />
        ))}
      </Box>
    </Box>
  );
};

const AsyncSelectField: React.FC<{
  label: string;
  value: any;
  onChange: (next: any) => void;
  loadOptions: () => Promise<SelectOption[]>;
  allowEmpty?: boolean;
  error?: string;
  helperText?: string;
}> = ({ label, value, onChange, loadOptions, allowEmpty, error, helperText }) => {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadOptions()
      .then((result) => {
        if (active) setOptions(result);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TextField
      select
      fullWidth
      size="small"
      label={label}
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      error={Boolean(error)}
      helperText={error || helperText || (loading ? 'Loading…' : undefined)}
    >
      {allowEmpty && <MenuItem value="">— None —</MenuItem>}
      {options.map((option) => (
        <MenuItem key={String(option.value)} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
};

export function ResourceFormDialog<T>({
  open,
  mode,
  title,
  fields,
  values,
  editingId,
  api,
  hiddenValues,
  onClose,
  onSaved,
}: ResourceFormDialogProps<T>) {
  const {
    control,
    handleSubmit,
    register,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, any>>({ defaultValues: values });

  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      reset(values);
      setServerError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const watched = watch();

  const isVisible = (field: FieldDef): boolean => {
    if (!field.showWhen) return true;
    return field.showWhen.equals.includes(watched[field.showWhen.field]);
  };

  const submit = handleSubmit(async (formValues) => {
    setServerError(null);
    const payload: Record<string, unknown> = { ...hiddenValues };
    for (const field of fields) {
      if (!isVisible(field)) continue;
      const raw = formValues[field.name];
      if (field.type === 'number') {
        payload[field.name] = raw === '' || raw === null || raw === undefined ? undefined : Number(raw);
      } else if (field.type === 'switch') {
        payload[field.name] = Boolean(raw);
      } else if (field.type === 'stringList') {
        payload[field.name] = Array.isArray(raw) ? raw : [];
      } else if (field.type === 'asyncSelect') {
        payload[field.name] = raw === '' ? undefined : raw;
      } else {
        payload[field.name] = raw;
      }
    }

    try {
      const saved =
        mode === 'create'
          ? await api.create(payload)
          : await api.update(editingId as number, payload);
      onSaved(saved, mode);
      onClose();
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.fieldErrors) {
        for (const [name, message] of Object.entries(parsed.fieldErrors)) {
          setError(name, { type: 'server', message });
        }
      }
      setServerError(parsed.fieldErrors ? 'Please fix the highlighted fields.' : parsed.message);
    }
  });

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent dividers>
        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}
        <Stack spacing={2.25} component="form" id="resource-form" onSubmit={submit} sx={{ mt: 0.5 }}>
          {fields.filter(isVisible).map((field) => {
            const fieldError = errors[field.name]?.message as string | undefined;

            if (field.type === 'text' || field.type === 'textarea' || field.type === 'number') {
              return (
                <TextField
                  key={field.name}
                  fullWidth
                  size="small"
                  label={field.label}
                  type={field.type === 'number' ? 'number' : 'text'}
                  multiline={field.type === 'textarea'}
                  minRows={field.type === 'textarea' ? 3 : undefined}
                  placeholder={field.placeholder}
                  error={Boolean(fieldError)}
                  helperText={fieldError || field.helperText}
                  {...register(field.name, {
                    required: field.required ? `${field.label} is required` : false,
                  })}
                />
              );
            }

            if (field.type === 'select') {
              return (
                <Controller
                  key={field.name}
                  name={field.name}
                  control={control}
                  rules={{ required: field.required ? `${field.label} is required` : false }}
                  render={({ field: controllerField }) => (
                    <TextField
                      {...controllerField}
                      select
                      fullWidth
                      size="small"
                      label={field.label}
                      value={controllerField.value ?? ''}
                      error={Boolean(fieldError)}
                      helperText={fieldError || field.helperText}
                    >
                      {field.options.map((option) => (
                        <MenuItem key={String(option.value)} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              );
            }

            if (field.type === 'asyncSelect') {
              return (
                <Controller
                  key={field.name}
                  name={field.name}
                  control={control}
                  rules={{ required: field.required ? `${field.label} is required` : false }}
                  render={({ field: controllerField }) => (
                    <AsyncSelectField
                      label={field.label}
                      value={controllerField.value}
                      onChange={controllerField.onChange}
                      loadOptions={field.loadOptions}
                      allowEmpty={field.allowEmpty}
                      error={fieldError}
                      helperText={field.helperText}
                    />
                  )}
                />
              );
            }

            if (field.type === 'switch') {
              return (
                <Controller
                  key={field.name}
                  name={field.name}
                  control={control}
                  render={({ field: controllerField }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(controllerField.value)}
                          onChange={(event) => controllerField.onChange(event.target.checked)}
                        />
                      }
                      label={field.label}
                    />
                  )}
                />
              );
            }

            if (field.type === 'image' || field.type === 'video') {
              return (
                <Controller
                  key={field.name}
                  name={field.name}
                  control={control}
                  rules={{ required: field.required ? `${field.label} is required` : false }}
                  render={({ field: controllerField }) => (
                    <ImageUploadField
                      label={field.label}
                      kind={field.type as 'image' | 'video'}
                      value={controllerField.value ?? ''}
                      onChange={controllerField.onChange}
                      helperText={field.helperText}
                      error={fieldError}
                      required={field.required}
                    />
                  )}
                />
              );
            }

            // stringList
            return (
              <Box key={field.name}>
                <Box sx={{ fontSize: '0.8125rem', fontWeight: 600, mb: 0.75, color: brandColors.textPrimary }}>
                  {field.label}
                </Box>
                <Controller
                  name={field.name}
                  control={control}
                  render={({ field: controllerField }) => (
                    <StringListInput
                      value={controllerField.value ?? []}
                      onChange={controllerField.onChange}
                    />
                  )}
                />
                {field.helperText && (
                  <Box sx={{ fontSize: '0.75rem', color: brandColors.textSecondary, mt: 0.5 }}>
                    {field.helperText}
                  </Box>
                )}
              </Box>
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting} variant="outlined" sx={{ borderColor: brandColors.borderDark, color: brandColors.textPrimary }}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="resource-form"
          disabled={isSubmitting}
          variant="contained"
          sx={{ backgroundColor: brandColors.black }}
        >
          {isSubmitting ? <CircularProgress size={20} color="inherit" /> : mode === 'create' ? 'Create' : 'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
