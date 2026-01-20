
import React, { useState } from 'react';
import { 
  Sofa, TreePine, Coffee, Star, MapPin, Calendar, Clock, ChevronRight, Users, 
  X, ShieldCheck, User, Info, CheckCircle2, Ticket, PartyPopper, Clapperboard, CalendarDays
} from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';
import { SOCIETY_INFO, FACILITY_BOOKINGS } from '../constants';
import { AmenityBooking } from '../types';

const Facilities: React.FC = () => {
  const { t } = useLanguage();
  const [selectedAmenity, setSelectedAmenity] = useState<any | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const getAmenityBookings = (id: number) => {
    return FACILITY_BOOKINGS.filter(b => b.facilityId === id);
  };

  const getFacilityIcon = (id: number) => {
    switch (id) {
      case 1: return <PartyPopper size={24} />;
      case 2: return <TreePine size={24} />;
      case 3: return <Clapperboard size={24} />;
      default: return <Sofa size={24} />;
    }
  };

  return (
    <div className="space-y-12 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tighter">{t('facilities')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Book premium society amenities and view community events schedule</p>
        </div>
      </div>

      <div className="row g-4">
        {SOCIETY_INFO.amenities.map((item: any) => (
          <div key={item.id} className="col-12 col-lg-4">
            <div className="group bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm bento-card h-100 flex flex-col">
              <div className="h-64 relative overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20">
                    {getFacilityIcon(item.id)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white mb-0">{item.name}</h3>
                    <span className="text-[10px] font-black uppercase text-brand-400 tracking-widest">{item.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-10 flex-1 flex flex-col">
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                  {item.desc}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{t('residents')}</p>
                    <p className="text-sm font-black dark:text-white mb-0">Max {item.capacity}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Bookings</p>
                    <p className="text-sm font-black dark:text-white mb-0">{getAmenityBookings(item.id).length} Active</p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedAmenity(item)}
                  className="mt-auto w-full py-5 bg-brand-600 text-white rounded-[1.8rem] font-black text-[11px] uppercase tracking-widest hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20 flex items-center justify-center gap-3 active:scale-95"
                >
                  {t('book_now')} <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Amenity Schedule & Details Modal */}
      {selectedAmenity && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl animate-in fade-in" onClick={() => setSelectedAmenity(null)} />
          <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10 gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-brand-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-brand-500/20">
                  {getFacilityIcon(selectedAmenity.id)}
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">{selectedAmenity.name} Schedule</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase text-brand-600 tracking-widest flex items-center gap-1"><MapPin size={12} /> {selectedAmenity.location}</span>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1"><Users size={12} /> Capacity: {selectedAmenity.capacity}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowBookingForm(true)}
                  className="px-8 py-3.5 bg-brand-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95"
                >
                  Request New Slot
                </button>
                <button onClick={() => setSelectedAmenity(null)} className="p-4 text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-3xl transition-all">
                  <X size={28} />
                </button>
              </div>
            </div>

            {/* Content: List of Bookings with Full Details */}
            <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30 dark:bg-slate-950/30">
              <div className="space-y-10">
                
                <div className="flex items-center justify-between">
                   <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                     <CalendarDays size={16} /> Upcoming Bookings & Community Events
                   </h4>
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                         <span className="text-[9px] font-black uppercase text-slate-500">Confirmed</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                         <span className="text-[9px] font-black uppercase text-slate-500">Community Allowed</span>
                      </div>
                   </div>
                </div>

                <div className="row g-4">
                  {getAmenityBookings(selectedAmenity.id).length > 0 ? (
                    getAmenityBookings(selectedAmenity.id).map((booking: AmenityBooking) => (
                      <div key={booking.id} className="col-12 col-xl-6">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-brand-600 transition-all relative overflow-hidden">
                          {booking.isPublic && (
                            <div className="absolute top-0 right-0 px-5 py-2 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-2xl flex items-center gap-2">
                               <ShieldCheck size={12} /> Open to Community
                            </div>
                          )}
                          
                          <div className="flex flex-col gap-6">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <h5 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{booking.purpose}</h5>
                                <p className="text-xs font-bold text-brand-600">Hosted by {booking.userName} • Unit {booking.unitNumber}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-brand-600 shadow-sm">
                                  <Calendar size={18} />
                                </div>
                                <div>
                                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Event Date</p>
                                  <p className="text-sm font-black dark:text-white">{new Date(booking.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
                                </div>
                              </div>
                              <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-brand-600 shadow-sm">
                                  <Clock size={18} />
                                </div>
                                <div>
                                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Time Slot</p>
                                  <p className="text-sm font-black dark:text-white">{booking.startTime} - {booking.endTime}</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                               <div className="flex items-center gap-3">
                                  <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 overflow-hidden bg-slate-100">
                                         <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=member-${i}-${booking.id}`} alt="Attending" />
                                      </div>
                                    ))}
                                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-brand-50 flex items-center justify-center text-[10px] font-black text-brand-600">
                                      +{booking.attendees - 3}
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Expected Attendees</span>
                               </div>
                               <button className="px-6 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-50 hover:text-brand-600 transition-all border border-slate-100 dark:border-slate-700">
                                 Full Guest List
                               </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-12 py-20 flex flex-col items-center justify-center text-center">
                       <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
                          <Ticket size={40} />
                       </div>
                       <h5 className="font-black text-slate-900 dark:text-white mb-1">No Active Bookings</h5>
                       <p className="text-sm text-slate-500">This facility is fully available for the next 7 days.</p>
                    </div>
                  )}
                </div>

                {/* Policies Section */}
                <div className="p-8 bg-brand-50 dark:bg-brand-900/10 rounded-[2.5rem] border border-brand-100 dark:border-brand-800 flex flex-col md:flex-row items-center gap-8">
                   <div className="p-6 bg-white dark:bg-slate-900 rounded-[1.8rem] text-brand-600 shadow-xl shadow-brand-500/10 shrink-0">
                      <ShieldCheck size={40} />
                   </div>
                   <div className="flex-grow-1 text-center md:text-left">
                      <h4 className="font-black text-brand-900 dark:text-brand-300 mb-2">Booking Guidelines</h4>
                      <p className="text-xs font-semibold text-brand-700 dark:text-brand-400 leading-relaxed mb-0">
                        Residents must maintain a maximum sound level after 10:00 PM. A security deposit of ₹2,000 is required for parties with more than 50 attendees. 
                        Please ensure the facility is vacated 15 minutes before the slot end time for cleaning.
                      </p>
                   </div>
                   <button className="px-10 py-4 bg-brand-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-brand-500/20 whitespace-nowrap">
                     Download Rules
                   </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simplified Booking Form Overlay */}
      {showBookingForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowBookingForm(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-3xl border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black tracking-tighter">Request Slot</h3>
               <button onClick={() => setShowBookingForm(false)} className="p-2 text-slate-400 hover:text-slate-900"><X size={24} /></button>
            </div>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setShowBookingForm(false); alert("Request sent to Committee!"); }}>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Event Purpose</label>
                 <input type="text" placeholder="e.g. Daughter's Reception" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold dark:text-white" required />
               </div>
               <div className="row g-3">
                  <div className="col-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Expected Guests</label>
                      <input type="number" placeholder="50" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold dark:text-white" required />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Event Date</label>
                      <input type="date" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold dark:text-white" required />
                    </div>
                  </div>
               </div>
               <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                     <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="communityEvent" />
                     </div>
                     <label className="text-xs font-black uppercase text-slate-500 mb-0" htmlFor="communityEvent">Public Event (Community Welcome)</label>
                  </div>
               </div>
               <button className="w-full py-5 bg-brand-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl">
                  <CheckCircle2 size={18} /> Submit Request
               </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Facilities;
