
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Download, Plus, Clock, X, CreditCard, Zap, Droplets, Smartphone, 
  ArrowRight, Share2, BellRing, Settings2, Mail, MessageSquare, 
  Loader2, CheckCircle, Home, Key, MessageCircle, Lock, Unlock, AlertCircle, FileText,
  History, Calendar, Users, Search, RefreshCw
} from 'lucide-react';
import { SOCIETY_INFO, UTILITY_SUMMARY, BUILDINGS } from '../constants';
import { MaintenanceRecord, PaymentStatus, OccupancyType } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../components/LanguageContext';

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

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'COMMITTEE';

  const loadAllData = useCallback(async (u: any) => {
    setLoading(true);
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
      setIsLocked(api.isMonthLocked(currentMonth, currentYear));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    const storedUser = localStorage.getItem('sr_user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    setUser(parsedUser);
    if (parsedUser) loadAllData(parsedUser);
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

  const handlePayUPI = async (record: MaintenanceRecord) => {
    if (isLocked || record.status === PaymentStatus.PAID) return;
    
    setIsProcessingPayment(true);
    try {
      await api.updateMaintenanceStatus(record.id, PaymentStatus.PAID, new Date().toISOString());
      if (user) await loadAllData(user);
      api.generateReceipt({ ...record, status: PaymentStatus.PAID });
      api.broadcastNotification('WHATSAPP', record.flatId, `Payment Success! Receipt for Flat ${record.flatId} (${record.month}) has been generated.`);
    } catch (e) {
      alert("Payment update failed.");
    } finally {
      setIsProcessingPayment(false);
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

  const handleLockMonth = async () => {
    if (confirm(`Finalize ${currentMonth} ${currentYear}? This locks all records for auditing.`)) {
      await api.lockMaintenanceMonth(currentMonth, currentYear);
      setIsLocked(true);
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
                        <td className="px-10 py-6 font-black text-slate-900 dark:text-white">₹{record.amount}</td>
                        <td className="px-10 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 ${getStatusStyle(record.status)}`}>{record.status}</span>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center justify-end gap-2">
                            {record.status === PaymentStatus.PAID ? (
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => api.generateReceipt(record)}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-brand-50 hover:text-brand-600 transition-all"
                                >
                                  <FileText size={12} /> {t('receipt')}
                                </button>
                                <button onClick={() => handleShareWhatsApp(record)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Share">
                                  <Share2 size={14} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                {(activeTab === 'current' || record.status === PaymentStatus.OVERDUE) && !isLocked && (
                                  <button 
                                    onClick={() => handlePayUPI(record)}
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
    </div>
  );
};

export default Maintenance;
