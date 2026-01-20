
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Compass, ShieldCheck, Sparkles, Loader2, DoorOpen, TreePine, LayoutGrid, Building2, Info, Smartphone, Mail, Globe, Star, Users, ArrowUpRight } from 'lucide-react';
import { SOCIETY_INFO, BUILDER_INFO, BUILDINGS } from '../constants';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Location: React.FC = () => {
  const navigate = useNavigate();
  const [localityInfo, setLocalityInfo] = useState<{ text: string; sources: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [hoveredWing, setHoveredWing] = useState<string | null>(null);

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    setLoading(true);
    try {
      const info = await api.getLocalityInfo(`Saurashtra Residency Pasodara Surat 395013`);
      setLocalityInfo(info);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // Spatial Organization for Saurashtra Residency Pasodara
  // Wings A-1 to A-6 are front blocks near the main road.
  // We arrange them in a layout that mimics the aerial view.
  const leftColWings = ['A-1', 'A-3', 'A-5', 'A-7', 'A-9', 'A-11', 'A-13', 'A-15', 'A-17', 'A-19', 'A-21', 'A-23'];
  const rightColWings = ['A-2', 'A-4', 'A-6', 'A-8', 'A-10', 'A-12', 'A-14', 'A-16', 'A-18', 'A-20', 'A-22', 'A-24'];

  const renderWing = (name: string) => {
    const wing = BUILDINGS.find(b => b.name === name);
    if (!wing) return null;

    return (
      <button
        key={wing.id}
        onMouseEnter={() => setHoveredWing(wing.name)}
        onMouseLeave={() => setHoveredWing(null)}
        onClick={() => navigate('/buildings')}
        className={`relative w-full aspect-[4/3] rounded-2xl border-2 transition-all duration-500 flex flex-col items-center justify-center gap-1 group shadow-sm ${
          wing.type === '1BHK' 
            ? 'bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800' 
            : 'bg-indigo-50 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-800'
        } hover:scale-105 hover:z-10 hover:shadow-2xl hover:shadow-brand-500/20 active:scale-95`}
      >
        <span className={`text-sm font-black transition-colors ${
          wing.type === '1BHK' ? 'text-blue-600' : 'text-indigo-600'
        }`}>
          {wing.name}
        </span>
        {hoveredWing === wing.name && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest px-3 py-2 rounded-xl whitespace-nowrap z-20 animate-in fade-in slide-in-from-bottom-2">
            {wing.type} • 20 Units
          </div>
        )}
        <div className={`w-1.5 h-1.5 rounded-full ${wing.type === '1BHK' ? 'bg-blue-400' : 'bg-indigo-400'}`} />
      </button>
    );
  };

  return (
    <div className="space-y-16 animate-fade-up pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-full w-fit">
            <Compass size={14} className="animate-spin-slow" />
            <span className="text-[10px] font-black uppercase tracking-widest">Residency Explorer</span>
          </div>
          <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tighter">Residency <span className="text-brand-600">Site Plan</span></h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
            <MapPin size={18} className="text-brand-600" /> {SOCIETY_INFO.location}
          </p>
        </div>
        <div className="flex gap-4">
           <a 
            href={SOCIETY_INFO.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2 hover:bg-black transition-all active:scale-95"
          >
            <Navigation size={18} /> View Actual Satellite Map
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          {/* Spatial Map Component */}
          <section className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 premium-shadow">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center text-white">
                  <LayoutGrid size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Interactive Plot Layout</h3>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Digital Twin of Saurashtra Residency</p>
                </div>
              </div>
            </div>

            <div className="relative bg-slate-50 dark:bg-slate-800/50 p-8 md:p-12 rounded-[3.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 min-h-[800px]">
              {/* Entrance Gate 1 */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-3 bg-slate-900 text-white rounded-2xl flex items-center gap-3 shadow-2xl z-20">
                <DoorOpen size={18} className="text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">Main Gate 1 (Pasodara Road)</span>
              </div>

              {/* Central Spine with Gardens */}
              <div className="absolute inset-y-12 left-1/2 -translate-x-1/2 w-32 md:w-48 flex flex-col items-center justify-between py-20 z-10 pointer-events-none">
                {/* Central Garden */}
                <div className="group/garden pointer-events-auto bg-emerald-100 dark:bg-emerald-900/20 border-2 border-emerald-500/30 w-full h-48 rounded-[3rem] flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 transition-all hover:bg-emerald-200 dark:hover:bg-emerald-900/40">
                   <TreePine size={32} className="mb-2 animate-bounce-slow" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-center px-4">Central Garden</span>
                </div>

                <div className="h-20 w-1 bg-slate-200 dark:bg-slate-700 rounded-full" />

                {/* Back Garden */}
                <div className="group/garden pointer-events-auto bg-emerald-100 dark:bg-emerald-900/20 border-2 border-emerald-500/30 w-full h-48 rounded-[3rem] flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 transition-all hover:bg-emerald-200 dark:hover:bg-emerald-900/40">
                   <TreePine size={32} className="mb-2 animate-bounce-slow" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-center px-4">Back Garden</span>
                </div>
              </div>

              {/* Wing Blocks - Left and Right Corridors */}
              <div className="grid grid-cols-2 gap-x-48 md:gap-x-64 h-full relative z-0">
                {/* Left Column (A-1, A-3...) */}
                <div className="space-y-6">
                  {leftColWings.map(name => renderWing(name))}
                </div>

                {/* Right Column (A-2, A-4...) */}
                <div className="space-y-6">
                  {rightColWings.map(name => renderWing(name))}
                </div>
              </div>

              {/* Service Gate 2 */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 px-8 py-3 bg-slate-900 text-white rounded-2xl flex items-center gap-3 shadow-2xl z-20">
                <DoorOpen size={18} className="text-brand-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">Service Gate 2 (Canal Road)</span>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-6 bg-brand-50 dark:bg-brand-900/10 rounded-3xl border border-brand-100 dark:border-brand-800 flex items-start gap-4">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-brand-600 shadow-sm shrink-0">
                    <Star size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-brand-900 dark:text-brand-300 uppercase tracking-widest mb-1">Elite Infrastructure</h4>
                    <p className="text-xs font-medium text-brand-800 dark:text-brand-400 leading-relaxed">
                      Saurashtra Residency features a planned layout with 40-feet internal RCC roads and separate underground water tanks for every 4 wings.
                    </p>
                  </div>
               </div>
               <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-800 flex items-start gap-4">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-emerald-600 shadow-sm shrink-0">
                    <TreePine size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-emerald-900 dark:text-emerald-300 uppercase tracking-widest mb-1">Eco-Friendly Zones</h4>
                    <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400 leading-relaxed">
                      Two massive gardens (Central & Back Garden) provide 12,000+ sq.ft of recreational green cover for all 480 families.
                    </p>
                  </div>
               </div>
            </div>
          </section>

          {/* AI Intelligence */}
          <section className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 premium-shadow">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <Sparkles className="text-brand-600" size={28} /> Neighborhood Intelligence
            </h3>
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin mb-4" size={40} />
                <p className="font-bold text-[10px] uppercase tracking-widest">Grounding Search Results...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg font-medium whitespace-pre-wrap italic">
                  "{localityInfo?.text || "Analyzing Pasodara neighborhood data..."}"
                </p>
                {localityInfo?.sources && localityInfo.sources.length > 0 && (
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Verification Sources</p>
                    <div className="flex flex-wrap gap-3">
                      {localityInfo.sources.map((s: any, i: number) => (
                        <a key={i} href={s.web?.uri} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black text-brand-600 hover:bg-brand-600 hover:text-white transition-all shadow-sm">
                          {s.web?.title || `Ref ${i + 1}`}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Builder Profile and Quick Links */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
            
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white rounded-[2rem] p-1 shadow-2xl flex items-center justify-center overflow-hidden shrink-0">
                  <img src={BUILDER_INFO.logo} alt="Builder Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight leading-none mb-2">{BUILDER_INFO.name}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-400">Elite Developer • Est {BUILDER_INFO.founded}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-slate-400 font-medium leading-relaxed italic">
                  "{BUILDER_INFO.vision}"
                </p>
                <div className="pt-6 border-t border-white/10 space-y-4">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Notable Portfolio</p>
                  <div className="flex flex-wrap gap-2">
                    {BUILDER_INFO.projects.map((p, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-slate-300 border border-white/5">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 space-y-3">
                <a href={`tel:${BUILDER_INFO.phone}`} className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-brand-50 transition-all">
                  <Smartphone size={14} /> Call Developer
                </a>
                <a href={`mailto:${BUILDER_INFO.email}`} className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                  <Mail size={14} /> Email Office
                </a>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-600 mb-8">Spatial Legend</h4>
             <div className="space-y-6">
                <div className="flex items-center gap-5">
                   <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                     <LayoutGrid size={20} />
                   </div>
                   <div>
                     <p className="text-xs font-black dark:text-white">Blue Block</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">1BHK Units (Wings A-1 to A-6)</p>
                   </div>
                </div>
                <div className="flex items-center gap-5">
                   <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                     <LayoutGrid size={20} />
                   </div>
                   <div>
                     <p className="text-xs font-black dark:text-white">Indigo Block</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">2BHK Units (Wings A-7 to A-24)</p>
                   </div>
                </div>
                <div className="flex items-center gap-5">
                   <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                     <TreePine size={20} />
                   </div>
                   <div>
                     <p className="text-xs font-black dark:text-white">Green Zone</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Central Recreational Parks</p>
                   </div>
                </div>
             </div>
             <div className="mt-10 pt-8 border-t border-slate-50 dark:border-slate-800">
               <button 
                onClick={() => navigate('/buildings')}
                className="w-full py-4 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-600 hover:text-white transition-all"
               >
                 Explore Individual Wings <ArrowUpRight size={14} />
               </button>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Location;
