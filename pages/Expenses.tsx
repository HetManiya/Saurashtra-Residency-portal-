import React, { useState, useEffect } from 'react';
import { 
  Plus, Filter, Download, ShieldCheck, 
  X, Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { EXPENSE_CATEGORIES } from '../constants';
import { useLanguage } from '../components/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

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
    <div className="pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-2">
            {t('saurashtra')} <span className="text-brand-600">{t('treasury')}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {t('exp_desc')}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Download size={16} />
            {t('export')}
          </button>
          {isAdmin && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/20 active:scale-95 transform duration-100"
            >
              <Plus size={18} strokeWidth={3} />
              {t('exp_log_new')}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 dark:bg-slate-950 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-500 rounded-full opacity-20 blur-3xl" />
            <div className="relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-300 block mb-2">
                {t('total_exp')}
              </span>
              <h3 className="text-4xl font-black tracking-tighter mb-8">
                ₹{totalExpense.toLocaleString()}
              </h3>
              <div className="h-px bg-white/10 mb-6" />
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('active_records')}</span>
                  <span className="text-sm font-bold">{expenses.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('awaiting_appr')}</span>
                  <span className="text-sm font-bold text-red-400">
                    ₹{expenses.filter(e => e.status === 'Pending').reduce((s, e) => s + e.amount, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
              <Filter size={14} /> {t('exp_category')}
            </div>
            <div className="space-y-2">
              <button 
                onClick={() => setFilterType('ALL')}
                className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${
                  filterType === 'ALL' 
                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                All Categories
              </button>
              {EXPENSE_CATEGORIES.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setFilterType(cat.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${
                    filterType === cat.id 
                      ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            {loading ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <Loader2 size={40} className="animate-spin text-brand-600 mb-4" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Loading Ledger...
                </span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Payee</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Allocation</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('amount')}</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Workflow</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {expenses.map((exp) => (
                      <tr key={exp.id || exp._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="text-sm font-black text-slate-900 dark:text-white mb-1">{exp.payeeName}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{exp.type}</div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {exp.details?.buildingName ? `Wing ${exp.details.buildingName}` : 'Society Wide'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-lg font-black text-slate-900 dark:text-white">₹{exp.amount.toLocaleString()}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            exp.status === 'Paid' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                              : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {exp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {expenses.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-20 text-center">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            No payout records found
                          </span>
                        </td>
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
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Log Payout</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleAddExpense} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Expense Category</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    {EXPENSE_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Payee / Vendor Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Surat Safai Agency"
                    required
                    value={formData.payeeName}
                    onChange={(e) => setFormData({...formData, payeeName: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Amount (₹)</label>
                    <input 
                      type="number"
                      placeholder="0.00"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Wing Allocation</label>
                    <select
                      value={formData.details.buildingName}
                      onChange={(e) => setFormData({...formData, details: {...formData.details, buildingName: e.target.value}})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                    >
                      <option value="">Society Wide</option>
                      {Array.from({length: 24}, (_, i) => `A-${i+1}`).map(w => <option key={w} value={w}>Wing {w}</option>)}
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-700 transition-colors shadow-xl shadow-brand-600/20 active:scale-95 transform duration-100 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                  Confirm & Log Payout
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Expenses;
