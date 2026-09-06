import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import { brandColors } from '../theme/theme';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 8,
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontWeight: 900,
            fontSize: { xs: '4rem', sm: '6rem' },
            color: brandColors.mustard,
            lineHeight: 1,
            mb: 1,
          }}
        >
          404
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: 800, color: brandColors.textPrimary, mb: 1 }}>
          Page Not Found
        </Typography>

        <Typography variant="body1" sx={{ color: brandColors.textSecondary, mb: 4, maxWidth: 420 }}>
          The administrator page or resource you are looking for does not exist or has been relocated.
        </Typography>

        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{
            backgroundColor: brandColors.black,
            color: brandColors.white,
            fontWeight: 700,
            px: 3,
            py: 1.25,
            '&:hover': { backgroundColor: brandColors.blackLight },
          }}
        >
          Return to Dashboard
        </Button>
      </Box>
    </Container>
  );
};
