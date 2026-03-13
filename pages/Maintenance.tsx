
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

const CheckoutForm: React.FC<{ 
  clientSecret: string; 
  onSuccess: (id: string) => void; 
  onCancel: () => void;
  amount: number;
}> = ({ clientSecret, onSuccess, onCancel, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

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
        onSuccess(result.paymentIntent.id);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-6">
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Select Payment Method</p>
        <div className="flex items-center gap-4 mb-4 overflow-x-auto pb-2 custom-scrollbar">
          <div className="flex flex-col items-center gap-1 min-w-[60px]">
            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <img src="https://www.vectorlogo.zone/logos/google_pay/google_pay-icon.svg" className="w-6 h-6" alt="GPay" />
            </div>
            <span className="text-[8px] font-black uppercase text-slate-400">GPay</span>
          </div>
          <div className="flex flex-col items-center gap-1 min-w-[60px]">
            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <img src="https://www.vectorlogo.zone/logos/paytm/paytm-icon.svg" className="w-6 h-6" alt="Paytm" />
            </div>
            <span className="text-[8px] font-black uppercase text-slate-400">Paytm</span>
          </div>
          <div className="flex flex-col items-center gap-1 min-w-[60px]">
            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <img src="https://www.vectorlogo.zone/logos/npci_upi/npci_upi-icon.svg" className="w-6 h-6" alt="UPI" />
            </div>
            <span className="text-[8px] font-black uppercase text-slate-400">UPI</span>
          </div>
          <div className="flex flex-col items-center gap-1 min-w-[60px]">
            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <CreditCard size={20} className="text-slate-400" />
            </div>
            <span className="text-[8px] font-black uppercase text-slate-400">Cards</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <PaymentElement />
      </div>
      {error && <div className="text-rose-600 text-xs font-bold">{error}</div>}
      <div className="flex gap-3">
        <button 
          type="button" 
          onClick={onCancel}
          className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px]"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={!stripe || processing}
          className="flex-1 py-4 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand-500/20 disabled:opacity-50"
        >
          {processing ? 'Processing...' : `Pay ₹${amount}`}
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
      if (parsedUser) loadAllData(parsedUser);
    } else if (!records.length && parsedUser) {
      // If user is same but no records, load data (e.g. initial load or refresh)
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
      alert("Payment initialization failed. Please check your connection.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!paymentOrder) return;
    try {
      await api.verifyPayment(paymentIntentId);
      if (user) await loadAllData(user);
      setPaymentOrder(null);
      alert("Payment Successful! Your record has been updated.");
    } catch (e: any) {
      console.error("Verification error:", e);
      // Even if verification fails here, the webhook should handle it eventually.
      if (user) await loadAllData(user);
      setPaymentOrder(null);
      alert("Payment processed. Your record will be updated shortly.");
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
    <div className="space-y-10 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tighter">{t('finance_hub')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {activeTab === 'current' 
              ? `Cycle: ${currentMonth} ${currentYear} • Total Units: ${records.length}` 
              : 'Audit & Historical Payment Logs'}
          </p>
        </div>
        <div className="flex gap-3">
          {isAdmin && activeTab === 'current' && records.length === 0 && (
            <button 
              onClick={handleGenerateMonthly}
              className="flex items-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-xl shadow-emerald-500/20 active:scale-95"
            >
              <RefreshCw size={16} /> Generate Cycle
            </button>
          )}
          {isAdmin && activeTab === 'current' && records.length > 0 && (
            <button 
              onClick={handleLockMonth}
              disabled={isLocked}
              className={`flex items-center gap-2 px-6 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] transition-all shadow-xl ${
                isLocked 
                  ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20'
              }`}
            >
              {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
              {isLocked ? 'Cycle Locked' : 'Finalize Ledger'}
            </button>
          )}
          {isAdmin && activeTab === 'current' && records.length > 0 && (
            <button 
              onClick={handleSendReminders}
              disabled={isGeneratingReminders}
              className="flex items-center gap-2 px-6 py-4 bg-amber-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-xl shadow-amber-500/20 active:scale-95 disabled:opacity-50"
            >
              {isGeneratingReminders ? <Loader2 size={16} className="animate-spin" /> : <BellRing size={16} />}
              Send Reminders
            </button>
          )}
          {isAdmin && activeTab === 'current' && records.length > 0 && (
            <button 
              onClick={handleCalculatePenalties}
              disabled={isCalculatingPenalties}
              className="flex items-center gap-2 px-6 py-4 bg-rose-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-xl shadow-rose-500/20 active:scale-95 disabled:opacity-50"
            >
              {isCalculatingPenalties ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              Apply Penalties
            </button>
          )}
          {!isAdmin && (
            <button 
              onClick={handleSetupRecurring}
              disabled={isSettingUpRecurring || user?.isRecurringEnabled}
              className={`flex items-center gap-2 px-6 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-xl transition-all active:scale-95 disabled:opacity-50 ${
                user?.isRecurringEnabled 
                  ? 'bg-emerald-100 text-emerald-600 cursor-default' 
                  : 'bg-brand-600 text-white shadow-brand-500/20'
              }`}
            >
              {isSettingUpRecurring ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              {user?.isRecurringEnabled ? 'Recurring Active' : 'Enable Recurring'}
            </button>
          )}
          <button onClick={handleExport} className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all">
            <Download size={18} /> {t('export')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 premium-shadow overflow-hidden">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800/50 flex flex-col xl:flex-row justify-between items-center gap-6">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-full xl:w-auto overflow-x-auto shrink-0">
                <button 
                  onClick={() => setActiveTab('current')} 
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'current' ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Calendar size={14} /> Current Ledger
                </button>
                <button 
                  onClick={() => setActiveTab('history')} 
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <History size={14} /> History
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search Flat (e.g. A-1-101)..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-brand-500/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-100 dark:border-slate-800 w-full sm:w-auto">
                  {['ALL', OccupancyType.OWNER, OccupancyType.TENANT].map((o) => (
                    <button 
                      key={o} 
                      onClick={() => setOccupancyFilter(o as any)} 
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${occupancyFilter === o ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {o}
                    </button>
                  ))}
                </div>

                {activeTab === 'current' && (
                  <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-100 dark:border-slate-800 w-full sm:w-auto">
                    {['ALL', PaymentStatus.PAID, PaymentStatus.PENDING, PaymentStatus.OVERDUE].map((s) => (
                      <button 
                        key={s} 
                        onClick={() => setStatusFilter(s as any)} 
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === s ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center"><Loader2 className="animate-spin text-brand-600 mb-2" /><p className="text-[10px] font-black uppercase text-slate-400">Loading Cloud Data...</p></div>
              ) : (
                <table className="w-full text-left">
                  <thead className="sticky top-0 z-20 bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('unit')}</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                      {activeTab === 'history' && <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Period</th>}
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('amount')}</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/10 text-brand-600 flex items-center justify-center font-black text-sm">{record.flatId.split('-').pop()}</div>
                            <span className="font-black text-slate-800 dark:text-slate-200 tracking-tight">{record.flatId}</span>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-2">
                             {record.occupancyType === OccupancyType.OWNER ? <Key size={12} className="text-emerald-500" /> : <Users size={12} className="text-blue-500" />}
                             <span className={`text-[10px] font-black uppercase tracking-widest ${record.occupancyType === OccupancyType.OWNER ? 'text-emerald-600' : 'text-blue-600'}`}>
                               {record.occupancyType}
                             </span>
                          </div>
                        </td>
                        {activeTab === 'history' && (
                          <td className="px-10 py-6">
                            <div className="flex flex-col">
                              <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{record.month} {record.year}</span>
                              {record.paidDate && <span className="text-[10px] text-slate-400 font-medium">{new Date(record.paidDate).toLocaleDateString()}</span>}
                            </div>
                          </td>
                        )}
                        <td className="px-10 py-6 font-black text-slate-900 dark:text-white">
                          <div className="flex flex-col">
                            <span>₹{record.amount}</span>
                            {record.penaltyAmount > 0 && (
                              <span className="text-[9px] text-rose-500 font-black uppercase tracking-widest">+ ₹{record.penaltyAmount} Penalty</span>
                            )}
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 ${getStatusStyle(record.status)}`}>{record.status}</span>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center justify-end gap-2">
                            {record.status === PaymentStatus.PAID ? (
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleViewReceipt(record)}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-brand-50 hover:text-brand-600 transition-all"
                                >
                                  <FileText size={12} /> {t('receipt')}
                                </button>
                                <button onClick={() => handleShareWhatsApp(record)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Share">
                                  <Share2 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDisputeHelp(record)}
                                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all" 
                                  title="AI Dispute Help"
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
                                    className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg"
                                  >
                                    {isProcessingPayment ? <Loader2 size={12} className="animate-spin" /> : <CreditCard size={12} />} 
                                    {t('pay_now')}
                                  </button>
                                )}
                                {isAdmin && (
                                  <button 
                                    onClick={() => handleWhatsAppReminder(record)}
                                    className="p-2.5 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all border border-emerald-100"
                                    title="Reminder"
                                  >
                                    <MessageCircle size={14} />
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
                   <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                   <p className="text-slate-400 font-bold text-sm">No records found matching your filters.</p>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                 Showing {filteredRecords.length} units
               </p>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[9px] font-black uppercase text-slate-500">Paid: {filteredRecords.filter(r => r.status === PaymentStatus.PAID).length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-[9px] font-black uppercase text-slate-500">Pending: {filteredRecords.filter(r => r.status === PaymentStatus.PENDING).length}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {paymentOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setPaymentOrder(null)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black tracking-tight dark:text-white">Checkout</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Society Payments</p>
              </div>
              <button onClick={() => setPaymentOrder(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="p-4 bg-brand-50 dark:bg-brand-900/10 rounded-2xl border border-brand-100 dark:border-brand-900/20 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Amount</span>
                <span className="text-xl font-black text-brand-600">₹{paymentOrder.amount}</span>
              </div>
            </div>
            
            {stripePromise && (
              <Elements stripe={stripePromise} options={{ clientSecret: paymentOrder.clientSecret }}>
                <CheckoutForm 
                  clientSecret={paymentOrder.clientSecret} 
                  amount={paymentOrder.amount}
                  onSuccess={handlePaymentSuccess}
                  onCancel={() => setPaymentOrder(null)}
                />
              </Elements>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-4 opacity-50 grayscale">
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
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/5 rounded-full blur-3xl -mr-20 -mt-20" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tighter dark:text-white">{selectedReceipt.societyName}</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Official Payment Receipt</p>
                  </div>
                </div>
                <button onClick={() => setSelectedReceipt(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center pb-6 border-b border-slate-50 dark:border-slate-800">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Receipt No</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{selectedReceipt.receiptNo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{new Date(selectedReceipt.paidDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500">Unit Number</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">{selectedReceipt.flatId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500">Billing Period</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">{selectedReceipt.period}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500">Base Amount</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">₹{selectedReceipt.amount}</span>
                  </div>
                  {selectedReceipt.penalty > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500">Penalty Charges</span>
                      <span className="text-xs font-black text-rose-500">₹{selectedReceipt.penalty}</span>
                    </div>
                  )}
                </div>

                <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Total Paid</span>
                    <span className="text-2xl font-black text-brand-600 tracking-tighter">₹{selectedReceipt.total}</span>
                  </div>
                </div>

                <div className="pt-6 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/10 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-100 dark:border-emerald-900/20">
                    <CheckCircle size={14} /> Payment Verified
                  </div>
                  <p className="mt-4 text-[9px] text-slate-400 font-medium max-w-[200px] mx-auto">
                    This is a computer-generated receipt and does not require a physical signature.
                  </p>
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={() => window.print()}
                    className="flex-1 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                  >
                    <Download size={14} /> Print PDF
                  </button>
                  <button 
                    onClick={() => handleShareWhatsApp({ ...selectedReceipt, amount: selectedReceipt.total } as any)}
                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                  >
                    <Share2 size={14} /> Share
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
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/10 rounded-2xl flex items-center justify-center text-rose-600">
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight dark:text-white">AI Dispute Resolution</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Powered by Gemini AI</p>
                </div>
              </div>
              <button onClick={() => setDisputeHelp(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                {disputeHelp.advice}
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setDisputeHelp(null)}
                className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px]"
              >
                Close
              </button>
              <button 
                onClick={() => window.location.href = 'mailto:committee@residency.com'}
                className="flex-1 py-4 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand-500/20"
              >
                Contact Committee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
