import React, { useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EventCard from './EventCard';
import { GUTTER } from '../pages/AllEvents.style';

const CARD_WIDTH = 300;
const GAP = 20; // px — must match the gap value in the scroll row sx
const SCROLL_STEP = CARD_WIDTH + GAP;

// Edge fade: sm+ only, hidden on mobile via display:none.
const edgeFade = (side) => ({
  position: 'absolute',
  [side]: 0,
  top: 0,
  bottom: 0,
  width: { sm: '72px', md: '108px' },
  background: `linear-gradient(to ${side === 'left' ? 'right' : 'left'}, #080C10 0%, transparent 100%)`,
  pointerEvents: 'none',
  zIndex: 1,
  display: { xs: 'none', sm: 'block' },
});

const arrowSx = {
  color: '#7A8A99',
  border: '1px solid rgba(240,244,248,0.08)',
  borderRadius: '8px',
  width: 32,
  height: 32,
  '&:hover': {
    color: '#00D4FF',
    borderColor: 'rgba(0,212,255,0.3)',
    background: 'rgba(0,212,255,0.06)',
  },
  transition: 'all 0.2s',
};

const EventCarousel = ({ title, subtitle, events }) => {
  const scrollRef = useRef(null);
  // Pixel width of one full copy of cards (recalculated on resize).
  const jumpDist = useRef(0);

  // Measure the rendered card width and set the initial scroll position to
  // the start of the middle copy. useLayoutEffect runs before paint so there
  // is no visible flash of copy 1.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !events.length) return;

    const calc = () => {
      const firstCard = el.firstElementChild;
      if (!firstCard) return;
      // Width of one copy = N cards × (cardWidth + gap).
      // We add one extra gap because there is a gap after every card including
      // the last one in a copy (it is followed by the first card of the next copy).
      jumpDist.current = events.length * (firstCard.offsetWidth + GAP);
    };

    calc();
    el.scrollLeft = jumpDist.current; // land in the middle copy on load

    // Keep jumpDist accurate when the viewport is resized (e.g. xs → sm).
    // We do NOT reset scrollLeft on resize to avoid jarring jumps mid-browse.
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [events.length]);

  // Seamless loop: when the user scrolls into copy 1 (left) or copy 3 (right),
  // instantly teleport by one copy-width in the opposite direction. The content
  // is identical so the jump is invisible.
  //   copy 1: scrollLeft ∈ [0,       dist)
  //   copy 2: scrollLeft ∈ [dist,  2*dist)  ← always land here
  //   copy 3: scrollLeft ∈ [2*dist, 3*dist)
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    const dist = jumpDist.current;
    if (!el || !dist) return;

    if (el.scrollLeft >= dist * 2) {
      el.scrollLeft -= dist;
    } else if (el.scrollLeft < dist) {
      el.scrollLeft += dist;
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * SCROLL_STEP, behavior: 'smooth' });
  };

  if (!events || events.length === 0) return null;

  // Three identical copies so the user can scroll freely in either direction.
  const loopedEvents = [...events, ...events, ...events];

  return (
    <Box sx={{ mb: { xs: 6, md: 8 } }}>
      {/* Header */}
      <Box
        sx={{
          px: GUTTER,
          mb: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: '"Syne", sans-serif',
              fontWeight: 700,
              fontSize: { xs: '1rem', md: '1.1rem' },
              color: '#F0F4F8',
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ fontSize: '0.78rem', color: '#7A8A99', mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 0.75, flexShrink: 0 }}>
          <IconButton onClick={() => scroll(-1)} size="small" sx={arrowSx}>
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton onClick={() => scroll(1)} size="small" sx={arrowSx}>
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Scroll area — position:relative anchors the edge-fade overlays */}
      <Box sx={{ position: 'relative' }}>
        <Box sx={edgeFade('left')} />
        <Box sx={edgeFade('right')} />

        <Box
          ref={scrollRef}
          sx={{
            display: 'flex',
            gap: `${GAP}px`,
            pl: GUTTER,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            pb: '8px',
            '&::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {loopedEvents.map((event, i) => (
            <Box
              key={`${event.id}-${i}`}
              sx={{
                minWidth: { xs: 'calc(100vw - 48px)', sm: `${CARD_WIDTH}px` },
                maxWidth: { xs: 'calc(100vw - 48px)', sm: `${CARD_WIDTH}px` },
                scrollSnapAlign: { xs: 'center', sm: 'start' },
                flexShrink: 0,
              }}
            >
              {/* Use modulo so animation stagger repeats per copy, not per index */}
              <EventCard event={event} index={i % events.length} />
            </Box>
          ))}

          {/* Trailing spacer — flex+overflow-x ignores padding-right in some
              browsers; a real child element is the reliable cross-browser fix. */}
          <Box sx={{ minWidth: GUTTER, flexShrink: 0 }} />
        </Box>
      </Box>
    </Box>
  );
};

export default EventCarousel;
