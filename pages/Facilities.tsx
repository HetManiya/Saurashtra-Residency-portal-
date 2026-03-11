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

  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);

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
      setSelectedBookings([]);
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

  const handlePriorityUpdate = async (id: string, priority: string) => {
    try {
      await api.updateAmenityBookingStatus(id, undefined as any, priority);
      await loadData();
    } catch (e) {
      alert("Failed to update priority.");
    }
  };

  const handleBulkAction = async (status: string) => {
    if (selectedBookings.length === 0) return;
    try {
      await api.bulkUpdateAmenityBookings(selectedBookings, status);
      await loadData();
    } catch (e) {
      alert("Failed to perform bulk action.");
    }
  };

  const toggleBookingSelection = (id: string) => {
    setSelectedBookings(prev => 
      prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
    );
  };

  const toggleAllBookings = () => {
    if (selectedBookings.length === adminBookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(adminBookings.map(b => b._id || b.id));
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
    <div className="pb-12 animate-fade-in crt-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-6 border-b-4 border-cyan-500/30">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-cyan-400 mb-2 glitch-text" data-text="Community Amenities">
            Community <span className="text-magenta-500">Amenities</span>
          </h1>
          <p className="text-cyan-600 font-bold font-mono uppercase text-sm">
            Book premium society facilities and view public events
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="bg-black p-1 border-2 border-cyan-500/30 inline-flex">
            {['Explore', 'My Requests', ...(isAdmin ? [`All Bookings`] : [])].map((tab, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveTab(idx);
                  setFilterStatus('ALL');
                }}
                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === idx 
                    ? 'bg-cyan-500 text-black shadow-[4px_4px_0px_#ff00ff]' 
                    : 'text-cyan-700 hover:text-cyan-400'
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
              className="bg-black border-2 border-cyan-500 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 focus:border-magenta-500 outline-none transition-all"
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
              className="bg-magenta-500 text-white px-6 py-3 border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-black hover:text-magenta-500 hover:border-magenta-500 transition-all shadow-[4px_4px_0px_#00ffff] active:scale-95 transform duration-100 flex items-center gap-2"
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
              className="group bg-black border-4 border-cyan-500/30 overflow-hidden hover:border-magenta-500 hover:shadow-[10px_10px_0px_#00ffff] transition-all duration-300 flex flex-col h-full"
            >
              <div className="relative h-60 overflow-hidden border-b-4 border-cyan-500/30">
                <img 
                  src={item.photoUrl || item.image || `https://picsum.photos/seed/${item.name}/800/600`} 
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale hover:grayscale-0"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
                <div className="absolute bottom-6 left-6 flex items-center gap-4">
                  <div className="w-12 h-12 border-2 border-cyan-500 bg-black flex items-center justify-center text-cyan-400 shadow-[4px_4px_0px_#ff00ff]">
                    {getFacilityIcon(item.name)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-cyan-400 leading-tight uppercase tracking-tighter glitch-text" data-text={item.name}>{item.name}</h3>
                    <span className="text-[10px] font-black text-magenta-500 uppercase tracking-widest">
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-cyan-700 font-bold font-mono text-sm leading-relaxed mb-6 flex-1 uppercase">
                  {item.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-black p-4 border-2 border-cyan-500/30">
                    <span className="text-[10px] font-black text-cyan-900 uppercase tracking-widest block mb-1">Capacity</span>
                    <span className="text-sm font-black text-cyan-400">{item.capacity} guests</span>
                  </div>
                  <div className="bg-black p-4 border-2 border-cyan-500/30">
                    <span className="text-[10px] font-black text-cyan-900 uppercase tracking-widest block mb-1">Rate</span>
                    <span className="text-sm font-black text-magenta-500">₹{item.hourlyRate}/hr</span>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedAmenity(item)}
                  className="w-full bg-cyan-500 text-black py-4 border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-black hover:text-cyan-500 hover:border-cyan-500 transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0px_#ff00ff]"
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
            <div className="text-center py-20 bg-black border-4 border-cyan-500/30 border-dashed">
              <Ticket size={48} className="mx-auto text-cyan-900 mb-4" />
              <h3 className="text-xl font-black text-cyan-400 mb-1 uppercase tracking-tighter glitch-text" data-text="No Bookings Found">No Bookings Found</h3>
              <p className="text-cyan-700 font-bold font-mono text-sm uppercase">You haven't requested any facilities yet.</p>
            </div>
          ) : (
            myBookings.map((booking, index) => (
              <div key={booking.id || booking._id || index} className="bg-black p-6 border-4 border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-magenta-500 hover:shadow-[8px_8px_0px_#00ffff] transition-all">
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="w-16 h-16 border-2 border-cyan-500 bg-black flex items-center justify-center text-cyan-400 shrink-0 shadow-[4px_4px_0px_#ff00ff]">
                    {getFacilityIcon(booking.amenityId?.name || '')}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-cyan-400 mb-2 uppercase tracking-tight">{booking.purpose}</h4>
                    <div className="flex flex-wrap gap-4 text-xs font-bold text-cyan-700 uppercase tracking-wider font-mono">
                      <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(booking.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {booking.startTime} - {booking.endTime}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-4 py-2 border-2 text-[10px] font-black uppercase tracking-widest ${
                  booking.status === 'APPROVED' ? 'border-cyan-500 text-cyan-400 shadow-[2px_2px_0px_#ff00ff]' :
                  booking.status === 'PENDING' ? 'border-magenta-500 text-magenta-500 animate-pulse' :
                  'border-red-500 text-red-500'
                }`}>
                  {booking.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 2 && (
        <div className="space-y-4">
          {adminBookings.length > 0 && (
            <div className="flex justify-between items-center bg-black p-4 border-2 border-cyan-500/30 shadow-[4px_4px_0px_#ff00ff]">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={selectedBookings.length === adminBookings.length && adminBookings.length > 0}
                  onChange={toggleAllBookings}
                  className="w-5 h-5 border-2 border-cyan-500 bg-black text-magenta-500 focus:ring-magenta-500"
                />
                <span className="text-sm font-black text-cyan-400 uppercase tracking-widest">
                  Select All ({selectedBookings.length} selected)
                </span>
              </div>
              {selectedBookings.length > 0 && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleBulkAction('APPROVED')}
                    className="bg-cyan-500 text-black px-4 py-2 border-2 border-black text-xs font-black uppercase tracking-widest hover:bg-black hover:text-cyan-500 hover:border-cyan-500 transition-all shadow-[2px_2px_0px_#ff00ff]"
                  >
                    Approve Selected
                  </button>
                  <button 
                    onClick={() => handleBulkAction('REJECTED')}
                    className="bg-magenta-500 text-white px-4 py-2 border-2 border-black text-xs font-black uppercase tracking-widest hover:bg-black hover:text-magenta-500 hover:border-magenta-500 transition-all shadow-[2px_2px_0px_#00ffff]"
                  >
                    Reject Selected
                  </button>
                </div>
              )}
            </div>
          )}
          {adminBookings.length === 0 ? (
            <div className="text-center py-20 bg-black border-4 border-cyan-500/30 border-dashed">
              <BadgeCheck size={48} className="mx-auto text-cyan-900 mb-4" />
              <h3 className="text-xl font-black text-cyan-400 mb-1 uppercase tracking-tighter glitch-text" data-text="Queue Clear">Queue Clear</h3>
              <p className="text-cyan-700 font-bold font-mono text-sm uppercase">No bookings found for the selected filter.</p>
            </div>
          ) : (
            adminBookings.map((booking, index) => (
              <div key={booking.id || booking._id || index} className="bg-black p-6 border-4 border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-magenta-500 hover:shadow-[10px_10px_0px_#00ffff] transition-all">
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <input 
                    type="checkbox" 
                    checked={selectedBookings.includes(booking._id || booking.id)}
                    onChange={() => toggleBookingSelection(booking._id || booking.id)}
                    className="w-5 h-5 border-2 border-cyan-500 bg-black text-magenta-500 focus:ring-magenta-500"
                  />
                  <div className="w-20 h-20 border-2 border-cyan-500 bg-black flex items-center justify-center text-cyan-400 shrink-0 shadow-[4px_4px_0px_#ff00ff]">
                    {getFacilityIcon(booking.amenityId?.name || '')}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-xl font-black text-cyan-400 uppercase tracking-tight">{booking.purpose}</h4>
                      <span className="bg-black border border-cyan-500/30 text-cyan-700 px-2 py-1 text-[10px] font-black uppercase tracking-wider font-mono">
                        Ref: {(booking._id || booking.id).slice(-6)}
                      </span>
                      <select
                        value={booking.priority || 'Medium'}
                        onChange={(e) => handlePriorityUpdate(booking._id || booking.id, e.target.value)}
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 border-2 outline-none cursor-pointer transition-all ${
                          booking.priority === 'High' ? 'bg-red-500 text-white border-black' :
                          booking.priority === 'Low' ? 'bg-cyan-500 text-black border-black' :
                          'bg-magenta-500 text-white border-black'
                        }`}
                      >
                        <option value="High">High Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="Low">Low Priority</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-cyan-700 uppercase tracking-wider font-mono">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-magenta-500" />
                        {booking.userId?.name || 'User'} (Unit {booking.flatId})
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-magenta-500" />
                        {new Date(booking.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-magenta-500" />
                        {booking.startTime} - {booking.endTime}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto items-center">
                  <span className={`px-4 py-2 border-2 text-[10px] font-black uppercase tracking-widest mr-4 ${
                    booking.status === 'APPROVED' ? 'border-cyan-500 text-cyan-400 shadow-[2px_2px_0px_#ff00ff]' :
                    booking.status === 'PENDING' ? 'border-magenta-500 text-magenta-500 animate-pulse' :
                    'border-red-500 text-red-500'
                  }`}>
                    {booking.status}
                  </span>
                  {booking.status === 'PENDING' && (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate(booking._id || booking.id, 'REJECTED')}
                        className="flex-1 md:flex-none border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-6 py-3 font-black text-xs uppercase tracking-widest transition-all"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(booking._id || booking.id, 'APPROVED')}
                        className="flex-1 md:flex-none bg-cyan-500 text-black hover:bg-black hover:text-cyan-500 border-2 border-black hover:border-cyan-500 px-6 py-3 font-black text-xs uppercase tracking-widest transition-all shadow-[4px_4px_0px_#ff00ff]"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black w-full max-w-4xl max-h-[90vh] overflow-y-auto border-4 border-magenta-500 shadow-[12px_12px_0px_#00ffff] crt-screen"
            >
              <div className="p-6 border-b-4 border-cyan-500/30 flex justify-between items-center sticky top-0 bg-black/90 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 border-2 border-cyan-500 bg-black text-cyan-400 flex items-center justify-center shadow-[4px_4px_0px_#ff00ff]">
                    {getFacilityIcon(selectedAmenity.name)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-cyan-400 leading-none mb-1 uppercase tracking-tighter glitch-text" data-text={selectedAmenity.name}>{selectedAmenity.name}</h2>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-magenta-500">
                      <MapPin size={12} /> {selectedAmenity.status}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!isAdmin && (
                    <button 
                      onClick={() => setShowBookingForm(true)}
                      className="bg-cyan-500 text-black px-6 py-3 border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-black hover:text-cyan-500 hover:border-cyan-500 transition-all shadow-[4px_4px_0px_#ff00ff]"
                    >
                      Request Slot
                    </button>
                  )}
                  <button onClick={() => setSelectedAmenity(null)} className="p-2 text-magenta-500 hover:bg-magenta-500 hover:text-black border-2 border-transparent hover:border-black transition-all">
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest flex items-center gap-2">
                      <CalendarDays size={16} /> Availability Calendar
                    </span>
                    <div className="flex items-center gap-4 bg-black border-2 border-cyan-500/30 p-1">
                      <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 hover:bg-cyan-500 hover:text-black transition-all">
                        <ChevronRight size={16} className="rotate-180" />
                      </button>
                      <span className="text-xs font-black uppercase tracking-widest min-w-[100px] text-center text-cyan-400">
                        {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </span>
                      <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 hover:bg-cyan-500 hover:text-black transition-all">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-black p-6 border-4 border-cyan-500/30 shadow-[8px_8px_0px_#ff00ff]">
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="text-center text-[10px] font-black text-cyan-700 uppercase tracking-widest">{d}</div>
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
                            className={`aspect-square flex flex-col items-center justify-center border-2 transition-all ${
                              isSelected
                                ? 'bg-magenta-500 border-black text-white shadow-[4px_4px_0px_#00ffff] scale-105 z-10'
                                : isBooked 
                                  ? 'bg-black border-red-500 text-red-500 opacity-80 hover:bg-red-500 hover:text-white' 
                                  : 'bg-black border-cyan-500/30 text-cyan-400 hover:border-cyan-500'
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
                  <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest block mb-4">
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
                        <div key={booking.id || booking._id || index} className="bg-black p-4 border-2 border-cyan-500/30 shadow-[4px_4px_0px_#ff00ff]">
                          <h5 className="text-sm font-black text-cyan-400 mb-2 uppercase tracking-tight">{booking.purpose}</h5>
                          <div className="flex gap-4 text-[10px] font-bold text-cyan-700 uppercase tracking-wider font-mono">
                            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(booking.date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> {booking.startTime} - {booking.endTime}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-8 text-cyan-900 text-xs font-black uppercase tracking-widest italic">
                        {selectedDate ? 'No bookings for this date.' : 'No confirmed bookings for this facility.'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-magenta-500/10 border-4 border-magenta-500 p-6 shadow-[6px_6px_0px_#00ffff]">
                  <h4 className="text-sm font-black text-magenta-500 uppercase tracking-widest mb-2">Usage Policies</h4>
                  <p className="text-xs font-bold text-cyan-600 leading-relaxed font-mono uppercase">
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
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-black w-full max-w-lg border-4 border-magenta-500 shadow-[12px_12px_0px_#00ffff] overflow-hidden crt-screen"
            >
              <div className="p-6 border-b-4 border-cyan-500/30 flex justify-between items-center bg-black">
                <div>
                  <h2 className="text-2xl font-black text-cyan-400 tracking-tight uppercase glitch-text" data-text="Reserve Slot">Reserve Slot</h2>
                  <p className="text-[10px] font-black text-magenta-500 uppercase tracking-widest">Fill event details</p>
                </div>
                <button onClick={() => setShowBookingForm(false)} className="p-2 text-magenta-500 hover:bg-magenta-500 hover:text-black border-2 border-transparent hover:border-black transition-all">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleBookingSubmit} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-2 block ml-1">Select Facility</label>
                  <select
                    value={formData.amenityId || selectedAmenity?._id || ''}
                    onChange={(e) => setFormData({...formData, amenityId: e.target.value})}
                    required
                    className="w-full bg-black border-2 border-cyan-500 px-4 py-3 text-sm font-bold text-cyan-400 focus:border-magenta-500 outline-none transition-all"
                  >
                    <option value="" disabled>Choose an amenity</option>
                    {amenities.map(a => (
                      <option key={a._id} value={a._id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-2 block ml-1">Purpose</label>
                  <div className="relative">
                    <Star size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700" />
                    <input 
                      type="text"
                      placeholder="e.g. Birthday Celebration"
                      required
                      value={formData.purpose}
                      onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                      className="w-full bg-black border-2 border-cyan-500 pl-12 pr-4 py-3 text-sm font-bold text-cyan-400 placeholder:text-cyan-900 focus:border-magenta-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-2 block ml-1">Date</label>
                    <input 
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-black border-2 border-cyan-500 px-4 py-3 text-sm font-bold text-cyan-400 focus:border-magenta-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-2 block ml-1">Start Time</label>
                    <input 
                      type="time"
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      className="w-full bg-black border-2 border-cyan-500 px-4 py-3 text-sm font-bold text-cyan-400 focus:border-magenta-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-2 block ml-1">Duration (Hrs)</label>
                  <input 
                    type="number"
                    min="1"
                    max="24"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                    className="w-full bg-black border-2 border-cyan-500 px-4 py-3 text-sm font-bold text-cyan-400 focus:border-magenta-500 outline-none transition-all"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-magenta-500 text-white py-4 border-2 border-black font-black text-sm uppercase tracking-widest hover:bg-black hover:text-magenta-500 hover:border-magenta-500 transition-all shadow-[6px_6px_0px_#00ffff] active:scale-95 transform duration-100 flex items-center justify-center gap-2"
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
