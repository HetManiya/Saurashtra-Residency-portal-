import React, { useState, useEffect, useMemo } from 'react';
import { Bell, Calendar, ChevronRight, Pin, Loader2, Plus, X, AlertTriangle, CheckCircle, Clock, Smartphone, Mail, Globe, Volume2, Waves, BellRing, Search } from 'lucide-react';
import { api } from '../services/api';
import Fuse from 'fuse.js';

const Notices: React.FC = () => {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
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

  const loadNotices = async (retries = 0) => {
    if (retries === 0) setLoading(true);
    try {
      const data = await api.getNotices();
      setNotices(data);
      setLoading(false);
    } catch (e: any) {
      if (e.message === 'SERVER_STARTING' && retries < 5) {
        setTimeout(() => loadNotices(retries + 1), 2000);
        return;
      }
      setLoading(false);
    }
  };

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBroadcasting(true);
    
    try {
      const newNotice = await api.postNotice(formData);
      
      setNotices(prev => [newNotice, ...prev]);
      
      if (formData.broadcastType !== 'NONE') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await api.broadcastNotification(formData.broadcastType as any, 'ALL_RESIDENTS', formData.title);
      }
      
      setShowAddModal(false);
      setFormData({ title: '', content: '', category: 'General', broadcastType: 'NONE' });
    } catch (e) {
      alert("Failed to post notice");
    } finally {
      setIsBroadcasting(false);
    }
  };

  const urgentNotices = useMemo(() => 
    notices.filter(n => n.category === 'Urgent').slice(0, 3), 
  [notices]);

  const filteredNotices = useMemo(() => {
    if (!searchQuery.trim()) return notices;
    
    const fuse = new Fuse(notices, {
      keys: ['title', 'content', 'category'],
      threshold: 0.3,
    });
    
    return fuse.search(searchQuery).map(result => result.item);
  }, [notices, searchQuery]);

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
        <Loader2 size={40} className="animate-spin mb-4 text-brand-500" />
        <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">
          Syncing Announcements...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-8 animate-fade-in">
      {/* Dynamic Live Ticker */}
      {urgentNotices.length > 0 && (
        <div className="mb-8 overflow-hidden bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/50 rounded-2xl flex items-center shadow-sm">
           <div className="bg-rose-600 text-white px-4 py-3 flex items-center gap-2 z-10 shrink-0">
             <Volume2 size={18} className="animate-pulse" />
             <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Live Broadcast</span>
           </div>
           <div className="flex-grow overflow-hidden relative h-10 flex items-center">
             <div className="absolute whitespace-nowrap animate-marquee">
               {urgentNotices.map((n, idx) => (
                 <span key={idx} className="mx-8 text-rose-700 dark:text-rose-400 font-semibold text-sm">
                   • {n.title}: {n.content.substring(0, 80)}...
                 </span>
               ))}
             </div>
           </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex-grow">
          <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
            Society <span className="text-brand-600">Bulletin</span>
          </h3>
          <p className="text-slate-500 mt-1 text-sm font-medium uppercase tracking-wider">
            Official updates and announcements
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search notices..."
              aria-label="Search notices"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
            />
          </div>
          {isAdmin && (
            <button 
              onClick={() => setShowAddModal(true)}
              aria-label="Post a new notice"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-600 text-white px-6 py-2.5 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-95"
            >
              <Plus size={18} strokeWidth={3} />
              Post Notice
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredNotices.length === 0 ? (
          <div className="py-16 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
             <Bell size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
             <h6 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
               {searchQuery ? `No notices matching "${searchQuery}"` : "No announcements posted"}
             </h6>
             <p className="text-slate-500 text-sm mt-1">Check back later for updates</p>
          </div>
        ) : (
          filteredNotices.map((notice, i) => (
            <div 
              key={notice.id || notice._id || i} 
              className="group bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-brand-500/30 shadow-sm"
            >
              {i === 0 && (
                <div className="absolute top-0 right-0 bg-brand-600 text-white px-4 py-1.5 flex items-center gap-2 rounded-bl-2xl">
                  <Waves size={12} className="animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">New Update</span>
                </div>
              )}
              
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                    notice.category === 'Urgent' 
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' 
                      : notice.category === 'Event'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                  }`}>
                    {notice.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium uppercase">
                    <Clock size={14} />
                    <span>{formatDateTime(notice.date)}</span>
                  </div>
                </div>
                
                <h4 className="text-xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                  {notice.title}
                </h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {notice.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-in relative z-10">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">New Notice</h4>
              <button 
                onClick={() => setShowAddModal(false)}
                aria-label="Close notice form"
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handlePostNotice} className="space-y-6">
                <div>
                  <label htmlFor="broadcast-method" className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">Broadcast Method</label>
                  <div id="broadcast-method" className="grid grid-cols-4 gap-3" role="group" aria-label="Select broadcast method">
                    {[
                      { id: 'NONE', icon: Globe, label: 'Portal' },
                      { id: 'WHATSAPP', icon: Smartphone, label: 'WA' },
                      { id: 'EMAIL', icon: Mail, label: 'Email' },
                      { id: 'BOTH', icon: BellRing, label: 'All' }
                    ].map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({...formData, broadcastType: type.id as any})}
                        aria-label={`Broadcast via ${type.label}`}
                        aria-pressed={formData.broadcastType === type.id}
                        className={`h-20 flex flex-col items-center justify-center gap-2 border-2 rounded-2xl transition-all duration-200 ${
                          formData.broadcastType === type.id 
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' 
                            : 'border-slate-100 dark:border-slate-800 bg-transparent text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                        }`}
                      >
                        <type.icon size={20} />
                        <span className="text-[10px] font-bold uppercase">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="notice-title" className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Title</label>
                  <input 
                    id="notice-title"
                    type="text"
                    placeholder="Notice title..." 
                    required
                    aria-label="Notice Title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 rounded-2xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="notice-message" className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Message</label>
                  <textarea 
                    id="notice-message"
                    rows={4}
                    placeholder="Enter announcement details..."
                    required
                    aria-label="Notice Message Content"
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 rounded-2xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label htmlFor="notice-category" className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">Category</label>
                  <div id="notice-category" className="flex gap-3" role="group" aria-label="Select notice category">
                    {['General', 'Urgent', 'Event'].map(cat => (
                      <button 
                        key={cat} 
                        type="button"
                        onClick={() => setFormData({...formData, category: cat as any})}
                        aria-label={`Category: ${cat}`}
                        aria-pressed={formData.category === cat}
                        className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-2xl border-2 transition-all ${
                          formData.category === cat
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                            : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isBroadcasting}
                  aria-label={isBroadcasting ? "Publishing notice" : "Publish notice to residency"}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold uppercase tracking-widest py-4 rounded-2xl transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isBroadcasting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Broadcasting...
                    </>
                  ) : (
                    <>
                      <Globe size={18} />
                      Publish to Residency
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notices;
