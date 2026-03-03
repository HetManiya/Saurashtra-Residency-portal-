import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, Button, IconButton, 
  Avatar, Chip, CircularProgress, Paper, useTheme, 
  Fade, Stack, Divider, TextField, InputAdornment,
  useMediaQuery, Tooltip
} from '@mui/material';
import { 
  ShieldCheck, UserCheck, UserX, Clock, MapPin, 
  Home, Mail, Loader2, AlertCircle, Info, CheckCircle2,
  ShieldAlert, BadgeCheck, Fingerprint
} from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

const RegistrationApprovals: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('sr_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      if (parsed.role !== 'ADMIN' && parsed.role !== 'COMMITTEE') {
        navigate('/'); // Only admin/committee can access
        return;
      }
    }
    fetchPending();
  }, [navigate]);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await api.getPendingRegistrations();
      setPendingUsers(data);
    } catch (e) {
      // Silently handle error
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setProcessingId(userId);
    try {
      await api.approveRegistration(userId);
      await fetchPending();
    } catch (e) {
      alert("Approval failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string) => {
    if (!window.confirm("Are you sure you want to REJECT this registration?")) return;
    setProcessingId(userId);
    try {
      await api.rejectRegistration(userId);
      await fetchPending();
    } catch (e) {
      alert("Rejection failed");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 2 }}>
          Syncing Authorization Queue...
        </Typography>
      </Box>
    );
  }

  return (
    <Fade in={true}>
      <Box sx={{ maxWidth: 1100, mx: 'auto', pb: 8 }}>
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
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
              <Chip 
                icon={<ShieldAlert size={14} />} 
                label="Society Management Authority" 
                color="warning" 
                sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', borderRadius: 4, boxShadow: 4 }} 
              />
            </Stack>
            <Typography variant="h3" sx={{ fontWeight: 900, tracking: '-0.04em' }}>
              Membership <Box component="span" sx={{ color: 'primary.main' }}>Verification</Box>
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
              Approve or reject new resident requests for Saurashtra Residency
            </Typography>
          </Box>
          <Paper sx={{ p: 2, px: 4, borderRadius: 8, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 3, boxShadow: 0 }}>
            <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.main', borderRadius: 3, width: 48, height: 48 }}>
              <Clock size={24} />
            </Avatar>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', fontSize: '0.55rem' }}>Pending Requests</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>{pendingUsers.length}</Typography>
            </Box>
          </Paper>
        </Box>

        {pendingUsers.length === 0 ? (
          <Paper sx={{ py: 12, textAlign: 'center', borderRadius: 16, border: '2px dashed', borderColor: 'divider', boxShadow: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <Avatar sx={{ width: 96, height: 96, bgcolor: 'success.light', color: 'success.main', borderRadius: 10, mb: 4, boxShadow: 10 }}>
                <CheckCircle2 size={48} />
             </Avatar>
             <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>Access Control Clear</Typography>
             <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 400, fontWeight: 500 }}>
               All registration requests have been processed. Digital gateway is secure.
             </Typography>
          </Paper>
        ) : (
          <Stack spacing={4}>
            {pendingUsers.map((pUser) => (
              <Card 
                key={pUser.id} 
                sx={{ 
                  p: { xs: 4, md: 6 }, 
                  borderRadius: 16, 
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
                <Box sx={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, bgcolor: 'primary.main', opacity: 0.05, borderRadius: '50%', filter: 'blur(60px)', transition: 'transform 0.7s ease', '.MuiCard-root:hover &': { transform: 'scale(1.5)' } }} />
                
                <Grid container spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                  <Grid item xs={12} lg={8}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems={{ xs: 'center', md: 'flex-start' }}>
                      <Box sx={{ position: 'relative' }}>
                        <Avatar 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${pUser.email}`} 
                          sx={{ width: 112, height: 112, borderRadius: 10, border: '4px solid', borderColor: 'background.paper', boxShadow: 10 }} 
                        />
                        <Avatar sx={{ position: 'absolute', bottom: -8, right: -8, width: 40, height: 40, bgcolor: 'primary.main', border: '4px solid', borderColor: 'background.paper', boxShadow: 4 }}>
                          <Fingerprint size={18} color="white" />
                        </Avatar>
                      </Box>

                      <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
                          <Typography variant="h4" sx={{ fontWeight: 900, tracking: '-0.04em' }}>{pUser.name}</Typography>
                          <Chip 
                            icon={<ShieldCheck size={12} />} 
                            label={pUser.role} 
                            size="small"
                            color="primary" 
                            variant="outlined"
                            sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', borderRadius: 2, bgcolor: 'primary.light' }} 
                          />
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }} sx={{ mb: 3, color: 'text.disabled' }}>
                          <Mail size={14} color={theme.palette.primary.main} />
                          <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>{pUser.email}</Typography>
                        </Stack>

                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Paper sx={{ p: 2, borderRadius: 4, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2, boxShadow: 0 }}>
                               <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', borderRadius: 2, width: 36, height: 36 }}>
                                 <MapPin size={18} />
                               </Avatar>
                               <Box>
                                 <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', fontSize: '0.55rem' }}>Mapping</Typography>
                                 <Typography variant="body2" sx={{ fontWeight: 900 }}>{pUser.flatId || 'N/A'}</Typography>
                               </Box>
                            </Paper>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Paper sx={{ p: 2, borderRadius: 4, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2, boxShadow: 0 }}>
                               <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', borderRadius: 2, width: 36, height: 36 }}>
                                 <Home size={18} />
                               </Avatar>
                               <Box>
                                 <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', fontSize: '0.55rem' }}>Tenure</Typography>
                                 <Typography variant="body2" sx={{ fontWeight: 900 }}>{pUser.occupancyType}</Typography>
                               </Box>
                            </Paper>
                          </Grid>
                        </Grid>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} lg={4}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
                      <Button 
                        fullWidth
                        variant="outlined"
                        color="error"
                        disabled={processingId === pUser.id}
                        onClick={() => handleReject(pUser.id)}
                        startIcon={processingId !== pUser.id && <UserX size={18} />}
                        sx={{ 
                          borderRadius: 8, py: 2, 
                          fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem',
                          borderColor: 'error.light',
                          '&:hover': { bgcolor: 'error.main', color: 'white', borderColor: 'error.main' }
                        }}
                      >
                        {processingId === pUser.id ? <CircularProgress size={18} color="inherit" /> : 'Reject'}
                      </Button>
                      <Button 
                        fullWidth
                        variant="contained"
                        disabled={processingId === pUser.id}
                        onClick={() => handleApprove(pUser.id)}
                        startIcon={processingId !== pUser.id && <UserCheck size={18} />}
                        sx={{ 
                          borderRadius: 8, py: 2, 
                          fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem',
                          boxShadow: 10,
                          '&:active': { transform: 'scale(0.95)' }
                        }}
                      >
                        {processingId === pUser.id ? <CircularProgress size={18} color="inherit" /> : 'Authorize'}
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Card>
            ))}
          </Stack>
        )}

        <Paper sx={{ mt: 8, p: 6, borderRadius: 16, bgcolor: '#0F172A', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: 10 }}>
          <Box sx={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, bgcolor: 'primary.main', opacity: 0.1, borderRadius: '50%', filter: 'blur(80px)' }} />
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={5} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
             <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', color: 'warning.main' }}>
                <ShieldAlert size={40} />
             </Avatar>
             <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 1.5, tracking: '-0.02em' }}>Security Protocol Verification</Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', fontWeight: 500, lineHeight: 1.6 }}>
                  Approving a membership request grants access to internal society records and ledger details.
                  <Box component="span" sx={{ color: 'white', fontWeight: 900, ml: 1 }}>Always verify identities via physical registers before granting digital entry.</Box>
                </Typography>
             </Box>
          </Stack>
        </Paper>
      </Box>
    </Fade>
  );
};

export default RegistrationApprovals;
