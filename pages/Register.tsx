import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  UserPlus, Mail, Lock, User, Shield, Home, ArrowRight, 
  Loader2, CheckCircle, ChevronLeft, MapPin, Users,
  Star, Briefcase, Key, ChevronDown, Clock, AlertTriangle
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
        role: formData.role // Using role directly from selection
      };
      
      await api.register(backendData);
      
      navigate('/login', { 
        state: { 
          registered: true, 
          email: formData.email,
          message: "Registration requested! Your Wing President will verify and approve your account shortly. You will be able to log in once approved."
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
        label: 'Resident', 
        icon: Home, 
        desc: 'Flat owner or tenant',
        positions: ['Resident']
      },
      { 
        id: 'COMMITTEE', 
        label: 'Committee Member', 
        icon: Shield, 
        desc: 'Society management team',
        positions: ['President', 'Secretary', 'Treasurer']
      },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden p-4">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[120px] -ml-24 -mt-24" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-brand-600/5 rounded-full blur-[120px] -mr-24 -mb-24" />

      <div className="relative z-10 w-full max-w-lg animate-fade-in">
        <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200 dark:shadow-none">
          
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => step > 1 ? setStep(step - 1) : navigate('/login')}
              className="w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2">
              {[1, 2, 3].map(s => (
                <div 
                  key={s} 
                  className={`h-1.5 w-12 transition-all duration-500 rounded-full ${
                    step >= s ? 'bg-brand-600 shadow-sm' : 'bg-slate-100 dark:bg-slate-800'
                  }`} 
                />
              ))}
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
              Create <span className="text-brand-600">Account</span>
            </h1>
            <p className="text-[10px] font-semibold text-slate-400 tracking-wider">
              Join your society portal
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-sm">
              <AlertTriangle size={20} />
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            {step === 1 && (
              <div className="space-y-6 animate-fade-in-right">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 tracking-wider ml-2 mb-1 block">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <User size={18} />
                    </div>
                    <input 
                      type="text"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 font-bold outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>

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
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
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
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 font-bold outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-lg py-4 rounded-2xl mt-4 transition-all shadow-lg shadow-brand-600/20 active:scale-95 flex items-center justify-center gap-2 tracking-wider"
                >
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in-right">
                {roleCategories.map((cat) => (
                  <div key={cat.id} className="mb-6">
                    <div className="flex items-center gap-2 mb-3 ml-1">
                      <cat.icon size={16} className="text-brand-600" />
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                        {cat.label}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {cat.positions.map(pos => (
                        <div 
                          key={pos} 
                          onClick={() => setFormData({...formData, position: pos, role: cat.id})}
                          className={`group p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                            formData.position === pos 
                              ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/10 shadow-sm' 
                              : 'border-slate-200 dark:border-slate-800 hover:border-brand-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${
                                formData.position === pos 
                                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm' 
                                  : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                              }`}>
                                {pos === 'Resident' ? <Home size={20} /> : <Shield size={20} />}
                              </div>
                              <div>
                                <h4 className={`font-bold text-sm tracking-tight ${
                                  formData.position === pos ? 'text-brand-600' : 'text-slate-600 dark:text-slate-400'
                                }`}>
                                  {pos}
                                </h4>
                                <p className="text-[9px] font-semibold text-slate-400 tracking-wider mt-0.5">
                                  {cat.desc}
                                </p>
                              </div>
                            </div>
                            {formData.position === pos && (
                              <CheckCircle size={20} className="text-brand-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <button 
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-lg py-4 rounded-2xl mt-4 transition-all shadow-lg shadow-brand-600/20 active:scale-95 flex items-center justify-center gap-2 tracking-wider"
                >
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fade-in-right">
                <div className="p-4 bg-brand-50 dark:bg-brand-900/10 rounded-2xl border border-brand-200 dark:border-brand-800 flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                    {formData.position === 'Resident' ? <Home size={24} /> : <Shield size={24} />}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-brand-600 tracking-wider block mb-0.5">
                      Selected Role
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                      {formData.position}
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 tracking-wider ml-2 mb-1 block">
                      Building Wing
                    </label>
                    <div className="relative">
                      <select
                        value={formData.wing}
                        onChange={e => setFormData({...formData, wing: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-slate-900 dark:text-white font-bold outline-none focus:border-brand-500 appearance-none transition-all"
                      >
                        {wings.map(w => <option key={w} value={w}>Wing {w}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 tracking-wider ml-2 mb-1 block">
                      Flat Number
                    </label>
                    <div className="relative">
                      <select
                        value={formData.flatNo}
                        onChange={e => setFormData({...formData, flatNo: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-slate-900 dark:text-white font-bold outline-none focus:border-brand-500 appearance-none transition-all"
                      >
                        {flats.map(f => <option key={f} value={f}>Flat {f}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 tracking-wider ml-2 mb-2 block">
                    Occupancy Status
                  </label>
                  <div className="flex gap-3">
                    {['Owner', 'Tenant'].map(type => (
                      <button 
                        key={type} 
                        type="button"
                        onClick={() => setFormData({...formData, occupancyType: type})}
                        className={`flex-1 py-3 rounded-2xl border text-xs font-bold tracking-wider transition-all ${
                          formData.occupancyType === type
                            ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-brand-400'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-lg py-4 rounded-2xl mt-4 transition-all shadow-lg shadow-brand-600/20 active:scale-95 flex items-center justify-center gap-2 tracking-wider"
                >
                  {loading ? <Loader2 size={24} className="animate-spin" /> : 'Register'}
                  {!loading && <CheckCircle size={20} />}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
