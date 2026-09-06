import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SaveIcon from '@mui/icons-material/Save';
import LockResetIcon from '@mui/icons-material/LockReset';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { useAuth } from '../auth/useAuth';
import { profileApi } from '../api/profile.api';
import { parseApiError } from '../utils/error.utils';
import { brandColors } from '../theme/theme';

export const ProfilePage: React.FC = () => {
  const { admin, refreshAdmin } = useAuth();

  // Profile edit state
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showCurrent, setShowCurrent] = useState<boolean>(false);
  const [showNew, setShowNew] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [isSavingPassword, setIsSavingPassword] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (admin) {
      setName(admin.name || '');
      setEmail(admin.email || '');
      setPhone(admin.phone || '');
    }
  }, [admin]);

  // Password requirement tests
  const passwordRequirements = [
    { label: 'At least 8 characters long', valid: newPassword.length >= 8 },
    { label: 'Contains at least one uppercase letter (A-Z)', valid: /[A-Z]/.test(newPassword) },
    { label: 'Contains at least one lowercase letter (a-z)', valid: /[a-z]/.test(newPassword) },
    { label: 'Contains at least one digit (0-9)', valid: /\d/.test(newPassword) },
    { label: 'Passwords match', valid: Boolean(newPassword && newPassword === confirmPassword) },
  ];

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);

    if (!name.trim()) {
      setProfileError('Admin name is required.');
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setProfileError('A valid email address is required.');
      return;
    }

    setIsSavingProfile(true);
    try {
      await profileApi.updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
      });
      await refreshAdmin();
      setToast({
        open: true,
        message: 'Admin profile updated successfully.',
        severity: 'success',
      });
    } catch (err) {
      const parsed = parseApiError(err);
      setProfileError(parsed.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsSavingPassword(true);
    try {
      await profileApi.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setToast({
        open: true,
        message: 'Password changed successfully.',
        severity: 'success',
      });
    } catch (err) {
      const parsed = parseApiError(err);
      setPasswordError(parsed.message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: brandColors.textPrimary }}>
          Administrator Profile
        </Typography>
        <Typography variant="body2" sx={{ color: brandColors.textSecondary, mt: 0.5 }}>
          Manage your administrator account details, email address, and security credentials
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Info Form */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: '4px',
              border: `1px solid ${brandColors.border}`,
              backgroundColor: brandColors.white,
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '4px',
                    backgroundColor: '#F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: brandColors.textPrimary,
                  }}
                >
                  <PersonIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Profile Details
                  </Typography>
                  <Typography variant="caption" sx={{ color: brandColors.textSecondary }}>
                    Update your display name and contact email
                  </Typography>
                </Box>
              </Box>

              {profileError && (
                <Alert severity="error" sx={{ mb: 2.5, borderRadius: '4px' }}>
                  {profileError}
                </Alert>
              )}

              <Box component="form" onSubmit={handleUpdateProfile}>
                <TextField
                  fullWidth
                  required
                  label="Administrator Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  margin="normal"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon fontSize="small" sx={{ color: brandColors.textSecondary }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  fullWidth
                  required
                  type="email"
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon fontSize="small" sx={{ color: brandColors.textSecondary }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Phone Number (Optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  margin="normal"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon fontSize="small" sx={{ color: brandColors.textSecondary }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSavingProfile}
                  startIcon={
                    isSavingProfile ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />
                  }
                  sx={{
                    mt: 3,
                    backgroundColor: brandColors.black,
                    color: brandColors.white,
                    fontWeight: 700,
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.025em',
                    '&:hover': { backgroundColor: brandColors.blackLight },
                  }}
                >
                  {isSavingProfile ? 'Saving Profile...' : 'Save Profile Changes'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Change Password Form */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: '4px',
              border: `1px solid ${brandColors.border}`,
              backgroundColor: brandColors.white,
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '4px',
                    backgroundColor: brandColors.mustardLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: brandColors.black,
                  }}
                >
                  <LockResetIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Change Password
                  </Typography>
                  <Typography variant="caption" sx={{ color: brandColors.textSecondary }}>
                    Ensure your account is using a strong, unique password
                  </Typography>
                </Box>
              </Box>

              {passwordError && (
                <Alert severity="error" sx={{ mb: 2.5, borderRadius: '4px' }}>
                  {passwordError}
                </Alert>
              )}

              <Box component="form" onSubmit={handleChangePassword}>
                <TextField
                  fullWidth
                  required
                  label="Current Password"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  margin="normal"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon fontSize="small" sx={{ color: brandColors.textSecondary }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowCurrent(!showCurrent)}
                            edge="end"
                            size="small"
                          >
                            {showCurrent ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  fullWidth
                  required
                  label="New Password"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  margin="normal"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon fontSize="small" sx={{ color: brandColors.textSecondary }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowNew(!showNew)} edge="end" size="small">
                            {showNew ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  fullWidth
                  required
                  label="Confirm New Password"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  margin="normal"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon fontSize="small" sx={{ color: brandColors.textSecondary }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirm(!showConfirm)}
                            edge="end"
                            size="small"
                          >
                            {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                {/* Password strength checklist */}
                {newPassword && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: brandColors.warmWhiteDarker,
                      border: `1px solid ${brandColors.border}`,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: brandColors.textPrimary }}>
                      Password Requirements:
                    </Typography>
                    <List dense sx={{ p: 0, mt: 0.5 }}>
                      {passwordRequirements.map((req, idx) => (
                        <ListItem key={idx} disableGutters sx={{ py: 0.25 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            {req.valid ? (
                              <CheckCircleIcon sx={{ fontSize: 16, color: brandColors.success }} />
                            ) : (
                              <CancelIcon sx={{ fontSize: 16, color: brandColors.textDisabled }} />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography
                                sx={{
                                  fontSize: '0.75rem',
                                  color: req.valid ? brandColors.textPrimary : brandColors.textSecondary,
                                }}
                              >
                                {req.label}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword}
                  startIcon={
                    isSavingPassword ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <LockResetIcon />
                    )
                  }
                  sx={{
                    mt: 3,
                    backgroundColor: brandColors.black,
                    color: brandColors.white,
                    fontWeight: 700,
                    '&:hover': { backgroundColor: brandColors.blackLight },
                  }}
                >
                  {isSavingPassword ? 'Updating Password...' : 'Update Password'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar feedback */}
      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
