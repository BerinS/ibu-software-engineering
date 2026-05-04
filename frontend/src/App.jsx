import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import AllEvents from './pages/AllEvents';

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

        *, *::before, *::after {
          box-sizing: border-box;
        }

        body {
          background-color: #080C10;
          min-height: 100vh;
        }

        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #080C10;
        }
        ::-webkit-scrollbar-thumb {
          background: #1E2A35;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #00D4FF33;
        }
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
  },
  shape: {
    borderRadius: 12,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<AllEvents />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;