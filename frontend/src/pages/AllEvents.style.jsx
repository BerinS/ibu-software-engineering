export const GUTTER = { xs: '24px', sm: '48px', md: '80px', xl: '120px' };

export const styles = {
  pageWrapper: {
    minHeight: '100vh',
    background: '#080C10',
    backgroundImage: 'radial-gradient(rgba(0,212,255,0.06) 1px, transparent 2px)',
    backgroundSize: '32px 32px',
  },

  heroSection: {
    pt: { xs: 14, md: 18 },
    pb: { xs: 6, md: 8 },
    px: GUTTER,
    position: 'relative',
    overflow: 'hidden',
  },

  ambientGlow: {
    position: 'absolute',
    top: 0,
    left: '-10%',
    width: '60vw',
    height: '340px',
    background: 'radial-gradient(ellipse at left center, rgba(0,212,255,0.09) 0%, transparent 70%)',
    pointerEvents: 'none',
  },

  badgeWrapper: {
    mb: 3,
    animation: 'fadeSlideUp 0.5s ease both',
  },

  badge: {
    background: 'rgba(0, 212, 255, 0.08)',
    border: '1px solid rgba(0, 212, 255, 0.2)',
    color: '#00D4FF',
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '0.75rem',
    fontWeight: 500,
    letterSpacing: '0.04em',
    height: 28,
    '& .MuiChip-icon': { ml: 0.5 },
  },

  badgeIcon: {
    fontSize: '13px !important',
    color: '#00D4FF !important',
  },

  heading: {
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
  },

  subtitle: {
    color: '#7A8A99',
    fontSize: { xs: '0.95rem', md: '1.05rem' },
    fontWeight: 400,
    lineHeight: 1.65,
    animation: 'fadeSlideUp 0.6s ease both',
    animationDelay: '120ms',
  },

  gridSection: {
    px: GUTTER,
    pb: 12,
  },

  sectionLabelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    mb: 4,
    animation: 'fadeSlideUp 0.6s ease both',
    animationDelay: '180ms',
  },

  sectionLabel: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#7A8A99',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },

  sectionDivider: {
    flex: 1,
    height: '1px',
    background: 'linear-gradient(90deg, rgba(240,244,248,0.1) 0%, transparent 100%)',
  },

  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 3,
  },

  emptyState: {
    textAlign: 'center',
    py: 16,
    animation: 'fadeSlideUp 0.5s ease both',
  },

  emptyStateHeading: {
    fontFamily: '"Syne", sans-serif',
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#F0F4F8',
    mb: 1,
  },

  emptyStateSubtext: {
    color: '#7A8A99',
    fontSize: '0.9rem',
  },

  skeleton: {
    wrapper: {
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid rgba(240,244,248,0.06)',
      background: 'rgba(14,19,24,0.7)',
    },
    inner: { p: 2.5 },
    bone: { bgcolor: 'rgba(255,255,255,0.04)' },
    boneMargin: { bgcolor: 'rgba(255,255,255,0.04)', mb: 1 },
    boneTop: { bgcolor: 'rgba(255,255,255,0.04)', mt: 0.5 },
    button: { bgcolor: 'rgba(255,255,255,0.04)', mt: 2, borderRadius: '9px' },
  },
};