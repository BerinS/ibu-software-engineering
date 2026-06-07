import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, Divider } from '@mui/material';
import EmailIcon    from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon   from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Navbar  from '../components/Navbar';
import Footer  from '../components/Footer';

const ContactPage = () => {
  const [form,    setForm]    = useState({ name: '', email: '', subject: '', message: '' });
  const [sent,    setSent]    = useState(false);
  const [errors,  setErrors]  = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Name is required';
    if (!form.email.trim())   e.email   = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.message.trim()) e.message = 'Message is required';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    // Simulate send (no real email backend)
    setSent(true);
  };

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  return (
    <Box sx={{ minHeight: '100vh', background: '#080C10', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 3, md: 6 }, pt: { xs: 12, md: 16 }, pb: 10, flex: 1, width: '100%' }}>

        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" sx={{
            fontFamily: '"Syne", sans-serif', fontWeight: 800,
            color: '#F0F4F8', mb: 1.5, fontSize: { xs: '2rem', md: '2.6rem' },
          }}>
            Get in touch
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', color: '#7A8A99', lineHeight: 1.75, maxWidth: 520 }}>
            Have a question about Scanova, want to report an issue, or just want to say hello? We'd love to hear from you.
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.6fr' }, gap: 5 }}>

          {/* Left — contact info */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[
              {
                icon: <EmailIcon sx={{ fontSize: 20, color: '#00D4FF' }} />,
                label: 'Email',
                value: 'scanova@ibu.edu.ba',
              },
              {
                icon: <LocationOnIcon sx={{ fontSize: 20, color: '#00D4FF' }} />,
                label: 'Location',
                value: 'Sarajevo, Bosnia and Herzegovina',
              },
              {
                icon: <SchoolIcon sx={{ fontSize: 20, color: '#00D4FF' }} />,
                label: 'University',
                value: 'International Burch University',
              },
            ].map((item) => (
              <Box key={item.label} sx={{
                display: 'flex', gap: 2, p: 2.5, borderRadius: '12px',
                background: 'rgba(14,19,24,0.7)',
                border: '1px solid rgba(240,244,248,0.06)',
              }}>
                <Box sx={{
                  width: 38, height: 38, borderRadius: '10px', flexShrink: 0,
                  background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {item.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.72rem', color: '#4A5568', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.25 }}>
                    {item.label}
                  </Typography>
                  <Typography sx={{ fontSize: '0.88rem', color: '#F0F4F8' }}>{item.value}</Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Right — form */}
          <Box sx={{
            p: 3.5, borderRadius: '16px',
            background: 'rgba(14,19,24,0.7)',
            border: '1px solid rgba(240,244,248,0.06)',
          }}>
            {sent ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 4, gap: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 48, color: '#4ADE80' }} />
                <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#F0F4F8' }}>
                  Message sent!
                </Typography>
                <Typography sx={{ fontSize: '0.88rem', color: '#7A8A99' }}>
                  Thanks for reaching out. We'll get back to you as soon as possible.
                </Typography>
                <Button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  sx={{ mt: 1, color: '#00D4FF', '&:hover': { background: 'rgba(0,212,255,0.06)' } }}>
                  Send another message
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="Your Name" fullWidth required
                    value={form.name} onChange={handleChange('name')}
                    error={Boolean(errors.name)} helperText={errors.name}
                  />
                  <TextField
                    label="Email Address" fullWidth required type="email"
                    value={form.email} onChange={handleChange('email')}
                    error={Boolean(errors.email)} helperText={errors.email}
                  />
                </Box>
                <TextField
                  label="Subject" fullWidth required
                  value={form.subject} onChange={handleChange('subject')}
                  error={Boolean(errors.subject)} helperText={errors.subject}
                />
                <TextField
                  label="Message" fullWidth required multiline rows={5}
                  value={form.message} onChange={handleChange('message')}
                  error={Boolean(errors.message)} helperText={errors.message}
                  placeholder="Tell us how we can help..."
                />
                <Button
                  type="submit" variant="contained" size="large"
                  sx={{
                    background: 'linear-gradient(135deg,#00D4FF,#0099bb)',
                    color: '#080C10', fontWeight: 700, borderRadius: '10px', py: 1.4,
                    '&:hover': { background: 'linear-gradient(135deg,#00bfea,#008aaa)' },
                  }}
                >
                  Send Message
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
};

export default ContactPage;
