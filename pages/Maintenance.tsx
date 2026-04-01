
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Download, Plus, Clock, X, CreditCard, Zap, Droplets, Smartphone, 
  ArrowRight, Share2, BellRing, Settings2, Mail, MessageSquare, 
  Loader2, CheckCircle, Home, Key, MessageCircle, Lock, Unlock, AlertCircle, FileText,
  History, Calendar, Users, Search, RefreshCw, ShieldCheck
} from 'lucide-react';
import { SOCIETY_INFO, UTILITY_SUMMARY, BUILDINGS } from '../constants';
import { MaintenanceRecord, PaymentStatus, OccupancyType } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../components/LanguageContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Fuse from 'fuse.js';

const CheckoutForm: React.FC<{ 
  clientSecret: string; 
  onSuccess: (id: string) => void; 
  onCancel: () => void;
  amount: number;
  recordId: string;
}> = ({ clientSecret, onSuccess, onCancel, amount, recordId }) => {
  const { t } = useLanguage();
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'upi' | 'bank'>('stripe');
  const [referenceNumber, setReferenceNumber] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (paymentMethod === 'stripe') {
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
        setError(result.error.message || t('payment_failed'));
        setProcessing(false);
      } else {
        if (result.paymentIntent?.status === 'succeeded') {
          onSuccess(result.paymentIntent.id);
        }
      }
    } else {
      if (!referenceNumber.trim()) {
        setError('Reference number is required');
        return;
      }
      setProcessing(true);
      try {
        await api.submitManualPayment(recordId, paymentMethod === 'upi' ? 'UPI' : 'BANK_TRANSFER', referenceNumber);
        onSuccess('manual');
      } catch (err: any) {
        setError(err.message || 'Payment submission failed');
        setProcessing(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-6">
        <p className="text-[10px] font-bold text-slate-400 tracking-wider mb-4">{t('select_payment_method')}</p>
        <div className="flex items-center gap-4 mb-4 overflow-x-auto pb-2 custom-scrollbar">
          <button 
            type="button"
            onClick={() => setPaymentMethod('stripe')}
            className={`flex flex-col items-center gap-1 min-w-[60px] ${paymentMethod === 'stripe' ? 'opacity-100' : 'opacity-50'}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${paymentMethod === 'stripe' ? 'bg-brand-50 border-brand-500 text-brand-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
              <CreditCard size={20} />
            </div>
            <span className="text-[8px] font-bold text-slate-500">Cards</span>
          </button>
          <button 
            type="button"
            onClick={() => setPaymentMethod('upi')}
            className={`flex flex-col items-center gap-1 min-w-[60px] ${paymentMethod === 'upi' ? 'opacity-100' : 'opacity-50'}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${paymentMethod === 'upi' ? 'bg-brand-50 border-brand-500 text-brand-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
              <img src="https://www.vectorlogo.zone/logos/npci_upi/npci_upi-icon.svg" className="w-6 h-6" alt="UPI" />
            </div>
            <span className="text-[8px] font-bold text-slate-500">UPI</span>
          </button>
          <button 
            type="button"
            onClick={() => setPaymentMethod('bank')}
            className={`flex flex-col items-center gap-1 min-w-[60px] ${paymentMethod === 'bank' ? 'opacity-100' : 'opacity-50'}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${paymentMethod === 'bank' ? 'bg-brand-50 border-brand-500 text-brand-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
              <Home size={20} />
            </div>
            <span className="text-[8px] font-bold text-slate-500">Bank</span>
          </button>
        </div>
      </div>

      {paymentMethod === 'stripe' && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <PaymentElement />
        </div>
      )}

      {paymentMethod === 'upi' && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex justify-center">
            <div className="w-32 h-32 bg-white rounded-xl border-2 border-slate-200 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-400">QR Code</span>
            </div>
          </div>
          <p className="text-center text-xs font-bold text-slate-500">UPI ID: saurashtra@upi</p>
          <div>
            <label className="text-[10px] font-bold text-slate-400 tracking-wider mb-2 block">Reference Number (UTR)</label>
            <input 
              type="text" 
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. 123456789012"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
            />
          </div>
        </div>
      )}

      {paymentMethod === 'bank' && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Bank Name:</span><span className="font-bold">HDFC Bank</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Account Name:</span><span className="font-bold">Saurashtra Residency</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Account No:</span><span className="font-bold">50100123456789</span></div>
            <div className="flex justify-between"><span className="text-slate-500">IFSC Code:</span><span className="font-bold">HDFC0001234</span></div>
          </div>
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <label className="text-[10px] font-bold text-slate-400 tracking-wider mb-2 block">Transaction Reference Number</label>
            <input 
              type="text" 
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. IMPS/NEFT Ref No"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
            />
          </div>
        </div>
      )}

      {error && <div className="text-red-500 text-[10px] font-bold tracking-wider">{error}</div>}
      <div className="flex gap-3">
        <button 
          type="button" 
          onClick={onCancel}
          className="flex-1 py-4 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold tracking-wider text-[10px] hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          aria-label={t('cancel')}
        >
          {t('cancel')}
        </button>
        <button 
          type="submit" 
          disabled={(paymentMethod === 'stripe' && !stripe) || processing}
          className="flex-1 py-4 bg-brand-600 text-white rounded-2xl font-bold tracking-wider text-[10px] shadow-lg shadow-brand-600/20 hover:bg-brand-700 transition-all disabled:opacity-50"
          aria-label={processing ? t('processing') : `${t('pay_now')} ₹${amount}`}
        >
          {processing ? t('processing') : `${t('pay_now')} ₹${amount}`}
        </button>
      </div>
    </form>
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
    
    // Only update user if it changed to prevent re-renders
    if (JSON.stringify(parsedUser) !== JSON.stringify(user)) {
      setUser(parsedUser);
    }
    
    if (parsedUser) {
      loadAllData(parsedUser);
    }

    // Handle return from payment redirect
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment_success') === 'true') {
      alert("Payment Successful! Receipt generated.");
      // Clear the param
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      alert(t('payment_init_failed'));
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!paymentOrder) return;
    try {
      if (paymentIntentId !== 'manual') {
        await api.verifyPayment(paymentIntentId);
      }
      if (user) await loadAllData(user);
      setPaymentOrder(null);
      alert(t('payment_success_msg'));
    } catch (e: any) {
      console.error("Verification error:", e);
      // Even if verification fails here, the webhook should handle it eventually.
      if (user) await loadAllData(user);
      setPaymentOrder(null);
      alert(t('payment_processed_shortly'));
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
      case PaymentStatus.PAID: return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case PaymentStatus.PENDING: return 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case PaymentStatus.OVERDUE: return 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800';
      default: return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const filteredRecords = useMemo(() => {
    let source = activeTab === 'current' ? records : historyRecords;
    
    // Apply filters first
    source = source.filter(r => {
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchesOccupancy = occupancyFilter === 'ALL' || r.occupancyType === occupancyFilter;
      return matchesStatus && matchesOccupancy;
    });

    if (!searchQuery.trim()) return source;

    const fuse = new Fuse(source, {
      keys: ['flatId', 'status', 'occupancyType'],
      threshold: 0.3,
    });

    return fuse.search(searchQuery).map(result => result.item);
  }, [activeTab, records, historyRecords, statusFilter, occupancyFilter, searchQuery]);

  return (
    <div className="space-y-10 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{t('bills')}</h1>
          <p className="text-brand-600 mt-2 font-bold tracking-wider text-xs uppercase">
            {t('finance_hub')}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {isAdmin && activeTab === 'current' && records.length === 0 && (
            <button 
              onClick={handleGenerateMonthly}
              className="flex items-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-bold tracking-wider text-[11px] shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
              aria-label={t('generate_cycle')}
            >
              <RefreshCw size={16} /> {t('generate_cycle')}
            </button>
          )}
          {isAdmin && activeTab === 'current' && records.length > 0 && (
            <button 
              onClick={handleLockMonth}
              disabled={isLocked}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold tracking-wider text-[11px] transition-all ${
                isLocked 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed' 
                  : 'bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700'
              }`}
              aria-label={isLocked ? t('lock_month') : t('lock_month')}
            >
              {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
              {isLocked ? t('lock_month') : t('lock_month')}
            </button>
          )}
          {isAdmin && activeTab === 'current' && records.length > 0 && (
            <button 
              onClick={handleSendReminders}
              disabled={isGeneratingReminders}
              className="flex items-center gap-2 px-6 py-4 bg-amber-500 text-white rounded-2xl font-bold tracking-wider text-[11px] shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all disabled:opacity-50"
              aria-label={t('send_reminders')}
            >
              {isGeneratingReminders ? <Loader2 size={16} className="animate-spin" /> : <BellRing size={16} />}
              {t('send_reminders')}
            </button>
          )}
          {isAdmin && activeTab === 'current' && records.length > 0 && (
            <button 
              onClick={handleCalculatePenalties}
              disabled={isCalculatingPenalties}
              className="flex items-center gap-2 px-6 py-4 bg-red-500 text-white rounded-2xl font-bold tracking-wider text-[11px] shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all disabled:opacity-50"
              aria-label={t('apply_penalties')}
            >
              {isCalculatingPenalties ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              {t('apply_penalties')}
            </button>
          )}
          {!isAdmin && (
            <button 
              onClick={handleSetupRecurring}
              disabled={isSettingUpRecurring || user?.isRecurringEnabled}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold tracking-wider text-[11px] transition-all disabled:opacity-50 ${
                user?.isRecurringEnabled 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 cursor-default' 
                  : 'bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700'
              }`}
              aria-label={user?.isRecurringEnabled ? t('recurring_active') : t('enable_recurring')}
            >
              {isSettingUpRecurring ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              {user?.isRecurringEnabled ? t('recurring_active') : t('enable_recurring')}
            </button>
          )}
          <button 
            onClick={handleExport} 
            className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-[10px] tracking-wider text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            aria-label={t('export')}
          >
            <Download size={18} /> {t('export')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200 dark:shadow-none overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col xl:flex-row justify-between items-center gap-6">
              <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl w-full xl:w-auto overflow-x-auto shrink-0">
                <button 
                  onClick={() => setActiveTab('current')} 
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-bold tracking-wider transition-all whitespace-nowrap ${activeTab === 'current' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                  aria-label={t('current_ledger')}
                  aria-pressed={activeTab === 'current'}
                >
                  <Calendar size={14} /> {t('current_ledger')}
                </button>
                <button 
                  onClick={() => setActiveTab('history')} 
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-bold tracking-wider transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                  aria-label={t('history')}
                  aria-pressed={activeTab === 'history'}
                >
                  <History size={14} /> {t('history')}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder={t('search_unit')}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-bold tracking-wider text-slate-900 dark:text-white outline-none focus:border-brand-500 placeholder:text-slate-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
                  {['ALL', OccupancyType.OWNER, OccupancyType.TENANT].map((o) => (
                    <button 
                      key={o} 
                      onClick={() => setOccupancyFilter(o as any)} 
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[9px] font-bold tracking-wider transition-all whitespace-nowrap ${occupancyFilter === o ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                      aria-label={`${t('filter_by')} ${o}`}
                      aria-pressed={occupancyFilter === o}
                    >
                      {o === 'ALL' ? t('all') : o === OccupancyType.OWNER ? t('owner') : t('tenant')}
                    </button>
                  ))}
                </div>

                {activeTab === 'current' && (
                  <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
                    {['ALL', PaymentStatus.PAID, PaymentStatus.PENDING, PaymentStatus.OVERDUE].map((s) => (
                      <button 
                        key={s} 
                        onClick={() => setStatusFilter(s as any)} 
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[9px] font-bold tracking-wider transition-all whitespace-nowrap ${statusFilter === s ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        aria-label={`${t('filter_by')} ${s}`}
                        aria-pressed={statusFilter === s}
                      >
                        {s === 'ALL' ? t('all') : s === PaymentStatus.PAID ? t('paid') : s === PaymentStatus.PENDING ? t('pending') : t('overdue')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center"><Loader2 className="animate-spin text-brand-600 mb-2" /><p className="text-[10px] font-bold text-slate-400 tracking-wider">{t('fetching_data')}</p></div>
              ) : (
                <table className="w-full text-left">
                  <thead className="sticky top-0 z-20 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-10 py-6 text-[10px] font-bold text-slate-400 tracking-wider">{t('unit')}</th>
                      <th className="px-10 py-6 text-[10px] font-bold text-slate-400 tracking-wider">{t('type')}</th>
                      {activeTab === 'history' && <th className="px-10 py-6 text-[10px] font-bold text-slate-400 tracking-wider">{t('period')}</th>}
                      <th className="px-10 py-6 text-[10px] font-bold text-slate-400 tracking-wider">{t('amount')}</th>
                      <th className="px-10 py-6 text-[10px] font-bold text-slate-400 tracking-wider">{t('status')}</th>
                      <th className="px-10 py-6 text-[10px] font-bold text-slate-400 tracking-wider text-right">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-sm">{record.flatId.split('-').pop()}</div>
                            <span className="font-bold text-slate-900 dark:text-white tracking-tight">{record.flatId}</span>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-2">
                             {record.occupancyType === OccupancyType.OWNER ? <Key size={12} className="text-emerald-500" /> : <Users size={12} className="text-blue-500" />}
                             <span className={`text-[10px] font-bold tracking-wider ${record.occupancyType === OccupancyType.OWNER ? 'text-emerald-500' : 'text-blue-500'}`}>
                               {record.occupancyType === OccupancyType.OWNER ? t('owner') : t('tenant')}
                             </span>
                          </div>
                        </td>
                        {activeTab === 'history' && (
                          <td className="px-10 py-6">
                            <div className="flex flex-col">
                              <span className="font-bold text-[10px] text-slate-600 dark:text-slate-400">{record.month} {record.year}</span>
                              {record.paidDate && <span className="text-[8px] text-slate-400 font-bold tracking-wider">{new Date(record.paidDate).toLocaleDateString()}</span>}
                            </div>
                          </td>
                        )}
                        <td className="px-10 py-6 font-bold text-slate-900 dark:text-white">
                          <div className="flex flex-col">
                            <span className="text-sm">₹{record.amount}</span>
                            {record.penaltyAmount > 0 && (
                              <span className="text-[9px] text-red-500 font-bold tracking-wider">+ ₹{record.penaltyAmount} {t('penalty')}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold tracking-wider border ${getStatusStyle(record.status)}`}>
                            {record.status === PaymentStatus.PAID ? t('paid') : record.status === PaymentStatus.PENDING ? t('pending') : t('overdue')}
                          </span>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center justify-end gap-2">
                            {record.status === PaymentStatus.PAID ? (
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleViewReceipt(record)}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-[9px] font-bold tracking-wider hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                                  aria-label={`${t('receipt')}: ${record.month} ${record.year}`}
                                >
                                  <FileText size={12} /> {t('receipt')}
                                </button>
                                <button 
                                  onClick={() => handleShareWhatsApp(record)} 
                                  className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all" 
                                  title={t('share')}
                                  aria-label={`${t('share')} ${t('receipt')} ${record.month} ${record.year}`}
                                >
                                  <Share2 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDisputeHelp(record)}
                                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all" 
                                  title={t('support')}
                                  aria-label={`${t('support')} ${record.month} ${record.year}`}
                                >
                                  <AlertCircle size={14} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                {(activeTab === 'current' || record.status === PaymentStatus.OVERDUE) && !isLocked && (
                                  <button 
                                    onClick={() => handlePayStripe(record)}
                                    disabled={isProcessingPayment}
                                    className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-[9px] font-bold tracking-wider hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20"
                                    aria-label={`${t('pay_now')}: ${record.month} ${record.year}`}
                                  >
                                    {isProcessingPayment ? <Loader2 size={12} className="animate-spin" /> : <CreditCard size={12} />} 
                                    {t('pay_now')}
                                  </button>
                                )}
                                {isAdmin && (
                                  <button 
                                    onClick={() => handleWhatsAppReminder(record)}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-[9px] font-bold tracking-wider hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                                    title={t('whatsapp_reminder')}
                                    aria-label={`${t('whatsapp_reminder')} ${record.flatId}`}
                                  >
                                    <MessageCircle size={12} />
                                    {t('whatsapp_reminder')}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {!loading && filteredRecords.length === 0 && (
                <div className="p-20 text-center">
                   <AlertCircle className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                   <p className="text-slate-400 font-bold tracking-wider text-[10px]">{t('no_records_found')}</p>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <p className="text-[10px] font-bold text-slate-400 tracking-wider">
                {t('showing')} {filteredRecords.length} {t('units')}
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[9px] font-bold text-slate-500">{t('paid')}: {filteredRecords.filter(r => r.status === PaymentStatus.PAID).length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-[9px] font-bold text-slate-500">{t('pending')}: {filteredRecords.filter(r => r.status === PaymentStatus.PENDING).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {paymentOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setPaymentOrder(null)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{t('checkout')}</h3>
                <p className="text-[10px] font-bold text-brand-600 tracking-wider">{t('secure_payment')}</p>
              </div>
              <button 
                onClick={() => setPaymentOrder(null)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                aria-label={t('close_checkout')}
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider">{t('total_amount')}</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">₹{paymentOrder.amount}</span>
              </div>
            </div>
            
            {stripePromise && (
              <Elements stripe={stripePromise} options={{ clientSecret: paymentOrder.clientSecret }}>
                <CheckoutForm 
                  clientSecret={paymentOrder.clientSecret} 
                  amount={paymentOrder.amount}
                  recordId={paymentOrder.recordId}
                  onSuccess={handlePaymentSuccess}
                  onCancel={() => setPaymentOrder(null)}
                />
              </Elements>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-4 opacity-50">
              <img src="https://www.vectorlogo.zone/logos/visa/visa-icon.svg" className="h-4" alt="Visa" />
              <img src="https://www.vectorlogo.zone/logos/mastercard/mastercard-icon.svg" className="h-4" alt="Mastercard" />
              <img src="https://www.vectorlogo.zone/logos/npci_upi/npci_upi-icon.svg" className="h-4" alt="UPI" />
            </div>
          </div>
        </div>
      )}

      {selectedReceipt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedReceipt(null)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-10 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/5 rounded-full blur-3xl -mr-20 -mt-20" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-600/20">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{selectedReceipt.societyName}</h3>
                    <p className="text-[9px] font-bold text-brand-600 tracking-wider">{t('payment_receipt')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedReceipt(null)} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  aria-label={t('close_receipt')}
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 tracking-wider mb-1">{t('receipt_no')}</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedReceipt.receiptNo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-400 tracking-wider mb-1">{t('date')}</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{new Date(selectedReceipt.paidDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">{t('unit_number')}</span>
                    <span className="text-[10px] font-bold text-slate-900 dark:text-white">{selectedReceipt.flatId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">{t('billing_period')}</span>
                    <span className="text-[10px] font-bold text-slate-900 dark:text-white">{selectedReceipt.period}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">{t('base_amount')}</span>
                    <span className="text-[10px] font-bold text-slate-900 dark:text-white">₹{selectedReceipt.amount}</span>
                  </div>
                  {selectedReceipt.penalty > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider">{t('penalty_charges')}</span>
                      <span className="text-[10px] font-bold text-red-500">₹{selectedReceipt.penalty}</span>
                    </div>
                  )}
                </div>

                <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-brand-600 tracking-wider">{t('total_paid')}</span>
                    <span className="text-2xl font-bold text-brand-600 tracking-tight">₹{selectedReceipt.total}</span>
                  </div>
                </div>

                <div className="pt-6 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle size={14} /> {t('payment_verified')}
                  </div>
                  <p className="mt-4 text-[8px] text-slate-400 font-bold tracking-wider max-w-[200px] mx-auto">
                    {t('receipt_footer')}
                  </p>
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={() => window.print()}
                    className="flex-1 py-4 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold tracking-wider text-[10px] flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                    aria-label={t('print_pdf_aria')}
                  >
                    <Download size={14} /> {t('print_pdf')}
                  </button>
                  <button 
                    onClick={() => handleShareWhatsApp({ ...selectedReceipt, amount: selectedReceipt.total } as any)}
                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold tracking-wider text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                    aria-label={t('share_whatsapp_aria')}
                  >
                    <Share2 size={14} /> {t('share')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {disputeHelp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDisputeHelp(null)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl p-8 shadow-2xl border border-rose-200 dark:border-rose-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 shadow-sm">
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-red-600">{t('ai_dispute_resolution')}</h3>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider">{t('powered_by_gemini')}</p>
                </div>
              </div>
              <button 
                onClick={() => setDisputeHelp(null)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                aria-label={t('close_dispute_help')}
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="prose prose-invert max-w-none">
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-[11px] font-bold tracking-wider leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {disputeHelp.advice}
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setDisputeHelp(null)}
                className="flex-1 py-4 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold tracking-wider text-[10px] hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                aria-label={t('close_ai_help')}
              >
                {t('close')}
              </button>
              <button 
                onClick={() => window.location.href = 'mailto:committee@residency.com'}
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold tracking-wider text-[10px] shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
                aria-label={t('contact_committee_email')}
              >
                {t('contact_committee')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
