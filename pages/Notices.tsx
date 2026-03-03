import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Typography, Grid, Card, Button, IconButton, 
  Avatar, Chip, CircularProgress, Paper, useTheme, 
  Fade, Stack, Divider, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions,
  useMediaQuery, Tooltip
} from '@mui/material';
import { Bell, Calendar, ChevronRight, Pin, Loader2, Plus, X, AlertTriangle, CheckCircle, Clock, Smartphone, Mail, Globe, Volume2, Waves, BellRing } from 'lucide-react';
import { api } from '../services/api';

const Notices: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General' as 'Urgent' | 'General' | 'Event',
    broadcastType: 'NONE' as 'NONE' | 'WHATSAPP' | 'EMAIL' | 'BOTH'
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('sr_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    loadNotices();
  }, []);

  const loadNotices = async (retries = 0) => {
    if (retries === 0) setLoading(true);
    try {
      const data = await api.getNotices();
      setNotices(data);
      setLoading(false);
    } catch (e: any) {
      if (e.message === 'SERVER_STARTING' && retries < 5) {
        setTimeout(() => loadNotices(retries + 1), 2000);
        return;
      }
      setLoading(false);
    }
  };

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBroadcasting(true);
    
    try {
      const newNotice = await api.postNotice(formData);
      
      setNotices(prev => [newNotice, ...prev]);
      
      if (formData.broadcastType !== 'NONE') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await api.broadcastNotification(formData.broadcastType as any, 'ALL_RESIDENTS', formData.title);
      }
      
      setShowAddModal(false);
      setFormData({ title: '', content: '', category: 'General', broadcastType: 'NONE' });
    } catch (e) {
      alert("Failed to post notice");
    } finally {
      setIsBroadcasting(false);
    }
  };

  const urgentNotices = useMemo(() => 
    notices.filter(n => n.category === 'Urgent').slice(0, 3), 
  [notices]);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'COMMITTEE';

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  if (loading && notices.length === 0) {
    return (
      <Box sx={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 2 }}>
          Syncing Announcements...
        </Typography>
      </Box>
    );
  }

  return (
    <Fade in={true}>
      <Box sx={{ maxWidth: 900, mx: 'auto', pb: 8 }}>
        {/* Dynamic Live Ticker */}
        {urgentNotices.length > 0 && (
          <Paper sx={{ 
            mb: 4, 
            borderRadius: 8, 
            overflow: 'hidden', 
            border: '1px solid', 
            borderColor: 'error.light',
            bgcolor: 'error.light',
            opacity: 0.1,
            display: 'flex',
            alignItems: 'center'
          }}>
             <Box sx={{ bgcolor: 'error.main', color: 'white', px: 3, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, zIndex: 1 }}>
               <Volume2 size={18} className="animate-pulse" />
               <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>Live Broadcast</Typography>
             </Box>
             <Box sx={{ flexGrow: 1, overflow: 'hidden', position: 'relative', height: 40, display: 'flex', alignItems: 'center' }}>
               <Box sx={{ 
                 position: 'absolute', 
                 whiteSpace: 'nowrap',
                 animation: 'marquee 20s linear infinite',
                 '@keyframes marquee': {
                   '0%': { transform: 'translateX(100%)' },
                   '100%': { transform: 'translateX(-100%)' }
                 }
               }}>
                 {urgentNotices.map((n, idx) => (
                   <Typography key={idx} component="span" sx={{ mx: 4, color: 'error.main', fontWeight: 700, fontSize: '0.85rem' }}>
                     • {n.title}: {n.content.substring(0, 80)}...
                   </Typography>
                 ))}
               </Box>
             </Box>
          </Paper>
        )}

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
            <Typography variant="h3" sx={{ fontWeight: 900, tracking: '-0.04em' }}>
              Society <Box component="span" sx={{ color: 'primary.main' }}>Bulletin</Box>
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
              Broadcast official updates to residents
            </Typography>
          </Box>
          {isAdmin && (
            <Button 
              variant="contained" 
              startIcon={<Plus size={18} strokeWidth={3} />}
              onClick={() => setShowAddModal(true)}
              sx={{ 
                borderRadius: 6, px: 4, py: 1.5, 
                fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem',
                boxShadow: 10,
                '&:active': { transform: 'scale(0.95)' }
              }}
            >
              Post Notice
            </Button>
          )}
        </Box>

        <Stack spacing={4}>
          {notices.length === 0 ? (
            <Paper sx={{ py: 12, textAlign: 'center', borderRadius: 12, border: '2px dashed', borderColor: 'divider', boxShadow: 0 }}>
               <Bell size={64} style={{ opacity: 0.1, marginBottom: 16 }} />
               <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.disabled' }}>No announcements have been posted yet.</Typography>
            </Paper>
          ) : (
            notices.map((notice, i) => (
              <Card 
                key={notice.id || notice._id || i} 
                sx={{ 
                  p: { xs: 4, md: 6 }, 
                  borderRadius: 12, 
                  border: '1px solid', 
                  borderColor: 'divider', 
                  boxShadow: 0,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 10
                  }
                }}
              >
                {i === 0 && (
                  <Box sx={{ 
                    position: 'absolute', top: 0, right: 0, 
                    bgcolor: 'primary.main', color: 'white', 
                    px: 3, py: 1, borderRadius: '0 0 0 24px',
                    display: 'flex', alignItems: 'center', gap: 1,
                    boxShadow: 4
                  }}>
                    <Waves size={12} className="animate-pulse" />
                    <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: 1 }}>Live Update</Typography>
                  </Box>
                )}
                
                <Box>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                    <Chip 
                      label={notice.category} 
                      size="small"
                      variant="outlined"
                      color={notice.category === 'Urgent' ? 'error' : notice.category === 'Event' ? 'success' : 'default'}
                      sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', borderRadius: 2 }} 
                    />
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.disabled' }}>
                      <Clock size={14} />
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>{formatDateTime(notice.date)}</Typography>
                    </Stack>
                  </Stack>
                  
                  <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, tracking: '-0.02em', '.MuiCard-root:hover &': { color: 'primary.main' }, transition: 'color 0.3s ease' }}>
                    {notice.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '1.1rem', fontWeight: 500 }}>
                    {notice.content}
                  </Typography>
                </Box>
              </Card>
            ))
          )}
        </Stack>

        {/* Add Notice Modal */}
        <Dialog 
          open={showAddModal} 
          onClose={() => setShowAddModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 10, p: 0, overflow: 'hidden' } }}
        >
          <DialogTitle sx={{ p: 4, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, tracking: '-0.04em' }}>New Notice</Typography>
            <IconButton onClick={() => setShowAddModal(false)}>
              <X size={28} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Stack spacing={4} component="form" onSubmit={handlePostNotice} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', ml: 1, mb: 1, display: 'block' }}>Broadcast Method</Typography>
                <Grid container spacing={2}>
                  {[
                    { id: 'NONE', icon: Globe, label: 'Portal' },
                    { id: 'WHATSAPP', icon: Smartphone, label: 'WA' },
                    { id: 'EMAIL', icon: Mail, label: 'Email' },
                    { id: 'BOTH', icon: BellRing, label: 'All' }
                  ].map(type => (
                    <Grid item xs={3} key={type.id}>
                      <Button
                        fullWidth
                        variant={formData.broadcastType === type.id ? 'contained' : 'outlined'}
                        onClick={() => setFormData({...formData, broadcastType: type.id as any})}
                        sx={{ 
                          height: 80, 
                          borderRadius: 6, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: 1,
                          borderColor: formData.broadcastType === type.id ? 'primary.main' : 'divider',
                          bgcolor: formData.broadcastType === type.id ? 'primary.light' : 'transparent',
                          color: formData.broadcastType === type.id ? 'primary.main' : 'text.disabled',
                          '&:hover': { bgcolor: 'primary.light', borderColor: 'primary.main' }
                        }}
                      >
                        <type.icon size={18} />
                        <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem' }}>{type.label}</Typography>
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', ml: 1, mb: 1, display: 'block' }}>Title</Typography>
                <TextField 
                  fullWidth 
                  placeholder="Notice Title..." 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  InputProps={{ sx: { borderRadius: 8, bgcolor: 'action.hover' } }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', ml: 1, mb: 1, display: 'block' }}>Message</Typography>
                <TextField 
                  fullWidth 
                  multiline
                  rows={4}
                  placeholder="Enter message..."
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  InputProps={{ sx: { borderRadius: 8, bgcolor: 'action.hover' } }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', ml: 1, mb: 1, display: 'block' }}>Category</Typography>
                <Stack direction="row" spacing={2}>
                  {['General', 'Urgent', 'Event'].map(cat => (
                    <Button 
                      key={cat} 
                      fullWidth
                      variant={formData.category === cat ? 'contained' : 'outlined'}
                      onClick={() => setFormData({...formData, category: cat as any})}
                      sx={{ 
                        borderRadius: 4, py: 1.5, 
                        fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem',
                        borderColor: formData.category === cat ? 'primary.main' : 'divider',
                        bgcolor: formData.category === cat ? 'primary.light' : 'transparent',
                        color: formData.category === cat ? 'primary.main' : 'text.disabled',
                        '&:hover': { bgcolor: 'primary.light', borderColor: 'primary.main' }
                      }}
                    >
                      {cat}
                    </Button>
                  ))}
                </Stack>
              </Box>

              <Button 
                fullWidth 
                variant="contained" 
                size="large"
                disabled={isBroadcasting}
                type="submit"
                startIcon={isBroadcasting ? <CircularProgress size={20} color="inherit" /> : <Globe size={18} />}
                sx={{ 
                  borderRadius: 10, py: 2, 
                  fontWeight: 900, textTransform: 'uppercase', 
                  letterSpacing: 1.5,
                  boxShadow: 10,
                  '&:active': { transform: 'scale(0.95)' }
                }}
              >
                {isBroadcasting ? 'Broadcasting...' : 'Publish to Residency'}
              </Button>
            </Stack>
          </DialogContent>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default Notices;
