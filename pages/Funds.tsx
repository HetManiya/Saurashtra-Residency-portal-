
import React from 'react';
import { HandCoins, Target, TrendingUp, Calendar, AlertCircle, Sparkles } from 'lucide-react';
import { FUNDS } from '../constants';
import { useLanguage } from '../components/LanguageContext';

const Funds: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="space-y-10 animate-in slide-in-from-top-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('special_funds')}</h1>
        <p className="text-slate-500 dark:text-slate-400">Tracking collections for festivals and society improvements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {FUNDS.map((fund) => {
          const progress = (fund.totalCollected / fund.targetAmount) * 100;
          return (
            <div key={fund.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-blue-50 dark:bg-brand-900/20 rounded-2xl text-blue-600 dark:text-brand-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <Sparkles size={32} />
                  </div>
                  <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                    progress >= 100 ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {progress >= 100 ? 'Target Achieved' : 'In Progress'}
                  </span>
                </div>
                
                <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-2">{fund.purpose}</h3>
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-8">
                  <Calendar size={16} />
                  {t('fund_starts')} {new Date(fund.date).toLocaleDateString()}
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                      <TrendingUp size={10} /> {t('fund_collected')}
                    </p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">₹{fund.totalCollected.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Target size={10} /> {t('fund_target')}
                    </p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">₹{fund.targetAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="relative h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      progress >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-400">{Math.round(progress)}% of goal reached</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">₹{(fund.targetAmount - fund.totalCollected) > 0 ? (fund.targetAmount - fund.totalCollected).toLocaleString() + ' left' : 'Goal met!'}</span>
                </div>
              </div>
              
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-50 dark:bg-brand-900/10 rounded-full group-hover:scale-110 transition-transform duration-500 pointer-events-none opacity-50" />
            </div>
          );
        })}

        {/* Contribution Info Card */}
        <div className="bg-slate-900 p-8 rounded-[2rem] text-white flex flex-col justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6">
            <HandCoins size={32} />
          </div>
          <h3 className="text-3xl font-black mb-4">{t('fund_how')}</h3>
          <p className="text-slate-400 leading-relaxed mb-8">
            Contributions can be made via UPI, Bank Transfer, or Cash at the society office. All festival funds are used exclusively for celebrations and resident activities.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="font-bold">Transparent Tracking</p>
                <p className="text-xs text-slate-500">Every rupee is accounted for</p>
              </div>
            </div>
            <button className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl uppercase tracking-widest hover:bg-blue-50 transition-colors">
              {t('fund_contribute')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Funds;
