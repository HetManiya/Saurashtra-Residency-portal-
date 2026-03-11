import React, { useState, useEffect, useMemo } from 'react';
import { Bell, Calendar, ChevronRight, Pin, Loader2, Plus, X, AlertTriangle, CheckCircle, Clock, Smartphone, Mail, Globe, Volume2, Waves, BellRing, Search } from 'lucide-react';
import { api } from '../services/api';

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
  }, [searchQuery]);

  const loadNotices = async (retries = 0) => {
    if (retries === 0) setLoading(true);
    try {
      const data = await api.getNotices(searchQuery);
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
      <div className="h-[60vh] flex flex-col items-center justify-center crt-screen">
        <Loader2 size={40} className="animate-spin mb-4 text-cyan-400" />
        <span className="text-xs font-black text-magenta-500 uppercase tracking-widest glitch-text" data-text="Syncing Announcements...">
          Syncing Announcements...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-8 animate-fade-in crt-screen">
      {/* Dynamic Live Ticker */}
      {urgentNotices.length > 0 && (
        <div className="mb-8 border-4 border-magenta-500 bg-black flex items-center shadow-[4px_4px_0px_#00ffff]">
           <div className="bg-magenta-600 text-white px-4 py-3 flex items-center gap-2 z-10 shrink-0 border-r-4 border-magenta-500">
             <Volume2 size={18} className="animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Live Broadcast</span>
           </div>
           <div className="flex-grow overflow-hidden relative h-10 flex items-center">
             <div className="absolute whitespace-nowrap animate-marquee">
               {urgentNotices.map((n, idx) => (
                 <span key={idx} className="mx-8 text-cyan-400 font-bold text-sm">
                   • {n.title}: {n.content.substring(0, 80)}...
                 </span>
               ))}
             </div>
           </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-6 border-b-4 border-cyan-500/30">
        <div>
          <h3 className="text-4xl font-black tracking-tighter text-cyan-400 glitch-text" data-text="Society Bulletin">
            Society <span className="text-magenta-500">Bulletin</span>
          </h3>
          <p className="text-cyan-700 mt-2 font-bold font-mono">
            {`> Broadcast official updates to residents`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700" />
            <input 
              type="text"
              placeholder="Search notices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-black border-2 border-cyan-500 text-cyan-400 text-sm font-bold focus:border-magenta-500 outline-none transition-all placeholder:text-cyan-900"
            />
          </div>
          {isAdmin && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 bg-magenta-500 text-white px-6 py-3 border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-black hover:text-magenta-500 hover:border-magenta-500 transition-all shadow-[4px_4px_0px_#00ffff] active:scale-95 transform duration-100 w-full sm:w-auto"
            >
              <Plus size={18} strokeWidth={3} />
              Post Notice
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {notices.length === 0 ? (
          <div className="py-16 text-center border-4 border-dashed border-cyan-900/30 bg-black/40">
             <Bell size={64} className="mx-auto mb-4 text-cyan-900" />
             <h6 className="text-lg font-black text-cyan-700 uppercase tracking-widest">No announcements found.</h6>
          </div>
        ) : (
          notices.map((notice, i) => (
            <div 
              key={notice.id || notice._id || i} 
              className="group bg-black p-6 md:p-8 border-4 border-cyan-500/30 relative overflow-hidden transition-all duration-300 hover:border-magenta-500 hover:shadow-[8px_8px_0px_#00ffff]"
            >
              {i === 0 && (
                <div className="absolute top-0 right-0 bg-magenta-600 text-white px-4 py-1.5 border-l-4 border-b-4 border-magenta-500 flex items-center gap-2">
                  <Waves size={12} className="animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Live Update</span>
                </div>
              )}
              
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider border-2 ${
                    notice.category === 'Urgent' 
                      ? 'text-white bg-red-600 border-red-400 animate-pulse' 
                      : notice.category === 'Event'
                      ? 'text-black bg-cyan-400 border-cyan-600'
                      : 'text-cyan-400 bg-black border-cyan-500'
                  }`}>
                    {notice.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-cyan-700 text-xs font-bold font-mono">
                    <Clock size={14} />
                    <span>{formatDateTime(notice.date)}</span>
                  </div>
                </div>
                
                <h4 className="text-2xl font-black mb-3 text-cyan-400 group-hover:text-magenta-500 transition-colors glitch-text" data-text={notice.title}>
                  {notice.title}
                </h4>
                <p className="text-lg text-cyan-600 leading-relaxed font-bold font-mono">
                  {notice.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in crt-screen">
          <div className="bg-black w-full max-w-lg border-4 border-magenta-500 shadow-[12px_12px_0px_#00ffff] overflow-hidden animate-scale-in">
            <div className="p-6 border-b-4 border-cyan-500/30 flex justify-between items-center bg-black">
              <h4 className="text-2xl font-black text-cyan-400 glitch-text" data-text="New Notice">New Notice</h4>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-10 h-10 bg-black border-2 border-magenta-500 flex items-center justify-center text-magenta-500 hover:bg-magenta-500 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handlePostNotice} className="space-y-6">
                <div>
                  <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest block mb-3">Broadcast Method</span>
                  <div className="grid grid-cols-4 gap-3">
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
                        className={`h-20 flex flex-col items-center justify-center gap-2 border-2 transition-all duration-200 ${
                          formData.broadcastType === type.id 
                            ? 'border-magenta-500 bg-magenta-900/20 text-magenta-500 shadow-[4px_4px_0px_#00ffff]' 
                            : 'border-cyan-900/30 bg-black text-cyan-700 hover:border-cyan-500'
                        }`}
                      >
                        <type.icon size={20} />
                        <span className="text-[10px] font-black uppercase">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest block mb-2">Title</span>
                  <input 
                    type="text"
                    placeholder="Notice Title..." 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-black border-2 border-cyan-500 px-4 py-3 text-cyan-400 placeholder-cyan-900 font-bold focus:border-magenta-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest block mb-2">Message</span>
                  <textarea 
                    rows={4}
                    placeholder="Enter message..."
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full bg-black border-2 border-cyan-500 px-4 py-3 text-cyan-400 placeholder-cyan-900 font-bold focus:border-magenta-500 outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest block mb-3">Category</span>
                  <div className="flex gap-3">
                    {['General', 'Urgent', 'Event'].map(cat => (
                      <button 
                        key={cat} 
                        type="button"
                        onClick={() => setFormData({...formData, category: cat as any})}
                        className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider border-2 transition-all ${
                          formData.category === cat
                            ? 'border-magenta-500 bg-magenta-900/20 text-magenta-500 shadow-[2px_2px_0px_#00ffff]'
                            : 'border-cyan-900/30 text-cyan-700 hover:border-cyan-500'
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
                  className="w-full bg-magenta-500 text-white font-black uppercase tracking-widest py-4 border-2 border-black transition-all shadow-[4px_4px_0px_#00ffff] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
