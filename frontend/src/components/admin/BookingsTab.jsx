import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, CircularProgress, Alert, Tooltip,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { useAuth }       from '../../context/AuthContext';
import ConfirmDialog     from './ConfirmDialog';

const STATUS_STYLES = {
  confirmed:  { color: '#4ADE80', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.2)'  },
  waitlisted: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)'  },
  cancelled:  { color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const BookingsTab = ({ notify, onMutate }) => {
  const { user }  = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [confirm,  setConfirm]  = useState({ open: false, bookingId: null, label: '', loading: false });

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization:  `Bearer ${user.token}`,
  };

  const fetchBookings = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('http://localhost:5000/api/admin/bookings', { headers: authHeaders });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to load bookings');
      setBookings(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const openConfirm = (bookingId, label) =>
    setConfirm({ open: true, bookingId, label, loading: false });

  const closeConfirm = () =>
    setConfirm({ open: false, bookingId: null, label: '', loading: false });

  const handleDelete = async () => {
    setConfirm((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`http://localhost:5000/api/admin/bookings/${confirm.bookingId}`, {
        method: 'DELETE', headers: authHeaders,
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Delete failed');
      setBookings((prev) => prev.filter((b) => b.booking_id !== confirm.bookingId));
      notify('Booking deleted.', 'success');
      onMutate();
      closeConfirm();
    } catch (err) {
      notify(err.message, 'error');
      setConfirm((prev) => ({ ...prev, loading: false }));
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#00D4FF' }} /></Box>;
  if (error)   return <Alert severity="error" sx={alertSx}>{error}</Alert>;

  return (
    <>
      <TableContainer sx={tableContainerSx}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {['User', 'Event', 'Ticket Type', 'Price', 'Status', 'Booked', 'Actions'].map((h) => (
                <TableCell key={h} sx={thSx}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: '#4A5568', border: 0 }}>
                  No bookings yet
                </TableCell>
              </TableRow>
            ) : bookings.map((b) => {
              const ss = STATUS_STYLES[b.status] ?? STATUS_STYLES.confirmed;
              return (
                <TableRow key={b.booking_id} sx={trSx}>
                  <TableCell sx={tdSx}>
                    <Typography sx={{ fontSize: '0.83rem', fontWeight: 600, color: '#F0F4F8' }}>
                      {b.user_name}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: '#7A8A99' }}>{b.user_email}</Typography>
                  </TableCell>

                  <TableCell sx={tdSx}>
                    <Typography sx={{ fontSize: '0.83rem', color: '#F0F4F8',
                      maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.event_title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: '#7A8A99' }}>
                      {formatDate(b.event_date)}
                    </Typography>
                  </TableCell>

                  <TableCell sx={tdSx}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#7A8A99' }}>{b.ticket_type_name}</Typography>
                  </TableCell>

                  <TableCell sx={tdSx}>
                    <Typography sx={{ fontSize: '0.83rem', fontWeight: 600, color: '#F0F4F8' }}>
                      {Number(b.price) === 0 ? 'Free' : `$${Number(b.price).toFixed(2)}`}
                    </Typography>
                  </TableCell>

                  <TableCell sx={tdSx}>
                    <Chip
                      label={b.status}
                      size="small"
                      sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, textTransform: 'capitalize',
                        color: ss.color, bgcolor: ss.bg, border: `1px solid ${ss.border}` }}
                    />
                  </TableCell>

                  <TableCell sx={tdSx}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#7A8A99' }}>
                      {formatDate(b.booked_at)}
                    </Typography>
                  </TableCell>

                  <TableCell sx={tdSx}>
                    <Tooltip title="Delete booking">
                      <IconButton
                        size="small"
                        onClick={() => openConfirm(b.booking_id, `${b.user_name} → ${b.event_title}`)}
                        sx={{
                          color: '#4A5568',
                          '&:hover': { color: '#f87171', background: 'rgba(248,113,113,0.08)' },
                        }}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={confirm.open}
        loading={confirm.loading}
        title="Delete Booking"
        message={`Permanently delete booking for "${confirm.label}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={closeConfirm}
      />
    </>
  );
};

export default BookingsTab;

// ── Styles ─────────────────────────────────────────────────────────────────

const alertSx = {
  bgcolor: 'rgba(239,68,68,0.08)', color: '#fca5a5',
  border: '1px solid rgba(239,68,68,0.15)', '& .MuiAlert-icon': { color: '#f87171' },
};

const tableContainerSx = {
  borderRadius: '12px',
  border: '1px solid rgba(240,244,248,0.07)',
  background: 'rgba(14,19,24,0.5)',
  maxHeight: '60vh',
  overflow: 'auto',
};

const thSx = {
  background: 'rgba(8,12,16,0.9)',
  color: '#7A8A99', fontSize: '0.75rem', fontWeight: 600,
  letterSpacing: '0.06em', textTransform: 'uppercase',
  borderBottom: '1px solid rgba(240,244,248,0.08)', py: 1.5,
};

const trSx = {
  '&:last-child td': { border: 0 },
  '&:hover td': { background: 'rgba(240,244,248,0.02)' },
};

const tdSx = { borderBottom: '1px solid rgba(240,244,248,0.05)', py: 1.25 };
