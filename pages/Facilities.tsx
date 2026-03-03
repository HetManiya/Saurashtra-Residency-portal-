import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Typography, Grid, Card, Button, IconButton, 
  Avatar, Chip, CircularProgress, Paper, useTheme, 
  Fade, Stack, Divider, TextField, InputAdornment,
  Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions,
  useMediaQuery, CardMedia, CardContent, CardActions
} from '@mui/material';
import { 
  Sofa, TreePine, Coffee, Star, MapPin, Calendar, Clock, ChevronRight, Users, 
  X, ShieldCheck, User, Info, CheckCircle2, Ticket, PartyPopper, Clapperboard, CalendarDays,
  History, Settings2, Trash2, Loader2, AlertCircle, Sparkles, Building, Plus
} from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';
import { SOCIETY_INFO } from '../constants';
import { AmenityBooking } from '../types';
import { api } from '../services/api';

const Facilities: React.FC = () => {
  const { t } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [amenities, setAmenities] = useState<any[]>([]);
  const [selectedAmenity, setSelectedAmenity] = useState<any | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    purpose: '',
    date: '',
    startTime: '10:00 AM',
    endTime: '02:00 PM',
    duration: 2,
    amenityId: '',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('sr_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsData, amenitiesData] = await Promise.all([
        api.getAmenityBookings(),
        api.getAmenities()
      ]);
      setAllBookings(bookingsData);
      setAmenities(amenitiesData);
    } catch (e) {
      // Silently handle error
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'COMMITTEE';

  const myBookings = useMemo(() => {
    if (!user) return [];
    return allBookings.filter(b => b.userId === user.id || b.flatId === user.flatId);
  }, [allBookings, user]);

  const pendingBookings = useMemo(() => {
    return allBookings.filter(b => b.status === 'PENDING');
  }, [allBookings]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmenity || !user) return;

    try {
      const newBooking = await api.createAmenityBooking({
        amenityId: formData.amenityId || selectedAmenity._id,
        purpose: formData.purpose,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        duration: formData.duration,
      });

      setAllBookings(prev => [newBooking, ...prev]);
      
      setShowBookingForm(false);
      setFormData({ purpose: '', date: '', startTime: '10:00 AM', endTime: '02:00 PM', duration: 2, amenityId: '' });
      alert("Booking request submitted successfully! Awaiting committee approval.");
    } catch (e) {
      alert("Failed to submit booking.");
    }
  };

  const handleStatusUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.updateAmenityBookingStatus(id, status);
      await loadData();
    } catch (e) {
      alert("Failed to update status.");
    }
  };

  const getFacilityIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('club')) return <PartyPopper size={24} />;
    if (n.includes('pool')) return <TreePine size={24} />;
    if (n.includes('theatre') || n.includes('cinema')) return <Clapperboard size={24} />;
    if (n.includes('gym')) return <Building size={24} />;
    return <Sofa size={24} />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  if (loading && amenities.length === 0) {
    return (
      <Box sx={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 2 }}>
          Syncing Amenities...
        </Typography>
      </Box>
    );
  }

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
            <Typography variant="h4" sx={{ fontWeight: 900, tracking: '-0.04em' }}>
              Community <Box component="span" sx={{ color: 'primary.main' }}>Amenities</Box>
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
              Book premium society facilities and view public events
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Tabs 
              value={activeTab} 
              onChange={(_, val) => setActiveTab(val)}
              sx={{ 
                bgcolor: 'action.hover', 
                borderRadius: 4, 
                p: 0.5,
                minHeight: 'auto',
                '& .MuiTabs-indicator': { display: 'none' }
              }}
            >
              <Tab label="Explore" sx={{ borderRadius: 3, px: 3, py: 1, fontWeight: 900, fontSize: '0.65rem', textTransform: 'uppercase', minHeight: 'auto', '&.Mui-selected': { bgcolor: 'background.paper', color: 'primary.main', boxShadow: 1 } }} />
              <Tab label="My Requests" sx={{ borderRadius: 3, px: 3, py: 1, fontWeight: 900, fontSize: '0.65rem', textTransform: 'uppercase', minHeight: 'auto', '&.Mui-selected': { bgcolor: 'background.paper', color: 'primary.main', boxShadow: 1 } }} />
              {isAdmin && (
                <Tab label={`Approvals (${pendingBookings.length})`} sx={{ borderRadius: 3, px: 3, py: 1, fontWeight: 900, fontSize: '0.65rem', textTransform: 'uppercase', minHeight: 'auto', '&.Mui-selected': { bgcolor: 'background.paper', color: 'warning.main', boxShadow: 1 } }} />
              )}
            </Tabs>
            {!isAdmin && (
              <Button 
                variant="contained" 
                color="success"
                startIcon={<Plus size={18} />}
                onClick={() => {
                  setSelectedAmenity(amenities[0] || null);
                  setShowBookingForm(true);
                }}
                sx={{ 
                  borderRadius: 6, px: 4, py: 1.5, 
                  fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem',
                  boxShadow: 10
                }}
              >
                Quick Book
              </Button>
            )}
          </Stack>
        </Box>

        {activeTab === 0 && (
          <Grid container spacing={4}>
            {amenities.map((item: any, index: number) => (
              <Grid item xs={12} sm={6} lg={4} key={item.id || item._id || index}>
                <Card 
                  sx={{ 
                    borderRadius: 10, 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    boxShadow: 0,
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-8px)', boxShadow: 6 }
                  }}
                >
                  <Box sx={{ position: 'relative', height: 240 }}>
                    <CardMedia
                      component="img"
                      image={item.image || `https://picsum.photos/seed/${item.name}/800/600`}
                      alt={item.name}
                      sx={{ height: '100%', transition: 'transform 0.7s ease', '.MuiCard-root:hover &': { transform: 'scale(1.1)' } }}
                    />
                    <Box sx={{ 
                      position: 'absolute', inset: 0, 
                      background: 'linear-gradient(to top, rgba(15,23,42,0.8), transparent)' 
                    }} />
                    <Box sx={{ position: 'absolute', bottom: 24, left: 24, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 48, height: 48, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
                        {getFacilityIcon(item.name)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 900, lineHeight: 1.2 }}>{item.name}</Typography>
                        <Typography variant="caption" sx={{ color: 'primary.light', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>{item.status}</Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <CardContent sx={{ p: 4, flexGrow: 1 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.6 }}>
                      {item.description}
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, borderRadius: 4, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>Capacity</Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{item.capacity} guests</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, borderRadius: 4, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>Rate</Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'success.main' }}>₹{item.hourlyRate}/hr</Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions sx={{ p: 4, pt: 0 }}>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      onClick={() => setSelectedAmenity(item)}
                      endIcon={<ChevronRight size={18} />}
                      sx={{ borderRadius: 4, py: 1.5, fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem', boxShadow: 4 }}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {activeTab === 1 && (
          <Stack spacing={3}>
            {myBookings.length === 0 ? (
              <Paper sx={{ py: 12, textAlign: 'center', borderRadius: 10, border: '1px solid', borderColor: 'divider', boxShadow: 0 }}>
                <Ticket size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
                <Typography variant="h6" sx={{ fontWeight: 900 }}>No Bookings Found</Typography>
                <Typography variant="body2" sx={{ color: 'text.disabled' }}>You haven't requested any facilities yet.</Typography>
              </Paper>
            ) : (
              myBookings.map((booking, index) => (
                <Paper key={booking.id || booking._id || index} sx={{ p: 4, borderRadius: 8, border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Avatar sx={{ width: 64, height: 64, borderRadius: 4, bgcolor: 'primary.light', color: 'primary.main' }}>
                      {getFacilityIcon(booking.amenityId?.name || '')}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>{booking.purpose}</Typography>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ color: 'text.disabled', mt: 0.5 }}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Calendar size={14} />
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>{new Date(booking.date).toLocaleDateString()}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Clock size={14} />
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>{booking.startTime} - {booking.endTime}</Typography>
                        </Stack>
                      </Stack>
                    </Box>
                  </Stack>
                  <Chip 
                    label={booking.status} 
                    color={getStatusColor(booking.status) as any}
                    variant="outlined"
                    sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem', borderRadius: 2, px: 2 }} 
                  />
                </Paper>
              ))
            )}
          </Stack>
        )}

        {activeTab === 2 && (
          <Stack spacing={3}>
            {pendingBookings.length === 0 ? (
              <Paper sx={{ py: 12, textAlign: 'center', borderRadius: 10, border: '1px solid', borderColor: 'divider', boxShadow: 0 }}>
                <BadgeCheck size={48} className="mx-auto text-emerald-200 mb-4" />
                <Typography variant="h6" sx={{ fontWeight: 900 }}>Queue Clear</Typography>
                <Typography variant="body2" sx={{ color: 'text.disabled' }}>All booking requests have been processed.</Typography>
              </Paper>
            ) : (
              pendingBookings.map((booking, index) => (
                <Paper key={booking.id || booking._id || index} sx={{ p: 5, borderRadius: 10, border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 4, boxShadow: 6 }}>
                  <Stack direction="row" spacing={4} alignItems="center">
                    <Avatar sx={{ width: 80, height: 80, borderRadius: 6, bgcolor: 'warning.light', color: 'warning.main' }}>
                      {getFacilityIcon(booking.amenityId?.name || '')}
                    </Avatar>
                    <Box>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>{booking.purpose}</Typography>
                        <Chip label={`Ref: ${booking._id.slice(-6)}`} size="small" sx={{ fontWeight: 900, fontSize: '0.6rem', borderRadius: 1.5 }} />
                      </Stack>
                      <Grid container spacing={2}>
                        <Grid item>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
                            <User size={14} color={theme.palette.primary.main} />
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>{booking.userId?.name || 'User'} (Unit {booking.flatId})</Typography>
                          </Stack>
                        </Grid>
                        <Grid item>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
                            <Calendar size={14} color={theme.palette.primary.main} />
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>{new Date(booking.date).toLocaleDateString()}</Typography>
                          </Stack>
                        </Grid>
                        <Grid item>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
                            <Clock size={14} color={theme.palette.primary.main} />
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>{booking.startTime} - {booking.endTime}</Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
                    <Button 
                      fullWidth={isMobile}
                      variant="outlined" 
                      color="error"
                      onClick={() => handleStatusUpdate(booking._id, 'REJECTED')}
                      sx={{ borderRadius: 4, px: 4, py: 1.5, fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem' }}
                    >
                      Reject
                    </Button>
                    <Button 
                      fullWidth={isMobile}
                      variant="contained" 
                      color="success"
                      onClick={() => handleStatusUpdate(booking._id, 'APPROVED')}
                      sx={{ borderRadius: 4, px: 4, py: 1.5, fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem', boxShadow: 4 }}
                    >
                      Approve
                    </Button>
                  </Stack>
                </Paper>
              ))
            )}
          </Stack>
        )}

        {/* Amenity Detail Modal */}
        <Dialog 
          open={!!selectedAmenity} 
          onClose={() => setSelectedAmenity(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 10, p: 0, overflow: 'hidden' } }}
        >
          <DialogTitle sx={{ p: 4, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" spacing={3} alignItems="center">
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', borderRadius: 4, boxShadow: 6 }}>
                {selectedAmenity && getFacilityIcon(selectedAmenity.name)}
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>{selectedAmenity?.name}</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <MapPin size={12} color={theme.palette.primary.main} />
                  <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', textTransform: 'uppercase' }}>{selectedAmenity?.status}</Typography>
                </Stack>
              </Box>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              {!isAdmin && (
                <Button 
                  variant="contained" 
                  onClick={() => setShowBookingForm(true)}
                  sx={{ borderRadius: 4, px: 3, py: 1, fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem' }}
                >
                  Request Slot
                </Button>
              )}
              <IconButton onClick={() => setSelectedAmenity(null)}>
                <X size={28} />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ p: 4, bgcolor: 'action.hover' }}>
            <Stack spacing={6}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarDays size={16} /> Availability Calendar
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <IconButton onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
                      <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
                    </IconButton>
                    <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase' }}>
                      {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </Typography>
                    <IconButton onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
                      <ChevronRight size={16} />
                    </IconButton>
                  </Stack>
                </Box>

                <Paper sx={{ p: 3, borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
                  <Grid container spacing={1}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <Grid item xs={12/7} key={d} sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', fontSize: '0.6rem' }}>{d}</Typography>
                      </Grid>
                    ))}
                    {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, i) => (
                      <Grid item xs={12/7} key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
                      const isBooked = allBookings.some(b => b.amenityId?._id === selectedAmenity?._id && b.status === 'APPROVED' && b.date.startsWith(dateStr));
                      return (
                        <Grid item xs={12/7} key={day}>
                          <Paper sx={{ 
                            aspectRatio: '1/1', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            borderRadius: 3,
                            border: '2px solid',
                            transition: 'all 0.2s ease',
                            bgcolor: isBooked ? 'error.light' : 'background.paper',
                            borderColor: isBooked ? 'error.main' : 'divider',
                            opacity: isBooked ? 0.8 : 1
                          }}>
                            <Typography variant="caption" sx={{ fontWeight: 900, color: isBooked ? 'error.main' : 'text.primary' }}>{day}</Typography>
                            {isBooked && <Box sx={{ width: 4, height: 4, bgcolor: 'error.main', borderRadius: '50%', mt: 0.5 }} />}
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Paper>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 2, display: 'block', mb: 3 }}>
                  Confirmed Bookings
                </Typography>
                <Grid container spacing={3}>
                  {allBookings.filter(b => b.amenityId?._id === selectedAmenity?._id && b.status === 'APPROVED').length > 0 ? (
                    allBookings.filter(b => b.amenityId?._id === selectedAmenity?._id && b.status === 'APPROVED').map((booking: any, index: number) => (
                      <Grid item xs={12} sm={6} key={booking.id || booking._id || index}>
                        <Paper sx={{ p: 3, borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>{booking.purpose}</Typography>
                          <Stack direction="row" spacing={2}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.disabled' }}>
                              <Calendar size={14} color={theme.palette.primary.main} />
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>{new Date(booking.date).toLocaleDateString()}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.disabled' }}>
                              <Clock size={14} color={theme.palette.primary.main} />
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>{booking.startTime}</Typography>
                            </Stack>
                          </Stack>
                        </Paper>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center', fontStyle: 'italic' }}>No confirmed bookings for this facility.</Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>

              <Paper sx={{ p: 4, borderRadius: 6, bgcolor: 'primary.light', border: '1px solid', borderColor: 'primary.main', opacity: 0.8 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'primary.main', mb: 1 }}>Usage Policies</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main', lineHeight: 1.6 }}>
                  Bookings must be made at least 48 hours in advance. Cancellation required 24 hours prior for a full deposit refund. 
                  Please ensure the area is cleaned after the event.
                </Typography>
              </Paper>
            </Stack>
          </DialogContent>
        </Dialog>

        {/* Booking Form Overlay */}
        <Dialog 
          open={showBookingForm} 
          onClose={() => setShowBookingForm(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 10, p: 0, overflow: 'hidden' } }}
        >
          <DialogTitle sx={{ p: 4, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, tracking: '-0.04em' }}>Reserve {selectedAmenity?.name}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', textTransform: 'uppercase' }}>Fill event details to request a slot</Typography>
            </Box>
            <IconButton onClick={() => setShowBookingForm(false)}>
              <X size={24} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Stack spacing={3} component="form" onSubmit={handleBookingSubmit} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', ml: 1, mb: 1, display: 'block' }}>Select Facility</Typography>
                <TextField
                  select
                  fullWidth
                  value={formData.amenityId || selectedAmenity?._id || ''}
                  onChange={(e) => setFormData({...formData, amenityId: e.target.value})}
                  required
                  InputProps={{ sx: { borderRadius: 6, bgcolor: 'action.hover' } }}
                >
                  <MenuItem value="" disabled>Choose an amenity</MenuItem>
                  {amenities.map(a => (
                    <MenuItem key={a._id} value={a._id}>{a.name}</MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', ml: 1, mb: 1, display: 'block' }}>Purpose of Booking</Typography>
                <TextField 
                  fullWidth 
                  placeholder="e.g. Birthday Celebration" 
                  required
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  InputProps={{ 
                    startAdornment: (
                      <InputAdornment position="start">
                        <Star size={18} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 6, bgcolor: 'action.hover' } 
                  }}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', ml: 1, mb: 1, display: 'block' }}>Event Date</Typography>
                  <TextField 
                    fullWidth 
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    InputProps={{ sx: { borderRadius: 6, bgcolor: 'action.hover' } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', ml: 1, mb: 1, display: 'block' }}>Duration (Hours)</Typography>
                  <TextField 
                    fullWidth 
                    type="number"
                    required
                    inputProps={{ min: 1, max: 24 }}
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                    InputProps={{ sx: { borderRadius: 6, bgcolor: 'action.hover' } }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', ml: 1, mb: 1, display: 'block' }}>Start Time</Typography>
                  <TextField 
                    fullWidth 
                    placeholder="10:00 AM"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    InputProps={{ sx: { borderRadius: 6, bgcolor: 'action.hover' } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', ml: 1, mb: 1, display: 'block' }}>End Time</Typography>
                  <TextField 
                    fullWidth 
                    placeholder="02:00 PM"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    InputProps={{ sx: { borderRadius: 6, bgcolor: 'action.hover' } }}
                  />
                </Grid>
              </Grid>

              <Button 
                fullWidth 
                variant="contained" 
                size="large"
                type="submit"
                startIcon={<CheckCircle2 size={18} />}
                sx={{ 
                  borderRadius: 8, py: 2, 
                  fontWeight: 900, textTransform: 'uppercase', 
                  letterSpacing: 1.5,
                  boxShadow: 10,
                  '&:active': { transform: 'scale(0.95)' }
                }}
              >
                Send Booking Request
              </Button>
            </Stack>
          </DialogContent>
        </Dialog>
      </Box>
    </Fade>
  );
};

const BadgeCheck = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" /><path d="m9 12 2 2 4-4" />
  </svg>
);

export default Facilities;
