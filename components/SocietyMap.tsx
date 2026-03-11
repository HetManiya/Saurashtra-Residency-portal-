import React from 'react';
import { motion } from 'motion/react';
import { Building } from '../types';
import { Building2, Trees, Car, Users, MapPin } from 'lucide-react';

interface SocietyMapProps {
  buildings: Building[];
  registeredUnits: any[];
  onBuildingClick: (building: Building) => void;
}

const SocietyMap: React.FC<SocietyMapProps> = ({ buildings, registeredUnits, onBuildingClick }) => {
  
  const getOccupancyStats = (buildingName: string) => {
    const totalUnits = 20; // 5 floors * 4 flats
    const occupied = registeredUnits.filter(u => u.flatId.startsWith(buildingName)).length;
    const percentage = (occupied / totalUnits) * 100;
    return { occupied, percentage };
  };

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-emerald-500 border-emerald-600 text-emerald-600';
    if (percentage >= 50) return 'bg-cyan-500 border-cyan-600 text-cyan-600';
    if (percentage >= 20) return 'bg-magenta-500 border-magenta-600 text-magenta-600';
    return 'bg-slate-700 border-slate-800 text-slate-800';
  };

  // Layout: 4 rows of 6 buildings
  // Row 1: A-1 to A-6
  // Row 2: A-7 to A-12
  // -- Road --
  // Row 3: A-13 to A-18
  // Row 4: A-19 to A-24

  const row1 = buildings.slice(0, 6);
  const row2 = buildings.slice(6, 12);
  const row3 = buildings.slice(12, 18);
  const row4 = buildings.slice(18, 24);

  const renderBuilding = (building: Building) => {
    const { occupied, percentage } = getOccupancyStats(building.name);
    const colorClass = getOccupancyColor(percentage);
    const isHigh = percentage >= 80;
    const isMed = percentage >= 50 && percentage < 80;
    const isLow = percentage >= 20 && percentage < 50;
    
    return (
      <motion.div
        key={building.id}
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onBuildingClick(building)}
        className="relative cursor-pointer group flex flex-col items-center"
      >
        <div className={`
          w-20 h-20 md:w-24 md:h-24 border-4 transition-all duration-300
          flex flex-col items-center justify-center relative overflow-hidden
          bg-black ${
            isHigh ? 'border-emerald-500 shadow-[4px_4px_0px_#00ffff]' : 
            isMed ? 'border-cyan-500 shadow-[4px_4px_0px_#ff00ff]' : 
            isLow ? 'border-magenta-500 shadow-[4px_4px_0px_#00ffff]' : 
            'border-cyan-900/30'
          }
        `}>
          <div className={`absolute top-0 inset-x-0 h-1 ${isHigh ? 'bg-emerald-500' : isMed ? 'bg-cyan-500' : isLow ? 'bg-magenta-500' : 'bg-cyan-900/30'}`} />
          
          <span className="text-[8px] font-black text-cyan-900 uppercase tracking-widest mb-0.5">Wing</span>
          <h3 className={`text-xl font-black tracking-tighter ${isHigh ? 'text-emerald-500' : isMed ? 'text-cyan-400' : isLow ? 'text-magenta-500' : 'text-cyan-900'}`}>{building.name}</h3>
          
          <div className="mt-1 flex items-center gap-1">
            <Users size={10} className="text-cyan-900" />
            <span className={`text-[9px] font-black font-mono ${isHigh ? 'text-emerald-500' : isMed ? 'text-cyan-400' : isLow ? 'text-magenta-500' : 'text-cyan-900'}`}>{percentage.toFixed(0)}%</span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-black p-8 md:p-12 border-4 border-cyan-500/30 overflow-hidden relative min-h-[600px] flex flex-col justify-center items-center crt-screen shadow-[8px_8px_0px_#ff00ff]">
      
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl space-y-12">
        
        {/* Top Block (Rows 1 & 2) */}
        <div className="space-y-8">
          <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
            {row1.map(renderBuilding)}
          </div>
          <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
            {row2.map(renderBuilding)}
          </div>
        </div>

        {/* Central Road / Amenities */}
        <div className="relative h-36 w-full bg-cyan-900/10 border-y-4 border-dashed border-cyan-500/30 flex items-center justify-center">
           <div className="absolute inset-x-0 top-1/2 h-0.5 bg-cyan-500/10 border-t-2 border-dashed border-cyan-500/20"></div>
           
           {/* Central Park */}
           <div className="bg-black border-2 border-emerald-500 px-8 py-4 flex items-center gap-4 shadow-[4px_4px_0px_#00ffff] z-10 group hover:scale-105 transition-transform">
              <Trees className="text-emerald-500 group-hover:animate-bounce" size={28} />
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-500 block tracking-[0.2em] glitch-text" data-text="CENTRAL_PARK">CENTRAL_PARK</span>
                <span className="text-[8px] font-black text-emerald-900 uppercase tracking-widest font-mono">RECREATION_ZONE_v1</span>
              </div>
           </div>

           {/* Clubhouse (Left) */}
           <div className="absolute left-10 bg-black border-2 border-magenta-500 p-4 shadow-[4px_4px_0px_#00ffff] hidden md:flex items-center gap-3 group hover:scale-105 transition-transform">
              <Building2 className="text-magenta-500" size={24} />
              <span className="text-[9px] font-black uppercase text-magenta-500 tracking-widest">CLUBHOUSE</span>
           </div>

           {/* Gate (Right) */}
           <div className="absolute right-10 bg-black border-2 border-cyan-500 p-4 shadow-[4px_4px_0px_#ff00ff] hidden md:flex items-center gap-3 group hover:scale-105 transition-transform">
              <MapPin className="text-cyan-400" size={24} />
              <span className="text-[9px] font-black uppercase text-cyan-400 tracking-widest">MAIN_GATE</span>
           </div>
        </div>

        {/* Bottom Block (Rows 3 & 4) */}
        <div className="space-y-8">
          <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
            {row3.map(renderBuilding)}
          </div>
          <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
            {row4.map(renderBuilding)}
          </div>
        </div>

      </div>

      {/* Legend */}
      <div className="absolute bottom-8 right-8 bg-black border-2 border-cyan-900/50 p-5 shadow-[4px_4px_0px_#ff00ff] text-xs hidden lg:block">
        <h4 className="font-black uppercase mb-4 text-cyan-700 text-[10px] tracking-widest border-b border-cyan-900/30 pb-2">OCCUPANCY_LOG</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="text-[9px] font-black uppercase text-cyan-700 tracking-widest">HIGH_DENSITY</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            <span className="text-[9px] font-black uppercase text-cyan-700 tracking-widest">STABLE_LINK</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-magenta-500 shadow-[0_0_8px_#ff00ff]" />
            <span className="text-[9px] font-black uppercase text-cyan-700 tracking-widest">LOW_SIGNAL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocietyMap;
