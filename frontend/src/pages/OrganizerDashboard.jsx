import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Chip, CircularProgress, Alert,
  Divider, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Collapse, IconButton, Button,
  Avatar, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Snackbar, Tabs, Tab,
} from '@mui/material';
import KeyboardArrowDownIcon  from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon    from '@mui/icons-material/KeyboardArrowUp';
import EventIcon              from '@mui/icons-material/Event';
import PeopleIcon             from '@mui/icons-material/People';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CalendarMonthIcon      from '@mui/icons-material/CalendarMonth';
import LocationOnIcon         from '@mui/icons-material/LocationOn';
import AddCircleOutlineIcon   from '@mui/icons-material/AddCircleOutlined';
import EditIcon               from '@mui/icons-material/Edit';
import CancelIcon             from '@mui/icons-material/Cancel';
import QrCode2Icon            from '@mui/icons-material/QrCode2';
import CheckCircleIcon        from '@mui/icons-material/CheckCircle';
import BarChartIcon           from '@mui/icons-material/BarChart';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000';

const CATEGORIES = [
  'General','Technology','Music','Business',
  'Sports','Arts','Food & Drink','Health & Wellness','Education','Community',
];

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const toLocalDatetime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

const statusChipSx = (status) => {
  const map = {
    approved:  { color: '#4ADE80', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.2)'  },
    pending:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)'  },
    rejected:  { color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
    cancelled: { color: '#94A3B8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)' },
  };
  const s = map[status] ?? map.pending;
  return (
    <Chip label={status} size="small" sx={{
      height: 20, fontSize: '0.68rem', fontWeight: 700,
      textTransform: 'capitalize',
      color: s.color, bgcolor: s.bg, border: `1px solid ${s.border}`,
    }} />
  );
};

/* ─────────────────── Edit Event Dialog ─────────────────── */
const EditEventDialog = ({ open, event, token, onClose, onSaved }) => {
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState('');

  useEffect(() => {
    if (event) {
      setForm({
        title:          event.title         ?? '',
        description:    event.description   ?? '',
        location:       event.location      ?? '',
        event_date:     toLocalDatetime(event.event_date),
        total_capacity: event.total_capacity ?? '',
        category:       event.category      ?? 'General',
      });
      setErr('');
    }
  }, [event]);

  const handleSave = async () => {
    setBusy(true);
    setErr('');
    try {
      const res = await fetch(`${API_BASE}/api/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          event_date:     form.event_date ? new Date(form.event_date).toISOString() : undefined,
          total_capacity: form.total_capacity ? parseInt(form.total_capacity, 10) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update');
      onSaved(data);
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
      PaperProps={{ sx: { background: '#0E1318', border: '1px solid rgba(240,244,248,0.08)', borderRadius: '16px' } }}>
      <DialogTitle sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, color: '#F0F4F8' }}>
        Edit Event
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
        {err && <Alert severity="error" sx={{ bgcolor: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.15)' }}>{err}</Alert>}

        <TextField label="Title" fullWidth value={form.title ?? ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          InputProps={{ sx: { color: '#F0F4F8' } }} />
        <TextField label="Description" fullWidth multiline rows={3} value={form.description ?? ''}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          InputProps={{ sx: { color: '#F0F4F8' } }} />
        <TextField label="Location" fullWidth value={form.location ?? ''}
          onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
          InputProps={{ sx: { color: '#F0F4F8' } }} />
        <TextField label="Date & Time" fullWidth type="datetime-local" value={form.event_date ?? ''}
          onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))}
          InputLabelProps={{ shrink: true }} InputProps={{ sx: { color: '#F0F4F8' } }} />
        <TextField label="Capacity" fullWidth type="number" value={form.total_capacity ?? ''}
          onChange={e => setForm(f => ({ ...f, total_capacity: e.target.value }))}
          InputProps={{ sx: { color: '#F0F4F8' } }} />

        <FormControl fullWidth>
          <InputLabel sx={{ color: '#7A8A99', '&.Mui-focused': { color: '#00D4FF' } }}>Category</InputLabel>
          <Select value={form.category ?? 'General'} label="Category"
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            sx={{ color: '#F0F4F8', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(240,244,248,0.15)' } }}>
            {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} disabled={busy} sx={{ color: '#7A8A99' }}>Cancel</Button>
        <Button onClick={handleSave} disabled={busy} variant="contained"
          sx={{ background: 'linear-gradient(135deg,#00D4FF,#0099bb)', color: '#080C10', fontWeight: 700, borderRadius: '8px', px: 3 }}>
          {busy ? <CircularProgress size={18} sx={{ color: '#080C10' }} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/* ─────────────────── QR Check-in Panel ─────────────────── */
const QrCheckinPanel = ({ token }) => {
  const [qrInput,  setQrInput]  = useState('');
  const [result,   setResult]   = useState(null);
  const [busy,     setBusy]     = useState(false);
  const [err,      setErr]      = useState('');

  const handleCheckin = async (e) => {
    e.preventDefault();
    if (!qrInput.trim()) return;
    setBusy(true);
    setErr('');
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/bookings/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ qr_hash: qrInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');
      setResult(data);
      setQrInput('');
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 540 }}>
      <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#F0F4F8', mb: 0.75 }}>
        QR Ticket Validation
      </Typography>
      <Typography sx={{ fontSize: '0.83rem', color: '#7A8A99', mb: 2.5 }}>
        Enter or paste the QR code hash to verify and check in an attendee at the event entrance.
      </Typography>

      <Box component="form" onSubmit={handleCheckin} sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Paste QR hash here (e.g. 550e8400-e29b-41d4-a716-...)"
          value={qrInput}
          onChange={e => setQrInput(e.target.value)}
          size="small"
          InputProps={{ sx: { color: '#F0F4F8', fontFamily: 'monospace', fontSize: '0.82rem' } }}
        />
        <Button type="submit" variant="contained" disabled={busy || !qrInput.trim()}
          sx={{ whiteSpace: 'nowrap', background: 'linear-gradient(135deg,#00D4FF,#0099bb)', color: '#080C10', fontWeight: 700, borderRadius: '8px', px: 2.5 }}>
          {busy ? <CircularProgress size={18} sx={{ color: '#080C10' }} /> : 'Verify'}
        </Button>
      </Box>

      {err && (
        <Alert severity="error" sx={{ bgcolor: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '10px' }}>
          {err}
        </Alert>
      )}

      {result && (
        <Box sx={{
          p: 2.5, borderRadius: '12px',
          background: result.alreadyCheckedIn ? 'rgba(245,158,11,0.07)' : 'rgba(74,222,128,0.07)',
          border: `1px solid ${result.alreadyCheckedIn ? 'rgba(245,158,11,0.25)' : 'rgba(74,222,128,0.25)'}`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CheckCircleIcon sx={{ fontSize: 20, color: result.alreadyCheckedIn ? '#F59E0B' : '#4ADE80' }} />
            <Typography sx={{ fontWeight: 700, color: result.alreadyCheckedIn ? '#F59E0B' : '#4ADE80', fontSize: '0.92rem' }}>
              {result.message}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.83rem', color: '#7A8A99' }}>
            <strong style={{ color: '#F0F4F8' }}>{result.booking.full_name}</strong> — {result.booking.email}
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#7A8A99', mt: 0.5 }}>
            Event: <span style={{ color: '#F0F4F8' }}>{result.booking.event_title}</span>
            {' · '}Ticket: <span style={{ color: '#00D4FF' }}>{result.booking.ticket_type_name}</span>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

/* ─────────────────── Analytics Panel ─────────────────── */
const AnalyticsPanel = ({ events }) => {
  const totalEvents    = events.length;
  const totalSold      = events.reduce((s, e) => s + Number(e.tickets_sold_count ?? 0), 0);
  const totalCapacity  = events.reduce((s, e) => s + Number(e.total_tickets ?? e.total_capacity ?? 0), 0);
  const fillRate       = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;
  const approved       = events.filter(e => e.status === 'approved').length;
  const cancelled      = events.filter(e => e.status === 'cancelled').length;
  const pending        = events.filter(e => e.status === 'pending').length;

  // Top events by tickets sold
  const topEvents = [...events]
    .sort((a, b) => Number(b.tickets_sold_count ?? 0) - Number(a.tickets_sold_count ?? 0))
    .slice(0, 5);

  return (
    <Box>
      {/* KPI grid */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        {[
          { label: 'Total Events',    value: totalEvents,  color: '#F0F4F8' },
          { label: 'Approved',        value: approved,     color: '#4ADE80' },
          { label: 'Pending Review',  value: pending,      color: '#F59E0B' },
          { label: 'Cancelled',       value: cancelled,    color: '#94A3B8' },
          { label: 'Tickets Sold',    value: totalSold,    color: '#00D4FF' },
          { label: 'Fill Rate',       value: `${fillRate}%`, color: fillRate > 75 ? '#4ADE80' : fillRate > 40 ? '#F59E0B' : '#F87171' },
        ].map(({ label, value, color }) => (
          <Box key={label} sx={{
            flex: '1 1 130px', p: 2.5, borderRadius: '14px',
            background: 'rgba(14,19,24,0.7)', border: '1px solid rgba(240,244,248,0.06)',
          }}>
            <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.7rem', color }}>
              {value}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#4A5568', mt: 0.25 }}>{label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Top events table */}
      <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#F0F4F8', mb: 1.5 }}>
        Top Events by Tickets Sold
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {topEvents.map((ev, i) => {
          const sold  = Number(ev.tickets_sold_count ?? 0);
          const total = Number(ev.total_tickets ?? ev.total_capacity ?? 1);
          const pct   = Math.round((sold / total) * 100);
          return (
            <Box key={ev.id} sx={{
              display: 'flex', alignItems: 'center', gap: 2,
              p: 2, borderRadius: '10px',
              background: 'rgba(14,19,24,0.6)', border: '1px solid rgba(240,244,248,0.05)',
            }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#1E2A35', minWidth: 24, textAlign: 'center' }}>
                {i + 1}
              </Typography>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#F0F4F8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ev.title}
                </Typography>
                <Box sx={{ mt: 0.5, height: 4, borderRadius: 2, background: 'rgba(240,244,248,0.08)' }}>
                  <Box sx={{ height: '100%', borderRadius: 2, width: `${pct}%`, background: 'linear-gradient(90deg,#00D4FF,#0099bb)' }} />
                </Box>
              </Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#00D4FF', minWidth: 70, textAlign: 'right' }}>
                {sold} / {total}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

/* ─────────────────── Expandable Event Row ─────────────────── */
const EventRow = ({ event: initialEvent, token, onEdit, onCancel }) => {
  const [event,     setEvent]     = useState(initialEvent);
  const [open,      setOpen]      = useState(false);
  const [attendees, setAttendees] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [loaded,    setLoaded]    = useState(false);

  useEffect(() => { setEvent(initialEvent); }, [initialEvent]);

  const toggleAttendees = () => {
    setOpen(prev => !prev);
    if (!loaded) {
      setLoading(true);
      fetch(`${API_BASE}/api/events/${event.id}/attendees`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.ok ? r.json() : [])
        .then(data => { setAttendees(data); setLoaded(true); })
        .catch(() => setAttendees([]))
        .finally(() => setLoading(false));
    }
  };

  const totalTickets = Number(event.total_tickets ?? event.total_capacity ?? 0);
  const soldTickets  = Number(event.tickets_sold_count ?? 0);
  const fillPct      = totalTickets > 0 ? Math.round((soldTickets / totalTickets) * 100) : 0;
  const isCancelled  = event.status === 'cancelled';

  return (
    <>
      <TableRow
        sx={{
          cursor: 'pointer', opacity: isCancelled ? 0.5 : 1,
          '&:hover': { background: 'rgba(0,212,255,0.03)' },
          background: open ? 'rgba(0,212,255,0.04)' : 'transparent',
          transition: 'background 0.2s',
        }}
        onClick={toggleAttendees}
      >
        <TableCell sx={{ borderColor: 'rgba(240,244,248,0.06)', width: 40, pl: 1 }}>
          <IconButton size="small" sx={{ color: '#7A8A99' }}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>

        <TableCell sx={{ borderColor: 'rgba(240,244,248,0.06)' }}>
          <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.92rem', color: '#F0F4F8' }}>
            {event.title}
          </Typography>
          {event.category && (
            <Chip label={event.category} size="small" sx={{
              mt: 0.5, height: 18, fontSize: '0.65rem', fontWeight: 600,
              color: '#00D4FF', bgcolor: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.15)',
            }} />
          )}
        </TableCell>

        <TableCell sx={{ borderColor: 'rgba(240,244,248,0.06)', display: { xs: 'none', sm: 'table-cell' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarMonthIcon sx={{ fontSize: 13, color: '#00D4FF' }} />
            <Typography sx={{ fontSize: '0.82rem', color: '#7A8A99' }}>{formatDate(event.event_date)}</Typography>
          </Box>
        </TableCell>

        <TableCell sx={{ borderColor: 'rgba(240,244,248,0.06)', display: { xs: 'none', md: 'table-cell' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOnIcon sx={{ fontSize: 13, color: '#00D4FF' }} />
            <Typography sx={{ fontSize: '0.82rem', color: '#7A8A99', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {event.location}
            </Typography>
          </Box>
        </TableCell>

        <TableCell sx={{ borderColor: 'rgba(240,244,248,0.06)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleIcon sx={{ fontSize: 14, color: '#00D4FF' }} />
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#F0F4F8' }}>
                {soldTickets} / {totalTickets}
              </Typography>
              <Box sx={{ mt: 0.4, height: 3, width: 80, borderRadius: 2, background: 'rgba(240,244,248,0.08)' }}>
                <Box sx={{
                  height: '100%', borderRadius: 2, width: `${fillPct}%`,
                  background: fillPct >= 90
                    ? 'linear-gradient(90deg,#f87171,#ef4444)'
                    : 'linear-gradient(90deg,#00D4FF,#0099bb)',
                }} />
              </Box>
            </Box>
          </Box>
        </TableCell>

        <TableCell sx={{ borderColor: 'rgba(240,244,248,0.06)' }}>
          {statusChipSx(event.status ?? 'pending')}
        </TableCell>

        {/* Action buttons */}
        <TableCell sx={{ borderColor: 'rgba(240,244,248,0.06)' }} onClick={e => e.stopPropagation()}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {!isCancelled && (
              <>
                <IconButton size="small" onClick={() => onEdit(event)}
                  sx={{ color: '#00D4FF', '&:hover': { background: 'rgba(0,212,255,0.08)' } }}>
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton size="small" onClick={() => onCancel(event)}
                  sx={{ color: '#F87171', '&:hover': { background: 'rgba(248,113,113,0.08)' } }}>
                  <CancelIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </>
            )}
          </Box>
        </TableCell>
      </TableRow>

      {/* Attendee list (expanded) */}
      <TableRow>
        <TableCell colSpan={7} sx={{ p: 0, borderColor: 'rgba(240,244,248,0.06)' }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ px: { xs: 2, md: 4 }, py: 2, background: 'rgba(8,12,16,0.6)' }}>
              <Typography sx={{
                fontFamily: '"Syne", sans-serif', fontWeight: 700,
                fontSize: '0.85rem', color: '#00D4FF', mb: 1.5,
                display: 'flex', alignItems: 'center', gap: 0.75,
              }}>
                <PeopleIcon sx={{ fontSize: 15 }} /> Attendees
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
                      flexWrap: 'wrap', gap: 1, p: 1.5, borderRadius: '10px',
                      background: 'rgba(14,19,24,0.7)', border: '1px solid rgba(240,244,248,0.05)',
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: 'rgba(0,212,255,0.1)', color: '#00D4FF', fontSize: '0.72rem', fontWeight: 700 }}>
                          {(a.full_name ?? '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#F0F4F8' }}>{a.full_name}</Typography>
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
                        {a.checked_in_at && (
                          <Chip label="Checked in" size="small" icon={<CheckCircleIcon sx={{ fontSize: 11, color: '#4ADE80 !important' }} />}
                            sx={{ height: 20, fontSize: '0.68rem', color: '#4ADE80', bgcolor: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.2)' }} />
                        )}
                        {Number(a.price) > 0 && (
                          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#F0F4F8' }}>
                            ${Number(a.price).toFixed(2)}
                          </Typography>
                        )}
                        <Typography sx={{ fontSize: '0.72rem', color: '#4A5568' }}>{formatDate(a.booked_at)}</Typography>
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

/* ─────────────────────── Page ─────────────────────────── */
const OrganizerDashboard = () => {
  const { user } = useAuth();

  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [tab,     setTab]     = useState(0);

  // Edit dialog
  const [editEvent, setEditEvent] = useState(null);

  // Cancel dialog
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelBusy,   setCancelBusy]   = useState(false);

  // Snackbar
  const [snack, setSnack] = useState({ open: false, msg: '' });

  const loadEvents = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/users/me/events`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setEvents)
      .catch(() => setError('Could not load your events.'))
      .finally(() => setLoading(false));
  }, [user.token]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  /* Handlers */
  const handleSaved = (updated) => {
    setEvents(prev => prev.map(e => e.id === updated.id ? { ...e, ...updated } : e));
    setSnack({ open: true, msg: 'Event updated successfully!' });
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/events/${cancelTarget.id}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error('Failed to cancel');
      setEvents(prev => prev.map(e => e.id === cancelTarget.id ? { ...e, status: 'cancelled' } : e));
      setSnack({ open: true, msg: `"${cancelTarget.title}" has been cancelled.` });
      setCancelTarget(null);
    } catch {
      setSnack({ open: true, msg: 'Could not cancel event. Try again.' });
    } finally {
      setCancelBusy(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: '#080C10', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 4 }, pt: { xs: 11, md: 13 }, pb: 8, flex: 1, width: '100%' }}>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, color: '#F0F4F8', mb: 0.5 }}>
              Organizer Dashboard
            </Typography>
            <Typography sx={{ color: '#7A8A99', fontSize: '0.9rem' }}>
              Manage your events, view attendees, check in tickets
            </Typography>
          </Box>
          <Button component={Link} to="/events/create" variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            sx={{ background: 'linear-gradient(135deg,#00D4FF,#0099bb)', color: '#080C10', fontWeight: 700, borderRadius: '10px', px: 2.5 }}>
            Create Event
          </Button>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            mb: 4,
            '& .MuiTabs-indicator': { background: '#00D4FF' },
            '& .MuiTab-root': { color: '#7A8A99', fontFamily: '"DM Sans", sans-serif', fontWeight: 600 },
            '& .Mui-selected': { color: '#00D4FF !important' },
          }}
        >
          <Tab label="My Events" icon={<EventIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
          <Tab label="Analytics" icon={<BarChartIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
          <Tab label="QR Check-in" icon={<QrCode2Icon sx={{ fontSize: 16 }} />} iconPosition="start" />
        </Tabs>

        <Divider sx={{ borderColor: 'rgba(240,244,248,0.06)', mb: 4 }} />

        {/* ── Tab 0: Events ── */}
        {tab === 0 && (
          <>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress sx={{ color: '#00D4FF' }} />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ bgcolor: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.15)' }}>
                {error}
              </Alert>
            ) : events.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 10, border: '1px dashed rgba(240,244,248,0.08)', borderRadius: '16px' }}>
                <EventIcon sx={{ fontSize: 40, color: '#1E2A35', mb: 2 }} />
                <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#F0F4F8', mb: 0.75 }}>
                  No events yet
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#7A8A99', mb: 3 }}>
                  Create your first event and start selling tickets
                </Typography>
                <Button component={Link} to="/events/create" variant="outlined" startIcon={<AddCircleOutlineIcon />}
                  sx={{ color: '#00D4FF', borderColor: 'rgba(0,212,255,0.35)', fontWeight: 600 }}>
                  Create Event
                </Button>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ background: 'rgba(14,19,24,0.6)', border: '1px solid rgba(240,244,248,0.06)', borderRadius: '14px', backdropFilter: 'blur(8px)' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ borderColor: 'rgba(240,244,248,0.06)', width: 40 }} />
                      {['Event', 'Date', 'Location', 'Sold / Total', 'Status', 'Actions'].map(h => (
                        <TableCell key={h} sx={{
                          borderColor: 'rgba(240,244,248,0.06)',
                          color: '#4A5568', fontSize: '0.75rem', fontWeight: 700,
                          letterSpacing: '0.06em', textTransform: 'uppercase',
                          display: h === 'Date'     ? { xs: 'none', sm: 'table-cell' }
                                 : h === 'Location' ? { xs: 'none', md: 'table-cell' }
                                 : 'table-cell',
                        }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {events.map(ev => (
                      <EventRow
                        key={ev.id}
                        event={ev}
                        token={user.token}
                        onEdit={setEditEvent}
                        onCancel={setCancelTarget}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}

        {/* ── Tab 1: Analytics ── */}
        {tab === 1 && (
          loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#00D4FF' }} />
            </Box>
          ) : (
            <AnalyticsPanel events={events} />
          )
        )}

        {/* ── Tab 2: QR Check-in ── */}
        {tab === 2 && (
          <QrCheckinPanel token={user.token} />
        )}
      </Box>

      <Footer />

      {/* Edit Event Dialog */}
      <EditEventDialog
        open={!!editEvent}
        event={editEvent}
        token={user.token}
        onClose={() => setEditEvent(null)}
        onSaved={handleSaved}
      />

      {/* Cancel confirmation */}
      <Dialog open={!!cancelTarget} onClose={() => setCancelTarget(null)}
        PaperProps={{ sx: { background: '#0E1318', border: '1px solid rgba(240,244,248,0.08)', borderRadius: '16px', minWidth: 340 } }}>
        <DialogTitle sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, color: '#F0F4F8' }}>
          Cancel Event?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#7A8A99', fontSize: '0.9rem' }}>
            Are you sure you want to cancel{' '}
            <span style={{ color: '#F0F4F8', fontWeight: 600 }}>{cancelTarget?.title}</span>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setCancelTarget(null)} disabled={cancelBusy} sx={{ color: '#7A8A99' }}>
            Keep Event
          </Button>
          <Button onClick={handleConfirmCancel} disabled={cancelBusy} variant="contained"
            sx={{ background: 'linear-gradient(135deg,#f87171,#ef4444)', color: '#fff', fontWeight: 700, borderRadius: '8px', px: 3 }}>
            {cancelBusy ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Yes, Cancel'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        message={snack.msg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{ sx: { bgcolor: 'rgba(74,222,128,0.12)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.25)', borderRadius: '10px' } }}
      />
    </Box>
  );
};

export default OrganizerDashboard;
