
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Typography, Button, IconButton, TextField, 
  InputAdornment, Grid, Card, CardContent, Avatar, 
  Chip, Stack, Paper, Divider, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Tooltip, useTheme, Fade, List, ListItem, ListItemText,
  ListItemIcon, ListItemButton
} from '@mui/material';
import { 
  Package, Truck, Clock, CheckCircle2, X, Search, 
  Plus, Loader2, AlertCircle, MapPin, User, Phone, 
  ArrowRight, History, Bell, ShieldCheck, Trash2
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../components/LanguageContext';
import { BUILDINGS } from '../constants';

const Deliveries: React.FC = () => {
  const theme = useTheme();
  const { t } = useLanguage();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showLogForm, setShowLogForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  
  const [formData, setFormData] = useState({
    flatId: '',
    carrier: '',
    trackingNumber: '',
    notes: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('sr_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const data = await api.getPackages();
      setPackages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'COMMITTEE';

  const handleLogPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.logPackage(formData);
      await fetchPackages();
      setShowLogForm(false);
      setFormData({ flatId: '', carrier: '', trackingNumber: '', notes: '' });
      // Using alert for simplicity as per original, but could be Snackbar
      alert("Package logged successfully. Resident will be notified.");
    } catch (e) {
      alert("Failed to log package.");
    } finally {
      setLoading(false);
    }
  };

  const handleCollect = async (id: string) => {
    if (!confirm("Mark this package as collected?")) return;
    try {
      await api.collectPackage(id);
      await fetchPackages();
    } catch (e) {
      alert("Failed to update status.");
    }
  };

  const filteredPackages = useMemo(() => {
    return packages.filter(p => {
      const matchesTab = activeTab === 'pending' ? p.status === 'AT_GATE' : p.status === 'COLLECTED';
      const matchesSearch = p.flatId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.carrier.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [packages, activeTab, searchQuery]);

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Fade in timeout={800}>
        <Box>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 3,
            mb: 6,
            pb: 4,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 900, tracking: '-0.04em' }}>
                Delivery Hub
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
                Manage and track packages at the main gate
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              {isAdmin && (
                <Button 
                  variant="contained" 
                  size="large"
                  startIcon={<Plus size={18} />}
                  onClick={() => setShowLogForm(true)}
                  sx={{ borderRadius: 4, px: 4, py: 1.5, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}
                >
                  Log New Arrival
                </Button>
              )}
              <IconButton 
                onClick={fetchPackages}
                sx={{ 
                  bgcolor: 'background.paper', 
                  border: '1px solid', 
                  borderColor: 'divider',
                  borderRadius: 4,
                  p: 2
                }}
              >
                {loading ? <CircularProgress size={20} /> : <Loader2 size={20} />}
              </IconButton>
            </Stack>
          </Box>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, lg: 3 }}>
              <Stack spacing={4}>
                <Paper sx={{ p: 3, borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 2, mb: 3, display: 'block' }}>
                    Filter Status
                  </Typography>
                  <List sx={{ p: 0 }}>
                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemButton 
                        selected={activeTab === 'pending'}
                        onClick={() => setActiveTab('pending')}
                        sx={{ 
                          borderRadius: 4,
                          '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.main' }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                          <Package size={20} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="At Gate" 
                          primaryTypographyProps={{ variant: 'caption', fontWeight: 900, textTransform: 'uppercase' }} 
                        />
                        <Chip 
                          label={packages.filter(p => p.status === 'AT_GATE').length} 
                          size="small" 
                          sx={{ fontWeight: 900, bgcolor: 'background.paper', boxShadow: 1 }} 
                        />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton 
                        selected={activeTab === 'history'}
                        onClick={() => setActiveTab('history')}
                        sx={{ 
                          borderRadius: 4,
                          '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.main' }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                          <History size={20} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="History" 
                          primaryTypographyProps={{ variant: 'caption', fontWeight: 900, textTransform: 'uppercase' }} 
                        />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Paper>

                <Paper sx={{ 
                  p: 4, 
                  borderRadius: 6, 
                  bgcolor: 'primary.main', 
                  color: 'white', 
                  position: 'relative', 
                  overflow: 'hidden',
                  boxShadow: 10
                }}>
                  <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, bgcolor: 'white', opacity: 0.1, borderRadius: '50%', filter: 'blur(20px)' }} />
                  <ShieldCheck size={32} style={{ marginBottom: 16, opacity: 0.6 }} />
                  <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                    Security Protocol
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', lineHeight: 1.6 }}>
                    All packages are logged with timestamps. Residents must show ID or Flat Key for collection.
                  </Typography>
                </Paper>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 9 }}>
              <Stack spacing={4}>
                <TextField 
                  fullWidth
                  placeholder="Search by Flat ID or Carrier (e.g. Amazon)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={20} color={theme.palette.text.secondary} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 8, bgcolor: 'background.paper', boxShadow: 1 }
                  }}
                />

                {loading ? (
                  <Box sx={{ py: 10, textAlign: 'center' }}>
                    <CircularProgress size={40} sx={{ mb: 2 }} />
                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 2 }}>
                      Syncing with Gate Console...
                    </Typography>
                  </Box>
                ) : filteredPackages.length > 0 ? (
                  <Grid container spacing={3}>
                    {filteredPackages.map((pkg) => (
                      <Grid size={{ xs: 12, md: 6 }} key={pkg.id}>
                        <Card sx={{ 
                          borderRadius: 8, 
                          border: '1px solid', 
                          borderColor: 'divider',
                          transition: 'all 0.3s ease',
                          '&:hover': { boxShadow: 10, transform: 'translateY(-4px)' },
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          <Box sx={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, bgcolor: 'action.hover', borderRadius: '50%', filter: 'blur(20px)' }} />
                          <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ borderRadius: 4, bgcolor: 'action.hover', color: 'text.secondary' }}>
                                  <Truck size={24} />
                                </Avatar>
                                <Box>
                                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                                    {pkg.carrier}
                                  </Typography>
                                  <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', textTransform: 'uppercase' }}>
                                    {pkg.flatId}
                                  </Typography>
                                </Box>
                              </Box>
                              <Chip 
                                label={pkg.status === 'AT_GATE' ? 'At Gate' : 'Collected'} 
                                color={pkg.status === 'AT_GATE' ? 'warning' : 'success'}
                                size="small"
                                sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem' }}
                              />
                            </Box>

                            <Stack spacing={1.5} sx={{ mb: 3 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <User size={12} /> Resident
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 900 }}>
                                  {pkg.residentName}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Clock size={12} /> Received
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 900 }}>
                                  {new Date(pkg.receivedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                </Typography>
                              </Box>
                              {pkg.trackingNumber && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AlertCircle size={12} /> Tracking
                                  </Typography>
                                  <Typography variant="caption" sx={{ fontWeight: 900 }}>
                                    {pkg.trackingNumber}
                                  </Typography>
                                </Box>
                              )}
                            </Stack>

                            {pkg.status === 'AT_GATE' && (
                              <Button 
                                fullWidth 
                                variant="contained" 
                                color="inherit"
                                startIcon={<CheckCircle2 size={16} />}
                                onClick={() => handleCollect(pkg.id)}
                                sx={{ 
                                  bgcolor: 'grey.900', 
                                  color: 'white', 
                                  borderRadius: 4, 
                                  py: 1.5,
                                  fontWeight: 900,
                                  '&:hover': { bgcolor: 'primary.main' }
                                }}
                              >
                                Mark as Collected
                              </Button>
                            )}

                            {pkg.status === 'COLLECTED' && (
                              <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase' }}>
                                  Collected At
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                  {new Date(pkg.collectedAt).toLocaleString()}
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Paper sx={{ p: 10, textAlign: 'center', borderRadius: 10, border: '1px solid', borderColor: 'divider' }}>
                    <Avatar sx={{ width: 80, height: 80, bgcolor: 'action.hover', color: 'text.disabled', mx: 'auto', mb: 3, borderRadius: 6 }}>
                      <Package size={40} />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      No Packages Found
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, maxWidth: 300, mx: 'auto' }}>
                      {activeTab === 'pending' ? 'The hold area is currently empty. All deliveries are up to date!' : 'No historical delivery logs found.'}
                    </Typography>
                  </Paper>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Fade>

      <Dialog 
        open={showLogForm} 
        onClose={() => setShowLogForm(false)}
        PaperProps={{ sx: { borderRadius: 8, p: 2, maxWidth: 500, width: '100%' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>Log Delivery</Typography>
            <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
              Security Gate Console
            </Typography>
          </Box>
          <IconButton onClick={() => setShowLogForm(false)}>
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', ml: 2, mb: 0.5, display: 'block' }}>
                Flat ID
              </Typography>
              <TextField 
                fullWidth
                placeholder="e.g. A-1-101"
                value={formData.flatId}
                onChange={e => setFormData({...formData, flatId: e.target.value})}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MapPin size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 4, bgcolor: 'action.hover' }
                }}
              />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', ml: 2, mb: 0.5, display: 'block' }}>
                Carrier / App
              </Typography>
              <TextField 
                fullWidth
                placeholder="Amazon, Flipkart, Zomato..."
                value={formData.carrier}
                onChange={e => setFormData({...formData, carrier: e.target.value})}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Truck size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 4, bgcolor: 'action.hover' }
                }}
              />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', ml: 2, mb: 0.5, display: 'block' }}>
                Tracking / Order ID (Optional)
              </Typography>
              <TextField 
                fullWidth
                placeholder="Optional tracking number"
                value={formData.trackingNumber}
                onChange={e => setFormData({...formData, trackingNumber: e.target.value})}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AlertCircle size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 4, bgcolor: 'action.hover' }
                }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            fullWidth 
            variant="contained" 
            size="large"
            onClick={handleLogPackage}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Package size={18} />}
            sx={{ py: 2, borderRadius: 6, fontWeight: 900 }}
          >
            {loading ? 'Logging Arrival...' : 'Confirm Arrival'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Deliveries;
