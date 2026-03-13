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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-full">
              <ShieldAlert size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Society Management Authority</span>
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-2">
            Membership <span className="text-brand-600">Verification</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Approve or reject new resident requests for Saurashtra Residency
          </p>
        </div>
        <div className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Pending Requests</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{pendingUsers.length}</span>
          </div>
        </div>
      </div>

      {pendingUsers.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-[2.5rem] flex items-center justify-center text-green-600 dark:text-green-400 mb-6 shadow-xl shadow-green-600/10">
            <CheckCircle2 size={48} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Access Control Clear</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto font-medium">
            All registration requests have been processed. Digital gateway is secure.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingUsers.map((pUser) => (
            <div 
              key={pUser.id} 
              className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-500 opacity-5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8">
                  <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                    <div className="relative shrink-0">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${pUser.email}`} 
                        alt={pUser.name}
                        className="w-28 h-28 rounded-[2rem] border-4 border-white dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-800"
                      />
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-600 rounded-xl border-4 border-white dark:border-slate-800 flex items-center justify-center text-white shadow-lg">
                        <Fingerprint size={18} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row items-center gap-3 mb-2 justify-center md:justify-start">
                        <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                          {pUser.name}
                        </h3>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 rounded-lg border border-brand-100 dark:border-brand-900/30">
                          <ShieldCheck size={12} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{pUser.role}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-slate-400 mb-6 justify-center md:justify-start">
                        <Mail size={14} className="text-brand-500" />
                        <span className="text-xs font-black uppercase tracking-widest">{pUser.email}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                            <MapPin size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Mapping</span>
                            <span className="text-sm font-black text-slate-900 dark:text-white">{pUser.flatId || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                            <Home size={18} />
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tenure</span>
                            <span className="text-sm font-black text-slate-900 dark:text-white">{pUser.occupancyType}</span>
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
                      className="flex-1 py-4 rounded-2xl border-2 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 font-black text-xs uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {processingId === pUser.id ? <Loader2 size={18} className="animate-spin" /> : <UserX size={18} />}
                      Reject
                    </button>
                    <button 
                      disabled={processingId === pUser.id}
                      onClick={() => handleApprove(pUser.id)}
                      className="flex-1 bg-brand-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/20 active:scale-95 transform duration-100 flex items-center justify-center gap-2 disabled:opacity-50"
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

      <div className="mt-12 p-8 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand-500 opacity-20 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="w-20 h-20 bg-white/5 backdrop-blur-md rounded-[1.5rem] border border-white/10 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldAlert size={40} />
          </div>
          <div>
            <h3 className="text-2xl font-black mb-2 tracking-tight">Security Protocol Verification</h3>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
              Approving a membership request grants access to internal society records and ledger details.
              <span className="text-white font-black block mt-1">Always verify identities via physical registers before granting digital entry.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationApprovals;
