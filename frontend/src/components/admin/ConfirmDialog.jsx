import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Button, CircularProgress,
} from '@mui/material';

/**
 * Reusable confirmation dialog for destructive actions.
 *
 * Props:
 *   open         — controls visibility
 *   title        — dialog heading
 *   message      — body text describing what will happen
 *   onConfirm    — async callback; receives no args; should handle its own errors
 *   onCancel     — called when the user dismisses without confirming
 *   loading      — disables buttons and shows spinner on confirm
 *   confirmLabel — (optional) label for the confirm button, default "Delete"
 *   confirmColor — (optional) MUI button color, default "error"
 */
const ConfirmDialog = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
  confirmLabel = 'Delete',
  confirmColor = 'error',
}) => (
  <Dialog
    open={open}
    onClose={loading ? undefined : onCancel}
    maxWidth="xs"
    fullWidth
    slotProps={{
      paper: {
        sx: {
          background: '#0E1318',
          border: '1px solid rgba(240,244,248,0.08)',
          borderRadius: '16px',
        },
      },
    }}
  >
    <DialogTitle
      sx={{
        fontFamily: '"Syne", sans-serif',
        fontWeight: 700,
        fontSize: '1.1rem',
        color: '#F0F4F8',
        pb: 1,
      }}
    >
      {title}
    </DialogTitle>

    <DialogContent>
      <DialogContentText
        sx={{ color: '#7A8A99', fontSize: '0.88rem', lineHeight: 1.6 }}
      >
        {message}
      </DialogContentText>
    </DialogContent>

    <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
      <Button
        onClick={onCancel}
        disabled={loading}
        sx={{
          color: '#7A8A99',
          '&:hover': { color: '#F0F4F8', background: 'rgba(240,244,248,0.05)' },
        }}
      >
        Cancel
      </Button>

      <Button
        onClick={onConfirm}
        disabled={loading}
        color={confirmColor}
        variant="contained"
        sx={{ minWidth: 90, fontWeight: 600 }}
      >
        {loading
          ? <CircularProgress size={18} color="inherit" />
          : confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
