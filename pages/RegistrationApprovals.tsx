import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, UserCheck, UserX, Clock, MapPin, 
  Home, Mail, Loader2, AlertCircle, Info, CheckCircle2,
  ShieldAlert, BadgeCheck, Fingerprint
} from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const RegistrationApprovals: React.FC = () => {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('sr_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      if (parsed.role !== 'ADMIN' && parsed.role !== 'COMMITTEE') {
        navigate('/'); // Only admin/committee can access
        return;
      }
    }
    fetchPending();
  }, [navigate]);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await api.getPendingRegistrations();
      setPendingUsers(data);
    } catch (e) {
      // Silently handle error
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setProcessingId(userId);
    try {
      await api.approveRegistration(userId);
      await fetchPending();
    } catch (e) {
      alert("Approval failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string) => {
    if (!window.confirm("Are you sure you want to REJECT this registration?")) return;
    setProcessingId(userId);
    try {
      await api.rejectRegistration(userId);
      await fetchPending();
    } catch (e) {
      alert("Rejection failed");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 size={40} className="animate-spin text-brand-600 mb-4" />
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Syncing Authorization Queue...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-6 border-b-2 border-magenta-500/30">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-black border border-amber-500 text-amber-500 rounded-none shadow-[2px_2px_0px_#ff00ff]">
              <ShieldAlert size={14} />
              <span className="text-[10px] font-mono font-black uppercase tracking-widest">Society Management Authority</span>
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-cyan-400 uppercase glitch-text mb-2">
            Membership <span className="text-magenta-500">Verification</span>
          </h1>
          <p className="text-cyan-500/70 font-mono text-xs uppercase tracking-widest">
            Approve or reject new resident requests for Saurashtra Residency
          </p>
        </div>
        <div className="flex items-center gap-4 px-6 py-4 bg-black border-4 border-cyan-500 shadow-[8px_8px_0px_#ff00ff]">
          <div className="w-12 h-12 border-2 border-magenta-500 flex items-center justify-center text-magenta-500 shadow-[4px_4px_0px_#00ffff]">
            <Clock size={24} />
          </div>
          <div>
            <span className="text-[10px] font-mono font-black text-cyan-900 uppercase tracking-widest block">Pending Requests</span>
            <span className="text-2xl font-black text-cyan-400 font-mono">{pendingUsers.length}</span>
          </div>
        </div>
      </div>

      {pendingUsers.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center border-4 border-dashed border-cyan-500/30 bg-black shadow-[12px_12px_0px_#ff00ff33]">
          <div className="w-24 h-24 border-4 border-green-500 bg-black flex items-center justify-center text-green-500 mb-6 shadow-[8px_8px_0px_#ff00ff]">
            <CheckCircle2 size={48} />
          </div>
          <h3 className="text-2xl font-black text-cyan-400 uppercase font-mono glitch-text mb-2">Access Control Clear</h3>
          <p className="text-cyan-900 max-w-md mx-auto font-mono uppercase text-xs tracking-widest">
            All registration requests have been processed. Digital gateway is secure.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingUsers.map((pUser) => (
            <div 
              key={pUser.id} 
              className="bg-black p-6 md:p-8 border-4 border-magenta-500 relative overflow-hidden group shadow-[12px_12px_0px_#00ffff] transition-all duration-300 hover:translate-x-2 crt-screen"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500 opacity-5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8">
                  <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                    <div className="relative shrink-0">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${pUser.email}`} 
                        alt={pUser.name}
                        className="w-28 h-28 border-4 border-cyan-500 shadow-[4px_4px_0px_#ff00ff] bg-black"
                      />
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-magenta-500 border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#00ffff]">
                        <Fingerprint size={18} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row items-center gap-3 mb-2 justify-center md:justify-start">
                        <h3 className="text-3xl font-black tracking-tight text-cyan-400 uppercase font-mono glitch-text">
                          {pUser.name}
                        </h3>
                        <div className="flex items-center gap-1.5 px-2 py-1 border border-magenta-500 text-magenta-500 bg-black">
                          <ShieldCheck size={12} />
                          <span className="text-[10px] font-mono font-black uppercase tracking-widest">{pUser.role}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-cyan-900 mb-6 justify-center md:justify-start">
                        <Mail size={14} className="text-cyan-500" />
                        <span className="text-xs font-mono font-black uppercase tracking-widest">{pUser.email}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <div className="bg-black border border-cyan-500/30 p-3 shadow-[2px_2px_0px_#ff00ff33] flex items-center gap-3">
                          <div className="w-10 h-10 border border-cyan-500 flex items-center justify-center text-cyan-500 shrink-0">
                            <MapPin size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-black text-cyan-900 uppercase tracking-widest block">Mapping</span>
                            <span className="text-sm font-mono font-black text-cyan-400 uppercase">{pUser.flatId || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="bg-black border border-cyan-500/30 p-3 shadow-[2px_2px_0px_#ff00ff33] flex items-center gap-3">
                          <div className="w-10 h-10 border border-cyan-500 flex items-center justify-center text-cyan-500 shrink-0">
                            <Home size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-black text-cyan-900 uppercase tracking-widest block">Tenure</span>
                            <span className="text-sm font-mono font-black text-cyan-400 uppercase">{pUser.occupancyType}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 w-full">
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button 
                      disabled={processingId === pUser.id}
                      onClick={() => handleReject(pUser.id)}
                      className="flex-1 py-4 border-2 border-red-500 text-red-500 font-mono font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-[4px_4px_0px_#ff00ff33]"
                    >
                      {processingId === pUser.id ? <Loader2 size={18} className="animate-spin" /> : <UserX size={18} />}
                      Reject
                    </button>
                    <button 
                      disabled={processingId === pUser.id}
                      onClick={() => handleApprove(pUser.id)}
                      className="flex-1 bg-cyan-500 text-black py-4 border-2 border-black font-mono font-black text-xs uppercase tracking-widest hover:bg-black hover:text-cyan-500 hover:border-cyan-500 transition-colors shadow-[4px_4px_0px_#ff00ff] active:scale-95 transform duration-100 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {processingId === pUser.id ? <Loader2 size={18} className="animate-spin" /> : <UserCheck size={18} />}
                      Authorize
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 p-8 border-4 border-cyan-500 bg-black text-cyan-400 relative overflow-hidden shadow-[12px_12px_0px_#ff00ff] crt-screen">
        <div className="absolute top-0 left-0 right-0 h-2 bg-magenta-500" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="w-20 h-20 border-2 border-magenta-500 bg-black flex items-center justify-center text-magenta-500 shrink-0 shadow-[4px_4px_0px_#00ffff]">
            <ShieldAlert size={40} />
          </div>
          <div>
            <h3 className="text-2xl font-black mb-2 tracking-tight uppercase font-mono glitch-text">Security Protocol Verification</h3>
            <p className="text-cyan-500/70 text-lg font-mono uppercase text-xs leading-relaxed max-w-2xl">
              Approving a membership request grants access to internal society records and ledger details.
              <span className="text-cyan-400 font-black block mt-1">Always verify identities via physical registers before granting digital entry.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationApprovals;
