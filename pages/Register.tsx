
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  UserPlus, Mail, Lock, User, Shield, Home, ArrowRight, 
  Loader2, CheckCircle, ChevronLeft, MapPin, Users,
  Star, Briefcase, Key, ChevronDown
} from 'lucide-react';
import { api } from '../services/api';
import { BUILDINGS } from '../constants';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'RESIDENT', 
    position: 'Resident', 
    wing: 'A-1',
    flatNo: '101',
    occupancyType: 'Owner'
  });

  const wings = BUILDINGS.map(b => b.name);
  const flats = Array.from({ length: 5 }, (_, floor) => 
    Array.from({ length: 4 }, (_, unit) => `${(floor + 1) * 100 + (unit + 1)}`)
  ).flat();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const backendData = {
        ...formData,
        flatId: `${formData.wing}-${formData.flatNo}`,
        role: formData.position === 'Resident' ? 'RESIDENT' : 'ADMIN'
      };
      
      await api.register(backendData);
      
      // Navigate to login with a "Success" state
      navigate('/login', { 
        state: { 
          registered: true, 
          email: formData.email,
          message: "Registration successful! Use your details to Sign In."
        } 
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const roleCategories = [
    { 
      id: 'RESIDENT', 
      label: 'Flat Resident', 
      icon: Home, 
      desc: 'Owner or tenant living in the society',
      positions: ['Resident']
    },
    { 
      id: 'COMMITTEE', 
      label: 'Society Committee', 
      icon: Shield, 
      desc: 'Elected members managing the society',
      positions: ['President', 'Secretary', 'Treasurer']
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFEFF] dark:bg-[#020617] p-6 transition-colors duration-300 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-brand-600/5 rounded-full blur-[120px] -ml-48 -mt-48" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] -mr-48 -mb-48" />

      <div className="max-w-xl w-full relative z-10 animate-fade-up">
        <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl p-10 md:p-14 border border-slate-100 dark:border-slate-800 relative overflow-hidden premium-shadow">
          
          {/* Progress Header */}
          <div className="flex items-center justify-between mb-12">
            <button 
              onClick={() => step > 1 ? setStep(step - 1) : navigate('/login')}
              className="p-3 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-2xl transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex gap-2">
              {[1, 2, 3].map(s => (
                <div key={s} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= s ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
              ))}
            </div>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Join Our Community</h1>
            <p className="text-slate-500 text-sm mt-3 font-medium">Create your official Saurashtra Residency profile</p>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-rose-50 border border-rose-100 text-rose-600 rounded-3xl text-sm font-bold flex items-center gap-3 animate-in shake">
              <AlertTriangle size={20} className="text-rose-400" /> {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            {/* STEP 1: ACCOUNT DETAILS */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={20} />
                    <input 
                      type="text" required placeholder="Full Name"
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] outline-none text-sm font-bold border-2 border-transparent focus:border-brand-600/20 transition-all dark:text-white"
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={20} />
                    <input 
                      type="email" required placeholder="Email Address"
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] outline-none text-sm font-bold border-2 border-transparent focus:border-brand-600/20 transition-all dark:text-white"
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={20} />
                    <input 
                      type="password" required placeholder="••••••••"
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] outline-none text-sm font-bold border-2 border-transparent focus:border-brand-600/20 transition-all dark:text-white"
                      value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>
                <button 
                  type="button" onClick={() => setStep(2)}
                  className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 group active:scale-[0.98] transition-all shadow-xl"
                >
                  Continue to Role Selection <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {/* STEP 2: ROLE SELECTION */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 gap-5">
                  {roleCategories.map((cat) => (
                    <div key={cat.id} className="space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <cat.icon size={16} className="text-brand-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{cat.label}</span>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {cat.positions.map(pos => (
                          <button
                            key={pos} type="button"
                            onClick={() => setFormData({...formData, position: pos, role: cat.id})}
                            className={`p-6 rounded-3xl border-2 text-left transition-all flex items-center justify-between ${formData.position === pos ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-900/10' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}
                          >
                            <div className="flex items-center gap-5">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${formData.position === pos ? 'bg-brand-600 text-white shadow-xl shadow-brand-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                {pos === 'Resident' ? <Home size={24} /> : <Shield size={24} />}
                              </div>
                              <div>
                                <p className={`font-black text-sm ${formData.position === pos ? 'text-brand-600' : 'text-slate-700 dark:text-slate-300'}`}>{pos}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{cat.desc}</p>
                              </div>
                            </div>
                            {formData.position === pos && <CheckCircle size={22} className="text-brand-600" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  type="button" onClick={() => setStep(3)}
                  className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 group active:scale-[0.98] transition-all"
                >
                  Configure Property Mapping <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {/* STEP 3: PROPERTY MAPPING */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="p-8 bg-brand-50 dark:bg-brand-900/10 rounded-[2.5rem] border border-brand-100 dark:border-brand-800 flex items-center gap-5">
                   <div className="w-14 h-14 bg-brand-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl shadow-brand-500/25">
                      {formData.position === 'Resident' ? <Home size={28} /> : <Shield size={28} />}
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-600 mb-1">Assigned Identity</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{formData.position}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Building Wing</label>
                    <div className="relative">
                      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <select 
                        className="w-full pl-14 pr-10 py-5 bg-slate-50 dark:bg-slate-800 rounded-[2rem] outline-none text-sm font-bold appearance-none dark:text-white border-2 border-transparent focus:border-brand-600/20 transition-all"
                        value={formData.wing} onChange={e => setFormData({...formData, wing: e.target.value})}
                      >
                        {wings.map(w => <option key={w} value={w}>Wing {w}</option>)}
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Flat Number</label>
                    <div className="relative">
                      <Home className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <select 
                        className="w-full pl-14 pr-10 py-5 bg-slate-50 dark:bg-slate-800 rounded-[2rem] outline-none text-sm font-bold appearance-none dark:text-white border-2 border-transparent focus:border-brand-600/20 transition-all"
                        value={formData.flatNo} onChange={e => setFormData({...formData, flatNo: e.target.value})}
                      >
                        {flats.map(f => <option key={f} value={f}>Flat {f}</option>)}
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Occupancy Status</label>
                  <div className="grid grid-cols-2 gap-4">
                    {['Owner', 'Tenant'].map(type => (
                      <button 
                        key={type} type="button"
                        onClick={() => setFormData({...formData, occupancyType: type})}
                        className={`py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest border-2 transition-all flex items-center justify-center gap-3 ${formData.occupancyType === type ? 'border-brand-600 bg-brand-50 text-brand-600 dark:bg-brand-900/20' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
                      >
                        {type === 'Owner' ? <Key size={16} /> : <Users size={16} />}
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  disabled={loading}
                  className="w-full py-5 bg-brand-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 group shadow-2xl shadow-brand-500/30 active:scale-[0.98] transition-all"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>Complete Registration & Sign In <CheckCircle size={18} /></>
                  )}
                </button>
              </div>
            )}
          </form>

          <div className="mt-12 text-center">
            <p className="text-xs text-slate-400 font-bold tracking-tight">
              Already have an account? {' '}
              <Link to="/login" className="text-brand-600 font-black hover:underline">Sign In Instead</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AlertTriangle = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
  </svg>
);

export default Register;
