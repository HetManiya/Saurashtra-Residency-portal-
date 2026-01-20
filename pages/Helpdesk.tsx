
import React, { useState } from 'react';
import { LifeBuoy, Plus, Clock, CheckCircle2, AlertCircle, Send, X, MessageSquare } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';

interface Ticket {
  id: string;
  title: string;
  desc: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  date: string;
}

const Helpdesk: React.FC = () => {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: 'T-1002', title: 'Water Leakage in Bathroom', desc: 'Slight seepage on the side wall.', status: 'In Progress', date: '2024-05-22' },
    { id: 'T-1001', title: 'Lift Fan Not Working', desc: 'Fan in Wing A-3 lift is very slow.', status: 'Resolved', date: '2024-05-18' }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'In Progress': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tighter">{t('helpdesk')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Report issues and track resolution status</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-8 py-4 bg-brand-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl shadow-brand-500/20"
        >
          <Plus size={18} strokeWidth={3} /> {t('raise_complaint')}
        </button>
      </div>

      <div className="space-y-6 pb-20">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 premium-shadow group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex gap-6">
                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-brand-600 group-hover:text-white transition-all">
                   <MessageSquare size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{ticket.title}</h3>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">#{ticket.id}</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-4">{ticket.desc}</p>
                  <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <Clock size={14} /> {new Date(ticket.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${getStatusColor(ticket.status)}`}>
                 {t(`status_${ticket.status.toLowerCase().replace(' ', '_')}`)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl animate-in fade-in" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black tracking-tight">{t('raise_complaint')}</h3>
               <button onClick={() => setShowModal(false)} className="p-2 text-slate-400"><X size={24} /></button>
            </div>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{t('complaint_title')}</label>
                 <input type="text" placeholder="e.g. Broken streetlight" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{t('complaint_desc')}</label>
                 <textarea rows={4} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold resize-none" />
               </div>
               <button className="w-full py-5 bg-brand-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3">
                  <Send size={18} /> Send Ticket
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Helpdesk;
