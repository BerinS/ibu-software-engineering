import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Select, MenuItem, IconButton,
  CircularProgress, Alert, Tooltip,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from './ConfirmDialog';
import { API_BASE } from '../../config.js';

const ROLE_STYLES = {
  admin:     { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.3)'  },
  organizer: { color: '#00D4FF', bg: 'rgba(0,212,255,0.08)',   border: 'rgba(0,212,255,0.25)'  },
  attendee:  { color: '#94A3B8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)' },
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const UsersTab = ({ notify, onMutate }) => {
  const { user: currentUser } = useAuth();

  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // Per-row loading state for role changes (keyed by user id)
  const [roleUpdating, setRoleUpdating] = useState({});

  // Confirm dialog state
  const [confirm, setConfirm] = useState({ open: false, userId: null, userName: '', loading: false });

  const authHeaders = {
    'Content-Type':  'application/json',
    Authorization:   `Bearer ${currentUser.token}`,
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, { headers: authHeaders });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to load users');
      setUsers(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    setRoleUpdating((prev) => ({ ...prev, [userId]: true }));
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
        method:  'PATCH',
        headers: authHeaders,
        body:    JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Role update failed');

      // Update locally — no need to re-fetch the whole list
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: data.role } : u));
      notify(`Role updated to "${newRole}" for ${data.full_name}`, 'success');
      onMutate();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setRoleUpdating((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const openConfirm = (userId, userName) =>
    setConfirm({ open: true, userId, userName, loading: false });

  const closeConfirm = () =>
    setConfirm({ open: false, userId: null, userName: '', loading: false });

  const handleDelete = async () => {
    setConfirm((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${confirm.userId}`, {
        method:  'DELETE',
        headers: authHeaders,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Delete failed');
      }
      setUsers((prev) => prev.filter((u) => u.id !== confirm.userId));
      notify(`User "${confirm.userName}" deleted`, 'success');
      onMutate();
      closeConfirm();
    } catch (err) {
      notify(err.message, 'error');
      setConfirm((prev) => ({ ...prev, loading: false }));
    }
  };

  if (loading) return <Box sx={loadingBoxSx}><CircularProgress sx={{ color: '#00D4FF' }} /></Box>;
  if (error)   return <Alert severity="error" sx={alertSx}>{error}</Alert>;

  return (
    <>
      <TableContainer sx={tableContainerSx}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {['Name', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
                <TableCell key={h} sx={thSx}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((u) => {
              const rs = ROLE_STYLES[u.role] ?? ROLE_STYLES.attendee;
              const isSelf = u.id === currentUser.id;
              return (
                <TableRow key={u.id} sx={trSx}>
                  <TableCell sx={tdSx}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#F0F4F8' }}>
                      {u.full_name}
                      {isSelf && (
                        <Typography component="span" sx={{ ml: 1, fontSize: '0.72rem', color: '#4A5568' }}>
                          (you)
                        </Typography>
                      )}
                    </Typography>
                  </TableCell>

                  <TableCell sx={tdSx}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#7A8A99' }}>{u.email}</Typography>
                  </TableCell>

                  <TableCell sx={tdSx}>
                    {isSelf ? (
                      // Admin cannot change their own role — show read-only chip
                      <Chip
                        label={u.role}
                        size="small"
                        sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700,
                          color: rs.color, bgcolor: rs.bg, border: `1px solid ${rs.border}` }}
                      />
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Select
                          value={u.role}
                          size="small"
                          disabled={!!roleUpdating[u.id]}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          sx={roleSelectorSx(rs)}
                        >
                          {['attendee', 'organizer', 'admin'].map((r) => (
                            <MenuItem key={r} value={r} sx={{ fontSize: '0.82rem', textTransform: 'capitalize' }}>
                              {r}
                            </MenuItem>
                          ))}
                        </Select>
                        {roleUpdating[u.id] && <CircularProgress size={14} sx={{ color: '#00D4FF' }} />}
                      </Box>
                    )}
                  </TableCell>

                  <TableCell sx={tdSx}>
                    <Typography sx={{ fontSize: '0.78rem', color: '#7A8A99' }}>
                      {formatDate(u.created_at)}
                    </Typography>
                  </TableCell>

                  <TableCell sx={tdSx}>
                    <Tooltip title={isSelf ? 'Cannot delete your own account' : 'Delete user'}>
                      <span>
                        <IconButton
                          size="small"
                          disabled={isSelf}
                          onClick={() => openConfirm(u.id, u.full_name)}
                          sx={{
                            color: '#4A5568',
                            '&:hover': { color: '#f87171', background: 'rgba(248,113,113,0.08)' },
                            '&.Mui-disabled': { opacity: 0.25 },
                          }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </span>
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
        title="Delete User"
        message={`Permanently delete "${confirm.userName}"? All their events, bookings, and feedback will also be removed. This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={closeConfirm}
      />
    </>
  );
};

export default UsersTab;

// ── Styles ─────────────────────────────────────────────────────────────────

const loadingBoxSx = { display: 'flex', justifyContent: 'center', py: 8 };

const alertSx = {
  bgcolor: 'rgba(239,68,68,0.08)', color: '#fca5a5',
  border: '1px solid rgba(239,68,68,0.15)',
  '& .MuiAlert-icon': { color: '#f87171' },
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
  color: '#7A8A99',
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  borderBottom: '1px solid rgba(240,244,248,0.08)',
  py: 1.5,
};

const trSx = {
  '&:last-child td': { border: 0 },
  '&:hover td': { background: 'rgba(240,244,248,0.02)' },
  transition: 'background 0.15s',
};

const tdSx = {
  borderBottom: '1px solid rgba(240,244,248,0.05)',
  py: 1.25,
};

const roleSelectorSx = (rs) => ({
  fontSize: '0.82rem',
  color: rs.color,
  height: 28,
  minWidth: 110,
  '.MuiOutlinedInput-notchedOutline': { borderColor: rs.border },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: rs.color },
  '.MuiSelect-icon': { color: rs.color },
});
