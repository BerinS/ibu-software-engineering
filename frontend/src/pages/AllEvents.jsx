import React, { useState, useEffect } from 'react';
import { Typography, Box, Skeleton, Chip } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import { styles } from './AllEvents.style';

/* ── Skeleton placeholder while loading ── */
const EventSkeleton = () => (
  <Box sx={styles.skeleton.wrapper}>
    <Skeleton variant="rectangular" height={180} sx={styles.skeleton.bone} />
    <Box sx={styles.skeleton.inner}>
      <Skeleton height={24} sx={styles.skeleton.boneMargin} />
      <Skeleton height={16} width="60%" sx={styles.skeleton.bone} />
      <Skeleton height={16} width="45%" sx={styles.skeleton.boneTop} />
      <Skeleton height={40} sx={styles.skeleton.button} />
    </Box>
  </Box>
);

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
    <Box sx={styles.pageWrapper}>
      <Navbar />

      {/* ── Hero ── */}
      <Box sx={styles.heroSection}>
        <Box sx={styles.ambientGlow} />

        <Box sx={styles.badgeWrapper}>
          <Chip
            icon={<BoltIcon sx={styles.badgeIcon} />}
            label="Live & Upcoming"
            size="small"
            sx={styles.badge}
          />
        </Box>

        <Typography variant="h2" sx={styles.heading}>
          Discover <span>Events</span>
          <br />
          Worth Attending.
        </Typography>

        <Typography sx={styles.subtitle}>
          Curated experiences, conferences, and gatherings for professionals
          who move the industry forward.
        </Typography>
      </Box>

      {/* ── Events Grid ── */}
      <Box sx={styles.gridSection}>
        <Box sx={styles.sectionLabelRow}>
          <Typography sx={styles.sectionLabel}>
            {loading ? 'Loading' : `${events.length} Events`}
          </Typography>
          <Box sx={styles.sectionDivider} />
        </Box>

        <Box sx={styles.cardsGrid}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <EventSkeleton key={i} />)
            : events.map((event, i) => <EventCard key={event.id} event={event} index={i} />)}
        </Box>

        {!loading && events.length === 0 && (
          <Box sx={styles.emptyState}>
            <Typography sx={styles.emptyStateHeading}>No events yet</Typography>
            <Typography sx={styles.emptyStateSubtext}>
              Check back soon — new events are added regularly.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AllEvents;