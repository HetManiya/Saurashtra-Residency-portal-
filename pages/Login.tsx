
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Lock, Mail, Loader2, Shield, CheckCircle, AlertTriangle, UserPlus, Info, ShieldCheck, Home, ArrowRight, User, ShieldAlert } from 'lucide-react';
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

  const handleAuth = async (e?: React.FormEvent, customCreds?: {e: string, p: string}) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    const targetEmail = customCreds ? customCreds.e : email;
    const targetPass = customCreds ? customCreds.p : password;

    try {
      const response = await api.login({ email: targetEmail, password: targetPass });
      if (response && (response.token || response.user)) {
        setSuccess('Login successfully! Redirecting to dashboard...');
        window.dispatchEvent(new Event('storage'));
        
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please use the Quick Demo access below.");
    } finally {
      if (!success) setLoading(false);
    }
  };

  const quickDemoLogin = (role: 'admin' | 'resident') => {
    if (role === 'admin') {
      handleAuth(undefined, { e: 'admin@residency.com', p: 'admin123' });
    } else {
      handleAuth(undefined, { e: 'resident@residency.com', p: 'resident123' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFEFF] dark:bg-[#020617] p-6 transition-all duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-600/5 rounded-full blur-[120px] -mr-96 -mt-96" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[120px] -ml-96 -mb-96" />

      <div className="max-w-lg w-full relative z-10">
        <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl p-10 md:p-14 border border-slate-100 dark:border-slate-800 premium-shadow">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-brand-500/20 rotate-3">
              <Shield size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">Saurashtra Residency <span className="text-brand-600">Portal</span></h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Premium Community Access</p>
          </div>

          {success && <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-600 text-xs font-bold flex gap-3 animate-in zoom-in-95"><CheckCircle size={18} /> {success}</div>}
          {error && <div className="mb-6 p-4 rounded-2xl bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest flex gap-3 leading-relaxed"><AlertTriangle size={18} className="shrink-0" /> {error}</div>}

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-3 tracking-widest">User ID</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" required placeholder="name@residency.com"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] outline-none text-sm font-bold border-2 border-transparent focus:border-brand-600/20 transition-all dark:text-white"
                  value={email} onChange={e => setEmail(e.target.value)}
                  disabled={!!success || loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-3 tracking-widest">Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" required placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] outline-none text-sm font-bold border-2 border-transparent focus:border-brand-600/20 transition-all dark:text-white"
                  value={password} onChange={e => setPassword(e.target.value)}
                  disabled={!!success || loading}
                />
              </div>
            </div>

            <button 
              disabled={loading || !!success}
              className="w-full py-5 bg-brand-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-brand-500/20 hover:bg-brand-700 transition-all active:scale-[0.98] mt-6 disabled:opacity-70"
            >
              {loading && !success ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Login'}
            </button>
          </form>

          {/* Demo Access Panel */}
          <div className="mt-10 p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
             <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center mb-4 flex items-center justify-center gap-2">
               <ShieldCheck size={12} className="text-brand-600" /> Demo Suite Access
             </p>
             <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <button 
                    onClick={() => quickDemoLogin('admin')}
                    disabled={loading}
                    className="flex-1 py-3 bg-amber-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <ShieldAlert size={12} /> System Admin
                  </button>
                  <button 
                    onClick={() => quickDemoLogin('resident')}
                    disabled={loading}
                    className="flex-1 py-3 bg-white dark:bg-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-brand-600 hover:border-brand-600/30 border border-transparent transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <User size={12} /> Live Resident
                  </button>
                </div>
                <p className="text-[8px] text-slate-400 font-bold text-center italic">
                  Note: Admin access is restricted to verified committee credentials in production.
                </p>
             </div>
          </div>

          <div className="mt-8 text-center">
            <Link to="/register" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-600 transition-colors">
              New to residency? <span className="text-brand-600">Register Property</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
