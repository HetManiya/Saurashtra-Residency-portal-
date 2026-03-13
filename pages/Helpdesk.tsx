import React, { useState } from 'react';
import { 
  LifeBuoy, Plus, Clock, CheckCircle2, AlertCircle, 
  Send, X, MessageSquare, Wrench, Shield, Zap, 
  Droplets, Construction, ChevronRight 
} from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

interface Ticket {
  id: string;
  title: string;
  desc: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High';
  category: 'Plumbing' | 'Electrical' | 'Security' | 'General';
  date: string;
}

const Helpdesk: React.FC = () => {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: 'T-1002', title: 'Water Leakage in Bathroom', desc: 'Slight seepage on the side wall.', status: 'In Progress', priority: 'High', category: 'Plumbing', date: '2024-05-22' },
    { id: 'T-1001', title: 'Lift Fan Not Working', desc: 'Fan in Wing A-3 lift is very slow.', status: 'Resolved', priority: 'Medium', category: 'Electrical', date: '2024-05-18' }
  ]);

  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    category: 'General' as any
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'In Progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 dark:text-red-400';
      case 'Medium': return 'text-amber-600 dark:text-amber-400';
      default: return 'text-slate-500 dark:text-slate-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Plumbing': return Droplets;
      case 'Electrical': return Zap;
      case 'Security': return Shield;
      default: return MessageSquare;
    }
  };

  const handleRaiseTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket: Ticket = {
      id: `T-${1000 + tickets.length + 1}`,
      title: formData.title,
      desc: formData.desc,
      status: 'Pending',
      priority: formData.priority,
      category: formData.category,
      date: new Date().toISOString()
    };
    setTickets([newTicket, ...tickets]);
    setShowModal(false);
    setFormData({ title: '', desc: '', priority: 'Medium', category: 'General' });
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-2">
            {t('helpdesk')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Report issues and track resolution status
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          aria-label="Raise a new support ticket"
          className="flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/20 active:scale-95 transform duration-100"
        >
          <Plus size={18} strokeWidth={3} />
          {t('raise_complaint')}
        </button>
      </div>

      <div className="space-y-6 pb-12">
        {tickets.map((ticket) => {
          const Icon = getCategoryIcon(ticket.category);
          return (
            <div 
              key={ticket.id} 
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors">
                        <Icon size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                            {ticket.title}
                          </h3>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            #{ticket.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority} Priority
                          </span>
                          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            {ticket.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
                      {ticket.desc}
                    </p>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Clock size={14} /> {new Date(ticket.date).toLocaleDateString()}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-4 lg:pl-8 lg:border-l border-slate-100 dark:border-slate-800 pt-6 lg:pt-0 border-t lg:border-t-0">
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 block">
                      Resolution Progress
                    </span>
                    <div className="space-y-6 relative">
                      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800" />
                      {[
                        { label: 'Reported', active: true },
                        { label: 'Assigned', active: ticket.status !== 'Pending' },
                        { label: 'Resolved', active: ticket.status === 'Resolved' }
                      ].map((step, index) => (
                        <div key={index} className="relative flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 z-10 transition-colors ${
                            step.active 
                              ? 'bg-brand-600 border-brand-600 text-white' 
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600'
                          }`}>
                            {step.active ? <CheckCircle2 size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                            step.active ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">New Ticket</h2>
                <button 
                  onClick={() => setShowModal(false)} 
                  aria-label="Close ticket form"
                  className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div>
                  <label htmlFor="ticket-category" className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">
                    Issue Category
                  </label>
                  <div id="ticket-category" className="grid grid-cols-2 gap-3" role="group" aria-label="Select issue category">
                    {['Plumbing', 'Electrical', 'Security', 'General'].map(cat => (
                      <button 
                        key={cat}
                        type="button"
                        onClick={() => setFormData({...formData, category: cat as any})}
                        aria-label={`Select category: ${cat}`}
                        aria-pressed={formData.category === cat}
                        className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                          formData.category === cat 
                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' 
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-brand-500 dark:hover:border-brand-500'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="ticket-priority" className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">
                    Priority Level
                  </label>
                  <div id="ticket-priority" className="flex gap-3" role="group" aria-label="Select priority level">
                    {['Low', 'Medium', 'High'].map(p => (
                      <button 
                        key={p} 
                        type="button"
                        onClick={() => setFormData({...formData, priority: p as any})}
                        aria-label={`Select priority: ${p}`}
                        aria-pressed={formData.priority === p}
                        className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                          formData.priority === p 
                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' 
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-brand-500 dark:hover:border-brand-500'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="ticket-subject" className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">
                    Subject
                  </label>
                  <input 
                    id="ticket-subject"
                    type="text"
                    placeholder="Briefly describe the issue..."
                    aria-label="Issue subject"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="ticket-description" className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">
                    Detailed Description
                  </label>
                  <textarea 
                    id="ticket-description"
                    rows={4}
                    placeholder="Provide more details for the technician..."
                    aria-label="Detailed issue description"
                    value={formData.desc}
                    onChange={e => setFormData({...formData, desc: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                  />
                </div>

                <button 
                  onClick={handleRaiseTicket}
                  aria-label="Submit support ticket"
                  className="w-full bg-brand-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-700 transition-colors shadow-xl shadow-brand-600/20 active:scale-95 transform duration-100 flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Raise Support Ticket
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Helpdesk;
