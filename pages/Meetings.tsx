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
      // Silently handle error
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newMeeting = await api.scheduleMeeting({
        ...formData,
        createdBy: user?.id || 'unknown'
      });
      
      setMeetings(prev => [newMeeting, ...prev]);
      
      setShowModal(false);
      setFormData({ title: '', date: '', time: '', location: '', description: '', category: 'General' });
    } catch (e) {
      console.error("Schedule error:", e);
      alert("Failed to schedule meeting");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRSVP = async (meetingId: string, currentStatus: string) => {
    if (!user) return;
    try {
      const nextStatus = currentStatus === 'YES' ? 'NO' : 'YES';
      const updatedMeeting = await api.rsvpMeeting(meetingId, nextStatus);
      setMeetings(prev => prev.map(m => m.id === meetingId ? updatedMeeting : m));
    } catch (e) {
      // Silently handle error
    }
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'COMMITTEE';
  const userId = user?.id;

  const isPast = (dateStr: string) => {
    return new Date(dateStr) < new Date(new Date().setHours(0,0,0,0));
  };

  const upcomingMeetings = meetings.filter(m => !isPast(m.date));
  const pastMeetings = meetings.filter(m => isPast(m.date));

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 size={40} className="animate-spin mb-4 text-brand-600" />
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Loading Assemblies...
        </span>
      </div>
    );
  }

  return (
    <div className="pb-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
            {t('meetings_title')}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Coordinate community gatherings and festive planning
          </p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowModal(true)}
            aria-label="Schedule a new meeting"
            className="flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/20 active:scale-95 transform duration-100"
          >
            <Plus size={18} />
            New Schedule
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {upcomingMeetings.length === 0 ? (
            <div className="py-16 text-center rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <CalendarDays size={48} className="mx-auto mb-4 text-slate-200 dark:text-slate-700" />
              <h6 className="text-lg font-black text-slate-400">Clear Calendar</h6>
              <p className="text-slate-400 text-sm mt-1">No society assemblies are currently scheduled.</p>
            </div>
          ) : (
            upcomingMeetings.map((meeting: Meeting, index: number) => {
              const userRsvp = meeting.rsvps?.find((r: any) => r.userId === userId);
              const isAttending = userRsvp?.status === 'YES';
              
              return (
                <div 
                  key={meeting.id || index} 
                  className="group bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:border-brand-500 hover:shadow-xl"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                          meeting.category === 'Urgent' 
                            ? 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' 
                            : 'text-brand-600 bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-800'
                        }`}>
                          {meeting.category}
                        </span>
                        <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                          {new Date(meeting.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      
                      <h4 className="text-2xl font-black mb-3 text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                        {meeting.title}
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
                        {meeting.description}
                      </p>
                      
                      <div className="flex items-center gap-6 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-brand-500" />
                          <span>{new Date(meeting.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-brand-500" />
                          <span>{meeting.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:border-l border-slate-100 dark:border-slate-800 md:pl-8 flex flex-col justify-center items-center md:items-start">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        {isAdmin ? 'Total RSVPs' : 'Your Attendance'}
                      </span>
                      
                      {isAdmin ? (
                        <div className="text-center md:text-left">
                          <h3 className="text-4xl font-black text-brand-600 mb-1">
                            {meeting.rsvps?.filter((r: any) => r.status === 'YES').length || 0}
                          </h3>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirmations</span>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleRSVP(meeting.id, userRsvp?.status || 'NO')}
                          aria-label={isAttending ? "Cancel attendance" : "Confirm attendance"}
                          aria-pressed={isAttending}
                          className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                            isAttending 
                              ? 'bg-green-50 text-green-600 border-2 border-green-500 hover:bg-green-100' 
                              : 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-900/20'
                          }`}
                        >
                          {isAttending && <CheckCircle size={14} />}
                          {isAttending ? 'Attending' : 'Confirm RSVP'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {pastMeetings.length > 0 && (
            <div className="pt-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-grow" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Past Assemblies</span>
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-grow" />
              </div>
              
              <div className="space-y-4 opacity-60 hover:opacity-100 transition-opacity duration-300">
                {pastMeetings.map((meeting: Meeting, index: number) => (
                  <div key={meeting.id || index} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-black uppercase text-slate-500 dark:text-slate-300">Concluded</span>
                          <span className="text-[10px] font-black uppercase text-slate-400">{new Date(meeting.date).toLocaleDateString()}</span>
                        </div>
                        <h6 className="text-lg font-black text-slate-700 dark:text-slate-300">{meeting.title}</h6>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{meeting.description}</p>
                      </div>
                      <div className="flex items-center gap-4 text-slate-400 text-xs font-bold uppercase">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{new Date(meeting.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={12} />
                          <span>{meeting.location}</span>
                        </div>
                        <div className="flex items-center gap-1 ml-2 pl-4 border-l border-slate-200 dark:border-slate-700">
                          <Users size={12} />
                          <span>{meeting.rsvps?.filter((r: any) => r.status === 'YES').length || 0} Attended</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="bg-brand-600 text-white p-8 rounded-[2.5rem] relative overflow-hidden shadow-xl sticky top-8">
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <BellRing size={24} className="text-white" />
              </div>
              <h5 className="text-2xl font-black mb-2">Stay Informed</h5>
              <p className="text-brand-100 leading-relaxed text-sm font-medium">
                All community meetings are broadcasted via WhatsApp and Email to ensure maximum participation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h4 className="text-2xl font-black text-slate-900 dark:text-white">New Assembly</h4>
              <button 
                onClick={() => setShowModal(false)}
                aria-label="Close meeting form"
                className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSchedule} className="space-y-5">
                <div>
                  <label htmlFor="meeting-title" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Meeting Title</label>
                  <input 
                    id="meeting-title"
                    type="text"
                    placeholder="e.g. Navratri Event Planning" 
                    required
                    aria-label="Meeting Title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 font-bold focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="meeting-date" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Date</label>
                    <input 
                      id="meeting-date"
                      type="date"
                      required
                      aria-label="Meeting Date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="meeting-time" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Time</label>
                    <input 
                      id="meeting-time"
                      type="time"
                      required
                      aria-label="Meeting Time"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="meeting-location" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Location</label>
                  <input 
                    id="meeting-location"
                    type="text"
                    placeholder="Club House / Main Garden" 
                    required
                    aria-label="Meeting Location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 font-bold focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="meeting-description" className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Agenda Description</label>
                  <textarea 
                    id="meeting-description"
                    rows={3}
                    placeholder="Briefly describe the purpose..."
                    required
                    aria-label="Meeting Agenda Description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 font-medium focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  aria-label={submitting ? "Scheduling meeting" : "Broadcast meeting to residents"}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-brand-600/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Calendar size={18} />
                      Broadcast to Residents
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

export default Meetings;
