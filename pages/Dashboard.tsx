
import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, HandCoins, ShieldCheck, Zap, 
  Droplets, TreePine, DoorOpen, Home, ArrowUpRight,
  Activity, BrainCircuit, BarChart3, TrendingUp, AlertCircle,
  BellRing, Command, Settings, Smartphone, CreditCard, Clock, Sun, Moon,
  ShieldAlert, Receipt, QrCode, LifeBuoy, Siren, UserPlus, Sparkles
} from 'lucide-react';
import { SOCIETY_INFO, BUILDINGS, NOTICES, UTILITY_SUMMARY, MAINTENANCE_SAMPLES } from '../constants';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [prediction, setPrediction] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('sr_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    
    const fetchPrediction = async () => {
      setLoadingAi(true);
      const pred = await api.getExpensePrediction(UTILITY_SUMMARY);
      setPrediction(pred);
      setLoadingAi(false);
    };
    fetchPrediction();
  }, []);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'COMMITTEE';

  const AdminView = () => (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-950 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-[100px] -mr-40 -mt-40 group-hover:scale-125 transition-transform duration-1000" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center h-full gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10">
                 <ShieldAlert size={14} className="text-amber-500" /> Executive Console
              </div>
              <h1 className="text-5xl font-black tracking-tighter leading-none">
                Saurashtra <span className="text-brand-500">Analytics</span>
              </h1>
              <p className="text-slate-400 font-medium max-w-sm text-lg leading-relaxed">
                Overseeing 24 blocks in Pasodara. Society ecosystem is currently <span className="text-brand-400 font-black">HEALTHY</span>.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 shrink-0">
               <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-center backdrop-blur-sm">
                  <p className="text-3xl font-black mb-1">94%</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Funds Collected</p>
               </div>
               <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-center backdrop-blur-sm">
                  <p className="text-3xl font-black mb-1">02</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Open Tickets</p>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm bento-card flex flex-col justify-between">
           <div className="flex justify-between items-center">
              <div className="p-4 bg-brand-50 dark:bg-brand-900/10 rounded-2xl text-brand-600"><Users size={32} /></div>
              <span className="text-xs font-black text-slate-400">Total Families</span>
           </div>
           <div>
              <h4 className="text-5xl font-black tracking-tighter dark:text-white mb-1">480</h4>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0">{t('residents')}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 bento-card">
           <div className="flex justify-between items-center mb-10">
              <h5 className="font-black text-xl mb-0 d-flex align-items-center gap-3">
                <TrendingUp size={24} className="text-brand-600" /> Monthly Flow
              </h5>
              <span className="badge rounded-pill bg-emerald-50 text-brand-700 py-2.5 px-4 border border-brand-100 font-black">+12.4%</span>
           </div>
           <div className="h-44 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[{v:4000},{v:3000},{v:5000},{v:4500},{v:6000}]}>
                  <defs>
                    <linearGradient id="colorBrand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="#059669" fill="url(#colorBrand)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
           </div>
           <div className="flex justify-between items-end pt-8 border-t dark:border-slate-800">
              <div>
                 <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Due Amount</p>
                 <h4 className="text-2xl font-black dark:text-white mb-0">₹45,500</h4>
              </div>
              <button onClick={() => navigate('/expenses')} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-brand-600 transition-all border dark:border-slate-700 shadow-sm">
                 <ArrowUpRight size={20} />
              </button>
           </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-900 to-slate-950 rounded-[3rem] p-10 text-white shadow-xl bento-card relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
           <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg"><BrainCircuit size={28} /></div>
                 <div>
                    <p className="text-[10px] font-black uppercase text-brand-400 tracking-widest mb-0">Intelligence Unit</p>
                    <h5 className="font-black">Society Forecast</h5>
                 </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex-1 mb-6 italic text-sm text-slate-300 leading-relaxed font-medium backdrop-blur-md">
                "{loadingAi ? "Calculating neighborhood patterns..." : (prediction || "Optimizing utility consumption based on the last 12 months of wing data.")}"
              </div>
              <div className="flex items-center gap-2 text-brand-400 text-[10px] font-black uppercase tracking-widest">
                 <Sparkles size={14} /> System Confidence: 99.2%
              </div>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 bento-card">
           <h5 className="font-black text-xl mb-10 d-flex align-items-center gap-3">
              <ShieldCheck size={24} className="text-brand-500" /> Infrastructure
           </h5>
           <div className="space-y-4">
              {[
                { label: 'Wing A-12 Lift', status: 'In Service', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
                { label: 'Water Reserve', status: 'Optimal', icon: Droplets, color: 'text-brand-500', bg: 'bg-brand-50' },
                { label: 'CCTV Grid', status: 'Secure', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent dark:border-slate-700 hover:border-brand-500/20 transition-all">
                   <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${item.bg} dark:bg-slate-900`}><item.icon size={18} className={item.color} /></div>
                      <span className="text-xs font-extrabold dark:text-white">{item.label}</span>
                   </div>
                   <span className="text-[9px] font-black uppercase text-slate-400">{item.status}</span>
                </div>
              ))}
           </div>
           <button onClick={() => navigate('/audit-logs')} className="w-full mt-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-500/20 transition-all">
              Comprehensive Audit
           </button>
        </div>
      </div>
    </div>
  );

  const ResidentView = () => (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-brand-600 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40 group-hover:scale-125 transition-transform duration-1000" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center h-full gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                 <Home size={14} className="text-amber-300" /> Home Status: Excellent
              </div>
              <h1 className="text-5xl font-black tracking-tighter leading-none">
                {t('welcome')}, <span className="text-brand-200">{user?.name?.split(' ')[0]}</span>
              </h1>
              <p className="text-brand-50 font-medium max-w-sm text-lg leading-relaxed">
                Your unit {user?.flatId || 'A-1-101'} is current with all society contributions. Enjoy your day!
              </p>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
               <button onClick={() => navigate('/maintenance')} className="px-10 py-5 bg-white text-brand-600 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-brand-50 transition-all active:scale-95 flex items-center gap-3">
                  <CreditCard size={18} /> {t('quick_pay')}
               </button>
               <button onClick={() => navigate('/visitor-pass')} className="px-10 py-5 bg-brand-700 border border-brand-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-brand-800 transition-all flex items-center gap-3">
                  <QrCode size={18} /> New Visitor Pass
               </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm bento-card flex flex-col justify-between">
           <div className="flex justify-between items-center">
              <div className="p-4 bg-brand-50 dark:bg-brand-900/10 rounded-2xl text-brand-600"><Receipt size={32} /></div>
              <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Balance Clear</span>
           </div>
           <div>
              <h4 className="text-4xl font-black tracking-tighter dark:text-white mb-1">₹0.00</h4>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0">Outstanding Amount</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-xl bento-card">
           <h5 className="font-black text-xl mb-10 d-flex align-items-center gap-3"><Command size={24} /> {t('launchpad')}</h5>
           <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Siren, label: t('sos'), color: 'bg-rose-600', path: '/emergency' },
                { icon: LifeBuoy, label: 'Support', color: 'bg-amber-600', path: '/helpdesk' },
                { icon: Building2, label: 'Directory', color: 'bg-brand-600', path: '/buildings' },
                { icon: UserPlus, label: 'Profile', color: 'bg-brand-800', path: '/' },
              ].map((btn, i) => (
                <button key={i} onClick={() => navigate(btn.path)} className={`w-full aspect-square rounded-[2rem] flex flex-col items-center justify-center gap-2 ${btn.color} transition-all hover:scale-105 active:scale-95 shadow-xl`}>
                  <btn.icon size={24} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{btn.label}</span>
                </button>
              ))}
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 lg:col-span-2 bento-card shadow-sm">
           <div className="flex justify-between items-center mb-10">
              <h5 className="font-black text-xl mb-0 d-flex align-items-center gap-3">
                <BellRing size={24} className="text-brand-500" /> Recent Updates
              </h5>
              <button onClick={() => navigate('/notices')} className="text-[10px] font-black uppercase text-brand-600 tracking-widest hover:underline">Full Feed</button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {NOTICES.slice(0, 4).map((notice, i) => (
                <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-transparent dark:border-slate-700 transition-all hover:border-brand-500/30 cursor-pointer group/item">
                  <div className="flex justify-between items-center mb-4">
                    <span className="px-3 py-1 bg-white dark:bg-slate-950 rounded-full text-[8px] font-black uppercase tracking-widest text-brand-600">{notice.category}</span>
                    <div className="w-2 h-2 rounded-full bg-brand-600 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-white mb-2 line-clamp-1">{notice.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{notice.content}</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pb-12 page-transition">
      {isAdmin ? <AdminView /> : <ResidentView />}
    </div>
  );
};

export default Dashboard;
