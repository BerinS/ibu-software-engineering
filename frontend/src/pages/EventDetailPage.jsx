import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Chip, Button, Skeleton, Divider, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Rating, TextField, Snackbar, CircularProgress, InputAdornment,
  Avatar,
} from '@mui/material';
import CalendarMonthIcon      from '@mui/icons-material/CalendarMonth';
import LocationOnIcon         from '@mui/icons-material/LocationOn';
import PeopleIcon             from '@mui/icons-material/People';
import ArrowBackIcon          from '@mui/icons-material/ArrowBack';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AccessTimeIcon         from '@mui/icons-material/AccessTime';
import QrCode2Icon            from '@mui/icons-material/QrCode2';
import StarIcon               from '@mui/icons-material/Star';
import CheckCircleIcon        from '@mui/icons-material/CheckCircle';
import HourglassTopIcon       from '@mui/icons-material/HourglassTop';
import PeopleAltIcon          from '@mui/icons-material/PeopleAlt';
import PersonIcon             from '@mui/icons-material/Person';
import ListAltIcon            from '@mui/icons-material/ListAlt';
import Navbar  from '../components/Navbar';
import Footer  from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config.js';
const QR_URL   = (hash) => `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${hash}`;

/* ─────────────────────────────────────────────── */

const EventDetailPage = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { user }     = useAuth();

  const [event,       setEvent]       = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [notFound,    setNotFound]    = useState(false);

  // Booking
  const [selectedTT,  setSelectedTT]  = useState(null);   // ticket_type_id
  const [booking,     setBooking]      = useState(null);   // confirmed booking (has qr_hash)
  const [bookingBusy, setBookingBusy] = useState(false);
  const [bookingErr,  setBookingErr]  = useState('');
  const [bookingOpen, setBookingOpen] = useState(false);   // confirmation dialog

  // Payment form state
  const [cardNumber,     setCardNumber]     = useState('');
  const [cardName,       setCardName]       = useState('');
  const [cardExpiry,     setCardExpiry]     = useState('');
  const [cardCvv,        setCardCvv]        = useState('');
  const [paymentErr,     setPaymentErr]     = useState('');
  const [qrOpen,      setQrOpen]      = useState(false);   // QR dialog

  // Feedback
  const [feedbackList,    setFeedbackList]    = useState([]);
  const [feedbackRating,  setFeedbackRating]  = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackBusy,    setFeedbackBusy]    = useState(false);
  const [feedbackErr,     setFeedbackErr]     = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Custom registration field responses
  const [customResponses, setCustomResponses] = useState({});

  // Waitlist
  const [onWaitlist,    setOnWaitlist]    = useState(false);
  const [waitlistBusy,  setWaitlistBusy]  = useState(false);
  const [waitlistErr,   setWaitlistErr]   = useState('');

  // Attendee directory
  const [directory,     setDirectory]     = useState([]);
  const [directoryOpen, setDirectoryOpen] = useState(false);

  // Snackbar
  const [snack, setSnack] = useState({ open: false, msg: '', color: '#4ADE80' });

  const authHeaders = user
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` }
    : { 'Content-Type': 'application/json' };

  /* ── Fetch event + tickets + feedback ── */
  const loadPage = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/api/events/${id}`),
      fetch(`${API_BASE}/api/events/${id}/tickets`),
      fetch(`${API_BASE}/api/events/${id}/feedback`),
    ])
      .then(async ([evRes, ttRes, fbRes]) => {
        if (!evRes.ok) throw new Error('not found');
        const [ev, tts, fb] = await Promise.all([
          evRes.json(),
          ttRes.ok ? ttRes.json() : [],
          fbRes.ok ? fbRes.json() : [],
        ]);
        setEvent(ev);
        setTicketTypes(tts);
        setFeedbackList(fb);
        if (tts.length > 0) setSelectedTT(tts.find(t => (t.quantity_limit - (t.tickets_sold ?? 0)) > 0)?.id ?? null);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  // Check if logged-in user already has a booking / waitlist spot for this event
  const checkExistingBooking = useCallback(() => {
    if (!user) return;
    fetch(`${API_BASE}/api/users/me/bookings`, { headers: authHeaders })
      .then(r => r.ok ? r.json() : [])
      .then(bookings => {
        const existing = bookings.find(b => String(b.event_id) === String(id));
        if (existing) setBooking(existing);
      })
      .catch(() => {});

    // Check waitlist status
    fetch(`${API_BASE}/api/events/${id}/waitlist/me`, { headers: authHeaders })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.waitlisted) setOnWaitlist(true); })
      .catch(() => {});

    // Load attendee directory (visible to attendees with confirmed booking)
    fetch(`${API_BASE}/api/events/${id}/directory`, { headers: authHeaders })
      .then(r => r.ok ? r.json() : [])
      .then(setDirectory)
      .catch(() => {});
  }, [user, id]);

  useEffect(() => { loadPage(); }, [loadPage]);
  useEffect(() => { checkExistingBooking(); }, [checkExistingBooking]);

  /* ── Payment helpers ── */
  const formatCardNumber = (val) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    return digits.length >= 3 ? `${digits.slice(0,2)}/${digits.slice(2)}` : digits;
  };

  const selectedTicket = ticketTypes.find(t => t.id === selectedTT);
  const isPaidTicket   = selectedTicket && Number(selectedTicket.price) > 0;

  const validatePayment = () => {
    if (!isPaidTicket) return true;
    const digits = cardNumber.replace(/\s/g, '');
    if (digits.length < 16)        { setPaymentErr('Please enter a valid 16-digit card number'); return false; }
    if (!cardName.trim())          { setPaymentErr('Please enter the cardholder name'); return false; }
    if (cardExpiry.length < 5)     { setPaymentErr('Please enter a valid expiry date (MM/YY)'); return false; }
    if (cardCvv.length < 3)        { setPaymentErr('Please enter a valid CVV'); return false; }
    return true;
  };

  const resetPayment = () => {
    setCardNumber(''); setCardName(''); setCardExpiry(''); setCardCvv(''); setPaymentErr('');
  };

  /* ── Book ticket ── */
  const handleBook = async () => {
    if (!user) { navigate('/login'); return; }
    if (!selectedTT) return;
    if (!validatePayment()) return;
    setBookingBusy(true);
    setBookingErr('');
    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ ticket_type_id: selectedTT, custom_responses: customResponses }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Booking failed');
      setBooking(data);
      setBookingOpen(false);
      setQrOpen(true);
      setSnack({ open: true, msg: 'Ticket booked successfully!', color: '#4ADE80' });
      // Refresh ticket availability
      loadPage();
    } catch (err) {
      setBookingErr(err.message);
    } finally {
      setBookingBusy(false);
    }
  };

  /* ── Join waitlist ── */
  const handleJoinWaitlist = async () => {
    if (!user) { navigate('/login'); return; }
    setWaitlistBusy(true);
    setWaitlistErr('');
    try {
      const res = await fetch(`${API_BASE}/api/events/${id}/waitlist`, {
        method: 'POST',
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not join waitlist');
      setOnWaitlist(true);
      setSnack({ open: true, msg: "You're on the waitlist!", color: '#F59E0B' });
    } catch (err) {
      setWaitlistErr(err.message);
      setSnack({ open: true, msg: err.message, color: '#F87171' });
    } finally {
      setWaitlistBusy(false);
    }
  };

  /* ── Submit feedback ── */
  const handleFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackRating) { setFeedbackErr('Please select a rating.'); return; }
    setFeedbackBusy(true);
    setFeedbackErr('');
    try {
      const res = await fetch(`${API_BASE}/api/events/${id}/feedback`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ rating: feedbackRating, comment: feedbackComment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit feedback');
      setFeedbackSuccess(true);
      setSnack({ open: true, msg: 'Feedback submitted!', color: '#4ADE80' });
      // Refresh feedback list
      fetch(`${API_BASE}/api/events/${id}/feedback`)
        .then(r => r.ok ? r.json() : [])
        .then(setFeedbackList)
        .catch(() => {});
    } catch (err) {
      setFeedbackErr(err.message);
    } finally {
      setFeedbackBusy(false);
    }
  };

  /* ── Derived values ── */
  const coverSrc = event?.cover_image
    ? `${API_BASE}/uploads/events/${event.cover_image}`
    : `https://picsum.photos/seed/${id}/1200/500`;

  const formattedDate = event
    ? new Date(event.event_date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : '';

  const formattedTime = event
    ? new Date(event.event_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '';

  const totalTickets   = event?.total_tickets   ?? event?.total_capacity  ?? 1;
  const avail          = event?.tickets_available ?? event?.total_capacity ?? 0;
  const availPct       = Math.max(0, Math.round((avail / totalTickets) * 100));

  const agenda = event?.agenda_data
    ? (Array.isArray(event.agenda_data) ? event.agenda_data : JSON.parse(event.agenda_data))
    : [];

  const speakers = event?.speakers_data
    ? (Array.isArray(event.speakers_data) ? event.speakers_data : JSON.parse(event.speakers_data))
    : [];

  const customFieldDefs = event?.custom_fields
    ? (Array.isArray(event.custom_fields) ? event.custom_fields : JSON.parse(event.custom_fields))
    : [];

  const avgRating = feedbackList.length > 0
    ? feedbackList[0]?.avg_rating ?? null
    : null;

  /* ── Not found ── */
  if (notFound) {
    return (
      <Box sx={{ minHeight: '100vh', background: '#080C10', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <Typography variant="h4" sx={{ fontFamily: '"Syne", sans-serif', color: '#F0F4F8' }}>
            Event not found
          </Typography>
          <Button onClick={() => navigate('/')} startIcon={<ArrowBackIcon />} sx={{ color: '#00D4FF' }}>
            Back to Events
          </Button>
        </Box>
        <Footer />
      </Box>
    );
  }

  /* ─────────────── Render ─────────────── */
  return (
    <Box sx={{ minHeight: '100vh', background: '#080C10', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* ── Hero image ── */}
      <Box sx={{ position: 'relative', width: '100%', height: { xs: 240, md: 420 }, overflow: 'hidden' }}>
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: '#0E1318' }} />
        ) : (
          <Box component="img" src={coverSrc} alt={event?.title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(8,12,16,0.1) 0%, rgba(8,12,16,0.85) 100%)',
        }} />
        <Button
          onClick={() => navigate('/')}
          startIcon={<ArrowBackIcon />}
          sx={{
            position: 'absolute', top: 24, left: 24,
            color: '#F0F4F8', background: 'rgba(8,12,16,0.6)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(240,244,248,0.1)',
            borderRadius: '10px',
            '&:hover': { background: 'rgba(8,12,16,0.85)' },
          }}
        >
          Back
        </Button>
      </Box>

      {/* ── Main content ── */}
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 4 }, py: 5, flex: 1, width: '100%' }}>
        <Grid container spacing={5}>

          {/* ── Left column ── */}
          <Grid item xs={12} md={8}>
            {loading ? (
              <>
                <Skeleton height={48} sx={{ bgcolor: '#0E1318', mb: 2 }} />
                <Skeleton height={20} width="60%" sx={{ bgcolor: '#0E1318', mb: 4 }} />
                <Skeleton height={120} sx={{ bgcolor: '#0E1318' }} />
              </>
            ) : (
              <>
                {event.category && (
                  <Chip label={event.category} size="small" sx={{
                    mb: 2,
                    background: 'rgba(0,212,255,0.1)', color: '#00D4FF',
                    border: '1px solid rgba(0,212,255,0.2)',
                    fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.06em',
                  }} />
                )}

                <Typography variant="h3" sx={{
                  fontFamily: '"Syne", sans-serif', fontWeight: 800,
                  color: '#F0F4F8', mb: 3, lineHeight: 1.2,
                  fontSize: { xs: '1.8rem', md: '2.4rem' },
                }}>
                  {event.title}
                </Typography>

                {/* Rating badge */}
                {avgRating && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <StarIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                    <Typography sx={{ color: '#F59E0B', fontSize: '0.88rem', fontWeight: 700 }}>
                      {avgRating}
                    </Typography>
                    <Typography sx={{ color: '#4A5568', fontSize: '0.8rem' }}>
                      ({feedbackList.length} {feedbackList.length === 1 ? 'review' : 'reviews'})
                    </Typography>
                  </Box>
                )}

                {/* Meta */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 4 }}>
                  {[
                    { Icon: CalendarMonthIcon, text: formattedDate },
                    { Icon: AccessTimeIcon,    text: formattedTime },
                    { Icon: LocationOnIcon,    text: event.location },
                    { Icon: PeopleIcon,        text: `${avail.toLocaleString()} / ${totalTickets.toLocaleString()} tickets available` },
                  ].map(({ Icon, text }, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icon sx={{ fontSize: 16, color: '#00D4FF' }} />
                      <Typography sx={{ color: '#7A8A99', fontSize: '0.9rem' }}>{text}</Typography>
                    </Box>
                  ))}
                </Box>

                {/* Availability bar */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography sx={{ fontSize: '0.78rem', color: '#7A8A99' }}>Availability</Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: availPct < 20 ? '#f87171' : '#00D4FF' }}>
                      {availPct}% remaining
                    </Typography>
                  </Box>
                  <Box sx={{ height: 4, borderRadius: 2, background: 'rgba(240,244,248,0.08)' }}>
                    <Box sx={{
                      height: '100%', borderRadius: 2, width: `${availPct}%`,
                      background: availPct < 20
                        ? 'linear-gradient(90deg,#f87171,#ef4444)'
                        : 'linear-gradient(90deg,#00D4FF,#0099bb)',
                      transition: 'width 0.6s ease',
                    }} />
                  </Box>
                </Box>

                <Divider sx={{ borderColor: 'rgba(240,244,248,0.06)', mb: 4 }} />

                {/* Description */}
                {event.description && (
                  <Box sx={{ mb: 4 }}>
                    <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#F0F4F8', mb: 1.5 }}>
                      About this event
                    </Typography>
                    <Typography sx={{ color: '#7A8A99', fontSize: '0.92rem', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
                      {event.description}
                    </Typography>
                  </Box>
                )}

                {/* Agenda */}
                {agenda.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#F0F4F8', mb: 2 }}>
                      Agenda
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {agenda.map((item, idx) => (
                        <Box key={idx} sx={{
                          display: 'flex', gap: 2,
                          background: 'rgba(14,19,24,0.7)',
                          border: '1px solid rgba(240,244,248,0.06)',
                          borderRadius: '10px', p: 2,
                        }}>
                          {item.time && (
                            <Typography sx={{ fontSize: '0.8rem', color: '#00D4FF', fontWeight: 600, minWidth: 56, flexShrink: 0 }}>
                              {item.time}
                            </Typography>
                          )}
                          <Box>
                            {item.title && (
                              <Typography sx={{ fontSize: '0.9rem', color: '#F0F4F8', fontWeight: 600 }}>{item.title}</Typography>
                            )}
                            {item.description && (
                              <Typography sx={{ fontSize: '0.82rem', color: '#7A8A99', mt: 0.25 }}>{item.description}</Typography>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Speakers */}
                {speakers.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#F0F4F8', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon sx={{ fontSize: 18, color: '#00D4FF' }} />
                      Speakers
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {speakers.map((sp, i) => (
                        <Box key={i} sx={{
                          display: 'flex', gap: 2, p: 2, borderRadius: '12px',
                          background: 'rgba(14,19,24,0.7)', border: '1px solid rgba(240,244,248,0.06)',
                        }}>
                          <Avatar sx={{ width: 44, height: 44, bgcolor: 'rgba(0,212,255,0.1)', color: '#00D4FF', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                            {sp.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#F0F4F8' }}>{sp.name}</Typography>
                            {sp.title && (
                              <Typography sx={{ fontSize: '0.8rem', color: '#00D4FF', mb: 0.5 }}>{sp.title}</Typography>
                            )}
                            {sp.bio && (
                              <Typography sx={{ fontSize: '0.82rem', color: '#7A8A99', lineHeight: 1.5 }}>{sp.bio}</Typography>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                <Divider sx={{ borderColor: 'rgba(240,244,248,0.06)', mb: 4 }} />

                {/* ── Feedback section ── */}
                <Box>
                  <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#F0F4F8', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon sx={{ fontSize: 18, color: '#F59E0B' }} />
                    Reviews
                  </Typography>

                  {/* Submit feedback form — only if user has a booking */}
                  {booking && !feedbackSuccess && (
                    <Box
                      component="form"
                      onSubmit={handleFeedback}
                      sx={{
                        mb: 3, p: 3, borderRadius: '12px',
                        background: 'rgba(14,19,24,0.7)',
                        border: '1px solid rgba(0,212,255,0.1)',
                      }}
                    >
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#F0F4F8', mb: 1.5 }}>
                        Leave a review
                      </Typography>
                      <Rating
                        value={feedbackRating}
                        onChange={(_, v) => setFeedbackRating(v)}
                        sx={{ color: '#F59E0B', mb: 1.5 }}
                      />
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Share your experience (optional)"
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { color: '#F0F4F8' } }}
                      />
                      {feedbackErr && <Alert severity="error" sx={{ mb: 1.5, bgcolor: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.15)' }}>{feedbackErr}</Alert>}
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={feedbackBusy}
                        sx={{
                          background: 'linear-gradient(135deg,#00D4FF,#0099bb)',
                          color: '#080C10', fontWeight: 700, borderRadius: '8px',
                        }}
                      >
                        {feedbackBusy ? <CircularProgress size={18} sx={{ color: '#080C10' }} /> : 'Submit Review'}
                      </Button>
                    </Box>
                  )}

                  {feedbackSuccess && (
                    <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3, bgcolor: 'rgba(74,222,128,0.08)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.2)' }}>
                      Thanks for your review!
                    </Alert>
                  )}

                  {/* Review list */}
                  {feedbackList.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {feedbackList.map((fb) => (
                        <Box key={fb.id} sx={{
                          p: 2.5, borderRadius: '12px',
                          background: 'rgba(14,19,24,0.6)',
                          border: '1px solid rgba(240,244,248,0.06)',
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#F0F4F8' }}>
                              {fb.user_name}
                            </Typography>
                            <Rating value={Number(fb.rating)} readOnly size="small" sx={{ color: '#F59E0B' }} />
                          </Box>
                          {fb.comment && (
                            <Typography sx={{ fontSize: '0.83rem', color: '#7A8A99', lineHeight: 1.6 }}>
                              {fb.comment}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: '0.85rem', color: '#4A5568', fontStyle: 'italic' }}>
                      No reviews yet. Be the first to share your experience!
                    </Typography>
                  )}
                </Box>
              </>
            )}
          </Grid>

          {/* ── Right column — tickets ── */}
          <Grid item xs={12} md={4}>
            <Box sx={{
              position: { md: 'sticky' }, top: { md: 32 },
              background: 'rgba(14,19,24,0.8)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(240,244,248,0.06)',
              borderRadius: '16px',
              p: 3,
            }}>
              <Typography sx={{
                fontFamily: '"Syne", sans-serif', fontWeight: 700,
                fontSize: '1.05rem', color: '#F0F4F8', mb: 2.5,
                display: 'flex', alignItems: 'center', gap: 1,
              }}>
                <ConfirmationNumberIcon sx={{ fontSize: 18, color: '#00D4FF' }} />
                Tickets
              </Typography>

              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} height={72} sx={{ bgcolor: '#0E1318', mb: 1.5, borderRadius: 2 }} />
                ))
              ) : ticketTypes.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {ticketTypes.map((tt) => {
                    const ttAvail   = tt.quantity_limit - (tt.tickets_sold ?? 0);
                    const isSoldOut = ttAvail <= 0;
                    const isSelected = selectedTT === tt.id;
                    return (
                      <Box
                        key={tt.id}
                        onClick={() => { if (!isSoldOut) setSelectedTT(tt.id); }}
                        sx={{
                          background: isSelected
                            ? 'rgba(0,212,255,0.07)'
                            : 'rgba(240,244,248,0.03)',
                          border: `1px solid ${isSelected ? 'rgba(0,212,255,0.4)' : isSoldOut ? 'rgba(240,244,248,0.06)' : 'rgba(0,212,255,0.12)'}`,
                          borderRadius: '10px',
                          p: 2,
                          opacity: isSoldOut ? 0.55 : 1,
                          cursor: isSoldOut ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': !isSoldOut ? {
                            borderColor: 'rgba(0,212,255,0.35)',
                            background: 'rgba(0,212,255,0.05)',
                          } : {},
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography sx={{ fontWeight: 600, color: '#F0F4F8', fontSize: '0.9rem' }}>
                            {tt.name}
                          </Typography>
                          <Typography sx={{ fontWeight: 700, color: '#00D4FF', fontSize: '0.9rem' }}>
                            {Number(tt.price) === 0 ? 'Free' : `$${Number(tt.price).toFixed(2)}`}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.75rem', color: '#7A8A99', mt: 0.5 }}>
                          {isSoldOut ? 'Sold out' : `${ttAvail} left`}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Box sx={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.12)', borderRadius: '10px', p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 600, color: '#F0F4F8', fontSize: '0.9rem' }}>General Admission</Typography>
                    <Typography sx={{ fontWeight: 700, color: '#00D4FF', fontSize: '0.9rem' }}>Free</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.75rem', color: '#7A8A99', mt: 0.5 }}>
                    {(event?.total_capacity ?? 0).toLocaleString()} capacity
                  </Typography>
                </Box>
              )}

              {/* Already booked — show QR button */}
              {booking ? (
                <>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<QrCode2Icon />}
                    onClick={() => setQrOpen(true)}
                    sx={{
                      mt: 3, borderColor: 'rgba(0,212,255,0.35)', color: '#00D4FF',
                      fontWeight: 700, py: 1.4, borderRadius: '10px',
                      '&:hover': { borderColor: '#00D4FF', background: 'rgba(0,212,255,0.08)' },
                    }}
                  >
                    View My Ticket (QR)
                  </Button>
                </>
              ) : onWaitlist ? (
                <Box sx={{
                  mt: 3, p: 2, borderRadius: '10px', textAlign: 'center',
                  background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)',
                }}>
                  <HourglassTopIcon sx={{ fontSize: 22, color: '#F59E0B', mb: 0.5 }} />
                  <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#F59E0B' }}>
                    You're on the waitlist
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#7A8A99', mt: 0.25 }}>
                    We'll notify you if a spot opens up
                  </Typography>
                </Box>
              ) : availPct === 0 ? (
                <>
                  <Box sx={{
                    mt: 3, p: 1.5, borderRadius: '10px', textAlign: 'center',
                    background: 'rgba(240,244,248,0.04)', border: '1px solid rgba(240,244,248,0.08)',
                    mb: 1.5,
                  }}>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#7A8A99' }}>
                      Sold Out
                    </Typography>
                  </Box>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={waitlistBusy ? <CircularProgress size={14} sx={{ color: '#F59E0B' }} /> : <HourglassTopIcon />}
                    onClick={handleJoinWaitlist}
                    disabled={waitlistBusy}
                    sx={{
                      borderColor: 'rgba(245,158,11,0.4)', color: '#F59E0B',
                      fontWeight: 700, py: 1.4, borderRadius: '10px',
                      '&:hover': { borderColor: '#F59E0B', background: 'rgba(245,158,11,0.06)' },
                    }}
                  >
                    Join Waitlist
                  </Button>
                </>
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  disabled={!selectedTT}
                  onClick={() => {
                    if (!user) { navigate('/login'); return; }
                    setBookingOpen(true);
                  }}
                  sx={{
                    mt: 3,
                    background: 'linear-gradient(135deg,#00D4FF,#0099bb)',
                    color: '#080C10',
                    fontWeight: 700, py: 1.4, borderRadius: '10px', fontSize: '0.92rem',
                    boxShadow: '0 0 24px rgba(0,212,255,0.25)',
                    '&:hover': { background: 'linear-gradient(135deg,#00bfea,#008aaa)' },
                  }}
                >
                  Get Tickets
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Footer />

      {/* ── Booking / Payment dialog ── */}
      <Dialog
        open={bookingOpen}
        onClose={() => { if (!bookingBusy) { setBookingOpen(false); resetPayment(); } }}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { background: '#0E1318', border: '1px solid rgba(240,244,248,0.08)', borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, color: '#F0F4F8' }}>
          {isPaidTicket ? 'Payment Details' : 'Confirm Booking'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>

          {/* Order summary */}
          <Box sx={{ p: 2, borderRadius: '10px', background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)' }}>
            <Typography sx={{ fontSize: '0.78rem', color: '#4A5568', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              Order Summary
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#F0F4F8' }}>
                  {event?.title}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#7A8A99' }}>
                  {selectedTicket?.name ?? ''}
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#00D4FF' }}>
                {selectedTicket && Number(selectedTicket.price) === 0
                  ? 'Free'
                  : selectedTicket ? `$${Number(selectedTicket.price).toFixed(2)}` : ''}
              </Typography>
            </Box>
          </Box>

          {/* Custom registration fields */}
          {customFieldDefs.length > 0 && (
            <>
              <Divider sx={{ borderColor: 'rgba(240,244,248,0.06)' }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                <ListAltIcon sx={{ fontSize: 15, color: '#00D4FF' }} />
                <Typography sx={{ fontSize: '0.78rem', color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                  Registration Details
                </Typography>
              </Box>
              {customFieldDefs.map((field, i) => (
                <TextField
                  key={i}
                  label={field}
                  fullWidth
                  size="small"
                  value={customResponses[field] ?? ''}
                  onChange={e => setCustomResponses(prev => ({ ...prev, [field]: e.target.value }))}
                  InputProps={{ sx: { color: '#F0F4F8' } }}
                />
              ))}
            </>
          )}

          {/* Payment form — only for paid tickets */}
          {isPaidTicket && (
            <>
              <Divider sx={{ borderColor: 'rgba(240,244,248,0.06)' }} />
              <Typography sx={{ fontSize: '0.78rem', color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                Card Information
              </Typography>

              {/* Card number */}
              <TextField
                label="Card Number"
                fullWidth
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                inputProps={{ maxLength: 19, inputMode: 'numeric' }}
                InputProps={{
                  sx: { color: '#F0F4F8', fontFamily: 'monospace', letterSpacing: '0.1em' },
                  endAdornment: (
                    <Box sx={{ display: 'flex', gap: 0.5, opacity: 0.5 }}>
                      {['VISA', 'MC'].map(b => (
                        <Box key={b} sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#7A8A99', border: '1px solid rgba(240,244,248,0.15)', borderRadius: '4px', px: 0.5 }}>
                          {b}
                        </Box>
                      ))}
                    </Box>
                  ),
                }}
              />

              {/* Cardholder name */}
              <TextField
                label="Cardholder Name"
                fullWidth
                placeholder="John Smith"
                value={cardName}
                onChange={e => setCardName(e.target.value.toUpperCase())}
                InputProps={{ sx: { color: '#F0F4F8', letterSpacing: '0.05em' } }}
              />

              {/* Expiry + CVV side by side */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Expiry (MM/YY)"
                  fullWidth
                  placeholder="08/27"
                  value={cardExpiry}
                  onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                  inputProps={{ maxLength: 5, inputMode: 'numeric' }}
                  InputProps={{ sx: { color: '#F0F4F8' } }}
                />
                <TextField
                  label="CVV"
                  fullWidth
                  placeholder="123"
                  value={cardCvv}
                  onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  inputProps={{ maxLength: 4, inputMode: 'numeric' }}
                  type="password"
                  InputProps={{ sx: { color: '#F0F4F8' } }}
                />
              </Box>

              <Typography sx={{ fontSize: '0.75rem', color: '#4A5568', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                🔒 Your payment info is encrypted and secure
              </Typography>
            </>
          )}

          {(bookingErr || paymentErr) && (
            <Alert severity="error" sx={{ bgcolor: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.15)' }}>
              {bookingErr || paymentErr}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => { setBookingOpen(false); resetPayment(); }} disabled={bookingBusy} sx={{ color: '#7A8A99' }}>
            Cancel
          </Button>
          <Button
            onClick={handleBook}
            disabled={bookingBusy}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg,#00D4FF,#0099bb)',
              color: '#080C10', fontWeight: 700, borderRadius: '8px', px: 3,
            }}
          >
            {bookingBusy
              ? <CircularProgress size={18} sx={{ color: '#080C10' }} />
              : isPaidTicket
                ? `Pay $${Number(selectedTicket?.price ?? 0).toFixed(2)}`
                : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Attendee Directory dialog ── */}
      <Dialog
        open={directoryOpen}
        onClose={() => setDirectoryOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { background: '#0E1318', border: '1px solid rgba(240,244,248,0.08)', borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, color: '#F0F4F8', display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleAltIcon sx={{ color: '#00D4FF', fontSize: 20 }} />
          Attendee Directory
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.8rem', color: '#4A5568', mb: 2 }}>
            {directory.length} confirmed attendee{directory.length !== 1 ? 's' : ''} for this event
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {directory.map((a, i) => (
              <Box key={i} sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5,
                borderRadius: '10px', background: 'rgba(14,19,24,0.7)',
                border: '1px solid rgba(240,244,248,0.05)',
              }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(0,212,255,0.1)', color: '#00D4FF', fontSize: '0.72rem', fontWeight: 700 }}>
                  {(a.full_name ?? '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#F0F4F8' }}>{a.full_name}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#4A5568' }}>{a.ticket_type_name}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDirectoryOpen(false)} sx={{ color: '#7A8A99' }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── QR Code dialog ── */}
      <Dialog
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        PaperProps={{ sx: { background: '#0E1318', border: '1px solid rgba(240,244,248,0.08)', borderRadius: '16px', minWidth: 320 } }}
      >
        <DialogTitle sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, color: '#F0F4F8', textAlign: 'center' }}>
          Your Ticket
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pb: 1 }}>
          <Box sx={{
            p: 2, background: '#fff', borderRadius: '12px',
            boxShadow: '0 0 32px rgba(0,212,255,0.15)',
          }}>
            <Box
              component="img"
              src={QR_URL(booking?.qr_hash)}
              alt="QR Code"
              sx={{ display: 'block', width: 200, height: 200 }}
            />
          </Box>
          <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, color: '#F0F4F8', textAlign: 'center' }}>
            {event?.title}
          </Typography>
          <Chip
            label="Confirmed"
            size="small"
            icon={<CheckCircleIcon sx={{ fontSize: 14, color: '#4ADE80 !important' }} />}
            sx={{ color: '#4ADE80', bgcolor: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}
          />
          <Typography sx={{ fontSize: '0.78rem', color: '#4A5568', textAlign: 'center', pb: 1 }}>
            Show this QR code at the event entrance
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2.5 }}>
          <Button onClick={() => setQrOpen(false)} sx={{ color: '#7A8A99' }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        message={snack.msg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{ sx: { bgcolor: snack.color === '#4ADE80' ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)', color: snack.color, border: `1px solid ${snack.color}33`, borderRadius: '10px' } }}
      />
    </Box>
  );
};

export default EventDetailPage;
