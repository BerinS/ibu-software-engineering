import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AllEvents from './pages/AllEvents';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00D4FF',
    },
    background: {
      default: '#080C10',
      paper: '#0E1318',
    },
    text: {
      primary: '#F0F4F8',
      secondary: '#7A8A99',
    },
  },
  typography: {
    fontFamily: '"DM Sans", sans-serif',
    h1: { fontFamily: '"Syne", sans-serif' },
    h2: { fontFamily: '"Syne", sans-serif' },
    h3: { fontFamily: '"Syne", sans-serif' },
    h4: { fontFamily: '"Syne", sans-serif' },
    h5: { fontFamily: '"Syne", sans-serif' },
    h6: { fontFamily: '"Syne", sans-serif' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        body {
          background-color: #080C10;
          min-height: 100vh;
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #080C10; }
        ::-webkit-scrollbar-thumb { background: #1E2A35; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #00D4FF33; }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 500,
          letterSpacing: '0.02em',
          borderRadius: '8px',
        },
      },
    },
    // TextField / Input overrides — match the dark palette
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontFamily: '"DM Sans", sans-serif',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(240,244,248,0.15)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(240,244,248,0.35)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#00D4FF',
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: '#f87171',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: '"DM Sans", sans-serif',
          color: '#7A8A99',
          '&.Mui-focused': { color: '#00D4FF' },
          '&.Mui-error':   { color: '#f87171' },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontFamily: '"DM Sans", sans-serif',
          '&.Mui-error': { color: '#f87171' },
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* AuthProvider outside Router */}
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/"          element={<AllEvents />} />
            <Route path="/login"     element={<LoginPage />} />
            <Route path="/register"  element={<RegisterPage />} />
            {/* Protected routes */}
            <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="*"          element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
