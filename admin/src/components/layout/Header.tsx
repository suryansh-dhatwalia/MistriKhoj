import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RefreshIcon from '@mui/icons-material/Refresh';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { brandColors } from '../../theme/theme';

interface HeaderProps {
  onMobileToggle: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onMobileToggle,
  collapsed,
  onToggleCollapse,
}) => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  // Derive title & breadcrumb based on current route
  const getRouteInfo = () => {
    const path = location.pathname;
    if (path.includes('/mistris/pending')) {
      return { breadcrumb: 'Admin / Pending Mistris', title: 'Pending Review' };
    }
    if (path.includes('/mistris/approved')) {
      return { breadcrumb: 'Admin / Approved Mistris', title: 'Approved Directory' };
    }
    if (path.includes('/profile')) {
      return { breadcrumb: 'Admin / Profile', title: 'Administrator Settings' };
    }
    if (path.startsWith('/content/states')) return { breadcrumb: 'Admin / Masters', title: 'States' };
    if (path.startsWith('/content/cities')) return { breadcrumb: 'Admin / Masters', title: 'Cities' };
    if (path.startsWith('/content/categories')) return { breadcrumb: 'Admin / Masters', title: 'Categories' };
    if (path.startsWith('/content/referrals')) return { breadcrumb: 'Admin / Masters', title: 'Referrals' };
    if (path.startsWith('/content/ads/banners')) return { breadcrumb: 'Admin / Advertising', title: 'Banner Ads' };
    if (path.startsWith('/content/ads/category')) return { breadcrumb: 'Admin / Advertising', title: 'Category Ads' };
    if (path.startsWith('/content/ads/requests')) return { breadcrumb: 'Admin / Advertising', title: 'Ad Requests' };
    if (path.startsWith('/content/videos')) return { breadcrumb: 'Admin / Advertising', title: 'Videos' };
    if (path.startsWith('/content/testimonials')) return { breadcrumb: 'Admin / Content', title: 'Testimonials' };
    if (path.startsWith('/content/plans')) return { breadcrumb: 'Admin / Content', title: 'Subscription Plans' };
    if (path.startsWith('/reports/audit')) return { breadcrumb: 'Admin / Reports', title: 'Audit Log' };
    if (path.startsWith('/reports')) return { breadcrumb: 'Admin / Reports', title: 'Reports Overview' };
    if (path.startsWith('/settings')) return { breadcrumb: 'Admin / Settings', title: 'Site Settings' };
    return { breadcrumb: 'Admin / Dashboard', title: 'System Overview' };
  };

  const { breadcrumb, title } = getRouteInfo();

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleCloseMenu();
    navigate('/profile');
  };

  const handleLogoutClick = () => {
    handleCloseMenu();
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          height: 64,
          backgroundColor: brandColors.white,
          color: brandColors.textPrimary,
          borderBottom: `1px solid ${brandColors.border}`,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          justifyContent: 'center',
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: { xs: 2, sm: 3, md: 4 }, justifyContent: 'space-between' }}>
          {/* Left section: Breadcrumb and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Mobile menu button */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onMobileToggle}
              sx={{ display: { md: 'none' }, color: '#6B7280' }}
            >
              <MenuIcon />
            </IconButton>

            {/* Desktop expand button if collapsed */}
            {collapsed && (
              <IconButton
                size="small"
                onClick={onToggleCollapse}
                aria-label="expand sidebar"
                sx={{
                  display: { xs: 'none', md: 'inline-flex' },
                  color: '#6B7280',
                  border: `1px solid ${brandColors.border}`,
                  borderRadius: 1,
                  p: 0.75,
                }}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: '#6B7280',
                  fontWeight: 500,
                  lineHeight: 1.2,
                  mb: 0.25,
                }}
              >
                {breadcrumb}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  fontWeight: 700,
                  color: brandColors.textPrimary,
                  lineHeight: 1.2,
                }}
              >
                {title}
              </Typography>
            </Box>
          </Box>

          {/* Right Header Controls: Refresh & Admin user info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
            <Tooltip title="Refresh Dashboard View">
              <IconButton
                onClick={() => window.location.reload()}
                size="small"
                sx={{
                  color: '#6B7280',
                  p: 1,
                  borderRadius: '50%',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Divider and User Profile */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                borderLeft: `1px solid ${brandColors.border}`,
                pl: { xs: 1.5, sm: 2.5 },
                cursor: 'pointer',
              }}
              onClick={handleOpenMenu}
            >
              <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: brandColors.textPrimary,
                    lineHeight: 1.2,
                  }}
                >
                  {admin?.name || 'Administrator'}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    color: '#6B7280',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    lineHeight: 1.2,
                  }}
                >
                  Super Admin
                </Typography>
              </Box>

              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  backgroundColor: brandColors.black,
                  color: brandColors.mustard,
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  border: '2px solid #FFFFFF',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                }}
              >
                {admin?.name?.charAt(0).toUpperCase() || 'A'}
              </Avatar>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{
                paper: {
                  elevation: 2,
                  sx: {
                    mt: 1,
                    minWidth: 210,
                    borderRadius: 1.5,
                    border: `1px solid ${brandColors.border}`,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: brandColors.textPrimary }}>
                  {admin?.name || 'Administrator'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                  {admin?.email || 'admin@mistrikhoj.com'}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleProfileClick} sx={{ py: 1.25 }}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Admin Profile" />
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={handleLogoutClick}
                sx={{
                  py: 1.25,
                  color: brandColors.error,
                  '&:hover': { backgroundColor: brandColors.errorLight },
                }}
              >
                <ListItemIcon sx={{ color: brandColors.error }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Log Out" />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        open={showLogoutConfirm}
        title="Sign Out of Admin Console"
        message="Are you sure you want to end your current administrator session?"
        confirmText="Log Out"
        cancelText="Cancel"
        severity="error"
        isLoading={isLoggingOut}
        onConfirm={handleConfirmLogout}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};
