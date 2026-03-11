
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
      case PaymentStatus.PAID: return 'bg-cyan-400 text-black border-2 border-cyan-600 shadow-[2px_2px_0px_#ff00ff]';
      case PaymentStatus.PENDING: return 'bg-black text-cyan-400 border-2 border-cyan-500';
      case PaymentStatus.OVERDUE: return 'bg-magenta-500 text-white border-2 border-black animate-pulse shadow-[2px_2px_0px_#00ffff]';
      default: return 'bg-black text-cyan-900 border-2 border-cyan-900/30';
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
    <div className="space-y-10 animate-fade-up crt-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b-4 border-cyan-500/30">
        <div>
          <h1 className="text-4xl font-black text-cyan-400 tracking-tighter glitch-text" data-text={t('finance_hub')}>{t('finance_hub')}</h1>
          <p className="text-cyan-700 mt-2 font-bold font-mono uppercase text-xs tracking-widest">
            {activeTab === 'current' 
              ? `> Cycle: ${currentMonth} ${currentYear} // Total Units: ${records.length}` 
              : '> Audit & Historical Payment Logs'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {isAdmin && activeTab === 'current' && records.length === 0 && (
            <button 
              onClick={handleGenerateMonthly}
              className="flex items-center gap-2 px-6 py-4 bg-cyan-400 text-black border-2 border-black font-black uppercase tracking-widest text-[11px] shadow-[4px_4px_0px_#ff00ff] active:scale-95 transition-all"
            >
              <RefreshCw size={16} /> Generate Cycle
            </button>
          )}
          {isAdmin && activeTab === 'current' && records.length > 0 && (
            <button 
              onClick={handleLockMonth}
              disabled={isLocked}
              className={`flex items-center gap-2 px-6 py-4 border-2 font-black uppercase tracking-widest text-[11px] transition-all shadow-[4px_4px_0px_#00ffff] ${
                isLocked 
                  ? 'bg-black text-cyan-900 border-cyan-900/30 cursor-not-allowed' 
                  : 'bg-magenta-500 text-white border-black hover:bg-black hover:text-magenta-500 hover:border-magenta-500'
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
              className="flex items-center gap-2 px-6 py-4 bg-black text-cyan-400 border-2 border-cyan-500 font-black uppercase tracking-widest text-[11px] shadow-[4px_4px_0px_#ff00ff] active:scale-95 disabled:opacity-50 transition-all"
            >
              {isGeneratingReminders ? <Loader2 size={16} className="animate-spin" /> : <BellRing size={16} />}
              Send Reminders
            </button>
          )}
          {isAdmin && activeTab === 'current' && records.length > 0 && (
            <button 
              onClick={handleCalculatePenalties}
              disabled={isCalculatingPenalties}
              className="flex items-center gap-2 px-6 py-4 bg-magenta-500 text-white border-2 border-black font-black uppercase tracking-widest text-[11px] shadow-[4px_4px_0px_#00ffff] active:scale-95 disabled:opacity-50 transition-all"
            >
              {isCalculatingPenalties ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              Apply Penalties
            </button>
          )}
          {!isAdmin && (
            <button 
              onClick={handleSetupRecurring}
              disabled={isSettingUpRecurring || user?.isRecurringEnabled}
              className={`flex items-center gap-2 px-6 py-4 border-2 font-black uppercase tracking-widest text-[11px] shadow-[4px_4px_0px_#00ffff] transition-all active:scale-95 disabled:opacity-50 ${
                user?.isRecurringEnabled 
                  ? 'bg-cyan-400 text-black border-black' 
                  : 'bg-magenta-500 text-white border-black'
              }`}
            >
              {isSettingUpRecurring ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              {user?.isRecurringEnabled ? 'Recurring Active' : 'Enable Recurring'}
            </button>
          )}
          <button onClick={handleExport} className="flex items-center gap-2 px-5 py-3 bg-black border-2 border-cyan-500 text-cyan-400 font-black uppercase tracking-widest text-[11px] hover:bg-cyan-400 hover:text-black transition-all shadow-[4px_4px_0px_#ff00ff]">
            <Download size={18} /> {t('export')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-black border-4 border-cyan-500/30 overflow-hidden shadow-[8px_8px_0px_#ff00ff]">
            <div className="p-8 border-b-4 border-cyan-500/30 flex flex-col xl:flex-row justify-between items-center gap-6 bg-black">
              <div className="flex bg-black border-2 border-cyan-900/30 p-1 w-full xl:w-auto overflow-x-auto shrink-0">
                <button 
                  onClick={() => setActiveTab('current')} 
                  className={`flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'current' ? 'bg-cyan-400 text-black shadow-[2px_2px_0px_#ff00ff]' : 'text-cyan-700 hover:text-cyan-400'}`}
                >
                  <Calendar size={14} /> Current Ledger
                </button>
                <button 
                  onClick={() => setActiveTab('history')} 
                  className={`flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-cyan-400 text-black shadow-[2px_2px_0px_#ff00ff]' : 'text-cyan-700 hover:text-cyan-400'}`}
                >
                  <History size={14} /> History
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search Flat..."
                    className="w-full pl-10 pr-4 py-2.5 bg-black border-2 border-cyan-500 text-cyan-400 text-xs font-bold outline-none focus:border-magenta-500 placeholder:text-cyan-900 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex bg-black border-2 border-cyan-900/30 p-1 w-full sm:w-auto">
                  {['ALL', OccupancyType.OWNER, OccupancyType.TENANT].map((o) => (
                    <button 
                      key={o} 
                      onClick={() => setOccupancyFilter(o as any)} 
                      className={`flex-1 sm:flex-none px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${occupancyFilter === o ? 'bg-cyan-400 text-black' : 'text-cyan-700 hover:text-cyan-400'}`}
                    >
                      {o}
                    </button>
                  ))}
                </div>

                {activeTab === 'current' && (
                  <div className="flex bg-black border-2 border-cyan-900/30 p-1 w-full sm:w-auto">
                    {['ALL', PaymentStatus.PAID, PaymentStatus.PENDING, PaymentStatus.OVERDUE].map((s) => (
                      <button 
                        key={s} 
                        onClick={() => setStatusFilter(s as any)} 
                        className={`flex-1 sm:flex-none px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === s ? 'bg-cyan-400 text-black' : 'text-cyan-700 hover:text-cyan-400'}`}
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
                <div className="py-20 flex flex-col items-center justify-center">
                  <Loader2 className="animate-spin text-cyan-400 mb-2" />
                  <p className="text-[10px] font-black uppercase text-cyan-700 tracking-widest">Accessing Mainframe...</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="sticky top-0 z-20 bg-black border-b-4 border-cyan-500/30">
                    <tr>
                      <th className="px-10 py-6 text-[10px] font-black text-cyan-700 uppercase tracking-widest">Unit</th>
                      <th className="px-10 py-6 text-[10px] font-black text-cyan-700 uppercase tracking-widest">Type</th>
                      {activeTab === 'history' && <th className="px-10 py-6 text-[10px] font-black text-cyan-700 uppercase tracking-widest">Period</th>}
                      <th className="px-10 py-6 text-[10px] font-black text-cyan-700 uppercase tracking-widest">Amount</th>
                      <th className="px-10 py-6 text-[10px] font-black text-cyan-700 uppercase tracking-widest">Status</th>
                      <th className="px-10 py-6 text-[10px] font-black text-cyan-700 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-cyan-900/10">
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-cyan-900/10 transition-colors group">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 border-2 border-cyan-500 bg-black text-cyan-400 flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_#ff00ff]">{record.flatId.split('-').pop()}</div>
                            <span className="font-black text-cyan-400 tracking-tight uppercase font-mono">{record.flatId}</span>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-2">
                             {record.occupancyType === OccupancyType.OWNER ? <Key size={12} className="text-cyan-400" /> : <Users size={12} className="text-magenta-500" />}
                             <span className={`text-[10px] font-black uppercase tracking-widest ${record.occupancyType === OccupancyType.OWNER ? 'text-cyan-400' : 'text-magenta-500'}`}>
                               {record.occupancyType}
                             </span>
                          </div>
                        </td>
                        {activeTab === 'history' && (
                          <td className="px-10 py-6">
                            <div className="flex flex-col">
                              <span className="font-black text-sm text-cyan-400 uppercase">{record.month} {record.year}</span>
                              {record.paidDate && <span className="text-[10px] text-cyan-700 font-bold font-mono">{new Date(record.paidDate).toLocaleDateString()}</span>}
                            </div>
                          </td>
                        )}
                        <td className="px-10 py-6 font-black text-cyan-400">
                          <div className="flex flex-col">
                            <span className="text-lg">₹{record.amount}</span>
                            {record.penaltyAmount > 0 && (
                              <span className="text-[9px] text-magenta-500 font-black uppercase tracking-widest animate-pulse">+ ₹{record.penaltyAmount} Penalty</span>
                            )}
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest ${getStatusStyle(record.status)}`}>{record.status}</span>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center justify-end gap-2">
                            {record.status === PaymentStatus.PAID ? (
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleViewReceipt(record)}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-black border-2 border-cyan-500 text-cyan-400 text-[9px] font-black uppercase tracking-widest hover:bg-cyan-400 hover:text-black transition-all shadow-[2px_2px_0px_#ff00ff]"
                                >
                                  <FileText size={12} /> {t('receipt')}
                                </button>
                                <button onClick={() => handleShareWhatsApp(record)} className="p-2 text-cyan-400 border-2 border-cyan-500 hover:bg-cyan-400 hover:text-black transition-all shadow-[2px_2px_0px_#ff00ff]" title="Share">
                                  <Share2 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDisputeHelp(record)}
                                  className="p-2 text-magenta-500 border-2 border-magenta-500 hover:bg-magenta-500 hover:text-white transition-all shadow-[2px_2px_0px_#00ffff]" 
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
                                    className="flex items-center gap-2 px-4 py-2 bg-magenta-500 text-white border-2 border-black text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-magenta-500 hover:border-magenta-500 transition-all shadow-[4px_4px_0px_#00ffff] active:scale-95"
                                  >
                                    {isProcessingPayment ? <Loader2 size={12} className="animate-spin" /> : <CreditCard size={12} />} 
                                    {t('pay_now')}
                                  </button>
                                )}
                                {isAdmin && (
                                  <button 
                                    onClick={() => handleWhatsAppReminder(record)}
                                    className="p-2.5 bg-black border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all shadow-[2px_2px_0px_#ff00ff]"
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
                <div className="p-20 text-center border-4 border-dashed border-cyan-900/30">
                   <AlertCircle className="w-12 h-12 text-cyan-900 mx-auto mb-4" />
                   <p className="text-cyan-700 font-black text-sm uppercase tracking-widest glitch-text" data-text="No records found.">No records found.</p>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-black border-t-4 border-cyan-500/30 flex justify-between items-center">
               <p className="text-[10px] font-black uppercase text-cyan-700 tracking-widest font-mono">
                 {`> Showing ${filteredRecords.length} units`}
               </p>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 shadow-[0_0_8px_#00ffff]"></div>
                    <span className="text-[9px] font-black uppercase text-cyan-700">Paid: {filteredRecords.filter(r => r.status === PaymentStatus.PAID).length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-magenta-500 shadow-[0_0_8px_#ff00ff]"></div>
                    <span className="text-[9px] font-black uppercase text-cyan-700">Pending: {filteredRecords.filter(r => r.status === PaymentStatus.PENDING).length}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {paymentOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm crt-screen">
          <div className="relative bg-black w-full max-w-md border-4 border-magenta-500 p-8 shadow-[12px_12px_0px_#00ffff] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-cyan-400 glitch-text" data-text="Checkout">Checkout</h3>
                <p className="text-[10px] font-black text-cyan-700 uppercase tracking-widest font-mono">{`> Secure Society Payments`}</p>
              </div>
              <button onClick={() => setPaymentOrder(null)} className="p-2 border-2 border-magenta-500 text-magenta-500 hover:bg-magenta-500 hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 bg-cyan-900/20 border-2 border-cyan-500 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-cyan-700 uppercase tracking-widest">Total Amount</span>
                <span className="text-xl font-black text-cyan-400">₹{paymentOrder.amount}</span>
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

            <div className="mt-8 pt-6 border-t-2 border-cyan-900/30 flex items-center justify-center gap-4 opacity-50 grayscale">
              <img src="https://www.vectorlogo.zone/logos/visa/visa-icon.svg" className="h-4" alt="Visa" />
              <img src="https://www.vectorlogo.zone/logos/mastercard/mastercard-icon.svg" className="h-4" alt="Mastercard" />
              <img src="https://www.vectorlogo.zone/logos/npci_upi/npci_upi-icon.svg" className="h-4" alt="UPI" />
            </div>
          </div>
        </div>
      )}

      {selectedReceipt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm crt-screen">
          <div className="relative bg-black w-full max-w-lg border-4 border-cyan-500 p-10 shadow-[12px_12px_0px_#ff00ff] animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl -mr-20 -mt-20" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-cyan-400 border-2 border-black flex items-center justify-center text-black shadow-[4px_4px_0px_#ff00ff]">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tighter text-cyan-400 glitch-text" data-text={selectedReceipt.societyName}>{selectedReceipt.societyName}</h3>
                    <p className="text-[9px] font-black text-cyan-700 uppercase tracking-widest font-mono">{`> Official Payment Receipt`}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedReceipt(null)} className="p-2 border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center pb-6 border-b-2 border-cyan-900/30">
                  <div>
                    <p className="text-[9px] font-black text-cyan-700 uppercase tracking-widest mb-1">Receipt No</p>
                    <p className="text-sm font-black text-cyan-400">{selectedReceipt.receiptNo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-cyan-700 uppercase tracking-widest mb-1">Date</p>
                    <p className="text-sm font-black text-cyan-400 font-mono">{new Date(selectedReceipt.paidDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-cyan-700 uppercase tracking-widest">Unit Number</span>
                    <span className="text-xs font-black text-cyan-400">{selectedReceipt.flatId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-cyan-700 uppercase tracking-widest">Billing Period</span>
                    <span className="text-xs font-black text-cyan-400">{selectedReceipt.period}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-cyan-700 uppercase tracking-widest">Base Amount</span>
                    <span className="text-xs font-black text-cyan-400">₹{selectedReceipt.amount}</span>
                  </div>
                  {selectedReceipt.penalty > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-cyan-700 uppercase tracking-widest">Penalty Charges</span>
                      <span className="text-xs font-black text-magenta-500 animate-pulse">₹{selectedReceipt.penalty}</span>
                    </div>
                  )}
                </div>

                <div className="mt-8 p-6 bg-cyan-900/20 border-2 border-cyan-500">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-cyan-700 uppercase tracking-wider">Total Paid</span>
                    <span className="text-2xl font-black text-cyan-400 tracking-tighter">₹{selectedReceipt.total}</span>
                  </div>
                </div>

                <div className="pt-6 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black border-2 border-cyan-400 text-[10px] font-black uppercase tracking-widest text-cyan-400 shadow-[2px_2px_0px_#ff00ff]">
                    <CheckCircle size={14} /> Payment Verified
                  </div>
                  <p className="mt-4 text-[9px] text-cyan-700 font-bold font-mono max-w-[200px] mx-auto uppercase">
                    {`> This is a computer-generated receipt and does not require a physical signature.`}
                  </p>
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={() => window.print()}
                    className="flex-1 py-4 bg-black border-2 border-cyan-500 text-cyan-400 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-cyan-400 hover:text-black transition-all"
                  >
                    <Download size={14} /> Print PDF
                  </button>
                  <button 
                    onClick={() => handleShareWhatsApp({ ...selectedReceipt, amount: selectedReceipt.total } as any)}
                    className="flex-1 py-4 bg-magenta-500 text-white border-2 border-black font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-[4px_4px_0px_#00ffff] active:scale-95"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm crt-screen">
          <div className="relative bg-black w-full max-w-2xl border-4 border-magenta-500 p-8 shadow-[12px_12px_0px_#00ffff] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black border-2 border-magenta-500 flex items-center justify-center text-magenta-500 shadow-[4px_4px_0px_#00ffff]">
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-cyan-400 glitch-text" data-text="AI Dispute Resolution">AI Dispute Resolution</h3>
                  <p className="text-[10px] font-black text-cyan-700 uppercase tracking-widest font-mono">{`> Powered by Gemini AI`}</p>
                </div>
              </div>
              <button onClick={() => setDisputeHelp(null)} className="p-2 border-2 border-magenta-500 text-magenta-500 hover:bg-magenta-500 hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="prose prose-invert max-w-none">
              <div className="p-6 bg-black border-2 border-cyan-900/30 text-cyan-600 font-bold font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {disputeHelp.advice}
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setDisputeHelp(null)}
                className="flex-1 py-4 bg-black border-2 border-cyan-500 text-cyan-400 font-black uppercase tracking-widest text-[10px] hover:bg-cyan-400 hover:text-black transition-all"
              >
                Close
              </button>
              <button 
                onClick={() => window.location.href = 'mailto:committee@residency.com'}
                className="flex-1 py-4 bg-magenta-500 text-white border-2 border-black font-black uppercase tracking-widest text-[10px] shadow-[4px_4px_0px_#00ffff] active:scale-95"
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
