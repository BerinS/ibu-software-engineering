import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Avatar, Chip, Divider,
  CircularProgress, Alert, Button, Grid,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon    from '@mui/icons-material/LocationOn';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AddCircleOutlineIcon   from '@mui/icons-material/AddCircleOutlined';
import EventIcon              from '@mui/icons-material/Event';
import BookmarkIcon           from '@mui/icons-material/Bookmark';
import ArrowForwardIcon       from '@mui/icons-material/ArrowForward';
import DashboardIcon          from '@mui/icons-material/Dashboard';
import { Link } from 'react-router-dom';
import Navbar    from '../components/Navbar';
import EventCard from '../components/EventCard';
import { useAuth } from '../context/AuthContext';

// ── helpers ────────────────────────────────────────────────────────────────

const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase();

const ROLE_CHIP = {
  admin:     { label: 'Admin',     color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)'  },
  organizer: { label: 'Organizer', color: '#00D4FF', bg: 'rgba(0,212,255,0.08)',  border: 'rgba(0,212,255,0.25)'  },
  attendee:  { label: 'Attendee',  color: '#94A3B8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)' },
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

const formatShort = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// ── Sub-components ─────────────────────────────────────────────────────────

const SectionHeader = ({ icon, title, count }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
    <Box sx={sectionIconWrapSx}>{icon}</Box>
    <Typography sx={sectionTitleSx}>{title}</Typography>
    {count !== undefined && (
      <Chip
        label={count}
        size="small"
        sx={{
          height: 22,
          fontSize: '0.72rem',
          fontWeight: 700,
          bgcolor: 'rgba(0,212,255,0.08)',
          color: '#00D4FF',
          border: '1px solid rgba(0,212,255,0.2)',
        }}
      />
    )}
  </Box>
);

const EmptyState = ({ icon, title, subtitle, action }) => (
  <Box sx={emptyStateSx}>
    <Box sx={{ fontSize: '2.5rem', mb: 1.5, opacity: 0.35 }}>{icon}</Box>
    <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#F0F4F8', mb: 0.5 }}>
      {title}
    </Typography>
    <Typography sx={{ fontSize: '0.83rem', color: '#7A8A99', mb: action ? 2.5 : 0 }}>
      {subtitle}
    </Typography>
    {action}
  </Box>
);

// Compact booking row card
const BookingCard = ({ booking }) => {
  const statusColors = {
    confirmed: { color: '#4ADE80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)' },
    pending:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
    cancelled: { color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
  };
  const s = statusColors[booking.status] ?? statusColors.pending;

  return (
    <Box sx={bookingCardSx}>
      {/* Left colour strip */}
      <Box sx={{ width: 3, borderRadius: '3px 0 0 3px', bgcolor: s.color, flexShrink: 0, alignSelf: 'stretch' }} />

      <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {/* Title row */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Typography sx={{
            fontFamily: '"Syne", sans-serif', fontWeight: 700,
            fontSize: '0.95rem', color: '#F0F4F8', lineHeight: 1.3,
          }}>
            {booking.title}
          </Typography>
          <Chip
            label={booking.status}
            size="small"
            sx={{
              height: 20, fontSize: '0.68rem', fontWeight: 700,
              flexShrink: 0, textTransform: 'capitalize',
              color: s.color, bgcolor: s.bg,
              border: `1px solid ${s.border}`,
            }}
          />
        </Box>

        {/* Meta row */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarMonthIcon sx={{ fontSize: 12, color: '#00D4FF' }} />
            <Typography sx={metaTextSx}>{formatShort(booking.event_date)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOnIcon sx={{ fontSize: 12, color: '#00D4FF' }} />
            <Typography sx={{ ...metaTextSx, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {booking.location}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ConfirmationNumberIcon sx={{ fontSize: 12, color: '#00D4FF' }} />
            <Typography sx={metaTextSx}>{booking.ticket_type_name}</Typography>
          </Box>
        </Box>

        {/* Price + booked date */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#F0F4F8' }}>
            {Number(booking.price) === 0
              ? 'Free'
              : `$${Number(booking.price).toFixed(2)}`}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#4A5568' }}>
            Booked {formatShort(booking.booked_at)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────

const ProfilePage = () => {
  const { user } = useAuth();

  const [myEvents,   setMyEvents]   = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [eventsLoading,   setEventsLoading]   = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [eventsError,     setEventsError]     = useState('');
  const [bookingsError,   setBookingsError]   = useState('');

  const authHeaders = {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${user.token}`,
  };

  // Fetch both in parallel on mount
  useEffect(() => {
    // My organised events (only relevant for organizer / admin but we fetch anyway)
    fetch('http://localhost:5000/api/users/me/events', { headers: authHeaders })
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((data) => setMyEvents(data))
      .catch(() => setEventsError('Could not load your events.'))
      .finally(() => setEventsLoading(false));

    // My bookings
    fetch('http://localhost:5000/api/users/me/bookings', { headers: authHeaders })
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((data) => setMyBookings(data))
      .catch(() => setBookingsError('Could not load your bookings.'))
      .finally(() => setBookingsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const role     = user.role ?? 'attendee';
  const roleChip = ROLE_CHIP[role] ?? ROLE_CHIP.attendee;
  const isOrganizer = role === 'organizer' || role === 'admin';

  return (
    <Box sx={pageWrapperSx}>
      <Navbar />

      {/* ── Main content ── */}
      <Box sx={contentWrapSx}>

        {/* ────────────────── Profile Hero ────────────────── */}
        <Box sx={heroSx}>
          {/* Ambient glow */}
          <Box sx={ambientGlowSx} />

          <Box sx={heroInnerSx}>
            {/* Avatar */}
            <Avatar sx={avatarSx}>
              {getInitials(user.full_name ?? '')}
            </Avatar>

            {/* Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={nameSx}>{user.full_name}</Typography>
              <Typography sx={emailSx}>{user.email}</Typography>

              {/* Role + member since */}
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mt: 1.5 }}>
                <Chip
                  label={roleChip.label}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                    color: roleChip.color,
                    bgcolor: roleChip.bg,
                    border: `1px solid ${roleChip.border}`,
                  }}
                />
                {user.created_at && (
                  <Typography sx={{ fontSize: '0.8rem', color: '#4A5568' }}>
                    Member since {formatDate(user.created_at)}
                  </Typography>
                )}
              </Box>

              {/* Action buttons — visible for organizer and admin */}
              {(role === 'organizer' || role === 'admin') && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2 }}>
                  {role === 'admin' && (
                    <Button
                      component={Link}
                      to="/admin"
                      variant="outlined"
                      startIcon={<DashboardIcon />}
                      sx={{
                        color: '#F59E0B', borderColor: 'rgba(245,158,11,0.35)',
                        fontWeight: 600, fontSize: '0.85rem',
                        '&:hover': { borderColor: '#F59E0B', background: 'rgba(245,158,11,0.06)' },
                      }}
                    >
                      Go to Dashboard
                    </Button>
                  )}
                  <Button
                    component={Link}
                    to="/events/create"
                    variant="outlined"
                    startIcon={<AddCircleOutlineIcon />}
                    sx={ctaBtnSx}
                  >
                    Create Event
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(240,244,248,0.06)', mx: GUTTER }} />

        {/* ────────────────── Attendee CTA ────────────────── */}
        {role === 'attendee' && (
          <Box sx={{ px: GUTTER, py: 4 }}>
            <Box sx={ctaBannerSx}>
              <Box>
                <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#F0F4F8', mb: 0.5 }}>
                  Want to host your own event?
                </Typography>
                <Typography sx={{ fontSize: '0.83rem', color: '#7A8A99' }}>
                  Submit an event for review. Once approved, you&apos;ll be promoted to Organizer.
                </Typography>
              </Box>
              <Button
                component={Link}
                to="/events/create"
                variant="outlined"
                startIcon={<AddCircleOutlineIcon />}
                sx={ctaBtnSx}
              >
                Organize an Event
              </Button>
            </Box>
          </Box>
        )}

        {/* ────────────────── My Events (organizer / admin) ────────────────── */}
        {isOrganizer && (
          <Box sx={{ px: GUTTER, py: 4 }}>
            <SectionHeader
              icon={<EventIcon sx={{ fontSize: 16, color: '#00D4FF' }} />}
              title="My Events"
              count={myEvents.length}
            />

            {eventsLoading ? (
              <Box sx={loadingBoxSx}>
                <CircularProgress size={28} sx={{ color: '#00D4FF' }} />
              </Box>
            ) : eventsError ? (
              <Alert severity="error" sx={alertSx}>{eventsError}</Alert>
            ) : myEvents.length === 0 ? (
              <EmptyState
                icon={<EventIcon />}
                title="No events yet"
                subtitle="Events you create will appear here."
                action={
                  <Button
                    component={Link}
                    to="/events/create"
                    variant="outlined"
                    startIcon={<AddCircleOutlineIcon />}
                    sx={ctaBtnSx}
                  >
                    Create your first event
                  </Button>
                }
              />
            ) : (
              <Grid container spacing={2.5}>
                {myEvents.map((event, i) => (
                  <Grid key={event.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <EventCard event={event} index={i} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {isOrganizer && (
          <Divider sx={{ borderColor: 'rgba(240,244,248,0.06)', mx: GUTTER }} />
        )}

        {/* ────────────────── My Bookings ────────────────── */}
        <Box sx={{ px: GUTTER, py: 4 }}>
          <SectionHeader
            icon={<BookmarkIcon sx={{ fontSize: 16, color: '#00D4FF' }} />}
            title="My Bookings"
            count={myBookings.length}
          />

          {bookingsLoading ? (
            <Box sx={loadingBoxSx}>
              <CircularProgress size={28} sx={{ color: '#00D4FF' }} />
            </Box>
          ) : bookingsError ? (
            <Alert severity="error" sx={alertSx}>{bookingsError}</Alert>
          ) : myBookings.length === 0 ? (
            <EmptyState
              icon={<BookmarkIcon />}
              title="No bookings yet"
              subtitle="Events you book tickets for will appear here."
              action={
                <Button
                  component={Link}
                  to="/"
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  sx={ctaBtnSx}
                >
                  Browse events
                </Button>
              }
            />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxWidth: 720 }}>
              {myBookings.map((b) => (
                <BookingCard key={b.booking_id} booking={b} />
              ))}
            </Box>
          )}
        </Box>

        {/* Bottom breathing room */}
        <Box sx={{ pb: 8 }} />
      </Box>
    </Box>
  );
};

export default ProfilePage;

// ── Styles ─────────────────────────────────────────────────────────────────

const GUTTER = { xs: '24px', sm: '48px', md: '80px', xl: '120px' };

const pageWrapperSx = {
  minHeight: '100vh',
  background: '#080C10',
  backgroundImage: 'radial-gradient(rgba(0,212,255,0.06) 1px, transparent 2px)',
  backgroundSize: '32px 32px',
};

const contentWrapSx = {
  pt: { xs: 10, md: 12 }, // clear the fixed Navbar
};

const heroSx = {
  position: 'relative',
  px: GUTTER,
  pt: { xs: 5, md: 7 },
  pb: { xs: 4, md: 5 },
  overflow: 'hidden',
};

const ambientGlowSx = {
  position: 'absolute',
  top: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '70vw',
  height: '300px',
  background: 'radial-gradient(ellipse at center top, rgba(0,212,255,0.07) 0%, transparent 70%)',
  pointerEvents: 'none',
};

const heroInnerSx = {
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: { xs: 3, md: 4 },
  flexWrap: { xs: 'wrap', sm: 'nowrap' },
};

const avatarSx = {
  width:  { xs: 72, md: 88 },
  height: { xs: 72, md: 88 },
  bgcolor: 'rgba(0,212,255,0.1)',
  color: '#00D4FF',
  fontSize: { xs: '1.6rem', md: '2rem' },
  fontWeight: 800,
  fontFamily: '"Syne", sans-serif',
  border: '2px solid rgba(0,212,255,0.3)',
  boxShadow: '0 0 32px rgba(0,212,255,0.12)',
  flexShrink: 0,
};

const nameSx = {
  fontFamily: '"Syne", sans-serif',
  fontWeight: 800,
  fontSize: { xs: '1.6rem', md: '2rem' },
  color: '#F0F4F8',
  lineHeight: 1.1,
  mb: 0.5,
};

const emailSx = {
  fontSize: '0.88rem',
  color: '#7A8A99',
};

const sectionIconWrapSx = {
  width: 30,
  height: 30,
  borderRadius: '8px',
  bgcolor: 'rgba(0,212,255,0.08)',
  border: '1px solid rgba(0,212,255,0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const sectionTitleSx = {
  fontFamily: '"Syne", sans-serif',
  fontWeight: 700,
  fontSize: '1.1rem',
  color: '#F0F4F8',
};

const emptyStateSx = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  py: 6,
  px: 3,
  borderRadius: '16px',
  border: '1px dashed rgba(240,244,248,0.08)',
  background: 'rgba(14,19,24,0.4)',
  maxWidth: 400,
};

const bookingCardSx = {
  display: 'flex',
  borderRadius: '12px',
  border: '1px solid rgba(240,244,248,0.07)',
  background: 'rgba(14,19,24,0.6)',
  backdropFilter: 'blur(8px)',
  overflow: 'hidden',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  '&:hover': {
    borderColor: 'rgba(0,212,255,0.18)',
    boxShadow: '0 0 24px rgba(0,212,255,0.05)',
  },
};

const metaTextSx = {
  fontSize: '0.78rem',
  color: '#7A8A99',
};

const ctaBannerSx = {
  display: 'flex',
  alignItems: { xs: 'flex-start', sm: 'center' },
  flexDirection: { xs: 'column', sm: 'row' },
  justifyContent: 'space-between',
  gap: 2,
  p: { xs: 3, md: 3.5 },
  borderRadius: '16px',
  background: 'rgba(0,212,255,0.04)',
  border: '1px solid rgba(0,212,255,0.12)',
};

const ctaBtnSx = {
  color: '#00D4FF',
  borderColor: 'rgba(0,212,255,0.35)',
  fontWeight: 600,
  fontSize: '0.85rem',
  whiteSpace: 'nowrap',
  flexShrink: 0,
  '&:hover': {
    borderColor: '#00D4FF',
    background: 'rgba(0,212,255,0.08)',
    boxShadow: '0 0 20px rgba(0,212,255,0.12)',
  },
};

const loadingBoxSx = {
  display: 'flex',
  justifyContent: 'center',
  py: 6,
};

const alertSx = {
  bgcolor: 'rgba(239,68,68,0.08)',
  color: '#fca5a5',
  border: '1px solid rgba(239,68,68,0.15)',
  '& .MuiAlert-icon': { color: '#f87171' },
};
