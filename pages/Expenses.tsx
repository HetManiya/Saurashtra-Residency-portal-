
import React, { useState, useEffect } from 'react';
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
    <div className="space-y-10 pb-20 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tighter">{t('saurashtra')} <span className="text-brand-600">{t('treasury')}</span></h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">{t('exp_desc')}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <Download size={16} /> {t('export')}
          </button>
          {isAdmin && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-8 py-4 bg-brand-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-brand-500/20 hover:bg-brand-700 transition-all flex items-center gap-2 active:scale-95"
            >
              <Plus size={18} strokeWidth={3} /> {t('exp_log_new')}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-[#0F172A] p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-brand-600/20 rounded-full blur-[80px] -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-1000" />
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-400 mb-3">{t('total_exp')}</p>
              <h3 className="text-5xl font-black tracking-tighter mb-8">₹{totalExpense.toLocaleString()}</h3>
              <div className="space-y-5 pt-8 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{t('active_records')}</span>
                  <span className="font-bold">{expenses.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{t('awaiting_appr')}</span>
                  <span className="text-rose-400 font-bold">₹{expenses.filter(e => e.status === 'Pending').reduce((s, e) => s + e.amount, 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 premium-shadow">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6 flex items-center gap-2">
              <Filter size={14} /> {t('exp_category')}
            </h4>
            <div className="space-y-2">
              <button 
                onClick={() => setFilterType('ALL')}
                className={`w-full text-left px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${filterType === 'ALL' ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/20' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                All Categories
              </button>
              {EXPENSE_CATEGORIES.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setFilterType(cat.id)}
                  className={`w-full text-left px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${filterType === cat.id ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/20' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 premium-shadow overflow-hidden">
            {loading ? (
              <div className="py-24 flex flex-col items-center">
                <Loader2 className="animate-spin text-brand-500 mb-4" size={32} />
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Loading Ledger...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payee</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Allocation</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('amount')}</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Workflow</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {expenses.map((exp) => (
                      <tr key={exp.id || exp._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group">
                        <td className="px-10 py-8">
                          <p className="font-black text-slate-900 dark:text-white text-lg tracking-tight mb-1">{exp.payeeName}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{exp.type}</p>
                        </td>
                        <td className="px-10 py-8 text-xs font-bold text-slate-500 uppercase">
                          {exp.details?.buildingName ? `Wing ${exp.details.buildingName}` : 'Society Wide'}
                        </td>
                        <td className="px-10 py-8">
                          <span className="font-black text-slate-900 dark:text-white text-xl">₹{exp.amount.toLocaleString()}</span>
                        </td>
                        <td className="px-10 py-8">
                          <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 ${
                            exp.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                          }`}>
                            {exp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {!loading && expenses.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">No payout records found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl animate-in fade-in" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 shadow-3xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-10">
               <h3 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">Log Payout</h3>
               <button onClick={() => setShowAddModal(false)} className="p-4 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"><X size={24} /></button>
            </div>
            
            <form className="space-y-6" onSubmit={handleAddExpense}>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-3 tracking-widest">Expense Category</label>
                 <select 
                  className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-[2rem] outline-none text-sm font-bold border-2 border-transparent focus:border-brand-600/20 transition-all dark:text-white"
                  value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                 >
                   {EXPENSE_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                 </select>
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-3 tracking-widest">Payee / Vendor Name</label>
                 <input 
                  type="text" required placeholder="e.g. Surat Safai Agency"
                  className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-[2rem] outline-none text-sm font-bold border-2 border-transparent focus:border-brand-600/20 transition-all dark:text-white"
                  value={formData.payeeName} onChange={e => setFormData({...formData, payeeName: e.target.value})}
                 />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-3 tracking-widest">Amount (₹)</label>
                    <input 
                      type="number" required placeholder="0.00"
                      className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-[2rem] outline-none text-sm font-bold border-2 border-transparent focus:border-brand-600/20 transition-all dark:text-white"
                      value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-3 tracking-widest">Wing Allocation</label>
                    <select 
                      className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-[2rem] outline-none text-sm font-bold border-2 border-transparent focus:border-brand-600/20 transition-all dark:text-white"
                      value={formData.details.buildingName} onChange={e => setFormData({...formData, details: {...formData.details, buildingName: e.target.value}})}
                    >
                      <option value="">Society Wide</option>
                      {Array.from({length: 24}, (_, i) => `A-${i+1}`).map(w => <option key={w} value={w}>Wing {w}</option>)}
                    </select>
                  </div>
               </div>

               <button 
                disabled={isSubmitting}
                className="w-full py-5 bg-brand-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl shadow-brand-500/30 transition-all active:scale-95"
               >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <ShieldCheck size={18} />}
                  Confirm & Log Payout
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
