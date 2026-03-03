import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, Button, IconButton, 
  Avatar, Chip, CircularProgress, Paper, useTheme, 
  Fade, Stack, Divider, TextField, InputAdornment,
  Tooltip, Link, useMediaQuery
} from '@mui/material';
import { MapPin, Navigation, Compass, ShieldCheck, Sparkles, Loader2, DoorOpen, TreePine, LayoutGrid, Building2, Info, Smartphone, Mail, Globe, Star, Users, ArrowUpRight } from 'lucide-react';
import { SOCIETY_INFO, BUILDER_INFO, BUILDINGS } from '../constants';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Location: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [localityInfo, setLocalityInfo] = useState<{ text: string; sources: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [hoveredWing, setHoveredWing] = useState<string | null>(null);

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    setLoading(true);
    try {
      const info = await api.getLocalityInfo(`Saurashtra Residency Pasodara Surat 395013`);
      setLocalityInfo(info);
    } catch (e) {
      // Silently handle error
    }
    setLoading(false);
  };

  const leftColWings = ['A-1', 'A-3', 'A-5', 'A-7', 'A-9', 'A-11', 'A-13', 'A-15', 'A-17', 'A-19', 'A-21', 'A-23'];
  const rightColWings = ['A-2', 'A-4', 'A-6', 'A-8', 'A-10', 'A-12', 'A-14', 'A-16', 'A-18', 'A-20', 'A-22', 'A-24'];

  const renderWing = (name: string) => {
    const wing = BUILDINGS.find(b => b.name === name);
    if (!wing) return null;

    const is1BHK = wing.type === '1BHK';

    return (
      <Tooltip 
        key={wing.id} 
        title={`${wing.type} • 20 Units`} 
        arrow 
        placement="top"
        open={hoveredWing === wing.name}
      >
        <Button
          onMouseEnter={() => setHoveredWing(wing.name)}
          onMouseLeave={() => setHoveredWing(null)}
          onClick={() => navigate('/buildings')}
          sx={{
            width: '100%',
            aspectRatio: '4/3',
            borderRadius: 6,
            border: '2px solid',
            borderColor: is1BHK ? 'blue.100' : 'indigo.100',
            bgcolor: is1BHK ? 'blue.50' : 'indigo.50',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            transition: 'all 0.4s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              zIndex: 10,
              boxShadow: 10,
              borderColor: is1BHK ? 'blue.400' : 'indigo.400',
              bgcolor: is1BHK ? 'blue.100' : 'indigo.100'
            }
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 900, color: is1BHK ? 'blue.600' : 'indigo.600' }}>
            {wing.name}
          </Typography>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: is1BHK ? 'blue.400' : 'indigo.400' }} />
        </Button>
      </Tooltip>
    );
  };

  return (
    <Fade in={true}>
      <Box sx={{ pb: 8 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { md: 'flex-end' }, 
          gap: 3, 
          mb: 6,
          pb: 4,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ bgcolor: 'primary.light', px: 2, py: 0.5, borderRadius: 10, width: 'fit-content', mb: 2 }}>
              <Compass size={14} color={theme.palette.primary.main} />
              <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5, color: 'primary.main' }}>
                Residency Explorer
              </Typography>
            </Stack>
            <Typography variant="h3" sx={{ fontWeight: 900, tracking: '-0.04em' }}>
              Residency <Box component="span" sx={{ color: 'primary.main' }}>Site Plan</Box>
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1, color: 'text.secondary' }}>
              <MapPin size={18} color={theme.palette.primary.main} />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{SOCIETY_INFO.location}</Typography>
            </Stack>
          </Box>
          <Button 
            variant="contained" 
            color="inherit"
            startIcon={<Navigation size={18} />}
            href={SOCIETY_INFO.googleMapsUrl}
            target="_blank"
            sx={{ 
              borderRadius: 8, px: 4, py: 2, 
              fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem',
              bgcolor: 'text.primary', color: 'background.paper',
              boxShadow: 10,
              '&:hover': { bgcolor: 'black' }
            }}
          >
            View Actual Satellite Map
          </Button>
        </Box>

        <Grid container spacing={6}>
          <Grid item xs={12} lg={8}>
            <Stack spacing={6}>
              <Paper sx={{ p: { xs: 4, md: 6 }, borderRadius: 12, border: '1px solid', borderColor: 'divider', boxShadow: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 6 }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', borderRadius: 4 }}>
                    <LayoutGrid size={28} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>Interactive Plot Layout</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.disabled', letterSpacing: 2 }}>
                      Digital Twin of Saurashtra Residency
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ 
                  position: 'relative', 
                  bgcolor: 'action.hover', 
                  p: { xs: 4, md: 6 }, 
                  borderRadius: 12, 
                  border: '2px dashed', 
                  borderColor: 'divider',
                  minHeight: 800
                }}>
                  {/* Gates */}
                  <Paper sx={{ 
                    position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)',
                    px: 4, py: 1.5, borderRadius: 4, bgcolor: 'text.primary', color: 'background.paper',
                    display: 'flex', alignItems: 'center', gap: 2, zIndex: 20, boxShadow: 10
                  }}>
                    <DoorOpen size={18} color={theme.palette.success.main} />
                    <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>Main Gate 1 (Pasodara Road)</Typography>
                  </Paper>

                  <Paper sx={{ 
                    position: 'absolute', bottom: 0, left: '50%', transform: 'translate(-50%, 50%)',
                    px: 4, py: 1.5, borderRadius: 4, bgcolor: 'text.primary', color: 'background.paper',
                    display: 'flex', alignItems: 'center', gap: 2, zIndex: 20, boxShadow: 10
                  }}>
                    <DoorOpen size={18} color={theme.palette.primary.main} />
                    <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>Service Gate 2 (Canal Road)</Typography>
                  </Paper>

                  {/* Central Spine */}
                  <Box sx={{ 
                    position: 'absolute', inset: '48px 0', left: '50%', transform: 'translateX(-50%)',
                    width: { xs: 120, md: 180 }, display: 'flex', flexDirection: 'column', 
                    alignItems: 'center', justifyContent: 'space-between', py: 10, zIndex: 10, pointerEvents: 'none'
                  }}>
                    <Paper sx={{ 
                      pointerEvents: 'auto', width: '100%', height: 180, borderRadius: 10,
                      bgcolor: 'success.light', border: '2px solid', borderColor: 'success.main', opacity: 0.2,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.3s ease', '&:hover': { opacity: 0.4, transform: 'scale(1.05)' }
                    }}>
                      <TreePine size={32} color={theme.palette.success.main} />
                      <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'success.main', mt: 1 }}>Central Garden</Typography>
                    </Paper>

                    <Box sx={{ height: 80, width: 4, bgcolor: 'divider', borderRadius: 2 }} />

                    <Paper sx={{ 
                      pointerEvents: 'auto', width: '100%', height: 180, borderRadius: 10,
                      bgcolor: 'success.light', border: '2px solid', borderColor: 'success.main', opacity: 0.2,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.3s ease', '&:hover': { opacity: 0.4, transform: 'scale(1.05)' }
                    }}>
                      <TreePine size={32} color={theme.palette.success.main} />
                      <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'success.main', mt: 1 }}>Back Garden</Typography>
                    </Paper>
                  </Box>

                  {/* Wings Grid */}
                  <Grid container spacing={isMobile ? 10 : 24} sx={{ position: 'relative', zIndex: 0 }}>
                    <Grid item xs={6}>
                      <Stack spacing={3}>
                        {leftColWings.map(name => renderWing(name))}
                      </Stack>
                    </Grid>
                    <Grid item xs={6}>
                      <Stack spacing={3}>
                        {rightColWings.map(name => renderWing(name))}
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>

                <Grid container spacing={3} sx={{ mt: 6 }}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 4, borderRadius: 8, bgcolor: 'primary.light', border: '1px solid', borderColor: 'primary.main', opacity: 0.8, display: 'flex', gap: 3 }}>
                      <Avatar sx={{ bgcolor: 'background.paper', color: 'primary.main', borderRadius: 3 }}>
                        <Star size={20} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'primary.main', textTransform: 'uppercase' }}>Elite Infrastructure</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main', lineHeight: 1.6 }}>
                          Saurashtra Residency features a planned layout with 40-feet internal RCC roads and separate underground water tanks for every 4 wings.
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 4, borderRadius: 8, bgcolor: 'success.light', border: '1px solid', borderColor: 'success.main', opacity: 0.8, display: 'flex', gap: 3 }}>
                      <Avatar sx={{ bgcolor: 'background.paper', color: 'success.main', borderRadius: 3 }}>
                        <TreePine size={20} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'success.main', textTransform: 'uppercase' }}>Eco-Friendly Zones</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main', lineHeight: 1.6 }}>
                          Two massive gardens (Central & Back Garden) provide 12,000+ sq.ft of recreational green cover for all 480 families.
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 5, borderRadius: 12, border: '1px solid', borderColor: 'divider', boxShadow: 0 }}>
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Sparkles size={28} color={theme.palette.primary.main} /> Neighborhood Intelligence
                </Typography>
                {loading ? (
                  <Box sx={{ py: 8, textAlign: 'center' }}>
                    <CircularProgress size={40} sx={{ mb: 2 }} />
                    <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.disabled', letterSpacing: 2 }}>Grounding Search Results...</Typography>
                  </Box>
                ) : (
                  <Stack spacing={4}>
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, fontStyle: 'italic', fontSize: '1.1rem' }}>
                      "{localityInfo?.text || "Analyzing Pasodara neighborhood data..."}"
                    </Typography>
                    {localityInfo?.sources && localityInfo.sources.length > 0 && (
                      <Box sx={{ pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.disabled', letterSpacing: 2, display: 'block', mb: 3 }}>Verification Sources</Typography>
                        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                          {localityInfo.sources.map((s: any, i: number) => (
                            <Button 
                              key={i} 
                              variant="outlined" 
                              size="small"
                              href={s.web?.uri}
                              target="_blank"
                              sx={{ borderRadius: 4, px: 2, py: 1, fontWeight: 900, textTransform: 'none', fontSize: '0.65rem' }}
                            >
                              {s.web?.title || `Ref ${i + 1}`}
                            </Button>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                )}
              </Paper>
            </Stack>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Stack spacing={4}>
              <Paper sx={{ 
                p: 5, borderRadius: 12, 
                bgcolor: 'text.primary', color: 'background.paper',
                position: 'relative', overflow: 'hidden',
                boxShadow: 10
              }}>
                <Box sx={{ 
                  position: 'absolute', top: -64, right: -64, 
                  width: 256, height: 256, 
                  bgcolor: 'primary.main', borderRadius: '50%', 
                  opacity: 0.1, filter: 'blur(40px)' 
                }} />
                
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 4 }}>
                    <Avatar sx={{ width: 80, height: 80, borderRadius: 6, bgcolor: 'white', p: 1 }}>
                      <img src={BUILDER_INFO.logo} alt="Builder Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 900 }}>{BUILDER_INFO.name}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                        <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'primary.light', letterSpacing: 1 }}>
                          Elite Developer • Est {BUILDER_INFO.founded}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>

                  <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic', lineHeight: 1.6, mb: 4 }}>
                    "{BUILDER_INFO.vision}"
                  </Typography>

                  <Box sx={{ pt: 4, borderTop: '1px solid rgba(255,255,255,0.1)', mb: 4 }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.disabled', letterSpacing: 2, display: 'block', mb: 2 }}>Notable Portfolio</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {BUILDER_INFO.projects.map((p, idx) => (
                        <Chip key={idx} label={p} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'text.disabled', fontWeight: 700, borderRadius: 2 }} />
                      ))}
                    </Stack>
                  </Box>

                  <Stack spacing={2}>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="inherit"
                      startIcon={<Smartphone size={14} />}
                      href={`tel:${BUILDER_INFO.phone}`}
                      sx={{ 
                        borderRadius: 4, py: 1.5, 
                        fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem',
                        bgcolor: 'background.paper', color: 'text.primary',
                        '&:hover': { bgcolor: 'primary.light', color: 'primary.main' }
                      }}
                    >
                      Call Developer
                    </Button>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      color="inherit"
                      startIcon={<Mail size={14} />}
                      href={`mailto:${BUILDER_INFO.email}`}
                      sx={{ 
                        borderRadius: 4, py: 1.5, 
                        fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem',
                        borderColor: 'rgba(255,255,255,0.1)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                      }}
                    >
                      Email Office
                    </Button>
                  </Stack>
                </Box>
              </Paper>

              <Paper sx={{ p: 5, borderRadius: 12, border: '1px solid', borderColor: 'divider', boxShadow: 0 }}>
                <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'primary.main', letterSpacing: 2, display: 'block', mb: 4 }}>Spatial Legend</Typography>
                <Stack spacing={4}>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Avatar sx={{ width: 40, height: 40, borderRadius: 3, bgcolor: 'blue.50', color: 'blue.600' }}>
                      <LayoutGrid size={20} />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Blue Block</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase' }}>1BHK Units (Wings A-1 to A-6)</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Avatar sx={{ width: 40, height: 40, borderRadius: 3, bgcolor: 'indigo.50', color: 'indigo.600' }}>
                      <LayoutGrid size={20} />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Indigo Block</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase' }}>2BHK Units (Wings A-7 to A-24)</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Avatar sx={{ width: 40, height: 40, borderRadius: 3, bgcolor: 'success.light', color: 'success.main' }}>
                      <TreePine size={20} />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Green Zone</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase' }}>Central Recreational Parks</Typography>
                    </Box>
                  </Stack>
                </Stack>
                <Divider sx={{ my: 4 }} />
                <Button 
                  fullWidth 
                  variant="contained" 
                  color="inherit"
                  onClick={() => navigate('/buildings')}
                  endIcon={<ArrowUpRight size={14} />}
                  sx={{ 
                    borderRadius: 4, py: 1.5, 
                    fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem',
                    bgcolor: 'action.hover', color: 'text.primary',
                    '&:hover': { bgcolor: 'primary.main', color: 'white' }
                  }}
                >
                  Explore Individual Wings
                </Button>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default Location;
