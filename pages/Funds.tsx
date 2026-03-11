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
          <div className="flex items-center gap-2 bg-black border border-cyan-500 px-3 py-1 rounded-none w-fit mb-3 shadow-[2px_2px_0px_#00ffff]">
            <Wallet size={14} className="text-cyan-500" />
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-cyan-500">
              Financial Overview
            </span>
          </div>
          <h3 className="text-5xl font-black tracking-tighter text-cyan-400 uppercase glitch-text">
            {t('funds_tracker')}
          </h3>
          <p className="text-cyan-500/70 mt-2 font-mono text-xs uppercase tracking-widest">
            Transparent tracking of society maintenance and expenses
          </p>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-black border-2 border-cyan-500 text-cyan-500 px-5 py-2.5 rounded-none font-mono font-black text-xs uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-colors shadow-[4px_4px_0px_#ff00ff]">
            Download Report
          </button>
          <button className="flex items-center gap-2 bg-magenta-500 text-black px-5 py-2.5 border-2 border-black rounded-none font-mono font-black text-xs uppercase tracking-widest hover:bg-black hover:text-magenta-500 hover:border-magenta-500 transition-colors shadow-[4px_4px_0px_#00ffff]">
            Pay Maintenance
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="bg-black border-4 border-magenta-500 p-8 rounded-none text-cyan-400 relative overflow-hidden shadow-[12px_12px_0px_#00ffff] lg:col-span-2 crt-screen">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500 rounded-full opacity-10 blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 border-2 border-cyan-500 bg-black flex items-center justify-center shadow-[4px_4px_0px_#ff00ff]">
                <TrendingUp size={24} className="text-cyan-400" />
              </div>
              <div>
                <span className="text-xs font-mono font-black text-magenta-500 uppercase tracking-widest block">Total Reserve Fund</span>
                <h4 className="text-3xl font-black font-mono">₹ 24,50,000</h4>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-black border-2 border-cyan-500/30 p-5 shadow-[4px_4px_0px_#ff00ff33]">
                <span className="text-[10px] font-mono font-black text-cyan-500/50 uppercase tracking-widest block mb-2">Monthly Collection</span>
                <h5 className="text-xl font-black font-mono text-cyan-400">₹ 4,80,000</h5>
                <div className="flex items-center gap-1 mt-2 text-green-500 text-xs font-mono font-black">
                  <TrendingUp size={12} />
                  <span>+12% VS LAST MONTH</span>
                </div>
              </div>
              <div className="bg-black border-2 border-cyan-500/30 p-5 shadow-[4px_4px_0px_#ff00ff33]">
                <span className="text-[10px] font-mono font-black text-cyan-500/50 uppercase tracking-widest block mb-2">Pending Dues</span>
                <h5 className="text-xl font-black font-mono text-cyan-400">₹ 45,000</h5>
                <div className="flex items-center gap-1 mt-2 text-amber-500 text-xs font-mono font-black">
                  <AlertCircle size={12} />
                  <span>15 HOUSEHOLDS</span>
                </div>
              </div>
              <div className="bg-black border-2 border-cyan-500/30 p-5 shadow-[4px_4px_0px_#ff00ff33]">
                <span className="text-[10px] font-mono font-black text-cyan-500/50 uppercase tracking-widest block mb-2">This Month Expenses</span>
                <h5 className="text-xl font-black font-mono text-cyan-400">₹ 1,20,000</h5>
                <div className="w-full bg-cyan-900/30 h-1.5 rounded-none mt-3 overflow-hidden border border-cyan-500/30">
                  <div className="bg-magenta-500 h-full" style={{ width: '45%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black border-4 border-cyan-500 p-8 rounded-none flex flex-col justify-center items-center text-center shadow-[12px_12px_0px_#ff00ff] crt-screen">
          <div className="w-20 h-20 border-4 border-magenta-500 flex items-center justify-center mb-6 relative shadow-[4px_4px_0px_#00ffff]">
            <PieChart size={32} className="text-magenta-500" />
          </div>
          <h5 className="text-xl font-black text-cyan-400 mb-2 uppercase font-mono glitch-text">Collection Status</h5>
          <p className="text-sm text-cyan-500/70 mb-6 max-w-[200px] font-mono uppercase text-xs">
            92% of residents have paid their maintenance for this quarter.
          </p>
          <button className="text-xs font-black text-magenta-500 uppercase tracking-widest hover:underline font-mono">
            View Defaulters List
          </button>
        </div>
      </div>

      <div className="bg-black border-4 border-magenta-500 overflow-hidden shadow-[12px_12px_0px_#00ffff] crt-screen">
        <div className="p-8 border-b-2 border-magenta-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black">
          <h5 className="text-xl font-black text-cyan-400 uppercase font-mono glitch-text">Recent Transactions</h5>
          <div className="flex gap-2">
            <select className="bg-black border-2 border-cyan-500 text-cyan-400 text-xs font-mono font-black uppercase tracking-widest px-4 py-2 focus:ring-2 focus:ring-magenta-500 outline-none shadow-[2px_2px_0px_#ff00ff]">
              <option>All Transactions</option>
              <option>Income</option>
              <option>Expense</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black border-b-2 border-magenta-500/30">
                <th className="p-6 text-[10px] font-mono font-black text-cyan-500 uppercase tracking-widest">Description</th>
                <th className="p-6 text-[10px] font-mono font-black text-cyan-500 uppercase tracking-widest">Category</th>
                <th className="p-6 text-[10px] font-mono font-black text-cyan-500 uppercase tracking-widest">Date</th>
                <th className="p-6 text-[10px] font-mono font-black text-cyan-500 uppercase tracking-widest">Amount</th>
                <th className="p-6 text-[10px] font-mono font-black text-cyan-500 uppercase tracking-widest">Status</th>
                <th className="p-6 text-[10px] font-mono font-black text-cyan-500 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-magenta-500/10">
              {FUNDS.map((fund) => (
                <tr key={fund.id} className="group hover:bg-cyan-500/5 transition-colors">
                  <td className="p-6">
                    <div className="font-black text-cyan-400 font-mono uppercase">{fund.title}</div>
                    <div className="text-[10px] font-mono text-cyan-900 mt-0.5">ID: #TXN-{fund.id}</div>
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 border border-cyan-500 text-cyan-500 text-[10px] font-mono font-black uppercase tracking-wider">
                      Maintenance
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="text-sm font-mono font-black text-cyan-500/70">{fund.date}</div>
                  </td>
                  <td className="p-6">
                    <div className="font-black text-cyan-400 font-mono">₹ {fund.amount}</div>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 border font-mono text-[10px] font-black uppercase tracking-wider ${
                      fund.status === 'Paid' ? 'border-green-500 text-green-500' :
                      fund.status === 'Pending' ? 'border-amber-500 text-amber-500' :
                      'border-red-500 text-red-500'
                    }`}>
                      {fund.status}
                    </span>
                  </td>
                  <td className="p-6">
                    <button className="w-8 h-8 border-2 border-cyan-500 bg-black flex items-center justify-center text-cyan-500 hover:bg-cyan-500 hover:text-black transition-colors shadow-[2px_2px_0px_#ff00ff]">
                      <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 border-t-2 border-magenta-500 flex justify-center bg-black">
          <button className="text-xs font-mono font-black text-cyan-900 uppercase tracking-widest hover:text-magenta-500 transition-colors">
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  );
};

export default Funds;
