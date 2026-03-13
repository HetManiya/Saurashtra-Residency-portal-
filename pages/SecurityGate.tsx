
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ShieldCheck, Scan, Search, User, Phone, Home, Clock, 
  CheckCircle2, XCircle, LogIn, LogOut, Loader2, AlertCircle,
  History, UserCheck, ShieldAlert, Camera, X
} from 'lucide-react';
import { api } from '../services/api';
import { io, Socket } from 'socket.io-client';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Fuse from 'fuse.js';

const SecurityGate: React.FC = () => {
  const [passId, setPassId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [visitor, setVisitor] = useState<any>(null);
  const [activeVisitors, setActiveVisitors] = useState<any[]>([]);
  const [loadingActive, setLoadingActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [analytics, setAnalytics] = useState<any>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    fetchActiveVisitors();
    fetchAnalytics();

    // Initialize Socket.io
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('🔌 Connected to real-time gate network');
      newSocket.emit('join-security');
    });

    newSocket.on('visitor-update', (data: any) => {
      console.log('📡 Real-time update received:', data);
      // Refresh the list when an update occurs
      fetchActiveVisitors();
      fetchAnalytics();
      
      // Optional: Show a small toast or notification if needed
      if (data.type === 'CHECK_IN') {
        console.log(`New visitor checked in: ${data.visitor.name}`);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const fetchAnalytics = async () => {
    try {
      const data = await api.getVisitorAnalytics();
      setAnalytics(data);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredVisitors = useMemo(() => {
    if (!searchQuery.trim()) return activeVisitors;
    
    const fuse = new Fuse(activeVisitors, {
      keys: ['name', 'phone', 'flatId', 'purpose'],
      threshold: 0.3,
    });
    
    return fuse.search(searchQuery).map(result => result.item);
  }, [activeVisitors, searchQuery]);

  useEffect(() => {
    if (isScanning) {
      // Small delay to ensure DOM element exists
      const timer = setTimeout(() => {
        const scanner = new Html5QrcodeScanner(
          "reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
        );
        scannerRef.current = scanner;
        
        scanner.render(onScanSuccess, onScanFailure);
      }, 100);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current) {
          scannerRef.current.clear().catch(error => {
            console.error("Failed to clear html5-qrcode scanner. ", error);
          });
        }
      };
    }
  }, [isScanning]);

  const onScanSuccess = (decodedText: string, decodedResult: any) => {
    console.log(`Code matched = ${decodedText}`, decodedResult);
    setPassId(decodedText);
    setIsScanning(false);
    // Automatically verify after scan
    verifyPass(decodedText);
  };

  const onScanFailure = (error: any) => {
    // handle scan failure, usually better to ignore and keep scanning.
    // console.warn(`Code scan error = ${error}`);
  };

  const verifyPass = async (id: string) => {
    setVerifying(true);
    setError(null);
    setVisitor(null);
    setSuccess(null);

    try {
      const data = await api.verifyVisitorPass(id);
      setVisitor(data);
    } catch (e: any) {
      setError(e.message || 'Invalid Pass ID');
    } finally {
      setVerifying(false);
    }
  };

  const fetchActiveVisitors = async () => {
    try {
      const data = await api.getActiveVisitors();
      setActiveVisitors(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingActive(false);
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passId) return;
    verifyPass(passId);
  };

  const handleCheckIn = async () => {
    if (!visitor) return;
    setVerifying(true);
    try {
      await api.checkInVisitor(visitor.passId);
      setSuccess(`Visitor ${visitor.name} checked in successfully!`);
      setVisitor(null);
      setPassId('');
      fetchActiveVisitors();
    } catch (e: any) {
      setError(e.message || 'Check-in failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      await api.checkOutVisitor(id);
      fetchActiveVisitors();
    } catch (e: any) {
      alert(e.message || 'Check-out failed');
    }
  };

  return (
    <div className="space-y-10 pb-20 page-transition">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-4">
            <ShieldCheck size={40} className="text-brand-600" /> Security <span className="text-brand-600">Gate</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Verify visitor passes and manage gate entries</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Gate 1 Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Verification Section */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm premium-shadow">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
              <Scan size={24} className="text-brand-600" /> Verify Pass
            </h3>
            
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-3 tracking-widest">Enter Pass ID</label>
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="e.g. ABC123XY" 
                    aria-label="Enter Visitor Pass ID"
                    className="w-full pl-16 pr-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-[2rem] outline-none font-black text-lg dark:text-white border-2 border-transparent focus:border-brand-600/20 uppercase tracking-widest"
                    value={passId}
                    onChange={(e) => setPassId(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setIsScanning(true)}
                    aria-label="Scan QR Code"
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-200 dark:bg-slate-700 rounded-xl hover:bg-brand-600 hover:text-white transition-colors"
                    title="Scan QR Code"
                  >
                    <Camera size={20} />
                  </button>
                </div>
              </div>
              <button 
                type="submit"
                disabled={verifying || !passId}
                aria-label="Verify Visitor Pass"
                className="w-full py-5 bg-brand-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl shadow-brand-500/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {verifying ? <Loader2 className="animate-spin" /> : <ShieldCheck size={18} />} Verify Visitor
              </button>
            </form>

            {isScanning && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] p-6 shadow-2xl relative">
                  <button 
                    onClick={() => setIsScanning(false)}
                    aria-label="Close QR Scanner"
                    className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-colors z-10"
                  >
                    <X size={20} />
                  </button>
                  <h3 className="text-lg font-black text-center mb-4 dark:text-white">Scan Visitor Pass</h3>
                  <div id="reader" className="overflow-hidden rounded-xl"></div>
                  <p className="text-center text-xs text-slate-400 mt-4 font-bold">Point camera at the visitor's QR code</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-8 p-6 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800 rounded-3xl flex items-center gap-4 text-rose-600">
                <XCircle size={24} />
                <p className="text-xs font-black uppercase tracking-widest">{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-8 p-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-3xl flex items-center gap-4 text-emerald-600">
                <CheckCircle2 size={24} />
                <p className="text-xs font-black uppercase tracking-widest">{success}</p>
              </div>
            )}
          </div>

          {visitor && (
            <div className="bg-brand-600 p-10 rounded-[3rem] text-white shadow-2xl animate-in slide-in-from-bottom-5">
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <User size={32} />
                </div>
                <span className="px-4 py-1.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                  {visitor.type}
                </span>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-3xl font-black tracking-tighter">{visitor.name}</h4>
                  <p className="text-brand-100 font-medium flex items-center gap-2 mt-1">
                    <Phone size={14} /> {visitor.phone}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                    <p className="text-[9px] font-black uppercase text-brand-200 tracking-widest mb-1">Destination</p>
                    <p className="text-sm font-black flex items-center gap-2"><Home size={14} /> {visitor.flatId}</p>
                  </div>
                  <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                    <p className="text-[9px] font-black uppercase text-brand-200 tracking-widest mb-1">Purpose</p>
                    <p className="text-sm font-black line-clamp-1">{visitor.purpose || 'Visit'}</p>
                  </div>
                </div>

                <button 
                  onClick={handleCheckIn}
                  aria-label={`Confirm entry for ${visitor.name}`}
                  className="w-full py-5 bg-white text-brand-600 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl hover:bg-brand-50 transition-all active:scale-95"
                >
                  <LogIn size={18} /> Confirm Entry
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Active Visitors Log */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                <History size={28} className="text-brand-600" /> Live Gate Log
              </h3>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search name, phone, flat..."
                    aria-label="Search active visitors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <span className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0">
                  {activeVisitors.length} Inside
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {loadingActive ? (
                <div className="py-20 flex justify-center">
                  <Loader2 className="animate-spin text-brand-600" size={32} />
                </div>
              ) : filteredVisitors.length === 0 ? (
                <div className="py-20 text-center">
                  <UserCheck size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No active visitors found</p>
                </div>
              ) : (
                filteredVisitors.map((v, i) => (
                  <div key={v._id || i} className="group p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-transparent hover:border-brand-600/20 transition-all flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-brand-600 transition-colors shadow-sm">
                        <User size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h5 className="text-lg font-black text-slate-900 dark:text-white">{v.name}</h5>
                          <span className="px-2 py-0.5 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded text-[8px] font-black uppercase">{v.type}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-1">
                          <p className="text-xs font-bold text-slate-400 flex items-center gap-2"><Home size={12} /> {v.flatId}</p>
                          <p className="text-xs font-bold text-slate-400 flex items-center gap-2"><Clock size={12} /> In: {new Date(v.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleCheckOut(v._id)}
                      aria-label={`Check out visitor ${v.name}`}
                      className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100 dark:border-slate-700 flex items-center gap-2 shrink-0"
                    >
                      <LogOut size={14} /> Check Out
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-amber-600 p-10 rounded-[3rem] text-white shadow-xl flex flex-col justify-between">
              <ShieldAlert size={32} className="mb-8" />
              <div>
                <h4 className="text-xl font-black mb-2">Security Protocol</h4>
                <p className="text-xs font-medium text-amber-100 leading-relaxed">
                  Always verify physical ID for service providers and delivery personnel even with a valid digital pass.
                </p>
              </div>
            </div>
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-xl flex flex-col justify-between">
              <History size={32} className="mb-8 text-brand-500" />
              <div>
                <h4 className="text-xl font-black mb-2">Shift Summary</h4>
                <p className="text-xs font-medium text-slate-400 leading-relaxed">
                  Total entries today: <span className="text-white font-black">{analytics?.dailyVisitors || 0}</span><br />
                  Average stay duration: <span className="text-white font-black">{analytics?.avgStayDuration || 0} mins</span>
                </p>
                {analytics?.frequentVisitors?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Frequent Visitors</p>
                    <div className="flex flex-wrap gap-2">
                      {analytics.frequentVisitors.map((fv: any) => (
                        <span key={fv._id} className="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold text-slate-300">
                          {fv.name} ({fv.count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityGate;
