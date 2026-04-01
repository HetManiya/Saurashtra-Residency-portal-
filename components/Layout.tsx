
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Building2, Wallet, HandCoins, Bell, Users, Menu, X, MapPin, 
  LogOut, ShieldCheck, ChevronRight, Compass, PieChart, Moon, 
  Sun, LayoutGrid, CalendarDays, History, Siren, Search, 
  BellRing, Settings, Command, UserPlus, QrCode, Clock,
  Globe, Sofa, LifeBuoy, Zap, ShieldAlert, Waves, UserCheck, Package
} from 'lucide-react';
import ChatAssistant from './ChatAssistant';
import { useLanguage } from './LanguageContext';
import { api } from '../services/api';

interface LayoutProps { children: React.ReactNode; }

const SidebarContent: React.FC<{
  user: any;
  isAdmin: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  handleLogout: () => void;
  t: (key: string) => string;
  pathname: string;
}> = ({ user, isAdmin, isSidebarOpen, setIsSidebarOpen, handleLogout, t, pathname }) => {
  const navGroups = [
    {
      title: 'Overview',
      items: [
        { name: t('dashboard'), path: '/', icon: LayoutGrid },
        { name: t('notices'), path: '/notices', icon: Bell },
      ]
    },
    {
      title: 'Security & Access',
      adminOnly: true,
      items: [
         { name: 'Security Gate', path: '/security-gate', icon: ShieldCheck },
         { name: 'Approvals', path: '/approvals', icon: UserCheck },
         { name: t('audit'), path: '/audit-logs', icon: History },
      ]
    },
    {
      title: 'Management',
      // Accessible by Admin and Committee
      committeeAccessible: true,
      items: [
         { name: t('treasury'), path: '/expenses', icon: PieChart },
      ]
    },
    {
      title: 'Services',
      items: [
         { name: t('maintenance'), path: '/maintenance', icon: Wallet },
         { name: 'Deliveries', path: '/deliveries', icon: Package },
         { name: t('visitors'), path: '/visitor-pass', icon: QrCode },
         { name: t('meetings'), path: '/meetings', icon: CalendarDays },
         { name: t('facilities'), path: '/facilities', icon: Sofa },
         { name: t('helpdesk'), path: '/helpdesk', icon: LifeBuoy },
      ]
    },
    {
      title: 'Community',
      items: [
         { name: t('funds'), path: '/funds', icon: HandCoins },
         { name: t('leadership'), path: '/committee', icon: Users },
         { name: 'Polls', path: '/polls', icon: PieChart },
         { name: t('emergency'), path: '/emergency', icon: Siren },
      ]
    },
    {
      title: 'Estate',
      items: [
        { name: t('assets'), path: '/buildings', icon: Building2 },
        { name: t('location'), path: '/location', icon: Compass },
      ]
    }
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      <div className="p-6 lg:p-8 flex items-center gap-4 shrink-0 border-b border-slate-100 dark:border-slate-800">
        <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${isAdmin ? 'bg-red-600' : 'bg-brand-600'}`}>
          {isAdmin ? <ShieldAlert size={24} className="lg:w-7 lg:h-7" /> : <ShieldCheck size={24} className="lg:w-7 lg:h-7" />}
        </div>
        <div className="overflow-hidden">
          <h1 className="font-bold text-lg lg:text-xl tracking-tight text-slate-900 dark:text-white">{t('saurashtra')}</h1>
          <p className="text-[10px] font-semibold text-slate-400 tracking-wider mb-0 truncate">
            {isAdmin ? 'System Admin' : 'Resident'}
          </p>
        </div>
        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden ml-auto text-slate-400 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 px-4 overflow-y-auto space-y-8 py-8 custom-scrollbar">
        {navGroups.map((group, idx) => {
          const isCommittee = user?.role === 'COMMITTEE';
          const canSee = group.adminOnly ? isAdmin : (group.committeeAccessible ? (isAdmin || isCommittee) : true);
          
          if (!canSee) return null;

          return (
            <div key={idx} className="relative">
              <p className="px-4 text-[10px] font-bold text-slate-400 mb-4 tracking-wider">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <Link 
                      key={item.path} 
                      to={item.path} 
                      aria-label={`Navigate to ${item.name}`}
                      onClick={() => {
                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 transition-all font-semibold text-sm rounded-xl ${
                        isActive 
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon size={18} className="shrink-0" />
                      <span className="truncate">{item.name}</span>
                      {isActive && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
        <Link 
          to="/profile"
          aria-label={`View profile for ${user?.name || 'Resident'}`}
          onClick={() => { if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
          className="p-4 bg-white dark:bg-slate-800 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 rounded-2xl group relative overflow-hidden shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0 group-hover:scale-110 transition-transform">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'guest'}`} alt="User" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate text-slate-900 dark:text-white mb-0">{user?.name || 'Unknown User'}</p>
            <p className={`text-[10px] font-semibold mb-0 truncate tracking-wider ${isAdmin ? 'text-red-600' : 'text-slate-400'}`}>
              {user?.role || 'Guest'}
            </p>
          </div>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLogout(); }} 
            className="p-2 text-slate-400 hover:text-red-600 transition-all shrink-0" 
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </Link>
      </div>
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('sr_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [user, setUser] = useState<any>(null);
  const [time, setTime] = useState(new Date());
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const storedUser = localStorage.getItem('sr_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      loadNotifications();
    }
    return () => clearInterval(timer);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sr_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sr_theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('sr_token');
    localStorage.removeItem('sr_user');
    navigate('/login', { replace: true });
  }, [navigate]);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'COMMITTEE';

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans relative">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />
      </div>

      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:block h-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shrink-0 z-[100] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 ${isSidebarOpen ? 'w-[280px]' : 'w-0'}`}
        style={{ opacity: isSidebarOpen ? 1 : 0, visibility: isSidebarOpen ? 'visible' : 'hidden' }}
      >
        <SidebarContent 
          user={user} 
          isAdmin={isAdmin} 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
          handleLogout={handleLogout} 
          t={t} 
          pathname={location.pathname}
        />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <div className={`fixed inset-0 z-[110] lg:hidden transition-opacity duration-500 ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
        <aside className={`absolute left-0 top-0 h-full w-[280px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-500 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <SidebarContent 
            user={user} 
            isAdmin={isAdmin} 
            isSidebarOpen={isSidebarOpen} 
            setIsSidebarOpen={setIsSidebarOpen} 
            handleLogout={handleLogout} 
            t={t} 
            pathname={location.pathname}
          />
        </aside>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative z-10">
        <header className="h-20 flex-none flex items-center justify-between px-6 md:px-10 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              aria-label="Toggle Menu"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:block">
              <p className="text-[10px] font-semibold text-slate-400 tracking-wider mb-0">{t('welcome')}, {user?.name?.split(' ')[0]}</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-0 tracking-tight">{time.toLocaleTimeString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
                className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all relative"
                aria-label="Notifications"
                aria-expanded={isNotificationsOpen}
                aria-haspopup="true"
              >
                <Bell size={20} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />
                )}
              </button>
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-4 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-96" role="menu">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-wider">Notifications</h3>
                    {notifications.some(n => !n.read) && (
                      <button 
                        onClick={handleMarkAllAsRead} 
                        className="text-[10px] font-bold text-brand-600 hover:underline tracking-wider"
                        aria-label="Mark all as read"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="overflow-y-auto flex-1 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs font-medium italic">
                        No notifications
                      </div>
                    ) : (
                      notifications.map(n => (
                        <button 
                          key={n.id || n._id} 
                          onClick={() => !n.read && handleMarkAsRead(n.id || n._id)}
                          className={`w-full text-left p-4 border-b border-slate-50 dark:border-slate-800/50 cursor-pointer transition-colors ${n.read ? 'opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800/30' : 'bg-brand-50/30 dark:bg-brand-900/10 hover:bg-brand-50/50 dark:hover:bg-brand-900/20'}`}
                          role="menuitem"
                          aria-label={`${n.title}: ${n.message}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-xs font-bold ${n.read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>{n.title}</h4>
                            <span className="text-[10px] font-medium text-slate-400 shrink-0 ml-2">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className={`text-[11px] leading-tight ${n.read ? 'text-slate-500 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>
                            {n.message}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} 
                className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-all"
                aria-label="Select Language"
                aria-expanded={isLangMenuOpen}
                aria-haspopup="true"
              >
                <Globe size={20} /> <span className="text-xs font-bold uppercase hidden sm:inline">{language}</span>
              </button>
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-4 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden" role="menu">
                  {['en', 'gu', 'hi'].map(l => (
                    <button 
                      key={l} 
                      onClick={() => { setLanguage(l as any); setIsLangMenuOpen(false); }} 
                      className={`w-full px-4 py-3 text-xs font-bold text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${language === l ? 'text-brand-600 bg-brand-50 dark:bg-brand-900/20' : 'text-slate-600 dark:text-slate-400'}`}
                      role="menuitem"
                      aria-label={`Switch to ${l.toUpperCase()}`}
                    >
                      {l === 'en' ? 'English' : l === 'gu' ? 'ગુજરાતી' : 'हिन्दी'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth custom-scrollbar bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto page-transition pb-20">
            {children}
          </div>
        </main>
      </div>
      <ChatAssistant />
    </div>
  );
};

export default Layout;
