
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, UserCheck, UserX, Clock, MapPin, 
  Home, Mail, Loader2, AlertCircle, Info, CheckCircle2,
  ShieldAlert, BadgeCheck, Fingerprint
} from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

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
      if (parsed.role !== 'ADMIN') {
        navigate('/'); // Only admin can access this page
        return;
      }
    }
    fetchPending();
  }, [navigate]);

  const fetchPending = async () => {
    setLoading(true);
    const data = await api.getPendingRegistrations();
    setPendingUsers(data);
    setLoading(false);
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
    if (!confirm("Are you sure you want to REJECT this registration? This user will not be able to log in.")) return;
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
        <Loader2 className="animate-spin text-brand-600 mb-4" size={40} />
        <p className="font-black uppercase tracking-widest text-xs text-slate-400">Authenticating Executive Queue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-up max-w-6xl mx-auto">
      {/* Header with Admin Authority Label */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-600/20">
             <ShieldAlert size={14} /> Restricted Access: Admin Only
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Membership <span className="text-brand-600">Verification</span></h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Critical authorization required for new resident applications</p>
        </div>
        <div className="flex items-center gap-4 px-8 py-5 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
           <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-600">
             <Clock size={24} />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Queue Depth</p>
              <p className="text-2xl font-black dark:text-white leading-none">{pendingUsers.length}</p>
           </div>
        </div>
      </div>

      {pendingUsers.length === 0 ? (
        <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-[4rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center">
           <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/10 rounded-[3rem] flex items-center justify-center text-emerald-600 mb-8 shadow-xl">
              <CheckCircle2 size={48} />
           </div>
           <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Security Protocol Optimized</h3>
           <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto mt-2">All registration requests have been cleared. The society entry gate is currently secure.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {pendingUsers.map((user) => (
            <div key={user.id} className="group bg-white dark:bg-slate-900 p-10 md:p-12 rounded-[4rem] border border-slate-100 dark:border-slate-800 premium-shadow flex flex-col lg:flex-row items-center justify-between gap-12 transition-all hover:border-brand-600/30 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-brand-600/5 rounded-full blur-[60px] -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700" />
              
              <div className="flex flex-col md:flex-row items-center gap-10 w-full lg:w-auto relative z-10">
                <div className="relative">
                  <div className="w-28 h-28 rounded-[3rem] overflow-hidden bg-slate-50 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shrink-0 shadow-2xl transition-transform group-hover:scale-105">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="User" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-600 rounded-2xl flex items-center justify-center text-white border-4 border-white dark:border-slate-900 shadow-xl">
                    <Fingerprint size={18} />
                  </div>
                </div>

                <div className="text-center md:text-left space-y-4">
                  <div>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{user.name}</h3>
                      <div className="flex items-center gap-2 px-3 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-xl">
                        <ShieldCheck size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{user.position}</span>
                      </div>
                    </div>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                      <Mail size={14} className="text-brand-600" /> {user.email}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                       <MapPin size={18} className="text-brand-600" />
                       <div>
                         <p className="text-[9px] font-black uppercase text-slate-400 leading-none mb-1">Mapping</p>
                         <p className="text-sm font-black dark:text-white">Wing {user.wing} • {user.flatNo}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                       <Home size={18} className="text-brand-600" />
                       <div>
                         <p className="text-[9px] font-black uppercase text-slate-400 leading-none mb-1">Legal Status</p>
                         <p className="text-sm font-black dark:text-white">{user.occupancyType}</p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto relative z-10">
                <button 
                  disabled={processingId === user.id}
                  onClick={() => handleReject(user.id)}
                  className="flex-1 lg:flex-none px-12 py-5 bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all border-2 border-rose-100 dark:border-rose-900/30 active:scale-[0.98] shadow-xl shadow-rose-500/5"
                >
                  {processingId === user.id ? <Loader2 className="animate-spin mx-auto" size={18} /> : (
                    <div className="flex items-center justify-center gap-2"><UserX size={18} /> Reject Access</div>
                  )}
                </button>
                <button 
                  disabled={processingId === user.id}
                  onClick={() => handleApprove(user.id)}
                  className="flex-1 lg:flex-none px-12 py-5 bg-brand-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-brand-500/40 hover:bg-brand-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3 border-2 border-brand-500"
                >
                  {processingId === user.id ? <Loader2 className="animate-spin" size={18} /> : (
                    <><UserCheck size={18} /> Authorize Entry</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Disclaimer Footer */}
      <div className="p-12 bg-[#0F172A] rounded-[4rem] text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
           <div className="w-20 h-20 bg-white/5 backdrop-blur-md rounded-3xl flex items-center justify-center text-amber-500 border border-white/10 shrink-0">
              <ShieldAlert size={40} />
           </div>
           <div className="space-y-4">
              <h4 className="text-2xl font-black tracking-tight">Executive Responsibility Notice</h4>
              <p className="text-slate-400 text-lg font-medium leading-relaxed">
                As a Society Administrator, your authorization grants users complete digital access to residency financials, voting, and private community records. 
                <span className="text-white font-black ml-1">Strict identity verification via physical society registers is mandatory before approval.</span>
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationApprovals;
