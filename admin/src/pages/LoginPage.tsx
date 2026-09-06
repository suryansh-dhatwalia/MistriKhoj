import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Container,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { brandColors } from '../theme/theme';

type LoginLocationState = { from?: { pathname?: string } };

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading, loginError, serverError, clearErrors } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // If already authenticated and not loading, redirect to dashboard
  if (!isLoading && isAuthenticated) {
    const destination = (location.state as LoginLocationState | null)?.from?.pathname || '/dashboard';
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsSubmitting(true);
    const success = await login({ email: email.trim(), password });
    setIsSubmitting(false);

    if (success) {
      const destination = (location.state as LoginLocationState | null)?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: brandColors.warmWhite,
        px: 2,
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Card
          elevation={0}
          sx={{
            borderRadius: '6px',
            border: `1px solid ${brandColors.border}`,
            p: { xs: 2, sm: 3 },
            backgroundColor: brandColors.white,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardContent sx={{ p: 1 }}>
            {/* Brand Logo & Title */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '6px',
                  backgroundColor: brandColors.black,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: brandColors.mustard,
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  mb: 1.5,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }}
              >
                MK
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 800, color: brandColors.textPrimary }}>
                MistriKhoj
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: brandColors.mustardDark,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  mt: 0.25,
                }}
              >
                Admin Control Console
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: brandColors.textSecondary, mt: 1, textAlign: 'center' }}
              >
                Sign in with your administrative credentials to manage registrations
              </Typography>
            </Box>

            {/* Error Alerts */}
            {loginError && (
              <Alert
                severity="error"
                onClose={clearErrors}
                sx={{ mb: 2.5, borderRadius: 2, fontSize: '0.875rem' }}
              >
                {loginError}
              </Alert>
            )}

            {serverError && (
              <Alert
                severity="warning"
                onClose={clearErrors}
                sx={{ mb: 2.5, borderRadius: 2, fontSize: '0.875rem' }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Server Unavailable
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.25 }}>
                  {serverError}
                </Typography>
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Admin Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (loginError || serverError) clearErrors();
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon fontSize="small" sx={{ color: brandColors.textSecondary }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (loginError || serverError) clearErrors();
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon fontSize="small" sx={{ color: brandColors.textSecondary }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting || !email.trim() || !password.trim()}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.25,
                  backgroundColor: brandColors.black,
                  color: brandColors.white,
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  '&:hover': {
                    backgroundColor: brandColors.blackLight,
                  },
                }}
              >
                {isSubmitting ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    <span>Signing in...</span>
                  </Box>
                ) : (
                  'Sign In to Dashboard'
                )}
              </Button>
            </Box>

            {/* Security note */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                mt: 2,
                pt: 2,
                borderTop: `1px solid ${brandColors.border}`,
                color: brandColors.textSecondary,
              }}
            >
              <SecurityIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption">
                Protected by secure HTTP-only cookie sessions
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
