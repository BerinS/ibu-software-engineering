import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Box, Skeleton, Chip } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import EventCarousel from '../components/EventCarousel';
import Footer from '../components/Footer';
import { styles } from './AllEvents.style';
import { API_BASE } from '../config.js';

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

const SORT_OPTIONS = [
  { key: 'date-asc',  label: 'Soonest'  },
  { key: 'date-desc', label: 'Latest'   },
  { key: 'capacity',  label: 'Biggest'  },
  { key: 'alpha',     label: 'A → Z'    },
];

const sellRate = (e) => {
  const total = Number(e.total_tickets) || 0;
  return total > 0 ? Number(e.tickets_sold_count) / total : 0;
};

const AllEvents = () => {
  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeSort, setActiveSort] = useState('date-asc');

  useEffect(() => {
    fetch(`${API_BASE}/api/events`)
      .then((res) => res.json())
      .then((data) => { setEvents(data); setLoading(false); })
      .catch((err) => { console.error('Error fetching events:', err); setLoading(false); });
  }, []);

  /* ── Carousel datasets (derived client-side, no extra fetch) ── */
  const comingSoon = useMemo(() => {
    const now = new Date();
    return [...events]
      .filter((e) => new Date(e.event_date) > now)
      .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
  }, [events]);

  const biggest = useMemo(
    () => [...events].sort((a, b) => b.total_capacity - a.total_capacity),
    [events]
  );

  const sellingOut = useMemo(
    () =>
      [...events]
        .filter((e) => Number(e.total_tickets) > 0)
        .sort((a, b) => sellRate(b) - sellRate(a)),
    [events]
  );

  /* ── Sorted grid (client-side) ── */
  const displayEvents = useMemo(() => {
    const s = [...events];
    switch (activeSort) {
      case 'date-asc':  return s.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
      case 'date-desc': return s.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
      case 'capacity':  return s.sort((a, b) => b.total_capacity - a.total_capacity);
      case 'alpha':     return s.sort((a, b) => a.title.localeCompare(b.title));
      default:          return s;
    }
  }, [events, activeSort]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const totalCapacity   = events.reduce((sum, e) => sum + (e.total_capacity || 0), 0);
    const ticketsAvailable = events.reduce(
      (sum, e) => sum + (Number(e.tickets_available) || e.total_capacity || 0),
      0
    );
    return [
      { value: events.length, label: 'Events'            },
      { value: totalCapacity,  label: 'Total Capacity'    },
      { value: ticketsAvailable, label: 'Tickets Available' },
    ];
  }, [events]);

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

      {/* ── Stats bar ── */}
      {!loading && events.length > 0 && (
        <Box sx={styles.statsBar}>
          {stats.map(({ value, label }) => (
            <Box key={label} sx={styles.statItem}>
              <Typography sx={styles.statValue}>{value.toLocaleString()}</Typography>
              <Typography sx={styles.statLabel}>{label}</Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* ── Carousels ── */}
      {!loading && (
        <>
          <EventCarousel
            title="Coming Up First"
            subtitle="Sorted by nearest event date"
            events={comingSoon}
          />
          <EventCarousel
            title="Biggest Events"
            subtitle="Highest total capacity"
            events={biggest}
          />
          {sellingOut.length > 0 && (
            <EventCarousel
              title="Selling Out Soon"
              subtitle="Highest ticket sell-through rate"
              events={sellingOut}
            />
          )}
        </>
      )}

      {/* ── All Events grid ── */}
      <Box sx={styles.gridSection}>
        <Box sx={styles.sectionLabelRow}>
          <Typography sx={styles.sectionLabel}>
            {loading ? 'Loading' : `${events.length} Events`}
          </Typography>
          <Box sx={styles.sectionDivider} />
          {!loading && (
            <Box sx={styles.sortChips}>
              {SORT_OPTIONS.map(({ key, label }) => (
                <Chip
                  key={key}
                  label={label}
                  size="small"
                  onClick={() => setActiveSort(key)}
                  sx={activeSort === key ? styles.sortChipActive : styles.sortChip}
                />
              ))}
            </Box>
          )}
        </Box>

        <Box sx={styles.cardsGrid}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <EventSkeleton key={i} />)
            : displayEvents.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
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

      <Footer />
    </Box>
  );
};

export default AllEvents;
