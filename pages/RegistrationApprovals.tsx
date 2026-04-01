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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-800/50">
              <ShieldAlert size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Society Management Authority</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase mb-1">
            Membership <span className="text-brand-600 dark:text-brand-400">Verification</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">
            Approve or reject new resident requests for Saurashtra Residency
          </p>
        </div>
        <div className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 rounded-xl flex items-center justify-center text-brand-600 dark:text-brand-400">
            <Clock size={24} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Pending Requests</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{pendingUsers.length}</span>
          </div>
        </div>
      </div>

      {pendingUsers.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-sm">
          <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-2">Access Control Clear</h3>
          <p className="text-slate-500 max-w-md mx-auto text-sm font-medium uppercase tracking-widest">
            All registration requests have been processed. Digital gateway is secure.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingUsers.map((pUser) => (
            <div 
              key={pUser.id} 
              className="bg-white dark:bg-slate-900 p-6 md:p-8 border border-slate-200 dark:border-slate-800 rounded-3xl relative overflow-hidden group shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-500 opacity-5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8">
                  <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                    <div className="relative shrink-0">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${pUser.email}`} 
                        alt={pUser.name}
                        className="w-28 h-28 rounded-2xl border-4 border-white dark:border-slate-800 shadow-lg bg-slate-50 dark:bg-slate-800"
                      />
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-600 rounded-xl border-4 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-lg">
                        <Fingerprint size={18} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row items-center gap-3 mb-2 justify-center md:justify-start">
                        <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                          {pUser.name}
                        </h3>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-lg border border-brand-100 dark:border-brand-800/50">
                          <ShieldCheck size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{pUser.role}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-6 justify-center md:justify-start">
                        <Mail size={14} className="text-brand-500" />
                        <span className="text-xs font-medium uppercase tracking-widest">{pUser.email}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                          <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 shrink-0 shadow-sm">
                            <MapPin size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Mapping</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white uppercase">{pUser.flatId || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                          <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 shrink-0 shadow-sm">
                            <Home size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Tenure</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white uppercase">{pUser.occupancyType}</span>
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
                      className="flex-1 py-4 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                    >
                      {processingId === pUser.id ? <Loader2 size={18} className="animate-spin" /> : <UserX size={18} />}
                      Reject
                    </button>
                    <button 
                      disabled={processingId === pUser.id}
                      onClick={() => handleApprove(pUser.id)}
                      className="flex-1 bg-brand-600 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
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

      <div className="mt-12 p-8 bg-slate-900 dark:bg-slate-800 rounded-3xl text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-500" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="w-20 h-20 bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-400 shrink-0 border border-brand-500/20">
            <ShieldAlert size={40} />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2 tracking-tight uppercase">Security Protocol Verification</h3>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider leading-relaxed max-w-2xl">
              Approving a membership request grants access to internal society records and ledger details.
              <span className="text-brand-400 font-bold block mt-1">Always verify identities via physical registers before granting digital entry.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationApprovals;
