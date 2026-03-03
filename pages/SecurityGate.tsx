import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, Button, IconButton, 
  Avatar, Chip, CircularProgress, Paper, useTheme, 
  Fade, Stack, Divider, TextField, InputAdornment,
  List, ListItem, ListItemText, ListItemAvatar,
  useMediaQuery, Tooltip
} from '@mui/material';
import { 
  ShieldCheck, Scan, Search, User, Phone, Home, Clock, 
  CheckCircle2, XCircle, LogIn, LogOut, Loader2, AlertCircle,
  History, UserCheck, ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { io, Socket } from 'socket.io-client';

const SecurityGate: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [passId, setPassId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [visitor, setVisitor] = useState<any>(null);
  const [activeVisitors, setActiveVisitors] = useState<any[]>([]);
  const [loadingActive, setLoadingActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    fetchActiveVisitors();

    // Initialize Socket.io
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to real-time gate network');
      newSocket.emit('join-security');
    });

    newSocket.on('visitor-update', (data: any) => {
      console.log('Real-time update received:', data);
      fetchActiveVisitors();
      
      if (data.type === 'CHECK_IN') {
        console.log(`New visitor checked in: ${data.visitor.name}`);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const fetchActiveVisitors = async () => {
    try {
      const data = await api.getActiveVisitors();
      setActiveVisitors(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingActive(false);
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passId) return;

    setVerifying(true);
    setError(null);
    setVisitor(null);
    setSuccess(null);

    try {
      const data = await api.verifyVisitorPass(passId);
      setVisitor(data);
    } catch (e: any) {
      setError(e.message || 'Invalid Pass ID');
    } finally {
      setVerifying(false);
    }
  };

  const handleCheckIn = async () => {
    if (!visitor) return;
    setVerifying(true);
    try {
      await api.checkInVisitor(visitor.passId);
      setSuccess(`Visitor ${visitor.name} checked in successfully!`);
      setVisitor(null);
      setPassId('');
      fetchActiveVisitors();
    } catch (e: any) {
      setError(e.message || 'Check-in failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      await api.checkOutVisitor(id);
      fetchActiveVisitors();
    } catch (e: any) {
      alert(e.message || 'Check-out failed');
    }
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
            <Stack direction="row" spacing={2} alignItems="center">
              <ShieldCheck size={40} color={theme.palette.primary.main} />
              <Typography variant="h3" sx={{ fontWeight: 900, tracking: '-0.04em' }}>
                Security <Box component="span" sx={{ color: 'primary.main' }}>Gate</Box>
              </Typography>
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
              Verify visitor passes and manage gate entries
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Paper sx={{ px: 3, py: 1.5, borderRadius: 4, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', gap: 2, boxShadow: 0 }}>
              <Box sx={{ width: 12, height: 12, bgcolor: 'success.main', borderRadius: '50%', animation: 'pulse 2s infinite', '@keyframes pulse': { '0%': { opacity: 1 }, '50%': { opacity: 0.5 }, '100%': { opacity: 1 } } }} />
              <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1 }}>Gate 1 Active</Typography>
            </Paper>
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Verification Section */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={4}>
              <Card sx={{ p: 5, borderRadius: 12, border: '1px solid', borderColor: 'divider', boxShadow: 0 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                  <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', borderRadius: 3 }}>
                    <Scan size={24} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>Verify Pass</Typography>
                </Stack>
                
                <Stack spacing={3} component="form" onSubmit={handleVerify}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', ml: 1, mb: 1, display: 'block' }}>Enter Pass ID</Typography>
                    <TextField 
                      fullWidth 
                      placeholder="e.g. ABC123XY" 
                      required
                      value={passId}
                      onChange={(e) => setPassId(e.target.value)}
                      InputProps={{ 
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search size={20} color={theme.palette.text.disabled} />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 8, bgcolor: 'action.hover', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 } 
                      }}
                    />
                  </Box>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    size="large"
                    disabled={verifying || !passId}
                    type="submit"
                    startIcon={verifying ? <CircularProgress size={20} color="inherit" /> : <ShieldCheck size={18} />}
                    sx={{ 
                      borderRadius: 10, py: 2, 
                      fontWeight: 900, textTransform: 'uppercase', 
                      letterSpacing: 1.5,
                      boxShadow: 10,
                      '&:active': { transform: 'scale(0.95)' }
                    }}
                  >
                    {verifying ? 'Verifying...' : 'Verify Visitor'}
                  </Button>
                </Stack>

                {error && (
                  <Fade in={true}>
                    <Box sx={{ mt: 4, p: 3, borderRadius: 6, bgcolor: 'error.light', color: 'error.main', display: 'flex', alignItems: 'center', gap: 2, border: '1px solid', borderColor: 'error.main', opacity: 0.1 }}>
                      <XCircle size={24} />
                      <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase' }}>{error}</Typography>
                    </Box>
                  </Fade>
                )}

                {success && (
                  <Fade in={true}>
                    <Box sx={{ mt: 4, p: 3, borderRadius: 6, bgcolor: 'success.light', color: 'success.main', display: 'flex', alignItems: 'center', gap: 2, border: '1px solid', borderColor: 'success.main', opacity: 0.1 }}>
                      <CheckCircle2 size={24} />
                      <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase' }}>{success}</Typography>
                    </Box>
                  </Fade>
                )}
              </Card>

              {visitor && (
                <Fade in={true}>
                  <Card sx={{ p: 5, borderRadius: 12, bgcolor: 'primary.main', color: 'white', boxShadow: 10 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                      <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: 4 }}>
                        <User size={32} />
                      </Avatar>
                      <Chip 
                        label={visitor.type} 
                        size="small" 
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem' }} 
                      />
                    </Box>
                    
                    <Stack spacing={3}>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, tracking: '-0.02em' }}>{visitor.name}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ opacity: 0.8, mt: 0.5 }}>
                          <Phone size={14} />
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{visitor.phone}</Typography>
                        </Stack>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 2, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', boxShadow: 0 }}>
                            <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', opacity: 0.6, fontSize: '0.55rem', display: 'block', mb: 0.5 }}>Destination</Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Home size={14} />
                              <Typography variant="body2" sx={{ fontWeight: 900 }}>{visitor.flatId}</Typography>
                            </Stack>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 2, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', boxShadow: 0 }}>
                            <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', opacity: 0.6, fontSize: '0.55rem', display: 'block', mb: 0.5 }}>Purpose</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 900, noWrap: true }}>{visitor.purpose || 'Visit'}</Typography>
                          </Paper>
                        </Grid>
                      </Grid>

                      <Button 
                        fullWidth 
                        variant="contained" 
                        size="large"
                        onClick={handleCheckIn}
                        startIcon={<LogIn size={18} />}
                        sx={{ 
                          borderRadius: 10, py: 2, 
                          bgcolor: 'white', color: 'primary.main',
                          fontWeight: 900, textTransform: 'uppercase', 
                          '&:hover': { bgcolor: 'primary.light' }
                        }}
                      >
                        Confirm Entry
                      </Button>
                    </Stack>
                  </Card>
                </Fade>
              )}
            </Stack>
          </Grid>

          {/* Active Visitors Log */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={4}>
              <Card sx={{ borderRadius: 16, border: '1px solid', borderColor: 'divider', boxShadow: 0, overflow: 'hidden' }}>
                <Box sx={{ p: 4, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', borderRadius: 3 }}>
                      <History size={24} />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 900, tracking: '-0.02em' }}>Live Gate Log</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', fontSize: '0.55rem' }}>Real-time Entry Tracking</Typography>
                    </Box>
                  </Stack>
                  <Chip 
                    label={`${activeVisitors.length} Inside`} 
                    color="success" 
                    variant="outlined"
                    sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem', borderRadius: 3, bgcolor: 'success.light', opacity: 0.8 }} 
                  />
                </Box>

                <Box sx={{ p: 4 }}>
                  {loadingActive ? (
                    <Box sx={{ py: 10, textAlign: 'center' }}>
                      <CircularProgress size={32} />
                    </Box>
                  ) : activeVisitors.length === 0 ? (
                    <Box sx={{ py: 10, textAlign: 'center' }}>
                      <Avatar sx={{ width: 64, height: 64, bgcolor: 'action.hover', color: 'text.disabled', mx: 'auto', mb: 2 }}>
                        <UserCheck size={32} />
                      </Avatar>
                      <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.disabled' }}>No active visitors inside</Typography>
                    </Box>
                  ) : (
                    <Stack spacing={2}>
                      {activeVisitors.map((v, i) => (
                        <Paper 
                          key={v._id || i} 
                          sx={{ 
                            p: 3, 
                            borderRadius: 6, 
                            bgcolor: 'action.hover', 
                            border: '1px solid', 
                            borderColor: 'transparent',
                            transition: 'all 0.3s ease',
                            '&:hover': { borderColor: 'primary.main', bgcolor: 'background.paper', boxShadow: 4 },
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 3
                          }}
                        >
                          <Stack direction="row" spacing={3} alignItems="center" sx={{ width: '100%' }}>
                            <Avatar sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: 'background.paper', color: 'text.disabled', boxShadow: 1 }}>
                              <User size={24} />
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>{v.name}</Typography>
                                <Chip label={v.type} size="small" sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.55rem', height: 18, bgcolor: 'primary.light', color: 'primary.main' }} />
                              </Stack>
                              <Stack direction="row" spacing={3} alignItems="center">
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.disabled' }}>
                                  <Home size={12} />
                                  <Typography variant="caption" sx={{ fontWeight: 700 }}>{v.flatId}</Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.disabled' }}>
                                  <Clock size={12} />
                                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                    In: {new Date(v.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </Box>
                          </Stack>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => handleCheckOut(v._id)}
                            startIcon={<LogOut size={14} />}
                            sx={{ 
                              borderRadius: 4, px: 3, 
                              fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem',
                              borderColor: 'divider',
                              color: 'text.secondary',
                              '&:hover': { bgcolor: 'error.light', color: 'error.main', borderColor: 'error.main' }
                            }}
                          >
                            Check Out
                          </Button>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Card>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 4, borderRadius: 12, bgcolor: 'warning.main', color: 'white', boxShadow: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <ShieldAlert size={32} sx={{ mb: 4 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>Security Protocol</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 500, lineHeight: 1.6 }}>
                        Always verify physical ID for service providers and delivery personnel even with a valid digital pass.
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 4, borderRadius: 12, bgcolor: 'text.primary', color: 'white', boxShadow: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <History size={32} color={theme.palette.primary.main} sx={{ mb: 4 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>Shift Summary</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 500, lineHeight: 1.6 }}>
                        Total entries today: <Box component="span" sx={{ color: 'white', fontWeight: 900 }}>24</Box><br />
                        Average stay duration: <Box component="span" sx={{ color: 'white', fontWeight: 900 }}>42 mins</Box>
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default SecurityGate;
