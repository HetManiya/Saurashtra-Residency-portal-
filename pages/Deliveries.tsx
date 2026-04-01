import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, Truck, Clock, CheckCircle2, X, Search, 
  Plus, Loader2, AlertCircle, MapPin, User, Phone, 
  ArrowRight, History, Bell, ShieldCheck, Trash2
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../components/LanguageContext';
import { BUILDINGS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

const Deliveries: React.FC = () => {
  const { t } = useLanguage();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showLogForm, setShowLogForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  
  const [formData, setFormData] = useState({
    flatId: '',
    carrier: '',
    trackingNumber: '',
    notes: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('sr_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const data = await api.getPackages();
      setPackages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'COMMITTEE';

  const handleLogPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.logPackage(formData);
      await fetchPackages();
      setShowLogForm(false);
      setFormData({ flatId: '', carrier: '', trackingNumber: '', notes: '' });
      // Using alert for simplicity as per original, but could be Snackbar
      alert("Package logged successfully. Resident will be notified.");
    } catch (e) {
      alert("Failed to log package.");
    } finally {
      setLoading(false);
    }
  };

  const handleCollect = async (id: string) => {
    if (!confirm("Mark this package as collected?")) return;
    try {
      await api.collectPackage(id);
      await fetchPackages();
    } catch (e) {
      alert("Failed to update status.");
    }
  };

  const filteredPackages = useMemo(() => {
    return packages.filter(p => {
      const matchesTab = activeTab === 'pending' ? p.status === 'AT_GATE' : p.status === 'COLLECTED';
      const matchesSearch = p.flatId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.carrier.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [packages, activeTab, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Delivery <span className="text-brand-600">Hub</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage and track gate delivery logs
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button 
              onClick={() => setShowLogForm(true)}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-600/20 active:scale-95"
            >
              <Plus size={18} />
              Log New Arrival
            </button>
          )}
          <button 
            onClick={fetchPackages}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            {loading ? <Loader2 size={20} className="animate-spin text-brand-500" /> : <Loader2 size={20} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block px-2">
              Filter Status
            </span>
            <div className="space-y-1">
              <button 
                onClick={() => setActiveTab('pending')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'pending' 
                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package size={18} />
                  <span className="text-sm">At Gate</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'pending' ? 'bg-brand-100 dark:bg-brand-900/40' : 'bg-slate-100 dark:bg-slate-800'
                }`}>
                  {packages.filter(p => p.status === 'AT_GATE').length}
                </span>
              </button>
              
              <button 
                onClick={() => setActiveTab('history')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'history' 
                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <History size={18} />
                  <span className="text-sm">History</span>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 dark:bg-brand-900/20 p-6 rounded-3xl text-white relative overflow-hidden shadow-xl">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-600/20 rounded-full blur-2xl" />
            <ShieldCheck size={32} className="mb-4 text-brand-400" />
            <h3 className="text-lg font-bold mb-2 tracking-tight">Security Protocol</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              All packages are logged with timestamps. Residents must show ID or Flat Key for collection.
            </p>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by Flat ID or Carrier (e.g. Amazon)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 pl-12 pr-4 py-3.5 rounded-2xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
            />
          </div>

          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <Loader2 size={40} className="animate-spin text-brand-500 mb-4" />
              <span className="text-sm font-medium text-slate-400">
                Syncing with Gate Console...
              </span>
            </div>
          ) : filteredPackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPackages.map((pkg) => (
                <div 
                  key={pkg.id} 
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-slate-50 dark:bg-slate-800/50 rounded-full blur-2xl group-hover:bg-brand-50 dark:group-hover:bg-brand-900/10 transition-colors" />
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/20 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-all">
                          <Truck size={24} />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                            {pkg.carrier}
                          </h3>
                          <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                            {pkg.flatId}
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        pkg.status === 'AT_GATE' 
                          ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30' 
                          : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
                      }`}>
                        {pkg.status === 'AT_GATE' ? 'At Gate' : 'Collected'}
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <User size={12} /> Resident
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {pkg.residentName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <Clock size={12} /> Received
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {new Date(pkg.receivedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                      {pkg.trackingNumber && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <AlertCircle size={12} /> Tracking
                          </div>
                          <span className="text-sm font-bold text-brand-600 dark:text-brand-400 font-mono">
                            {pkg.trackingNumber}
                          </span>
                        </div>
                      )}
                    </div>

                    {pkg.status === 'AT_GATE' && (
                      <button 
                        onClick={() => handleCollect(pkg.id)}
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20 active:scale-95"
                      >
                        <CheckCircle2 size={16} />
                        Mark as Collected
                      </button>
                    )}

                    {pkg.status === 'COLLECTED' && (
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Collected At
                        </span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          {new Date(pkg.collectedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-[2.5rem] text-center shadow-sm">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-600 rounded-3xl">
                <Package size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                No Packages Found
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                {activeTab === 'pending' ? 'The hold area is currently empty. All deliveries are up to date!' : 'No historical delivery logs found.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showLogForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Log Delivery</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Security Gate Console</p>
                </div>
                <button 
                  onClick={() => setShowLogForm(false)} 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleLogPackage} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Flat ID</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="e.g. A-1-101"
                      value={formData.flatId}
                      onChange={e => setFormData({...formData, flatId: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-12 pr-4 py-3.5 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Carrier / App</label>
                  <div className="relative">
                    <Truck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Amazon, Flipkart, Zomato..."
                      value={formData.carrier}
                      onChange={e => setFormData({...formData, carrier: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-12 pr-4 py-3.5 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tracking / Order ID (Optional)</label>
                  <div className="relative">
                    <AlertCircle size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Optional tracking number"
                      value={formData.trackingNumber}
                      onChange={e => setFormData({...formData, trackingNumber: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-12 pr-4 py-3.5 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-brand-600/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Package size={18} />}
                  {loading ? 'Logging Arrival...' : 'Confirm Arrival'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Deliveries;
