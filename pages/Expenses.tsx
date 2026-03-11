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
    <div className="pb-12 animate-fade-in crt-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-8 border-b-4 border-cyan-500/30">
        <div>
          <h1 className="text-4xl font-black text-cyan-400 tracking-tighter glitch-text mb-2" data-text={t('saurashtra') + ' ' + t('treasury')}>
            {t('saurashtra')} <span className="text-magenta-500">{t('treasury')}</span>
          </h1>
          <p className="text-cyan-700 font-bold font-mono">
            {`> ${t('exp_desc')}`}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-black border-2 border-cyan-500 text-cyan-400 px-6 py-3 font-black text-[10px] uppercase tracking-widest hover:bg-cyan-400 hover:text-black transition-all shadow-[4px_4px_0px_#ff00ff]"
          >
            <Download size={16} />
            {t('export')}
          </button>
          {isAdmin && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-magenta-500 text-white border-2 border-black px-6 py-3 font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-magenta-500 hover:border-magenta-500 transition-all shadow-[4px_4px_0px_#00ffff] active:scale-95 transform duration-100"
            >
              <Plus size={18} strokeWidth={3} />
              {t('exp_log_new')}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-black border-4 border-cyan-500 p-8 relative overflow-hidden shadow-[8px_8px_0px_#ff00ff]">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-magenta-500 rounded-full opacity-10 blur-3xl" />
            <div className="relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-700 block mb-2">
                {`> ${t('total_exp')}`}
              </span>
              <h3 className="text-4xl font-black tracking-tighter text-cyan-400 mb-8">
                ₹{totalExpense.toLocaleString()}
              </h3>
              <div className="h-1 bg-cyan-900/30 mb-6" />
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-700">{t('active_records')}</span>
                  <span className="text-sm font-black text-cyan-400">{expenses.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-700">{t('awaiting_appr')}</span>
                  <span className="text-sm font-black text-magenta-500 animate-pulse">
                    ₹{expenses.filter(e => e.status === 'Pending').reduce((s, e) => s + e.amount, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black p-6 border-4 border-cyan-500/30 shadow-[6px_6px_0px_#ff00ff]">
            <div className="flex items-center gap-2 text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-4">
              <Filter size={14} /> {t('exp_category')}
            </div>
            <div className="space-y-2">
              <button 
                onClick={() => setFilterType('ALL')}
                className={`w-full text-left px-4 py-3 border-2 transition-all text-[10px] font-black uppercase tracking-widest ${
                  filterType === 'ALL' 
                    ? 'bg-cyan-400 text-black border-black shadow-[2px_2px_0px_#ff00ff]' 
                    : 'text-cyan-700 border-transparent hover:border-cyan-500 hover:text-cyan-400'
                }`}
              >
                All Categories
              </button>
              {EXPENSE_CATEGORIES.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setFilterType(cat.id)}
                  className={`w-full text-left px-4 py-3 border-2 transition-all text-[10px] font-black uppercase tracking-widest ${
                    filterType === cat.id 
                      ? 'bg-cyan-400 text-black border-black shadow-[2px_2px_0px_#ff00ff]' 
                      : 'text-cyan-700 border-transparent hover:border-cyan-500 hover:text-cyan-400'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-black border-4 border-cyan-500/30 overflow-hidden shadow-[8px_8px_0px_#00ffff]">
            {loading ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <Loader2 size={40} className="animate-spin text-cyan-400 mb-4" />
                <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest">
                  Accessing Ledger...
                </span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black border-b-4 border-cyan-500/30">
                    <tr>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-cyan-700 uppercase tracking-widest">Payee</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-cyan-700 uppercase tracking-widest">Allocation</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-cyan-700 uppercase tracking-widest">{t('amount')}</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-cyan-700 uppercase tracking-widest">Workflow</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-cyan-900/10">
                    {expenses.map((exp) => (
                      <tr key={exp.id || exp._id} className="hover:bg-cyan-900/10 transition-colors">
                        <td className="px-8 py-6">
                          <div className="text-sm font-black text-cyan-400 mb-1">{exp.payeeName}</div>
                          <div className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider font-mono">{`> ${exp.type}`}</div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest">
                            {exp.details?.buildingName ? `Wing ${exp.details.buildingName}` : 'Society Wide'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-lg font-black text-cyan-400">₹{exp.amount.toLocaleString()}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 border-2 text-[10px] font-black uppercase tracking-widest ${
                            exp.status === 'Paid' 
                              ? 'bg-cyan-400 text-black border-black shadow-[2px_2px_0px_#ff00ff]' 
                              : 'bg-magenta-500 text-white border-black shadow-[2px_2px_0px_#00ffff]'
                          }`}>
                            {exp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {expenses.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-20 text-center">
                          <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm crt-screen">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-black w-full max-w-lg border-4 border-magenta-500 shadow-[12px_12px_0px_#00ffff] overflow-hidden"
            >
              <div className="p-6 border-b-4 border-magenta-500 flex justify-between items-center bg-black">
                <h2 className="text-2xl font-black text-cyan-400 tracking-tight glitch-text" data-text="Log Payout">Log Payout</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 border-2 border-magenta-500 text-magenta-500 hover:bg-magenta-500 hover:text-white transition-all">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleAddExpense} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-2 block ml-1">{`> Expense Category`}</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-black border-2 border-cyan-500 text-cyan-400 px-4 py-3 text-sm font-black focus:border-magenta-500 outline-none appearance-none"
                  >
                    {EXPENSE_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-2 block ml-1">{`> Payee / Vendor Name`}</label>
                  <input 
                    type="text"
                    placeholder="e.g. Surat Safai Agency"
                    required
                    value={formData.payeeName}
                    onChange={(e) => setFormData({...formData, payeeName: e.target.value})}
                    className="w-full bg-black border-2 border-cyan-500 text-cyan-400 px-4 py-3 text-sm font-black focus:border-magenta-500 outline-none placeholder:text-cyan-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-2 block ml-1">{`> Amount (₹)`}</label>
                    <input 
                      type="number"
                      placeholder="0.00"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full bg-black border-2 border-cyan-500 text-cyan-400 px-4 py-3 text-sm font-black focus:border-magenta-500 outline-none placeholder:text-cyan-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-2 block ml-1">{`> Wing Allocation`}</label>
                    <select
                      value={formData.details.buildingName}
                      onChange={(e) => setFormData({...formData, details: {...formData.details, buildingName: e.target.value}})}
                      className="w-full bg-black border-2 border-cyan-500 text-cyan-400 px-4 py-3 text-sm font-black focus:border-magenta-500 outline-none appearance-none"
                    >
                      <option value="">Society Wide</option>
                      {Array.from({length: 24}, (_, i) => `A-${i+1}`).map(w => <option key={w} value={w}>Wing {w}</option>)}
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-magenta-500 text-white border-2 border-black py-4 font-black text-[11px] uppercase tracking-widest hover:bg-black hover:text-magenta-500 hover:border-magenta-500 transition-all shadow-[8px_8px_0px_#00ffff] active:scale-95 transform duration-100 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
