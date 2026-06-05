import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button,
  Alert, CircularProgress, Link as MuiLink,
} from '@mui/material';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { useAuth } from '../context/AuthContext';

// ── Client-side validation ─────────────────────────────────────────────────

const validate = ({ email, password }) => {
  const errs = {};
  if (!email.trim())
    errs.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errs.email = 'Enter a valid email address';
  if (!password)
    errs.password = 'Password is required';
  return errs;
};

// ── Page ───────────────────────────────────────────────────────────────────

const LoginPage = () => {
  const navigate       = useNavigate();
  const location       = useLocation();
  const { user, login } = useAuth();

  // Already logged in — nothing to do here
  if (user) return <Navigate to="/" replace />;

  const [form,        setForm]        = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading,     setLoading]     = useState(false);

  // Redirect to the page the user was trying to reach, or home
  const redirectTo = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true);
    setServerError('');

    try {
      const res  = await fetch('http://localhost:5000/api/users/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || 'Login failed. Please try again.');
        return;
      }

      login(data);
      navigate(redirectTo, { replace: true });
    } catch {
      setServerError('Unable to reach the server. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={pageWrapperSx}>
      <Box sx={cardSx}>

        {/* Branding */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
          <Box sx={logoBubbleSx}>
            <QrCodeScannerIcon sx={{ fontSize: 16, color: '#080C10' }} />
          </Box>
          <Typography sx={logoTextSx}>SCANOVA</Typography>
        </Box>

        <Typography variant="h5" sx={headingSx}>Welcome back.</Typography>
        <Typography sx={subtitleSx}>Sign in to continue</Typography>

        {serverError && (
          <Alert severity="error" sx={alertSx}>{serverError}</Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            autoFocus
            value={form.email}
            onChange={handleChange}
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
            fullWidth
          />
          <TextField
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            error={!!fieldErrors.password}
            helperText={fieldErrors.password}
            fullWidth
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={submitBtnSx}
          >
            {loading
              ? <CircularProgress size={20} sx={{ color: '#080C10' }} />
              : 'Sign In'}
          </Button>
        </Box>

        <Typography sx={footnoteSx}>
          Don't have an account?{' '}
          <MuiLink component={Link} to="/register" sx={footnoteLinkSx}>
            Register
          </MuiLink>
        </Typography>

      </Box>
    </Box>
  );
};

export default LoginPage;

// ── Styles ─────────────────────────────────────────────────────────────────

const pageWrapperSx = {
  minHeight: '100vh',
  background: '#080C10',
  backgroundImage: 'radial-gradient(rgba(0,212,255,0.06) 1px, transparent 2px)',
  backgroundSize: '32px 32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  px: 3,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60vw',
    height: '40vh',
    background: 'radial-gradient(ellipse at center top, rgba(0,212,255,0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
};

const cardSx = {
  position: 'relative',
  zIndex: 1,
  width: '100%',
  maxWidth: 420,
  background: 'rgba(14,19,24,0.85)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(240,244,248,0.08)',
  borderRadius: '20px',
  p: { xs: 4, md: 5 },
  animation: 'fadeSlideUp 0.45s ease both',
};

const logoBubbleSx = {
  width: 32,
  height: 32,
  borderRadius: '8px',
  background: 'linear-gradient(135deg,#00D4FF,#0088CC)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 0 14px rgba(0,212,255,0.3)',
};

const logoTextSx = {
  fontFamily: '"Syne", sans-serif',
  fontWeight: 800,
  letterSpacing: '0.08em',
  fontSize: '1rem',
  color: '#F0F4F8',
};

const headingSx = {
  fontFamily: '"Syne", sans-serif',
  fontWeight: 800,
  fontSize: '1.65rem',
  color: '#F0F4F8',
  mb: 0.5,
};

const subtitleSx = {
  color: '#7A8A99',
  fontSize: '0.875rem',
  mb: 3,
};

const alertSx = {
  mb: 2,
  bgcolor: 'rgba(239,68,68,0.1)',
  color: '#fca5a5',
  border: '1px solid rgba(239,68,68,0.2)',
  '& .MuiAlert-icon': { color: '#f87171' },
};

const submitBtnSx = {
  mt: 0.5,
  py: 1.3,
  background: 'linear-gradient(135deg,#00D4FF,#0088CC)',
  color: '#080C10',
  fontFamily: '"DM Sans", sans-serif',
  fontWeight: 700,
  fontSize: '0.95rem',
  letterSpacing: '0.02em',
  boxShadow: 'none',
  '&:hover': {
    background: 'linear-gradient(135deg,#00BFEA,#0077BB)',
    boxShadow: '0 0 24px rgba(0,212,255,0.25)',
  },
  '&.Mui-disabled': { opacity: 0.55 },
};

const footnoteSx = {
  mt: 3,
  textAlign: 'center',
  fontSize: '0.85rem',
  color: '#7A8A99',
};

const footnoteLinkSx = {
  color: '#00D4FF',
  textDecoration: 'none',
  fontWeight: 500,
  '&:hover': { textDecoration: 'underline' },
};
