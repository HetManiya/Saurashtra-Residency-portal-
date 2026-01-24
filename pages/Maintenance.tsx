
import React, { useState, useEffect } from 'react';
import { 
  Download, Plus, Clock, X, CreditCard, Zap, Droplets, Smartphone, 
  ArrowRight, Share2, BellRing, Settings2, Mail, MessageSquare, 
  Loader2, CheckCircle, Home, Key, MessageCircle, Lock, Unlock, AlertCircle, FileText,
  History, Calendar, Users
} from 'lucide-react';
import { MAINTENANCE_SAMPLES, SOCIETY_INFO, UTILITY_SUMMARY } from '../constants';
import { MaintenanceRecord, PaymentStatus, OccupancyType } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../components/LanguageContext';

const Maintenance: React.FC = () => {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<'ALL' | PaymentStatus>('ALL');
  const [occupancyFilter, setOccupancyFilter] = useState<'ALL' | OccupancyType>('ALL');
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [historyRecords, setHistoryRecords] = useState<MaintenanceRecord[]>([]);
  const [isSendingReminders, setIsSendingReminders] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showReminderSuccess, setShowReminderSuccess] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [currentMonth] = useState('May');
  const [currentYear] = useState(2024);

  useEffect(() => {
    const storedUser = localStorage.getItem('sr_user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    setUser(parsedUser);
    
    // Current month records
    const localRecords = JSON.parse(localStorage.getItem('sr_maintenance') || JSON.stringify(MAINTENANCE_SAMPLES));
    setRecords(localRecords);
    
    // Mock History Records
    const mockHistory: MaintenanceRecord[] = [
      { id: 'h1', flatId: 'A-1-101', month: 'April', year: 2024, amount: 700, status: PaymentStatus.PAID, occupancyType: OccupancyType.OWNER, paidDate: '2024-04-05' },
      { id: 'h2', flatId: 'A-2-102', month: 'April', year: 2024, amount: 700, status: PaymentStatus.PAID, occupancyType: OccupancyType.TENANT, paidDate: '2024-04-08' },
      { id: 'h3', flatId: 'A-15-201', month: 'April', year: 2024, amount: 700, status: PaymentStatus.PAID, occupancyType: OccupancyType.OWNER, paidDate: '2024-04-03' },
      { id: 'h4', flatId: 'A-1-101', month: 'March', year: 2024, amount: 700, status: PaymentStatus.PAID, occupancyType: OccupancyType.OWNER, paidDate: '2024-03-02' },
      { id: 'h5', flatId: 'A-2-102', month: 'March', year: 2024, amount: 700, status: PaymentStatus.OVERDUE, occupancyType: OccupancyType.TENANT },
      { id: 'h6', flatId: 'A-15-201', month: 'March', year: 2024, amount: 700, status: PaymentStatus.PAID, occupancyType: OccupancyType.OWNER, paidDate: '2024-03-10' },
    ];
    
    const finalHistory = parsedUser?.role === 'RESIDENT' 
      ? mockHistory.filter(h => h.flatId === parsedUser.flatId)
      : mockHistory;
      
    setHistoryRecords(finalHistory);
    
    setIsLocked(api.isMonthLocked(currentMonth, currentYear));
  }, [currentMonth, currentYear]);

  const saveRecords = (newRecords: MaintenanceRecord[]) => {
    setRecords(newRecords);
    localStorage.setItem('sr_maintenance', JSON.stringify(newRecords));
  };

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

  const handlePayUPI = (record: MaintenanceRecord) => {
    if (isLocked || record.status === PaymentStatus.PAID) return;
    
    setIsProcessingPayment(true);
    setTimeout(() => {
      const updated = records.map(r => r.id === record.id ? { ...r, status: PaymentStatus.PAID, paidDate: new Date().toISOString() } : r);
      saveRecords(updated);
      setIsProcessingPayment(false);
      api.generateReceipt({ ...record, status: PaymentStatus.PAID });
      api.broadcastNotification('WHATSAPP', record.flatId, `Payment Success! Receipt for Flat ${record.flatId} (${record.month}) has been generated.`);
    }, 1500);
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

  const handleDownloadReceipt = (record: MaintenanceRecord) => {
    api.generateReceipt(record);
  };

  const getStatusStyle = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID: return 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-900/20';
      case PaymentStatus.PENDING: return 'bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 border-amber-100/50 dark:border-amber-900/20';
      case PaymentStatus.OVERDUE: return 'bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 border-rose-100/50 dark:border-rose-900/20';
      default: return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-100/50 dark:border-slate-700';
    }
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'COMMITTEE';
  
  const displayedRecords = activeTab === 'current' 
    ? records.filter(r => 
        (statusFilter === 'ALL' || r.status === statusFilter) && 
        (occupancyFilter === 'ALL' || r.occupancyType === occupancyFilter)
      )
    : historyRecords.filter(r => 
        (occupancyFilter === 'ALL' || r.occupancyType === occupancyFilter)
      );

  return (
    <div className="space-y-10 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tighter">{t('finance_hub')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {activeTab === 'current' 
              ? `Cycle: ${currentMonth} ${currentYear} • Society Dues: ₹${SOCIETY_INFO.maintenanceAmount}` 
              : 'Audit & Historical Payment Logs'}
          </p>
        </div>
        <div className="flex gap-3">
          {isAdmin && activeTab === 'current' && (
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
            <div className="p-8 border-b border-slate-50 dark:border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-full md:w-auto overflow-x-auto shrink-0">
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
                  <History size={14} /> Payment History
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                {/* Occupancy Filter */}
                <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-100 dark:border-slate-800 w-full sm:w-auto">
                  <div className="px-3 py-2 text-[9px] font-black uppercase text-slate-400 border-r border-slate-100 dark:border-slate-700 hidden sm:block">Type</div>
                  {[
                    { id: 'ALL', label: 'All' },
                    { id: OccupancyType.OWNER, label: 'Owner' },
                    { id: OccupancyType.TENANT, label: 'Tenant' }
                  ].map((o) => (
                    <button 
                      key={o.id} 
                      onClick={() => setOccupancyFilter(o.id as any)} 
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${occupancyFilter === o.id ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>

                {/* Status Filter */}
                {activeTab === 'current' && (
                  <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-100 dark:border-slate-800 w-full sm:w-auto">
                    <div className="px-3 py-2 text-[9px] font-black uppercase text-slate-400 border-r border-slate-100 dark:border-slate-700 hidden sm:block">Status</div>
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

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('unit')}</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                    {activeTab === 'history' && <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Period</th>}
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('amount')}</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {displayedRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/10 text-brand-600 flex items-center justify-center font-black text-sm">{record.flatId.split('-')[1]}</div>
                          <span className="font-black text-slate-800 dark:text-slate-200 tracking-tight">{record.flatId}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-2">
                           {record.occupancyType === OccupancyType.OWNER ? <Key size={12} className="text-emerald-500" /> : <Users size={12} className="text-blue-500" />}
                           <span className={`text-[10px] font-black uppercase tracking-widest ${record.occupancyType === OccupancyType.OWNER ? 'text-emerald-600' : 'text-blue-600'}`}>
                             {record.occupancyType}
                           </span>
                        </div>
                      </td>
                      {activeTab === 'history' && (
                        <td className="px-10 py-8">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{record.month} {record.year}</span>
                            {record.paidDate && (
                              <span className="text-[10px] text-slate-400 font-medium">Paid: {new Date(record.paidDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="px-10 py-8 font-black text-slate-900 dark:text-white">₹{record.amount}</td>
                      <td className="px-10 py-8">
                        <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${getStatusStyle(record.status)}`}>{record.status}</span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-2">
                          {record.status === PaymentStatus.PAID ? (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleDownloadReceipt(record)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-50 hover:text-brand-600 transition-all"
                              >
                                <FileText size={14} /> {t('receipt')}
                              </button>
                              <button 
                                onClick={() => handleShareWhatsApp(record)}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                title="Share to WhatsApp"
                              >
                                <Share2 size={16} />
                              </button>
                            </div>
                          ) : (
                            activeTab === 'current' && !isLocked && (
                              <button 
                                onClick={() => handlePayUPI(record)}
                                disabled={isProcessingPayment}
                                className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20"
                              >
                                {isProcessingPayment ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />} 
                                {isProcessingPayment ? 'Processing' : t('pay_now')}
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {displayedRecords.length === 0 && (
                <div className="p-20 text-center">
                   <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                   <p className="text-slate-400 font-bold text-sm">No maintenance records found for the selected filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
