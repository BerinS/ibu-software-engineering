import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Select, MenuItem,
  FormControl, InputLabel, IconButton, Dialog, DialogContent,
  Chip, CircularProgress, InputAdornment, Alert,
} from '@mui/material';
import AddIcon                  from '@mui/icons-material/Add';
import DeleteOutlinedIcon       from '@mui/icons-material/DeleteOutlined';
import CheckCircleOutlinedIcon  from '@mui/icons-material/CheckCircleOutlined';
import EventIcon                from '@mui/icons-material/Event';
import ConfirmationNumberIcon   from '@mui/icons-material/ConfirmationNumber';
import ArrowBackIcon            from '@mui/icons-material/ArrowBack';
import CameraAltIcon            from '@mui/icons-material/CameraAlt';
import CloseIcon                from '@mui/icons-material/Close';
import { Link, useNavigate }    from 'react-router-dom';
import Navbar    from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config.js';

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'General', 'Technology', 'Music', 'Business',
  'Sports', 'Arts', 'Food & Drink', 'Health & Wellness',
  'Education', 'Community',
];

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Minimum datetime string for the native datetime-local input.
 * Uses local-time getters so the browser's min constraint matches the
 * user's timezone rather than UTC.
 */
const getMinDatetime = () => {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

/** Returns a new blank ticket-type row with a stable random id. */
const makeTicket = (preset = {}) => ({
  _id:            Math.random().toString(36).slice(2),
  name:           preset.name  ?? '',
  price:          preset.price ?? '0',
  quantity_limit: '',
});

// ── Sub-components ────────────────────────────────────────────────────────────

const SectionHeader = ({ icon, title }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
    <Box sx={{
      width: 32, height: 32, borderRadius: '9px',
      bgcolor: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {React.cloneElement(icon, { sx: { fontSize: 16, color: '#00D4FF' } })}
    </Box>
    <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#F0F4F8' }}>
      {title}
    </Typography>
  </Box>
);

const TicketTypeRow = ({ ticket, index, onUpdate, onRemove, errors }) => {
  const isFree = ticket.price === '' || Number(ticket.price) === 0;
  return (
    <Box sx={ticketRowSx}>
      <Box sx={{ width: 3, bgcolor: isFree ? '#4ADE80' : '#00D4FF', flexShrink: 0, alignSelf: 'stretch', borderRadius: '2px 0 0 2px' }} />
      <Box sx={{ flex: 1, p: 1.5, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 120px 110px 36px' }, gap: 1.5, alignItems: 'flex-start' }}>
        <TextField
          label="Name" size="small" fullWidth
          value={ticket.name}
          onChange={(e) => onUpdate(index, 'name', e.target.value)}
          error={Boolean(errors[`tt_name_${index}`])}
          helperText={errors[`tt_name_${index}`]}
          placeholder="e.g. General Admission"
          slotProps={{ htmlInput: { maxLength: 50 } }}
        />
        <TextField
          label="Price" size="small" type="number" fullWidth
          value={ticket.price}
          onChange={(e) => onUpdate(index, 'price', e.target.value)}
          error={Boolean(errors[`tt_price_${index}`])}
          helperText={errors[`tt_price_${index}`] || (isFree ? 'Free' : undefined)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Typography sx={{ fontSize: '0.82rem', color: '#7A8A99', lineHeight: 1 }}>$</Typography>
                </InputAdornment>
              ),
            },
            htmlInput: { min: 0, step: '0.01' },
          }}
        />
        <TextField
          label="Qty" size="small" type="number" fullWidth
          value={ticket.quantity_limit}
          onChange={(e) => onUpdate(index, 'quantity_limit', e.target.value)}
          error={Boolean(errors[`tt_qty_${index}`])}
          helperText={errors[`tt_qty_${index}`]}
          slotProps={{ htmlInput: { min: 1 } }}
        />
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', pt: 0.5 }}>
          <IconButton
            size="small"
            aria-label={`Remove ticket type ${index + 1}`}
            onClick={() => onRemove(index)}
            sx={{ color: '#F87171', '&:hover': { bgcolor: 'rgba(248,113,113,0.08)' } }}
          >
            <DeleteOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const CreateEventPage = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  // ── Form state ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    title:          '',
    description:    '',
    location:       '',
    category:       'General',
    event_date:     '',
    total_capacity: '',
  });
  const [ticketTypes,   setTicketTypes]   = useState([]);
  const [errors,        setErrors]        = useState({});
  const [submitting,    setSubmitting]    = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [submitError,   setSubmitError]   = useState('');

  // ── Cover image state ───────────────────────────────────────────────────────
  const [coverFile,    setCoverFile]    = useState(null);   // File object
  const [coverPreview, setCoverPreview] = useState(null);   // Object URL
  const [imageError,   setImageError]   = useState('');
  const [dragOver,     setDragOver]     = useState(false);
  const fileInputRef   = useRef(null);
  const coverUrlRef    = useRef(null);   // tracks the current object URL for cleanup
  const dragCounter    = useRef(0);      // prevents spurious dragLeave on child hover

  // Revoke any lingering object URL when the component unmounts
  useEffect(() => () => { if (coverUrlRef.current) URL.revokeObjectURL(coverUrlRef.current); }, []);

  // ── Cover image helpers ─────────────────────────────────────────────────────

  const applyFile = (file) => {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setImageError('Only JPEG, PNG, and WebP images are allowed');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('Image must be 5 MB or smaller');
      return;
    }
    setImageError('');
    if (coverUrlRef.current) URL.revokeObjectURL(coverUrlRef.current);
    const url = URL.createObjectURL(file);
    coverUrlRef.current = url;
    setCoverFile(file);
    setCoverPreview(url);
  };

  const removeCover = (e) => {
    e?.stopPropagation();
    if (coverUrlRef.current) URL.revokeObjectURL(coverUrlRef.current);
    coverUrlRef.current = null;
    setCoverFile(null);
    setCoverPreview(null);
    setImageError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) applyFile(file);
    e.target.value = ''; // Reset so re-selecting the same file still fires onChange
  };

  const handleDragEnter = (e) => { e.preventDefault(); dragCounter.current += 1; if (dragCounter.current === 1) setDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); dragCounter.current -= 1; if (dragCounter.current === 0) setDragOver(false); };
  const handleDragOver  = (e) => { e.preventDefault(); };
  const handleDrop      = (e) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) applyFile(file);
  };

  // ── Field change handlers ───────────────────────────────────────────────────

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  // ── Ticket type handlers ────────────────────────────────────────────────────

  const addTicket = (preset = {}) => {
    if (ticketTypes.length >= 10) return;
    setTicketTypes((prev) => [...prev, makeTicket(preset)]);
  };

  const updateTicket = (index, field, value) => {
    setTicketTypes((prev) => { const c = [...prev]; c[index] = { ...c[index], [field]: value }; return c; });
    const errKey = `tt_${field === 'quantity_limit' ? 'qty' : field}_${index}`;
    if (errors[errKey]) setErrors((prev) => { const n = { ...prev }; delete n[errKey]; return n; });
  };

  const removeTicket = (index) => {
    setTicketTypes((prev) => prev.filter((_, i) => i !== index));
    // Drop errors for the removed row and re-index rows after it
    setErrors((prev) => {
      const cleaned = { ...prev };
      Object.keys(cleaned).forEach((k) => {
        if (k.startsWith('tt_')) {
          const rowIdx = parseInt(k.split('_').pop(), 10);
          if (rowIdx >= index) delete cleaned[k];
        }
      });
      delete cleaned._tickets;
      return cleaned;
    });
  };

  // ── Validation ──────────────────────────────────────────────────────────────

  const validate = () => {
    const errs = {};
    const title = formData.title.trim();
    if (!title)                errs.title = 'Title is required';
    else if (title.length < 5) errs.title = 'Title must be at least 5 characters';
    else if (title.length > 255) errs.title = 'Title must be 255 characters or fewer';

    if (!formData.location.trim()) errs.location = 'Location is required';

    if (!formData.event_date) {
      errs.event_date = 'Event date is required';
    } else if (new Date(formData.event_date) <= new Date()) {
      errs.event_date = 'Event date must be in the future';
    }

    const cap = parseInt(formData.total_capacity, 10);
    if (!formData.total_capacity || isNaN(cap) || cap < 1) errs.total_capacity = 'Capacity must be at least 1';
    else if (cap > 100000) errs.total_capacity = 'Capacity cannot exceed 100,000';

    ticketTypes.forEach((tt, i) => {
      const name = tt.name.trim();
      if (!name)               errs[`tt_name_${i}`] = 'Name is required';
      else if (name.length > 50) errs[`tt_name_${i}`] = 'Must be 50 characters or fewer';

      const price = Number(tt.price);
      if (isNaN(price) || price < 0) errs[`tt_price_${i}`] = 'Price must be 0 or more';
      else if (price > 99999.99)      errs[`tt_price_${i}`] = 'Cannot exceed 99,999.99';

      const qty = parseInt(tt.quantity_limit, 10);
      if (!tt.quantity_limit || isNaN(qty) || qty < 1) errs[`tt_qty_${i}`] = 'Quantity must be at least 1';
    });

    if (ticketTypes.length > 0 && !isNaN(cap)) {
      const totalQty = ticketTypes.reduce((sum, tt) => sum + (parseInt(tt.quantity_limit, 10) || 0), 0);
      if (totalQty > cap) errs._tickets = `Total ticket quantity (${totalQty}) exceeds event capacity (${cap})`;
    }

    return errs;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTimeout(() => {
        const el = document.querySelector('[aria-invalid="true"], .Mui-error');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }

    setSubmitting(true);
    try {
      // Use FormData so we can attach the image file alongside text fields.
      // The browser sets Content-Type: multipart/form-data with the correct boundary.
      const fd = new FormData();
      fd.append('title',          formData.title.trim());
      fd.append('description',    formData.description.trim());
      fd.append('location',       formData.location.trim());
      fd.append('category',       formData.category);
      fd.append('event_date',     formData.event_date);
      fd.append('total_capacity', String(parseInt(formData.total_capacity, 10)));
      if (coverFile) {
        fd.append('cover_image', coverFile);
      }
      if (ticketTypes.length > 0) {
        fd.append('ticket_types', JSON.stringify(
          ticketTypes.map((tt) => ({
            name:           tt.name.trim(),
            price:          Number(tt.price),
            quantity_limit: parseInt(tt.quantity_limit, 10),
          }))
        ));
      }

      const response = await fetch(`${API_BASE}/api/events`, {
        method: 'POST',
        headers: {
          // No Content-Type here — the browser sets multipart/form-data + boundary automatically
          'Authorization': `Bearer ${user.token}`,
        },
        body: fd,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.errors?.[0]?.msg ?? data.message ?? 'Failed to submit event');
      }

      setSuccessDialog(true);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoToProfile = () => { setSuccessDialog(false); navigate('/profile'); };

  const handleCreateAnother = () => {
    setSuccessDialog(false);
    setFormData({ title: '', description: '', location: '', category: 'General', event_date: '', total_capacity: '' });
    setTicketTypes([]);
    setErrors({});
    setSubmitError('');
    removeCover();
  };

  // ── Derived values ──────────────────────────────────────────────────────────

  const capacityDisplay = formData.total_capacity
    ? Number(formData.total_capacity).toLocaleString()
    : '—';

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Box sx={pageWrapperSx}>
      <Navbar />

      <Box sx={contentWrapSx}>

        {/* ── Page header ── */}
        <Box sx={pageHeaderSx}>
          <Box sx={headerGlowSx} />
          <Button
            component={Link}
            to="/profile"
            startIcon={<ArrowBackIcon sx={{ fontSize: '1rem !important' }} />}
            sx={backBtnSx}
          >
            Back to Profile
          </Button>
          <Typography variant="h3" sx={pageTitleSx}>Create an Event</Typography>
          <Typography sx={pageSubtitleSx}>
            Fill in the details below. Your event will be reviewed by an admin before going live.
          </Typography>
        </Box>

        {/* ── Main form ── */}
        <Box component="form" onSubmit={handleSubmit} noValidate>

          {/* Two-column on lg+: Event Details | Ticket Types */}
          <Box sx={twoColGridSx}>

            {/* ══ LEFT: Event Details ══════════════════════════════════════════ */}
            <Box sx={sectionCardSx}>
              <SectionHeader icon={<EventIcon />} title="Event Details" />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                {/* Cover Image Upload */}
                <Box>
                  <Typography sx={fieldLabelSx}>
                    Cover Image{' '}
                    <Box component="span" sx={{ color: '#4A5568', fontWeight: 400 }}>(optional)</Box>
                  </Typography>

                  {/* Drop zone */}
                  <Box
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    sx={{
                      position: 'relative',
                      borderRadius: '12px',
                      border: `2px dashed ${dragOver ? 'rgba(0,212,255,0.55)' : 'rgba(240,244,248,0.12)'}`,
                      bgcolor: dragOver ? 'rgba(0,212,255,0.04)' : 'rgba(8,12,16,0.4)',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      transition: 'border-color 0.2s, background-color 0.2s',
                      '&:hover': { borderColor: 'rgba(0,212,255,0.35)', bgcolor: 'rgba(0,212,255,0.02)' },
                    }}
                  >
                    {coverPreview ? (
                      <>
                        {/* 16:9 aspect-ratio preview */}
                        <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                          <Box
                            component="img"
                            src={coverPreview}
                            alt="Cover preview"
                            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </Box>
                        {/* Remove button */}
                        <IconButton
                          size="small"
                          onClick={removeCover}
                          aria-label="Remove cover image"
                          sx={{
                            position: 'absolute', top: 8, right: 8,
                            bgcolor: 'rgba(0,0,0,0.6)', color: '#fff',
                            backdropFilter: 'blur(4px)',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.85)' },
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                        <Typography sx={{ textAlign: 'center', fontSize: '0.72rem', color: '#4A5568', py: 0.75 }}>
                          Click to replace
                        </Typography>
                      </>
                    ) : (
                      <Box sx={{ py: { xs: 4, md: 5 }, px: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <CameraAltIcon sx={{ fontSize: 38, color: '#4A5568' }} />
                        <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#7A8A99' }}>
                          Click or drag & drop a cover image
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#4A5568' }}>
                          JPEG, PNG, WebP · Max 5 MB · Recommended 1600 × 900
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />

                  {imageError && (
                    <Typography sx={{ fontSize: '0.78rem', color: '#F87171', mt: 0.75 }}>{imageError}</Typography>
                  )}
                </Box>

                {/* Title */}
                <TextField
                  label="Event Title" fullWidth required
                  value={formData.title}
                  onChange={handleChange('title')}
                  error={Boolean(errors.title)}
                  helperText={errors.title || ' '}
                  slotProps={{ htmlInput: { maxLength: 255 } }}
                />

                {/* Description */}
                <TextField
                  label="Description" fullWidth multiline minRows={3} maxRows={7}
                  value={formData.description}
                  onChange={handleChange('description')}
                  error={Boolean(errors.description)}
                  helperText={errors.description || 'Optional — tell attendees what to expect'}
                />

                {/* Category + Location row */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '190px 1fr' }, gap: 2 }}>
                  <FormControl required>
                    <InputLabel>Category</InputLabel>
                    <Select value={formData.category} label="Category" onChange={handleChange('category')}>
                      {CATEGORIES.map((cat) => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Location" fullWidth required
                    value={formData.location}
                    onChange={handleChange('location')}
                    error={Boolean(errors.location)}
                    helperText={errors.location || 'Venue name, address, or "Online"'}
                  />
                </Box>

                {/* Date + Capacity row */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 190px' }, gap: 2 }}>
                  <TextField
                    label="Date & Time" type="datetime-local" fullWidth required
                    value={formData.event_date}
                    onChange={handleChange('event_date')}
                    error={Boolean(errors.event_date)}
                    helperText={errors.event_date || ' '}
                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: getMinDatetime() } }}
                    sx={{ '& input': { colorScheme: 'dark' } }}
                  />
                  <TextField
                    label="Total Capacity" type="number" fullWidth required
                    value={formData.total_capacity}
                    onChange={handleChange('total_capacity')}
                    error={Boolean(errors.total_capacity)}
                    helperText={errors.total_capacity || 'Max attendees'}
                    slotProps={{ htmlInput: { min: 1, max: 100000 } }}
                  />
                </Box>
              </Box>
            </Box>

            {/* ══ RIGHT: Ticket Types (sticky on desktop) ══════════════════════ */}
            <Box sx={sidebarSx}>
              <Box sx={sectionCardSx}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <SectionHeader icon={<ConfirmationNumberIcon />} title="Ticket Types" />
                  {ticketTypes.length > 0 && (
                    <Typography sx={{ fontSize: '0.75rem', color: '#4A5568', pb: 3, flexShrink: 0 }}>
                      {ticketTypes.length} / 10
                    </Typography>
                  )}
                </Box>

                <Typography sx={{ fontSize: '0.83rem', color: '#7A8A99', mb: 2.5, mt: -1.5 }}>
                  Optional. If skipped, all{' '}
                  <Box component="span" sx={{ color: '#F0F4F8', fontWeight: 600 }}>{capacityDisplay}</Box>
                  {' '}tickets share one pool.
                </Typography>

                {/* Preset chips */}
                {ticketTypes.length < 10 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip label="+ Free" variant="outlined" onClick={() => addTicket({ name: 'General Admission', price: '0' })} sx={presetChipSx} />
                    <Chip label="+ VIP"  variant="outlined" onClick={() => addTicket({ name: 'VIP',               price: '50' })} sx={presetChipSx} />
                    <Chip label="+ Early Bird" variant="outlined" onClick={() => addTicket({ name: 'Early Bird',  price: '25' })} sx={presetChipSx} />
                    <Chip icon={<AddIcon />} label="Custom" variant="outlined" onClick={() => addTicket()} sx={presetChipSx} />
                  </Box>
                )}

                {/* Ticket rows */}
                {ticketTypes.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {ticketTypes.map((tt, i) => (
                      <TicketTypeRow key={tt._id} ticket={tt} index={i} onUpdate={updateTicket} onRemove={removeTicket} errors={errors} />
                    ))}
                  </Box>
                ) : (
                  <Box sx={emptyTicketHintSx}>
                    <ConfirmationNumberIcon sx={{ fontSize: 30, opacity: 0.2, mb: 1 }} />
                    <Typography sx={{ fontSize: '0.8rem', color: '#4A5568', textAlign: 'center' }}>
                      No ticket types yet — use a preset to get started
                    </Typography>
                  </Box>
                )}

                {/* Cross-field capacity error */}
                {errors._tickets && (
                  <Alert severity="error" sx={{ ...alertSx, mt: 2 }}>{errors._tickets}</Alert>
                )}
              </Box>
            </Box>
          </Box>

          {/* Submit error */}
          {submitError && (
            <Alert severity="error" sx={{ ...alertSx, mt: 3 }}>{submitError}</Alert>
          )}

          {/* Footer */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3, pb: 2 }}>
            <Button component={Link} to="/profile" variant="outlined" disabled={submitting} sx={cancelBtnSx}>
              Cancel
            </Button>
            <Button
              type="submit" variant="contained" disabled={submitting}
              startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
              sx={submitBtnSx}
            >
              {submitting ? 'Submitting…' : 'Submit for Review'}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ── Success Dialog ── */}
      <Dialog open={successDialog} maxWidth="xs" fullWidth slotProps={{ paper: { sx: successDialogPaperSx } }}>
        <DialogContent sx={{ textAlign: 'center', py: 5, px: 4 }}>
          <CheckCircleOutlinedIcon sx={{ fontSize: 64, color: '#4ADE80', mb: 2 }} />
          <Typography sx={successTitleSx}>Event submitted!</Typography>
          <Typography sx={successBodySx}>
            Your event is now pending admin review. Once approved, it will appear on the public events feed.
          </Typography>
          {user?.role === 'attendee' && (
            <Typography sx={{ fontSize: '0.82rem', color: '#4ADE80', mt: 1.5, lineHeight: 1.5 }}>
              You&apos;ll be promoted to Organizer once your first event is approved.
            </Typography>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 3.5 }}>
            <Button variant="contained" fullWidth onClick={handleGoToProfile} sx={submitBtnSx}>
              Go to my profile
            </Button>
            <Button fullWidth onClick={handleCreateAnother} sx={{ color: '#7A8A99', '&:hover': { bgcolor: 'rgba(240,244,248,0.04)' } }}>
              Create another event
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CreateEventPage;

// ── Styles ────────────────────────────────────────────────────────────────────

const GUTTER = { xs: '24px', sm: '48px', md: '80px', xl: '120px' };

const pageWrapperSx = {
  minHeight: '100vh',
  background: '#080C10',
  backgroundImage: 'radial-gradient(rgba(0,212,255,0.06) 1px, transparent 2px)',
  backgroundSize: '32px 32px',
};

const contentWrapSx = {
  pt: { xs: 10, md: 12 },
  pb: 8,
  px: GUTTER,
};

const pageHeaderSx = {
  position: 'relative',
  pt: { xs: 4, md: 5 },
  pb: 4,
  overflow: 'hidden',
};

const headerGlowSx = {
  position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
  width: '120%', height: '200px',
  background: 'radial-gradient(ellipse at center top, rgba(0,212,255,0.07) 0%, transparent 70%)',
  pointerEvents: 'none',
};

const backBtnSx = {
  position: 'relative', zIndex: 1,
  color: '#7A8A99', fontSize: '0.83rem', px: 0, mb: 3,
  '&:hover': { color: '#F0F4F8', bgcolor: 'transparent' },
};

const pageTitleSx = {
  position: 'relative', zIndex: 1,
  fontFamily: '"Syne", sans-serif', fontWeight: 800,
  fontSize: { xs: '1.8rem', md: '2.4rem' },
  color: '#F0F4F8', mb: 1,
};

const pageSubtitleSx = {
  position: 'relative', zIndex: 1,
  fontSize: '0.9rem', color: '#7A8A99', maxWidth: 520,
};

/** Single stacked column — Event Details on top, Ticket Types below, same width. */
const twoColGridSx = {
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

/** No special positioning needed — ticket types sits in normal flow below event details. */
const sidebarSx = {};

const sectionCardSx = {
  background: 'rgba(14,19,24,0.7)',
  border: '1px solid rgba(240,244,248,0.07)',
  borderRadius: '16px',
  p: { xs: 3, md: 4 },
  backdropFilter: 'blur(8px)',
};

const fieldLabelSx = {
  fontSize: '0.82rem', fontWeight: 500,
  color: '#7A8A99', mb: 0.75,
  display: 'block',
};

const presetChipSx = {
  color: '#00D4FF', borderColor: 'rgba(0,212,255,0.25)',
  fontSize: '0.78rem', height: 28, cursor: 'pointer',
  '& .MuiChip-icon': { fontSize: '0.9rem !important', color: '#00D4FF' },
  '&:hover': { bgcolor: 'rgba(0,212,255,0.06)', borderColor: 'rgba(0,212,255,0.5)' },
};

const emptyTicketHintSx = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  py: 4, mt: 0.5,
  borderRadius: '12px', border: '1px dashed rgba(240,244,248,0.07)',
};

const ticketRowSx = {
  display: 'flex',
  borderRadius: '12px', border: '1px solid rgba(240,244,248,0.07)',
  background: 'rgba(8,12,16,0.4)', overflow: 'hidden',
  transition: 'border-color 0.2s',
  '&:hover': { borderColor: 'rgba(0,212,255,0.12)' },
};

const alertSx = {
  bgcolor: 'rgba(239,68,68,0.08)', color: '#fca5a5',
  border: '1px solid rgba(239,68,68,0.15)',
  '& .MuiAlert-icon': { color: '#f87171' },
};

const cancelBtnSx = {
  color: '#7A8A99', borderColor: 'rgba(120,138,153,0.25)',
  '&:hover': { borderColor: 'rgba(120,138,153,0.5)', bgcolor: 'rgba(120,138,153,0.04)' },
};

const submitBtnSx = {
  background: 'linear-gradient(135deg, #00D4FF 0%, #0088CC 100%)',
  color: '#080C10', fontWeight: 700, px: 3, py: 1.2,
  '&:hover': { background: 'linear-gradient(135deg, #33DDFF 0%, #00AAFF 100%)', boxShadow: '0 0 24px rgba(0,212,255,0.25)' },
  '&.Mui-disabled': { opacity: 0.5, background: 'linear-gradient(135deg, #00D4FF 0%, #0088CC 100%)', color: '#080C10' },
};

const successDialogPaperSx = {
  background: '#0E1318', border: '1px solid rgba(240,244,248,0.08)', borderRadius: '20px',
};

const successTitleSx = {
  fontFamily: '"Syne", sans-serif', fontWeight: 800,
  fontSize: '1.4rem', color: '#F0F4F8', mb: 1.5,
};

const successBodySx = { fontSize: '0.88rem', color: '#7A8A99', lineHeight: 1.6 };
