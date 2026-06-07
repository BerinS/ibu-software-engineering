import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, IconButton, CircularProgress,
  Alert, Rating, Tooltip, Chip,
} from '@mui/material';
import DeleteOutlineIcon      from '@mui/icons-material/DeleteOutlined';
import ChatBubbleOutlineIcon  from '@mui/icons-material/ChatBubbleOutlined';
import { useAuth }       from '../../context/AuthContext';
import ConfirmDialog     from './ConfirmDialog';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const FeedbackTab = ({ notify, onMutate }) => {
  const { user }    = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [confirm,  setConfirm]  = useState({ open: false, feedbackId: null, label: '', loading: false });

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization:  `Bearer ${user.token}`,
  };

  const fetchFeedback = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('http://localhost:5000/api/admin/feedback', { headers: authHeaders });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to load feedback');
      setFeedback(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchFeedback(); }, [fetchFeedback]);

  const openConfirm = (feedbackId, label) =>
    setConfirm({ open: true, feedbackId, label, loading: false });

  const closeConfirm = () =>
    setConfirm({ open: false, feedbackId: null, label: '', loading: false });

  const handleDelete = async () => {
    setConfirm((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`http://localhost:5000/api/admin/feedback/${confirm.feedbackId}`, {
        method: 'DELETE', headers: authHeaders,
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Delete failed');
      setFeedback((prev) => prev.filter((f) => f.id !== confirm.feedbackId));
      notify('Feedback entry deleted.', 'success');
      onMutate();
      closeConfirm();
    } catch (err) {
      notify(err.message, 'error');
      setConfirm((prev) => ({ ...prev, loading: false }));
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#00D4FF' }} /></Box>;
  if (error)   return <Alert severity="error" sx={alertSx}>{error}</Alert>;

  if (feedback.length === 0) {
    return (
      <Box sx={emptyStateSx}>
        <ChatBubbleOutlineIcon sx={{ fontSize: 40, color: '#4A5568', mb: 1.5 }} />
        <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, color: '#F0F4F8', mb: 0.5 }}>
          No feedback yet
        </Typography>
        <Typography sx={{ fontSize: '0.83rem', color: '#7A8A99' }}>
          Feedback submitted by attendees will appear here.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
        {feedback.map((f) => (
          <Box key={f.id} sx={cardSx}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Box>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#F0F4F8', mb: 0.25 }}>
                  {f.user_name}
                </Typography>
                <Chip
                  label={f.event_title}
                  size="small"
                  sx={{ height: 20, fontSize: '0.65rem', maxWidth: 160,
                    color: '#00D4FF', bgcolor: 'rgba(0,212,255,0.06)',
                    border: '1px solid rgba(0,212,255,0.15)',
                    '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }}
                />
              </Box>
              <Tooltip title="Delete feedback">
                <IconButton
                  size="small"
                  onClick={() => openConfirm(f.id, `${f.user_name}'s review`)}
                  sx={{
                    color: '#4A5568', flexShrink: 0, mt: -0.5,
                    '&:hover': { color: '#f87171', background: 'rgba(248,113,113,0.08)' },
                  }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>

            <Rating
              value={f.rating}
              readOnly
              size="small"
              sx={{ mb: 1, '& .MuiRating-iconFilled': { color: '#F59E0B' }, '& .MuiRating-iconEmpty': { color: '#2D3748' } }}
            />

            {f.comment && (
              <Typography sx={{ fontSize: '0.8rem', color: '#7A8A99', lineHeight: 1.55,
                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                "{f.comment}"
              </Typography>
            )}

            <Typography sx={{ fontSize: '0.68rem', color: '#4A5568', mt: 1.5 }}>
              {formatDate(f.submitted_at)}
            </Typography>
          </Box>
        ))}
      </Box>

      <ConfirmDialog
        open={confirm.open}
        loading={confirm.loading}
        title="Delete Feedback"
        message={`Delete ${confirm.label}? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={closeConfirm}
      />
    </>
  );
};

export default FeedbackTab;

// ── Styles ─────────────────────────────────────────────────────────────────

const alertSx = {
  bgcolor: 'rgba(239,68,68,0.08)', color: '#fca5a5',
  border: '1px solid rgba(239,68,68,0.15)', '& .MuiAlert-icon': { color: '#f87171' },
};

const emptyStateSx = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  textAlign: 'center', py: 8,
};

const cardSx = {
  background: 'rgba(14,19,24,0.6)',
  border: '1px solid rgba(240,244,248,0.07)',
  borderRadius: '12px',
  p: 2,
  transition: 'border-color 0.2s',
  '&:hover': { borderColor: 'rgba(240,244,248,0.13)' },
};
