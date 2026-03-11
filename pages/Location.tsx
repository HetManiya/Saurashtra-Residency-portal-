import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Compass, DoorOpen, TreePine, LayoutGrid, Star, Smartphone, Mail, ArrowUpRight, Sparkles, Loader2 } from 'lucide-react';
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
      // Silently handle error
    }
    setLoading(false);
  };

  const leftColWings = ['A-1', 'A-3', 'A-5', 'A-7', 'A-9', 'A-11', 'A-13', 'A-15', 'A-17', 'A-19', 'A-21', 'A-23'];
  const rightColWings = ['A-2', 'A-4', 'A-6', 'A-8', 'A-10', 'A-12', 'A-14', 'A-16', 'A-18', 'A-20', 'A-22', 'A-24'];

  const renderWing = (name: string) => {
    const wing = BUILDINGS.find(b => b.name === name);
    if (!wing) return null;

    const is1BHK = wing.type === '1BHK';

    return (
      <div key={wing.id} className="relative group">
        <button
          onMouseEnter={() => setHoveredWing(wing.name)}
          onMouseLeave={() => setHoveredWing(null)}
          onClick={() => navigate('/buildings')}
          className={`w-full aspect-[4/3] rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:z-10 ${
            is1BHK 
              ? 'border-blue-100 bg-blue-50 hover:border-blue-400 hover:bg-blue-100' 
              : 'border-indigo-100 bg-indigo-50 hover:border-indigo-400 hover:bg-indigo-100'
          }`}
        >
          <span className={`text-sm font-black ${is1BHK ? 'text-blue-600' : 'text-indigo-600'}`}>
            {wing.name}
          </span>
          <div className={`w-1.5 h-1.5 rounded-full ${is1BHK ? 'bg-blue-400' : 'bg-indigo-400'}`} />
        </button>
        
        {hoveredWing === wing.name && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap z-20 pointer-events-none">
            {wing.type} • 20 Units
            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pb-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 bg-brand-50 dark:bg-brand-900/20 px-3 py-1 rounded-full w-fit mb-3">
            <Compass size={14} className="text-brand-600 dark:text-brand-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">
              Residency Explorer
            </span>
          </div>
          <h3 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
            Residency <span className="text-brand-600">Site Plan</span>
          </h3>
          <div className="flex items-center gap-2 mt-2 text-slate-500 dark:text-slate-400">
            <MapPin size={18} className="text-brand-600" />
            <span className="font-medium">{SOCIETY_INFO.location}</span>
          </div>
        </div>
        <a 
          href={SOCIETY_INFO.googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 bg-slate-900 dark:bg-slate-800 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-colors shadow-lg"
        >
          <Navigation size={18} />
          View Actual Satellite Map
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center text-white">
                <LayoutGrid size={28} />
              </div>
              <div>
                <h5 className="text-2xl font-black text-slate-900 dark:text-white">Interactive Plot Layout</h5>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Digital Twin of Saurashtra Residency
                </span>
              </div>
            </div>

            <div className="relative bg-slate-50 dark:bg-slate-800/50 p-6 md:p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 min-h-[800px]">
              {/* Gates */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 z-20 shadow-lg">
                <DoorOpen size={18} className="text-green-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">Main Gate 1 (Pasodara Road)</span>
              </div>

              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 z-20 shadow-lg">
                <DoorOpen size={18} className="text-brand-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">Service Gate 2 (Canal Road)</span>
              </div>

              {/* Central Spine */}
              <div className="absolute inset-y-12 left-1/2 -translate-x-1/2 w-32 md:w-48 flex flex-col items-center justify-between py-12 z-10 pointer-events-none">
                <div className="pointer-events-auto w-full h-48 rounded-3xl bg-green-100 border-2 border-green-500/30 opacity-40 flex flex-col items-center justify-center transition-all duration-300 hover:opacity-60 hover:scale-105">
                  <TreePine size={32} className="text-green-600" />
                  <span className="text-[10px] font-black text-green-700 uppercase mt-2">Central Garden</span>
                </div>

                <div className="h-20 w-1 bg-slate-200 rounded-full" />

                <div className="pointer-events-auto w-full h-48 rounded-3xl bg-green-100 border-2 border-green-500/30 opacity-40 flex flex-col items-center justify-center transition-all duration-300 hover:opacity-60 hover:scale-105">
                  <TreePine size={32} className="text-green-600" />
                  <span className="text-[10px] font-black text-green-700 uppercase mt-2">Back Garden</span>
                </div>
              </div>

              {/* Wings Grid */}
              <div className="grid grid-cols-2 gap-24 md:gap-48 relative z-0">
                <div className="space-y-4">
                  {leftColWings.map(name => renderWing(name))}
                </div>
                <div className="space-y-4">
                  {rightColWings.map(name => renderWing(name))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-200 dark:border-blue-800/30 flex gap-4">
                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                  <Star size={20} />
                </div>
                <div>
                  <h6 className="text-sm font-black text-blue-700 dark:text-blue-300 uppercase mb-1">Elite Infrastructure</h6>
                  <p className="text-xs font-medium text-blue-600/80 dark:text-blue-300/70 leading-relaxed">
                    Saurashtra Residency features a planned layout with 40-feet internal RCC roads and separate underground water tanks for every 4 wings.
                  </p>
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-3xl border border-green-200 dark:border-green-800/30 flex gap-4">
                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-green-600 shadow-sm shrink-0">
                  <TreePine size={20} />
                </div>
                <div>
                  <h6 className="text-sm font-black text-green-700 dark:text-green-300 uppercase mb-1">Eco-Friendly Zones</h6>
                  <p className="text-xs font-medium text-green-600/80 dark:text-green-300/70 leading-relaxed">
                    Two massive gardens (Central & Back Garden) provide 12,000+ sq.ft of recreational green cover for all 480 families.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
            <h5 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-white">
              <Sparkles size={28} className="text-brand-600" /> 
              Neighborhood Intelligence
            </h5>
            {loading ? (
              <div className="py-12 text-center">
                <Loader2 size={40} className="animate-spin mx-auto mb-4 text-brand-600" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Grounding Search Results...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-lg text-slate-500 dark:text-slate-400 italic leading-relaxed">
                  "{localityInfo?.text || "Analyzing Pasodara neighborhood data..."}"
                </p>
                {localityInfo?.sources && localityInfo.sources.length > 0 && (
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">Verification Sources</span>
                    <div className="flex flex-wrap gap-3">
                      {localityInfo.sources.map((s: any, i: number) => (
                        <a 
                          key={i} 
                          href={s.web?.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                        >
                          {s.web?.title || `Ref ${i + 1}`}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 dark:bg-slate-800 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-brand-600 rounded-full opacity-10 blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-white rounded-2xl p-2 flex items-center justify-center">
                  <img src={BUILDER_INFO.logo} alt="Builder Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h5 className="text-xl font-black">{BUILDER_INFO.name}</h5>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-brand-500" />
                    <span className="text-[10px] font-black text-brand-300 uppercase tracking-widest">
                      Elite Developer • Est {BUILDER_INFO.founded}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-slate-400 italic leading-relaxed mb-8 text-sm">
                "{BUILDER_INFO.vision}"
              </p>

              <div className="pt-6 border-t border-white/10 mb-8">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Notable Portfolio</span>
                <div className="flex flex-wrap gap-2">
                  {BUILDER_INFO.projects.map((p, idx) => (
                    <span key={idx} className="px-2 py-1 rounded-lg bg-white/5 text-slate-400 text-xs font-bold">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <a 
                  href={`tel:${BUILDER_INFO.phone}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-brand-50 hover:text-brand-600 transition-colors"
                >
                  <Smartphone size={14} />
                  Call Developer
                </a>
                <a 
                  href={`mailto:${BUILDER_INFO.email}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/20 text-white font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-colors"
                >
                  <Mail size={14} />
                  Email Office
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest block mb-6">Spatial Legend</span>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">
                  <LayoutGrid size={20} />
                </div>
                <div>
                  <h6 className="text-sm font-black text-slate-900 dark:text-white">Blue Block</h6>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">1BHK Units (Wings A-1 to A-6)</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600">
                  <LayoutGrid size={20} />
                </div>
                <div>
                  <h6 className="text-sm font-black text-slate-900 dark:text-white">Indigo Block</h6>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">2BHK Units (Wings A-7 to A-24)</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600">
                  <TreePine size={20} />
                </div>
                <div>
                  <h6 className="text-sm font-black text-slate-900 dark:text-white">Green Zone</h6>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Central Recreational Parks</span>
                </div>
              </div>
            </div>
            <div className="h-px bg-slate-100 dark:bg-slate-800 my-6" />
            <button 
              onClick={() => navigate('/buildings')}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest hover:bg-brand-600 hover:text-white transition-colors"
            >
              Explore Individual Wings
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Location;
