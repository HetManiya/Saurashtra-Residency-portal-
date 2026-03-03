import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, Button, IconButton, 
  Avatar, Chip, CircularProgress, Paper, useTheme, 
  Fade, Stack, Divider, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  FormControl, InputLabel, Select, MenuItem, useMediaQuery
} from '@mui/material';
import { 
  Plus, Trash2, Edit3, Filter, PieChart, Wallet, 
  ShieldCheck, Trash, Brush, AlertCircle, CheckCircle, 
  X, ChevronDown, DollarSign, Calendar, Loader2, Home, Download, ShieldAlert, BadgeCheck
} from 'lucide-react';
import { api } from '../services/api';
import { EXPENSE_CATEGORIES, BUILDINGS } from '../constants';
import { useLanguage } from '../components/LanguageContext';

const Expenses: React.FC = () => {
  const { t } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    type: 'GARBAGE',
    payeeName: '',
    amount: '',
    status: 'Paid',
    details: {
      buildingName: '',
      remarks: ''
    }
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('sr_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    loadExpenses();
  }, [filterType]);

  const loadExpenses = async () => {
    setLoading(true);
    const filters = filterType === 'ALL' ? {} : { type: filterType };
    const data = await api.getExpenses(filters);
    setExpenses(data);
    setLoading(false);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.addExpense({
        ...formData,
        amount: parseFloat(formData.amount as string)
      });
      setShowAddModal(false);
      setFormData({ type: 'GARBAGE', payeeName: '', amount: '', status: 'Paid', details: { buildingName: '', remarks: '' } });
      await loadExpenses();
    } catch (err) {
      alert("Failed to log expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    const exportData = expenses.map(e => ({
      ID: e.id || e._id,
      Type: e.type,
      Payee: e.payeeName,
      Amount: e.amount,
      Status: e.status,
      Date: new Date(e.date || Date.now()).toLocaleDateString(),
      Details: e.details?.buildingName || 'Society Wide'
    }));
    api.exportToCSV(exportData, 'Saurashtra_Treasury_Report');
  };

  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'COMMITTEE';

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
              {t('saurashtra')} <Box component="span" sx={{ color: 'primary.main' }}>{t('treasury')}</Box>
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
              {t('exp_desc')}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button 
              variant="outlined" 
              color="inherit"
              startIcon={<Download size={16} />}
              onClick={handleExport}
              sx={{ 
                borderRadius: 6, px: 3, py: 1.5, 
                fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem',
                borderColor: 'divider', color: 'text.secondary',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              {t('export')}
            </Button>
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
                {t('exp_log_new')}
              </Button>
            )}
          </Stack>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} lg={3}>
            <Stack spacing={4}>
              <Paper sx={{ 
                p: 5, borderRadius: 10, 
                bgcolor: 'text.primary', color: 'background.paper',
                position: 'relative', overflow: 'hidden',
                boxShadow: 10
              }}>
                <Box sx={{ 
                  position: 'absolute', top: -40, right: -40, 
                  width: 160, height: 160, 
                  bgcolor: 'primary.main', borderRadius: '50%', 
                  opacity: 0.1, filter: 'blur(40px)' 
                }} />
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, color: 'primary.light', display: 'block', mb: 1 }}>
                    {t('total_exp')}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, tracking: '-0.04em', mb: 4 }}>
                    ₹{totalExpense.toLocaleString()}
                  </Typography>
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 3 }} />
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.disabled', letterSpacing: 1 }}>{t('active_records')}</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{expenses.length}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.disabled', letterSpacing: 1 }}>{t('awaiting_appr')}</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'error.light' }}>
                        ₹{expenses.filter(e => e.status === 'Pending').reduce((s, e) => s + e.amount, 0).toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Paper>

              <Paper sx={{ p: 4, borderRadius: 8, border: '1px solid', borderColor: 'divider', boxShadow: 0 }}>
                <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.disabled', letterSpacing: 1.5, display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Filter size={14} /> {t('exp_category')}
                </Typography>
                <Stack spacing={1}>
                  <Button 
                    fullWidth
                    onClick={() => setFilterType('ALL')}
                    sx={{ 
                      justifyContent: 'flex-start', px: 3, py: 1.5, 
                      borderRadius: 3, fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem',
                      bgcolor: filterType === 'ALL' ? 'primary.light' : 'transparent',
                      color: filterType === 'ALL' ? 'primary.main' : 'text.secondary',
                      '&:hover': { bgcolor: filterType === 'ALL' ? 'primary.light' : 'action.hover' }
                    }}
                  >
                    All Categories
                  </Button>
                  {EXPENSE_CATEGORIES.map(cat => (
                    <Button 
                      key={cat.id}
                      fullWidth
                      onClick={() => setFilterType(cat.id)}
                      sx={{ 
                        justifyContent: 'flex-start', px: 3, py: 1.5, 
                        borderRadius: 3, fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem',
                        bgcolor: filterType === cat.id ? 'primary.light' : 'transparent',
                        color: filterType === cat.id ? 'primary.main' : 'text.secondary',
                        '&:hover': { bgcolor: filterType === cat.id ? 'primary.light' : 'action.hover' }
                      }}
                    >
                      {cat.label}
                    </Button>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Grid>

          <Grid item xs={12} lg={9}>
            <TableContainer component={Paper} sx={{ borderRadius: 10, border: '1px solid', borderColor: 'divider', boxShadow: 0, overflow: 'hidden' }}>
              {loading ? (
                <Box sx={{ py: 20, textAlign: 'center' }}>
                  <CircularProgress size={40} sx={{ mb: 2 }} />
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 2 }}>
                    Loading Ledger...
                  </Typography>
                </Box>
              ) : (
                <Table>
                  <TableHead sx={{ bgcolor: 'action.hover' }}>
                    <TableRow>
                      <TableCell sx={{ px: 5, py: 3, fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', color: 'text.disabled', letterSpacing: 1.5 }}>Payee</TableCell>
                      <TableCell sx={{ px: 5, py: 3, fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', color: 'text.disabled', letterSpacing: 1.5 }}>Allocation</TableCell>
                      <TableCell sx={{ px: 5, py: 3, fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', color: 'text.disabled', letterSpacing: 1.5 }}>{t('amount')}</TableCell>
                      <TableCell sx={{ px: 5, py: 3, fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', color: 'text.disabled', letterSpacing: 1.5 }}>Workflow</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expenses.map((exp) => (
                      <TableRow key={exp.id || exp._id} sx={{ '&:hover': { bgcolor: 'action.hover' }, transition: 'all 0.2s ease' }}>
                        <TableCell sx={{ px: 5, py: 4 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 900, tracking: '-0.02em', mb: 0.5 }}>{exp.payeeName}</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.disabled', textTransform: 'uppercase', fontSize: '0.55rem', letterSpacing: 1 }}>{exp.type}</Typography>
                        </TableCell>
                        <TableCell sx={{ px: 5, py: 4 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                            {exp.details?.buildingName ? `Wing ${exp.details.buildingName}` : 'Society Wide'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ px: 5, py: 4 }}>
                          <Typography variant="h6" sx={{ fontWeight: 900 }}>₹{exp.amount.toLocaleString()}</Typography>
                        </TableCell>
                        <TableCell sx={{ px: 5, py: 4 }}>
                          <Chip 
                            label={exp.status} 
                            size="small" 
                            variant="outlined"
                            color={exp.status === 'Paid' ? 'success' : 'error'}
                            sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', borderRadius: 2 }} 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {expenses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ py: 10, textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase' }}>
                            No payout records found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </TableContainer>
          </Grid>
        </Grid>

        {/* Add Expense Modal */}
        <Dialog 
          open={showAddModal} 
          onClose={() => setShowAddModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 10, p: 0, overflow: 'hidden' } }}
        >
          <DialogTitle sx={{ p: 4, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, tracking: '-0.04em' }}>Log Payout</Typography>
            <IconButton onClick={() => setShowAddModal(false)}>
              <X size={24} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Stack spacing={3} component="form" onSubmit={handleAddExpense} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem', ml: 1, mt: -1 }}>Expense Category</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  label="Expense Category"
                  sx={{ borderRadius: 6, bgcolor: 'action.hover', fontWeight: 700 }}
                >
                  {EXPENSE_CATEGORIES.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.label}</MenuItem>)}
                </Select>
              </FormControl>

              <TextField 
                fullWidth 
                label="Payee / Vendor Name"
                placeholder="e.g. Surat Safai Agency"
                required
                value={formData.payeeName}
                onChange={(e) => setFormData({...formData, payeeName: e.target.value})}
                InputProps={{ sx: { borderRadius: 6, bgcolor: 'action.hover' } }}
                InputLabelProps={{ sx: { fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem' } }}
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField 
                    fullWidth 
                    label="Amount (₹)"
                    type="number"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    InputProps={{ sx: { borderRadius: 6, bgcolor: 'action.hover' } }}
                    InputLabelProps={{ sx: { fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem' } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.7rem', ml: 1, mt: -1 }}>Wing Allocation</InputLabel>
                    <Select
                      value={formData.details.buildingName}
                      onChange={(e) => setFormData({...formData, details: {...formData.details, buildingName: e.target.value}})}
                      label="Wing Allocation"
                      sx={{ borderRadius: 6, bgcolor: 'action.hover', fontWeight: 700 }}
                    >
                      <MenuItem value="">Society Wide</MenuItem>
                      {Array.from({length: 24}, (_, i) => `A-${i+1}`).map(w => <MenuItem key={w} value={w}>Wing {w}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Button 
                fullWidth 
                variant="contained" 
                size="large"
                disabled={isSubmitting}
                type="submit"
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <ShieldCheck size={18} />}
                sx={{ 
                  borderRadius: 8, py: 2, 
                  fontWeight: 900, textTransform: 'uppercase', 
                  letterSpacing: 1.5,
                  boxShadow: 10,
                  '&:active': { transform: 'scale(0.95)' }
                }}
              >
                Confirm & Log Payout
              </Button>
            </Stack>
          </DialogContent>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default Expenses;
