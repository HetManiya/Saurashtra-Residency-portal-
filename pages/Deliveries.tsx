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
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in crt-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b-4 border-cyan-500/30">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-cyan-400 mb-2 glitch-text" data-text="Delivery Hub">
            Delivery <span className="text-magenta-500">Hub</span>
          </h1>
          <p className="text-cyan-700 font-bold font-mono uppercase text-xs">
            {`> MANAGE_GATE_DELIVERY_LOGS_v1.0`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button 
              onClick={() => setShowLogForm(true)}
              className="flex items-center gap-2 bg-magenta-500 text-white px-6 py-3 border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-black hover:text-magenta-500 hover:border-magenta-500 transition-all shadow-[4px_4px_0px_#00ffff] active:scale-95 transform duration-100"
            >
              <Plus size={18} />
              Log New Arrival
            </button>
          )}
          <button 
            onClick={fetchPackages}
            className="p-3 bg-black border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all shadow-[3px_3px_0px_#ff00ff]"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Loader2 size={20} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-black p-4 border-4 border-cyan-500 shadow-[6px_6px_0px_#ff00ff]">
            <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-4 block px-2">
              Filter Status
            </span>
            <div className="space-y-2">
              <button 
                onClick={() => setActiveTab('pending')}
                className={`w-full flex items-center justify-between px-4 py-3 border-2 transition-all ${
                  activeTab === 'pending' 
                    ? 'bg-cyan-400 text-black border-black shadow-[3px_3px_0px_#ff00ff]' 
                    : 'bg-black border-cyan-900/30 text-cyan-700 hover:border-cyan-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">At Gate</span>
                </div>
                <span className="bg-black border border-current px-2 py-1 text-xs font-bold">
                  {packages.filter(p => p.status === 'AT_GATE').length}
                </span>
              </button>
              
              <button 
                onClick={() => setActiveTab('history')}
                className={`w-full flex items-center justify-between px-4 py-3 border-2 transition-all ${
                  activeTab === 'history' 
                    ? 'bg-cyan-400 text-black border-black shadow-[3px_3px_0px_#ff00ff]' 
                    : 'bg-black border-cyan-900/30 text-cyan-700 hover:border-cyan-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <History size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">History</span>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-magenta-500 p-6 border-4 border-black text-white relative overflow-hidden shadow-[6px_6px_0px_#00ffff]">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl" />
            <ShieldCheck size={32} className="mb-4 opacity-80" />
            <h3 className="text-lg font-black mb-2 uppercase tracking-tight">Security Protocol</h3>
            <p className="text-[10px] font-bold font-mono uppercase leading-relaxed opacity-90">
              {`> All packages are logged with timestamps. Residents must show ID or Flat Key for collection.`}
            </p>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700" />
            <input 
              type="text"
              placeholder="Search by Flat ID or Carrier (e.g. Amazon)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border-4 border-cyan-500 pl-12 pr-4 py-4 text-sm font-bold text-cyan-400 placeholder:text-cyan-900 outline-none focus:border-magenta-500 transition-all shadow-[6px_6px_0px_#ff00ff]"
            />
          </div>

          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <Loader2 size={40} className="animate-spin text-magenta-500 mb-4" />
              <span className="text-xs font-black text-cyan-700 uppercase tracking-widest font-mono">
                {`> Syncing with Gate Console...`}
              </span>
            </div>
          ) : filteredPackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPackages.map((pkg) => (
                <div 
                  key={pkg.id} 
                  className="bg-black border-4 border-cyan-500 p-6 hover:border-magenta-500 hover:shadow-[8px_8px_0px_#00ffff] transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-900/10 rounded-full blur-2xl group-hover:bg-magenta-900/10 transition-colors" />
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 border-2 border-cyan-500 bg-black flex items-center justify-center text-cyan-400 group-hover:text-magenta-500 group-hover:border-magenta-500 transition-colors">
                          <Truck size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-cyan-400 uppercase tracking-tight">
                            {pkg.carrier}
                          </h3>
                          <span className="text-[10px] font-black text-magenta-500 uppercase tracking-widest">
                            {pkg.flatId}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 border text-[10px] font-black uppercase tracking-widest ${
                        pkg.status === 'AT_GATE' 
                          ? 'bg-cyan-900/20 border-cyan-500 text-cyan-400' 
                          : 'bg-green-900/20 border-green-500 text-green-400'
                      }`}>
                        {pkg.status === 'AT_GATE' ? 'At Gate' : 'Collected'}
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-700 uppercase tracking-widest">
                          <User size={12} /> Resident
                        </div>
                        <span className="text-sm font-black text-cyan-400 uppercase">
                          {pkg.residentName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-700 uppercase tracking-widest">
                          <Clock size={12} /> Received
                        </div>
                        <span className="text-sm font-black text-cyan-400 uppercase">
                          {new Date(pkg.receivedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                      {pkg.trackingNumber && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-700 uppercase tracking-widest">
                            <AlertCircle size={12} /> Tracking
                          </div>
                          <span className="text-sm font-black text-magenta-500 font-mono">
                            {pkg.trackingNumber}
                          </span>
                        </div>
                      )}
                    </div>

                    {pkg.status === 'AT_GATE' && (
                      <button 
                        onClick={() => handleCollect(pkg.id)}
                        className="w-full bg-magenta-500 text-white py-3 border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-black hover:text-magenta-500 hover:border-magenta-500 transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0px_#00ffff]"
                      >
                        <CheckCircle2 size={16} />
                        Mark as Collected
                      </button>
                    )}

                    {pkg.status === 'COLLECTED' && (
                      <div className="pt-4 border-t-2 border-cyan-900/30 flex justify-between items-center">
                        <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest">
                          Collected At
                        </span>
                        <span className="text-xs font-bold text-cyan-400 uppercase">
                          {new Date(pkg.collectedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-black border-4 border-cyan-500 p-12 text-center shadow-[8px_8px_0px_#ff00ff]">
              <div className="w-20 h-20 bg-cyan-900/10 border-2 border-cyan-900/30 flex items-center justify-center mx-auto mb-6 text-cyan-900">
                <Package size={40} />
              </div>
              <h3 className="text-xl font-black text-cyan-400 mb-2 uppercase tracking-tight">
                No Packages Found
              </h3>
              <p className="text-cyan-700 font-bold font-mono uppercase text-xs max-w-xs mx-auto leading-relaxed">
                {activeTab === 'pending' ? '> The hold area is currently empty. All deliveries are up to date!' : '> No historical delivery logs found.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showLogForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-black w-full max-w-lg border-4 border-magenta-500 shadow-[12px_12px_0px_#00ffff] overflow-hidden crt-screen"
            >
              <div className="p-6 border-b-4 border-cyan-500/30 flex justify-between items-center bg-black">
                <div>
                  <h2 className="text-2xl font-black text-cyan-400 tracking-tight uppercase glitch-text" data-text="Log Delivery">Log Delivery</h2>
                  <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest">Security Gate Console</span>
                </div>
                <button onClick={() => setShowLogForm(false)} className="p-2 border-2 border-magenta-500 text-magenta-500 hover:bg-magenta-500 hover:text-white transition-all">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleLogPackage} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-2 block ml-1">Flat ID</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700" />
                    <input 
                      type="text"
                      placeholder="e.g. A-1-101"
                      value={formData.flatId}
                      onChange={e => setFormData({...formData, flatId: e.target.value})}
                      className="w-full bg-black border-2 border-cyan-500 pl-12 pr-4 py-3 text-sm font-bold text-cyan-400 placeholder:text-cyan-900 outline-none focus:border-magenta-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-2 block ml-1">Carrier / App</label>
                  <div className="relative">
                    <Truck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700" />
                    <input 
                      type="text"
                      placeholder="Amazon, Flipkart, Zomato..."
                      value={formData.carrier}
                      onChange={e => setFormData({...formData, carrier: e.target.value})}
                      className="w-full bg-black border-2 border-cyan-500 pl-12 pr-4 py-3 text-sm font-bold text-cyan-400 placeholder:text-cyan-900 outline-none focus:border-magenta-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-2 block ml-1">Tracking / Order ID (Optional)</label>
                  <div className="relative">
                    <AlertCircle size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700" />
                    <input 
                      type="text"
                      placeholder="Optional tracking number"
                      value={formData.trackingNumber}
                      onChange={e => setFormData({...formData, trackingNumber: e.target.value})}
                      className="w-full bg-black border-2 border-cyan-500 pl-12 pr-4 py-3 text-sm font-bold text-cyan-400 placeholder:text-cyan-900 outline-none focus:border-magenta-500 transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-magenta-500 text-white py-4 border-2 border-black font-black text-sm uppercase tracking-widest hover:bg-black hover:text-magenta-500 hover:border-magenta-500 transition-all shadow-[6px_6px_0px_#00ffff] active:scale-95 transform duration-100 flex items-center justify-center gap-2 disabled:opacity-70"
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
