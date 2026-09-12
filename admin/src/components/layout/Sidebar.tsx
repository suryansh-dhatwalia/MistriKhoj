import React, { useMemo, useState } from 'react';
import {
  Box,
  Collapse,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { clientEnv } from '../../config/env';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import PublicIcon from '@mui/icons-material/Public';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import CategoryIcon from '@mui/icons-material/Category';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import CampaignIcon from '@mui/icons-material/Campaign';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import InsightsIcon from '@mui/icons-material/Insights';
import HistoryIcon from '@mui/icons-material/History';
import TuneIcon from '@mui/icons-material/Tune';
import { brandColors } from '../../theme/theme';

export const DRAWER_WIDTH = 264;
export const COLLAPSED_DRAWER_WIDTH = 76;

interface NavLeaf {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavGroup {
  label: string;
  icon: React.ReactNode;
  children: NavLeaf[];
}

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

  const topLevel: NavLeaf[] = [{ label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> }];

  const groups: NavGroup[] = useMemo(
    () => [
      {
        label: 'Mistris',
        icon: <VerifiedIcon />,
        children: [
          {
            label: 'Pending Registrations',
            path: '/mistris/pending',
            icon: <PendingActionsIcon />,
            badge: pendingCount && pendingCount > 0 ? pendingCount : undefined,
          },
          { label: 'Approved Mistris', path: '/mistris/approved', icon: <VerifiedIcon /> },
        ],
      },
      {
        label: 'Masters',
        icon: <PublicIcon />,
        children: [
          { label: 'States', path: '/content/states', icon: <PublicIcon /> },
          { label: 'Cities', path: '/content/cities', icon: <LocationCityIcon /> },
          { label: 'Categories', path: '/content/categories', icon: <CategoryIcon /> },
          { label: 'Referrals', path: '/content/referrals', icon: <CardGiftcardIcon /> },
        ],
      },
      {
        label: 'Advertising',
        icon: <CampaignIcon />,
        children: [
          { label: 'Banner Ads', path: '/content/ads/banners', icon: <ViewCarouselIcon /> },
          { label: 'Category Ads', path: '/content/ads/category', icon: <CampaignIcon /> },
          { label: 'Videos', path: '/content/videos', icon: <OndemandVideoIcon /> },
          { label: 'Ad Requests', path: '/content/ads/requests', icon: <MoveToInboxIcon /> },
        ],
      },
      {
        label: 'Content',
        icon: <FormatQuoteIcon />,
        children: [
          { label: 'Testimonials', path: '/content/testimonials', icon: <FormatQuoteIcon /> },
          { label: 'Plans', path: '/content/plans', icon: <WorkspacePremiumIcon /> },
        ],
      },
      {
        label: 'Reports',
        icon: <InsightsIcon />,
        children: [
          { label: 'Overview', path: '/reports', icon: <InsightsIcon /> },
          { label: 'Audit Log', path: '/reports/audit', icon: <HistoryIcon /> },
        ],
      },
      {
        label: 'Settings',
        icon: <TuneIcon />,
        children: [
          { label: 'Site Settings', path: '/settings', icon: <TuneIcon /> },
          { label: 'Admin Profile', path: '/profile', icon: <PersonIcon /> },
        ],
      },
    ],
    [pendingCount],
  );

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const group of groups) {
      initial[group.label] = group.children.some((child) => location.pathname.startsWith(child.path));
    }
    return initial;
  });

  const flatLeaves = [...topLevel, ...groups.flatMap((group) => group.children)];

  const renderLeaf = (item: NavLeaf, indented: boolean) => {
    const isActive = location.pathname === item.path;
    const button = (
      <ListItemButton
        component={NavLink}
        to={item.path}
        onClick={() => {
          if (mobileOpen) onMobileClose();
        }}
        sx={{
          minHeight: 42,
          borderRadius: '6px',
          pl: collapsed ? 1.5 : indented ? 3.5 : 2,
          pr: collapsed ? 1.5 : 2,
          py: 1,
          backgroundColor: isActive ? brandColors.mustard : 'transparent',
          color: isActive ? brandColors.black : '#9CA3AF',
          '&:hover': {
            backgroundColor: isActive ? brandColors.mustard : 'rgba(255,255,255,0.08)',
            color: isActive ? brandColors.black : brandColors.white,
          },
        }}
      >
        <ListItemIcon
          sx={{ minWidth: 0, mr: collapsed ? 0 : 1.75, justifyContent: 'center', color: isActive ? brandColors.black : 'inherit' }}
        >
          {item.icon}
        </ListItemIcon>
        {!collapsed && (
          <>
            <ListItemText primary={<Typography sx={{ fontSize: '0.8125rem', fontWeight: isActive ? 600 : 500, color: 'inherit' }}>{item.label}</Typography>} />
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
                }}
              />
            )}
          </>
        )}
      </ListItemButton>
    );

    return (
      <ListItem key={item.path} disablePadding sx={{ display: 'block' }}>
        {collapsed ? (
          <Tooltip title={item.label} placement="right">
            {button}
          </Tooltip>
        ) : (
          button
        )}
      </ListItem>
    );
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: brandColors.black, color: brandColors.white }}>
      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          px: collapsed ? 1.5 : 3,
          borderBottom: '1px solid #1F2937',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '2px',
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
            <Typography sx={{ color: brandColors.white, fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
              MistriKhoj
            </Typography>
          )}
        </Box>
        {!collapsed && (
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <IconButton size="small" onClick={onToggleCollapse} sx={{ color: '#9CA3AF', '&:hover': { color: brandColors.white } }}>
              <ChevronLeftIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      <Box sx={{ flex: 1, py: 2, px: 2, overflowY: 'auto' }}>
        {collapsed ? (
          <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {flatLeaves.map((leaf) => renderLeaf(leaf, false))}
          </List>
        ) : (
          <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            {topLevel.map((leaf) => renderLeaf(leaf, false))}
            {groups.map((group) => {
              const isOpen = openGroups[group.label] ?? false;
              const hasActiveChild = group.children.some((child) => location.pathname === child.path);
              return (
                <Box key={group.label} sx={{ mt: 0.75 }}>
                  <ListItemButton
                    onClick={() => setOpenGroups((prev) => ({ ...prev, [group.label]: !isOpen }))}
                    sx={{
                      minHeight: 40,
                      borderRadius: '6px',
                      px: 2,
                      py: 0.75,
                      color: hasActiveChild ? brandColors.white : '#9CA3AF',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)', color: brandColors.white },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, mr: 1.75, color: 'inherit' }}>{group.icon}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'inherit' }}>
                          {group.label}
                        </Typography>
                      }
                    />
                    {isOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </ListItemButton>
                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 0.25, mt: 0.25 }}>
                      {group.children.map((child) => renderLeaf(child, true))}
                    </List>
                  </Collapse>
                </Box>
              );
            })}
          </List>
        )}
      </Box>

      <Box sx={{ p: 2, borderTop: '1px solid #1F2937', flexShrink: 0 }}>
        {!collapsed ? (
          <Box
            component="a"
            href={clientEnv.publicWebsiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1.5,
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)', color: brandColors.mustard },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BuildCircleIcon sx={{ fontSize: 18, color: brandColors.mustard }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: brandColors.white }}>
                Open Public Website
              </Typography>
            </Box>
            <OpenInNewIcon sx={{ fontSize: 16 }} />
          </Box>
        ) : (
          <Tooltip title="Open Public Website" placement="right">
            <IconButton
              component="a"
              href={clientEnv.publicWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ width: '100%', borderRadius: 2, color: brandColors.mustard, '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' } }}
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
      sx={{ width: { md: collapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH }, flexShrink: { md: 0 }, transition: 'width 0.2s ease-in-out' }}
      aria-label="Admin navigation"
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: 'none' },
        }}
      >
        {drawerContent}
      </Drawer>

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
