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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden p-4">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[120px] -ml-24 -mt-24" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] -mr-24 -mb-24" />

      <div className="relative z-10 w-full max-w-lg animate-fade-in">
        <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800">
          
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => step > 1 ? setStep(step - 1) : navigate('/login')}
              className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-1">
              {[1, 2, 3].map(s => (
                <div 
                  key={s} 
                  className={`h-1.5 w-12 rounded-full transition-all duration-500 ${
                    step >= s ? 'bg-brand-500' : 'bg-slate-100 dark:bg-slate-800'
                  }`} 
                />
              ))}
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white mb-1">
              Saurashtra Membership
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Digital access registration for residents
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-400 font-bold text-sm">
              <AlertTriangle size={20} />
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            {step === 1 && (
              <div className="space-y-4 animate-fade-in-right">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">
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
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 font-bold focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">
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
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 font-bold focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">
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
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 font-bold focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-black text-lg py-3.5 rounded-2xl mt-4 transition-all shadow-lg shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  Continue to Role Selection <ArrowRight size={18} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in-right">
                {roleCategories.map((cat) => (
                  <div key={cat.id} className="mb-6">
                    <div className="flex items-center gap-2 mb-3 ml-1">
                      <cat.icon size={16} className="text-brand-600" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {cat.label}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {cat.positions.map(pos => (
                        <div 
                          key={pos} 
                          onClick={() => setFormData({...formData, position: pos, role: cat.id})}
                          className={`group p-4 rounded-3xl border-2 cursor-pointer transition-all duration-300 ${
                            formData.position === pos 
                              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' 
                              : 'border-slate-100 dark:border-slate-800 hover:border-brand-200 dark:hover:border-brand-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                                formData.position === pos 
                                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' 
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                              }`}>
                                {pos === 'Resident' ? <Home size={20} /> : <Shield size={20} />}
                              </div>
                              <div>
                                <h4 className={`font-black text-sm ${
                                  formData.position === pos ? 'text-brand-700 dark:text-brand-400' : 'text-slate-900 dark:text-white'
                                }`}>
                                  {pos}
                                </h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
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
                  className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-black text-lg py-3.5 rounded-2xl mt-4 transition-all shadow-lg shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  Configure Property Mapping <ArrowRight size={18} />
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fade-in-right">
                <div className="p-4 bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-3xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-600/20">
                    {formData.position === 'Resident' ? <Home size={24} /> : <Shield size={24} />}
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest block mb-0.5">
                      Identity Profile
                    </span>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">
                      {formData.position}
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">
                      Building Wing
                    </label>
                    <div className="relative">
                      <select
                        value={formData.wing}
                        onChange={e => setFormData({...formData, wing: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3.5 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-500 outline-none appearance-none transition-all"
                      >
                        {wings.map(w => <option key={w} value={w}>Wing {w}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-1 block">
                      Flat Number
                    </label>
                    <div className="relative">
                      <select
                        value={formData.flatNo}
                        onChange={e => setFormData({...formData, flatNo: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3.5 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-500 outline-none appearance-none transition-all"
                      >
                        {flats.map(f => <option key={f} value={f}>Flat {f}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">
                    Occupancy Status
                  </label>
                  <div className="flex gap-3">
                    {['Owner', 'Tenant'].map(type => (
                      <button 
                        key={type} 
                        type="button"
                        onClick={() => setFormData({...formData, occupancyType: type})}
                        className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-wider border-2 transition-all ${
                          formData.occupancyType === type
                            ? 'border-brand-500 bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                            : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-brand-200'
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
                  className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-black text-lg py-3.5 rounded-2xl mt-4 transition-all shadow-lg shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={24} className="animate-spin" /> : 'Submit Registration'}
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
