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
    if (percentage >= 50) return 'bg-blue-500 border-blue-600 text-blue-600';
    if (percentage >= 20) return 'bg-amber-500 border-amber-600 text-amber-600';
    return 'bg-slate-400 border-slate-500 text-slate-500';
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
    
    return (
      <motion.div
        key={building.id}
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onBuildingClick(building)}
        className="relative cursor-pointer group flex flex-col items-center"
      >
        <div className={`
          w-20 h-20 md:w-24 md:h-24 rounded-2xl shadow-lg border-b-4 transition-all duration-300
          flex flex-col items-center justify-center relative overflow-hidden
          bg-white dark:bg-slate-800 ${colorClass.split(' ')[1].replace('text-', 'border-')}
        `}>
          <div className={`absolute top-0 inset-x-0 h-1.5 ${colorClass.split(' ')[0]}`} />
          
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Wing</span>
          <h3 className="text-xl font-black text-slate-800 dark:text-white">{building.name}</h3>
          
          <div className="mt-1 flex items-center gap-1">
            <Users size={10} className="text-slate-400" />
            <span className={`text-[10px] font-bold ${colorClass.split(' ')[2]}`}>{percentage.toFixed(0)}%</span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-900/50 p-8 md:p-12 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden relative min-h-[600px] flex flex-col justify-center items-center">
      
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl space-y-12">
        
        {/* Top Block (Rows 1 & 2) */}
        <div className="space-y-6">
          <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
            {row1.map(renderBuilding)}
          </div>
          <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
            {row2.map(renderBuilding)}
          </div>
        </div>

        {/* Central Road / Amenities */}
        <div className="relative h-32 w-full bg-slate-300/30 dark:bg-slate-700/30 rounded-3xl flex items-center justify-center border-y-2 border-dashed border-slate-400/30">
           <div className="absolute inset-x-0 top-1/2 h-0.5 bg-slate-400/20 border-t border-dashed border-slate-500/50"></div>
           
           {/* Central Park */}
           <div className="bg-emerald-100 dark:bg-emerald-900/40 px-8 py-4 rounded-full border-2 border-emerald-200 dark:border-emerald-800 flex items-center gap-3 shadow-lg z-10">
              <Trees className="text-emerald-600" size={24} />
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 block tracking-widest">Central Park</span>
                <span className="text-[8px] font-bold text-emerald-600/70 uppercase tracking-widest">Recreation Zone</span>
              </div>
           </div>

           {/* Clubhouse (Left) */}
           <div className="absolute left-10 bg-indigo-100 dark:bg-indigo-900/40 p-3 rounded-2xl border border-indigo-200 dark:border-indigo-800 shadow-md hidden md:flex items-center gap-2">
              <Building2 className="text-indigo-600" size={20} />
              <span className="text-[9px] font-black uppercase text-indigo-700 dark:text-indigo-400 tracking-widest">Clubhouse</span>
           </div>

           {/* Gate (Right) */}
           <div className="absolute right-10 bg-slate-200 dark:bg-slate-800 p-3 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-md hidden md:flex items-center gap-2">
              <MapPin className="text-slate-600 dark:text-slate-400" size={20} />
              <span className="text-[9px] font-black uppercase text-slate-700 dark:text-slate-300 tracking-widest">Main Gate</span>
           </div>
        </div>

        {/* Bottom Block (Rows 3 & 4) */}
        <div className="space-y-6">
          <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
            {row3.map(renderBuilding)}
          </div>
          <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
            {row4.map(renderBuilding)}
          </div>
        </div>

      </div>

      {/* Legend */}
      <div className="absolute bottom-6 right-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur p-4 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 text-xs hidden lg:block">
        <h4 className="font-black uppercase mb-3 text-slate-500 text-[10px] tracking-widest">Occupancy Status</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">High ({'>'}80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Medium (50-80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Low (20-50%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocietyMap;
