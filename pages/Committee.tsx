import React from 'react';
import { 
  Box, Typography, Grid, Card, Button, IconButton, 
  Avatar, Chip, CircularProgress, Paper, useTheme, 
  Fade, Stack, Divider, TextField, InputAdornment,
  Link
} from '@mui/material';
import { Phone, Mail, Linkedin, Twitter, MessageSquare } from 'lucide-react';
import { COMMITTEE } from '../constants';
import { useLanguage } from '../components/LanguageContext';

const Committee: React.FC = () => {
  const { t } = useLanguage();
  const theme = useTheme();

  return (
    <Fade in={true}>
      <Box sx={{ pb: 8 }}>
        <Box sx={{ textAlign: 'center', maxWidth: 700, mx: 'auto', mb: 8 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, tracking: '-0.04em' }}>
            {t('meet_committee')}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem', lineHeight: 1.6 }}>
            The dedicated team working tirelessly to ensure a safe, clean, and happy environment for all residents of Saurashtra Residency.
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 10 }}>
          {COMMITTEE.map((member) => (
            <Grid item xs={12} sm={6} lg={3} key={member.id}>
              <Card 
                sx={{ 
                  p: 4, 
                  borderRadius: 10, 
                  textAlign: 'center', 
                  border: '1px solid', 
                  borderColor: 'divider', 
                  boxShadow: 0,
                  transition: 'all 0.5s ease',
                  position: 'relative',
                  overflow: 'visible',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 10,
                    borderColor: 'primary.main'
                  }
                }}
              >
                <Box sx={{ position: 'relative', width: 128, height: 128, mx: 'auto', mb: 3 }}>
                  <Box sx={{ 
                    position: 'absolute', inset: 0, 
                    bgcolor: 'primary.main', borderRadius: 8, 
                    transform: 'rotate(6deg)', opacity: 0.1,
                    transition: 'transform 0.5s ease',
                    '.MuiCard-root:hover &': { transform: 'rotate(12deg)' }
                  }} />
                  <Avatar 
                    src={member.imageUrl} 
                    alt={member.name}
                    sx={{ 
                      width: '100%', height: '100%', 
                      borderRadius: 8, 
                      border: '4px solid', 
                      borderColor: 'background.paper',
                      boxShadow: 6,
                      transition: 'transform 0.5s ease',
                      '.MuiCard-root:hover &': { transform: 'scale(1.1)' }
                    }}
                  />
                </Box>
                
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5 }}>{member.name}</Typography>
                <Typography variant="caption" sx={{ 
                  color: 'primary.main', fontWeight: 900, 
                  textTransform: 'uppercase', letterSpacing: 1.5,
                  display: 'block', mb: 3
                }}>
                  {t(member.position.toLowerCase())}
                </Typography>
                
                <Stack spacing={1.5}>
                  <Button 
                    component="a"
                    href={`tel:${member.phone}`}
                    variant="text"
                    startIcon={<Phone size={16} />}
                    fullWidth
                    sx={{ 
                      borderRadius: 3, bgcolor: 'action.hover', 
                      color: 'text.secondary', fontWeight: 700,
                      fontSize: '0.75rem',
                      '&:hover': { bgcolor: 'primary.light', color: 'primary.main' }
                    }}
                  >
                    {member.phone}
                  </Button>
                  <Button 
                    component="a"
                    href={`mailto:${member.email}`}
                    variant="text"
                    startIcon={<Mail size={16} />}
                    fullWidth
                    sx={{ 
                      borderRadius: 3, bgcolor: 'action.hover', 
                      color: 'text.secondary', fontWeight: 700,
                      fontSize: '0.75rem',
                      '&:hover': { bgcolor: 'primary.light', color: 'primary.main' }
                    }}
                  >
                    Contact Email
                  </Button>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ 
          borderRadius: 12, p: { xs: 4, md: 8 }, 
          bgcolor: 'text.primary', color: 'background.paper',
          position: 'relative', overflow: 'hidden'
        }}>
          <Box sx={{ 
            position: 'absolute', top: 0, left: 0, right: 0, height: 4,
            background: 'linear-gradient(to right, #2563eb, #9333ea, #2563eb)'
          }} />
          
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 4 }}>Contact the Office</Typography>
              <Stack spacing={4}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, display: 'block', mb: 1 }}>
                    Primary Address
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    Main Office, Saurashtra Residency, Pasodara, Surat - 395013
                  </Typography>
                </Box>
                <Grid container spacing={4}>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, display: 'block', mb: 1 }}>
                      Office Hours
                    </Typography>
                    <Typography variant="body1">Mon - Sat: 9 AM - 6 PM</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, display: 'block', mb: 1 }}>
                      Helpline
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.light' }}>+91 261 455 6789</Typography>
                  </Grid>
                </Grid>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 4, borderRadius: 6, bgcolor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'white' }}>Quick Complaint Message</Typography>
                <Stack spacing={2} component="form" onSubmit={(e) => e.preventDefault()}>
                  <TextField 
                    fullWidth 
                    placeholder="Your Name" 
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        color: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        borderRadius: 3,
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                      },
                      '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.4)', opacity: 1 }
                    }}
                  />
                  <TextField 
                    fullWidth 
                    placeholder="Brief your issue..." 
                    multiline 
                    rows={3}
                    variant="outlined"
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        color: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        borderRadius: 3,
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                        '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                      },
                      '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.4)', opacity: 1 }
                    }}
                  />
                  <Button 
                    fullWidth 
                    variant="contained" 
                    size="large"
                    sx={{ 
                      borderRadius: 3, py: 2, 
                      fontWeight: 900, textTransform: 'uppercase', 
                      letterSpacing: 1.5,
                      bgcolor: 'primary.main',
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    Submit Report
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Fade>
  );
};

export default Committee;
