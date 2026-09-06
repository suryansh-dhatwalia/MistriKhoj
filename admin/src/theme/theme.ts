import { createTheme } from '@mui/material/styles';

export const brandColors = {
  black: '#161616',
  blackLight: '#222222',
  warmWhite: '#FAF7F2',
  warmWhiteDarker: '#F3EFEA',
  mustard: '#FFB800',
  mustardDark: '#E6A600',
  mustardLight: '#FEF3C7',
  white: '#FFFFFF',
  success: '#16A34A',
  successLight: '#F0FDF4',
  error: '#DC2626',
  errorLight: '#FEF2F2',
  warning: '#D97706',
  warningLight: '#FFFBEB',
  info: '#2563EB',
  infoLight: '#EFF6FF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',
  textPrimary: '#161616',
  textSecondary: '#6B7280',
  textDisabled: '#9CA3AF',
  sidebarBg: '#161616',
  sidebarBorder: '#1F2937',
  sidebarMuted: '#9CA3AF',
};

export const theme = createTheme({
  palette: {
    primary: {
      main: brandColors.black,
      contrastText: brandColors.white,
    },
    secondary: {
      main: brandColors.mustard,
      contrastText: brandColors.black,
      dark: brandColors.mustardDark,
      light: brandColors.mustardLight,
    },
    background: {
      default: brandColors.warmWhite,
      paper: brandColors.white,
    },
    text: {
      primary: brandColors.textPrimary,
      secondary: brandColors.textSecondary,
      disabled: brandColors.textDisabled,
    },
    success: {
      main: brandColors.success,
      contrastText: brandColors.white,
      light: brandColors.successLight,
    },
    error: {
      main: brandColors.error,
      contrastText: brandColors.white,
      light: brandColors.errorLight,
    },
    warning: {
      main: brandColors.warning,
      contrastText: brandColors.black,
      light: brandColors.warningLight,
    },
    divider: brandColors.border,
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2rem',
      color: brandColors.textPrimary,
    },
    h2: {
      fontWeight: 700,
      fontSize: '1.75rem',
      color: brandColors.textPrimary,
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.5rem',
      color: brandColors.textPrimary,
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.25rem',
      color: brandColors.textPrimary,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      color: brandColors.textPrimary,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      color: brandColors.textPrimary,
    },
    subtitle1: {
      fontSize: '0.9375rem',
      fontWeight: 500,
      color: brandColors.textSecondary,
    },
    subtitle2: {
      fontSize: '0.8125rem',
      fontWeight: 600,
      color: brandColors.textSecondary,
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.6,
      color: brandColors.textPrimary,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: brandColors.textSecondary,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '8px 16px',
          boxShadow: 'none',
          fontWeight: 600,
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundColor: brandColors.black,
          color: brandColors.white,
          '&:hover': {
            backgroundColor: brandColors.blackLight,
          },
        },
        outlined: {
          borderColor: brandColors.borderDark,
          color: brandColors.textPrimary,
          '&:hover': {
            borderColor: brandColors.black,
            backgroundColor: 'rgba(22, 22, 22, 0.04)',
          },
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'secondary' },
          style: {
            backgroundColor: brandColors.mustard,
            color: brandColors.black,
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            '&:hover': {
              backgroundColor: brandColors.mustardDark,
            },
          },
        },
      ],
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          border: `1px solid ${brandColors.border}`,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          backgroundColor: brandColors.white,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: brandColors.white,
          fontWeight: 700,
          color: brandColors.textDisabled,
          fontSize: '0.6875rem', // 11px
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          borderBottom: `1px solid ${brandColors.borderLight}`,
          padding: '12px 24px',
        },
        body: {
          fontSize: '0.875rem',
          padding: '14px 24px',
          borderBottom: `1px solid ${brandColors.borderLight}`,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.15s ease',
          '&:hover': {
            backgroundColor: 'rgba(250, 247, 242, 0.6) !important',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 4,
          fontSize: '0.75rem',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: brandColors.border,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: brandColors.borderDark,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: brandColors.black,
            borderWidth: 1.5,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          border: `1px solid ${brandColors.border}`,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});
