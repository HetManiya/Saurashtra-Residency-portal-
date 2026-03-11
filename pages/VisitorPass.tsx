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
    <div className="max-w-5xl mx-auto pb-12 animate-fade-in crt-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-6 border-b-4 border-cyan-500/30">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-cyan-400 mb-2 glitch-text" data-text={t('visitors')}>
            {t('visitors')}
          </h1>
          <p className="text-cyan-700 font-bold font-mono uppercase text-xs">
            {`> GENERATE_ENCRYPTED_ENTRY_KEY_v1.0`}
          </p>
        </div>
        <button 
          onClick={() => setShowHistory(true)}
          className="px-6 py-3 bg-black border-2 border-cyan-500 text-cyan-400 font-black text-xs uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all flex items-center gap-2 shadow-[4px_4px_0px_#ff00ff]"
        >
          <History size={16} /> View History
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-black p-6 md:p-8 border-4 border-cyan-500 shadow-[8px_8px_0px_#ff00ff]">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-2 block ml-1">
                {t('visitor_name')}
              </label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700" />
                <input 
                  type="text"
                  placeholder="Guest Full Name"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black border-2 border-cyan-500 pl-12 pr-4 py-3 text-sm font-bold text-cyan-400 placeholder:text-cyan-900 outline-none focus:border-magenta-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-2 block ml-1">
                {t('visitor_phone')}
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700" />
                <input 
                  type="text"
                  placeholder="+91 00000 00000"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-black border-2 border-cyan-500 pl-12 pr-4 py-3 text-sm font-bold text-cyan-400 placeholder:text-cyan-900 outline-none focus:border-magenta-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-2 block ml-1">
                {t('visitor_purpose')}
              </label>
              <div className="relative">
                <ClipboardList size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700" />
                <select
                  value={formData.purpose}
                  onChange={e => setFormData({...formData, purpose: e.target.value})}
                  className="w-full bg-black border-2 border-cyan-500 pl-12 pr-4 py-3 text-sm font-bold text-cyan-400 outline-none focus:border-magenta-500 appearance-none transition-all"
                >
                  <option value="" className="bg-black">Select Purpose</option>
                  <option value="Personal Guest" className="bg-black">Personal Guest</option>
                  <option value="Delivery / Courier" className="bg-black">Delivery / Courier</option>
                  <option value="Maintenance Work" className="bg-black">Maintenance Work</option>
                  <option value="Home Service" className="bg-black">Home Service</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-2 block ml-1">
                {t('visitor_validity')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['4 hours', '24 hours'].map(v => (
                  <button 
                    key={v}
                    type="button"
                    onClick={() => setFormData({...formData, validity: v})}
                    className={`py-3 border-2 font-black text-[10px] uppercase tracking-widest transition-all ${
                      formData.validity === v 
                        ? 'bg-magenta-500 text-white border-black shadow-[4px_4px_0px_#00ffff]' 
                        : 'bg-black border-cyan-900/30 text-cyan-700 hover:border-cyan-500'
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
              className="w-full bg-magenta-500 text-white py-4 border-2 border-black font-black text-sm uppercase tracking-widest hover:bg-black hover:text-magenta-500 hover:border-magenta-500 transition-all shadow-[6px_6px_0px_#00ffff] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
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
                className="w-full max-w-md bg-black p-8 border-4 border-magenta-500 shadow-[12px_12px_0px_#00ffff] text-white relative overflow-hidden text-center"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-magenta-500 opacity-20 rounded-full blur-3xl -mr-10 -mt-10" />
                
                <div className="relative z-10 space-y-6" ref={qrRef}>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-900/20 border-2 border-cyan-500 mx-auto">
                    <ShieldCheck size={14} className="text-cyan-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                      {t('visitor_auth')}
                    </span>
                  </div>
                  
                  <div className="bg-white p-6 border-4 border-cyan-500 w-fit mx-auto shadow-[4px_4px_0px_#ff00ff]">
                     <QRCodeCanvas 
                      value={JSON.stringify({ id: passData.passId, name: passData.name, expires: passData.validity })}
                      size={180}
                      level="H"
                      includeMargin={true}
                     />
                  </div>

                  <div>
                    <h3 className="text-3xl font-black tracking-tight mb-1 uppercase text-cyan-400">
                      {passData.name}
                    </h3>
                    <span className="text-xs font-black text-magenta-500 uppercase tracking-widest">
                      {passData.passId}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t-2 border-cyan-900/50">
                    <div className="text-left">
                      <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest block mb-1">
                        {t('visitor_purpose')}
                      </span>
                      <span className="text-sm font-bold text-cyan-400 uppercase">
                        {passData.purpose}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest block mb-1">
                        Expires In
                      </span>
                      <span className="text-sm font-bold text-magenta-500 uppercase">
                        {passData.validity}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button 
                      onClick={shareToWhatsApp}
                      className="flex-1 py-3 border-2 border-cyan-500 bg-black text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest shadow-[3px_3px_0px_#ff00ff]"
                    >
                      <Share2 size={14} />
                      {t('visitor_share')}
                    </button>
                    <button 
                      onClick={downloadPass}
                      className="flex-1 py-3 border-2 border-magenta-500 bg-black text-magenta-500 hover:bg-magenta-500 hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest shadow-[3px_3px_0px_#00ffff]"
                    >
                      <Download size={14} />
                      {t('visitor_download')}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center max-w-xs">
                 <div className="w-24 h-24 bg-black border-4 border-dashed border-cyan-900/50 flex items-center justify-center text-cyan-900 mx-auto mb-6">
                   <ShieldCheck size={48} />
                 </div>
                 <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest block mb-2">
                   Awaiting Authorization
                 </span>
                 <p className="text-cyan-900 font-bold font-mono uppercase text-xs leading-relaxed">
                   {`> Fill guest details to generate an encrypted digital entry key.`}
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-black w-full max-w-4xl border-4 border-cyan-500 shadow-[12px_12px_0px_#ff00ff] overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 md:p-8 border-b-2 border-cyan-900/50 flex justify-between items-center shrink-0">
                <h2 className="text-2xl font-black text-cyan-400 flex items-center gap-3 uppercase tracking-tight">
                  <History className="text-magenta-500" /> Visitor History
                </h2>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="p-2 border-2 border-cyan-500 text-cyan-400 hover:bg-magenta-500 hover:text-white hover:border-magenta-500 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8 border-b-2 border-cyan-900/50 bg-cyan-900/10 shrink-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700" />
                    <input 
                      type="text"
                      placeholder="Search name, phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-black border-2 border-cyan-500 text-cyan-400 font-bold outline-none focus:border-magenta-500 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700" />
                    <input 
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-black border-2 border-cyan-500 text-cyan-400 font-bold outline-none focus:border-magenta-500 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700" />
                    <input 
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-black border-2 border-cyan-500 text-cyan-400 font-bold outline-none focus:border-magenta-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                {historyLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-magenta-500" size={32} />
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12">
                    <History size={48} className="mx-auto text-cyan-900 mb-4" />
                    <p className="text-cyan-700 font-bold uppercase tracking-widest text-xs">No visitor history found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((v: any) => (
                      <div 
                        key={v._id} 
                        onClick={() => setSelectedVisitor(selectedVisitor?._id === v._id ? null : v)}
                        className="p-6 bg-black border-2 border-cyan-900/30 hover:border-cyan-500 transition-colors cursor-pointer"
                      >
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 border-2 border-cyan-900/30 flex items-center justify-center text-cyan-700">
                              <User size={20} />
                            </div>
                            <div>
                              <h4 className="font-black text-cyan-400 text-lg uppercase tracking-tight">{v.name}</h4>
                              <p className="text-xs font-bold text-cyan-700">{v.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm font-bold">
                            <span className="px-3 py-1 border border-cyan-900/50 text-cyan-700 uppercase tracking-widest text-[10px]">{v.type}</span>
                            <span className={`px-3 py-1 border text-[10px] font-black uppercase tracking-widest ${
                              v.status === 'IN' ? 'bg-cyan-900/20 border-cyan-500 text-cyan-400' :
                              v.status === 'OUT' ? 'bg-black border-cyan-900/50 text-cyan-700' :
                              'bg-magenta-900/20 border-magenta-500 text-magenta-500'
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
                              <div className="mt-6 pt-6 border-t-2 border-cyan-900/30 grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700 mb-1">Pass ID</p>
                                  <p className="font-bold text-cyan-400 uppercase text-xs">{v.passId}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700 mb-1">Destination</p>
                                  <p className="font-bold text-cyan-400 uppercase text-xs">{v.flatId || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700 mb-1">Check In</p>
                                  <p className="font-bold text-cyan-400 uppercase text-xs">
                                    {v.checkInTime ? new Date(v.checkInTime).toLocaleString() : '--'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700 mb-1">Check Out</p>
                                  <p className="font-bold text-cyan-400 uppercase text-xs">
                                    {v.checkOutTime ? new Date(v.checkOutTime).toLocaleString() : '--'}
                                  </p>
                                </div>
                                <div className="col-span-2 md:col-span-4">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700 mb-1">Purpose</p>
                                  <p className="font-bold text-cyan-400 uppercase text-xs">{v.purpose || 'N/A'}</p>
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
