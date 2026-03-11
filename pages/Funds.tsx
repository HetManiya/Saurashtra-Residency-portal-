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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 bg-brand-50 dark:bg-brand-900/20 px-3 py-1 rounded-full w-fit mb-3">
            <Wallet size={14} className="text-brand-600 dark:text-brand-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">
              Financial Overview
            </span>
          </div>
          <h3 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
            {t('funds_tracker')}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Transparent tracking of society maintenance and expenses
          </p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Download Report
          </button>
          <button className="flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/20">
            Pay Maintenance
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="bg-slate-900 dark:bg-slate-800 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl lg:col-span-2">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 rounded-full opacity-20 blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                <TrendingUp size={24} className="text-brand-400" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Total Reserve Fund</span>
                <h4 className="text-3xl font-black">₹ 24,50,000</h4>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Monthly Collection</span>
                <h5 className="text-xl font-bold">₹ 4,80,000</h5>
                <div className="flex items-center gap-1 mt-2 text-green-400 text-xs font-bold">
                  <TrendingUp size={12} />
                  <span>+12% vs last month</span>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Pending Dues</span>
                <h5 className="text-xl font-bold">₹ 45,000</h5>
                <div className="flex items-center gap-1 mt-2 text-amber-400 text-xs font-bold">
                  <AlertCircle size={12} />
                  <span>15 Households</span>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">This Month Expenses</span>
                <h5 className="text-xl font-bold">₹ 1,20,000</h5>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-brand-400 h-full rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6 relative">
            <PieChart size={32} className="text-green-600" />
            <div className="absolute inset-0 border-4 border-green-100 dark:border-green-900/30 rounded-full" />
            <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent border-l-transparent rotate-45" />
          </div>
          <h5 className="text-xl font-black text-slate-900 dark:text-white mb-2">Collection Status</h5>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-[200px]">
            92% of residents have paid their maintenance for this quarter.
          </p>
          <button className="text-xs font-black text-brand-600 uppercase tracking-widest hover:underline">
            View Defaulters List
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h5 className="text-xl font-black text-slate-900 dark:text-white">Recent Transactions</h5>
          <div className="flex gap-2">
            <select className="bg-slate-50 dark:bg-slate-800 border-none text-xs font-bold uppercase tracking-widest rounded-xl px-4 py-2 text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-brand-500">
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
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {FUNDS.map((fund) => (
                <tr key={fund.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-6">
                    <div className="font-bold text-slate-900 dark:text-white">{fund.title}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">ID: #TXN-{fund.id}</div>
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                      Maintenance
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-300">{fund.date}</div>
                  </td>
                  <td className="p-6">
                    <div className="font-black text-slate-900 dark:text-white">₹ {fund.amount}</div>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(fund.status)}`}>
                      {fund.status}
                    </span>
                  </td>
                  <td className="p-6">
                    <button className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-colors">
                      <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-center">
          <button className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-brand-600 transition-colors">
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  );
};

export default Funds;
