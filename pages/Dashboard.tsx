import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, HandCoins, ShieldCheck, Zap, 
  Droplets, TreePine, DoorOpen, Home, ArrowUpRight,
  Activity, BrainCircuit, BarChart3, TrendingUp, AlertCircle,
  BellRing, Command, Settings, Smartphone, CreditCard, Clock, Sun, Moon,
  ShieldAlert, Receipt, QrCode, LifeBuoy, Siren, UserPlus, Sparkles, Loader2,
  CheckCircle2, Calendar, ChevronRight
} from 'lucide-react';
import { SOCIETY_INFO, BUILDINGS, UTILITY_SUMMARY } from '../constants';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { Notice, Meeting } from '../types';
import { motion } from 'motion/react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [prediction, setPrediction] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [user, setUser] = useState<any>(null);
  const [adminSummary, setAdminSummary] = useState<any>(null);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);
    const storedUser = localStorage.getItem('sr_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    
    const fetchPrediction = async (retries = 0) => {
      if (retries === 0) setLoadingAi(true);
      try {
        const pred = await api.getExpensePrediction(UTILITY_SUMMARY);
        setPrediction(pred);
        setLoadingAi(false);
      } catch (e: any) {
        if (e.message === 'SERVER_STARTING' && retries < 5) {
          setTimeout(() => fetchPrediction(retries + 1), 2000);
          return;
        }
        setPrediction("Forecast temporarily unavailable.");
        setLoadingAi(false);
      }
    };

    const fetchNotices = async (retries = 0) => {
      if (retries === 0) setLoadingNotices(true);
      try {
        const data = await api.getNotices();
        setNotices(data);
        setLoadingNotices(false);
      } catch (e: any) {
        if (e.message === 'SERVER_STARTING' && retries < 5) {
          setTimeout(() => fetchNotices(retries + 1), 2000);
          return;
        }
        setNotices([]);
        setLoadingNotices(false);
      }
    };

    const fetchMeetings = async () => {
      try {
        const data = await api.getMeetings();
        setMeetings(data);
      } catch (e) {
        setMeetings([]);
      }
    };

    const fetchMaintenance = async () => {
      if (storedUser) {
        const u = JSON.parse(storedUser);
        try {
          const data = await api.getMaintenanceRecords(u.flatId);
          setMaintenanceRecords(data);
        } catch (e) {
          setMaintenanceRecords([]);
        }
      }
    };

    const fetchAdminData = async (retries = 0) => {
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.role === 'ADMIN' || u.role === 'COMMITTEE') {
          if (retries === 0) setLoadingAdmin(true);
          try {
            const data = await api.getAdminSummary();
            setAdminSummary(data);
            setLoadingAdmin(false);
          } catch (e: any) {
            if (e.message === 'SERVER_STARTING' && retries < 5) {
              setTimeout(() => fetchAdminData(retries + 1), 2000);
              return;
            }
            setLoadingAdmin(false);
          }
        }
      }
    };

    fetchPrediction();
    fetchNotices();
    fetchMeetings();
    fetchMaintenance();
    fetchAdminData();
  }, []);

  const nextMeeting = meetings
    .filter(m => new Date(m.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const getTimeRemaining = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h remaining`;
  };

  const currentMaintenance = maintenanceRecords[0]; // Assuming latest is first
  const isPaid = currentMaintenance?.status === 'Paid';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'COMMITTEE';

  const handleResolveComplaint = (id: string) => {
    if (adminSummary) {
      const updatedComplaints = adminSummary.recentComplaints.filter((c: any) => c.id !== id);
      setAdminSummary({
        ...adminSummary,
        recentComplaints: updatedComplaints,
        openTickets: Math.max(0, adminSummary.openTickets - 1)
      });
    }
  };

  const AdminView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        {/* Main Hero - 2x2 */}
        <div className="md:col-span-2 md:row-span-2 bg-black rounded-none p-8 text-white shadow-[8px_8px_0px_#00ffff] border-4 border-magenta-500 relative overflow-hidden flex flex-col justify-between group crt-screen">
          <div className="absolute top-0 right-0 w-96 h-96 bg-magenta-500/10 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:bg-magenta-500/20 transition-all duration-500" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black border-2 border-cyan-500 mb-6">
              <ShieldAlert size={14} className="text-magenta-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                Executive Console v1.0
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 leading-[0.9] glitch-text" data-text="Saurashtra Analytics">
              Saurashtra <br />
              <span className="text-magenta-500">Analytics</span>
            </h1>
            <p className="text-cyan-600 text-lg font-bold max-w-sm font-mono">
              Society ecosystem is currently <span className="text-magenta-500 font-black animate-pulse">HEALTHY</span>. All systems operational.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap gap-3 mt-8">
            <button 
              onClick={() => navigate('/registration-approvals')}
              className="bg-cyan-500 text-black px-6 py-3 border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-black hover:text-cyan-500 hover:border-cyan-500 transition-all shadow-[4px_4px_0px_#ff00ff]"
            >
              Approvals
            </button>
            <button 
              onClick={() => navigate('/security-gate')}
              className="bg-magenta-500 text-white px-6 py-3 border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-black hover:text-magenta-500 hover:border-magenta-500 transition-all shadow-[4px_4px_0px_#00ffff]"
            >
              Security
            </button>
            <button 
              onClick={() => navigate('/audit-logs')}
              className="bg-transparent border-2 border-cyan-500 text-cyan-400 px-6 py-3 font-black text-xs uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all"
            >
              Audit
            </button>
          </div>
        </div>

        {/* Residents Count - 1x1 */}
        <div className="bg-black p-6 border-4 border-cyan-500/50 shadow-[4px_4px_0px_#ff00ff] flex flex-col justify-between h-full min-h-[200px] group hover:border-magenta-500 transition-colors">
          <div className="flex justify-between items-start">
            <div className="w-14 h-14 bg-black border-2 border-magenta-500 flex items-center justify-center text-magenta-500 group-hover:bg-magenta-500 group-hover:text-black transition-all">
              <Users size={28} />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest block">Residents</span>
              <h3 className="text-4xl font-black text-cyan-400 glitch-text" data-text="480">480</h3>
            </div>
          </div>
          <div className="mt-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest">Occupancy</span>
              <span className="text-[10px] font-black text-magenta-500 uppercase tracking-widest">92%</span>
            </div>
            <div className="w-full bg-cyan-900/30 h-3 border border-cyan-500/30 overflow-hidden">
              <div className="bg-magenta-500 h-full shadow-[0_0_10px_#ff00ff]" style={{ width: '92%' }} />
            </div>
          </div>
        </div>

        {/* Open Tickets - 1x1 */}
        <div className="bg-black p-6 border-4 border-magenta-500/50 shadow-[4px_4px_0px_#00ffff] flex flex-col justify-between h-full min-h-[200px] group hover:border-cyan-500 transition-colors">
          <div className="flex justify-between items-start">
            <div className="w-14 h-14 bg-black border-2 border-cyan-500 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-all">
              <AlertCircle size={28} />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-magenta-700 uppercase tracking-widest block">Open Tickets</span>
              <h3 className="text-4xl font-black text-magenta-500 glitch-text" data-text={adminSummary?.summary?.openComplaints ?? '02'}>{adminSummary?.summary?.openComplaints ?? '02'}</h3>
            </div>
          </div>
          <button 
            onClick={() => navigate('/helpdesk')}
            className="w-full bg-magenta-500 text-white py-3 border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-black hover:text-magenta-500 hover:border-magenta-500 transition-all mt-4 shadow-[4px_4px_0px_#00ffff]"
          >
            Manage Support
          </button>
        </div>

        {/* Intelligence Unit - 2x1 */}
        <div className="md:col-span-2 bg-black border-4 border-cyan-500 p-6 text-white relative overflow-hidden flex flex-col justify-between shadow-[8px_8px_0px_#ff00ff]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-magenta-600 border-2 border-cyan-400 flex items-center justify-center text-white shadow-[4px_4px_0px_#00ffff]">
              <BrainCircuit size={28} />
            </div>
            <div>
              <span className="text-[10px] font-black text-magenta-500 uppercase tracking-widest block">Intelligence Unit</span>
              <h3 className="text-xl font-black text-cyan-400">Society Forecast</h3>
            </div>
          </div>
          
          <div className="bg-cyan-900/10 border-2 border-cyan-500/30 p-4 backdrop-blur-md mb-4 relative">
            <div className="absolute top-0 left-0 w-2 h-2 bg-cyan-500" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-500" />
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-cyan-500" />
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-cyan-500" />
            <p className="text-cyan-500 text-sm font-bold italic leading-relaxed font-mono">
              "{loadingAi ? "Calculating patterns..." : (prediction || "Optimizing utility consumption based on wing data.")}"
            </p>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-[10px] font-black text-magenta-500 uppercase tracking-widest animate-pulse">
              <Sparkles size={14} /> Confidence: 99.9%
            </div>
            <button 
              onClick={() => navigate('/expenses')}
              className="text-xs font-black text-cyan-400 uppercase tracking-widest hover:text-magenta-500 transition-colors"
            >
              View Details
            </button>
          </div>
        </div>

        {/* Collection Status - 1x1 */}
        <div className="bg-black p-6 border-4 border-cyan-500/50 shadow-[4px_4px_0px_#ff00ff] flex flex-col justify-between h-full min-h-[200px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-black text-cyan-400 flex items-center gap-2">
              <TrendingUp size={20} className="text-magenta-500" /> Collection
            </h3>
            <span className="bg-magenta-500 text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider animate-pulse">Live</span>
          </div>
          
          <div className="flex justify-center py-2 relative">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-cyan-900/20" />
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={351.86} strokeDashoffset={351.86 * (1 - 0.85)} className="text-cyan-400" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-magenta-500">85%</span>
                <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest">PAID</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t-2 border-cyan-500/30">
            <div>
              <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest block">DUE</span>
              <span className="text-sm font-black text-cyan-400">₹1.2M</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest block">PEND.</span>
              <span className="text-sm font-black text-magenta-500">₹180k</span>
            </div>
          </div>
        </div>

        {/* Recent Issues - 1x1 */}
        <div className="bg-black p-6 border-4 border-magenta-500/50 shadow-[4px_4px_0px_#00ffff] flex flex-col justify-between h-full min-h-[200px]">
          <h3 className="text-lg font-black text-magenta-500 flex items-center gap-2 mb-4">
            <AlertCircle size={20} className="text-cyan-400" /> Issues
          </h3>
          
          <div className="space-y-3 flex-1">
            {adminSummary?.recentComplaints?.slice(0, 2).map((complaint: any, index: number) => (
              <div key={complaint.id || index} className="p-3 bg-cyan-900/10 border border-cyan-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black border border-magenta-500 flex items-center justify-center text-magenta-500 shrink-0">
                    <AlertCircle size={14} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-black text-cyan-400 block truncate">{complaint.subject}</span>
                    <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider">{complaint.flatId}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleResolveComplaint(complaint.id)}
                  className="w-8 h-8 bg-cyan-500 text-black flex items-center justify-center hover:bg-magenta-500 hover:text-white transition-all shadow-[2px_2px_0px_#ff00ff]"
                >
                  <CheckCircle2 size={16} />
                </button>
              </div>
            ))}
            {(!adminSummary?.recentComplaints || adminSummary.recentComplaints.length === 0) && (
              <div className="text-center py-4">
                <span className="text-xs font-black text-cyan-700 uppercase tracking-widest">All Clear</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => navigate('/helpdesk')}
            className="w-full text-xs font-black text-cyan-400 uppercase tracking-widest hover:text-magenta-500 transition-colors mt-4"
          >
            View All
          </button>
        </div>
      </div>
    );
  };

  const ResidentView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        {/* Welcome Hero - 2x2 */}
        <div className="md:col-span-2 md:row-span-2 bg-black border-4 border-cyan-500 p-8 text-white shadow-[8px_8px_0px_#ff00ff] relative overflow-hidden flex flex-col justify-between group crt-screen">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:bg-cyan-500/20 transition-all duration-500" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black border-2 border-magenta-500 mb-6">
              <Home size={14} className="text-cyan-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-magenta-500">
                Unit {user?.flatId || 'A-1-101'}
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 leading-[0.9] glitch-text" data-text={`${t('welcome')}, ${user?.name?.split(' ')[0]}`}>
              {t('welcome')}, <br />
              <span className="text-magenta-500">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-cyan-600 text-lg font-bold max-w-sm font-mono">
              {isPaid ? "Your account is fully settled. Thank you for your contribution!" : "You have an outstanding maintenance bill. Please settle it to avoid penalties."}
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap gap-3 mt-8">
            <button 
              onClick={() => navigate('/maintenance')}
              className="bg-cyan-500 text-black px-6 py-3 border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-black hover:text-cyan-500 hover:border-cyan-500 transition-all flex items-center gap-2 shadow-[4px_4px_0px_#ff00ff]"
            >
              <CreditCard size={16} />
              {isPaid ? 'View History' : 'Pay Now'}
            </button>
            <button 
              onClick={() => navigate('/visitor-pass')}
              className="bg-magenta-500 text-white px-6 py-3 border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-black hover:text-magenta-500 hover:border-magenta-500 transition-all flex items-center gap-2 shadow-[4px_4px_0px_#00ffff]"
            >
              <QrCode size={16} />
              New Pass
            </button>
          </div>
        </div>

        {/* Maintenance Balance - 1x1 */}
        <div className="bg-black p-6 border-4 border-cyan-500/50 shadow-[4px_4px_0px_#ff00ff] flex flex-col justify-between h-full min-h-[200px]">
          <div className="flex justify-between items-center mb-6">
            <div className="w-14 h-14 bg-black border-2 border-magenta-500 flex items-center justify-center text-magenta-500">
              <Receipt size={28} />
            </div>
            <span className={`px-2 py-1 border-2 text-[10px] font-black uppercase tracking-wider ${
              isPaid ? 'border-cyan-500 text-cyan-400' : 'border-magenta-500 text-magenta-500 animate-pulse'
            }`}>
              {isPaid ? 'Cleared' : 'Due'}
            </span>
          </div>
          
          <div>
            <h3 className="text-4xl font-black text-cyan-400 mb-1 glitch-text" data-text={`₹${isPaid ? '0.00' : (currentMaintenance?.amount || '2,500')}`}>
              ₹{isPaid ? '0.00' : (currentMaintenance?.amount || '2,500')}
            </h3>
            <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest block">Maintenance Balance</span>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest">Society Avg</span>
              <span className="text-[10px] font-black text-magenta-500 uppercase tracking-widest">88% Paid</span>
            </div>
            <div className="w-full bg-cyan-900/30 h-3 border border-cyan-500/30 overflow-hidden">
              <div className="bg-cyan-500 h-full shadow-[0_0_10px_#00ffff]" style={{ width: '88%' }} />
            </div>
          </div>
        </div>

        {/* Launchpad - 1x1 */}
        <div className="bg-black border-4 border-magenta-500 p-6 text-white shadow-[4px_4px_0px_#00ffff] flex flex-col h-full min-h-[200px]">
          <h3 className="text-lg font-black flex items-center gap-2 mb-6 text-cyan-400">
            <Command size={20} className="text-magenta-500" /> {t('launchpad')}
          </h3>
          
          <div className="grid grid-cols-2 gap-3 flex-1">
            {[
              { icon: Siren, label: t('sos'), color: 'bg-black border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white', path: '/emergency' },
              { icon: LifeBuoy, label: 'Support', color: 'bg-black border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black', path: '/helpdesk' },
              { icon: Building2, label: 'Directory', color: 'bg-black border-2 border-magenta-500 text-magenta-500 hover:bg-magenta-500 hover:text-white', path: '/buildings' },
              { icon: UserPlus, label: 'Profile', color: 'bg-black border-2 border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white', path: '/profile' },
            ].map((btn, i) => (
              <button 
                key={i}
                onClick={() => navigate(btn.path)}
                className={`${btn.color} p-3 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 aspect-square shadow-[2px_2px_0px_currentColor]`}
              >
                <btn.icon size={20} />
                <span className="text-[10px] font-black uppercase tracking-wider mt-1">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Next Meeting - 1x1 */}
        <div className="bg-black p-6 border-4 border-cyan-500/50 shadow-[4px_4px_0px_#ff00ff] flex flex-col justify-between h-full min-h-[200px]">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="w-14 h-14 bg-black border-2 border-indigo-500 flex items-center justify-center text-indigo-400">
                <Calendar size={28} />
              </div>
              <span className="border-2 border-indigo-500 text-indigo-400 px-2 py-1 text-[10px] font-black uppercase tracking-wider">
                Assembly
              </span>
            </div>

            {nextMeeting ? (
              <>
                <h4 className="text-lg font-black text-cyan-400 mb-1 truncate">
                  {nextMeeting.title}
                </h4>
                <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-700 uppercase tracking-wider mb-6">
                  <Clock size={12} /> {new Date(nextMeeting.date).toLocaleDateString()}
                </div>
                
                <div className="bg-indigo-900/10 border-2 border-indigo-500/30 p-4 text-center">
                  <h3 className="text-3xl font-black text-indigo-400 glitch-text" data-text={getTimeRemaining(nextMeeting.date)}>
                    {getTimeRemaining(nextMeeting.date)}
                  </h3>
                  <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest block mt-1">
                    Countdown
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <span className="text-xs font-black text-cyan-700 uppercase tracking-widest">No meetings</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => navigate('/meetings')}
            className="w-full bg-indigo-600 text-white py-3 border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-black hover:text-indigo-400 hover:border-indigo-400 transition-all mt-4 shadow-[4px_4px_0px_#00ffff]"
          >
            View Calendar
          </button>
        </div>

        {/* Bulletin - 1x1 */}
        <div className="bg-black p-6 border-4 border-magenta-500/50 shadow-[4px_4px_0px_#00ffff] flex flex-col justify-between h-full min-h-[200px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-cyan-400 flex items-center gap-2">
              <BellRing size={20} className="text-magenta-500" /> Bulletin
            </h3>
            <button onClick={() => navigate('/notices')} className="text-xs font-bold text-magenta-500 hover:underline">All</button>
          </div>
          
          <div className="space-y-3 flex-1">
            {notices.slice(0, 2).map((notice, index) => (
              <div 
                key={notice.id || index} 
                onClick={() => navigate('/notices')}
                className="p-3 bg-cyan-900/10 border border-cyan-500/30 cursor-pointer hover:border-magenta-500 transition-all group"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`px-1.5 py-0.5 border text-[8px] font-black uppercase tracking-wider ${
                    notice.category === 'Urgent' ? 'border-red-500 text-red-500 animate-pulse' : 'border-cyan-500 text-cyan-400'
                  }`}>
                    {notice.category}
                  </span>
                  <span className="text-[10px] font-bold text-cyan-700">{new Date(notice.date).toLocaleDateString()}</span>
                </div>
                <h4 className="text-xs font-black text-cyan-400 group-hover:text-magenta-500 truncate transition-colors">
                  {notice.title}
                </h4>
              </div>
            ))}
            {notices.length === 0 && (
              <div className="text-center py-4">
                <span className="text-xs font-black text-cyan-700 uppercase tracking-widest">No updates</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => navigate('/facilities')}
            className="w-full bg-black border-2 border-cyan-500 text-cyan-400 py-3 font-black text-xs uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all mt-4"
          >
            Book Amenities
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-12 animate-fade-in">
      {isAdmin ? <AdminView /> : <ResidentView />}
    </div>
  );
};

export default Dashboard;
