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
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-2">
            Delivery Hub
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Manage and track packages at the main gate
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button 
              onClick={() => setShowLogForm(true)}
              className="flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/20 active:scale-95 transform duration-100"
            >
              <Plus size={18} />
              Log New Arrival
            </button>
          )}
          <button 
            onClick={fetchPackages}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Loader2 size={20} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block px-2">
              Filter Status
            </span>
            <div className="space-y-1">
              <button 
                onClick={() => setActiveTab('pending')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'pending' 
                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">At Gate</span>
                </div>
                <span className="bg-white dark:bg-slate-800 px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                  {packages.filter(p => p.status === 'AT_GATE').length}
                </span>
              </button>
              
              <button 
                onClick={() => setActiveTab('history')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'history' 
                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <History size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">History</span>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-brand-600 p-6 rounded-[2rem] text-white relative overflow-hidden shadow-xl">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl" />
            <ShieldCheck size={32} className="mb-4 opacity-80" />
            <h3 className="text-lg font-black mb-2">Security Protocol</h3>
            <p className="text-xs font-medium opacity-80 leading-relaxed">
              All packages are logged with timestamps. Residents must show ID or Flat Key for collection.
            </p>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by Flat ID or Carrier (e.g. Amazon)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none shadow-sm"
            />
          </div>

          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <Loader2 size={40} className="animate-spin text-brand-600 mb-4" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Syncing with Gate Console...
              </span>
            </div>
          ) : filteredPackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPackages.map((pkg) => (
                <div 
                  key={pkg.id} 
                  className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group"
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-full blur-2xl group-hover:bg-brand-50 dark:group-hover:bg-brand-900/20 transition-colors" />
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          <Truck size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-900 dark:text-white">
                            {pkg.carrier}
                          </h3>
                          <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest">
                            {pkg.flatId}
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        pkg.status === 'AT_GATE' 
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' 
                          : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        {pkg.status === 'AT_GATE' ? 'At Gate' : 'Collected'}
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <User size={12} /> Resident
                        </div>
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {pkg.residentName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <Clock size={12} /> Received
                        </div>
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {new Date(pkg.receivedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                      {pkg.trackingNumber && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <AlertCircle size={12} /> Tracking
                          </div>
                          <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                            {pkg.trackingNumber}
                          </span>
                        </div>
                      )}
                    </div>

                    {pkg.status === 'AT_GATE' && (
                      <button 
                        onClick={() => handleCollect(pkg.id)}
                        className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-600 dark:hover:bg-brand-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={16} />
                        Mark as Collected
                      </button>
                    )}

                    {pkg.status === 'COLLECTED' && (
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Collected At
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {new Date(pkg.collectedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-12 text-center">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-600">
                <Package size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                No Packages Found
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-sm font-medium leading-relaxed">
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Log Delivery</h2>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Gate Console</span>
                </div>
                <button onClick={() => setShowLogForm(false)} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleLogPackage} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Flat ID</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="e.g. A-1-101"
                      value={formData.flatId}
                      onChange={e => setFormData({...formData, flatId: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Carrier / App</label>
                  <div className="relative">
                    <Truck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Amazon, Flipkart, Zomato..."
                      value={formData.carrier}
                      onChange={e => setFormData({...formData, carrier: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Tracking / Order ID (Optional)</label>
                  <div className="relative">
                    <AlertCircle size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Optional tracking number"
                      value={formData.trackingNumber}
                      onChange={e => setFormData({...formData, trackingNumber: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-700 transition-colors shadow-xl shadow-brand-600/20 active:scale-95 transform duration-100 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
