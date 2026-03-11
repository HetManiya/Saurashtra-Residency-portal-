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
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden p-4 crt-screen">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-magenta-500/5 rounded-full blur-[120px] -mr-40 -mt-40" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[120px] -ml-40 -mb-40" />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="bg-black p-8 md:p-10 border-4 border-cyan-500 shadow-[12px_12px_0px_#ff00ff]">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-black mx-auto mb-4 shadow-[4px_4px_0px_#ff00ff] border-2 border-cyan-400 flex items-center justify-center text-cyan-400">
              <Shield size={32} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-cyan-400 mb-1 glitch-text" data-text="Saurashtra Residency">
              Saurashtra <span className="text-magenta-500">Residency</span>
            </h1>
            <p className="text-[10px] font-black text-cyan-700 uppercase tracking-[0.2em] font-mono">
              {`> SECURE_TERMINAL_ACCESS_v1.0`}
            </p>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-cyan-900/20 border-2 border-cyan-500 flex items-center gap-3 text-cyan-400 font-bold text-sm">
              <CheckCircle size={20} />
              {success}
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-magenta-900/20 border-2 border-magenta-500 flex items-center gap-3 text-magenta-500 font-bold text-sm">
              <AlertTriangle size={20} />
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest ml-2 mb-1 block">
                User ID
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700">
                  <Mail size={18} />
                </div>
                <input 
                  type="text"
                  placeholder="name@residency.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading || !!success}
                  className="w-full bg-black border-2 border-cyan-500 pl-12 pr-4 py-3.5 text-cyan-400 placeholder:text-cyan-900 font-bold outline-none focus:border-magenta-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest ml-2 mb-1 block">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700">
                  <Lock size={18} />
                </div>
                <input 
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading || !!success}
                  className="w-full bg-black border-2 border-cyan-500 pl-12 pr-4 py-3.5 text-cyan-400 placeholder:text-cyan-900 font-bold outline-none focus:border-magenta-500 transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading || !!success}
              className="w-full bg-magenta-500 hover:bg-black hover:text-magenta-500 hover:border-magenta-500 border-2 border-black text-white font-black text-lg py-3.5 mt-2 transition-all shadow-[6px_6px_0px_#00ffff] active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              {loading && !success ? <Loader2 size={24} className="animate-spin" /> : 'Enter Terminal'}
            </button>
          </form>

          {/* Demo Access Panel */}
          <div className="mt-8 p-6 bg-cyan-900/10 border-2 border-cyan-900/30">
            <div className="flex items-center justify-center gap-2 mb-4 text-[10px] font-black text-cyan-700 uppercase tracking-widest">
              <ShieldCheck size={14} className="text-magenta-500" /> Demo Suite Access
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => quickDemoLogin('admin')}
                className="flex-1 bg-black border-2 border-magenta-500 text-magenta-500 py-2.5 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-magenta-500 hover:text-white transition-all shadow-[3px_3px_0px_#00ffff]"
              >
                <ShieldAlert size={14} />
                Admin
              </button>
              <button 
                onClick={() => quickDemoLogin('resident')}
                className="flex-1 bg-black border-2 border-cyan-500 text-cyan-400 py-2.5 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-cyan-400 hover:text-black transition-all shadow-[3px_3px_0px_#ff00ff]"
              >
                <User size={14} />
                Resident
              </button>
            </div>
            <p className="text-center mt-4 text-[9px] text-cyan-900 font-bold font-mono uppercase">
              {`> Note: Admin access is restricted to verified committee credentials.`}
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link 
              to="/register" 
              className="text-xs font-black uppercase tracking-widest text-cyan-700 hover:text-magenta-500 transition-colors"
            >
              New to residency? <span className="text-magenta-500 underline underline-offset-4">Register Property</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
