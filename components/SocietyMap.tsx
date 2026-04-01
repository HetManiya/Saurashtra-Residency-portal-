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
    if (percentage >= 80) return 'bg-emerald-500';
    if (percentage >= 50) return 'bg-brand-500';
    if (percentage >= 20) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  const row1 = buildings.slice(0, 6);
  const row2 = buildings.slice(6, 12);
  const row3 = buildings.slice(12, 18);
  const row4 = buildings.slice(18, 24);

  const renderBuilding = (building: Building, rowPrefix: string, index: number) => {
    const { occupied, percentage } = getOccupancyStats(building.name);
    const colorClass = getOccupancyColor(percentage);
    
    return (
      <motion.div
        key={building.id || `${rowPrefix}-${index}`}
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onBuildingClick(building)}
        className="relative cursor-pointer group flex flex-col items-center"
      >
        <div className="w-20 h-20 md:w-24 md:h-24 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden group-hover:shadow-xl group-hover:shadow-slate-200/50 dark:group-hover:shadow-none">
          <div className={`absolute top-0 inset-x-0 h-1 ${colorClass}`} />
          
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Wing</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-brand-600 transition-colors">{building.name}</h3>
          
          <div className="mt-1 flex items-center gap-1">
            <Users size={10} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{percentage.toFixed(0)}%</span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950/50 p-8 md:p-12 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden relative min-h-[600px] flex flex-col justify-center items-center shadow-inner">
      
      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl space-y-12">
        
        {/* Top Block (Rows 1 & 2) */}
        <div className="space-y-8">
          <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
            {row1.map((building, idx) => renderBuilding(building, 'r1', idx))}
          </div>
          <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
            {row2.map((building, idx) => renderBuilding(building, 'r2', idx))}
          </div>
        </div>

        {/* Central Road / Amenities */}
        <div className="relative h-36 w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-3xl border-y border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
           <div className="absolute inset-x-0 top-1/2 h-px bg-slate-300 dark:bg-slate-700 border-t border-dashed border-slate-400/20"></div>
           
           {/* Central Park */}
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-8 py-4 flex items-center gap-4 shadow-lg shadow-slate-200/50 dark:shadow-none z-10 group hover:scale-105 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Trees className="group-hover:animate-bounce" size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block tracking-tight">Central Park</span>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recreation Zone</span>
              </div>
           </div>

           {/* Clubhouse (Left) */}
           <div className="absolute left-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-md hidden md:flex items-center gap-3 group hover:scale-105 transition-transform">
              <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <Building2 size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Clubhouse</span>
           </div>

           {/* Gate (Right) */}
           <div className="absolute right-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-md hidden md:flex items-center gap-3 group hover:scale-105 transition-transform">
              <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                <MapPin size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Main Gate</span>
           </div>
        </div>

        {/* Bottom Block (Rows 3 & 4) */}
        <div className="space-y-8">
          <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
            {row3.map((building, idx) => renderBuilding(building, 'r3', idx))}
          </div>
          <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
            {row4.map((building, idx) => renderBuilding(building, 'r4', idx))}
          </div>
        </div>

      </div>

      {/* Legend */}
      <div className="absolute bottom-8 right-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xl hidden lg:block">
        <h4 className="font-bold uppercase mb-4 text-slate-400 text-[10px] tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Occupancy Legend</h4>
        <div className="space-y-3">
          {[
            { color: 'bg-emerald-500', label: 'High Density' },
            { color: 'bg-brand-500', label: 'Stable' },
            { color: 'bg-amber-500', label: 'Low Density' }
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wider">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocietyMap;
