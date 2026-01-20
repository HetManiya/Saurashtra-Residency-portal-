
import React, { useState } from 'react';
import { User, Phone, ClipboardList, Clock, ShieldCheck, QrCode, Share2, Download, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../components/LanguageContext';

const VisitorPass: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [passData, setPassData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    purpose: '',
    validity: '4 hours'
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const result = await api.generateVisitorPass(formData);
      setPassData(result);
    } catch (err) {
      alert("Pass generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-up">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-10 text-center md:text-left">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{t('visitors')}</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Generate instant QR passes for your guests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 premium-shadow">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t('visitor_name')}</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" required placeholder="Guest Full Name"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold text-sm dark:text-white"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t('visitor_phone')}</label>
              <div className="relative">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="tel" required placeholder="+91 00000 00000"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold text-sm dark:text-white"
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t('visitor_purpose')}</label>
              <div className="relative">
                <ClipboardList className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select 
                  className="w-full pl-14 pr-10 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold text-sm appearance-none dark:text-white"
                  value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})}
                >
                  <option value="">Select Purpose</option>
                  <option>Personal Guest</option>
                  <option>Delivery / Courier</option>
                  <option>Maintenance Work</option>
                  <option>Home Service</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t('visitor_validity')}</label>
              <div className="grid grid-cols-2 gap-3">
                {['4 hours', '24 hours'].map(v => (
                  <button 
                    key={v} type="button"
                    onClick={() => setFormData({...formData, validity: v})}
                    className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${
                      formData.validity === v ? 'border-brand-600 bg-brand-50 text-brand-600 dark:bg-brand-900/10' : 'border-slate-100 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <button 
              disabled={loading}
              className="w-full py-5 bg-brand-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl shadow-brand-500/20 active:scale-95 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : <QrCode size={18} />}
              {loading ? 'Authorizing Access...' : t('visitor_generate')}
            </button>
          </form>
        </div>

        <div className="flex items-center justify-center">
          {passData ? (
            <div className="w-full bg-[#0F172A] p-8 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-600/20 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="relative z-10 space-y-8 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">
                  <ShieldCheck size={14} className="text-emerald-400" /> {t('visitor_auth')}
                </div>
                
                <div className="p-6 bg-white rounded-[2.5rem] w-fit mx-auto shadow-2xl">
                   <QrCode size={180} className="text-slate-900" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight">{passData.name}</h3>
                  <p className="text-[10px] font-black uppercase text-brand-400 tracking-widest">{passData.passId}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-8">
                  <div className="text-left">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('visitor_purpose')}</p>
                    <p className="text-xs font-bold text-slate-200">{passData.purpose}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Expires In</p>
                    <p className="text-xs font-bold text-slate-200">{passData.validity}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                    <Share2 size={14} /> {t('visitor_share')}
                  </button>
                  <button className="flex-1 py-4 bg-brand-600 hover:bg-brand-700 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                    <Download size={14} /> {t('visitor_download')}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6 max-w-xs">
               <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-200 dark:text-slate-700 mx-auto border-4 border-dashed border-slate-100 dark:border-slate-800">
                 <ShieldCheck size={48} />
               </div>
               <div>
                 <h4 className="font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest text-xs">Awaiting Authorization</h4>
                 <p className="text-sm text-slate-400 mt-2 font-medium">Fill guest details to generate an encrypted digital entry key.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitorPass;
