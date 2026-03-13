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
        <div className="md:col-span-2 md:row-span-2 bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:bg-brand-500/30 transition-all duration-500" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
              <ShieldAlert size={14} className="text-amber-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                Executive Console
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 leading-[0.9]">
              Saurashtra <br />
              <span className="text-brand-400">Analytics</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-sm">
              Society ecosystem is currently <span className="text-green-400 font-black">HEALTHY</span>. All systems operational.
            </p>
          </div>

          <div className="relative z-10 flex gap-3 mt-8">
            <button 
              onClick={() => navigate('/registration-approvals')}
              className="bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors"
              aria-label="View Registration Approvals"
            >
              Approvals
            </button>
            <button 
              onClick={() => navigate('/security-gate')}
              className="bg-brand-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/20"
              aria-label="Go to Security Gate"
            >
              Security
            </button>
            <button 
              onClick={() => navigate('/audit-logs')}
              className="bg-transparent border border-white/20 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-colors"
              aria-label="View Audit Logs"
            >
              Audit
            </button>
          </div>
        </div>

        {/* Residents Count - 1x1 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full min-h-[200px]">
          <div className="flex justify-between items-start">
            <div className="w-14 h-14 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Users size={28} />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Residents</span>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white">480</h3>
            </div>
          </div>
          <div className="mt-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Occupancy</span>
              <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">92%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-brand-500 h-full rounded-full" style={{ width: '92%' }} />
            </div>
          </div>
        </div>

        {/* Open Tickets - 1x1 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full min-h-[200px]">
          <div className="flex justify-between items-start">
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertCircle size={28} />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Open Tickets</span>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white">{adminSummary?.summary?.openComplaints ?? '02'}</h3>
            </div>
          </div>
            <button 
              onClick={() => navigate('/helpdesk')}
              className="w-full bg-slate-900 dark:bg-slate-800 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors mt-4"
              aria-label="Manage Support Tickets"
            >
              Manage Support
            </button>
        </div>

        {/* Intelligence Unit - 2x1 */}
        <div className="md:col-span-2 bg-slate-900 dark:bg-slate-950 rounded-[2rem] p-6 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-600/20">
              <BrainCircuit size={28} />
            </div>
            <div>
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest block">Intelligence Unit</span>
              <h3 className="text-xl font-black">Society Forecast</h3>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md mb-4">
            <p className="text-slate-300 text-sm font-medium italic leading-relaxed">
              "{loadingAi ? "Calculating patterns..." : (prediction || "Optimizing utility consumption based on wing data.")}"
            </p>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-[10px] font-black text-brand-400 uppercase tracking-widest">
              <Sparkles size={14} /> Confidence: 99%
            </div>
            <button 
              onClick={() => navigate('/expenses')}
              className="text-xs font-black text-white uppercase tracking-widest hover:text-brand-400 transition-colors"
              aria-label="View Society Forecast Details"
            >
              View Details
            </button>
          </div>
        </div>

        {/* Collection Status - 1x1 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full min-h-[200px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-brand-600" /> Collection
            </h3>
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Live</span>
          </div>
          
          <div className="flex justify-center py-2 relative">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={351.86} strokeDashoffset={351.86 * (1 - 0.85)} className="text-brand-500" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900 dark:text-white">85%</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PAID</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">DUE</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">₹1.2M</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">PEND.</span>
              <span className="text-sm font-black text-red-500">₹180k</span>
            </div>
          </div>
        </div>

        {/* Recent Issues - 1x1 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full min-h-[200px]">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <AlertCircle size={20} className="text-amber-500" /> Issues
          </h3>
          
          <div className="space-y-3 flex-1">
            {adminSummary?.recentComplaints?.slice(0, 2).map((complaint: any, index: number) => (
              <div key={complaint.id || index} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                    <AlertCircle size={14} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-black text-slate-900 dark:text-white block truncate">{complaint.subject}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{complaint.flatId}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleResolveComplaint(complaint.id)}
                  className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors shadow-sm"
                  aria-label={`Resolve complaint: ${complaint.subject}`}
                >
                  <CheckCircle2 size={16} />
                </button>
              </div>
            ))}
            {(!adminSummary?.recentComplaints || adminSummary.recentComplaints.length === 0) && (
              <div className="text-center py-4">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">All Clear</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => navigate('/helpdesk')}
            className="w-full text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest hover:text-brand-600 transition-colors mt-4"
            aria-label="View All Support Issues"
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
        <div className="md:col-span-2 md:row-span-2 bg-brand-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:bg-white/20 transition-all duration-500" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
              <Home size={14} className="text-amber-300" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
                Unit {user?.flatId || 'A-1-101'}
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 leading-[0.9]">
              {t('welcome')}, <br />
              <span className="text-brand-200">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-brand-100 text-lg font-medium max-w-sm">
              {isPaid ? "Your account is fully settled. Thank you for your contribution!" : "You have an outstanding maintenance bill. Please settle it to avoid penalties."}
            </p>
          </div>

          <div className="relative z-10 flex gap-3 mt-8">
            <button 
              onClick={() => navigate('/maintenance')}
              className="bg-white text-brand-600 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-50 transition-colors flex items-center gap-2"
              aria-label={isPaid ? 'View Maintenance History' : 'Pay Maintenance Now'}
            >
              <CreditCard size={16} />
              {isPaid ? 'View History' : 'Pay Now'}
            </button>
            <button 
              onClick={() => navigate('/visitor-pass')}
              className="bg-brand-800 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-900 transition-colors flex items-center gap-2 shadow-lg shadow-brand-900/20"
              aria-label="Create New Visitor Pass"
            >
              <QrCode size={16} />
              New Pass
            </button>
          </div>
        </div>

        {/* Maintenance Balance - 1x1 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full min-h-[200px]">
          <div className="flex justify-between items-center mb-6">
            <div className="w-14 h-14 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Receipt size={28} />
            </div>
            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
              isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isPaid ? 'Cleared' : 'Due'}
            </span>
          </div>
          
          <div>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-1">
              ₹{isPaid ? '0.00' : (currentMaintenance?.amount || '2,500')}
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Maintenance Balance</span>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Society Avg</span>
              <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">88% Paid</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-brand-500 h-full rounded-full" style={{ width: '88%' }} />
            </div>
          </div>
        </div>

        {/* Launchpad - 1x1 */}
        <div className="bg-slate-900 dark:bg-slate-950 p-6 rounded-[2rem] text-white shadow-xl flex flex-col h-full min-h-[200px]">
          <h3 className="text-lg font-black flex items-center gap-2 mb-6">
            <Command size={20} className="text-brand-400" /> {t('launchpad')}
          </h3>
          
          <div className="grid grid-cols-2 gap-3 flex-1">
            {[
              { icon: Siren, label: t('sos'), color: 'bg-red-500 hover:bg-red-600', path: '/emergency' },
              { icon: LifeBuoy, label: 'Support', color: 'bg-amber-500 hover:bg-amber-600', path: '/helpdesk' },
              { icon: Building2, label: 'Directory', color: 'bg-brand-500 hover:bg-brand-600', path: '/buildings' },
              { icon: UserPlus, label: 'Profile', color: 'bg-indigo-500 hover:bg-indigo-600', path: '/profile' },
            ].map((btn, i) => (
              <button 
                key={i}
                onClick={() => navigate(btn.path)}
                className={`${btn.color} rounded-2xl p-3 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 aspect-square`}
                aria-label={`Open ${btn.label}`}
              >
                <btn.icon size={20} />
                <span className="text-[10px] font-black uppercase tracking-wider mt-1">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Next Meeting - 1x1 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full min-h-[200px]">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Calendar size={28} />
              </div>
              <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider">
                Assembly
              </span>
            </div>

            {nextMeeting ? (
              <>
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1 truncate">
                  {nextMeeting.title}
                </h4>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-6">
                  <Clock size={12} /> {new Date(nextMeeting.date).toLocaleDateString()}
                </div>
                
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-4 text-center">
                  <h3 className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                    {getTimeRemaining(nextMeeting.date)}
                  </h3>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mt-1">
                    Countdown
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">No meetings</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => navigate('/meetings')}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors mt-4"
            aria-label="View Meetings Calendar"
          >
            View Calendar
          </button>
        </div>

        {/* Bulletin - 1x1 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full min-h-[200px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BellRing size={20} className="text-brand-600" /> Bulletin
            </h3>
            <button 
              onClick={() => navigate('/notices')} 
              className="text-xs font-bold text-brand-600 hover:underline"
              aria-label="View All Notices"
            >
              All
            </button>
          </div>
          
          <div className="space-y-3 flex-1">
            {notices.slice(0, 2).map((notice, index) => (
              <button 
                key={notice.id || index} 
                onClick={() => navigate('/notices')}
                className="w-full text-left p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label={`View notice: ${notice.title}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                    notice.category === 'Urgent' ? 'bg-red-100 text-red-600' : 'bg-brand-100 text-brand-600'
                  }`}>
                    {notice.category}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">{new Date(notice.date).toLocaleDateString()}</span>
                </div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                  {notice.title}
                </h4>
              </button>
            ))}
            {notices.length === 0 && (
              <div className="text-center py-4">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">No updates</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => navigate('/facilities')}
            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-600 hover:text-white transition-colors mt-4"
            aria-label="Book Amenities"
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
