import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sofa, TreePine, Coffee, Star, MapPin, Calendar, Clock, ChevronRight, Users, 
  X, ShieldCheck, User, Info, CheckCircle2, Ticket, PartyPopper, Clapperboard, CalendarDays,
  History, Settings2, Trash2, Loader2, AlertCircle, Sparkles, Building, Plus, BadgeCheck
} from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';

const Facilities: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [amenities, setAmenities] = useState<any[]>([]);
  const [selectedAmenity, setSelectedAmenity] = useState<any | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    purpose: '',
    date: '',
    startTime: '10:00',
    duration: 2,
    amenityId: '',
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
      // Silently handle error
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'COMMITTEE';

  const myBookings = useMemo(() => {
    if (!user) return [];
    let filtered = allBookings.filter(b => b.userId === user.id || b.flatId === user.flatId);
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(b => b.status === filterStatus);
    }
    return filtered;
  }, [allBookings, user, filterStatus]);

  const adminBookings = useMemo(() => {
    let filtered = allBookings;
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(b => b.status === filterStatus);
    }
    return filtered;
  }, [allBookings, filterStatus]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmenity || !user) return;

    try {
      // Calculate endTime based on startTime and duration
      const [hours, minutes] = formData.startTime.split(':').map(Number);
      const endHours = (hours + formData.duration) % 24;
      const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      const newBooking = await api.createAmenityBooking({
        amenityId: formData.amenityId || selectedAmenity._id,
        purpose: formData.purpose,
        date: formData.date,
        startTime: formData.startTime,
        endTime: endTime,
        duration: formData.duration,
      });

      setAllBookings(prev => [newBooking, ...prev]);
      
      setShowBookingForm(false);
      setFormData({ purpose: '', date: '', startTime: '10:00', duration: 2, amenityId: '' });
      alert("Booking request submitted successfully! Awaiting committee approval.");
    } catch (e: any) {
      alert(e.message || "Failed to submit booking.");
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'PENDING': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      case 'REJECTED': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  if (loading && amenities.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 size={40} className="animate-spin text-brand-600 mb-4" />
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Syncing Amenities...
        </span>
      </div>
    );
  }

  return (
    <div className="pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-2">
            Community <span className="text-brand-600">Amenities</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Book premium society facilities and view public events
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl inline-flex">
            {['Explore', 'My Requests', ...(isAdmin ? [`All Bookings`] : [])].map((tab, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveTab(idx);
                  setFilterStatus('ALL');
                }}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === idx 
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {(activeTab === 1 || activeTab === 2) && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="COMPLETED">Completed</option>
            </select>
          )}
          {!isAdmin && (
            <button 
              onClick={() => {
                setSelectedAmenity(amenities[0] || null);
                setShowBookingForm(true);
              }}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg shadow-green-600/20 active:scale-95 transform duration-100"
            >
              <Plus size={18} />
              Quick Book
            </button>
          )}
        </div>
      </div>

      {activeTab === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {amenities.map((item: any, index: number) => (
            <div 
              key={item.id || item._id || index}
              className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full"
            >
              <div className="relative h-60 overflow-hidden">
                <img 
                  src={item.photoUrl || item.image || `https://picsum.photos/seed/${item.name}/800/600`} 
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <div className="absolute bottom-6 left-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                    {getFacilityIcon(item.name)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white leading-tight">{item.name}</h3>
                    <span className="text-[10px] font-black text-brand-300 uppercase tracking-widest">
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                  {item.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Capacity</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{item.capacity} guests</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Rate</span>
                    <span className="text-sm font-black text-green-600 dark:text-green-400">₹{item.hourlyRate}/hr</span>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedAmenity(item)}
                  className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-600 dark:hover:bg-brand-400 hover:text-white transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg"
                >
                  View Details <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 1 && (
        <div className="space-y-4">
          {myBookings.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 border-dashed">
              <Ticket size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">No Bookings Found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">You haven't requested any facilities yet.</p>
            </div>
          ) : (
            myBookings.map((booking, index) => (
              <div key={booking.id || booking._id || index} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                    {getFacilityIcon(booking.amenityId?.name || '')}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">{booking.purpose}</h4>
                    <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(booking.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {booking.startTime} - {booking.endTime}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 2 && (
        <div className="space-y-4">
          {adminBookings.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 border-dashed">
              <BadgeCheck size={48} className="mx-auto text-emerald-200 mb-4" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">Queue Clear</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">No bookings found for the selected filter.</p>
            </div>
          ) : (
            adminBookings.map((booking, index) => (
              <div key={booking.id || booking._id || index} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                    {getFacilityIcon(booking.amenityId?.name || '')}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-xl font-black text-slate-900 dark:text-white">{booking.purpose}</h4>
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider">
                        Ref: {booking._id.slice(-6)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-brand-500" />
                        {booking.userId?.name || 'User'} (Unit {booking.flatId})
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-brand-500" />
                        {new Date(booking.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-brand-500" />
                        {booking.startTime} - {booking.endTime}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto items-center">
                  <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest mr-4 ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                  {booking.status === 'PENDING' && (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate(booking._id, 'REJECTED')}
                        className="flex-1 md:flex-none border border-red-200 text-red-600 hover:bg-red-50 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-colors"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(booking._id, 'APPROVED')}
                        className="flex-1 md:flex-none bg-green-600 text-white hover:bg-green-700 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-colors shadow-lg shadow-green-600/20"
                      >
                        Approve
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Amenity Detail Modal */}
      <AnimatePresence>
        {selectedAmenity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-600/20">
                    {getFacilityIcon(selectedAmenity.name)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{selectedAmenity.name}</h2>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">
                      <MapPin size={12} /> {selectedAmenity.status}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!isAdmin && (
                    <button 
                      onClick={() => setShowBookingForm(true)}
                      className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-600 dark:hover:bg-brand-400 hover:text-white transition-colors"
                    >
                      Request Slot
                    </button>
                  )}
                  <button onClick={() => setSelectedAmenity(null)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <CalendarDays size={16} /> Availability Calendar
                    </span>
                    <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                      <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <ChevronRight size={16} className="rotate-180" />
                      </button>
                      <span className="text-xs font-black uppercase tracking-widest min-w-[100px] text-center">
                        {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </span>
                      <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} />
                      ))}
                      {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() }).map((_, i) => {
                        const day = i + 1;
                        const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
                        const isBooked = allBookings.some(b => b.amenityId?._id === selectedAmenity?._id && b.status === 'APPROVED' && b.date.startsWith(dateStr));
                        const isSelected = selectedDate === dateStr;
                        return (
                          <button 
                            key={day}
                            onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                            className={`aspect-square rounded-xl flex flex-col items-center justify-center border-2 transition-all ${
                              isSelected
                                ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-600/30 scale-105 z-10'
                                : isBooked 
                                  ? 'bg-red-50 border-red-200 text-red-600 opacity-80 hover:bg-red-100' 
                                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white hover:border-brand-300'
                            }`}
                          >
                            <span className="text-xs font-black">{day}</span>
                            {isBooked && <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-red-500'}`} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">
                    {selectedDate ? `Bookings on ${new Date(selectedDate).toLocaleDateString()}` : 'All Confirmed Bookings'}
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allBookings.filter(b => 
                      b.amenityId?._id === selectedAmenity?._id && 
                      b.status === 'APPROVED' &&
                      (!selectedDate || b.date.startsWith(selectedDate))
                    ).length > 0 ? (
                      allBookings.filter(b => 
                        b.amenityId?._id === selectedAmenity?._id && 
                        b.status === 'APPROVED' &&
                        (!selectedDate || b.date.startsWith(selectedDate))
                      ).map((booking: any, index: number) => (
                        <div key={booking.id || booking._id || index} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                          <h5 className="text-sm font-black text-slate-900 dark:text-white mb-2">{booking.purpose}</h5>
                          <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(booking.date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> {booking.startTime} - {booking.endTime}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-8 text-slate-400 text-xs font-medium italic">
                        {selectedDate ? 'No bookings for this date.' : 'No confirmed bookings for this facility.'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-brand-50 dark:bg-brand-900/10 p-6 rounded-[2rem] border border-brand-100 dark:border-brand-900/20">
                  <h4 className="text-sm font-black text-brand-700 dark:text-brand-400 uppercase tracking-widest mb-2">Usage Policies</h4>
                  <p className="text-xs font-medium text-brand-600 dark:text-brand-300 leading-relaxed">
                    Bookings must be made at least 48 hours in advance. Cancellation required 24 hours prior for a full deposit refund. 
                    Please ensure the area is cleaned after the event.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking Form Overlay */}
      <AnimatePresence>
        {showBookingForm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Reserve Slot</h2>
                  <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Fill event details</p>
                </div>
                <button onClick={() => setShowBookingForm(false)} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleBookingSubmit} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Select Facility</label>
                  <select
                    value={formData.amenityId || selectedAmenity?._id || ''}
                    onChange={(e) => setFormData({...formData, amenityId: e.target.value})}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    <option value="" disabled>Choose an amenity</option>
                    {amenities.map(a => (
                      <option key={a._id} value={a._id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Purpose</label>
                  <div className="relative">
                    <Star size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="e.g. Birthday Celebration"
                      required
                      value={formData.purpose}
                      onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Date</label>
                    <input 
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Start Time</label>
                    <input 
                      type="time"
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Duration (Hrs)</label>
                  <input 
                    type="number"
                    min="1"
                    max="24"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-brand-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-700 transition-colors shadow-xl shadow-brand-600/20 active:scale-95 transform duration-100 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  Send Booking Request
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Facilities;
