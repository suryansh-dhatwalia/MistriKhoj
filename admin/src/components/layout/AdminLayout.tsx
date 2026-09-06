import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumbs } from './Breadcrumbs';
import { brandColors } from '../../theme/theme';

export const AdminLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const handleMobileToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleToggleCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: brandColors.warmWhite }}>
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0, // Prevents flex child from overflowing
          minHeight: '100vh',
        }}
      >
        <Header
          onMobileToggle={handleMobileToggle}
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
        />

        <Box sx={{ flex: 1, p: { xs: 2, sm: 3, md: 4 } }}>
          <Container maxWidth="xl" disableGutters>
            <Breadcrumbs />
            <Outlet />
          </Container>
        </Box>
      </Box>
    </Box>
  );
};
