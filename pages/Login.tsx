import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Lock, Mail, Loader2, Shield, CheckCircle, AlertTriangle, UserPlus, Info, ShieldCheck, Home } from 'lucide-react';
import { api } from '../services/api';

const Login: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state && (location.state as any).registered) {
      setSuccess((location.state as any).message || 'Account created successfully!');
      if ((location.state as any).email) setEmail((location.state as any).email);
    }
  }, [location.state]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await api.login({ email, password });
      if (response && (response.token || response.user)) {
        window.dispatchEvent(new Event('storage'));
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFEFF] dark:bg-[#020617] p-6 transition-all duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-600/5 rounded-full blur-[120px] -mr-96 -mt-96" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[120px] -ml-96 -mb-96" />

      <div className="max-w-xl w-full relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        
        {/* Role Hint Section - Exclusive for Demo */}
        <div className="md:col-span-4 hidden md:flex flex-col gap-4">
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-brand-500/5">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <Info size={14} /> Role Switching
              </h5>
              <div className="space-y-4">
                <button 
                  onClick={() => { setEmail('admin@residency.com'); setPassword('admin123'); }}
                  className="w-full p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 text-left transition-all hover:scale-105 active:scale-95"
                >
                   <p className="text-xs font-black text-amber-600 flex items-center gap-2"><ShieldCheck size={14} /> Admin Account</p>
                   <p className="text-[10px] text-amber-500 font-bold opacity-60">Full Governance Control</p>
                </button>
                <button 
                  onClick={() => { setEmail('resident@residency.com'); setPassword('resident123'); }}
                  className="w-full p-4 rounded-2xl bg-brand-50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-800 text-left transition-all hover:scale-105 active:scale-95"
                >
                   <p className="text-xs font-black text-brand-600 flex items-center gap-2"><Home size={14} /> Resident Account</p>
                   <p className="text-[10px] text-brand-500 font-bold opacity-60">Personal Home Services</p>
                </button>
              </div>
           </div>
        </div>

        <div className="md:col-span-8 bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl p-10 md:p-14 border border-slate-100 dark:border-slate-800 premium-shadow">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-brand-500/20 rotate-3">
              <Shield size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">Saurashtra <span className="text-brand-600">Portal</span></h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Premium Community Access</p>
          </div>

          {success && <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-600 text-xs font-bold flex gap-3"><CheckCircle size={18} /> {success}</div>}
          {error && <div className="mb-6 p-4 rounded-2xl bg-rose-50 text-rose-600 text-xs font-bold flex gap-3"><AlertTriangle size={18} /> {error}</div>}

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-3 tracking-widest">Credential ID</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" required placeholder="name@residency.com"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] outline-none text-sm font-bold border-2 border-transparent focus:border-brand-600/20 transition-all dark:text-white"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-3 tracking-widest">Secret Key</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" required placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] outline-none text-sm font-bold border-2 border-transparent focus:border-brand-600/20 transition-all dark:text-white"
                  value={password} onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full py-4.5 bg-brand-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-brand-500/20 hover:bg-brand-700 transition-all active:scale-[0.98] mt-4"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Authenticate Access'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t dark:border-slate-800 text-center">
            <Link to="/register" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-600 transition-colors">
              New to Pasodara? <span className="text-brand-600">Request Account</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;