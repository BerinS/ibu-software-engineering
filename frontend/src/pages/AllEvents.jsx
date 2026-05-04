import React, { useState, useEffect } from 'react';
import { Grid, Typography, Box, Skeleton, Chip } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';

/* ── Skeleton placeholder while loading ── */
const EventSkeleton = () => (
  <Box
    sx={{
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid rgba(240,244,248,0.06)',
      background: 'rgba(14,19,24,0.7)',
    }}
  >
    <Skeleton variant="rectangular" height={180} sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
    <Box sx={{ p: 2.5 }}>
      <Skeleton height={24} sx={{ bgcolor: 'rgba(255,255,255,0.04)', mb: 1 }} />
      <Skeleton height={16} width="60%" sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
      <Skeleton height={16} width="45%" sx={{ bgcolor: 'rgba(255,255,255,0.04)', mt: 0.5 }} />
      <Skeleton height={40} sx={{ bgcolor: 'rgba(255,255,255,0.04)', mt: 2, borderRadius: '9px' }} />
    </Box>
  </Box>
);

/* ── Shared full-bleed padding ── */
const GUTTER = { xs: '24px', sm: '48px', md: '80px', xl: '120px' };

const AllEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/events')
      .then((res) => res.json())
      .then((data) => { setEvents(data); setLoading(false); })
      .catch((err) => { console.error('Error fetching events:', err); setLoading(false); });
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#080C10',
        backgroundImage: 'radial-gradient(rgba(0,212,255,0.06) 1px, transparent 2px)',
        backgroundSize: '32px 32px',
      }}
    >
      <Navbar />

      {/* ── Hero — full bleed, no Container ── */}
      <Box
        sx={{
          pt: { xs: 14, md: 18 },
          pb: { xs: 6, md: 8 },
          px: GUTTER,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient glow anchored to left */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: '-10%',
            width: '60vw',
            height: '340px',
            background: 'radial-gradient(ellipse at left center, rgba(0,212,255,0.09) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Pill badge */}
        <Box sx={{ mb: 3, animation: 'fadeSlideUp 0.5s ease both' }}>
          <Chip
            icon={<BoltIcon sx={{ fontSize: '13px !important', color: '#00D4FF !important' }} />}
            label="Live & Upcoming"
            size="small"
            sx={{
              background: 'rgba(0, 212, 255, 0.08)',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              color: '#00D4FF',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.75rem',
              fontWeight: 500,
              letterSpacing: '0.04em',
              height: 28,
              '& .MuiChip-icon': { ml: 0.5 },
            }}
          />
        </Box>

        {/* Heading — left-anchored, no max-width cap */}
        <Typography
          variant="h2"
          sx={{
            fontFamily: '"Syne", sans-serif',
            fontWeight: 800,
            fontSize: { xs: '2.4rem', sm: '3rem', md: '4.5rem', xl: '5rem' },
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: '#F0F4F8',
            mb: 3,
            animation: 'fadeSlideUp 0.55s ease both',
            animationDelay: '60ms',
            '& span': {
              background: 'linear-gradient(90deg, #00D4FF 0%, #0088CC 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            },
          }}
        >
          Discover <span>Events</span>
          <br />
          Worth Attending.
        </Typography>

        <Typography
          sx={{
            color: '#7A8A99',
            fontSize: { xs: '0.95rem', md: '1.05rem' },
            fontWeight: 400,
            lineHeight: 1.65,
            animation: 'fadeSlideUp 0.6s ease both',
            animationDelay: '120ms',
          }}
        >
          Curated experiences, conferences, and gatherings for professionals
          who move the industry forward.
        </Typography>
      </Box>

      {/* ── Events Grid — full bleed with gutters ── */}
      <Box sx={{ px: GUTTER, pb: 12 }}>

        {/* Section label */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 4,
            animation: 'fadeSlideUp 0.6s ease both',
            animationDelay: '180ms',
          }}
        >
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#7A8A99',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? 'Loading' : `${events.length} Events`}
          </Typography>
          <Box
            sx={{
              flex: 1,
              height: '1px',
              background: 'linear-gradient(90deg, rgba(240,244,248,0.1) 0%, transparent 100%)',
            }}
          />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 3,
          }}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <EventSkeleton key={i} />
              ))
            : events.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
        </Box>

        {/* Empty state */}
        {!loading && events.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 16, animation: 'fadeSlideUp 0.5s ease both' }}>
            <Typography
              sx={{
                fontFamily: '"Syne", sans-serif',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#F0F4F8',
                mb: 1,
              }}
            >
              No events yet
            </Typography>
            <Typography sx={{ color: '#7A8A99', fontSize: '0.9rem' }}>
              Check back soon — new events are added regularly.
            </Typography>
          </Box>
        )}
      </Box>      
    </Box>
  );
};

export default AllEvents;