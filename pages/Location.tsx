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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-6 border-b-2 border-magenta-500/30">
        <div>
          <div className="flex items-center gap-2 bg-black border border-cyan-500 px-3 py-1 rounded-none w-fit mb-3 shadow-[2px_2px_0px_#00ffff]">
            <Compass size={14} className="text-cyan-500" />
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-cyan-500">
              Residency Explorer
            </span>
          </div>
          <h3 className="text-5xl font-black tracking-tighter text-cyan-400 uppercase glitch-text">
            Residency <span className="text-magenta-500">Site Plan</span>
          </h3>
          <div className="flex items-center gap-2 mt-2 text-cyan-500/70 font-mono text-xs uppercase tracking-widest">
            <MapPin size={18} className="text-magenta-500" />
            <span className="font-black">{SOCIETY_INFO.location}</span>
          </div>
        </div>
        <a 
          href={SOCIETY_INFO.googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 bg-black border-2 border-cyan-500 text-cyan-500 px-6 py-3 rounded-none font-mono font-black text-xs uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-colors shadow-[4px_4px_0px_#ff00ff]"
        >
          <Navigation size={18} />
          View Actual Satellite Map
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-black border-4 border-magenta-500 p-6 md:p-8 rounded-none shadow-[12px_12px_0px_#00ffff] crt-screen">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-black border-2 border-cyan-500 flex items-center justify-center text-cyan-500 shadow-[4px_4px_0px_#ff00ff]">
                <LayoutGrid size={28} />
              </div>
              <div>
                <h5 className="text-2xl font-black text-cyan-400 uppercase font-mono glitch-text">Interactive Plot Layout</h5>
                <span className="text-xs font-mono font-black text-cyan-900 uppercase tracking-widest">
                  Digital Twin of Saurashtra Residency
                </span>
              </div>
            </div>

            <div className="relative bg-black p-6 md:p-8 rounded-none border-2 border-dashed border-cyan-500/30 min-h-[800px]">
              <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#00ffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
              
              {/* Gates */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black border-2 border-magenta-500 text-magenta-500 px-4 py-2 rounded-none flex items-center gap-2 z-20 shadow-[4px_4px_0px_#00ffff]">
                <DoorOpen size={18} className="text-green-500" />
                <span className="text-[10px] font-mono font-black uppercase tracking-widest">Main Gate 1 (Pasodara Road)</span>
              </div>

              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-black border-2 border-cyan-500 text-cyan-500 px-4 py-2 rounded-none flex items-center gap-2 z-20 shadow-[4px_4px_0px_#ff00ff]">
                <DoorOpen size={18} className="text-cyan-500" />
                <span className="text-[10px] font-mono font-black uppercase tracking-widest">Service Gate 2 (Canal Road)</span>
              </div>

              {/* Central Spine */}
              <div className="absolute inset-y-12 left-1/2 -translate-x-1/2 w-32 md:w-48 flex flex-col items-center justify-between py-12 z-10 pointer-events-none">
                <div className="pointer-events-auto w-full h-48 border-2 border-green-500 bg-black flex flex-col items-center justify-center transition-all duration-300 hover:bg-green-500 hover:text-black shadow-[4px_4px_0px_#ff00ff33]">
                  <TreePine size={32} className="text-inherit" />
                  <span className="text-[10px] font-mono font-black uppercase mt-2">Central Garden</span>
                </div>

                <div className="h-20 w-1 bg-magenta-500/30 rounded-none" />

                <div className="pointer-events-auto w-full h-48 border-2 border-green-500 bg-black flex flex-col items-center justify-center transition-all duration-300 hover:bg-green-500 hover:text-black shadow-[4px_4px_0px_#ff00ff33]">
                  <TreePine size={32} className="text-inherit" />
                  <span className="text-[10px] font-mono font-black uppercase mt-2">Back Garden</span>
                </div>
              </div>

              {/* Wings Grid */}
              <div className="grid grid-cols-2 gap-24 md:gap-48 relative z-0">
                <div className="space-y-4">
                  {leftColWings.map(name => {
                    const wing = BUILDINGS.find(b => b.name === name);
                    if (!wing) return null;
                    const is1BHK = wing.type === '1BHK';
                    return (
                      <div key={wing.id} className="relative group">
                        <button
                          onMouseEnter={() => setHoveredWing(wing.name)}
                          onMouseLeave={() => setHoveredWing(null)}
                          onClick={() => navigate('/buildings')}
                          className={`w-full aspect-[4/3] border-2 flex flex-col items-center justify-center gap-1 transition-all duration-300 hover:scale-105 hover:z-10 ${
                            is1BHK 
                              ? 'border-cyan-500 bg-black text-cyan-500 hover:bg-cyan-500 hover:text-black shadow-[4px_4px_0px_#ff00ff33]' 
                              : 'border-magenta-500 bg-black text-magenta-500 hover:bg-magenta-500 hover:text-black shadow-[4px_4px_0px_#00ffff33]'
                          }`}
                        >
                          <span className="text-sm font-black font-mono">
                            {wing.name}
                          </span>
                          <div className={`w-1.5 h-1.5 border border-black ${is1BHK ? 'bg-cyan-500' : 'bg-magenta-500'}`} />
                        </button>
                        
                        {hoveredWing === wing.name && (
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border-2 border-cyan-500 text-cyan-500 text-[10px] font-mono font-black px-3 py-1.5 rounded-none whitespace-nowrap z-20 pointer-events-none shadow-[4px_4px_0px_#ff00ff]">
                            {wing.type} • 20 UNITS
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-4">
                  {rightColWings.map(name => {
                    const wing = BUILDINGS.find(b => b.name === name);
                    if (!wing) return null;
                    const is1BHK = wing.type === '1BHK';
                    return (
                      <div key={wing.id} className="relative group">
                        <button
                          onMouseEnter={() => setHoveredWing(wing.name)}
                          onMouseLeave={() => setHoveredWing(null)}
                          onClick={() => navigate('/buildings')}
                          className={`w-full aspect-[4/3] border-2 flex flex-col items-center justify-center gap-1 transition-all duration-300 hover:scale-105 hover:z-10 ${
                            is1BHK 
                              ? 'border-cyan-500 bg-black text-cyan-500 hover:bg-cyan-500 hover:text-black shadow-[4px_4px_0px_#ff00ff33]' 
                              : 'border-magenta-500 bg-black text-magenta-500 hover:bg-magenta-500 hover:text-black shadow-[4px_4px_0px_#00ffff33]'
                          }`}
                        >
                          <span className="text-sm font-black font-mono">
                            {wing.name}
                          </span>
                          <div className={`w-1.5 h-1.5 border border-black ${is1BHK ? 'bg-cyan-500' : 'bg-magenta-500'}`} />
                        </button>
                        
                        {hoveredWing === wing.name && (
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border-2 border-cyan-500 text-cyan-500 text-[10px] font-mono font-black px-3 py-1.5 rounded-none whitespace-nowrap z-20 pointer-events-none shadow-[4px_4px_0px_#ff00ff]">
                            {wing.type} • 20 UNITS
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="bg-black border-2 border-cyan-500 p-6 rounded-none flex gap-4 shadow-[4px_4px_0px_#ff00ff]">
                <div className="w-10 h-10 bg-cyan-500 flex items-center justify-center text-black shadow-[2px_2px_0px_#ff00ff] shrink-0">
                  <Star size={20} />
                </div>
                <div>
                  <h6 className="text-sm font-black text-cyan-400 uppercase mb-1 font-mono">Elite Infrastructure</h6>
                  <p className="text-xs font-mono text-cyan-500/70 leading-relaxed uppercase">
                    Planned layout with 40-feet internal RCC roads and separate underground water tanks for every 4 wings.
                  </p>
                </div>
              </div>
              <div className="bg-black border-2 border-magenta-500 p-6 rounded-none flex gap-4 shadow-[4px_4px_0px_#00ffff]">
                <div className="w-10 h-10 bg-magenta-500 flex items-center justify-center text-black shadow-[2px_2px_0px_#00ffff] shrink-0">
                  <TreePine size={20} />
                </div>
                <div>
                  <h6 className="text-sm font-black text-magenta-500 uppercase mb-1 font-mono">Eco-Friendly Zones</h6>
                  <p className="text-xs font-mono text-magenta-500/70 leading-relaxed uppercase">
                    Two massive gardens (Central & Back Garden) provide 12,000+ sq.ft of recreational green cover for all 480 families.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black border-4 border-cyan-500 p-8 rounded-none shadow-[12px_12px_0px_#ff00ff] crt-screen">
            <h5 className="text-2xl font-black mb-6 flex items-center gap-3 text-cyan-400 uppercase font-mono glitch-text">
              <Sparkles size={28} className="text-magenta-500" /> 
              Neighborhood Intelligence
            </h5>
            {loading ? (
              <div className="py-12 text-center">
                <Loader2 size={40} className="animate-spin mx-auto mb-4 text-cyan-500" />
                <span className="text-xs font-mono font-black text-cyan-900 uppercase tracking-widest">Grounding Search Results...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-lg text-cyan-500/70 italic leading-relaxed font-mono uppercase text-xs">
                  "{localityInfo?.text || "Analyzing Pasodara neighborhood data..."}"
                </p>
                {localityInfo?.sources && localityInfo.sources.length > 0 && (
                  <div className="pt-6 border-t-2 border-cyan-500/20">
                    <span className="text-xs font-mono font-black text-cyan-900 uppercase tracking-widest block mb-4">Verification Sources</span>
                    <div className="flex flex-wrap gap-3">
                      {localityInfo.sources.map((s: any, i: number) => (
                        <a 
                          key={i} 
                          href={s.web?.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 border-2 border-cyan-500/30 text-[10px] font-mono font-black uppercase hover:bg-cyan-500 hover:text-black transition-colors text-cyan-500"
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
          <div className="bg-black border-4 border-magenta-500 p-8 rounded-none text-cyan-400 relative overflow-hidden shadow-[8px_8px_0px_#00ffff] crt-screen">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-cyan-500 rounded-full opacity-10 blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-black border-2 border-cyan-500 p-2 flex items-center justify-center shadow-[4px_4px_0px_#ff00ff]">
                  <img src={BUILDER_INFO.logo} alt="Builder Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h5 className="text-xl font-black font-mono uppercase">{BUILDER_INFO.name}</h5>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-none bg-magenta-500" />
                    <span className="text-[10px] font-mono font-black text-magenta-500 uppercase tracking-widest">
                      Elite Developer • Est {BUILDER_INFO.founded}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-cyan-500/70 italic leading-relaxed mb-8 text-xs font-mono uppercase">
                "{BUILDER_INFO.vision}"
              </p>

              <div className="pt-6 border-t-2 border-cyan-500/20 mb-8">
                <span className="text-[10px] font-mono font-black text-cyan-900 uppercase tracking-widest block mb-3">Notable Portfolio</span>
                <div className="flex flex-wrap gap-2">
                  {BUILDER_INFO.projects.map((p, idx) => (
                    <span key={idx} className="px-2 py-1 border border-cyan-500/30 text-cyan-500/50 text-[10px] font-mono font-black uppercase">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <a 
                  href={`tel:${BUILDER_INFO.phone}`}
                  className="flex items-center justify-center gap-2 w-full py-3 border-2 border-cyan-500 bg-black text-cyan-500 font-mono font-black text-xs uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-colors shadow-[4px_4px_0px_#ff00ff]"
                >
                  <Smartphone size={14} />
                  Call Developer
                </a>
                <a 
                  href={`mailto:${BUILDER_INFO.email}`}
                  className="flex items-center justify-center gap-2 w-full py-3 border-2 border-magenta-500 bg-black text-magenta-500 font-mono font-black text-xs uppercase tracking-widest hover:bg-magenta-500 hover:text-black transition-colors shadow-[4px_4px_0px_#00ffff]"
                >
                  <Mail size={14} />
                  Email Office
                </a>
              </div>
            </div>
          </div>

          <div className="bg-black border-4 border-cyan-500 p-8 rounded-none shadow-[8px_8px_0px_#ff00ff] crt-screen">
            <span className="text-[10px] font-mono font-black text-magenta-500 uppercase tracking-widest block mb-6">Spatial Legend</span>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border-2 border-cyan-500 bg-black flex items-center justify-center text-cyan-500 shadow-[2px_2px_0px_#ff00ff]">
                  <LayoutGrid size={20} />
                </div>
                <div>
                  <h6 className="text-sm font-black text-cyan-400 font-mono uppercase">Blue Block</h6>
                  <span className="text-[10px] font-mono font-black text-cyan-900 uppercase">1BHK Units (Wings A-1 to A-6)</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border-2 border-magenta-500 bg-black flex items-center justify-center text-magenta-500 shadow-[2px_2px_0px_#00ffff]">
                  <LayoutGrid size={20} />
                </div>
                <div>
                  <h6 className="text-sm font-black text-magenta-500 font-mono uppercase">Indigo Block</h6>
                  <span className="text-[10px] font-mono font-black text-cyan-900 uppercase">2BHK Units (Wings A-7 to A-24)</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border-2 border-green-500 bg-black flex items-center justify-center text-green-500 shadow-[2px_2px_0px_#ff00ff33]">
                  <TreePine size={20} />
                </div>
                <div>
                  <h6 className="text-sm font-black text-green-500 font-mono uppercase">Green Zone</h6>
                  <span className="text-[10px] font-mono font-black text-cyan-900 uppercase">Central Recreational Parks</span>
                </div>
              </div>
            </div>
            <div className="h-0.5 bg-cyan-500/20 my-6" />
            <button 
              onClick={() => navigate('/buildings')}
              className="flex items-center justify-center gap-2 w-full py-3 border-2 border-cyan-500 bg-black text-cyan-500 font-mono font-black text-xs uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-colors shadow-[4px_4px_0px_#ff00ff]"
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
