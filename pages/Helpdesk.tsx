import React, { useState, useEffect } from 'react';
import { 
  Plus, Clock, CheckCircle2, 
  Send, X, MessageSquare, Shield, Zap, 
  Droplets, Loader2, Filter, Trash2,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { Complaint } from '../types';

const Helpdesk: React.FC = () => {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Complaint[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('ALL');
  
  const user = JSON.parse(localStorage.getItem('sr_user') || '{}');
  const isAdmin = ['ADMIN', 'COMMITTEE'].includes(user.role);

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    category: 'General'
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await api.getComplaints();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'CLOSED': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
      default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 dark:text-red-400';
      case 'MEDIUM': return 'text-amber-600 dark:text-amber-400';
      default: return 'text-slate-500 dark:text-slate-400';
    }
  };

  const getCategoryIcon = (ticket: Complaint) => {
    const s = (ticket.subject + ' ' + (ticket.category || '')).toLowerCase();
    if (s.includes('water') || s.includes('leak') || s.includes('plumb')) return Droplets;
    if (s.includes('light') || s.includes('electr') || s.includes('power') || s.includes('fan')) return Zap;
    if (s.includes('security') || s.includes('gate') || s.includes('guard')) return Shield;
    if (s.includes('lift') || s.includes('elevator')) return AlertCircle;
    return MessageSquare;
  };

  const handleRaiseTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.description) return;

    try {
      await api.createComplaint(formData);
      setShowModal(false);
      setFormData({ subject: '', description: '', priority: 'MEDIUM', category: 'General' });
      fetchTickets();
    } catch (error) {
      console.error('Error raising ticket:', error);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.updateComplaint(id, status);
      fetchTickets();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await api.deleteComplaint(id);
      fetchTickets();
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  };

  const filteredTickets = tickets.filter(t => filter === 'ALL' || t.status === filter);

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
            {t('helpdesk')}
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium uppercase tracking-wider">
            Report anomalies and track resolution status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 pr-10 text-xs font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="ALL">{t('all')}</option>
              <option value="OPEN">{t('open')}</option>
              <option value="IN_PROGRESS">{t('in_progress')}</option>
              <option value="RESOLVED">{t('resolved')}</option>
              <option value="CLOSED">{t('closed')}</option>
            </select>
            <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-brand-600 text-white px-6 py-2.5 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-95"
          >
            <Plus size={18} strokeWidth={3} />
            {t('raise_ticket')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-brand-600 mb-4" size={40} />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{t('fetching_data')}</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <MessageSquare className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">{t('no_tickets')}</p>
        </div>
      ) : (
        <div className="space-y-4 pb-12">
          {filteredTickets.map((ticket) => {
            const Icon = getCategoryIcon(ticket);
            const isOwner = ticket.userId === user.id || (ticket.userId as any)?._id === user.id;
            
            return (
              <div 
                key={ticket._id} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-xl hover:border-brand-500/30 transition-all duration-300 shadow-sm"
              >
                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8">
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center text-brand-600 dark:text-brand-400">
                          <Icon size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                              {ticket.subject}
                            </h3>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex-shrink-0">
                              #{ticket._id?.substring(ticket._id.length - 6).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${getPriorityColor(ticket.priority)}`}>
                              {t(ticket.priority.toLowerCase())} {t('priority')}
                            </span>
                            <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              {ticket.flatId}
                            </span>
                            {(isAdmin || isOwner) && (
                              <>
                                <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">
                                  {(ticket.userId as any)?.name || 'You'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        {isAdmin && (
                          <button 
                            onClick={() => handleDeleteTicket(ticket._id!)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                      
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                        {ticket.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <Clock size={14} /> {new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${getStatusColor(ticket.status)}`}>
                          {t(ticket.status.toLowerCase())}
                        </span>
                        
                        <div className="flex gap-2 ml-auto">
                          {isAdmin && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                            <>
                              {ticket.status === 'OPEN' && (
                                <button 
                                  onClick={() => handleUpdateStatus(ticket._id!, 'IN_PROGRESS')}
                                  className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:underline"
                                >
                                  Mark In Progress
                                </button>
                              )}
                              <button 
                                onClick={() => handleUpdateStatus(ticket._id!, 'RESOLVED')}
                                className="text-[10px] font-bold uppercase tracking-widest text-green-600 hover:underline"
                              >
                                Mark Resolved
                              </button>
                            </>
                          )}
                          {isOwner && ticket.status === 'RESOLVED' && (
                            <button 
                              onClick={() => handleUpdateStatus(ticket._id!, 'CLOSED')}
                              className="text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:underline"
                            >
                              Close Ticket
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-4 lg:pl-8 lg:border-l border-slate-100 dark:border-slate-800 pt-6 lg:pt-0 border-t lg:border-t-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">
                        Resolution Progress
                      </span>
                      <div className="space-y-6 relative">
                        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800" />
                        {[
                          { label: t('open'), active: true },
                          { label: t('in_progress'), active: ticket.status !== 'OPEN' },
                          { label: t('resolved'), active: ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' }
                        ].map((step, index) => (
                          <div key={index} className="relative flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all ${
                              step.active 
                                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}>
                              {step.active ? <CheckCircle2 size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                              step.active ? 'text-slate-900 dark:text-white' : 'text-slate-400'
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

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative z-10"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('raise_ticket')}</h2>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleRaiseTicket} className="p-8 space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">
                    {t('priority')}
                  </label>
                  <div className="flex gap-3">
                    {(['LOW', 'MEDIUM', 'HIGH'] as const).map(p => (
                      <button 
                        key={p} 
                        type="button"
                        onClick={() => setFormData({...formData, priority: p})}
                        className={`flex-1 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all border-2 ${
                          formData.priority === p 
                            ? 'bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-600/20' 
                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-brand-500'
                        }`}
                      >
                        {t(p.toLowerCase())}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                    Category
                  </label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                  >
                    <option value="General">General</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Security">Security</option>
                    <option value="Elevator">Elevator</option>
                    <option value="Cleaning">Cleaning</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                    {t('subject')}
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Briefly describe the issue..."
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                    {t('description')}
                  </label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Provide more details for the technician..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-brand-700 transition-all shadow-xl shadow-brand-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  {t('raise_ticket')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Helpdesk;
