import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Lock, Mail, Loader2, Shield, CheckCircle, AlertTriangle, 
  UserPlus, Info, ShieldCheck, Home, ArrowRight, User, 
  ShieldAlert 
} from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden p-4">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-500/5 rounded-full blur-[120px] -mr-40 -mt-40" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-brand-600/5 rounded-full blur-[120px] -ml-40 -mb-40" />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200 dark:shadow-none">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/20 mx-auto mb-4 rounded-2xl flex items-center justify-center text-brand-600">
              <Shield size={32} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
              Saurashtra <span className="text-brand-600">Residency</span>
            </h1>
            <p className="text-[10px] font-semibold text-slate-400 tracking-wider">
              Secure Portal Access
            </p>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-600 font-bold text-sm">
              <CheckCircle size={20} />
              {success}
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-sm">
              <AlertTriangle size={20} />
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-slate-400 tracking-wider ml-2 mb-1 block">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={18} />
                </div>
                <input 
                  type="email"
                  placeholder="name@residency.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading || !!success}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 font-bold outline-none focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 tracking-wider ml-2 mb-1 block">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={18} />
                </div>
                <input 
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading || !!success}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 font-bold outline-none focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading || !!success}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-lg py-4 rounded-2xl mt-2 transition-all shadow-lg shadow-brand-600/20 active:scale-95 flex items-center justify-center gap-2 tracking-wider"
            >
              {loading && !success ? <Loader2 size={24} className="animate-spin" /> : 'Login'}
            </button>
          </form>

          {/* Demo Access Panel */}
          <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-center gap-2 mb-4 text-[10px] font-bold text-slate-400 tracking-wider">
              <ShieldCheck size={14} className="text-brand-600" /> Quick Demo Access
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => quickDemoLogin('admin')}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white py-3 rounded-2xl text-[10px] font-bold tracking-wider flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
              >
                <ShieldAlert size={14} className="text-red-500" />
                Admin
              </button>
              <button 
                onClick={() => quickDemoLogin('resident')}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white py-3 rounded-2xl text-[10px] font-bold tracking-wider flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
              >
                <User size={14} className="text-brand-600" />
                Resident
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link 
              to="/register" 
              className="text-xs font-bold tracking-wider text-slate-400 hover:text-brand-600 transition-colors"
            >
              New to residency? <span className="text-brand-600 underline underline-offset-4">Register Property</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
