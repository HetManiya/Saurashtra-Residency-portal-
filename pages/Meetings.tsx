import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, Button, IconButton, 
  Avatar, Chip, CircularProgress, Paper, useTheme, 
  Fade, Stack, Divider, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, ListItemAvatar,
  useMediaQuery, Tooltip
} from '@mui/material';
import { 
  CalendarDays, MapPin, Clock, Plus, Users, ChevronRight, Info, CheckCircle, X, BellRing, Calendar, Loader2
} from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';
import { api } from '../services/api';
import { Meeting } from '../types';

const Meetings: React.FC = () => {
  const { t } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    category: 'General' as const
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('sr_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    setLoading(true);
    try {
      const data = await api.getMeetings();
      setMeetings(data);
    } catch (e) {
      // Silently handle error
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newMeeting = await api.scheduleMeeting({
        ...formData,
        createdBy: user?.id || 'unknown'
      });
      
      setMeetings(prev => [newMeeting, ...prev]);
      
      setShowModal(false);
      setFormData({ title: '', date: '', time: '', location: '', description: '', category: 'General' });
    } catch (e) {
      console.error("Schedule error:", e);
      alert("Failed to schedule meeting");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRSVP = async (meetingId: string, currentStatus: string) => {
    if (!user) return;
    try {
      const nextStatus = currentStatus === 'YES' ? 'NO' : 'YES';
      const updatedMeeting = await api.rsvpMeeting(meetingId, nextStatus);
      setMeetings(prev => prev.map(m => m.id === meetingId ? updatedMeeting : m));
    } catch (e) {
      // Silently handle error
    }
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'COMMITTEE';
  const userId = user?.id;

  const isPast = (dateStr: string) => {
    return new Date(dateStr) < new Date(new Date().setHours(0,0,0,0));
  };

  const upcomingMeetings = meetings.filter(m => !isPast(m.date));
  const pastMeetings = meetings.filter(m => isPast(m.date));

  if (loading) {
    return (
      <Box sx={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 2 }}>
          Loading Assemblies...
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
              {t('meetings_title')}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
              Coordinate community gatherings and festive planning
            </Typography>
          </Box>
          {isAdmin && (
            <Button 
              variant="contained" 
              startIcon={<Plus size={18} />}
              onClick={() => setShowModal(true)}
              sx={{ 
                borderRadius: 6, px: 4, py: 1.5, 
                fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem',
                boxShadow: 10,
                '&:active': { transform: 'scale(0.95)' }
              }}
            >
              New Schedule
            </Button>
          )}
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            <Stack spacing={4}>
              {upcomingMeetings.length === 0 ? (
                <Paper sx={{ py: 12, textAlign: 'center', borderRadius: 10, border: '1px solid', borderColor: 'divider', boxShadow: 0 }}>
                  <CalendarDays size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>Clear Calendar</Typography>
                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>No society assemblies are currently scheduled.</Typography>
                </Paper>
              ) : (
                upcomingMeetings.map((meeting: Meeting, index: number) => {
                  const userRsvp = meeting.rsvps?.find((r: any) => r.userId === userId);
                  const isAttending = userRsvp?.status === 'YES';
                  
                  return (
                    <Card 
                      key={meeting.id || index} 
                      sx={{ 
                        p: 4, 
                        borderRadius: 10, 
                        border: '1px solid', 
                        borderColor: 'divider', 
                        boxShadow: 0,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: 6
                        }
                      }}
                    >
                      <Grid container spacing={4}>
                        <Grid item xs={12} md={8}>
                          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                            <Chip 
                              label={meeting.category} 
                              size="small"
                              color={meeting.category === 'Urgent' ? 'error' : 'primary'}
                              variant="outlined"
                              sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', borderRadius: 2 }} 
                            />
                            <Chip 
                              label={new Date(meeting.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} 
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', borderRadius: 2, color: 'text.disabled' }} 
                            />
                          </Stack>
                          
                          <Typography variant="h5" sx={{ fontWeight: 900, mb: 1.5 }}>{meeting.title}</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.6 }}>{meeting.description}</Typography>
                          
                          <Stack direction="row" spacing={4} alignItems="center">
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.disabled' }}>
                              <Clock size={16} color={theme.palette.primary.main} />
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                {new Date(meeting.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.disabled' }}>
                              <MapPin size={16} color={theme.palette.primary.main} />
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>{meeting.location}</Typography>
                            </Stack>
                          </Stack>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <Box sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'center', 
                            alignItems: { xs: 'center', md: 'flex-start' },
                            pl: { md: 4 },
                            borderLeft: { md: '1px solid' },
                            borderColor: 'divider'
                          }}>
                            <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.disabled', mb: 1 }}>
                              {isAdmin ? 'Total RVSPs' : 'Your Attendance'}
                            </Typography>
                            
                            {isAdmin ? (
                              <Box>
                                <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main' }}>
                                  {meeting.rsvps?.filter((r: any) => r.status === 'YES').length || 0}
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 1 }}>
                                  Confimations
                                </Typography>
                              </Box>
                            ) : (
                              <Button 
                                fullWidth 
                                variant={isAttending ? "outlined" : "contained"}
                                color={isAttending ? "success" : "inherit"}
                                onClick={() => handleRSVP(meeting.id, userRsvp?.status || 'NO')}
                                startIcon={isAttending && <CheckCircle size={14} />}
                                sx={{ 
                                  borderRadius: 4, py: 1.5, 
                                  fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem',
                                  bgcolor: isAttending ? 'transparent' : 'text.primary',
                                  color: isAttending ? 'success.main' : 'background.paper',
                                  '&:hover': { bgcolor: isAttending ? 'success.light' : 'primary.main' }
                                }}
                              >
                                {isAttending ? 'Attending' : 'Confirm RSVP'}
                              </Button>
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                    </Card>
                  );
                })
              )}

              {pastMeetings.length > 0 && (
                <Box sx={{ pt: 8 }}>
                  <Divider sx={{ mb: 6 }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.disabled', letterSpacing: 4 }}>
                      Past Assemblies
                    </Typography>
                  </Divider>
                  
                  <Stack spacing={3} sx={{ opacity: 0.6, transition: 'opacity 0.3s ease', '&:hover': { opacity: 1 } }}>
                    {pastMeetings.map((meeting: Meeting, index: number) => (
                      <Paper key={meeting.id || index} sx={{ p: 4, borderRadius: 8, border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
                        <Grid container spacing={4}>
                          <Grid item xs={12} md={9}>
                            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                              <Chip label="Concluded" size="small" sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', borderRadius: 1.5 }} />
                              <Chip label={new Date(meeting.date).toLocaleDateString()} size="small" sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', borderRadius: 1.5 }} />
                            </Stack>
                            <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>{meeting.title}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>{meeting.description}</Typography>
                            <Stack direction="row" spacing={3}>
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.disabled' }}>
                                <Clock size={14} />
                                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                  {new Date(meeting.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                              </Stack>
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.disabled' }}>
                                <MapPin size={14} />
                                <Typography variant="caption" sx={{ fontWeight: 700 }}>{meeting.location}</Typography>
                              </Stack>
                            </Stack>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderLeft: { md: '1px solid' }, borderColor: 'divider' }}>
                              <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.disabled' }}>
                                {meeting.rsvps?.filter((r: any) => r.status === 'YES').length || 0}
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', fontSize: '0.55rem' }}>Attended</Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 5, borderRadius: 12, bgcolor: 'primary.main', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: 10 }}>
              <Box sx={{ position: 'absolute', bottom: -32, right: -32, width: 128, height: 128, bgcolor: 'white', opacity: 0.1, borderRadius: '50%', filter: 'blur(32px)' }} />
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: 3, mb: 3 }}>
                  <BellRing size={24} />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>Stay Informed</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, lineHeight: 1.6 }}>
                  All community meetings are broadcasted via WhatsApp and Email to ensure maximum participation.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Schedule Meeting Modal */}
        <Dialog 
          open={showModal} 
          onClose={() => setShowModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 10, p: 0, overflow: 'hidden' } }}
        >
          <DialogTitle sx={{ p: 4, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, tracking: '-0.04em' }}>New Assembly</Typography>
            <IconButton onClick={() => setShowModal(false)}>
              <X size={28} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Stack spacing={3} component="form" onSubmit={handleSchedule} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', ml: 1, mb: 1, display: 'block' }}>Meeting Title</Typography>
                <TextField 
                  fullWidth 
                  placeholder="e.g. Navratri Event Planning" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  InputProps={{ sx: { borderRadius: 6, bgcolor: 'action.hover' } }}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', ml: 1, mb: 1, display: 'block' }}>Date</Typography>
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
                  <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', ml: 1, mb: 1, display: 'block' }}>Time</Typography>
                  <TextField 
                    fullWidth 
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    InputProps={{ sx: { borderRadius: 6, bgcolor: 'action.hover' } }}
                  />
                </Grid>
              </Grid>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', ml: 1, mb: 1, display: 'block' }}>Location</Typography>
                <TextField 
                  fullWidth 
                  placeholder="Club House / Main Garden" 
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  InputProps={{ sx: { borderRadius: 6, bgcolor: 'action.hover' } }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', ml: 1, mb: 1, display: 'block' }}>Agenda Description</Typography>
                <TextField 
                  fullWidth 
                  multiline
                  rows={3}
                  placeholder="Briefly describe the purpose..."
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  InputProps={{ sx: { borderRadius: 6, bgcolor: 'action.hover' } }}
                />
              </Box>

              <Button 
                fullWidth 
                variant="contained" 
                size="large"
                disabled={submitting}
                type="submit"
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Calendar size={18} />}
                sx={{ 
                  borderRadius: 8, py: 2, 
                  fontWeight: 900, textTransform: 'uppercase', 
                  letterSpacing: 1.5,
                  boxShadow: 10,
                  '&:active': { transform: 'scale(0.95)' }
                }}
              >
                {submitting ? 'Scheduling...' : 'Broadcast to Residents'}
              </Button>
            </Stack>
          </DialogContent>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default Meetings;
