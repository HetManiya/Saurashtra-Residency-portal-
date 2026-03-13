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
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden p-4 crt-screen">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-magenta-500/5 rounded-full blur-[120px] -ml-24 -mt-24" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] -mr-24 -mb-24" />

      <div className="relative z-10 w-full max-w-lg animate-fade-in">
        <div className="bg-black p-8 md:p-10 border-4 border-cyan-500 shadow-[12px_12px_0px_#ff00ff]">
          
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => step > 1 ? setStep(step - 1) : navigate('/login')}
              className="w-10 h-10 bg-black border-2 border-cyan-500 flex items-center justify-center text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2">
              {[1, 2, 3].map(s => (
                <div 
                  key={s} 
                  className={`h-2 w-12 transition-all duration-500 border border-cyan-900 ${
                    step >= s ? 'bg-magenta-500 shadow-[0_0_8px_#ff00ff]' : 'bg-black'
                  }`} 
                />
              ))}
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tighter text-cyan-400 mb-1 glitch-text" data-text="Saurashtra Membership">
              Saurashtra <span className="text-magenta-500">Membership</span>
            </h1>
            <p className="text-[10px] font-black text-cyan-700 uppercase tracking-widest font-mono">
              {`> INITIALIZING_RESIDENT_UPLINK_v1.0`}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-magenta-900/20 border-2 border-magenta-500 flex items-center gap-3 text-magenta-500 font-bold text-sm">
              <AlertTriangle size={20} />
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            {step === 1 && (
              <div className="space-y-6 animate-fade-in-right">
                <div>
                  <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest ml-2 mb-1 block">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700">
                      <User size={18} />
                    </div>
                    <input 
                      type="text"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-black border-2 border-cyan-500 pl-12 pr-4 py-3.5 text-cyan-400 placeholder:text-cyan-900 font-bold outline-none focus:border-magenta-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest ml-2 mb-1 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700">
                      <Mail size={18} />
                    </div>
                    <input 
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
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
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-black border-2 border-cyan-500 pl-12 pr-4 py-3.5 text-cyan-400 placeholder:text-cyan-900 font-bold outline-none focus:border-magenta-500 transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-magenta-500 hover:bg-black hover:text-magenta-500 hover:border-magenta-500 border-2 border-black text-white font-black text-lg py-3.5 mt-4 transition-all shadow-[6px_6px_0px_#00ffff] active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  Role Selection <ArrowRight size={18} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in-right">
                {roleCategories.map((cat) => (
                  <div key={cat.id} className="mb-6">
                    <div className="flex items-center gap-2 mb-3 ml-1">
                      <cat.icon size={16} className="text-magenta-500" />
                      <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest">
                        {cat.label}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {cat.positions.map(pos => (
                        <div 
                          key={pos} 
                          onClick={() => setFormData({...formData, position: pos, role: cat.id})}
                          className={`group p-4 border-2 cursor-pointer transition-all duration-300 ${
                            formData.position === pos 
                              ? 'border-magenta-500 bg-magenta-900/10 shadow-[4px_4px_0px_#00ffff]' 
                              : 'border-cyan-900/30 hover:border-cyan-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 border-2 flex items-center justify-center transition-all ${
                                formData.position === pos 
                                  ? 'bg-magenta-500 text-white border-black shadow-[2px_2px_0px_#00ffff]' 
                                  : 'bg-black text-cyan-700 border-cyan-900/30'
                              }`}>
                                {pos === 'Resident' ? <Home size={20} /> : <Shield size={20} />}
                              </div>
                              <div>
                                <h4 className={`font-black text-sm uppercase tracking-tight ${
                                  formData.position === pos ? 'text-cyan-400' : 'text-cyan-700'
                                }`}>
                                  {pos}
                                </h4>
                                <p className="text-[9px] font-black text-cyan-900 uppercase tracking-wider mt-0.5">
                                  {cat.desc}
                                </p>
                              </div>
                            </div>
                            {formData.position === pos && (
                              <CheckCircle size={20} className="text-magenta-500" />
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
                  className="w-full bg-magenta-500 hover:bg-black hover:text-magenta-500 hover:border-magenta-500 border-2 border-black text-white font-black text-lg py-3.5 mt-4 transition-all shadow-[6px_6px_0px_#00ffff] active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  Property Mapping <ArrowRight size={18} />
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fade-in-right">
                <div className="p-4 bg-cyan-900/10 border-2 border-cyan-500 flex items-center gap-4">
                  <div className="w-12 h-12 bg-magenta-500 border-2 border-black flex items-center justify-center text-white shadow-[4px_4px_0px_#00ffff]">
                    {formData.position === 'Resident' ? <Home size={24} /> : <Shield size={24} />}
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-magenta-500 uppercase tracking-widest block mb-0.5">
                      Identity Profile
                    </span>
                    <h4 className="text-lg font-black text-cyan-400 uppercase tracking-tight">
                      {formData.position}
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest ml-2 mb-1 block">
                      Building Wing
                    </label>
                    <div className="relative">
                      <select
                        value={formData.wing}
                        onChange={e => setFormData({...formData, wing: e.target.value})}
                        className="w-full bg-black border-2 border-cyan-500 px-4 py-3.5 text-cyan-400 font-bold outline-none focus:border-magenta-500 appearance-none transition-all"
                      >
                        {wings.map(w => <option key={w} value={w}>Wing {w}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-700 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest ml-2 mb-1 block">
                      Flat Number
                    </label>
                    <div className="relative">
                      <select
                        value={formData.flatNo}
                        onChange={e => setFormData({...formData, flatNo: e.target.value})}
                        className="w-full bg-black border-2 border-cyan-500 px-4 py-3.5 text-cyan-400 font-bold outline-none focus:border-magenta-500 appearance-none transition-all"
                      >
                        {flats.map(f => <option key={f} value={f}>Flat {f}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-700 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest ml-2 mb-2 block">
                    Occupancy Status
                  </label>
                  <div className="flex gap-3">
                    {['Owner', 'Tenant'].map(type => (
                      <button 
                        key={type} 
                        type="button"
                        onClick={() => setFormData({...formData, occupancyType: type})}
                        className={`flex-1 py-3 border-2 text-xs font-black uppercase tracking-wider transition-all ${
                          formData.occupancyType === type
                            ? 'border-black bg-magenta-500 text-white shadow-[4px_4px_0px_#00ffff]'
                            : 'border-cyan-900/30 text-cyan-700 hover:border-cyan-500'
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
                  className="w-full bg-magenta-500 hover:bg-black hover:text-magenta-500 hover:border-magenta-500 border-2 border-black text-white font-black text-lg py-3.5 mt-4 transition-all shadow-[6px_6px_0px_#00ffff] active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  {loading ? <Loader2 size={24} className="animate-spin" /> : 'Finalize Uplink'}
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
