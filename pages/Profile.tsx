import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, Button, IconButton, 
  Avatar, Chip, CircularProgress, Paper, useTheme, 
  Fade, Stack, Divider, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  useMediaQuery, Tooltip
} from '@mui/material';
import { 
  User, Mail, Shield, Home, Key, Lock, CheckCircle2, 
  AlertCircle, Loader2, Save, CreditCard, History, 
  Calendar, ArrowRight, ShieldCheck, BadgeCheck, Smartphone
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../components/LanguageContext';
import { MaintenanceRecord, PaymentStatus } from '../types';

const Profile: React.FC = () => {
  const { t } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [user, setUser] = useState<any>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const stored = localStorage.getItem('sr_user');
    if (stored) {
      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);
      loadUserData(parsedUser.flatId);
    }
  }, []);

  const loadUserData = async (flatId: string) => {
    setLoading(true);
    try {
      const records = await api.getMaintenanceRecords(flatId);
      setMaintenance(records);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.new !== passForm.confirm) {
      setStatusMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    setIsUpdating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatusMsg({ type: 'success', text: 'Password updated successfully!' });
      setPassForm({ current: '', new: '', confirm: '' });
    } catch (e) {
      setStatusMsg({ type: 'error', text: 'Failed to update password' });
    } finally {
      setIsUpdating(false);
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
    }
  };

  if (!user) return null;

  const unpaidCount = maintenance.filter(m => m.status !== PaymentStatus.PAID).length;
  const totalPaid = maintenance.filter(m => m.status === PaymentStatus.PAID).reduce((sum, m) => sum + m.amount, 0);

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
            <Typography variant="h3" sx={{ fontWeight: 900, tracking: '-0.04em' }}>
              My <Box component="span" sx={{ color: 'primary.main' }}>Identity</Box>
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
              Manage your residency credentials and payment history
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              icon={<BadgeCheck size={14} />} 
              label="Verified Member" 
              color="success" 
              variant="outlined"
              sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem', borderRadius: 3, bgcolor: 'success.light', opacity: 0.8 }} 
            />
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Sidebar: Personal Info & Security */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={4}>
              <Card sx={{ p: 5, borderRadius: 12, border: '1px solid', borderColor: 'divider', boxShadow: 0, textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 4 }}>
                  <Avatar 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                    sx={{ width: 128, height: 128, borderRadius: 10, border: '4px solid', borderColor: 'background.paper', boxShadow: 10 }} 
                  />
                  <Avatar sx={{ position: 'absolute', bottom: -8, right: -8, width: 40, height: 40, bgcolor: 'primary.main', border: '4px solid', borderColor: 'background.paper', boxShadow: 4 }}>
                    <ShieldCheck size={20} color="white" />
                  </Avatar>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>{user.name}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', textTransform: 'uppercase', letterSpacing: 2 }}>{user.role}</Typography>
                
                <Divider sx={{ my: 4 }} />
                
                <Stack spacing={2}>
                  <Paper sx={{ p: 2, borderRadius: 4, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', gap: 2, boxShadow: 0 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', borderRadius: 2 }}>
                      <Mail size={18} />
                    </Avatar>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', fontSize: '0.55rem' }}>Email Address</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, noWrap: true, maxWidth: 180 }}>{user.email}</Typography>
                    </Box>
                  </Paper>
                  <Paper sx={{ p: 2, borderRadius: 4, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', gap: 2, boxShadow: 0 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', borderRadius: 2 }}>
                      <Home size={18} />
                    </Avatar>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', fontSize: '0.55rem' }}>Property Unit</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{user.flatId}</Typography>
                    </Box>
                  </Paper>
                </Stack>
              </Card>

              <Card sx={{ p: 5, borderRadius: 12, bgcolor: 'text.primary', color: 'background.paper', position: 'relative', overflow: 'hidden', boxShadow: 10 }}>
                <Box sx={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, bgcolor: 'primary.main', opacity: 0.1, borderRadius: '50%', filter: 'blur(40px)' }} />
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: 4, width: 48, height: 48 }}>
                      <Lock size={24} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>Security Center</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', textTransform: 'uppercase', fontSize: '0.55rem' }}>Update Credentials</Typography>
                    </Box>
                  </Stack>

                  {statusMsg.text && (
                    <Fade in={true}>
                      <Box sx={{ 
                        p: 2, mb: 3, borderRadius: 4, 
                        bgcolor: statusMsg.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                        color: statusMsg.type === 'success' ? 'success.light' : 'error.light',
                        display: 'flex', alignItems: 'center', gap: 1.5,
                        border: '1px solid', borderColor: statusMsg.type === 'success' ? 'success.main' : 'error.main'
                      }}>
                        {statusMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase' }}>{statusMsg.text}</Typography>
                      </Box>
                    </Fade>
                  )}

                  <Stack spacing={3} component="form" onSubmit={handlePasswordChange}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', ml: 1, mb: 1, display: 'block' }}>Current Password</Typography>
                      <TextField 
                        fullWidth 
                        type="password"
                        placeholder="••••••••"
                        required
                        value={passForm.current}
                        onChange={(e) => setPassForm({...passForm, current: e.target.value})}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: 4, 
                            bgcolor: 'rgba(255,255,255,0.05)',
                            color: 'white',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                            '&:hover fieldset': { borderColor: 'primary.main' }
                          }
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', ml: 1, mb: 1, display: 'block' }}>New Password</Typography>
                      <TextField 
                        fullWidth 
                        type="password"
                        placeholder="New Password"
                        required
                        value={passForm.new}
                        onChange={(e) => setPassForm({...passForm, new: e.target.value})}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: 4, 
                            bgcolor: 'rgba(255,255,255,0.05)',
                            color: 'white',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                            '&:hover fieldset': { borderColor: 'primary.main' }
                          }
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', ml: 1, mb: 1, display: 'block' }}>Confirm New Password</Typography>
                      <TextField 
                        fullWidth 
                        type="password"
                        placeholder="Confirm New Password"
                        required
                        value={passForm.confirm}
                        onChange={(e) => setPassForm({...passForm, confirm: e.target.value})}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: 4, 
                            bgcolor: 'rgba(255,255,255,0.05)',
                            color: 'white',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                            '&:hover fieldset': { borderColor: 'primary.main' }
                          }
                        }}
                      />
                    </Box>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      type="submit"
                      disabled={isUpdating}
                      startIcon={isUpdating ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />}
                      sx={{ 
                        borderRadius: 6, py: 1.5, 
                        fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem',
                        bgcolor: 'background.paper', color: 'text.primary',
                        '&:hover': { bgcolor: 'primary.main', color: 'white' }
                      }}
                    >
                      {isUpdating ? 'Updating...' : 'Update Password'}
                    </Button>
                  </Stack>
                </Box>
              </Card>
            </Stack>
          </Grid>

          {/* Main: Payment History & Stats */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={4}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 4, borderRadius: 10, border: '1px solid', borderColor: 'divider', boxShadow: 0, height: 180, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', borderRadius: 3 }}>
                        <CreditCard size={24} />
                      </Avatar>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 1 }}>Lifetime Contributed</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 900, tracking: '-0.04em' }}>₹{totalPaid.toLocaleString()}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'success.main', textTransform: 'uppercase', mt: 1, display: 'block' }}>Status: Regular Payer</Typography>
                    </Box>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 4, borderRadius: 10, border: '1px solid', borderColor: 'divider', boxShadow: 0, height: 180, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'error.light', color: 'error.main', borderRadius: 3 }}>
                        <AlertCircle size={24} />
                      </Avatar>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 1 }}>Pending Records</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 900, tracking: '-0.04em' }}>{unpaidCount}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', mt: 1, display: 'block' }}>Current Maintenance Cycle</Typography>
                    </Box>
                  </Card>
                </Grid>
              </Grid>

              <Card sx={{ borderRadius: 12, border: '1px solid', borderColor: 'divider', boxShadow: 0, overflow: 'hidden' }}>
                <Box sx={{ p: 4, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Avatar sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: 3 }}>
                    <History size={24} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, tracking: '-0.02em' }}>Maintenance Ledger</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', fontSize: '0.55rem' }}>Historical Payment Tracking</Typography>
                  </Box>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem', color: 'text.disabled', borderBottom: 'none', px: 4 }}>Period</TableCell>
                        <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem', color: 'text.disabled', borderBottom: 'none', px: 4 }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem', color: 'text.disabled', borderBottom: 'none', px: 4 }}>Status</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem', color: 'text.disabled', borderBottom: 'none', px: 4 }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                            <CircularProgress size={24} sx={{ mb: 1 }} />
                            <Typography variant="caption" sx={{ display: 'block', fontWeight: 900, textTransform: 'uppercase', color: 'text.disabled' }}>Fetching Ledger...</Typography>
                          </TableCell>
                        </TableRow>
                      ) : maintenance.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                            <Avatar sx={{ width: 64, height: 64, bgcolor: 'action.hover', color: 'text.disabled', mx: 'auto', mb: 2 }}>
                              <CreditCard size={32} />
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.disabled' }}>No payment records found for this unit.</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        maintenance.map((record) => (
                          <TableRow key={record.id} hover sx={{ '&:last-child td': { borderBottom: 'none' } }}>
                            <TableCell sx={{ px: 4, py: 3 }}>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.main' }}>
                                  <Calendar size={18} />
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{record.month} {record.year}</Typography>
                                  {record.paidDate && (
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', fontSize: '0.55rem' }}>
                                      Paid on {new Date(record.paidDate).toLocaleDateString()}
                                    </Typography>
                                  )}
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ px: 4 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>₹{record.amount}</Typography>
                            </TableCell>
                            <TableCell sx={{ px: 4 }}>
                              <Chip 
                                label={record.status} 
                                size="small"
                                color={record.status === PaymentStatus.PAID ? 'success' : 'error'}
                                variant="outlined"
                                sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', borderRadius: 2 }} 
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ px: 4 }}>
                              {record.status === PaymentStatus.PAID ? (
                                <IconButton size="small" sx={{ bgcolor: 'action.hover', borderRadius: 2 }}>
                                  <ArrowRight size={18} />
                                </IconButton>
                              ) : (
                                <Button 
                                  variant="contained" 
                                  size="small"
                                  sx={{ 
                                    borderRadius: 3, px: 3, 
                                    fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem',
                                    boxShadow: 4
                                  }}
                                >
                                  Pay Now
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default Profile;
