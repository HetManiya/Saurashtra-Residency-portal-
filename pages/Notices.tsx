
import React, { useState, useEffect, useMemo } from 'react';
import { Bell, Calendar, ChevronRight, Pin, Loader2, Plus, X, AlertTriangle, CheckCircle, Clock, Smartphone, Mail, Globe, Volume2, Waves } from 'lucide-react';
import { api } from '../services/api';

const Notices: React.FC = () => {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General' as 'Urgent' | 'General' | 'Event',
    broadcastType: 'NONE' as 'NONE' | 'WHATSAPP' | 'EMAIL' | 'BOTH'
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('sr_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    loadNotices();
  }, []);

  const loadNotices = async () => {
    setLoading(true);
    try {
      const data = await api.getNotices();
      setNotices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBroadcasting(true);
    
    try {
      await api.postNotice(formData);
      
      if (formData.broadcastType !== 'NONE') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await api.broadcastNotification(formData.broadcastType as any, 'ALL_RESIDENTS', formData.title);
      }
      
      setShowAddModal(false);
      setFormData({ title: '', content: '', category: 'General', broadcastType: 'NONE' });
      await loadNotices();
    } catch (e) {
      alert("Failed to post notice");
    } finally {
      setIsBroadcasting(false);
    }
  };

  const urgentNotices = useMemo(() => 
    notices.filter(n => n.category === 'Urgent').slice(0, 3), 
  [notices]);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'COMMITTEE';

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  if (loading && notices.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-brand-600 mb-4" size={40} />
        <p className="font-black uppercase tracking-widest text-xs text-slate-400">Syncing Announcements...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
      {/* Dynamic Live Ticker */}
      {urgentNotices.length > 0 && (
        <div className="bg-rose-600/10 border border-rose-200 dark:border-rose-900/50 rounded-3xl overflow-hidden relative">
          <div className="flex items-center">
            <div className="bg-rose-600 text-white px-6 py-4 flex items-center gap-3 shrink-0 z-10">
              <Volume2 size={18} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Live Broadcast</span>
            </div>
            <div className="flex-1 overflow-hidden relative h-12 flex items-center">
              <div className="animate-marquee whitespace-nowrap absolute">
                {urgentNotices.map((n, idx) => (
                  <span key={idx} className="inline-flex items-center gap-4 mx-8 text-rose-700 dark:text-rose-400 font-bold text-sm">
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                    {n.title}: {n.content.substring(0, 80)}...
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .animate-marquee {
            animation: marquee 20s linear infinite;
          }
        `}
      </style>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Society <span className="text-brand-600">Bulletin</span></h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Broadcast official updates to residents</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-4 bg-brand-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20 active:scale-95"
          >
            <Plus size={18} strokeWidth={3} /> Post Notice
          </button>
        )}
      </div>

      <div className="space-y-8 pb-20">
        {notices.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
             <Bell className="w-16 h-16 text-slate-200 mx-auto mb-4" />
             <p className="text-slate-400 font-bold">No announcements have been posted yet.</p>
          </div>
        ) : (
          notices.map((notice, i) => (
            <div key={notice.id || notice._id || i} className="relative group bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all duration-500 premium-shadow overflow-hidden">
              {i === 0 && (
                <div className="absolute top-0 right-0 bg-brand-600 text-white px-6 py-2 rounded-bl-3xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl">
                  <Waves size={12} className="animate-pulse" /> Live Update
                </div>
              )}
              
              <div className="flex flex-col gap-6">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${
                      notice.category === 'Urgent' 
                        ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/30' 
                        : notice.category === 'Event'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30'
                        : 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}>
                      {notice.category}
                    </span>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold">
                      <Clock size={14} />
                      {formatDateTime(notice.date)}
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 leading-tight group-hover:text-brand-600 transition-colors tracking-tighter">
                    {notice.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg font-medium">
                    {notice.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 border border-slate-100 dark:border-slate-800">
            <form onSubmit={handlePostNotice} className="p-10 md:p-14 space-y-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">New Notice</h3>
                <button type="button" onClick={() => setShowAddModal(false)} className="p-3 text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all">
                   <X size={28} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Broadcast Method</label>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { id: 'NONE', icon: Globe, label: 'Portal' },
                      { id: 'WHATSAPP', icon: Smartphone, label: 'WA' },
                      { id: 'EMAIL', icon: Mail, label: 'Email' },
                      { id: 'BOTH', icon: BellRing, label: 'All' }
                    ].map(type => (
                      <button 
                        key={type.id} type="button"
                        onClick={() => setFormData({...formData, broadcastType: type.id as any})}
                        className={`flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all gap-2 ${
                          formData.broadcastType === type.id ? 'border-brand-600 bg-brand-50 text-brand-600 dark:bg-brand-900/10' : 'border-slate-100 text-slate-400 dark:border-slate-800'
                        }`}
                      >
                        <type.icon size={18} />
                        <span className="text-[9px] font-black uppercase">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Title</label>
                  <input 
                    type="text" required placeholder="Notice Title..."
                    className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-[2rem] outline-none text-sm font-bold border-2 border-transparent focus:border-brand-600/20 transition-all dark:text-white"
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Message</label>
                  <textarea 
                    required placeholder="Enter message..." rows={4}
                    className="w-full px-8 py-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] outline-none text-sm font-bold border-2 border-transparent focus:border-brand-600/20 transition-all dark:text-white resize-none"
                    value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                  />
                </div>

                <div className="flex gap-3">
                  {['General', 'Urgent', 'Event'].map(cat => (
                    <button 
                      key={cat} type="button"
                      onClick={() => setFormData({...formData, category: cat as any})}
                      className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${
                        formData.category === cat ? 'border-brand-600 bg-brand-50 text-brand-600 dark:bg-brand-900/10' : 'border-slate-100 text-slate-400 dark:border-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit" disabled={isBroadcasting}
                className="w-full py-5 bg-brand-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-brand-500/20 flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                {isBroadcasting ? <Loader2 className="animate-spin" /> : <Globe size={18} />}
                {isBroadcasting ? 'Broadcasting...' : 'Publish to Residency'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const BellRing = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

export default Notices;
