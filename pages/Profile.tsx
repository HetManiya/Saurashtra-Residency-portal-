import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Shield, Home, Key, Lock, CheckCircle2, 
  AlertCircle, Loader2, Save, CreditCard, History, 
  Calendar, ArrowRight, ShieldCheck, BadgeCheck, Smartphone,
  Camera, Upload, X, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../components/LanguageContext';
import { MaintenanceRecord, PaymentStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const Profile: React.FC = () => {
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [showCamera, setShowCamera] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  const startCamera = async () => {
    setShowCamera(true);
    setCameraLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 400 }, height: { ideal: 400 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setStatusMsg({ type: 'error', text: 'Could not access camera' });
      setShowCamera(false);
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      setIsUpdating(true);
      try {
        const response = await api.updateProfile(user.id || user._id, imageData);
        setUser(response.user);
        setStatusMsg({ type: 'success', text: 'Profile picture updated!' });
        stopCamera();
      } catch (err) {
        console.error("Error uploading photo:", err);
        setStatusMsg({ type: 'error', text: 'Failed to save photo' });
      } finally {
        setIsUpdating(false);
        setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
      }
    }
  };

  if (!user) return null;

  const unpaidCount = maintenance.filter(m => m.status !== PaymentStatus.PAID).length;
  const totalPaid = maintenance.filter(m => m.status === PaymentStatus.PAID).reduce((sum, m) => sum + m.amount, 0);

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-2">
            My <span className="text-brand-600">Identity</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Manage your residency credentials and payment history
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full">
          <BadgeCheck size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Verified Member</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Personal Info & Security */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden shadow-sm">
            <div className="relative inline-block mb-6 group">
              <img 
                src={user.profilePictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.profilePictureUrl || user.email}`} 
                alt={user.name}
                className="w-32 h-32 rounded-[2rem] border-4 border-slate-100 dark:border-slate-800 shadow-xl bg-slate-50 dark:bg-slate-800 object-cover"
              />
              <button 
                onClick={startCamera}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] text-white"
              >
                <Camera size={24} />
              </button>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-600 rounded-xl border-4 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-lg">
                <ShieldCheck size={18} />
              </div>
            </div>

            {showCamera && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Capture Identity</h3>
                    <button onClick={stopCamera} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                      <X size={20} className="text-slate-500" />
                    </button>
                  </div>

                  <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-slate-800 mb-6 border-4 border-slate-50 dark:border-slate-800 shadow-inner">
                    {cameraLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="animate-spin text-brand-600" size={32} />
                      </div>
                    )}
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={stopCamera}
                      className="py-3 rounded-xl font-black text-xs uppercase tracking-widest border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={capturePhoto}
                      disabled={isUpdating}
                      className="py-3 bg-brand-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20"
                    >
                      {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                      {isUpdating ? 'Saving...' : 'Capture'}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
            
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">
              {user.name}
            </h2>
            <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest block mb-6">
              {user.role}
            </span>
            
            <div className="h-px bg-slate-100 dark:bg-slate-800 w-full mb-6" />
            
            <div className="space-y-3 text-left">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                  <Mail size={18} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Email Address</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white truncate block">{user.email}</span>
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                  <Home size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Property Unit</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{user.flatId}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 dark:bg-slate-950 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-500 opacity-20 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-600/20">
                  <Lock size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black leading-tight">Security Center</h3>
                  <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Update Credentials</span>
                </div>
              </div>

              <AnimatePresence>
                {statusMsg.text && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-3 mb-4 rounded-xl flex items-center gap-2 text-xs font-bold border ${
                      statusMsg.type === 'success' 
                        ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}
                  >
                    {statusMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    {statusMsg.text}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Current Password</label>
                  <div className="relative">
                    <input 
                      type="password"
                      placeholder="••••••••"
                      required
                      value={passForm.current}
                      onChange={(e) => setPassForm({...passForm, current: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none text-white placeholder-slate-500 transition-colors hover:border-white/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">New Password</label>
                  <div className="relative">
                    <input 
                      type="password"
                      placeholder="New Password"
                      required
                      value={passForm.new}
                      onChange={(e) => setPassForm({...passForm, new: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none text-white placeholder-slate-500 transition-colors hover:border-white/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Confirm New Password</label>
                  <div className="relative">
                    <input 
                      type="password"
                      placeholder="Confirm New Password"
                      required
                      value={passForm.confirm}
                      onChange={(e) => setPassForm({...passForm, confirm: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none text-white placeholder-slate-500 transition-colors hover:border-white/20"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isUpdating}
                  className="w-full bg-white text-slate-900 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-50 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {isUpdating ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Main: Payment History & Stats */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-48 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                  <CreditCard size={24} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lifetime Contributed</span>
              </div>
              <div>
                <h3 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-1">
                  ₹{totalPaid.toLocaleString()}
                </h3>
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">
                  Status: Regular Payer
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-48 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                  <AlertCircle size={24} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Records</span>
              </div>
              <div>
                <h3 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-1">
                  {unpaidCount}
                </h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Current Maintenance Cycle
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                <History size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Maintenance Ledger</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Historical Payment Tracking</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Period</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <Loader2 size={24} className="animate-spin text-brand-600 mx-auto mb-2" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching Ledger...</span>
                      </td>
                    </tr>
                  ) : maintenance.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-600 mx-auto mb-4">
                          <CreditCard size={32} />
                        </div>
                        <span className="text-xs font-bold text-slate-400">No payment records found for this unit.</span>
                      </td>
                    </tr>
                  ) : (
                    maintenance.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                              <Calendar size={14} />
                            </div>
                            <div>
                              <div className="text-sm font-black text-slate-900 dark:text-white">{record.month} {record.year}</div>
                              {record.paidDate && (
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Paid on {new Date(record.paidDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-black text-slate-900 dark:text-white">₹{record.amount}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            record.status === PaymentStatus.PAID 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                              : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {record.status === PaymentStatus.PAID ? (
                            <button className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                              <ArrowRight size={16} />
                            </button>
                          ) : (
                            <button className="px-4 py-2 bg-brand-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/20 active:scale-95 transform duration-100">
                              Pay Now
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
