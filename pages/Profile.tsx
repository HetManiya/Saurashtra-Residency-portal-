
import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Shield, Home, Key, Lock, CheckCircle2, 
  AlertCircle, Loader2, Save, CreditCard, History, 
  Calendar, ArrowRight, ShieldCheck, BadgeCheck, Smartphone
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../components/LanguageContext';
import { MaintenanceRecord, PaymentStatus } from '../types';

const Profile: React.FC = () => {
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const stored = localStorage.getItem('sr_user');
    if (stored) {
      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);
      loadUserData(parsedUser.flatId);
    }
  }, []);

  const loadUserData = async (flatId: string) => {
    setLoading(true);
    try {
      const records = await api.getMaintenanceRecords(flatId);
      setMaintenance(records);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.new !== passForm.confirm) {
      setStatusMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    setIsUpdating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatusMsg({ type: 'success', text: 'Password updated successfully!' });
      setPassForm({ current: '', new: '', confirm: '' });
    } catch (e) {
      setStatusMsg({ type: 'error', text: 'Failed to update password' });
    } finally {
      setIsUpdating(false);
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
    }
  };

  if (!user) return null;

  const unpaidCount = maintenance.filter(m => m.status !== PaymentStatus.PAID).length;
  const totalPaid = maintenance.filter(m => m.status === PaymentStatus.PAID).reduce((sum, m) => sum + m.amount, 0);

  return (
    <div className="space-y-10 animate-fade-up pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">My <span className="text-brand-600">Identity</span></h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage your residency credentials and payment history</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <BadgeCheck size={14} /> Verified Member
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Personal Info & Security */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 premium-shadow">
            <div className="text-center space-y-6">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-[3rem] overflow-hidden bg-slate-50 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-2xl mx-auto">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Avatar" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-600 text-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-900">
                  <ShieldCheck size={18} />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{user.name}</h3>
                <p className="text-brand-600 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{user.role}</p>
              </div>
              
              <div className="pt-8 border-t border-slate-50 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <Mail className="text-brand-600" size={18} />
                  <div className="text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                    <p className="text-sm font-bold dark:text-white truncate max-w-[180px]">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <Home className="text-brand-600" size={18} />
                  <div className="text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Property Unit</p>
                    <p className="text-sm font-bold dark:text-white">{user.flatId}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-slate-950 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/10 rounded-full blur-[80px] -mr-20 -mt-20" />
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center">
                  <Lock size={24} />
                </div>
                <div>
                  <h4 className="font-black text-lg tracking-tight">Security Center</h4>
                  <p className="text-[9px] font-black text-brand-400 uppercase tracking-widest">Update Credentials</p>
                </div>
              </div>

              {statusMsg.text && (
                <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-in zoom-in-95 ${
                  statusMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {statusMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {statusMsg.text}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Current Password</label>
                  <input 
                    type="password" required placeholder="••••••••"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-sm font-bold focus:border-brand-600/50 transition-all"
                    value={passForm.current} onChange={e => setPassForm({...passForm, current: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">New Password</label>
                  <input 
                    type="password" required placeholder="New Password"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-sm font-bold focus:border-brand-600/50 transition-all"
                    value={passForm.new} onChange={e => setPassForm({...passForm, new: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Confirm New Password</label>
                  <input 
                    type="password" required placeholder="Confirm New Password"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none text-sm font-bold focus:border-brand-600/50 transition-all"
                    value={passForm.confirm} onChange={e => setPassForm({...passForm, confirm: e.target.value})}
                  />
                </div>
                <button 
                  disabled={isUpdating}
                  className="w-full py-4 bg-white text-slate-900 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-50 transition-all"
                >
                  {isUpdating ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                  {isUpdating ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </section>
        </div>

        {/* Main: Payment History & Stats */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-48">
              <div className="flex justify-between items-center">
                <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/10 rounded-2xl flex items-center justify-center text-brand-600">
                  <CreditCard size={24} />
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lifetime Contributed</span>
              </div>
              <div>
                <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">₹{totalPaid.toLocaleString()}</h4>
                <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mt-1">Status: Regular Payer</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-48">
              <div className="flex justify-between items-center">
                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/10 rounded-2xl flex items-center justify-center text-rose-600">
                  <AlertCircle size={24} />
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pending Records</span>
              </div>
              <div>
                <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{unpaidCount}</h4>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Current Maintenance Cycle</p>
              </div>
            </div>
          </div>

          <section className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 premium-shadow overflow-hidden">
            <div className="p-10 border-b border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-white">
                  <History size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">Maintenance Ledger</h3>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Historical Payment Tracking</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="py-20 flex flex-col items-center"><Loader2 className="animate-spin text-brand-600 mb-2" /><p className="text-[10px] font-black uppercase text-slate-400">Fetching Ledger...</p></div>
              ) : maintenance.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                   <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-200 mx-auto">
                      <CreditCard size={32} />
                   </div>
                   <p className="text-slate-400 font-bold text-sm">No payment records found for this unit.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 dark:bg-slate-800/30">
                    <tr>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Period</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Status</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {maintenance.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/10 text-brand-600 flex items-center justify-center">
                                <Calendar size={18} />
                             </div>
                             <div>
                               <p className="font-black text-slate-900 dark:text-white tracking-tight">{record.month} {record.year}</p>
                               {record.paidDate && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Paid on {new Date(record.paidDate).toLocaleDateString()}</p>}
                             </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <span className="font-black text-slate-900 dark:text-white">₹{record.amount}</span>
                        </td>
                        <td className="px-10 py-8">
                          <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 ${
                            record.status === PaymentStatus.PAID ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-10 py-8">
                          {record.status === PaymentStatus.PAID ? (
                             <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-brand-600 rounded-xl transition-all border border-transparent hover:border-brand-600/20">
                               <ArrowRight size={18} />
                             </button>
                          ) : (
                             <button className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all active:scale-95">
                               Pay Now
                             </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
