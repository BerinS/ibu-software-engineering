import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardActions, Typography, Button, Box } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { API_BASE } from '../config.js';

const EventCard = ({ event, index = 0 }) => {
  const navigate = useNavigate();
  const formattedDate = new Date(event.event_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const month = new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day   = new Date(event.event_date).getDate();

  // Use the organizer-uploaded cover when available; fall back to a deterministic
  // placeholder so cards always have an image (picsum is seeded by event id).
  const coverSrc = event.cover_image
    ? `${API_BASE}/uploads/events/${event.cover_image}`
    : `https://picsum.photos/seed/${event.id}/400/200`;

  return (
    <Card
      onClick={() => navigate(`/events/${event.id}`)}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(14, 19, 24, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(240, 244, 248, 0.06)',
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        boxShadow: 'none',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: `fadeSlideUp 0.5s ease both`,
        animationDelay: `${index * 80}ms`,
        '@keyframes fadeSlideUp': {
          from: { opacity: 0, transform: 'translateY(24px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        '&:hover': {
          transform: 'translateY(-6px)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          boxShadow: '0 0 40px rgba(0, 212, 255, 0.08), 0 20px 60px rgba(0,0,0,0.4)',
        },
        '&:hover .card-image': {
          transform: 'scale(1.04)',
        },
        '&:hover .view-btn': {
          background: 'rgba(0, 212, 255, 0.12)',
          color: '#00D4FF',
          gap: '10px',
        },
      }}
    >
      {/* Image container */}
      <Box
        sx={{
          position: 'relative',
          height: 180,
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <Box
          className="card-image"
          component="img"
          src={coverSrc}
          alt={event.title}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'block',
          }}
        />
        {/* Gradient overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(8,12,16,0.1) 0%, rgba(8,12,16,0.6) 100%)',
          }}
        />

        {/* Date badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 14,
            left: 14,
            background: 'rgba(8, 12, 16, 0.75)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(240, 244, 248, 0.12)',
            borderRadius: '10px',
            px: 1.5,
            py: 0.75,
            textAlign: 'center',
            minWidth: 48,
          }}
        >
          <Typography
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.6rem',
              fontWeight: 600,
              color: '#00D4FF',
              letterSpacing: '0.1em',
              lineHeight: 1,
            }}
          >
            {month}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Syne", sans-serif',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#F0F4F8',
              lineHeight: 1.1,
            }}
          >
            {day}
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <CardContent sx={{ flexGrow: 1, p: 2.5, pb: 1.5 }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Syne", sans-serif',
            fontWeight: 700,
            fontSize: '1rem',
            color: '#F0F4F8',
            mb: 1.5,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {event.title}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <CalendarMonthIcon sx={{ fontSize: 13, color: '#00D4FF', opacity: 0.8, flexShrink: 0 }} />
            <Typography
              variant="body2"
              sx={{ fontSize: '0.78rem', color: '#7A8A99', fontWeight: 400 }}
            >
              {formattedDate}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <LocationOnIcon sx={{ fontSize: 13, color: '#00D4FF', opacity: 0.8, flexShrink: 0 }} />
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.78rem',
                color: '#7A8A99',
                fontWeight: 400,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {event.location}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2.5, pt: 1 }}>
        <Button
          className="view-btn"
          fullWidth
          onClick={() => navigate(`/events/${event.id}`)}
          endIcon={<ArrowForwardIcon sx={{ fontSize: '14px !important', transition: 'transform 0.2s' }} />}
          sx={{
            color: '#7A8A99',
            background: 'rgba(240, 244, 248, 0.04)',
            border: '1px solid rgba(240, 244, 248, 0.08)',
            borderRadius: '9px',
            py: 1,
            fontSize: '0.82rem',
            fontWeight: 500,
            gap: 'auto',
            justifyContent: 'center',
            transition: 'all 0.25s ease',
            '&:hover .MuiButton-endIcon': {
              transform: 'translateX(3px)',
            },
          }}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default EventCard;