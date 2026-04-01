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
        <div className="md:col-span-2 md:row-span-2 bg-brand-600 rounded-3xl p-8 text-white shadow-xl shadow-brand-100 dark:shadow-none relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:bg-white/20 transition-all duration-500" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full mb-6">
              <ShieldCheck size={14} className="text-white" />
              <span className="text-[10px] font-bold tracking-wider text-white">
                {t('admin_dashboard')}
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4 leading-tight">
              {t('society')} <br />
              <span className="text-brand-100">{t('overview')}</span>
            </h1>
            <p className="text-brand-50 text-lg font-medium max-w-sm tracking-tight">
              {t('systems_running')}
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap gap-4 mt-8">
            <button 
              onClick={() => navigate('/registration-approvals')}
              className="bg-white text-brand-600 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-brand-50 transition-all shadow-lg"
              aria-label={t('approve_requests')}
            >
              {t('approve_requests')}
            </button>
            <button 
              onClick={() => navigate('/security-gate')}
              className="bg-brand-500 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-brand-400 transition-all border border-brand-400/30 shadow-lg"
              aria-label={t('security_gate')}
            >
              {t('security_gate')}
            </button>
            <button 
              onClick={() => navigate('/audit-logs')}
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all"
              aria-label={t('activity_logs')}
            >
              {t('activity_logs')}
            </button>
          </div>
        </div>

        {/* Residents Count - 1x1 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full min-h-[200px]">
          <div className="flex justify-between items-start">
            <div className="w-14 h-14 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center text-brand-600">
              <Users size={28} />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider block">{t('total_residents')}</span>
              <h3 className="text-5xl font-bold text-slate-900 dark:text-white tracking-tight">480</h3>
            </div>
          </div>
          <div className="mt-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">{t('occupancy')}</span>
              <span className="text-[10px] font-bold text-brand-600 tracking-wider">92%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-brand-600 h-full rounded-full" style={{ width: '92%' }} />
            </div>
          </div>
        </div>

        {/* Open Tickets - 1x1 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full min-h-[200px]">
          <div className="flex justify-between items-start">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-600">
              <AlertCircle size={28} />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider block">{t('pending_issues')}</span>
              <h3 className="text-5xl font-bold text-red-600 tracking-tight">{adminSummary?.summary?.openComplaints ?? '02'}</h3>
            </div>
          </div>
            <button 
              onClick={() => navigate('/helpdesk')}
              className="w-full bg-red-600 text-white py-3 rounded-2xl font-bold text-sm hover:bg-red-500 transition-all shadow-lg shadow-red-600/20 mt-4"
              aria-label={t('resolve_issues')}
            >
              {t('resolve_issues')}
            </button>
        </div>

        {/* Intelligence Unit - 2x1 */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-brand-50 dark:bg-brand-900/20 rounded-2xl text-brand-600 flex items-center justify-center">
              <BrainCircuit size={28} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider block">{t('society_insights')}</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t('expense_forecast')}</h3>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-4">
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed">
              {loadingAi ? t('analyzing_data') : `${prediction || "Optimizing utility consumption based on current usage patterns."}`}
            </p>
          </div>
 
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 tracking-wider">
              <Sparkles size={14} /> High Confidence
            </div>
            <button 
              onClick={() => navigate('/expenses')}
              className="text-xs font-bold text-brand-600 tracking-wider hover:underline transition-colors"
              aria-label={t('view_details')}
            >
              {t('view_details')}
            </button>
          </div>
        </div>

        {/* Collection Status - 1x1 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full min-h-[200px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
              <TrendingUp size={20} className="text-emerald-500" /> {t('collections')}
            </h3>
            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider">{t('this_month')}</span>
          </div>
          
          <div className="flex justify-center py-2 relative">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={351.86} strokeDashoffset={351.86 * (1 - 0.85)} className="text-emerald-500" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">85%</span>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider">{t('paid')}</span>
              </div>
            </div>
          </div>
 
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider block">{t('total_due')}</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">₹1.2M</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider block">{t('pending')}</span>
              <span className="text-sm font-bold text-red-600 tracking-tight">₹180k</span>
            </div>
          </div>
        </div>

        {/* Recent Issues - 1x1 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full min-h-[200px]">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 tracking-tight">
            <AlertCircle size={20} className="text-red-500" /> {t('recent_issues')}
          </h3>
          
          <div className="space-y-3 flex-1">
            {adminSummary?.recentComplaints?.slice(0, 2).map((complaint: any, index: number) => (
              <div key={complaint.id || index} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-red-600 shrink-0">
                    <AlertCircle size={14} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-900 dark:text-white block truncate tracking-tight">{complaint.subject}</span>
                    <span className="text-[8px] font-medium text-slate-400 tracking-wider">{complaint.flatId}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleResolveComplaint(complaint.id)}
                  className="w-8 h-8 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all shadow-sm"
                  aria-label={`${t('resolve_issues')}: ${complaint.subject}`}
                >
                  <CheckCircle2 size={16} />
                </button>
              </div>
            ))}
            {(!adminSummary?.recentComplaints || adminSummary.recentComplaints.length === 0) && (
              <div className="text-center py-4">
                <span className="text-[10px] font-medium text-slate-300 uppercase tracking-wider italic">{t('no_pending_issues')}</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => navigate('/helpdesk')}
            className="w-full text-[10px] font-bold text-brand-600 uppercase tracking-wider hover:underline mt-4"
            aria-label={t('view_all_issues')}
          >
            {t('view_all_issues')}
          </button>
        </div>
      </div>
    );
  };

  const ResidentView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        {/* Welcome Hero - 2x2 */}
        <div className="md:col-span-2 md:row-span-2 bg-brand-600 rounded-3xl p-8 text-white shadow-xl shadow-brand-100 dark:shadow-none relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-20 -mt-20 group-hover:bg-white/20 transition-all duration-500" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full mb-6">
              <Home size={14} className="text-white" />
              <span className="text-[10px] font-bold tracking-wider text-white">
                {t('flat')} {user?.flatId || 'A-1-101'}
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4 leading-tight">
              {t('welcome')}, <br />
              <span className="text-brand-100">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-brand-50 text-lg font-medium max-w-sm tracking-tight">
              {isPaid ? t('account_up_to_date') : t('outstanding_bill')}
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap gap-4 mt-8">
            <button 
              onClick={() => navigate('/maintenance')}
              className="bg-white text-brand-600 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-brand-50 transition-all shadow-lg flex items-center gap-2"
              aria-label={isPaid ? t('view_history') : t('pay_now')}
            >
              <CreditCard size={16} />
              {isPaid ? t('view_history') : t('pay_now')}
            </button>
            <button 
              onClick={() => navigate('/visitor-pass')}
              className="bg-brand-500 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-brand-400 transition-all border border-brand-400/30 shadow-lg flex items-center gap-2"
              aria-label={t('new_pass')}
            >
              <QrCode size={16} />
              {t('new_pass')}
            </button>
          </div>
        </div>

        {/* Maintenance Balance - 1x1 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full min-h-[200px]">
          <div className="flex justify-between items-center mb-6">
            <div className="w-14 h-14 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center text-brand-600">
              <Receipt size={28} />
            </div>
            <span className={`px-2 py-1 text-[10px] font-bold tracking-wider rounded-full border ${
              isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
            }`}>
              {isPaid ? t('paid') : t('due')}
            </span>
          </div>
          
          <div>
            <h3 className="text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
              ₹{isPaid ? '0.00' : (currentMaintenance?.amount || '2,500')}
            </h3>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider block">{t('maintenance_due')}</span>
          </div>
 
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">{t('society_average')}</span>
              <span className="text-[10px] font-bold text-brand-600 tracking-wider">88% {t('paid')}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-brand-600 h-full rounded-full" style={{ width: '88%' }} />
            </div>
          </div>
        </div>

        {/* Launchpad - 1x1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col h-full min-h-[200px]">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-6 tracking-tight text-slate-900 dark:text-white">
            <Command size={20} className="text-brand-600" /> {t('quick_actions')}
          </h3>
          
          <div className="grid grid-cols-2 gap-3 flex-1">
            {[
              { icon: Siren, label: t('emergency'), color: 'bg-red-50 text-red-600 hover:bg-red-100', path: '/emergency' },
              { icon: LifeBuoy, label: t('support'), color: 'bg-amber-50 text-amber-600 hover:bg-amber-100', path: '/helpdesk' },
              { icon: Building2, label: t('directory'), color: 'bg-brand-50 text-brand-600 hover:bg-brand-100', path: '/buildings' },
              { icon: UserPlus, label: t('profile'), color: 'bg-slate-50 text-slate-600 hover:bg-slate-100', path: '/profile' },
            ].map((btn, i) => (
              <button 
                key={i}
                onClick={() => navigate(btn.path)}
                className={`${btn.color} p-3 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 aspect-square border border-transparent`}
                aria-label={`${t('open')} ${btn.label}`}
              >
                <btn.icon size={20} />
                <span className="text-[9px] font-bold tracking-wider mt-1">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Next Meeting - 1x1 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full min-h-[200px]">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="w-14 h-14 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center text-brand-600">
                <Calendar size={28} />
              </div>
              <span className="bg-brand-600 text-white px-2 py-1 rounded-full text-[10px] font-bold tracking-wider">
                {t('meeting')}
              </span>
            </div>
 
            {nextMeeting ? (
              <>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1 truncate tracking-tight">
                  {nextMeeting.title}
                </h4>
                <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 tracking-wider mb-6">
                  <Clock size={12} /> {new Date(nextMeeting.date).toLocaleDateString()}
                </div>
                
                <div className="bg-brand-50 dark:bg-brand-900/20 rounded-2xl p-4 text-center">
                  <h3 className="text-3xl font-bold text-brand-600 tracking-tight">
                    {getTimeRemaining(nextMeeting.date)}
                  </h3>
                  <span className="text-[10px] font-bold text-brand-400 tracking-wider block mt-1">
                    {t('starts_in')}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <span className="text-[10px] font-medium text-slate-300 uppercase tracking-wider italic">{t('no_upcoming_meetings')}</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => navigate('/meetings')}
            className="w-full bg-brand-600 text-white py-3 rounded-2xl font-bold text-sm hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/20 mt-4"
            aria-label={t('view_calendar')}
          >
            {t('view_calendar')}
          </button>
        </div>

        {/* Bulletin - 1x1 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full min-h-[200px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
              <BellRing size={20} className="text-brand-600" /> {t('notices')}
            </h3>
            <button 
              onClick={() => navigate('/notices')} 
              className="text-[10px] font-bold text-brand-600 hover:underline tracking-wider"
              aria-label={t('view_all')}
            >
              {t('view_all')}
            </button>
          </div>
          
          <div className="space-y-3 flex-1">
            {notices.slice(0, 2).map((notice, index) => (
              <button 
                key={notice.id || index} 
                onClick={() => navigate('/notices')}
                className="w-full text-left p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group"
                aria-label={`${t('view_details')}: ${notice.title}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`px-1.5 py-0.5 text-[8px] font-bold tracking-wider rounded-full border ${
                    notice.category === 'Urgent' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-brand-50 text-brand-600 border-brand-200'
                  }`}>
                    {notice.category}
                  </span>
                  <span className="text-[8px] font-medium text-slate-400 tracking-wider">{new Date(notice.date).toLocaleDateString()}</span>
                </div>
                <h4 className="text-[10px] font-bold text-slate-900 dark:text-white truncate tracking-tight group-hover:text-brand-600">
                  {notice.title}
                </h4>
              </button>
            ))}
            {notices.length === 0 && (
              <div className="text-center py-4">
                <span className="text-[10px] font-medium text-slate-300 uppercase tracking-wider italic">{t('no_new_notices')}</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => navigate('/facilities')}
            className="w-full bg-brand-600 text-white py-3 rounded-2xl font-bold text-sm hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/20 mt-4"
            aria-label={t('book_amenities')}
          >
            {t('book_amenities')}
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
