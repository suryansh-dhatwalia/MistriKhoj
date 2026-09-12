import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import { Mistri, MistriPlan, UpdateMistriInput } from '../../types/mistri.types';
import { mistrisApi } from '../../api/mistris.api';
import { parseApiError } from '../../utils/error.utils';
import { brandColors } from '../../theme/theme';

interface MistriEditDialogProps {
  mistri: Mistri | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (updated: Mistri) => void;
}

export const MistriEditDialog: React.FC<MistriEditDialogProps> = ({
  mistri,
  open,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<UpdateMistriInput>({
    fullName: '',
    primaryPhone: '',
    alternatePhone: '',
    state: '',
    city: '',
    category: '',
    qualification: '',
    address: '',
    pincode: '',
    experienceYears: 0,
    servicesOffered: [],
    shortIntro: '',
    plan: 'FREE',
  });

  const [serviceInput, setServiceInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mistri) {
      setFormData({
        fullName: mistri.fullName || '',
        primaryPhone: mistri.primaryPhone || '',
        alternatePhone: mistri.alternatePhone || '',
        state: mistri.state || '',
        city: mistri.city || '',
        category: mistri.category || '',
        qualification: mistri.qualification || '',
        address: mistri.address || '',
        pincode: mistri.pincode || '',
        experienceYears: mistri.experienceYears ?? 0,
        servicesOffered: Array.isArray(mistri.servicesOffered) ? [...mistri.servicesOffered] : [],
        shortIntro: mistri.shortIntro || '',
        plan: mistri.plan ?? 'FREE',
      });
      setErrorMessage(null);
      setFieldErrors({});
    }
  }, [mistri]);

  const handleInputChange = <K extends keyof UpdateMistriInput>(field: K, value: UpdateMistriInput[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleAddService = () => {
    const trimmed = serviceInput.trim();
    if (!trimmed) return;
    if (formData.servicesOffered.includes(trimmed)) {
      setServiceInput('');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      servicesOffered: [...prev.servicesOffered, trimmed],
    }));
    setServiceInput('');
  };

  const handleRemoveService = (serviceToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      servicesOffered: prev.servicesOffered.filter((s) => s !== serviceToRemove),
    }));
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!formData.primaryPhone.trim()) {
      errors.primaryPhone = 'Primary phone is required';
    } else if (!/^\d{10}$/.test(formData.primaryPhone.replace(/\D/g, ''))) {
      errors.primaryPhone = 'Enter a valid 10-digit phone number';
    }

    if (formData.alternatePhone && formData.alternatePhone.trim()) {
      if (!/^\d{10}$/.test(formData.alternatePhone.replace(/\D/g, ''))) {
        errors.alternatePhone = 'Alternate phone must be a valid 10-digit number';
      }
    }

    if (!formData.state.trim()) {
      errors.state = 'State is required';
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }

    if (!formData.category.trim()) {
      errors.category = 'Category is required';
    }

    if (formData.experienceYears < 0) {
      errors.experienceYears = 'Experience cannot be negative';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mistri) return;

    if (!validate()) {
      setErrorMessage('Please fix the validation errors before saving.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: UpdateMistriInput = {
        ...formData,
        alternatePhone: formData.alternatePhone ? formData.alternatePhone.trim() : null,
        pincode: formData.pincode ? formData.pincode.trim() : null,
        shortIntro: formData.shortIntro ? formData.shortIntro.trim() : null,
        experienceYears: Number(formData.experienceYears),
      };

      const updated = await mistrisApi.updateMistri(mistri.id, payload);
      onSuccess(updated);
      onClose();
    } catch (err) {
      const parsed = parseApiError(err);
      setErrorMessage(parsed.message);
      if (parsed.fieldErrors) {
        setFieldErrors((prev) => ({ ...prev, ...parsed.fieldErrors }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mistri) return null;

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="edit-mistri-title"
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle
          id="edit-mistri-title"
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${brandColors.border}`,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Edit Mistri Registration
            </Typography>
            <Typography variant="caption" sx={{ color: brandColors.textSecondary }}>
              Editing ID #{mistri.id} ({mistri.fullName})
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} disabled={isSubmitting}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Grid container spacing={2.5}>
            {/* Full Name */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                error={Boolean(fieldErrors.fullName)}
                helperText={fieldErrors.fullName}
              />
            </Grid>

            {/* Category */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                label="Category / Trade"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                error={Boolean(fieldErrors.category)}
                helperText={fieldErrors.category}
              />
            </Grid>

            {/* Primary Phone */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                label="Primary Phone Number"
                value={formData.primaryPhone}
                onChange={(e) => handleInputChange('primaryPhone', e.target.value)}
                error={Boolean(fieldErrors.primaryPhone)}
                helperText={fieldErrors.primaryPhone || '10-digit contact number'}
              />
            </Grid>

            {/* Alternate Phone */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Alternate Phone Number (Optional)"
                value={formData.alternatePhone || ''}
                onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                error={Boolean(fieldErrors.alternatePhone)}
                helperText={fieldErrors.alternatePhone}
              />
            </Grid>

            {/* State */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                label="State"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                error={Boolean(fieldErrors.state)}
                helperText={fieldErrors.state}
              />
            </Grid>

            {/* City */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                label="City"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                error={Boolean(fieldErrors.city)}
                helperText={fieldErrors.city}
              />
            </Grid>

            {/* Address */}
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                fullWidth
                label="Complete Address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </Grid>

            {/* Pincode */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="PIN Code"
                value={formData.pincode || ''}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
              />
            </Grid>

            {/* Qualification */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Qualification / Certifications"
                value={formData.qualification}
                onChange={(e) => handleInputChange('qualification', e.target.value)}
              />
            </Grid>

            {/* Experience Years */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Years of Experience"
                value={formData.experienceYears}
                onChange={(e) => handleInputChange('experienceYears', parseInt(e.target.value, 10) || 0)}
                slotProps={{ htmlInput: { min: 0, max: 60 } }}
                error={Boolean(fieldErrors.experienceYears)}
                helperText={fieldErrors.experienceYears}
              />
            </Grid>

            {/* Services Offered Chips & Input */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Services Offered
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="e.g., Pipe Fitting, Wiring, Painting..."
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddService();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddService}
                  startIcon={<AddIcon />}
                  sx={{ borderColor: brandColors.borderDark, flexShrink: 0 }}
                >
                  Add
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, minHeight: 32 }}>
                {formData.servicesOffered.map((srv) => (
                  <Chip
                    key={srv}
                    label={srv}
                    onDelete={() => handleRemoveService(srv)}
                    size="small"
                    sx={{ backgroundColor: brandColors.warmWhiteDarker, border: `1px solid ${brandColors.border}` }}
                  />
                ))}
              </Box>
            </Grid>

            {/* Short Introduction */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Short Introduction / Bio"
                value={formData.shortIntro || ''}
                onChange={(e) => handleInputChange('shortIntro', e.target.value)}
                placeholder="Brief summary of skills, experience, and background..."
              />
            </Grid>

            {/* Listing Plan */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Listing Plan"
                value={formData.plan ?? 'FREE'}
                onChange={(e) => handleInputChange('plan', e.target.value as MistriPlan)}
                helperText="Switching to Free releases the paid top slot for this area. Switching to Paid claims it on the next approval (or now, if already approved)."
              >
                <MenuItem value="FREE">Free — standard listing</MenuItem>
                <MenuItem value="PAID">Paid — ₹500 / year, top slot</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${brandColors.border}`, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isSubmitting}
            sx={{ borderColor: brandColors.borderDark, color: brandColors.textPrimary }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            sx={{
              backgroundColor: brandColors.black,
              color: brandColors.white,
              '&:hover': { backgroundColor: brandColors.blackLight },
            }}
          >
            {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
