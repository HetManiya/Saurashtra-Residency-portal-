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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
            Society <span className="text-brand-600">Expenses</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Manage and track society expenses
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 px-6 py-3 rounded-2xl font-bold text-[10px] tracking-wider hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            <Download size={16} />
            {t('export')}
          </button>
          {isAdmin && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-2xl font-bold text-[10px] tracking-wider hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 active:scale-95 transform duration-100"
            >
              <Plus size={18} strokeWidth={3} />
              {t('exp_log_new')}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl relative overflow-hidden shadow-sm">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-500/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 block mb-2">
                Total Expenses
              </span>
              <h3 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-8">
                ₹{totalExpense.toLocaleString()}
              </h3>
              <div className="h-px bg-slate-100 dark:bg-slate-800 mb-6" />
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400">Total Records</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{expenses.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400">Pending Approval</span>
                  <span className="text-sm font-bold text-brand-600">
                    ₹{expenses.filter(e => e.status === 'Pending').reduce((s, e) => s + e.amount, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 tracking-wider mb-4">
              <Filter size={14} /> Categories
            </div>
            <div className="space-y-2">
              <button 
                onClick={() => setFilterType('ALL')}
                className={`w-full text-left px-4 py-3 rounded-2xl transition-all text-[10px] font-bold tracking-wider ${
                  filterType === 'ALL' 
                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 border border-brand-200 dark:border-brand-800' 
                    : 'text-slate-500 border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                All Categories
              </button>
              {EXPENSE_CATEGORIES.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setFilterType(cat.id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition-all text-[10px] font-bold tracking-wider ${
                    filterType === cat.id 
                      ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 border border-brand-200 dark:border-brand-800' 
                      : 'text-slate-500 border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <Loader2 size={40} className="animate-spin text-brand-600 mb-4" />
                <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                  Loading expenses...
                </span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-8 py-6 text-left text-[10px] font-bold text-slate-400 tracking-wider">Payee</th>
                      <th className="px-8 py-6 text-left text-[10px] font-bold text-slate-400 tracking-wider">Allocation</th>
                      <th className="px-8 py-6 text-left text-[10px] font-bold text-slate-400 tracking-wider">Amount</th>
                      <th className="px-8 py-6 text-left text-[10px] font-bold text-slate-400 tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {expenses.map((exp) => (
                      <tr key={exp.id || exp._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">{exp.payeeName}</div>
                          <div className="text-[10px] font-semibold text-slate-400 tracking-wider">{exp.type}</div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-[10px] font-bold text-slate-500 tracking-wider">
                            {exp.details?.buildingName ? `Wing ${exp.details.buildingName}` : 'Society Wide'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-lg font-bold text-slate-900 dark:text-white">₹{exp.amount.toLocaleString()}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border ${
                            exp.status === 'Paid' 
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                          }`}>
                            {exp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {expenses.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-20 text-center">
                          <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                            No expense records found
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Add Expense</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>
              
              <form onSubmit={handleAddExpense} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 tracking-wider mb-2 block ml-1">Expense Category</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 rounded-2xl text-sm font-bold focus:border-brand-500 outline-none appearance-none"
                  >
                    {EXPENSE_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 tracking-wider mb-2 block ml-1">Payee / Vendor Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Surat Safai Agency"
                    required
                    value={formData.payeeName}
                    onChange={(e) => setFormData({...formData, payeeName: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 rounded-2xl text-sm font-bold focus:border-brand-500 outline-none placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 tracking-wider mb-2 block ml-1">Amount (₹)</label>
                    <input 
                      type="number"
                      placeholder="0.00"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 rounded-2xl text-sm font-bold focus:border-brand-500 outline-none placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 tracking-wider mb-2 block ml-1">Wing Allocation</label>
                    <select
                      value={formData.details.buildingName}
                      onChange={(e) => setFormData({...formData, details: {...formData.details, buildingName: e.target.value}})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 rounded-2xl text-sm font-bold focus:border-brand-500 outline-none appearance-none"
                    >
                      <option value="">Society Wide</option>
                      {Array.from({length: 24}, (_, i) => `A-${i+1}`).map(w => <option key={w} value={w}>Wing {w}</option>)}
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold text-[11px] tracking-wider hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 active:scale-95 transform duration-100 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                  Add Expense
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
