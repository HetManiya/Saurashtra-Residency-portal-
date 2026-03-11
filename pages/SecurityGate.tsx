
import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Scan, Search, User, Phone, Home, Clock, 
  CheckCircle2, XCircle, LogIn, LogOut, Loader2, AlertCircle,
  History, UserCheck, ShieldAlert, Camera, X
} from 'lucide-react';
import { api } from '../services/api';
import { io, Socket } from 'socket.io-client';
import { Html5QrcodeScanner } from 'html5-qrcode';

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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b-2 border-magenta-500/30">
        <div>
          <h1 className="text-5xl font-black text-cyan-400 tracking-tighter flex items-center gap-4 uppercase glitch-text">
            <ShieldCheck size={40} className="text-magenta-500" /> Security <span className="text-magenta-500">Gate</span>
          </h1>
          <p className="text-cyan-500/70 mt-2 font-mono text-xs uppercase tracking-widest">Verify visitor passes and manage gate entries</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-6 py-3 bg-black border-2 border-cyan-500 shadow-[4px_4px_0px_#ff00ff] flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-none animate-pulse" />
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-cyan-400">Gate 1 Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Verification Section */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-black p-10 border-4 border-cyan-500 shadow-[12px_12px_0px_#ff00ff] crt-screen">
            <h3 className="text-xl font-black text-cyan-400 mb-8 flex items-center gap-3 uppercase font-mono glitch-text">
              <Scan size={24} className="text-magenta-500" /> Verify Pass
            </h3>
            
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-black uppercase text-cyan-900 ml-3 tracking-widest">Enter Pass ID</label>
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-cyan-900" size={20} />
                  <input 
                    type="text" 
                    placeholder="E.G. ABC123XY" 
                    className="w-full pl-16 pr-6 py-5 bg-black border-2 border-cyan-500/30 outline-none font-mono font-black text-lg text-cyan-400 placeholder-cyan-900 focus:border-magenta-500 transition-colors uppercase tracking-widest"
                    value={passId}
                    onChange={(e) => setPassId(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setIsScanning(true)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black border border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-black transition-colors"
                    title="Scan QR Code"
                  >
                    <Camera size={20} />
                  </button>
                </div>
              </div>
              <button 
                type="submit"
                disabled={verifying || !passId}
                className="w-full py-5 bg-cyan-500 text-black border-2 border-black font-mono font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-[8px_8px_0px_#ff00ff] transition-all active:scale-95 disabled:opacity-50"
              >
                {verifying ? <Loader2 className="animate-spin" /> : <ShieldCheck size={18} />} Verify Visitor
              </button>
            </form>

            {isScanning && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                <div className="bg-black border-4 border-cyan-500 w-full max-w-md p-6 shadow-[12px_12px_0px_#ff00ff] relative crt-screen">
                  <button 
                    onClick={() => setIsScanning(false)}
                    className="absolute top-4 right-4 p-2 bg-black border border-magenta-500 text-magenta-500 hover:bg-magenta-500 hover:text-black transition-colors z-10"
                  >
                    <X size={20} />
                  </button>
                  <h3 className="text-lg font-black text-center mb-4 text-cyan-400 uppercase font-mono glitch-text">Scan Visitor Pass</h3>
                  <div id="reader" className="overflow-hidden border-2 border-magenta-500"></div>
                  <p className="text-center text-[10px] text-cyan-900 mt-4 font-mono uppercase tracking-widest">Point camera at the visitor's QR code</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-8 p-6 bg-black border-2 border-red-500 flex items-center gap-4 text-red-500 shadow-[4px_4px_0px_#ff00ff33]">
                <XCircle size={24} />
                <p className="text-xs font-mono font-black uppercase tracking-widest">{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-8 p-6 bg-black border-2 border-green-500 flex items-center gap-4 text-green-500 shadow-[4px_4px_0px_#ff00ff33]">
                <CheckCircle2 size={24} />
                <p className="text-xs font-mono font-black uppercase tracking-widest">{success}</p>
              </div>
            )}
          </div>

          {visitor && (
            <div className="bg-black p-10 border-4 border-magenta-500 text-cyan-400 shadow-[12px_12px_0px_#00ffff] animate-in slide-in-from-bottom-5 crt-screen">
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 border-2 border-cyan-500 bg-black flex items-center justify-center text-cyan-500 shadow-[4px_4px_0px_#ff00ff]">
                  <User size={32} />
                </div>
                <span className="px-4 py-1.5 border border-cyan-500 text-cyan-500 text-[10px] font-mono font-black uppercase tracking-widest">
                  {visitor.type}
                </span>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-3xl font-black tracking-tighter uppercase font-mono glitch-text">{visitor.name}</h4>
                  <p className="text-cyan-500/70 font-mono text-xs uppercase tracking-widest flex items-center gap-2 mt-1">
                    <Phone size={14} /> {visitor.phone}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-cyan-500/30 bg-black shadow-[2px_2px_0px_#ff00ff33]">
                    <p className="text-[9px] font-mono font-black uppercase text-cyan-900 tracking-widest mb-1">Destination</p>
                    <p className="text-sm font-mono font-black flex items-center gap-2 uppercase"><Home size={14} /> {visitor.flatId}</p>
                  </div>
                  <div className="p-4 border border-cyan-500/30 bg-black shadow-[2px_2px_0px_#ff00ff33]">
                    <p className="text-[9px] font-mono font-black uppercase text-cyan-900 tracking-widest mb-1">Purpose</p>
                    <p className="text-sm font-mono font-black line-clamp-1 uppercase">{visitor.purpose || 'Visit'}</p>
                  </div>
                </div>

                <button 
                  onClick={handleCheckIn}
                  className="w-full py-5 bg-magenta-500 text-black border-2 border-black font-mono font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-[8px_8px_0px_#00ffff] hover:bg-black hover:text-magenta-500 hover:border-magenta-500 transition-all active:scale-95"
                >
                  <LogIn size={18} /> Confirm Entry
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Active Visitors Log */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-black p-10 border-4 border-cyan-500 shadow-[12px_12px_0px_#ff00ff] crt-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
              <h3 className="text-2xl font-black text-cyan-400 flex items-center gap-4 uppercase font-mono glitch-text">
                <History size={28} className="text-magenta-500" /> Live Gate Log
              </h3>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-900" />
                  <input 
                    type="text"
                    placeholder="SEARCH NAME, PHONE, FLAT..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-black border-2 border-cyan-500/30 text-cyan-400 placeholder-cyan-900 font-mono text-[10px] font-black uppercase tracking-widest focus:border-magenta-500 outline-none"
                  />
                </div>
                <span className="px-4 py-2 border border-green-500 text-green-500 text-[10px] font-mono font-black uppercase tracking-widest shrink-0 shadow-[2px_2px_0px_#ff00ff33]">
                  {activeVisitors.length} Inside
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {loadingActive ? (
                <div className="py-20 flex justify-center">
                  <Loader2 className="animate-spin text-cyan-500" size={32} />
                </div>
              ) : activeVisitors.filter(v => 
                  v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  v.phone.includes(searchQuery) || 
                  v.flatId.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-cyan-500/20">
                  <UserCheck size={48} className="mx-auto text-cyan-900 mb-4" />
                  <p className="text-cyan-900 font-mono font-black uppercase tracking-widest text-[10px]">No active visitors found</p>
                </div>
              ) : (
                activeVisitors.filter(v => 
                  v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  v.phone.includes(searchQuery) || 
                  v.flatId.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((v, i) => (
                  <div key={v._id || i} className="group p-8 bg-black border-2 border-magenta-500/30 hover:border-magenta-500 transition-all flex flex-col md:flex-row items-center justify-between gap-6 shadow-[4px_4px_0px_#00ffff33] hover:shadow-[4px_4px_0px_#00ffff]">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 border-2 border-cyan-500 bg-black flex items-center justify-center text-cyan-900 group-hover:text-cyan-500 transition-colors shadow-[2px_2px_0px_#ff00ff33]">
                        <User size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h5 className="text-lg font-black text-cyan-400 uppercase font-mono">{v.name}</h5>
                          <span className="px-2 py-0.5 border border-magenta-500 text-magenta-500 text-[8px] font-mono font-black uppercase">{v.type}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-1">
                          <p className="text-[10px] font-mono font-black text-cyan-900 flex items-center gap-2 uppercase tracking-widest"><Home size={12} /> {v.flatId}</p>
                          <p className="text-[10px] font-mono font-black text-cyan-900 flex items-center gap-2 uppercase tracking-widest"><Clock size={12} /> In: {new Date(v.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleCheckOut(v._id)}
                      className="px-8 py-4 border-2 border-red-500 text-red-500 font-mono font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-black transition-all flex items-center gap-2 shrink-0 shadow-[4px_4px_0px_#ff00ff33]"
                    >
                      <LogOut size={14} /> Check Out
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black border-4 border-amber-500 p-10 text-amber-500 shadow-[8px_8px_0px_#ff00ff] flex flex-col justify-between crt-screen">
              <ShieldAlert size={32} className="mb-8" />
              <div>
                <h4 className="text-xl font-black mb-2 uppercase font-mono">Security Protocol</h4>
                <p className="text-[10px] font-mono font-black text-amber-500/70 uppercase tracking-widest leading-relaxed">
                  Always verify physical ID for service providers and delivery personnel even with a valid digital pass.
                </p>
              </div>
            </div>
            <div className="bg-black border-4 border-cyan-500 p-10 text-cyan-400 shadow-[8px_8px_0px_#ff00ff] flex flex-col justify-between crt-screen">
              <History size={32} className="mb-8 text-magenta-500" />
              <div>
                <h4 className="text-xl font-black mb-2 uppercase font-mono">Shift Summary</h4>
                <p className="text-[10px] font-mono font-black text-cyan-900 uppercase tracking-widest leading-relaxed">
                  Total entries today: <span className="text-cyan-400 font-black">{analytics?.dailyVisitors || 0}</span><br />
                  Average stay duration: <span className="text-cyan-400 font-black">{analytics?.avgStayDuration || 0} mins</span>
                </p>
                {analytics?.frequentVisitors?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-cyan-500/20">
                    <p className="text-[10px] font-mono font-black uppercase tracking-widest text-cyan-900 mb-2">Frequent Visitors</p>
                    <div className="flex flex-wrap gap-2">
                      {analytics.frequentVisitors.map((fv: any) => (
                        <span key={fv._id} className="px-2 py-1 border border-magenta-500 text-magenta-500 text-[10px] font-mono font-black uppercase">
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
