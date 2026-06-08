import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import EventIcon         from '@mui/icons-material/Event';
import PeopleIcon        from '@mui/icons-material/People';
import VerifiedIcon      from '@mui/icons-material/Verified';
import Navbar  from '../components/Navbar';
import Footer  from '../components/Footer';

const FEATURES = [
  {
    icon: <EventIcon sx={{ fontSize: 28, color: '#00D4FF' }} />,
    title: 'Event Discovery',
    desc: 'Browse and filter events by category, date, and location. Find exactly what interests you.',
  },
  {
    icon: <QrCodeScannerIcon sx={{ fontSize: 28, color: '#00D4FF' }} />,
    title: 'QR Ticketing',
    desc: 'Book tickets instantly and receive a unique QR code. Fast and seamless check-in at the door.',
  },
  {
    icon: <PeopleIcon sx={{ fontSize: 28, color: '#00D4FF' }} />,
    title: 'Organizer Tools',
    desc: 'Powerful dashboard for organizers — manage events, view attendees, track analytics, and collect feedback.',
  },
  {
    icon: <VerifiedIcon sx={{ fontSize: 28, color: '#00D4FF' }} />,
    title: 'Verified Events',
    desc: 'All events go through admin review before going live, ensuring quality and trustworthiness.',
  },
];

const AboutPage = () => (
  <Box sx={{ minHeight: '100vh', background: '#080C10', display: 'flex', flexDirection: 'column' }}>
    <Navbar />

    <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 3, md: 6 }, pt: { xs: 12, md: 16 }, pb: 10, flex: 1, width: '100%' }}>

      {/* Hero */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: '12px',
            background: 'linear-gradient(135deg, #00D4FF 0%, #0088CC 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(0,212,255,0.3)',
          }}>
            <QrCodeScannerIcon sx={{ fontSize: 22, color: '#080C10' }} />
          </Box>
          <Typography sx={{
            fontFamily: '"Syne", sans-serif', fontWeight: 800,
            fontSize: '1.6rem', letterSpacing: '0.08em', color: '#F0F4F8',
          }}>
            SCANOVA
          </Typography>
        </Box>

        <Typography variant="h3" sx={{
          fontFamily: '"Syne", sans-serif', fontWeight: 800,
          color: '#F0F4F8', mb: 2.5, fontSize: { xs: '2rem', md: '2.8rem' }, lineHeight: 1.2,
        }}>
          Events, simplified.
        </Typography>
        <Typography sx={{
          fontSize: '1rem', color: '#7A8A99', maxWidth: 560, mx: 'auto', lineHeight: 1.75,
        }}>
          Scanova is an event management platform built to connect organizers and attendees.
          Whether you're hosting a small workshop or a large conference, Scanova gives you
          the tools to manage it end-to-end.
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(240,244,248,0.06)', mb: 8 }} />

      {/* Mission */}
      <Box sx={{ mb: 8 }}>
        <Typography sx={{
          fontFamily: '"Syne", sans-serif', fontWeight: 700,
          fontSize: '1.4rem', color: '#F0F4F8', mb: 2,
        }}>
          Our Mission
        </Typography>
        <Typography sx={{ fontSize: '0.95rem', color: '#7A8A99', lineHeight: 1.8 }}>
          We believe that great events bring people together, spark ideas, and build communities.
          Our mission is to remove the friction from event management — from creation and ticketing
          to check-in and feedback — so that organizers can focus on what matters most: creating
          memorable experiences.
        </Typography>
      </Box>

      {/* Features grid */}
      <Box sx={{ mb: 8 }}>
        <Typography sx={{
          fontFamily: '"Syne", sans-serif', fontWeight: 700,
          fontSize: '1.4rem', color: '#F0F4F8', mb: 3,
        }}>
          What we offer
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
          {FEATURES.map((f) => (
            <Box key={f.title} sx={{
              p: 3, borderRadius: '14px',
              background: 'rgba(14,19,24,0.7)',
              border: '1px solid rgba(240,244,248,0.06)',
            }}>
              <Box sx={{ mb: 1.5 }}>{f.icon}</Box>
              <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#F0F4F8', mb: 0.75 }}>
                {f.title}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: '#7A8A99', lineHeight: 1.65 }}>
                {f.desc}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(240,244,248,0.06)', mb: 8 }} />

      {/* Team */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography sx={{
          fontFamily: '"Syne", sans-serif', fontWeight: 700,
          fontSize: '1.4rem', color: '#F0F4F8', mb: 1,
        }}>
          Built by
        </Typography>
        <Typography sx={{ fontSize: '0.92rem', color: '#7A8A99', lineHeight: 1.75 }}>
          Scanova was developed as a university project at the International Burch University,
          Faculty of Electrical Engineering and Natural Sciences, as part of the IT 309 — Software Engineering course.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 3, flexWrap: 'wrap' }}>
          {['Amina Brković', 'Berin Šurković'].map((name) => (
            <Box key={name} sx={{
              px: 3, py: 1.5, borderRadius: '10px',
              background: 'rgba(0,212,255,0.06)',
              border: '1px solid rgba(0,212,255,0.15)',
            }}>
              <Typography sx={{ fontWeight: 700, color: '#00D4FF', fontSize: '0.9rem' }}>{name}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>

    <Footer />
  </Box>
);

export default AboutPage;
