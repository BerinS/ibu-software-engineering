import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: scrolled
          ? 'rgba(8, 12, 16, 0.85)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled
          ? '1px solid rgba(0, 212, 255, 0.08)'
          : '1px solid transparent',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 0.5 }}>
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexGrow: 1,
              textDecoration: 'none',
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '9px',
                background: 'linear-gradient(135deg, #00D4FF 0%, #0088CC 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(0, 212, 255, 0.35)',
              }}
            >
              <QrCodeScannerIcon sx={{ fontSize: 18, color: '#080C10' }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Syne", sans-serif',
                fontWeight: 800,
                fontSize: '1.15rem',
                letterSpacing: '0.08em',
                color: '#F0F4F8',
              }}
            >
              SCANOVA
            </Typography>
          </Box>

          {/* Nav links */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Button
              sx={{
                color: '#7A8A99',
                fontSize: '0.875rem',
                px: 2,
                '&:hover': {
                  color: '#F0F4F8',
                  background: 'rgba(240, 244, 248, 0.05)',
                },
                transition: 'all 0.2s',
              }}
            >
              Events
            </Button>
            <Button
              variant="outlined"
              sx={{
                ml: 1,
                color: '#00D4FF',
                borderColor: 'rgba(0, 212, 255, 0.35)',
                fontSize: '0.875rem',
                px: 2.5,
                '&:hover': {
                  borderColor: '#00D4FF',
                  background: 'rgba(0, 212, 255, 0.08)',
                  boxShadow: '0 0 20px rgba(0, 212, 255, 0.15)',
                },
                transition: 'all 0.2s',
              }}
            >
              Login
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;