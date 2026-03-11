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
    <div className="pb-8 animate-fade-in crt-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-6 border-b-4 border-cyan-500/30">
        <div>
          <h3 className="text-4xl font-black tracking-tighter text-cyan-400 glitch-text" data-text={t('meetings_title')}>
            {t('meetings_title')}
          </h3>
          <p className="text-cyan-700 font-bold font-mono uppercase text-xs mt-2">
            {`> COORDINATING_COMMUNITY_ASSEMBLIES_v3.1`}
          </p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-magenta-500 text-white px-6 py-3 border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-black hover:text-magenta-500 hover:border-magenta-500 transition-all shadow-[6px_6px_0px_#00ffff] active:scale-95 transform duration-100"
          >
            <Plus size={18} />
            New Schedule
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {upcomingMeetings.length === 0 ? (
            <div className="py-16 text-center border-4 border-dashed border-cyan-900/30 bg-black shadow-[inset_0_0_20px_rgba(0,255,255,0.05)]">
              <CalendarDays size={48} className="mx-auto mb-4 text-cyan-900" />
              <h6 className="text-lg font-black text-cyan-700 uppercase tracking-tight">Clear Calendar</h6>
              <p className="text-cyan-900 font-mono text-[10px] uppercase mt-1">{`> No society assemblies are currently scheduled.`}</p>
            </div>
          ) : (
            upcomingMeetings.map((meeting: Meeting, index: number) => {
              const userRsvp = meeting.rsvps?.find((r: any) => r.userId === userId);
              const isAttending = userRsvp?.status === 'YES';
              
              return (
                <div 
                  key={meeting.id || index} 
                  className="group bg-black p-6 md:p-8 border-4 border-cyan-500/30 transition-all duration-300 hover:border-magenta-500 hover:shadow-[10px_10px_0px_#00ffff] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 -mr-12 -mt-12 rotate-45" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`px-2 py-1 border text-[10px] font-black uppercase tracking-widest ${
                          meeting.category === 'Urgent' 
                            ? 'text-white bg-magenta-500 border-black shadow-[2px_2px_0px_#00ffff]' 
                            : 'text-black bg-cyan-400 border-black shadow-[2px_2px_0px_#ff00ff]'
                        }`}>
                          {meeting.category}
                        </span>
                        <span className="px-2 py-1 bg-black border border-cyan-900/30 text-cyan-700 text-[10px] font-black uppercase tracking-widest font-mono">
                          {new Date(meeting.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      
                      <h4 className="text-2xl font-black mb-3 text-cyan-400 uppercase tracking-tight group-hover:text-magenta-500 transition-colors">
                        {meeting.title}
                      </h4>
                      <p className="text-cyan-700 font-bold font-mono text-xs uppercase leading-relaxed mb-6">
                        {`// ${meeting.description}`}
                      </p>
                      
                      <div className="flex items-center gap-6 text-cyan-900 text-[10px] font-black uppercase tracking-widest font-mono">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-magenta-500" />
                          <span>{new Date(meeting.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-magenta-500" />
                          <span>{meeting.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:border-l-2 border-cyan-900/30 md:pl-8 flex flex-col justify-center items-center md:items-start">
                      <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-2">
                        {isAdmin ? 'Total RSVPs' : 'Your Attendance'}
                      </span>
                      
                      {isAdmin ? (
                        <div className="text-center md:text-left">
                          <h3 className="text-4xl font-black text-magenta-500 mb-1 glitch-text" data-text={meeting.rsvps?.filter((r: any) => r.status === 'YES').length || 0}>
                            {meeting.rsvps?.filter((r: any) => r.status === 'YES').length || 0}
                          </h3>
                          <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest">Confirmations</span>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleRSVP(meeting.id, userRsvp?.status || 'NO')}
                          className={`w-full py-3 border-2 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                            isAttending 
                              ? 'bg-cyan-400 text-black border-black shadow-[4px_4px_0px_#ff00ff]' 
                              : 'bg-black text-magenta-500 border-magenta-500 hover:bg-magenta-500 hover:text-white shadow-[4px_4px_0px_#00ffff]'
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
                <div className="h-0.5 bg-cyan-900/30 flex-grow" />
                <span className="text-[10px] font-black text-cyan-700 uppercase tracking-[0.2em]">Past Assemblies</span>
                <div className="h-0.5 bg-cyan-900/30 flex-grow" />
              </div>
              
              <div className="space-y-4 opacity-40 hover:opacity-100 transition-opacity duration-300">
                {pastMeetings.map((meeting: Meeting, index: number) => (
                  <div key={meeting.id || index} className="bg-black p-6 border-2 border-cyan-900/30">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 border border-cyan-900/30 text-[10px] font-black uppercase text-cyan-900">Concluded</span>
                          <span className="text-[10px] font-black uppercase text-cyan-700 font-mono">{new Date(meeting.date).toLocaleDateString()}</span>
                        </div>
                        <h6 className="text-lg font-black text-cyan-700 uppercase tracking-tight">{meeting.title}</h6>
                        <p className="text-[10px] font-bold font-mono text-cyan-900 uppercase mt-1">{`// ${meeting.description}`}</p>
                      </div>
                      <div className="flex items-center gap-4 text-cyan-900 text-[10px] font-black uppercase font-mono">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{new Date(meeting.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={12} />
                          <span>{meeting.location}</span>
                        </div>
                        <div className="flex items-center gap-1 ml-2 pl-4 border-l border-cyan-900/30">
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
          <div className="bg-magenta-500 text-white p-8 border-4 border-black relative overflow-hidden shadow-[8px_8px_0px_#00ffff] sticky top-8">
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-black border-2 border-white flex items-center justify-center mb-6">
                <BellRing size={24} className="text-white" />
              </div>
              <h5 className="text-2xl font-black mb-2 uppercase tracking-tight">Stay Informed</h5>
              <p className="text-white/90 font-bold font-mono text-[10px] uppercase leading-relaxed">
                {`> All community meetings are broadcasted via WhatsApp and Email to ensure maximum participation.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-black w-full max-w-lg border-4 border-magenta-500 shadow-[12px_12px_0px_#00ffff] overflow-hidden crt-screen">
            <div className="p-6 border-b-4 border-cyan-500/30 flex justify-between items-center bg-black">
              <h4 className="text-2xl font-black text-cyan-400 uppercase tracking-tight glitch-text" data-text="New Assembly">New Assembly</h4>
              <button 
                onClick={() => setShowModal(false)}
                className="w-10 h-10 border-2 border-magenta-500 flex items-center justify-center text-magenta-500 hover:bg-magenta-500 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8">
              <form onSubmit={handleSchedule} className="space-y-6">
                <div>
                  <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest block mb-2 ml-1">Meeting Title</span>
                  <input 
                    type="text"
                    placeholder="e.g. Navratri Event Planning" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-black border-2 border-cyan-500 px-4 py-3 text-cyan-400 placeholder:text-cyan-900 font-bold outline-none focus:border-magenta-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest block mb-2 ml-1">Date</span>
                    <input 
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-black border-2 border-cyan-500 px-4 py-3 text-cyan-400 font-bold outline-none focus:border-magenta-500 transition-all"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest block mb-2 ml-1">Time</span>
                    <input 
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full bg-black border-2 border-cyan-500 px-4 py-3 text-cyan-400 font-bold outline-none focus:border-magenta-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest block mb-2 ml-1">Location</span>
                  <input 
                    type="text"
                    placeholder="Club House / Main Garden" 
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-black border-2 border-cyan-500 px-4 py-3 text-cyan-400 placeholder:text-cyan-900 font-bold outline-none focus:border-magenta-500 transition-all"
                  />
                </div>

                <div>
                  <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest block mb-2 ml-1">Agenda Description</span>
                  <textarea 
                    rows={3}
                    placeholder="Briefly describe the purpose..."
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-black border-2 border-cyan-500 px-4 py-3 text-cyan-400 placeholder:text-cyan-900 font-bold outline-none focus:border-magenta-500 transition-all resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-magenta-500 text-white font-black uppercase tracking-widest py-4 border-2 border-black shadow-[6px_6px_0px_#00ffff] hover:bg-black hover:text-magenta-500 hover:border-magenta-500 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
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
