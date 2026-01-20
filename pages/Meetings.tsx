import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, MapPin, Clock, Plus, Users, ChevronRight, Info, CheckCircle, X, BellRing, Calendar, Loader2
} from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';
import { api } from '../services/api';
import { Meeting } from '../types';

const Meetings: React.FC = () => {
  const { t } = useLanguage();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    category: 'General' as const
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('sr_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    setLoading(true);
    try {
      const data = await api.getMeetings();
      setMeetings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.scheduleMeeting({
        ...formData,
        createdBy: user?.id || 'unknown'
      });
      await loadMeetings();
      setShowModal(false);
      setFormData({ title: '', date: '', time: '', location: '', description: '', category: 'General' });
    } catch (e) {
      alert("Failed to schedule meeting");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRSVP = async (meetingId: string, currentStatus: boolean) => {
    if (!user) return;
    try {
      const updatedMeeting = await api.rsvpMeeting(meetingId, user.id || user.email, !currentStatus);
      setMeetings(prev => prev.map(m => m.id === meetingId ? updatedMeeting : m));
    } catch (e) {
      console.error(e);
    }
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'COMMITTEE';
  const userId = user?.id || user?.email;

  const isPast = (dateStr: string) => {
    return new Date(dateStr) < new Date(new Date().setHours(0,0,0,0));
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-brand-600 mb-4" size={40} />
        <p className="font-black uppercase tracking-widest text-xs text-slate-400">Syncing Schedule...</p>
      </div>
    );
  }

  const upcomingMeetings = meetings.filter(m => !isPast(m.date));
  const pastMeetings = meetings.filter(m => isPast(m.date));

  return (
    <div className="space-y-10 animate-fade-up pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t('meetings_title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">{t('meetings_desc')}</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowModal(true)}
            className="px-6 py-4 bg-brand-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20 active:scale-95"
          >
            <Plus size={18} /> Schedule
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {upcomingMeetings.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] border border-slate-100 dark:border-slate-800 text-center">
              <CalendarDays className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No Upcoming Meetings</h3>
              <p className="text-slate-500 text-sm">Check back later or view the archive.</p>
            </div>
          ) : (
            upcomingMeetings.map((meeting) => {
              const isAttending = meeting.rsvps.includes(userId);
              return (
                <div key={meeting.id} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 premium-shadow group hover:border-brand-600 transition-all">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-3 mb-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          meeting.category === 'Urgent' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-brand-50 text-brand-600 border border-brand-100'
                        }`}>
                          {meeting.category}
                        </span>
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
                          {new Date(meeting.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{meeting.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed line-clamp-2">{meeting.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-6 text-slate-500 text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-brand-500" /> {meeting.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-brand-500" /> {meeting.location}
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:w-48 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-8 flex flex-col justify-center">
                       <p className="text-[10px] font-black uppercase text-slate-400 mb-2 text-center md:text-left">
                         {isAdmin ? 'Total RSVP' : 'Your Status'}
                       </p>
                       
                       {isAdmin ? (
                         <div className="text-center md:text-left">
                           <p className="text-3xl font-black text-brand-600 mb-1">{meeting.rsvps.length}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Residents Confirmed</p>
                         </div>
                       ) : (
                         <button 
                          onClick={() => handleRSVP(meeting.id, isAttending)}
                          className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                            isAttending 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800' 
                              : 'bg-slate-900 text-white dark:bg-slate-700 hover:bg-brand-600'
                          }`}
                         >
                          {isAttending ? (
                            <>Attending <CheckCircle size={14} /></>
                          ) : (
                            <>Confirm <ChevronRight size={14} /></>
                          )}
                        </button>
                       )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 premium-shadow">
            <h4 className="font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Info size={18} className="text-brand-600" /> {t('meeting_archive')}
            </h4>
            <div className="space-y-4">
              {pastMeetings.length > 0 ? (
                pastMeetings.slice(0, 5).map(m => (
                  <div key={m.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex justify-between items-center group cursor-default">
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 line-clamp-1">{m.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{new Date(m.date).toLocaleDateString()}</p>
                    </div>
                    <span className="text-[10px] font-black bg-white dark:bg-slate-900 px-2 py-1 rounded-lg text-slate-400 shadow-sm">{m.rsvps.length} Attended</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic p-4">No archived meetings.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 shadow-2xl overflow-hidden animate-in zoom-in-95 border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
               <div>
                 <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">New Assembly</h3>
                 <p className="text-[10px] font-black uppercase text-brand-600 tracking-widest">Schedule a community gathering</p>
               </div>
               <button onClick={() => setShowModal(false)} className="p-3 text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all">
                  <X size={28} />
               </button>
            </div>
            
            <form onSubmit={handleSchedule} className="space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Meeting Title</label>
                 <input 
                  type="text" required placeholder="e.g. Diwali Celebration Planning" 
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold text-sm dark:text-white border-2 border-transparent focus:border-brand-600/20"
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                 />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Date</label>
                    <input 
                      type="date" required
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold text-sm dark:text-white border-2 border-transparent focus:border-brand-600/20"
                      value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Time</label>
                    <input 
                      type="time" required
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold text-sm dark:text-white border-2 border-transparent focus:border-brand-600/20"
                      value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}
                    />
                  </div>
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Location</label>
                 <div className="relative">
                   <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input 
                    type="text" required placeholder="e.g. Club House / Garden" 
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold text-sm dark:text-white border-2 border-transparent focus:border-brand-600/20"
                    value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Agenda / Description</label>
                 <textarea 
                  required rows={3} placeholder="Brief details about the meeting..."
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold text-sm dark:text-white border-2 border-transparent focus:border-brand-600/20 resize-none"
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                 />
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Priority Category</label>
                 <div className="flex gap-3">
                    {(['General', 'Urgent', 'Celebration'] as const).map(cat => (
                      <button 
                        key={cat} type="button"
                        onClick={() => setFormData({...formData, category: cat})}
                        className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${
                          formData.category === cat 
                            ? 'border-brand-600 bg-brand-50 text-brand-600 dark:bg-brand-900/10' 
                            : 'border-slate-100 dark:border-slate-800 text-slate-400'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                 </div>
               </div>

               <button 
                type="submit" disabled={submitting}
                className="w-full py-5 bg-brand-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-brand-500/20 active:scale-95 transition-all mt-4"
               >
                 {submitting ? <Loader2 className="animate-spin" size={18} /> : <Calendar size={18} />}
                 {submitting ? 'Scheduling...' : 'Broadcast Meeting'}
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meetings;