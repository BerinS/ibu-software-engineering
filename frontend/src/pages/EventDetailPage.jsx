import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Chip, Button, Skeleton, Divider, Grid,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_BASE = 'http://localhost:5000';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/events/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then((data) => {
        setEvent(data);
        // fetch ticket types separately
        return fetch(`${API_BASE}/api/events/${id}/tickets`);
      })
      .then((res) => res.ok ? res.json() : [])
      .then((tts) => { setTicketTypes(tts); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [id]);

  const coverSrc = event?.cover_image
    ? `${API_BASE}/uploads/events/${event.cover_image}`
    : `https://picsum.photos/seed/${id}/1200/500`;

  const formattedDate = event
    ? new Date(event.event_date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : '';

  const formattedTime = event
    ? new Date(event.event_date).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit',
      })
    : '';

  const availabilityPercent = event
    ? Math.round(((event.tickets_available ?? event.total_capacity) / (event.total_tickets ?? event.total_capacity)) * 100)
    : 0;

  const agenda = event?.agenda_data
    ? (Array.isArray(event.agenda_data) ? event.agenda_data : JSON.parse(event.agenda_data))
    : [];

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

  return (
    <Box sx={{ minHeight: '100vh', background: '#080C10', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* ── Hero image ── */}
      <Box sx={{ position: 'relative', width: '100%', height: { xs: 240, md: 420 }, overflow: 'hidden' }}>
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: '#0E1318' }} />
        ) : (
          <Box
            component="img"
            src={coverSrc}
            alt={event?.title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(8,12,16,0.1) 0%, rgba(8,12,16,0.85) 100%)',
        }} />

        {/* Back button */}
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

          {/* Left column */}
          <Grid item xs={12} md={8}>
            {loading ? (
              <>
                <Skeleton height={48} sx={{ bgcolor: '#0E1318', mb: 2 }} />
                <Skeleton height={20} width="60%" sx={{ bgcolor: '#0E1318', mb: 4 }} />
                <Skeleton height={120} sx={{ bgcolor: '#0E1318' }} />
              </>
            ) : (
              <>
                {/* Category */}
                {event.category && (
                  <Chip
                    label={event.category}
                    size="small"
                    sx={{
                      mb: 2,
                      background: 'rgba(0,212,255,0.1)',
                      color: '#00D4FF',
                      border: '1px solid rgba(0,212,255,0.2)',
                      fontWeight: 600,
                      fontSize: '0.72rem',
                      letterSpacing: '0.06em',
                    }}
                  />
                )}

                {/* Title */}
                <Typography variant="h3" sx={{
                  fontFamily: '"Syne", sans-serif', fontWeight: 800,
                  color: '#F0F4F8', mb: 3, lineHeight: 1.2,
                  fontSize: { xs: '1.8rem', md: '2.4rem' },
                }}>
                  {event.title}
                </Typography>

                {/* Meta row */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarMonthIcon sx={{ fontSize: 16, color: '#00D4FF' }} />
                    <Typography sx={{ color: '#7A8A99', fontSize: '0.9rem' }}>
                      {formattedDate}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon sx={{ fontSize: 16, color: '#00D4FF' }} />
                    <Typography sx={{ color: '#7A8A99', fontSize: '0.9rem' }}>
                      {formattedTime}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon sx={{ fontSize: 16, color: '#00D4FF' }} />
                    <Typography sx={{ color: '#7A8A99', fontSize: '0.9rem' }}>
                      {event.location}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleIcon sx={{ fontSize: 16, color: '#00D4FF' }} />
                    <Typography sx={{ color: '#7A8A99', fontSize: '0.9rem' }}>
                      {(event.tickets_available ?? event.total_capacity).toLocaleString()} /{' '}
                      {(event.total_tickets ?? event.total_capacity).toLocaleString()} tickets available
                    </Typography>
                  </Box>
                </Box>

                {/* Availability bar */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography sx={{ fontSize: '0.78rem', color: '#7A8A99' }}>Availability</Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: availabilityPercent < 20 ? '#f87171' : '#00D4FF' }}>
                      {availabilityPercent}% remaining
                    </Typography>
                  </Box>
                  <Box sx={{ height: 4, borderRadius: 2, background: 'rgba(240,244,248,0.08)' }}>
                    <Box sx={{
                      height: '100%', borderRadius: 2,
                      width: `${availabilityPercent}%`,
                      background: availabilityPercent < 20
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
                    <Typography sx={{
                      fontFamily: '"Syne", sans-serif', fontWeight: 700,
                      fontSize: '1.1rem', color: '#F0F4F8', mb: 1.5,
                    }}>
                      About this event
                    </Typography>
                    <Typography sx={{
                      color: '#7A8A99', fontSize: '0.92rem', lineHeight: 1.75,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {event.description}
                    </Typography>
                  </Box>
                )}

                {/* Agenda */}
                {agenda.length > 0 && (
                  <Box>
                    <Typography sx={{
                      fontFamily: '"Syne", sans-serif', fontWeight: 700,
                      fontSize: '1.1rem', color: '#F0F4F8', mb: 2,
                    }}>
                      Agenda
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {agenda.map((item, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: 'flex', gap: 2,
                            background: 'rgba(14,19,24,0.7)',
                            border: '1px solid rgba(240,244,248,0.06)',
                            borderRadius: '10px', p: 2,
                          }}
                        >
                          {item.time && (
                            <Typography sx={{
                              fontSize: '0.8rem', color: '#00D4FF',
                              fontWeight: 600, minWidth: 56, flexShrink: 0,
                            }}>
                              {item.time}
                            </Typography>
                          )}
                          <Box>
                            {item.title && (
                              <Typography sx={{ fontSize: '0.9rem', color: '#F0F4F8', fontWeight: 600 }}>
                                {item.title}
                              </Typography>
                            )}
                            {item.description && (
                              <Typography sx={{ fontSize: '0.82rem', color: '#7A8A99', mt: 0.25 }}>
                                {item.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </>
            )}
          </Grid>

          {/* Right column — ticket types */}
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
                    const sold = tt.tickets_sold ?? 0;
                    const available = tt.quantity_limit - sold;
                    const isSoldOut = available <= 0;
                    return (
                      <Box
                        key={tt.id}
                        sx={{
                          background: 'rgba(240,244,248,0.03)',
                          border: `1px solid ${isSoldOut ? 'rgba(240,244,248,0.06)' : 'rgba(0,212,255,0.12)'}`,
                          borderRadius: '10px',
                          p: 2,
                          opacity: isSoldOut ? 0.55 : 1,
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
                          {isSoldOut ? 'Sold out' : `${available} left`}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                /* No explicit ticket types — show general capacity info */
                <Box sx={{
                  background: 'rgba(0,212,255,0.05)',
                  border: '1px solid rgba(0,212,255,0.12)',
                  borderRadius: '10px', p: 2,
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 600, color: '#F0F4F8', fontSize: '0.9rem' }}>
                      General Admission
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: '#00D4FF', fontSize: '0.9rem' }}>
                      Free
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.75rem', color: '#7A8A99', mt: 0.5 }}>
                    {(event?.total_capacity ?? 0).toLocaleString()} capacity
                  </Typography>
                </Box>
              )}

              <Button
                fullWidth
                variant="contained"
                disabled={availabilityPercent === 0}
                sx={{
                  mt: 3,
                  background: availabilityPercent === 0
                    ? 'rgba(240,244,248,0.06)'
                    : 'linear-gradient(135deg,#00D4FF,#0099bb)',
                  color: availabilityPercent === 0 ? '#7A8A99' : '#080C10',
                  fontWeight: 700,
                  py: 1.4,
                  borderRadius: '10px',
                  fontSize: '0.92rem',
                  boxShadow: availabilityPercent === 0 ? 'none' : '0 0 24px rgba(0,212,255,0.25)',
                  '&:hover': {
                    background: availabilityPercent === 0
                      ? undefined
                      : 'linear-gradient(135deg,#00bfea,#008aaa)',
                  },
                }}
              >
                {availabilityPercent === 0 ? 'Sold Out' : 'Get Tickets'}
              </Button>
            </Box>
          </Grid>

        </Grid>
      </Box>

      <Footer />
    </Box>
  );
};

export default EventDetailPage;
