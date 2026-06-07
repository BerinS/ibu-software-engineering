import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, Chip, IconButton, CircularProgress,
  Alert, Button, Tooltip,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon     from '@mui/icons-material/CancelOutlined';
import DeleteOutlineIcon      from '@mui/icons-material/DeleteOutlined';
import CalendarMonthIcon      from '@mui/icons-material/CalendarMonth';
import PeopleIcon             from '@mui/icons-material/People';
import PersonIcon             from '@mui/icons-material/Person';
import { useAuth }            from '../../context/AuthContext';
import ConfirmDialog          from './ConfirmDialog';
import { API_BASE }          from '../../config.js';

const STATUS_COLUMNS = [
  { key: 'pending',  label: 'Pending',  color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)'  },
  { key: 'approved', label: 'Approved', color: '#4ADE80', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.2)'  },
  { key: 'rejected', label: 'Rejected', color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
];

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// ── Event card shown in each kanban column ──────────────────────────────────

const EventCard = ({ event, onApprove, onReject, onDelete, actioning }) => {
  const col = STATUS_COLUMNS.find((c) => c.key === event.status) ?? STATUS_COLUMNS[0];

  return (
    <Box sx={cardSx}>
      {/* Status strip */}
      <Box sx={{ height: 3, bgcolor: col.color, borderRadius: '12px 12px 0 0' }} />

      <Box sx={{ p: 2 }}>
        {/* Title + category */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1 }}>
          <Typography sx={{
            fontFamily: '"Syne", sans-serif', fontWeight: 700,
            fontSize: '0.9rem', color: '#F0F4F8', lineHeight: 1.3,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {event.title}
          </Typography>
          <Chip
            label={event.category}
            size="small"
            sx={{ height: 20, fontSize: '0.65rem', flexShrink: 0,
              color: '#7A8A99', bgcolor: 'rgba(240,244,248,0.06)',
              border: '1px solid rgba(240,244,248,0.1)' }}
          />
        </Box>

        {/* Meta */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <PersonIcon sx={{ fontSize: 12, color: '#00D4FF' }} />
            <Typography sx={{ fontSize: '0.75rem', color: '#7A8A99' }}>
              {event.organizer_name ?? 'Unknown'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <CalendarMonthIcon sx={{ fontSize: 12, color: '#00D4FF' }} />
            <Typography sx={{ fontSize: '0.75rem', color: '#7A8A99' }}>{formatDate(event.event_date)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <PeopleIcon sx={{ fontSize: 12, color: '#00D4FF' }} />
            <Typography sx={{ fontSize: '0.75rem', color: '#7A8A99' }}>
              {event.tickets_sold_count ?? 0} / {event.total_capacity} booked
            </Typography>
          </Box>
        </Box>

        {/* Submitted date */}
        <Typography sx={{ fontSize: '0.68rem', color: '#4A5568', mb: 1.5 }}>
          Submitted {formatDate(event.created_at)}
        </Typography>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {event.status === 'pending' && (
            <>
              <Button
                size="small"
                startIcon={actioning === `approve-${event.id}`
                  ? <CircularProgress size={12} color="inherit" />
                  : <CheckCircleOutlineIcon sx={{ fontSize: '14px !important' }} />}
                disabled={!!actioning}
                onClick={() => onApprove(event.id)}
                sx={approveButtonSx}
              >
                Approve
              </Button>
              <Button
                size="small"
                startIcon={actioning === `reject-${event.id}`
                  ? <CircularProgress size={12} color="inherit" />
                  : <CancelOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                disabled={!!actioning}
                onClick={() => onReject(event.id)}
                sx={rejectButtonSx}
              >
                Reject
              </Button>
            </>
          )}
          <Tooltip title="Delete event">
            <span>
              <IconButton
                size="small"
                disabled={!!actioning}
                onClick={() => onDelete(event.id, event.title)}
                sx={{
                  color: '#4A5568', ml: event.status === 'pending' ? 'auto' : 0,
                  '&:hover': { color: '#f87171', background: 'rgba(248,113,113,0.08)' },
                }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

// ── Column header ───────────────────────────────────────────────────────────

const ColumnHeader = ({ col, count }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: col.color }} />
    <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#F0F4F8' }}>
      {col.label}
    </Typography>
    <Chip
      label={count}
      size="small"
      sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700,
        color: col.color, bgcolor: col.bg, border: `1px solid ${col.border}` }}
    />
  </Box>
);

// ── Main tab ────────────────────────────────────────────────────────────────

const EventsTab = ({ notify, onMutate }) => {
  const { user }  = useAuth();
  const [events,   setEvents]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [actioning, setActioning] = useState('');   // e.g. 'approve-5'
  const [mobileFilter, setMobileFilter] = useState('pending');

  // Confirm dialog for delete
  const [confirm, setConfirm] = useState({ open: false, eventId: null, eventTitle: '', loading: false });

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization:  `Bearer ${user.token}`,
  };

  const fetchEvents = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/events`, { headers: authHeaders });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to load events');
      setEvents(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Pre-bucket by status
  const byStatus = useMemo(() => {
    const buckets = { pending: [], approved: [], rejected: [] };
    events.forEach((e) => { if (buckets[e.status]) buckets[e.status].push(e); });
    return buckets;
  }, [events]);

  const handleApprove = async (eventId) => {
    setActioning(`approve-${eventId}`);
    try {
      const res = await fetch(`${API_BASE}/api/admin/events/${eventId}/approve`, {
        method: 'PATCH', headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Approval failed');

      // Update local state — event moves from pending → approved
      setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, status: 'approved' } : e));

      const msg = data.organizerPromoted
        ? `Event approved. "${data.promotedUser?.full_name}" has been promoted to Organizer.`
        : 'Event approved.';
      notify(msg, 'success');
      onMutate();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setActioning('');
    }
  };

  const handleReject = async (eventId) => {
    setActioning(`reject-${eventId}`);
    try {
      const res = await fetch(`${API_BASE}/api/admin/events/${eventId}/reject`, {
        method: 'PATCH', headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Rejection failed');

      setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, status: 'rejected' } : e));
      notify('Event rejected.', 'success');
      onMutate();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setActioning('');
    }
  };

  const openDeleteConfirm = (eventId, eventTitle) =>
    setConfirm({ open: true, eventId, eventTitle, loading: false });

  const closeDeleteConfirm = () =>
    setConfirm({ open: false, eventId: null, eventTitle: '', loading: false });

  const handleDelete = async () => {
    setConfirm((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`${API_BASE}/api/admin/events/${confirm.eventId}`, {
        method: 'DELETE', headers: authHeaders,
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Delete failed');
      setEvents((prev) => prev.filter((e) => e.id !== confirm.eventId));
      notify(`Event "${confirm.eventTitle}" deleted.`, 'success');
      onMutate();
      closeDeleteConfirm();
    } catch (err) {
      notify(err.message, 'error');
      setConfirm((prev) => ({ ...prev, loading: false }));
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#00D4FF' }} /></Box>;
  if (error)   return <Alert severity="error" sx={{ bgcolor: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.15)', '& .MuiAlert-icon': { color: '#f87171' } }}>{error}</Alert>;

  return (
    <>
      {/* ── Desktop: Kanban columns ── */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'flex-start' }}>
        {STATUS_COLUMNS.map((col) => (
          <Box key={col.key} sx={columnSx}>
            <ColumnHeader col={col} count={byStatus[col.key].length} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minHeight: 80 }}>
              {byStatus[col.key].length === 0 ? (
                <Typography sx={{ fontSize: '0.8rem', color: '#4A5568', textAlign: 'center', py: 3 }}>
                  No {col.label.toLowerCase()} events
                </Typography>
              ) : byStatus[col.key].map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onDelete={openDeleteConfirm}
                  actioning={actioning}
                />
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      {/* ── Mobile: filter chips + single list ── */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
          {STATUS_COLUMNS.map((col) => (
            <Chip
              key={col.key}
              label={`${col.label} (${byStatus[col.key].length})`}
              onClick={() => setMobileFilter(col.key)}
              sx={{
                cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem',
                color:   mobileFilter === col.key ? col.color   : '#7A8A99',
                bgcolor: mobileFilter === col.key ? col.bg      : 'transparent',
                border:  `1px solid ${mobileFilter === col.key ? col.border : 'rgba(240,244,248,0.1)'}`,
              }}
            />
          ))}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {byStatus[mobileFilter].length === 0 ? (
            <Typography sx={{ fontSize: '0.85rem', color: '#4A5568', textAlign: 'center', py: 4 }}>
              No {mobileFilter} events
            </Typography>
          ) : byStatus[mobileFilter].map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={openDeleteConfirm}
              actioning={actioning}
            />
          ))}
        </Box>
      </Box>

      <ConfirmDialog
        open={confirm.open}
        loading={confirm.loading}
        title="Delete Event"
        message={`Permanently delete "${confirm.eventTitle}"? All associated ticket types and bookings will also be removed.`}
        onConfirm={handleDelete}
        onCancel={closeDeleteConfirm}
      />
    </>
  );
};

export default EventsTab;

// ── Styles ─────────────────────────────────────────────────────────────────

const columnSx = {
  flex: 1,
  minWidth: 0,
  background: 'rgba(14,19,24,0.4)',
  border: '1px solid rgba(240,244,248,0.07)',
  borderRadius: '14px',
  p: 2,
};

const cardSx = {
  background: 'rgba(8,12,16,0.6)',
  border: '1px solid rgba(240,244,248,0.07)',
  borderRadius: '12px',
  overflow: 'hidden',
  transition: 'border-color 0.2s',
  '&:hover': { borderColor: 'rgba(240,244,248,0.14)' },
};

const approveButtonSx = {
  color: '#4ADE80',
  borderColor: 'rgba(74,222,128,0.3)',
  border: '1px solid',
  fontSize: '0.75rem',
  py: 0.4,
  px: 1.2,
  minWidth: 0,
  '&:hover': { background: 'rgba(74,222,128,0.08)', borderColor: '#4ADE80' },
  '&.Mui-disabled': { opacity: 0.4 },
};

const rejectButtonSx = {
  color: '#F87171',
  borderColor: 'rgba(248,113,113,0.3)',
  border: '1px solid',
  fontSize: '0.75rem',
  py: 0.4,
  px: 1.2,
  minWidth: 0,
  '&:hover': { background: 'rgba(248,113,113,0.08)', borderColor: '#F87171' },
  '&.Mui-disabled': { opacity: 0.4 },
};
