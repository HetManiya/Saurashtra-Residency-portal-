
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Box, Typography, Grid, Card, Button, IconButton, 
  LinearProgress, Avatar, Chip, Tooltip, CircularProgress,
  Paper, useTheme, Fade, Stack, Divider, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, InputAdornment,
  Alert, Stepper, Step, StepLabel, Tab, Tabs
} from '@mui/material';
import { 
  Download, Plus, Clock, X, CreditCard, Zap, Droplets, Smartphone, 
  ArrowRight, Share2, BellRing, Settings2, Mail, MessageSquare, 
  Loader2, CheckCircle, Home, Key, MessageCircle, Lock, Unlock, AlertCircle, FileText,
  History, Calendar, Users, Search, RefreshCw, ShieldCheck, Truck, Receipt, BrainCircuit
} from 'lucide-react';
import { SOCIETY_INFO, UTILITY_SUMMARY, BUILDINGS } from '../constants';
import { MaintenanceRecord, PaymentStatus, OccupancyType } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../components/LanguageContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'motion/react';

const CheckoutForm: React.FC<{ 
  clientSecret: string; 
  onSuccess: () => void; 
  onCancel: () => void;
  amount: number;
}> = ({ clientSecret, onSuccess, onCancel, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const theme = useTheme();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/#/maintenance?payment_success=true`,
      },
      redirect: 'if_required',
    });

    if (result.error) {
      setError(result.error.message || 'Payment failed');
      setProcessing(false);
    } else {
      if (result.paymentIntent?.status === 'succeeded') {
        onSuccess();
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 2, mb: 2, display: 'block' }}>
        Select Payment Method
      </Typography>
      
      <Stack direction="row" spacing={2} sx={{ mb: 4, overflowX: 'auto', pb: 1 }}>
        {[
          { name: 'GPay', icon: 'https://www.vectorlogo.zone/logos/google_pay/google_pay-icon.svg' },
          { name: 'Paytm', icon: 'https://www.vectorlogo.zone/logos/paytm/paytm-icon.svg' },
          { name: 'UPI', icon: 'https://www.vectorlogo.zone/logos/npci_upi/npci_upi-icon.svg' },
          { name: 'Cards', icon: <CreditCard size={20} /> }
        ].map((method, i) => (
          <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, minWidth: 64 }}>
            <Box sx={{ 
              width: 48, height: 48, 
              bgcolor: 'action.hover', 
              borderRadius: 4, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '1px solid',
              borderColor: 'divider'
            }}>
              {typeof method.icon === 'string' ? (
                <Box component="img" src={method.icon} sx={{ width: 24, height: 24 }} alt={method.name} />
              ) : method.icon}
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', fontSize: '0.6rem' }}>{method.name}</Typography>
          </Box>
        ))}
      </Stack>

      <Paper sx={{ p: 3, borderRadius: 6, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <PaymentElement />
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 4, fontWeight: 700 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={2}>
        <Button 
          fullWidth 
          variant="outlined" 
          onClick={onCancel}
          sx={{ py: 1.5, borderRadius: 4, fontWeight: 900, textTransform: 'uppercase' }}
        >
          Cancel
        </Button>
        <Button 
          fullWidth 
          variant="contained" 
          type="submit"
          disabled={!stripe || processing}
          sx={{ py: 1.5, borderRadius: 4, fontWeight: 900, textTransform: 'uppercase', boxShadow: 6 }}
        >
          {processing ? <CircularProgress size={20} color="inherit" /> : `Pay ₹${amount}`}
        </Button>
      </Stack>
    </Box>
  );
};

const Maintenance: React.FC = () => {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<'ALL' | PaymentStatus>('ALL');
  const [occupancyFilter, setOccupancyFilter] = useState<'ALL' | OccupancyType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [historyRecords, setHistoryRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [currentMonth] = useState('May');
  const [currentYear] = useState(2024);
  
  const [paymentOrder, setPaymentOrder] = useState<any>(null);
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [disputeHelp, setDisputeHelp] = useState<{ advice: string; transactionId: string } | null>(null);
  const [isGeneratingReminders, setIsGeneratingReminders] = useState(false);
  const [isSettingUpRecurring, setIsSettingUpRecurring] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [isCalculatingPenalties, setIsCalculatingPenalties] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'COMMITTEE';

  const loadAllData = useCallback(async (u: any, retries = 0) => {
    if (retries === 0) setLoading(true);
    try {
      if (u.role === 'ADMIN' || u.role === 'COMMITTEE') {
        const current = await api.getAllMaintenanceRecords(currentMonth, currentYear);
        setRecords(current);
        const history = await api.getAllMaintenanceRecords();
        setHistoryRecords(history.filter(h => !(h.month === currentMonth && h.year === currentYear)));
      } else {
        const myData = await api.getMaintenanceRecords(u.flatId);
        setRecords(myData.filter(r => r.month === currentMonth && r.year === currentYear));
        setHistoryRecords(myData.filter(r => !(r.month === currentMonth && r.year === currentYear)));
      }
      const isLockedVal = await api.isMonthLocked(currentMonth, currentYear);
      setIsLocked(isLockedVal);
      setLoading(false);
    } catch (e: any) {
      if (e.message === 'SERVER_STARTING' && retries < 5) {
        setTimeout(() => loadAllData(u, retries + 1), 2000);
        return;
      }
      setLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    const storedUser = localStorage.getItem('sr_user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    setUser(parsedUser);
    if (parsedUser) loadAllData(parsedUser);

    // Handle return from payment redirect
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment_success') === 'true') {
      alert("Payment Successful! Receipt generated.");
      // Clear the param
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    }
  }, [loadAllData]);

  const handleExport = () => {
    const dataToExport = activeTab === 'current' ? records : historyRecords;
    const exportData = dataToExport.map(r => ({
      Flat: r.flatId,
      Month: r.month,
      Year: r.year,
      Amount: r.amount,
      Status: r.status,
      Type: r.occupancyType,
      PaidDate: r.paidDate || 'N/A'
    }));
    api.exportToCSV(exportData, `Maintenance_${activeTab === 'current' ? 'Ledger' : 'History'}_${new Date().toISOString().split('T')[0]}`);
  };

  const handlePayStripe = async (record: MaintenanceRecord) => {
    if (isLocked || record.status === PaymentStatus.PAID) return;
    
    setIsProcessingPayment(true);
    try {
      const order = await api.createPaymentOrder(record.id);
      setStripePromise(loadStripe(order.publishableKey));
      setPaymentOrder({ ...order, recordId: record.id });
    } catch (e) {
      alert("Payment initialization failed. Please check your connection.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = async () => {
    if (!paymentOrder) return;
    try {
      await api.updateMaintenanceStatus(paymentOrder.recordId, PaymentStatus.PAID, new Date().toISOString());
      if (user) await loadAllData(user);
      setPaymentOrder(null);
      alert("Payment Successful! Your record has been updated.");
    } catch (e: any) {
      console.error("Manual status update error:", e);
      // Even if manual update fails, the webhook should handle it.
      // We still close the modal and refresh data.
      if (user) await loadAllData(user);
      setPaymentOrder(null);
      alert("Payment processed successfully. Your record will be updated shortly.");
    }
  };

  const getResidentPhone = (flatId: string) => {
    const parts = flatId.split('-');
    if (parts.length < 3) return '';
    const wingName = `${parts[0]}-${parts[1]}`;
    const unitNo = parts[2];
    
    const building = BUILDINGS.find(b => b.name === wingName);
    const flat = building?.flats?.find(f => f.unitNumber === unitNo);
    return flat?.members[0]?.phone.replace(/\D/g, '') || '';
  };

  const handleWhatsAppReminder = (record: MaintenanceRecord) => {
    const phone = getResidentPhone(record.flatId);
    const text = `*SAURASHTRA RESIDENCY REMINDER*%0A---------------------------%0A*Flat:* ${record.flatId}%0A*Period:* ${record.month} ${record.year}%0A*Amount Due:* ₹${record.amount}%0A*Status:* ${record.status}%0A---------------------------%0APlease pay your maintenance dues at the earliest convenience. If already paid, please ignore this message.%0A%0A_Generated via Residency Portal_`;
    
    const whatsappUrl = phone 
      ? `https://wa.me/${phone}?text=${text}`
      : `https://wa.me/?text=${text}`;
      
    window.open(whatsappUrl, '_blank');
  };

  const handleGenerateMonthly = async () => {
    if (!confirm(`Initialize ${currentMonth} ${currentYear} maintenance for all units?`)) return;
    setLoading(true);
    try {
      await api.generateMonthlyMaintenance(currentMonth, currentYear, SOCIETY_INFO.maintenanceAmount);
      if (user) await loadAllData(user);
    } catch (e) {
      alert("Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleShareWhatsApp = (record: MaintenanceRecord) => {
    const text = `*SAURASHTRA RESIDENCY RECEIPT*%0A---------------------------%0A*Flat:* ${record.flatId}%0A*Period:* ${record.month} ${record.year}%0A*Amount Paid:* ₹${record.amount}%0A*Status:* ${record.status}%0A*Date:* ${new Date().toLocaleDateString()}%0A---------------------------%0A_Generated via Residency Portal_`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleViewReceipt = async (record: MaintenanceRecord) => {
    setLoading(true);
    try {
      const receipt = await api.generateReceipt(record.id);
      setSelectedReceipt(receipt);
    } catch (e) {
      alert("Failed to load receipt.");
    } finally {
      setLoading(false);
    }
  };

  const handleCalculatePenalties = async () => {
    if (!confirm(`Apply ₹100 penalty to all pending records for ${currentMonth} ${currentYear}?`)) return;
    setIsCalculatingPenalties(true);
    try {
      await api.calculatePenalties(currentMonth, currentYear);
      if (user) await loadAllData(user);
      alert("Penalties applied successfully.");
    } catch (e) {
      alert("Penalty calculation failed.");
    } finally {
      setIsCalculatingPenalties(false);
    }
  };

  const handleLockMonth = async () => {
    if (confirm(`Finalize ${currentMonth} ${currentYear}? This locks all records for auditing.`)) {
      await api.lockMaintenanceMonth(currentMonth, currentYear, SOCIETY_INFO.maintenanceAmount);
      setIsLocked(true);
    }
  };

  const handleSetupRecurring = async () => {
    setIsSettingUpRecurring(true);
    try {
      const { url } = await api.setupRecurringPayments();
      window.location.href = url;
    } catch (e) {
      alert("Failed to setup recurring payments.");
    } finally {
      setIsSettingUpRecurring(false);
    }
  };

  const handleSendReminders = async () => {
    setIsGeneratingReminders(true);
    try {
      const data = await api.getReminders();
      alert(`Successfully generated ${data.count} reminders for pending bills.`);
    } catch (e) {
      alert("Failed to generate reminders.");
    } finally {
      setIsGeneratingReminders(false);
    }
  };

  const handleDisputeHelp = async (record: MaintenanceRecord) => {
    const reason = prompt("Please describe the issue with this payment:");
    if (!reason) return;

    setLoading(true);
    try {
      // For demo, we'll use a mock transaction ID if not available
      const advice = await api.getPaymentDisputeHelp(record.id, reason);
      setDisputeHelp({ advice: advice.advice, transactionId: record.id });
    } catch (e) {
      alert("AI assistance is currently unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID: return 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-900/20';
      case PaymentStatus.PENDING: return 'bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 border-amber-100/50 dark:border-amber-900/20';
      case PaymentStatus.OVERDUE: return 'bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 border-rose-100/50 dark:border-rose-900/20';
      default: return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-100/50 dark:border-slate-700';
    }
  };

  const filteredRecords = useMemo(() => {
    const source = activeTab === 'current' ? records : historyRecords;
    return source.filter(r => {
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchesOccupancy = occupancyFilter === 'ALL' || r.occupancyType === occupancyFilter;
      const matchesSearch = r.flatId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesOccupancy && matchesSearch;
    });
  }, [activeTab, records, historyRecords, statusFilter, occupancyFilter, searchQuery]);

  return (
    <Fade in={true}>
      <Box sx={{ pb: 8 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { md: 'center' }, 
          gap: 3, 
          mb: 6,
          pb: 4,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, tracking: '-0.04em' }}>
              {t('finance_hub')}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>
              {activeTab === 'current' 
                ? `Cycle: ${currentMonth} ${currentYear} • Total Units: ${records.length}` 
                : 'Audit & Historical Payment Logs'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            {isAdmin && activeTab === 'current' && records.length === 0 && (
              <Button 
                variant="contained" 
                color="success"
                startIcon={<RefreshCw size={18} />}
                onClick={handleGenerateMonthly}
                sx={{ borderRadius: 6, px: 4, py: 1.5, fontWeight: 900, textTransform: 'uppercase', boxShadow: 6 }}
              >
                Generate Cycle
              </Button>
            )}
            {isAdmin && activeTab === 'current' && records.length > 0 && (
              <Button 
                variant="contained" 
                color={isLocked ? "inherit" : "primary"}
                disabled={isLocked}
                startIcon={isLocked ? <Lock size={18} /> : <Unlock size={18} />}
                onClick={handleLockMonth}
                sx={{ borderRadius: 6, px: 4, py: 1.5, fontWeight: 900, textTransform: 'uppercase', boxShadow: isLocked ? 0 : 6 }}
              >
                {isLocked ? 'Cycle Locked' : 'Finalize Ledger'}
              </Button>
            )}
            {isAdmin && activeTab === 'current' && records.length > 0 && (
              <Button 
                variant="contained" 
                color="warning"
                disabled={isGeneratingReminders}
                startIcon={isGeneratingReminders ? <CircularProgress size={18} color="inherit" /> : <BellRing size={18} />}
                onClick={handleSendReminders}
                sx={{ borderRadius: 6, px: 4, py: 1.5, fontWeight: 900, textTransform: 'uppercase', boxShadow: 6 }}
              >
                Send Reminders
              </Button>
            )}
            {isAdmin && activeTab === 'current' && records.length > 0 && (
              <Button 
                variant="contained" 
                color="error"
                disabled={isCalculatingPenalties}
                startIcon={isCalculatingPenalties ? <CircularProgress size={18} color="inherit" /> : <Zap size={18} />}
                onClick={handleCalculatePenalties}
                sx={{ borderRadius: 6, px: 4, py: 1.5, fontWeight: 900, textTransform: 'uppercase', boxShadow: 6 }}
              >
                Apply Penalties
              </Button>
            )}
            {!isAdmin && (
              <Button 
                variant="contained" 
                color={user?.isRecurringEnabled ? "success" : "primary"}
                disabled={isSettingUpRecurring || user?.isRecurringEnabled}
                startIcon={isSettingUpRecurring ? <CircularProgress size={18} color="inherit" /> : <RefreshCw size={18} />}
                onClick={handleSetupRecurring}
                sx={{ borderRadius: 6, px: 4, py: 1.5, fontWeight: 900, textTransform: 'uppercase', boxShadow: 6 }}
              >
                {user?.isRecurringEnabled ? 'Recurring Active' : 'Enable Recurring'}
              </Button>
            )}
            <Button 
              variant="outlined" 
              startIcon={<Download size={18} />}
              onClick={handleExport}
              sx={{ borderRadius: 6, px: 4, py: 1.5, fontWeight: 900, textTransform: 'uppercase' }}
            >
              {t('export')}
            </Button>
          </Stack>
        </Box>

        <Grid container spacing={4}>
          <Grid size={12}>
            <Stack spacing={4}>
              <Paper sx={{ p: 3, borderRadius: 8, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ p: 1, display: 'flex', flexDirection: { xs: 'column', xl: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 3 }}>
                  <Box sx={{ display: 'flex', bgcolor: 'action.hover', p: 0.5, borderRadius: 4, width: { xs: '100%', xl: 'auto' }, overflowX: 'auto' }}>
                    <Button 
                      onClick={() => setActiveTab('current')} 
                      startIcon={<Calendar size={14} />}
                      sx={{ 
                        flex: { xs: 1, xl: 'none' },
                        px: 3, py: 1, borderRadius: 3, 
                        fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem',
                        bgcolor: activeTab === 'current' ? 'background.paper' : 'transparent',
                        color: activeTab === 'current' ? 'primary.main' : 'text.secondary',
                        boxShadow: activeTab === 'current' ? 2 : 0,
                        '&:hover': { bgcolor: activeTab === 'current' ? 'background.paper' : 'action.selected' }
                      }}
                    >
                      Current Ledger
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('history')} 
                      startIcon={<History size={14} />}
                      sx={{ 
                        flex: { xs: 1, xl: 'none' },
                        px: 3, py: 1, borderRadius: 3, 
                        fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem',
                        bgcolor: activeTab === 'history' ? 'background.paper' : 'transparent',
                        color: activeTab === 'history' ? 'primary.main' : 'text.secondary',
                        boxShadow: activeTab === 'history' ? 2 : 0,
                        '&:hover': { bgcolor: activeTab === 'history' ? 'background.paper' : 'action.selected' }
                      }}
                    >
                      History
                    </Button>
                  </Box>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', xl: 'auto' } }}>
                    <TextField 
                      size="small"
                      placeholder="Search Flat (e.g. A-1-101)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search size={16} />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 4, bgcolor: 'action.hover', fontSize: '0.75rem', fontWeight: 700 }
                      }}
                      sx={{ width: { sm: 260 } }}
                    />

                    <Box sx={{ display: 'flex', bgcolor: 'action.hover', p: 0.5, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                      {['ALL', OccupancyType.OWNER, OccupancyType.TENANT].map((o) => (
                        <Button
                          key={o}
                          size="small"
                          onClick={() => setOccupancyFilter(o as any)}
                          sx={{
                            px: 2, py: 0.5, borderRadius: 3,
                            fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem',
                            bgcolor: occupancyFilter === o ? 'background.paper' : 'transparent',
                            color: occupancyFilter === o ? 'primary.main' : 'text.secondary',
                            boxShadow: occupancyFilter === o ? 1 : 0,
                            '&:hover': { bgcolor: occupancyFilter === o ? 'background.paper' : 'action.selected' }
                          }}
                        >
                          {o}
                        </Button>
                      ))}
                    </Box>

                    {activeTab === 'current' && (
                      <Box sx={{ display: 'flex', bgcolor: 'action.hover', p: 0.5, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                        {['ALL', PaymentStatus.PAID, PaymentStatus.PENDING, PaymentStatus.OVERDUE].map((s) => (
                          <Button
                            key={s}
                            size="small"
                            onClick={() => setStatusFilter(s as any)}
                            sx={{
                              px: 2, py: 0.5, borderRadius: 3,
                              fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem',
                              bgcolor: statusFilter === s ? 'background.paper' : 'transparent',
                              color: statusFilter === s ? 'primary.main' : 'text.secondary',
                              boxShadow: statusFilter === s ? 1 : 0,
                              '&:hover': { bgcolor: statusFilter === s ? 'background.paper' : 'action.selected' }
                            }}
                          >
                            {s}
                          </Button>
                        ))}
                      </Box>
                    )}
                  </Stack>
                </Box>
              </Paper>

              <TableContainer component={Paper} sx={{ borderRadius: 8, border: '1px solid', borderColor: 'divider', boxShadow: 0, overflow: 'hidden' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ bgcolor: 'action.hover', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 1, py: 3 }}>{t('unit')}</TableCell>
                      <TableCell sx={{ bgcolor: 'action.hover', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 1, py: 3 }}>Type</TableCell>
                      {activeTab === 'history' && <TableCell sx={{ bgcolor: 'action.hover', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 1, py: 3 }}>Period</TableCell>}
                      <TableCell sx={{ bgcolor: 'action.hover', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 1, py: 3 }}>{t('amount')}</TableCell>
                      <TableCell sx={{ bgcolor: 'action.hover', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 1, py: 3 }}>Status</TableCell>
                      <TableCell align="right" sx={{ bgcolor: 'action.hover', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 1, py: 3 }}>{t('actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                          <CircularProgress size={32} sx={{ mb: 2 }} />
                          <Typography variant="caption" sx={{ display: 'block', fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 2 }}>
                            Loading Cloud Data...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : filteredRecords.length > 0 ? (
                      filteredRecords.map((record) => (
                        <TableRow key={record.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell sx={{ py: 2.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ width: 36, height: 36, borderRadius: 3, bgcolor: 'primary.light', color: 'primary.main', fontWeight: 900, fontSize: '0.8rem' }}>
                                {record.flatId.split('-').pop()}
                              </Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 900 }}>{record.flatId}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 2.5 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              {record.occupancyType === OccupancyType.OWNER ? <Key size={12} style={{ color: '#10b981' }} /> : <Users size={12} style={{ color: '#3b82f6' }} />}
                              <Typography variant="caption" sx={{ 
                                fontWeight: 900, 
                                textTransform: 'uppercase', 
                                color: record.occupancyType === OccupancyType.OWNER ? 'success.main' : 'info.main',
                                fontSize: '0.6rem'
                              }}>
                                {record.occupancyType}
                              </Typography>
                            </Stack>
                          </TableCell>
                          {activeTab === 'history' && (
                            <TableCell sx={{ py: 2.5 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>{record.month} {record.year}</Typography>
                              {record.paidDate && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{new Date(record.paidDate).toLocaleDateString()}</Typography>}
                            </TableCell>
                          )}
                          <TableCell sx={{ py: 2.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 900 }}>₹{record.amount}</Typography>
                            {record.penaltyAmount && record.penaltyAmount > 0 && (
                              <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 900, fontSize: '0.6rem', display: 'block' }}>
                                + ₹{record.penaltyAmount} Penalty
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ py: 2.5 }}>
                            <Chip 
                              label={record.status} 
                              size="small"
                              sx={{ 
                                fontWeight: 900, 
                                textTransform: 'uppercase', 
                                fontSize: '0.6rem',
                                borderRadius: 2,
                                border: '2px solid',
                                bgcolor: record.status === PaymentStatus.PAID ? 'success.light' : (record.status === PaymentStatus.OVERDUE ? 'error.light' : 'warning.light'),
                                color: record.status === PaymentStatus.PAID ? 'success.main' : (record.status === PaymentStatus.OVERDUE ? 'error.main' : 'warning.main'),
                                borderColor: 'currentColor',
                                opacity: 0.8
                              }} 
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ py: 2.5 }}>
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              {record.status === PaymentStatus.PAID ? (
                                <>
                                  <Button 
                                    size="small" 
                                    variant="outlined"
                                    startIcon={<FileText size={12} />}
                                    onClick={() => handleViewReceipt(record)}
                                    sx={{ borderRadius: 3, fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', py: 0.5 }}
                                  >
                                    {t('receipt')}
                                  </Button>
                                  <IconButton size="small" color="success" onClick={() => handleShareWhatsApp(record)}>
                                    <Share2 size={14} />
                                  </IconButton>
                                  <IconButton size="small" color="error" onClick={() => handleDisputeHelp(record)}>
                                    <AlertCircle size={14} />
                                  </IconButton>
                                </>
                              ) : (
                                <>
                                  {(activeTab === 'current' || record.status === PaymentStatus.OVERDUE) && !isLocked && (
                                    <Button 
                                      variant="contained" 
                                      size="small"
                                      startIcon={isProcessingPayment ? <CircularProgress size={12} color="inherit" /> : <CreditCard size={12} />}
                                      onClick={() => handlePayStripe(record)}
                                      disabled={isProcessingPayment}
                                      sx={{ borderRadius: 4, fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem', boxShadow: 4 }}
                                    >
                                      {t('pay_now')}
                                    </Button>
                                  )}
                                  {isAdmin && (
                                    <IconButton size="small" color="success" onClick={() => handleWhatsAppReminder(record)} sx={{ border: '1px solid', borderColor: 'success.light' }}>
                                      <MessageCircle size={14} />
                                    </IconButton>
                                  )}
                                </>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                          <AlertCircle size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
                          <Typography variant="body2" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase' }}>
                            No records found matching your filters.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Paper sx={{ p: 3, bgcolor: 'action.hover', borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '0 0 32px 32px' }}>
                <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Showing {filteredRecords.length} units
                </Typography>
                <Stack direction="row" spacing={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ w: 8, h: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                    <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.6rem' }}>
                      Paid: {filteredRecords.filter(r => r.status === PaymentStatus.PAID).length}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ w: 8, h: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                    <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.6rem' }}>
                      Pending: {filteredRecords.filter(r => r.status === PaymentStatus.PENDING).length}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        {/* Modals */}
        <Dialog 
          open={!!paymentOrder} 
          onClose={() => setPaymentOrder(null)}
          PaperProps={{ sx: { borderRadius: 8, p: 2, maxWidth: 450, width: '100%', border: '1px solid', borderColor: 'divider' } }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>Checkout</Typography>
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>Secure Society Payments</Typography>
            </Box>
            <IconButton onClick={() => setPaymentOrder(null)}>
              <X size={20} />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {paymentOrder && (
              <>
                <Paper sx={{ p: 3, bgcolor: 'primary.light', color: 'primary.main', borderRadius: 4, border: '1px solid', borderColor: 'primary.main', mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 900 }}>Total Amount</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>₹{paymentOrder.amount}</Typography>
                </Paper>
                <Elements stripe={stripePromise} options={{ clientSecret: paymentOrder.clientSecret }}>
                  <CheckoutForm 
                    clientSecret={paymentOrder.clientSecret}
                    amount={paymentOrder.amount}
                    onSuccess={handlePaymentSuccess}
                    onCancel={() => setPaymentOrder(null)}
                  />
                </Elements>
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4, opacity: 0.5, filter: 'grayscale(1)' }}>
                  <Box component="img" src="https://www.vectorlogo.zone/logos/visa/visa-icon.svg" sx={{ h: 16 }} />
                  <Box component="img" src="https://www.vectorlogo.zone/logos/mastercard/mastercard-icon.svg" sx={{ h: 16 }} />
                  <Box component="img" src="https://www.vectorlogo.zone/logos/npci_upi/npci_upi-icon.svg" sx={{ h: 16 }} />
                </Stack>
              </>
            )}
          </DialogContent>
        </Dialog>

        <Dialog 
          open={!!selectedReceipt} 
          onClose={() => setSelectedReceipt(null)}
          PaperProps={{ sx: { borderRadius: 10, p: 4, maxWidth: 600, width: '100%', overflow: 'hidden' } }}
        >
          <DialogContent sx={{ p: 0, position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, bgcolor: 'primary.main', opacity: 0.05, borderRadius: '50%', filter: 'blur(40px)' }} />
            {selectedReceipt && (
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 6 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main', borderRadius: 4, boxShadow: 6 }}>
                      <ShieldCheck size={24} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, tracking: '-0.02em' }}>{selectedReceipt.societyName}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>Official Payment Receipt</Typography>
                    </Box>
                  </Stack>
                  <IconButton onClick={() => setSelectedReceipt(null)}>
                    <X size={20} />
                  </IconButton>
                </Box>

                <Stack spacing={4}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 4, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, mb: 0.5, display: 'block' }}>Receipt No</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 900 }}>{selectedReceipt.receiptNo}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, mb: 0.5, display: 'block' }}>Date</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 900 }}>{new Date(selectedReceipt.paidDate).toLocaleDateString()}</Typography>
                    </Box>
                  </Box>

                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Unit Number</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 900 }}>{selectedReceipt.flatId}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Billing Period</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 900 }}>{selectedReceipt.period}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Base Amount</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 900 }}>₹{selectedReceipt.amount}</Typography>
                    </Box>
                    {selectedReceipt.penalty > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Penalty Charges</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 900, color: 'error.main' }}>₹{selectedReceipt.penalty}</Typography>
                      </Box>
                    )}
                  </Stack>

                  <Paper sx={{ p: 4, bgcolor: 'action.hover', borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>Total Paid</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', tracking: '-0.04em' }}>₹{selectedReceipt.total}</Typography>
                    </Box>
                  </Paper>

                  <Box sx={{ textAlign: 'center' }}>
                    <Chip 
                      icon={<CheckCircle size={14} />} 
                      label="Payment Verified" 
                      color="success" 
                      sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem', mb: 2 }} 
                    />
                    <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 500, maxWidth: 240, mx: 'auto' }}>
                      This is a computer-generated receipt and does not require a physical signature.
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={2}>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      startIcon={<Download size={18} />}
                      onClick={() => window.print()}
                      sx={{ py: 1.5, borderRadius: 4, fontWeight: 900, textTransform: 'uppercase' }}
                    >
                      Print PDF
                    </Button>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="success"
                      startIcon={<Share2 size={18} />}
                      onClick={() => handleShareWhatsApp({ ...selectedReceipt, amount: selectedReceipt.total } as any)}
                      sx={{ py: 1.5, borderRadius: 4, fontWeight: 900, textTransform: 'uppercase' }}
                    >
                      Share
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            )}
          </DialogContent>
        </Dialog>

        <Dialog 
          open={!!disputeHelp} 
          onClose={() => setDisputeHelp(null)}
          PaperProps={{ sx: { borderRadius: 8, p: 3, maxWidth: 650, width: '100%', border: '1px solid', borderColor: 'divider' } }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: 'error.light', color: 'error.main', borderRadius: 4 }}>
                <Zap size={24} />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>AI Dispute Resolution</Typography>
                <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>Powered by Gemini AI</Typography>
              </Box>
            </Stack>
            <IconButton onClick={() => setDisputeHelp(null)}>
              <X size={20} />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Paper sx={{ p: 4, bgcolor: 'action.hover', borderRadius: 6, border: '1px solid', borderColor: 'divider', mt: 2 }}>
              <Typography variant="body2" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'text.primary' }}>
                {disputeHelp?.advice}
              </Typography>
            </Paper>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              fullWidth 
              variant="outlined" 
              onClick={() => setDisputeHelp(null)}
              sx={{ py: 1.5, borderRadius: 4, fontWeight: 900, textTransform: 'uppercase' }}
            >
              Close
            </Button>
            <Button 
              fullWidth 
              variant="contained" 
              onClick={() => window.location.href = 'mailto:committee@residency.com'}
              sx={{ py: 1.5, borderRadius: 4, fontWeight: 900, textTransform: 'uppercase' }}
            >
              Contact Committee
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default Maintenance;
