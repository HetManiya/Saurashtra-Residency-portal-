
import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, Button, IconButton, 
  LinearProgress, Avatar, Chip, Tooltip, CircularProgress,
  Paper, useTheme, Fade, Stack, Divider
} from '@mui/material';
import { 
  Building2, Users, HandCoins, ShieldCheck, Zap, 
  Droplets, TreePine, DoorOpen, Home, ArrowUpRight,
  Activity, BrainCircuit, BarChart3, TrendingUp, AlertCircle,
  BellRing, Command, Settings, Smartphone, CreditCard, Clock, Sun, Moon,
  ShieldAlert, Receipt, QrCode, LifeBuoy, Siren, UserPlus, Sparkles, Loader2,
  CheckCircle2, Calendar
} from 'lucide-react';
import { SOCIETY_INFO, BUILDINGS, UTILITY_SUMMARY } from '../constants';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { Notice, Meeting } from '../types';
import { motion } from 'motion/react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [prediction, setPrediction] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [user, setUser] = useState<any>(null);
  const [adminSummary, setAdminSummary] = useState<any>(null);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);
    const storedUser = localStorage.getItem('sr_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    
    const fetchPrediction = async (retries = 0) => {
      if (retries === 0) setLoadingAi(true);
      try {
        const pred = await api.getExpensePrediction(UTILITY_SUMMARY);
        setPrediction(pred);
        setLoadingAi(false);
      } catch (e: any) {
        if (e.message === 'SERVER_STARTING' && retries < 5) {
          setTimeout(() => fetchPrediction(retries + 1), 2000);
          return;
        }
        setPrediction("Forecast temporarily unavailable.");
        setLoadingAi(false);
      }
    };

    const fetchNotices = async (retries = 0) => {
      if (retries === 0) setLoadingNotices(true);
      try {
        const data = await api.getNotices();
        setNotices(data);
        setLoadingNotices(false);
      } catch (e: any) {
        if (e.message === 'SERVER_STARTING' && retries < 5) {
          setTimeout(() => fetchNotices(retries + 1), 2000);
          return;
        }
        setNotices([]);
        setLoadingNotices(false);
      }
    };

    const fetchMeetings = async () => {
      try {
        const data = await api.getMeetings();
        setMeetings(data);
      } catch (e) {
        setMeetings([]);
      }
    };

    const fetchMaintenance = async () => {
      if (storedUser) {
        const u = JSON.parse(storedUser);
        try {
          const data = await api.getMaintenanceRecords(u.flatId);
          setMaintenanceRecords(data);
        } catch (e) {
          setMaintenanceRecords([]);
        }
      }
    };

    const fetchAdminData = async (retries = 0) => {
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.role === 'ADMIN' || u.role === 'COMMITTEE') {
          if (retries === 0) setLoadingAdmin(true);
          try {
            const data = await api.getAdminSummary();
            setAdminSummary(data);
            setLoadingAdmin(false);
          } catch (e: any) {
            if (e.message === 'SERVER_STARTING' && retries < 5) {
              setTimeout(() => fetchAdminData(retries + 1), 2000);
              return;
            }
            setLoadingAdmin(false);
          }
        }
      }
    };

    fetchPrediction();
    fetchNotices();
    fetchMeetings();
    fetchMaintenance();
    fetchAdminData();
  }, []);

  const nextMeeting = meetings
    .filter(m => new Date(m.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const getTimeRemaining = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h remaining`;
  };

  const currentMaintenance = maintenanceRecords[0]; // Assuming latest is first
  const isPaid = currentMaintenance?.status === 'Paid';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'COMMITTEE';

  const handleResolveComplaint = (id: string) => {
    if (adminSummary) {
      const updatedComplaints = adminSummary.recentComplaints.filter((c: any) => c.id !== id);
      setAdminSummary({
        ...adminSummary,
        recentComplaints: updatedComplaints,
        openTickets: Math.max(0, adminSummary.openTickets - 1)
      });
    }
  };

  const AdminView = () => {
    const theme = useTheme();
    
    return (
      <Box 
        component={motion.div}
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 3,
          autoRows: 'minmax(180px, auto)'
        }}
      >
        {/* Main Hero - 2x2 */}
        <Box 
          component={motion.div}
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          sx={{ 
            gridColumn: { md: 'span 2' }, 
            gridRow: { md: 'span 2' },
            bgcolor: 'grey.900',
            borderRadius: 8,
            p: 5,
            color: 'white',
            boxShadow: 10,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ 
            position: 'absolute', top: 0, right: 0, 
            width: 400, height: 400, 
            bgcolor: 'primary.main', opacity: 0.15, 
            borderRadius: '50%', filter: 'blur(100px)',
            mr: -20, mt: -20
          }} />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Chip 
              icon={<ShieldAlert size={14} color="#f59e0b" />}
              label="Executive Console" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.05)', 
                color: 'white', 
                fontWeight: 900, 
                textTransform: 'uppercase', 
                letterSpacing: 1,
                mb: 3,
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)'
              }} 
            />
            <Typography variant="h1" sx={{ fontSize: { xs: '3rem', md: '4rem' }, mb: 2 }}>
              Saurashtra <br />
              <Box component="span" sx={{ color: 'primary.light' }}>Analytics</Box>
            </Typography>
            <Typography variant="body1" sx={{ color: 'grey.400', maxWidth: 400, fontSize: '1.1rem' }}>
              Society ecosystem is currently <Box component="span" sx={{ color: 'success.light', fontWeight: 900 }}>HEALTHY</Box>. All systems operational.
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} sx={{ position: 'relative', zIndex: 1, mt: 4 }}>
            <Button variant="contained" color="inherit" sx={{ color: 'grey.900' }} onClick={() => navigate('/registration-approvals')}>Approvals</Button>
            <Button variant="contained" color="primary" onClick={() => navigate('/security-gate')}>Security</Button>
            <Button variant="outlined" color="inherit" sx={{ borderColor: 'rgba(255,255,255,0.2)' }} onClick={() => navigate('/audit-logs')}>Audit</Button>
          </Stack>
        </Box>

        {/* Residents Count - 1x1 */}
        <Card 
          component={motion.div}
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          sx={{ p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Avatar sx={{ bgcolor: 'primary.light', width: 56, height: 56, borderRadius: 4 }}>
              <Users size={28} />
            </Avatar>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase' }}>Residents</Typography>
              <Typography variant="h3">480</Typography>
            </Box>
          </Box>
          <Box sx={{ mt: 'auto' }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary' }}>Occupancy</Typography>
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main' }}>92%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={92} sx={{ height: 6, borderRadius: 3 }} />
          </Box>
        </Card>

        {/* Open Tickets - 1x1 */}
        <Card 
          component={motion.div}
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          sx={{ p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Avatar sx={{ bgcolor: 'warning.light', width: 56, height: 56, borderRadius: 4 }}>
              <AlertCircle size={28} />
            </Avatar>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase' }}>Open Tickets</Typography>
              <Typography variant="h3">{adminSummary?.summary?.openComplaints ?? '02'}</Typography>
            </Box>
          </Box>
          <Button variant="contained" color="inherit" fullWidth sx={{ bgcolor: 'grey.900', color: 'white', '&:hover': { bgcolor: 'primary.main' } }} onClick={() => navigate('/helpdesk')}>
            Manage Support
          </Button>
        </Card>

        {/* Intelligence Unit - 2x1 */}
        <Box 
          component={motion.div}
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          sx={{ 
            gridColumn: { md: 'span 2' },
            bgcolor: 'grey.900',
            borderRadius: 8,
            p: 4,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, borderRadius: 4 }}>
              <BrainCircuit size={32} />
            </Avatar>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.light', textTransform: 'uppercase' }}>Intelligence Unit</Typography>
              <Typography variant="h6">Society Forecast</Typography>
            </Box>
          </Box>
          <Paper sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 3, borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'grey.300' }}>
              "{loadingAi ? "Calculating patterns..." : (prediction || "Optimizing utility consumption based on wing data.")}"
            </Typography>
          </Paper>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.light', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Sparkles size={14} /> Confidence: 99%
            </Typography>
            <Button size="small" color="inherit" onClick={() => navigate('/expenses')}>Details</Button>
          </Stack>
        </Box>

        {/* Collection Status - 1x1 */}
        <Card 
          component={motion.div}
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          sx={{ p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <TrendingUp size={20} color={theme.palette.primary.main} /> Collection
            </Typography>
            <Chip label="Live" size="small" color="success" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 900 }} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
             <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress variant="determinate" value={85} size={100} thickness={4} sx={{ color: 'primary.main' }} />
                <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>85%</Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 900, color: 'text.secondary' }}>PAID</Typography>
                </Box>
             </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid size={6}>
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary' }}>DUE</Typography>
              <Typography variant="body2" sx={{ fontWeight: 900 }}>₹1.2M</Typography>
            </Grid>
            <Grid size={6} sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary' }}>PEND.</Typography>
              <Typography variant="body2" sx={{ fontWeight: 900, color: 'error.main' }}>₹180k</Typography>
            </Grid>
          </Grid>
        </Card>

        {/* Recent Issues - 1x1 */}
        <Card 
          component={motion.div}
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          sx={{ p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <Typography variant="h6" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <AlertCircle size={20} color={theme.palette.warning.main} /> Issues
          </Typography>
          <Stack spacing={1.5} sx={{ flex: 1 }}>
            {adminSummary?.recentComplaints?.slice(0, 2).map((complaint: any, index: number) => (
              <Paper key={complaint.id || index} elevation={0} sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: 'error.light' }}>
                    <AlertCircle size={14} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 900, display: 'block', lineHeight: 1.2 }}>{complaint.subject}</Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>{complaint.flatId}</Typography>
                  </Box>
                </Box>
                <IconButton size="small" color="success" onClick={() => handleResolveComplaint(complaint.id)}>
                  <CheckCircle2 size={16} />
                </IconButton>
              </Paper>
            ))}
            {(!adminSummary?.recentComplaints || adminSummary.recentComplaints.length === 0) && (
              <Typography variant="caption" sx={{ textAlign: 'center', py: 2, color: 'text.secondary', fontWeight: 900 }}>All Clear</Typography>
            )}
          </Stack>
          <Button variant="text" fullWidth sx={{ mt: 2, fontWeight: 900 }} onClick={() => navigate('/helpdesk')}>View All</Button>
        </Card>
      </Box>
    );
  };

  const ResidentView = () => {
    const theme = useTheme();
    
    return (
      <Box 
        component={motion.div}
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 3,
          autoRows: 'minmax(180px, auto)'
        }}
      >
        {/* Welcome Hero - 2x2 */}
        <Box 
          component={motion.div}
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          sx={{ 
            gridColumn: { md: 'span 2' }, 
            gridRow: { md: 'span 2' },
            bgcolor: 'primary.main',
            borderRadius: 8,
            p: 5,
            color: 'white',
            boxShadow: 10,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ 
            position: 'absolute', top: 0, right: 0, 
            width: 400, height: 400, 
            bgcolor: 'white', opacity: 0.1, 
            borderRadius: '50%', filter: 'blur(100px)',
            mr: -20, mt: -20
          }} />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Chip 
              icon={<Home size={14} color="#fbbf24" />}
              label={`Unit ${user?.flatId || 'A-1-101'}`} 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white', 
                fontWeight: 900, 
                textTransform: 'uppercase', 
                letterSpacing: 1,
                mb: 3,
                backdropFilter: 'blur(10px)'
              }} 
            />
            <Typography variant="h1" sx={{ fontSize: { xs: '3rem', md: '4rem' }, mb: 2 }}>
              {t('welcome')}, <br />
              <Box component="span" sx={{ color: 'primary.light' }}>{user?.name?.split(' ')[0]}</Box>
            </Typography>
            <Typography variant="body1" sx={{ color: 'primary.light', maxWidth: 400, fontSize: '1.1rem' }}>
              {isPaid ? "Your account is fully settled. Thank you for your contribution!" : "You have an outstanding maintenance bill. Please settle it to avoid penalties."}
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} sx={{ position: 'relative', zIndex: 1, mt: 4 }}>
            <Button variant="contained" color="inherit" sx={{ color: 'primary.main', px: 4 }} onClick={() => navigate('/maintenance')} startIcon={<CreditCard size={18} />}>
              {isPaid ? 'View History' : 'Pay Now'}
            </Button>
            <Button variant="contained" color="primary" sx={{ bgcolor: 'primary.dark', px: 4 }} onClick={() => navigate('/visitor-pass')} startIcon={<QrCode size={18} />}>
              New Pass
            </Button>
          </Stack>
        </Box>

        {/* Maintenance Balance - 1x1 */}
        <Card 
          component={motion.div}
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          sx={{ p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ bgcolor: 'primary.light', width: 56, height: 56, borderRadius: 4 }}>
              <Receipt size={28} />
            </Avatar>
            <Chip 
              label={isPaid ? 'Cleared' : 'Due'} 
              color={isPaid ? 'success' : 'error'} 
              size="small" 
              sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem' }} 
            />
          </Box>
          <Box>
            <Typography variant="h3" sx={{ mb: 0.5 }}>₹{isPaid ? '0.00' : (currentMaintenance?.amount || '2,500')}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase' }}>Maintenance Balance</Typography>
          </Box>
          <Box sx={{ mt: 4 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary' }}>Society Avg</Typography>
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main' }}>88% Paid</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={88} sx={{ height: 6, borderRadius: 3 }} />
          </Box>
        </Card>

        {/* Launchpad - 1x1 */}
        <Card 
          component={motion.div}
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          sx={{ p: 4, bgcolor: 'grey.900', color: 'white', display: 'flex', flexDirection: 'column' }}
        >
          <Typography variant="h6" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Command size={20} color={theme.palette.primary.main} /> {t('launchpad')}
          </Typography>
          <Grid container spacing={1.5}>
            {[
              { icon: Siren, label: t('sos'), color: 'error.main', path: '/emergency' },
              { icon: LifeBuoy, label: 'Support', color: 'warning.main', path: '/helpdesk' },
              { icon: Building2, label: 'Directory', color: 'primary.main', path: '/buildings' },
              { icon: UserPlus, label: 'Profile', color: 'primary.dark', path: '/profile' },
            ].map((btn, i) => (
              <Grid size={6} key={i}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  onClick={() => navigate(btn.path)}
                  sx={{ 
                    aspectRatio: '1/1', 
                    flexDirection: 'column', 
                    bgcolor: btn.color,
                    borderRadius: 4,
                    '&:hover': { bgcolor: btn.color, opacity: 0.9, transform: 'scale(1.05)' },
                    transition: 'all 0.2s'
                  }}
                >
                  <btn.icon size={20} />
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 900, mt: 1 }}>{btn.label}</Typography>
                </Button>
              </Grid>
            ))}
          </Grid>
        </Card>

        {/* Next Meeting - 1x1 */}
        <Card 
          component={motion.div}
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          sx={{ p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ bgcolor: 'indigo.50', color: 'indigo.600', width: 56, height: 56, borderRadius: 4 }}>
                <Calendar size={28} />
              </Avatar>
              <Chip label="Assembly" size="small" sx={{ bgcolor: 'indigo.50', color: 'indigo.600', fontWeight: 900, fontSize: '0.6rem' }} />
            </Box>
            {nextMeeting ? (
              <>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nextMeeting.title}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Clock size={12} /> {new Date(nextMeeting.date).toLocaleDateString()}
                </Typography>
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'indigo.50', border: '1px solid', borderColor: 'indigo.100', textAlign: 'center', borderRadius: 4 }}>
                  <Typography variant="h4" sx={{ color: 'indigo.600', fontWeight: 900 }}>{getTimeRemaining(nextMeeting.date)}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 900, color: 'indigo.400', textTransform: 'uppercase' }}>Countdown</Typography>
                </Paper>
              </>
            ) : (
              <Typography variant="caption" sx={{ textAlign: 'center', py: 4, color: 'text.secondary', fontWeight: 900, display: 'block' }}>No meetings</Typography>
            )}
          </Box>
          <Button variant="contained" fullWidth sx={{ mt: 2, bgcolor: 'indigo.600', '&:hover': { bgcolor: 'indigo.700' } }} onClick={() => navigate('/meetings')}>
            View Calendar
          </Button>
        </Card>

        {/* Bulletin - 1x1 */}
        <Card 
          component={motion.div}
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          sx={{ p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <BellRing size={20} color={theme.palette.primary.main} /> Bulletin
            </Typography>
            <Button size="small" onClick={() => navigate('/notices')}>All</Button>
          </Box>
          <Stack spacing={1.5} sx={{ flex: 1 }}>
            {notices.slice(0, 2).map((notice, index) => (
              <Paper 
                key={notice.id || index} 
                elevation={0} 
                onClick={() => navigate('/notices')}
                sx={{ 
                  p: 2, 
                  bgcolor: 'action.hover', 
                  borderRadius: 4, 
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.selected' },
                  transition: 'all 0.2s'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Chip 
                    label={notice.category} 
                    size="small" 
                    sx={{ 
                      height: 16, 
                      fontSize: '0.5rem', 
                      fontWeight: 900, 
                      bgcolor: notice.category === 'Urgent' ? 'error.light' : 'primary.light',
                      color: notice.category === 'Urgent' ? 'error.main' : 'primary.main'
                    }} 
                  />
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>{new Date(notice.date).toLocaleDateString()}</Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{notice.title}</Typography>
              </Paper>
            ))}
            {notices.length === 0 && (
              <Typography variant="caption" sx={{ textAlign: 'center', py: 2, color: 'text.secondary', fontWeight: 900 }}>No updates</Typography>
            )}
          </Stack>
          <Button variant="contained" fullWidth color="primary" sx={{ mt: 2, opacity: 0.1, '&:hover': { opacity: 1 } }} onClick={() => navigate('/facilities')}>
            Book Amenities
          </Button>
        </Card>
      </Box>
    );
  };

  return (
    <div className="pb-12 page-transition">
      {isAdmin ? <AdminView /> : <ResidentView />}
    </div>
  );
};

export default Dashboard;
