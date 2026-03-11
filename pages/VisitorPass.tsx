import React, { useState, useRef, useEffect } from 'react';
import { 
  User, Phone, ClipboardList, Clock, ShieldCheck, 
  QrCode, Share2, Download, CheckCircle2, Loader2, 
  ArrowRight, History, Search, X, Calendar
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../components/LanguageContext';
import { QRCodeCanvas } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';

const VisitorPass: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [passData, setPassData] = useState<any>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    purpose: '',
    validity: '4 hours'
  });

  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await api.getVisitorHistory(startDate, endDate, searchQuery);
      setHistory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (showHistory) {
      fetchHistory();
    }
  }, [showHistory, startDate, endDate, searchQuery]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await api.generateVisitorPass({
        ...formData,
        type: formData.purpose.includes('Delivery') ? 'DELIVERY' : 
              formData.purpose.includes('Service') ? 'SERVICE' : 'GUEST'
      });
      setPassData(result);
    } catch (err) {
      alert("Pass generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const shareToWhatsApp = () => {
    if (!passData) return;
    const text = `Saurashtra Residency - Visitor Pass\n\nName: ${passData.name}\nPass ID: ${passData.passId}\nPurpose: ${passData.purpose}\nValidity: ${passData.validity}\n\nPlease show this pass at the main gate.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const downloadPass = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `VisitorPass_${passData.name}.png`;
      link.href = url;
      link.click();
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-2">
            {t('visitors')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Generate instant QR passes for your guests
          </p>
        </div>
        <button 
          onClick={() => setShowHistory(true)}
          className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <History size={16} /> View History
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">
                {t('visitor_name')}
              </label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Guest Full Name"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">
                {t('visitor_phone')}
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="+91 00000 00000"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">
                {t('visitor_purpose')}
              </label>
              <div className="relative">
                <ClipboardList size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={formData.purpose}
                  onChange={e => setFormData({...formData, purpose: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none appearance-none"
                >
                  <option value="">Select Purpose</option>
                  <option value="Personal Guest">Personal Guest</option>
                  <option value="Delivery / Courier">Delivery / Courier</option>
                  <option value="Maintenance Work">Maintenance Work</option>
                  <option value="Home Service">Home Service</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">
                {t('visitor_validity')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['4 hours', '24 hours'].map(v => (
                  <button 
                    key={v}
                    type="button"
                    onClick={() => setFormData({...formData, validity: v})}
                    className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                      formData.validity === v 
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' 
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-brand-500 dark:hover:border-brand-500'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-700 transition-colors shadow-xl shadow-brand-600/20 active:scale-95 transform duration-100 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <QrCode size={18} />}
              {loading ? 'Authorizing Access...' : t('visitor_generate')}
            </button>
          </form>
        </div>

        <div className="flex items-center justify-center">
          <AnimatePresence mode="wait">
            {passData ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-md bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden text-center"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500 opacity-20 rounded-full blur-3xl -mr-10 -mt-10" />
                
                <div className="relative z-10 space-y-6" ref={qrRef}>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mx-auto">
                    <ShieldCheck size={14} className="text-green-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {t('visitor_auth')}
                    </span>
                  </div>
                  
                  <div className="bg-white p-6 rounded-[2rem] w-fit mx-auto shadow-xl">
                     <QRCodeCanvas 
                      value={JSON.stringify({ id: passData.passId, name: passData.name, expires: passData.validity })}
                      size={180}
                      level="H"
                      includeMargin={true}
                     />
                  </div>

                  <div>
                    <h3 className="text-3xl font-black tracking-tight mb-1">
                      {passData.name}
                    </h3>
                    <span className="text-xs font-black text-brand-400 uppercase tracking-widest">
                      {passData.passId}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                    <div className="text-left">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                        {t('visitor_purpose')}
                      </span>
                      <span className="text-sm font-bold">
                        {passData.purpose}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                        Expires In
                      </span>
                      <span className="text-sm font-bold">
                        {passData.validity}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={shareToWhatsApp}
                      className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"
                    >
                      <Share2 size={14} />
                      {t('visitor_share')}
                    </button>
                    <button 
                      onClick={downloadPass}
                      className="flex-1 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"
                    >
                      <Download size={14} />
                      {t('visitor_download')}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center max-w-xs">
                 <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border-4 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-300 dark:text-slate-600 mx-auto mb-6">
                   <ShieldCheck size={48} />
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                   Awaiting Authorization
                 </span>
                 <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                   Fill guest details to generate an encrypted digital entry key.
                 </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  <History className="text-brand-600" /> Visitor History
                </h2>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Search name, phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                {historyLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-brand-600" size={32} />
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12">
                    <History size={48} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 font-bold">No visitor history found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((v: any) => (
                      <div 
                        key={v._id} 
                        onClick={() => setSelectedVisitor(selectedVisitor?._id === v._id ? null : v)}
                        className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-brand-500 transition-colors cursor-pointer"
                      >
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500">
                              <User size={20} />
                            </div>
                            <div>
                              <h4 className="font-black text-slate-900 dark:text-white text-lg">{v.name}</h4>
                              <p className="text-xs font-bold text-slate-500">{v.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm font-bold text-slate-600 dark:text-slate-400">
                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">{v.type}</span>
                            <span className={`px-3 py-1 rounded-lg ${
                              v.status === 'IN' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                              v.status === 'OUT' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' :
                              'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}>
                              {v.status}
                            </span>
                          </div>
                        </div>

                        <AnimatePresence>
                          {selectedVisitor?._id === v._id && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Pass ID</p>
                                  <p className="font-bold text-slate-900 dark:text-white">{v.passId}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Destination</p>
                                  <p className="font-bold text-slate-900 dark:text-white">{v.flatId || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Check In</p>
                                  <p className="font-bold text-slate-900 dark:text-white">
                                    {v.checkInTime ? new Date(v.checkInTime).toLocaleString() : '--'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Check Out</p>
                                  <p className="font-bold text-slate-900 dark:text-white">
                                    {v.checkOutTime ? new Date(v.checkOutTime).toLocaleString() : '--'}
                                  </p>
                                </div>
                                <div className="col-span-2 md:col-span-4">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Purpose</p>
                                  <p className="font-bold text-slate-900 dark:text-white">{v.purpose || 'N/A'}</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VisitorPass;
