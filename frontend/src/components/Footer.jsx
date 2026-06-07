import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { Link } from 'react-router-dom';
import { GUTTER } from '../pages/AllEvents.style';

const NAV_LINKS = [
  { label: 'Events',  to: '/'        },
  { label: 'About',   to: '/about'   },
  { label: 'Contact', to: '/contact' },
];

const Footer = () => (
  <Box
    component="footer"
    sx={{
      px: GUTTER,
      pt: { xs: 6, md: 8 },
      pb: { xs: 4, md: 5 },
      borderTop: '1px solid rgba(240,244,248,0.06)',
      background: 'rgba(8,12,16,0.98)',
    }}
  >
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { sm: 'flex-start' },
        gap: { xs: 4, sm: 2 },
        mb: 5,
      }}
    >
      {/* Brand */}
      <Box sx={{ maxWidth: 280 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00D4FF 0%, #0088CC 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(0,212,255,0.25)',
            }}
          >
            <QrCodeScannerIcon sx={{ fontSize: 15, color: '#080C10' }} />
          </Box>
          <Typography
            sx={{
              fontFamily: '"Syne", sans-serif',
              fontWeight: 800,
              fontSize: '1rem',
              letterSpacing: '0.08em',
              color: '#F0F4F8',
            }}
          >
            SCANOVA
          </Typography>
        </Box>
        <Typography
          sx={{ fontSize: '0.82rem', color: '#4A5A69', lineHeight: 1.65 }}
        >
          Discover and attend the events that matter. From workshops to
          large-scale conferences — all in one place.
        </Typography>
      </Box>

      {/* Links */}
      <Box sx={{ display: 'flex', gap: { xs: 3, sm: 4 } }}>
        {NAV_LINKS.map((link) => (
          <Typography
            key={link.label}
            component={Link}
            to={link.to}
            sx={{
              fontSize: '0.85rem',
              color: '#7A8A99',
              cursor: 'pointer',
              textDecoration: 'none',
              '&:hover': { color: '#F0F4F8' },
              transition: 'color 0.2s',
            }}
          >
            {link.label}
          </Typography>
        ))}
      </Box>
    </Box>

    <Divider sx={{ borderColor: 'rgba(240,244,248,0.05)', mb: 3 }} />

    <Typography
      sx={{ fontSize: '0.78rem', color: '#2E3D4A', textAlign: 'center' }}
    >
      © {new Date().getFullYear()} Scanova. All rights reserved.
    </Typography>
  </Box>
);

export default Footer;
