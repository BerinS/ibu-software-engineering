import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Tabs, Tab, Snackbar, Alert,
  CircularProgress,
} from '@mui/material';
import PeopleIcon          from '@mui/icons-material/People';
import EventIcon           from '@mui/icons-material/Event';
import BookmarkIcon        from '@mui/icons-material/Bookmark';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined';
import Navbar              from '../components/Navbar';
import UsersTab            from '../components/admin/UsersTab';
import EventsTab           from '../components/admin/EventsTab';
import BookingsTab         from '../components/admin/BookingsTab';
import FeedbackTab         from '../components/admin/FeedbackTab';
import { useAuth }         from '../context/AuthContext';
import { API_BASE }        from '../config.js';

// ── Stats bar ──────────────────────────────────────────────────────────────

const StatsBar = ({ stats, loading }) => {
  const items = [
    { label: 'Total Users',      value: stats?.total_users    ?? '–' },
    { label: 'Total Events',     value: stats?.total_events   ?? '–' },
    { label: 'Pending Review',   value: stats?.pending_events ?? '–', highlight: (stats?.pending_events ?? 0) > 0 },
    { label: 'Total Bookings',   value: stats?.total_bookings ?? '–' },
  ];

  return (
    <Box sx={statsBarSx}>
      {items.map(({ label, value, highlight }) => (
        <Box key={label} sx={statItemSx}>
          {loading ? (
            <CircularProgress size={18} sx={{ color: '#00D4FF', mb: 0.5 }} />
          ) : (
            <Typography sx={{
              fontFamily: '"Syne", sans-serif', fontWeight: 800,
              fontSize: '1.6rem', lineHeight: 1,
              color: highlight ? '#F59E0B' : '#F0F4F8',
            }}>
              {value}
            </Typography>
          )}
          <Typography sx={{ fontSize: '0.75rem', color: '#7A8A99', mt: 0.5 }}>
            {label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// ── Tab panel wrapper ──────────────────────────────────────────────────────

const TabPanel = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
    {value === index && children}
  </Box>
);

// ── Main page ──────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const { user }          = useAuth();
  const [activeTab,       setActiveTab]       = useState(0);
  const [stats,           setStats]           = useState(null);
  const [statsLoading,    setStatsLoading]    = useState(true);
  // Incrementing this key triggers a stats re-fetch after any mutation in a tab
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);

  // Global snackbar state — tabs call notify() to surface messages here
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization:  `Bearer ${user.token}`,
  };

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/stats`, { headers: authHeaders });
      if (res.ok) setStats(await res.json());
    } finally {
      setStatsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statsRefreshKey]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const notify = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const triggerStatsRefresh = useCallback(() => {
    setStatsRefreshKey((k) => k + 1);
  }, []);

  const TAB_PROPS = { notify, onMutate: triggerStatsRefresh };

  return (
    <Box sx={pageWrapperSx}>
      <Navbar />

      <Box sx={contentSx}>
        {/* ── Page heading ── */}
        <Box sx={headingSx}>
          <Box>
            <Typography variant="h4" sx={pageTitleSx}>Admin Dashboard</Typography>
            <Typography sx={{ color: '#7A8A99', fontSize: '0.88rem', mt: 0.5 }}>
              System overview and content management
            </Typography>
          </Box>
        </Box>

        {/* ── Stats bar ── */}
        <StatsBar stats={stats} loading={statsLoading} />

        {/* ── Tabs ── */}
        <Box sx={tabsWrapperSx}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={tabsSx}
          >
            <Tab icon={<PeopleIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Users"    sx={tabSx} />
            <Tab icon={<EventIcon  sx={{ fontSize: 16 }} />} iconPosition="start" label="Events"   sx={tabSx} />
            <Tab icon={<BookmarkIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Bookings" sx={tabSx} />
            <Tab icon={<ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Feedback" sx={tabSx} />
          </Tabs>

          {/* Pending badge on the Events tab */}
          {(stats?.pending_events ?? 0) > 0 && (
            <Box sx={pendingBadgeSx}>{stats.pending_events}</Box>
          )}
        </Box>

        <TabPanel value={activeTab} index={0}><UsersTab    {...TAB_PROPS} /></TabPanel>
        <TabPanel value={activeTab} index={1}><EventsTab   {...TAB_PROPS} /></TabPanel>
        <TabPanel value={activeTab} index={2}><BookingsTab {...TAB_PROPS} /></TabPanel>
        <TabPanel value={activeTab} index={3}><FeedbackTab {...TAB_PROPS} /></TabPanel>

        <Box sx={{ pb: 8 }} />
      </Box>

      {/* ── Global Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ minWidth: 300, fontFamily: '"DM Sans", sans-serif' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;

// ── Styles ─────────────────────────────────────────────────────────────────

const GUTTER = { xs: '24px', sm: '48px', md: '80px', xl: '120px' };

const pageWrapperSx = {
  minHeight: '100vh',
  background: '#080C10',
  backgroundImage: 'radial-gradient(rgba(0,212,255,0.04) 1px, transparent 2px)',
  backgroundSize: '32px 32px',
};

const contentSx = {
  pt: { xs: 10, md: 12 },
  px: GUTTER,
};

const headingSx = {
  pt: { xs: 4, md: 5 },
  pb: 3,
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
};

const pageTitleSx = {
  fontFamily: '"Syne", sans-serif',
  fontWeight: 800,
  fontSize: { xs: '1.6rem', md: '2rem' },
  color: '#F0F4F8',
  lineHeight: 1.1,
};

const statsBarSx = {
  display: 'grid',
  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
  gap: 2,
  mb: 4,
};

const statItemSx = {
  background: 'rgba(14,19,24,0.7)',
  border: '1px solid rgba(240,244,248,0.07)',
  borderRadius: '14px',
  p: { xs: 2, md: 2.5 },
  display: 'flex',
  flexDirection: 'column',
};

const tabsWrapperSx = {
  position: 'relative',
  borderBottom: '1px solid rgba(240,244,248,0.08)',
  mb: 1,
};

const tabsSx = {
  minHeight: 44,
  '& .MuiTabs-indicator': {
    background: 'linear-gradient(90deg, #00D4FF, #0088CC)',
    height: 2,
    borderRadius: '1px 1px 0 0',
  },
};

const tabSx = {
  minHeight: 44,
  fontSize: '0.85rem',
  fontFamily: '"DM Sans", sans-serif',
  fontWeight: 500,
  color: '#7A8A99',
  gap: 0.5,
  textTransform: 'none',
  '&.Mui-selected': { color: '#00D4FF', fontWeight: 600 },
};

const pendingBadgeSx = {
  position: 'absolute',
  // Align roughly over the Events tab (2nd tab)
  left: 'calc(min(25%, 140px) + 12px)',
  top: 4,
  minWidth: 18,
  height: 18,
  borderRadius: '9px',
  background: '#F59E0B',
  color: '#080C10',
  fontSize: '0.65rem',
  fontWeight: 800,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  px: 0.5,
  pointerEvents: 'none',
};
