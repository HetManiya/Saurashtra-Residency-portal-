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
      case 'Resolved': return 'bg-cyan-400 text-black border-2 border-cyan-600';
      case 'In Progress': return 'bg-magenta-500 text-white border-2 border-magenta-700';
      default: return 'bg-black text-cyan-400 border-2 border-cyan-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-magenta-500 animate-pulse';
      case 'Medium': return 'text-cyan-400';
      default: return 'text-cyan-900';
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

  const [activeTab, setActiveTab] = useState<'tickets' | 'faq'>('tickets');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I book an amenity like the Clubhouse?",
      answer: "You can book amenities through the 'Facilities' page. Select the amenity, choose an available date and time slot, and submit your request. It will be reviewed by the committee."
    },
    {
      question: "What are the rules for visitor parking?",
      answer: "Visitors must park in the designated 'Visitor Parking' zones. Overnight parking requires prior approval from the security office."
    },
    {
      question: "How can I pay my maintenance bill?",
      answer: "Maintenance bills can be paid online via the 'Maintenance' page using credit/debit cards or UPI. You can also set up auto-pay for convenience."
    },
    {
      question: "Who do I contact for emergency plumbing issues?",
      answer: "For emergencies, please call the 24/7 helpdesk number: +91 98765 43210. You can also raise a 'High' priority ticket here."
    },
    {
      question: "Can I rent out my apartment?",
      answer: "Yes, but you must inform the society committee and submit the tenant's details for police verification before they move in."
    }
  ];

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
    <div className="max-w-5xl mx-auto pb-12 animate-fade-in crt-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-6 border-b-4 border-cyan-500/30">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-cyan-400 mb-2 glitch-text" data-text={t('helpdesk')}>
            {t('helpdesk')}
          </h1>
          <p className="text-cyan-700 font-bold font-mono uppercase text-xs">
            {`> REPORT_ISSUES_AND_TRACK_RESOLUTION_STATUS_v4.0`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-black border-2 border-cyan-900/30 p-1 inline-flex">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'tickets' 
                  ? 'bg-cyan-400 text-black shadow-[2px_2px_0px_#ff00ff]' 
                  : 'text-cyan-700 hover:text-cyan-400'
              }`}
            >
              My Tickets
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'faq' 
                  ? 'bg-cyan-400 text-black shadow-[2px_2px_0px_#ff00ff]' 
                  : 'text-cyan-700 hover:text-cyan-400'
              }`}
            >
              FAQs
            </button>
          </div>
          {activeTab === 'tickets' && (
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-magenta-500 text-white px-6 py-3 border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-black hover:text-magenta-500 hover:border-magenta-500 transition-all shadow-[4px_4px_0px_#00ffff] active:scale-95 transform duration-100"
            >
              <Plus size={18} strokeWidth={3} />
              {t('raise_complaint')}
            </button>
          )}
        </div>
      </div>

      {activeTab === 'tickets' && (
        <div className="space-y-6 pb-12">
          {tickets.map((ticket) => {
          const Icon = getCategoryIcon(ticket.category);
          return (
            <div 
              key={ticket.id} 
              className="bg-black border-4 border-cyan-500/30 overflow-hidden hover:border-magenta-500 hover:shadow-[8px_8px_0px_#00ffff] transition-all duration-300"
            >
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <div className="w-12 h-12 border-2 border-cyan-500 bg-black flex items-center justify-center text-cyan-400 transition-colors">
                        <Icon size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-black text-cyan-400 tracking-tight uppercase glitch-text" data-text={ticket.title}>
                            {ticket.title}
                          </h3>
                          <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest font-mono">
                            #{ticket.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority} Priority
                          </span>
                          <div className="w-1 h-1 bg-cyan-900" />
                          <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest font-mono">
                            {ticket.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-cyan-600 font-bold font-mono text-sm uppercase leading-relaxed mb-6">
                      {`// ${ticket.desc}`}
                    </p>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-[10px] font-black text-cyan-700 uppercase tracking-widest font-mono">
                        <Clock size={14} className="text-magenta-500" /> {new Date(ticket.date).toLocaleDateString()}
                      </div>
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-4 lg:pl-8 lg:border-l-2 border-cyan-900/30 pt-6 lg:pt-0 border-t-2 lg:border-t-0">
                    <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-4 block font-mono">
                      {`> RESOLUTION_PROGRESS`}
                    </span>
                    <div className="space-y-6 relative">
                      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-cyan-900/30" />
                      {[
                        { label: 'Reported', active: true },
                        { label: 'Assigned', active: ticket.status !== 'Pending' },
                        { label: 'Resolved', active: ticket.status === 'Resolved' }
                      ].map((step, index) => (
                        <div key={index} className="relative flex items-center gap-3">
                          <div className={`w-6 h-6 flex items-center justify-center border-2 z-10 transition-colors ${
                            step.active 
                              ? 'bg-magenta-500 border-magenta-500 text-white shadow-[2px_2px_0px_#00ffff]' 
                              : 'bg-black border-cyan-900/30 text-cyan-900'
                          }`}>
                            {step.active ? <CheckCircle2 size={12} /> : <div className="w-1.5 h-1.5 bg-current" />}
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                            step.active ? 'text-cyan-400' : 'text-cyan-900'
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
      )}

      {activeTab === 'faq' && (
        <div className="space-y-4 pb-12">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-black border-4 border-cyan-500/30 overflow-hidden transition-all duration-300 hover:border-cyan-500"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full p-6 flex justify-between items-center text-left hover:bg-cyan-900/10 transition-colors"
              >
                <h3 className="text-lg font-black text-cyan-400 pr-8 uppercase tracking-tight">
                  {faq.question}
                </h3>
                <div className={`w-8 h-8 bg-black border-2 border-cyan-500 flex items-center justify-center text-cyan-400 shrink-0 transition-all duration-300 ${expandedFaq === index ? 'rotate-90 bg-cyan-400 text-black shadow-[2px_2px_0px_#ff00ff]' : ''}`}>
                  <ChevronRight size={16} />
                </div>
              </button>
              <AnimatePresence>
                {expandedFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-cyan-700 font-bold font-mono text-xs uppercase leading-relaxed border-t-2 border-cyan-900/30 mt-2">
                      {`// ${faq.answer}`}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-black w-full max-w-lg border-4 border-magenta-500 shadow-[12px_12px_0px_#00ffff] overflow-hidden crt-screen"
            >
              <div className="p-6 border-b-4 border-cyan-500/30 flex justify-between items-center bg-black">
                <h2 className="text-2xl font-black text-cyan-400 tracking-tight uppercase glitch-text" data-text="New Ticket">New Ticket</h2>
                <button onClick={() => setShowModal(false)} className="p-2 border-2 border-magenta-500 text-magenta-500 hover:bg-magenta-500 hover:text-white transition-all">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-2 block ml-1">
                    Issue Category
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Plumbing', 'Electrical', 'Security', 'General'].map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setFormData({...formData, category: cat as any})}
                        className={`py-3 font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                          formData.category === cat 
                            ? 'bg-magenta-500 text-white border-black shadow-[4px_4px_0px_#00ffff]' 
                            : 'bg-black border-cyan-900/30 text-cyan-700 hover:border-cyan-500'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-2 block ml-1">
                    Priority Level
                  </label>
                  <div className="flex gap-3">
                    {['Low', 'Medium', 'High'].map(p => (
                      <button 
                        key={p} 
                        onClick={() => setFormData({...formData, priority: p as any})}
                        className={`flex-1 py-3 font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                          formData.priority === p 
                            ? 'bg-magenta-500 text-white border-black shadow-[4px_4px_0px_#00ffff]' 
                            : 'bg-black border-cyan-900/30 text-cyan-700 hover:border-cyan-500'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-2 block ml-1">
                    Subject
                  </label>
                  <input 
                    type="text"
                    placeholder="Briefly describe the issue..."
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-black border-2 border-cyan-500 px-4 py-3 text-sm font-bold text-cyan-400 placeholder:text-cyan-900 focus:border-magenta-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-2 block ml-1">
                    Detailed Description
                  </label>
                  <textarea 
                    rows={4}
                    placeholder="Provide more details for the technician..."
                    value={formData.desc}
                    onChange={e => setFormData({...formData, desc: e.target.value})}
                    className="w-full bg-black border-2 border-cyan-500 px-4 py-3 text-sm font-bold text-cyan-400 placeholder:text-cyan-900 focus:border-magenta-500 outline-none transition-all resize-none"
                  />
                </div>

                <button 
                  onClick={handleRaiseTicket}
                  className="w-full bg-magenta-500 text-white py-4 border-2 border-black font-black text-sm uppercase tracking-widest hover:bg-black hover:text-magenta-500 hover:border-magenta-500 transition-all shadow-[4px_4px_0px_#00ffff] active:scale-95 transform duration-100 flex items-center justify-center gap-2"
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
