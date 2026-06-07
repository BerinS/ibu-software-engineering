import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Chip, CircularProgress, Alert,
  Divider, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Collapse, IconButton, Button,
  Avatar,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon   from '@mui/icons-material/KeyboardArrowUp';
import EventIcon             from '@mui/icons-material/Event';
import PeopleIcon            from '@mui/icons-material/People';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CalendarMonthIcon     from '@mui/icons-material/CalendarMonth';
import LocationOnIcon        from '@mui/icons-material/LocationOn';
import AddCircleOutlineIcon  from '@mui/icons-material/AddCircleOutline';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const statusChip = (status) => {
  const map = {
    approved:  { color: '#4ADE80', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.2)'  },
    pending:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)'  },
    rejected:  { color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
  };
  const s = map[status] ?? map.pending;
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        height: 20, fontSize: '0.68rem', fontWeight: 700,
        textTransform: 'capitalize',
        color: s.color, bgcolor: s.bg, border: `1px solid ${s.border}`,
      }}
    />
  );
};

/* ── Expandable event row ── */
const EventRow = ({ event, token }) => {
  const [open,      setOpen]      = useState(false);
  const [attendees, setAttendees] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [loaded,    setLoaded]    = useState(false);

  const toggleAttendees = () => {
    setOpen((prev) => !prev);
    if (!loaded) {
      setLoading(true);
      fetch(`${API_BASE}/api/events/${event.id}/attendees`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.ok ? r.json() : [])
        .then((data) => { setAttendees(data); setLoaded(true); })
        .catch(() => setAttendees([]))
        .finally(() => setLoading(false));
    }
  };

  const totalTickets = Number(event.total_tickets ?? event.total_capacity ?? 0);
  const soldTickets  = Number(event.tickets_sold_count ?? 0);
  const fillPct      = totalTickets > 0 ? Math.round((soldTickets / totalTickets) * 100) : 0;

  return (
    <>
      <TableRow
        sx={{
          cursor: 'pointer',
          '&:hover': { background: 'rgba(0,212,255,0.03)' },
          background: open ? 'rgba(0,212,255,0.04)' : 'transparent',
          transition: 'background 0.2s',
        }}
        onClick={toggleAttendees}
      >
        {/* Expand toggle */}
        <TableCell sx={{ borderColor: 'rgba(240,244,248,0.06)', width: 40, pl: 1 }}>
          <IconButton size="small" sx={{ color: '#7A8A99' }}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>

        {/* Title */}
        <TableCell sx={{ borderColor: 'rgba(240,244,248,0.06)' }}>
          <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.92rem', color: '#F0F4F8' }}>
            {event.title}
          </Typography>
          {event.category && (
            <Chip label={event.category} size="small" sx={{
              mt: 0.5, height: 18, fontSize: '0.65rem', fontWeight: 600,
              color: '#00D4FF', bgcolor: 'rgba(0,212,255,0.07)',
              border: '1px solid rgba(0,212,255,0.15)',
            }} />
          )}
        </TableCell>

        {/* Date */}
        <TableCell sx={{ borderColor: 'rgba(240,244,248,0.06)', display: { xs: 'none', sm: 'table-cell' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarMonthIcon sx={{ fontSize: 13, color: '#00D4FF' }} />
            <Typography sx={{ fontSize: '0.82rem', color: '#7A8A99' }}>{formatDate(event.event_date)}</Typography>
          </Box>
        </TableCell>

        {/* Location */}
        <TableCell sx={{ borderColor: 'rgba(240,244,248,0.06)', display: { xs: 'none', md: 'table-cell' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOnIcon sx={{ fontSize: 13, color: '#00D4FF' }} />
            <Typography sx={{ fontSize: '0.82rem', color: '#7A8A99', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {event.location}
            </Typography>
          </Box>
        </TableCell>

        {/* Tickets sold */}
        <TableCell sx={{ borderColor: 'rgba(240,244,248,0.06)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleIcon sx={{ fontSize: 14, color: '#00D4FF' }} />
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#F0F4F8' }}>
                {soldTickets} / {totalTickets}
              </Typography>
              <Box sx={{ mt: 0.4, height: 3, width: 80, borderRadius: 2, background: 'rgba(240,244,248,0.08)' }}>
                <Box sx={{
                  height: '100%', borderRadius: 2,
                  width: `${fillPct}%`,
                  background: fillPct >= 90
                    ? 'linear-gradient(90deg,#f87171,#ef4444)'
                    : 'linear-gradient(90deg,#00D4FF,#0099bb)',
                }} />
              </Box>
            </Box>
          </Box>
        </TableCell>

        {/* Status */}
        <TableCell sx={{ borderColor: 'rgba(240,244,248,0.06)' }}>
          {statusChip(event.status ?? 'pending')}
        </TableCell>
      </TableRow>

      {/* Attendee list (expanded) */}
      <TableRow>
        <TableCell colSpan={6} sx={{ p: 0, borderColor: 'rgba(240,244,248,0.06)' }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ px: { xs: 2, md: 4 }, py: 2, background: 'rgba(8,12,16,0.6)' }}>
              <Typography sx={{
                fontFamily: '"Syne", sans-serif', fontWeight: 700,
                fontSize: '0.85rem', color: '#00D4FF', mb: 1.5,
                display: 'flex', alignItems: 'center', gap: 0.75,
              }}>
                <PeopleIcon sx={{ fontSize: 15 }} />
                Attendees
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={22} sx={{ color: '#00D4FF' }} />
                </Box>
              ) : attendees.length === 0 ? (
                <Typography sx={{ fontSize: '0.82rem', color: '#4A5568', fontStyle: 'italic', py: 1 }}>
                  No attendees yet.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {attendees.map((a) => (
                    <Box key={a.booking_id} sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      flexWrap: 'wrap', gap: 1,
                      p: 1.5, borderRadius: '10px',
                      background: 'rgba(14,19,24,0.7)',
                      border: '1px solid rgba(240,244,248,0.05)',
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: 'rgba(0,212,255,0.1)', color: '#00D4FF', fontSize: '0.72rem', fontWeight: 700 }}>
                          {(a.full_name ?? '?').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#F0F4F8' }}>
                            {a.full_name}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: '#4A5568' }}>{a.email}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={a.ticket_type_name}
                          size="small"
                          icon={<ConfirmationNumberIcon sx={{ fontSize: 11, color: '#00D4FF !important' }} />}
                          sx={{ height: 20, fontSize: '0.68rem', color: '#7A8A99', bgcolor: 'rgba(240,244,248,0.05)', border: '1px solid rgba(240,244,248,0.08)' }}
                        />
                        {Number(a.price) > 0 && (
                          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#F0F4F8' }}>
                            ${Number(a.price).toFixed(2)}
                          </Typography>
                        )}
                        <Typography sx={{ fontSize: '0.72rem', color: '#4A5568' }}>
                          {formatDate(a.booked_at)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

/* ─────────────────────────────────── Page ─────────────────────────────────── */

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const loadEvents = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/users/me/events`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setEvents)
      .catch(() => setError('Could not load your events.'))
      .finally(() => setLoading(false));
  }, [user.token]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const totalSold     = events.reduce((s, e) => s + Number(e.tickets_sold_count ?? 0), 0);
  const totalCapacity = events.reduce((s, e) => s + Number(e.total_tickets ?? e.total_capacity ?? 0), 0);
  const approved      = events.filter(e => e.status === 'approved').length;
  const pending       = events.filter(e => e.status === 'pending').length;

  return (
    <Box sx={{ minHeight: '100vh', background: '#080C10', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 4 }, pt: { xs: 11, md: 13 }, pb: 8, flex: 1, width: '100%' }}>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 5 }}>
          <Box>
            <Typography variant="h4" sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, color: '#F0F4F8', mb: 0.5 }}>
              Organizer Dashboard
            </Typography>
            <Typography sx={{ color: '#7A8A99', fontSize: '0.9rem' }}>
              Manage your events and view attendee details
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/events/create"
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            sx={{
              background: 'linear-gradient(135deg,#00D4FF,#0099bb)',
              color: '#080C10', fontWeight: 700, borderRadius: '10px', px: 2.5,
            }}
          >
            Create Event
          </Button>
        </Box>

        {/* Stats row */}
        {!loading && !error && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 5 }}>
            {[
              { label: 'Total Events',     value: events.length,  icon: <EventIcon sx={{ fontSize: 18, color: '#00D4FF' }} /> },
              { label: 'Approved',         value: approved,       icon: <EventIcon sx={{ fontSize: 18, color: '#4ADE80' }} />, color: '#4ADE80' },
              { label: 'Pending Review',   value: pending,        icon: <EventIcon sx={{ fontSize: 18, color: '#F59E0B' }} />, color: '#F59E0B' },
              { label: 'Tickets Sold',     value: totalSold,      icon: <PeopleIcon sx={{ fontSize: 18, color: '#00D4FF' }} /> },
              { label: 'Total Capacity',   value: totalCapacity,  icon: <ConfirmationNumberIcon sx={{ fontSize: 18, color: '#00D4FF' }} /> },
            ].map(({ label, value, icon, color }) => (
              <Box key={label} sx={{
                flex: '1 1 140px',
                p: 2.5, borderRadius: '14px',
                background: 'rgba(14,19,24,0.7)',
                border: '1px solid rgba(240,244,248,0.06)',
                backdropFilter: 'blur(8px)',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>{icon}</Box>
                <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.6rem', color: color ?? '#F0F4F8' }}>
                  {value}
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#4A5568' }}>{label}</Typography>
              </Box>
            ))}
          </Box>
        )}

        <Divider sx={{ borderColor: 'rgba(240,244,248,0.06)', mb: 4 }} />

        {/* Events table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#00D4FF' }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ bgcolor: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.15)' }}>
            {error}
          </Alert>
        ) : events.length === 0 ? (
          <Box sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', py: 10,
            border: '1px dashed rgba(240,244,248,0.08)', borderRadius: '16px',
          }}>
            <EventIcon sx={{ fontSize: 40, color: '#1E2A35', mb: 2 }} />
            <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#F0F4F8', mb: 0.75 }}>
              No events yet
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color: '#7A8A99', mb: 3 }}>
              Create your first event and start selling tickets
            </Typography>
            <Button
              component={Link}
              to="/events/create"
              variant="outlined"
              startIcon={<AddCircleOutlineIcon />}
              sx={{ color: '#00D4FF', borderColor: 'rgba(0,212,255,0.35)', fontWeight: 600 }}
            >
              Create Event
            </Button>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{ background: 'rgba(14,19,24,0.6)', border: '1px solid rgba(240,244,248,0.06)', borderRadius: '14px', backdropFilter: 'blur(8px)' }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ borderColor: 'rgba(240,244,248,0.06)', width: 40 }} />
                  {['Event', 'Date', 'Location', 'Sold / Total', 'Status'].map((h) => (
                    <TableCell
                      key={h}
                      sx={{
                        borderColor: 'rgba(240,244,248,0.06)',
                        color: '#4A5568', fontSize: '0.75rem', fontWeight: 700,
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                        display: h === 'Date'     ? { xs: 'none', sm: 'table-cell' }
                               : h === 'Location' ? { xs: 'none', md: 'table-cell' }
                               : 'table-cell',
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => (
                  <EventRow key={event.id} event={event} token={user.token} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Footer />
    </Box>
  );
};

export default OrganizerDashboard;
