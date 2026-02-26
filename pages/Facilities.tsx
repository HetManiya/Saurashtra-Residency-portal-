
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sofa, TreePine, Coffee, Star, MapPin, Calendar, Clock, ChevronRight, Users, 
  X, ShieldCheck, User, Info, CheckCircle2, Ticket, PartyPopper, Clapperboard, CalendarDays,
  History, Settings2, Trash2, Loader2, AlertCircle, Sparkles, Building
} from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';
import { SOCIETY_INFO } from '../constants';
import { AmenityBooking } from '../types';
import { api } from '../services/api';

const Facilities: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'explore' | 'my-bookings' | 'admin'>('explore');
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [amenities, setAmenities] = useState<any[]>([]);
  const [selectedAmenity, setSelectedAmenity] = useState<any | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    purpose: '',
    date: '',
    startTime: '10:00 AM',
    endTime: '02:00 PM',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('sr_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsData, amenitiesData] = await Promise.all([
        api.getAmenityBookings(),
        api.getAmenities()
      ]);
      setAllBookings(bookingsData);
      setAmenities(amenitiesData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'COMMITTEE';

  const myBookings = useMemo(() => {
    if (!user) return [];
    return allBookings.filter(b => b.userId === user.id || b.flatId === user.flatId);
  }, [allBookings, user]);

  const pendingBookings = useMemo(() => {
    return allBookings.filter(b => b.status === 'PENDING');
  }, [allBookings]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmenity || !user) return;

    try {
      await api.createAmenityBooking({
        amenityId: selectedAmenity._id,
        purpose: formData.purpose,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
      });
      await loadData();
      setShowBookingForm(false);
      setFormData({ purpose: '', date: '', startTime: '10:00 AM', endTime: '02:00 PM' });
      alert("Booking request submitted successfully! Awaiting committee approval.");
    } catch (e) {
      alert("Failed to submit booking.");
    }
  };

  const handleStatusUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.updateAmenityBookingStatus(id, status);
      await loadData();
    } catch (e) {
      alert("Failed to update status.");
    }
  };

  const getFacilityIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('club')) return <PartyPopper size={24} />;
    if (n.includes('pool')) return <TreePine size={24} />;
    if (n.includes('theatre') || n.includes('cinema')) return <Clapperboard size={24} />;
    if (n.includes('gym')) return <Building size={24} />;
    return <Sofa size={24} />;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800';
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800';
      case 'REJECTED': return 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  if (loading && amenities.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-brand-600 mb-4" size={40} />
        <p className="font-black uppercase tracking-widest text-xs text-slate-400">Syncing Amenities...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-up pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tighter">Community <span className="text-brand-600">Amenities</span></h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Book premium society facilities and view public events</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          <button 
            onClick={() => setActiveTab('explore')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'explore' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-xl' : 'text-slate-400'}`}
          >
            Explore
          </button>
          <button 
            onClick={() => setActiveTab('my-bookings')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'my-bookings' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-xl' : 'text-slate-400'}`}
          >
            My Requests
          </button>
          {isAdmin && (
            <button 
              onClick={() => setActiveTab('admin')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'admin' ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-xl' : 'text-slate-400'}`}
            >
              Approvals ({pendingBookings.length})
            </button>
          )}
        </div>
      </div>

      {activeTab === 'explore' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {amenities.map((item: any) => (
            <div key={item._id} className="group bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm bento-card flex flex-col">
              <div className="h-64 relative overflow-hidden">
                <img src={item.image || `https://picsum.photos/seed/${item.name}/800/600`} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20">
                    {getFacilityIcon(item.name)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white mb-0">{item.name}</h3>
                    <span className="text-[10px] font-black uppercase text-brand-400 tracking-widest">{item.status}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-10 flex-1 flex flex-col">
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">{item.description}</p>
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Capacity</p>
                    <p className="text-sm font-black dark:text-white mb-0">{item.capacity} guests</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Rate</p>
                    <p className="text-sm font-black text-emerald-600 mb-0">₹{item.hourlyRate}/hr</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedAmenity(item)}
                  className="mt-auto w-full py-5 bg-brand-600 text-white rounded-[1.8rem] font-black text-[11px] uppercase tracking-widest hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20 flex items-center justify-center gap-3 active:scale-95"
                >
                  View Details <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'my-bookings' && (
        <div className="space-y-6">
          {myBookings.length === 0 ? (
            <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800">
              <Ticket size={48} className="mx-auto text-slate-200 mb-4" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white">No Bookings Found</h3>
              <p className="text-slate-400">You haven't requested any facilities yet.</p>
            </div>
          ) : (
            myBookings.map((booking) => (
              <div key={booking._id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center text-brand-600 shadow-inner">
                    {getFacilityIcon(booking.amenityId?.name || '')}
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white">{booking.purpose}</h4>
                    <p className="text-xs font-bold text-slate-400 flex items-center gap-2 mt-1">
                      <Calendar size={12} /> {new Date(booking.date).toLocaleDateString()} • <Clock size={12} /> {booking.startTime} - {booking.endTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${getStatusStyle(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'admin' && (
        <div className="space-y-6">
          {pendingBookings.length === 0 ? (
            <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800">
              <BadgeCheck size={48} className="mx-auto text-emerald-200 mb-4" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Queue Clear</h3>
              <p className="text-slate-400">All booking requests have been processed.</p>
            </div>
          ) : (
            pendingBookings.map((booking) => (
              <div key={booking._id} className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-10 premium-shadow">
                <div className="flex items-center gap-8">
                  <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/10 rounded-[2rem] flex items-center justify-center text-amber-600">
                    {getFacilityIcon(booking.amenityId?.name || '')}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <h4 className="text-2xl font-black text-slate-900 dark:text-white">{booking.purpose}</h4>
                       <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-black uppercase text-slate-400">Ref: {booking._id.slice(-6)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                       <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
                          <User size={14} className="text-brand-600" /> {booking.userId?.name || 'User'} (Unit {booking.flatId})
                       </p>
                       <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
                          <Calendar size={14} className="text-brand-600" /> {new Date(booking.date).toLocaleDateString()}
                       </p>
                       <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
                          <Clock size={14} className="text-brand-600" /> {booking.startTime} - {booking.endTime}
                       </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <button 
                    onClick={() => handleStatusUpdate(booking._id, 'REJECTED')}
                    className="flex-1 md:flex-none px-8 py-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100 dark:border-slate-700"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(booking._id, 'APPROVED')}
                    className="flex-1 md:flex-none px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Amenity Detail Modal */}
      {selectedAmenity && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl animate-in fade-in" onClick={() => setSelectedAmenity(null)} />
          <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
            <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10 gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-brand-600 rounded-3xl flex items-center justify-center text-white shadow-xl">
                  {getFacilityIcon(selectedAmenity.name)}
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">{selectedAmenity.name}</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase text-brand-600 tracking-widest flex items-center gap-1"><MapPin size={12} /> {selectedAmenity.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!isAdmin && (
                  <button 
                    onClick={() => setShowBookingForm(true)}
                    className="px-8 py-3.5 bg-brand-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95"
                  >
                    Request Slot
                  </button>
                )}
                <button onClick={() => setSelectedAmenity(null)} className="p-4 text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-3xl transition-all">
                  <X size={28} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30 dark:bg-slate-950/30">
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                   <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                     <CalendarDays size={16} /> Public Calendar
                   </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allBookings.filter(b => b.amenityId?._id === selectedAmenity._id && b.status === 'APPROVED').length > 0 ? (
                    allBookings.filter(b => b.amenityId?._id === selectedAmenity._id && b.status === 'APPROVED').map((booking: any) => (
                      <div key={booking._id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        <h5 className="text-lg font-black text-slate-900 dark:text-white mb-4">{booking.purpose}</h5>
                        <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-500">
                          <div className="flex items-center gap-2"><Calendar size={14} className="text-brand-600" /> {new Date(booking.date).toLocaleDateString()}</div>
                          <div className="flex items-center gap-2"><Clock size={14} className="text-brand-600" /> {booking.startTime}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 py-12 text-center text-slate-400 italic">No confirmed bookings for this facility.</div>
                  )}
                </div>

                <div className="p-8 bg-brand-50 dark:bg-brand-900/10 rounded-[2.5rem] border border-brand-100 dark:border-brand-800">
                   <h4 className="font-black text-brand-900 dark:text-brand-300 mb-2">Usage Policies</h4>
                   <p className="text-xs font-semibold text-brand-700 dark:text-brand-400 leading-relaxed mb-0">
                     Bookings must be made at least 48 hours in advance. Cancellation required 24 hours prior for a full deposit refund. 
                     Please ensure the area is cleaned after the event.
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Overlay */}
      {showBookingForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in" onClick={() => setShowBookingForm(false)} />
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 shadow-3xl border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-10">
               <div>
                 <h3 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">Reserve {selectedAmenity?.name}</h3>
                 <p className="text-[10px] font-black uppercase text-brand-600 tracking-widest mt-1">Fill event details to request a slot</p>
               </div>
               <button onClick={() => setShowBookingForm(false)} className="p-4 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"><X size={24} /></button>
            </div>
            
            <form className="space-y-6" onSubmit={handleBookingSubmit}>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-3 tracking-widest">Purpose of Booking</label>
                 <div className="relative">
                   <Star className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input 
                    type="text" placeholder="e.g. Birthday Celebration" 
                    className="w-full pl-14 pr-6 py-4.5 bg-slate-50 dark:bg-slate-800 rounded-[1.8rem] outline-none font-bold text-sm dark:text-white border-2 border-transparent focus:border-brand-600/20" 
                    value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})}
                    required 
                   />
                 </div>
               </div>

               <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-3 tracking-widest">Event Date</label>
                    <input 
                      type="date" className="w-full px-6 py-4.5 bg-slate-50 dark:bg-slate-800 rounded-[1.8rem] outline-none font-bold text-sm dark:text-white border-2 border-transparent focus:border-brand-600/20" 
                      value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                      required 
                    />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-3 tracking-widest">Start Time</label>
                    <input 
                      type="text" placeholder="10:00 AM" className="w-full px-6 py-4.5 bg-slate-50 dark:bg-slate-800 rounded-[1.8rem] outline-none font-bold text-sm dark:text-white border-2 border-transparent focus:border-brand-600/20" 
                      value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-3 tracking-widest">End Time</label>
                    <input 
                      type="text" placeholder="02:00 PM" className="w-full px-6 py-4.5 bg-slate-50 dark:bg-slate-800 rounded-[1.8rem] outline-none font-bold text-sm dark:text-white border-2 border-transparent focus:border-brand-600/20" 
                      value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})}
                      required 
                    />
                  </div>
               </div>

               <button className="w-full py-5 bg-brand-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl shadow-brand-500/30 transition-all active:scale-95">
                  <CheckCircle2 size={18} /> Send Booking Request
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const BadgeCheck = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" /><path d="m9 12 2 2 4-4" />
  </svg>
);

export default Facilities;
