import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, HandCoins, ShieldCheck, Zap, 
  Droplets, TreePine, DoorOpen, Home, ArrowUpRight,
  Activity, BrainCircuit, BarChart3, TrendingUp, AlertCircle,
  BellRing, Command, Settings, Smartphone, CreditCard, Clock, Sun, Moon,
  ShieldAlert, Receipt, QrCode, LifeBuoy, Siren, UserPlus
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
        <div className="lg:col-span-2 bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600/20 rounded-full blur-[100px] -mr-40 -mt-40 group-hover:scale-125 transition-transform duration-1000" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center h-full gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                 <ShieldAlert size={14} className="text-amber-500" /> Committee Terminal
              </div>
              <h1 className="text-5xl font-black tracking-tighter leading-none">
                Command <span className="text-brand-400">Center</span>
              </h1>
              <p className="text-slate-300 font-medium max-w-sm text-lg leading-relaxed">
                Overseeing 24 blocks and 480 families in Pasodara. Society pulse is <span className="text-emerald-400 font-black">STABLE</span>.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 shrink-0">
               <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-center">
                  <p className="text-3xl font-black mb-1">94%</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Collection</p>
               </div>
               <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-center">
                  <p className="text-3xl font-black mb-1">02</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">SOS Active</p>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm bento-card flex flex-col justify-between">
           <div className="flex justify-between items-center">
              <div className="p-4 bg-brand-50 dark:bg-brand-600/10 rounded-2xl text-brand-600"><Users size={32} /></div>
              <span className="text-xs font-black text-slate-400">Active</span>
           </div>
           <div>
              <h4 className="text-5xl font-black tracking-tighter dark:text-white mb-1">480</h4>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0">{t('residents')}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Analytics Card */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 bento-card">
           <div className="flex justify-between items-center mb-10">
              <h5 className="font-black text-xl mb-0 d-flex align-items-center gap-3">
                <TrendingUp size={24} className="text-brand-600" /> {t('revenue')}
              </h5>
              <span className="badge rounded-pill bg-emerald-50 text-emerald-700 py-2.5 px-4 border border-emerald-100 font-black">+12.4%</span>
           </div>
           <div className="h-44 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[{v:4000},{v:3000},{v:5000},{v:4500},{v:6000}]}>
                  <Area type="monotone" dataKey="v" stroke="#2563eb" fill="#2563eb15" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
           </div>
           <div className="flex justify-between items-end pt-8 border-t dark:border-slate-800">
              <div>
                 <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Outstanding Dues</p>
                 <h4 className="text-2xl font-black dark:text-white mb-0">₹45,500</h4>
              </div>
              <button onClick={() => navigate('/expenses')} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-brand-600 transition-all border dark:border-slate-700">
                 <ArrowUpRight size={20} />
              </button>
           </div>
        </div>

        {/* AI Financial Forecast */}
        <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-xl bento-card relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-brand-600/20 rounded-full blur-3xl -mr-16 -mt-16" />
           <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg"><BrainCircuit size={28} /></div>
                 <div>
                    <p className="text-[10px] font-black uppercase text-brand-400 tracking-widest mb-0">GenAI Engine</p>
                    <h5 className="font-black">Treasury Forecast</h5>
                 </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex-1 mb-6 italic text-sm text-slate-300 leading-relaxed font-medium">
                "{loadingAi ? "Analyzing pattern history..." : (prediction || "Optimizing fund allocation strategy based on historical utility consumption.")}"
              </div>
              <div className="flex items-center gap-2 text-brand-400 text-[10px] font-black uppercase tracking-widest">
                 <AlertCircle size={14} /> Confidence Score: 98%
              </div>
           </div>
        </div>

        {/* Infrastructure Monitor */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 bento-card">
           <h5 className="font-black text-xl mb-10 d-flex align-items-center gap-3">
              <ShieldCheck size={24} className="text-emerald-500" /> {t('infrastructure')}
           </h5>
           <div className="space-y-4">
              {[
                { label: 'Wing A-12 Lift', status: 'Maintenance', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
                { label: 'Water Reserve', status: 'Optimal', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' },
                // Added fix for missing Siren icon
                { label: 'Fire Grid', status: 'Active', icon: Siren, color: 'text-rose-500', bg: 'bg-rose-50' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-700">
                   <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${item.bg} dark:bg-slate-800`}><item.icon size={18} className={item.color} /></div>
                      <span className="text-xs font-extrabold dark:text-white">{item.label}</span>
                   </div>
                   <span className="text-[9px] font-black uppercase text-slate-400">{item.status}</span>
                </div>
              ))}
           </div>
           <button onClick={() => navigate('/audit-logs')} className="w-full mt-8 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">
              Audit Full Infrastructure
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
                 <Home size={14} className="text-amber-300" /> My Home Console
              </div>
              <h1 className="text-5xl font-black tracking-tighter leading-none">
                {t('welcome')}, <span className="text-brand-200">{user?.name?.split(' ')[0]}</span>
              </h1>
              <p className="text-brand-50 font-medium max-w-sm text-lg leading-relaxed">
                Unit {user?.flatId || 'A-1-101'} is currently in good standing. No pending issues reported.
              </p>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
               <button onClick={() => navigate('/maintenance')} className="px-10 py-5 bg-white text-brand-600 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-brand-50 transition-all active:scale-95 flex items-center gap-3">
                  <CreditCard size={18} /> {t('quick_pay')}
               </button>
               <button onClick={() => navigate('/visitor-pass')} className="px-10 py-5 bg-white/10 border border-white/20 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-3">
                  <QrCode size={18} /> Invite Guest
               </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm bento-card flex flex-col justify-between">
           <div className="flex justify-between items-center">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-600/10 rounded-2xl text-emerald-600"><Receipt size={32} /></div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Paid</span>
           </div>
           <div>
              <h4 className="text-4xl font-black tracking-tighter dark:text-white mb-1">₹0.00</h4>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0">Outstanding Dues</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Launchpad */}
        <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-xl bento-card">
           <h5 className="font-black text-xl mb-10 d-flex align-items-center gap-3"><Command size={24} /> {t('launchpad')}</h5>
           <div className="grid grid-cols-2 gap-4">
              {[
                // Added fix for missing Siren icon
                { icon: Siren, label: t('sos'), color: 'bg-rose-500', path: '/emergency' },
                { icon: LifeBuoy, label: t('helpdesk'), color: 'bg-amber-500', path: '/helpdesk' },
                { icon: Building2, label: t('assets'), color: 'bg-blue-500', path: '/buildings' },
                // Added fix for missing UserPlus icon
                { icon: UserPlus, label: t('profile'), color: 'bg-slate-900', path: '/' },
              ].map((btn, i) => (
                <button key={i} onClick={() => navigate(btn.path)} className={`w-full aspect-square rounded-[2rem] flex flex-col items-center justify-center gap-2 ${btn.color} transition-all hover:scale-105 active:scale-95 shadow-xl`}>
                  <btn.icon size={24} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{btn.label}</span>
                </button>
              ))}
           </div>
        </div>

        {/* Notices */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 lg:col-span-2 bento-card">
           <div className="flex justify-between items-center mb-10">
              <h5 className="font-black text-xl mb-0 d-flex align-items-center gap-3">
                <BellRing size={24} className="text-amber-500" /> {t('broadcasts')}
              </h5>
              <button onClick={() => navigate('/notices')} className="text-[10px] font-black uppercase text-brand-600 tracking-widest hover:underline">View All</button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {NOTICES.slice(0, 4).map((notice, i) => (
                <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border dark:border-slate-700 transition-all hover:border-brand-600 cursor-pointer group/item">
                  <div className="flex justify-between items-center mb-4">
                    <span className="px-3 py-1 bg-white dark:bg-slate-900 rounded-full text-[8px] font-black uppercase tracking-widest text-slate-500">{notice.category}</span>
                    <div className="w-2 h-2 rounded-full bg-brand-600 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-white mb-2 line-clamp-1">{notice.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{notice.content}</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pb-12">
      {isAdmin ? <AdminView /> : <ResidentView />}
    </div>
  );
};

export default Dashboard;