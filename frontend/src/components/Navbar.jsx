import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button,
  Container, Box, Avatar,
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Derive up-to-two initials from a full name string.
// filter(Boolean) removes empty segments caused by double spaces.
const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase();

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: scrolled ? 'rgba(8,12,16,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled
          ? '1px solid rgba(0,212,255,0.08)'
          : '1px solid transparent',
        transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 0.5 }}>

          {/* ── Logo ── */}
          <Box
            component={Link}
            to="/"
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
                background: 'linear-gradient(135deg,#00D4FF 0%,#0088CC 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(0,212,255,0.35)',
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

          {/* ── Nav items ── */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Button
              component={Link}
              to="/"
              sx={{
                color: '#7A8A99',
                fontSize: '0.875rem',
                px: 2,
                '&:hover': { color: '#F0F4F8', background: 'rgba(240,244,248,0.05)' },
                transition: 'all 0.2s',
              }}
            >
              Events
            </Button>

            {user ? (
              /* ── Logged-in ── */
              <>
                <Box
                  component={Link}
                  to="/profile"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    ml: 1,
                    pl: 1.5,
                    borderLeft: '1px solid rgba(240,244,248,0.08)',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    px: 1,
                    py: 0.5,
                    transition: 'background 0.2s',
                    '&:hover': { background: 'rgba(240,244,248,0.05)' },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: 'rgba(0,212,255,0.12)',
                      color: '#00D4FF',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      border: '1px solid rgba(0,212,255,0.25)',
                      fontFamily: '"Syne", sans-serif',
                    }}
                  >
                    {getInitials(user.full_name ?? '')}
                  </Avatar>

                  <Typography
                    sx={{
                      color: '#F0F4F8',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      display: { xs: 'none', sm: 'block' },
                    }}
                  >
                    {user.full_name?.split(' ')[0] ?? 'User'}
                  </Typography>
                </Box>

                <Button
                  onClick={handleLogout}
                  sx={{
                    ml: 0.5,
                    color: '#7A8A99',
                    fontSize: '0.875rem',
                    px: 2,
                    '&:hover': { color: '#F0F4F8', background: 'rgba(240,244,248,0.05)' },
                    transition: 'all 0.2s',
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              /* ── Logged-out ── */
              <>
                <Button
                  component={Link}
                  to="/login"
                  sx={{
                    color: '#7A8A99',
                    fontSize: '0.875rem',
                    px: 2,
                    '&:hover': { color: '#F0F4F8', background: 'rgba(240,244,248,0.05)' },
                    transition: 'all 0.2s',
                  }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="outlined"
                  sx={{
                    ml: 1,
                    color: '#00D4FF',
                    borderColor: 'rgba(0,212,255,0.35)',
                    fontSize: '0.875rem',
                    px: 2.5,
                    '&:hover': {
                      borderColor: '#00D4FF',
                      background: 'rgba(0,212,255,0.08)',
                      boxShadow: '0 0 20px rgba(0,212,255,0.15)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>

        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
