import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import VerifiedIcon from '@mui/icons-material/Verified';
import PersonIcon from '@mui/icons-material/Person';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import { brandColors } from '../../theme/theme';

export const DRAWER_WIDTH = 256;
export const COLLAPSED_DRAWER_WIDTH = 76;

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  pendingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  onMobileClose,
  collapsed,
  onToggleCollapse,
  pendingCount,
}) => {
  const location = useLocation();

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <DashboardIcon />,
    },
    {
      label: 'Pending Registrations',
      path: '/mistris/pending',
      icon: <PendingActionsIcon />,
      badge: pendingCount && pendingCount > 0 ? pendingCount : undefined,
      badgeColor: brandColors.mustard,
    },
    {
      label: 'Approved Mistris',
      path: '/mistris/approved',
      icon: <VerifiedIcon />,
    },
    {
      label: 'Admin Profile',
      path: '/profile',
      icon: <PersonIcon />,
    },
  ];

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: brandColors.black,
        color: brandColors.white,
      }}
    >
      {/* Brand Header */}
      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          px: collapsed ? 1.5 : 3,
          borderBottom: '1px solid #1F2937',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '2px', // geometric sharp corners rounded-sm
              backgroundColor: brandColors.mustard,
              color: brandColors.black,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.875rem',
              flexShrink: 0,
            }}
          >
            MK
          </Box>
          {!collapsed && (
            <Box sx={{ overflow: 'hidden' }}>
              <Typography
                sx={{
                  color: brandColors.white,
                  fontWeight: 700,
                  fontSize: '1.25rem', // text-xl
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                }}
              >
                MistriKhoj
              </Typography>
            </Box>
          )}
        </Box>

        {/* Desktop Collapse Toggle */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          {!collapsed && (
            <IconButton
              size="small"
              onClick={onToggleCollapse}
              sx={{ color: '#9CA3AF', '&:hover': { color: brandColors.white } }}
            >
              <ChevronLeftIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Navigation Links */}
      <Box sx={{ flex: 1, py: 2, px: 2 }}>
        <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;

            const buttonContent = (
              <ListItemButton
                component={NavLink}
                to={item.path}
                onClick={() => {
                  if (mobileOpen) onMobileClose();
                }}
                sx={{
                  minHeight: 44,
                  borderRadius: '6px', // rounded-md
                  px: collapsed ? 1.5 : 2,
                  py: 1.25,
                  backgroundColor: isActive ? brandColors.mustard : 'transparent',
                  color: isActive ? brandColors.black : '#9CA3AF',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    backgroundColor: isActive ? brandColors.mustard : 'rgba(255, 255, 255, 0.08)',
                    color: isActive ? brandColors.black : brandColors.white,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: collapsed ? 0 : 2,
                    justifyContent: 'center',
                    color: isActive ? brandColors.black : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 500 }}>
                          {item.label}
                        </Typography>
                      }
                    />
                    {item.badge !== undefined && (
                      <Chip
                        label={item.badge}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          backgroundColor: isActive ? brandColors.black : brandColors.mustard,
                          color: isActive ? brandColors.mustard : brandColors.black,
                          borderRadius: '4px',
                        }}
                      />
                    )}
                  </>
                )}
              </ListItemButton>
            );

            return (
              <ListItem key={item.path} disablePadding>
                {collapsed ? (
                  <Tooltip title={item.label} placement="right">
                    {buttonContent}
                  </Tooltip>
                ) : (
                  buttonContent
                )}
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer Info: Public Site Link */}
      <Box sx={{ p: 2, borderTop: '1px solid #1F2937' }}>
        {!collapsed ? (
          <Box
            component="a"
            href={import.meta.env.VITE_PUBLIC_WEBSITE_URL || 'http://localhost:5173'}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1.5,
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'rgba(255, 255, 255, 0.7)',
              textDecoration: 'none',
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: brandColors.mustard,
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BuildCircleIcon sx={{ fontSize: 18, color: brandColors.mustard }} />
              <Box>
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, color: brandColors.white }}>
                  Public Website
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.6875rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                  localhost:5173
                </Typography>
              </Box>
            </Box>
            <OpenInNewIcon sx={{ fontSize: 16 }} />
          </Box>
        ) : (
          <Tooltip title="Open Public Website (localhost:5173)" placement="right">
            <IconButton
              component="a"
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                width: '100%',
                borderRadius: 2,
                color: brandColors.mustard,
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
              }}
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { md: collapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH },
        flexShrink: { md: 0 },
        transition: 'width 0.2s ease-in-out',
      }}
      aria-label="Admin navigation"
    >
      {/* Mobile temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            borderRight: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop permanent drawer */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: collapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH,
            borderRight: 'none',
            transition: 'width 0.2s ease-in-out',
            overflowX: 'hidden',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};
