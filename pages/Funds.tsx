import React from 'react';
import { Wallet, TrendingUp, AlertCircle, CheckCircle2, ArrowRight, PieChart } from 'lucide-react';
import { FUNDS } from '../constants';
import { useLanguage } from '../components/LanguageContext';

const Funds: React.FC = () => {
  const { t } = useLanguage();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'Pending': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      case 'Overdue': return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default: return 'text-slate-600 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="pb-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 bg-brand-50 dark:bg-brand-900/20 px-3 py-1 rounded-full w-fit mb-3">
            <Wallet size={14} className="text-brand-600 dark:text-brand-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              Financial Overview
            </span>
          </div>
          <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
            {t('funds_tracker')}
          </h3>
          <p className="text-slate-500 mt-1 text-sm font-medium uppercase tracking-wider">
            Transparent tracking of society maintenance and expenses
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95">
            Download Report
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-95">
            Pay Maintenance
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl text-slate-900 dark:text-white relative overflow-hidden shadow-sm lg:col-span-2">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 rounded-full opacity-5 blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center text-brand-600 dark:text-brand-400">
                <TrendingUp size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Total Reserve Fund</span>
                <h4 className="text-3xl font-bold">₹ 24,50,000</h4>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Monthly Collection</span>
                <h5 className="text-xl font-bold text-slate-900 dark:text-white">₹ 4,80,000</h5>
                <div className="flex items-center gap-1 mt-2 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  <TrendingUp size={12} />
                  <span>+12% vs last month</span>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Pending Dues</span>
                <h5 className="text-xl font-bold text-slate-900 dark:text-white">₹ 45,000</h5>
                <div className="flex items-center gap-1 mt-2 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                  <AlertCircle size={12} />
                  <span>15 Households</span>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">This Month Expenses</span>
                <h5 className="text-xl font-bold text-slate-900 dark:text-white">₹ 1,20,000</h5>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-brand-600 h-full" style={{ width: '45%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl flex flex-col justify-center items-center text-center shadow-sm">
          <div className="w-20 h-20 bg-brand-50 dark:bg-brand-900/20 rounded-full flex items-center justify-center mb-6">
            <PieChart size={32} className="text-brand-600 dark:text-brand-400" />
          </div>
          <h5 className="text-xl font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Collection Status</h5>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-[200px]">
            92% of residents have paid their maintenance for this quarter.
          </p>
          <button className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest hover:underline">
            View Defaulters List
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h5 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Recent Transactions</h5>
          <div className="flex gap-2">
            <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all">
              <option>All Transactions</option>
              <option>Income</option>
              <option>Expense</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {FUNDS.map((fund) => (
                <tr key={fund.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-6">
                    <div className="font-bold text-slate-900 dark:text-white uppercase">{fund.title}</div>
                    <div className="text-[10px] font-medium text-slate-400 mt-0.5">ID: #TXN-{fund.id}</div>
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-[10px] font-bold uppercase tracking-wider rounded-full">
                      Maintenance
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{fund.date}</div>
                  </td>
                  <td className="p-6">
                    <div className="font-bold text-slate-900 dark:text-white">₹ {fund.amount}</div>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(fund.status)}`}>
                      {fund.status}
                    </span>
                  </td>
                  <td className="p-6">
                    <button className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:bg-brand-600 hover:text-white transition-all active:scale-90">
                      <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-center bg-slate-50/50 dark:bg-slate-800/50">
          <button className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-brand-600 transition-colors">
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  );
};

export default Funds;
