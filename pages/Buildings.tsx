
import React, { useState, useEffect, useMemo } from 'react';
// Added 'Download' to lucide-react imports to fix the error: Cannot find name 'Download'
import { Search, Building2, ChevronRight, Zap, Droplets, MapPin, LayoutGrid, Home, Loader2, Users, X, User, Phone, Calendar, Briefcase, Info, Edit3, Save, CheckCircle2, Trash2, PlusCircle, Star, ShieldCheck, Wallet, CreditCard, ArrowRight, MessageSquare, AlertCircle, History, Receipt, Ghost, FileText, ClipboardCheck, Filter, Download } from 'lucide-react';
import { api } from '../services/api';
import { SOCIETY_INFO, BUILDINGS as WING_CONSTANTS } from '../constants';
import { FlatType, Building, Flat, FamilyMember, OccupancyType, PaymentStatus, MaintenanceRecord } from '../types';
import { useLanguage } from '../components/LanguageContext';
import SocietyMap from '../components/SocietyMap';

const Buildings: React.FC = () => {
  const { t } = useLanguage();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedFlat, setSelectedFlat] = useState<any | null>(null);
  const [registeredUnits, setRegisteredUnits] = useState<any[]>([]); 
  const [user, setUser] = useState<any>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [totalMaintenance, setTotalMaintenance] = useState(2500);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  useEffect(() => {
    const stored = localStorage.getItem('sr_user');
    if (stored) setUser(JSON.parse(stored));
    loadBuildingsAndOccupancy();
  }, []);

  useEffect(() => {
    const fetchMaintenance = async () => {
      const { total } = await api.calculateMaintenanceWithPenalty(SOCIETY_INFO.maintenanceAmount);
      setTotalMaintenance(total);
    };
    fetchMaintenance();
  }, []);

  const loadBuildingsAndOccupancy = async (retries = 0) => {
    if (retries === 0) setLoading(true);
    try {
      const [bData, oData] = await Promise.all([
        api.getBuildings(),
        api.getOccupancyData()
      ]);
      setBuildings(bData);
      setRegisteredUnits(oData);
      setLoading(false);
    } catch (e: any) {
      if (e.message === 'SERVER_STARTING' && retries < 5) {
        setTimeout(() => loadBuildingsAndOccupancy(retries + 1), 2000);
        return;
      }
      setLoading(false);
    }
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'COMMITTEE';

  // Calculate society-wide vacant/unregistered units
  const vacancyReport = useMemo(() => {
    const report: Record<string, string[]> = {};
    let totalVacant = 0;

    WING_CONSTANTS.forEach(wing => {
      const vacantInWing: string[] = [];
      for (let floor = 1; floor <= 5; floor++) {
        for (let unit = 1; unit <= 4; unit++) {
          const unitNo = `${floor}0${unit}`;
          const flatId = `${wing.name}-${unitNo}`;
          const isRegistered = registeredUnits.some(p => p.flatId === flatId);
          if (!isRegistered) {
            vacantInWing.push(unitNo);
            totalVacant++;
          }
        }
      }
      if (vacantInWing.length > 0) {
        report[wing.name] = vacantInWing;
      }
    });

    return { report, totalVacant };
  }, [registeredUnits]);

  const filteredBuildings = buildings.filter(b => {
    const name = b.name || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalUnits = 480;
  const occupiedCount = registeredUnits.length;
  const vacantCount = totalUnits - occupiedCount;

  const renderFloorGrid = (building: Building) => {
    const floors = [5, 4, 3, 2, 1];
    const unitsPerFloor = [1, 2, 3, 4];
    
    return floors.map(floor => (
      <div key={floor} className="flex items-center gap-8 group">
        <div className="w-20 text-right">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600 group-hover:text-brand-600 transition-colors">Floor {floor}</p>
        </div>
        <div className="flex-1 grid grid-cols-4 gap-6">
          {unitsPerFloor.map(unit => {
            const unitNo = `${floor}0${unit}`;
            const flatId = `${building.name}-${unitNo}`;
            const profile = registeredUnits.find(p => p.flatId === flatId);
            const isOccupied = !!profile;

            return (
              <button 
                key={unitNo}
                onClick={() => setSelectedFlat({ unitNumber: unitNo, profile })}
                className={`
                  relative aspect-[16/10] rounded-2xl border-2 transition-all duration-300 overflow-hidden group/flat flex flex-col items-center justify-center
                  ${!isOccupied 
                    ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 border-dashed opacity-60' 
                    : profile.occupancyType === 'Owner'
                      ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/40 hover:bg-emerald-100'
                      : 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/40 hover:bg-blue-100'
                  }
                  hover:scale-105 hover:shadow-xl hover:-translate-y-1 active:scale-95
                `}
              >
                <div className={`
                  absolute top-0 inset-x-0 h-1 transition-all duration-300
                  ${!isOccupied ? 'bg-slate-200 dark:bg-slate-700' : profile.occupancyType === 'Owner' ? 'bg-emerald-500' : 'bg-blue-500'}
                `} />
                
                <span className={`text-xl font-black tracking-tighter transition-colors ${
                  !isOccupied ? 'text-slate-300 dark:text-slate-700' : 'text-slate-900 dark:text-white group-hover/flat:text-brand-600'
                }`}>
                  {unitNo}
                </span>
                
                {isOccupied && (
                  <div className="mt-1 flex items-center gap-1">
                    <User size={10} className="text-brand-500" />
                    <span className="text-[8px] font-black uppercase text-slate-400 truncate max-w-[60px]">{profile.name.split(' ')[0]}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-magenta-500 mb-4" size={40} />
        <p className="font-mono font-black uppercase tracking-widest text-xs text-cyan-500 glitch-text">Auditing Society Assets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b-4 border-magenta-500">
        <div>
          <h1 className="text-5xl font-black text-cyan-400 tracking-tighter uppercase glitch-text">{t('residential_infra')}</h1>
          <p className="text-cyan-500/70 mt-2 font-mono text-xs uppercase tracking-widest">Real-time occupancy tracking for Pasodara portal</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 items-center">
          <div className="flex gap-4">
            <div className="bg-black border-2 border-emerald-500 px-6 py-3 rounded-none text-center shadow-[4px_4px_0px_#10b981]">
               <p className="text-[10px] font-mono font-black uppercase text-emerald-500 tracking-widest mb-1">Registered</p>
               <p className="text-2xl font-black text-emerald-400 leading-none font-mono">{occupiedCount}</p>
            </div>
            <div className="bg-black border-2 border-cyan-500 px-6 py-3 rounded-none text-center shadow-[4px_4px_0px_#06b6d4]">
               <p className="text-[10px] font-mono font-black uppercase text-cyan-500 tracking-widest mb-1">Vacant</p>
               <p className="text-2xl font-black text-cyan-400 leading-none font-mono">{vacantCount}</p>
            </div>
          </div>
          <div className="flex bg-black border-2 border-magenta-500 p-1 rounded-none">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 font-mono text-xs font-black uppercase tracking-widest transition-all ${
                viewMode === 'list' 
                  ? 'bg-cyan-500 text-black' 
                  : 'text-cyan-500 hover:bg-cyan-500/10'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 font-mono text-xs font-black uppercase tracking-widest transition-all ${
                viewMode === 'map' 
                  ? 'bg-cyan-500 text-black' 
                  : 'text-cyan-500 hover:bg-cyan-500/10'
              }`}
            >
              Site Map
            </button>
          </div>
          {isAdmin && (
            <button 
              onClick={() => setShowAuditModal(true)}
              className="px-6 py-4 bg-magenta-500 text-black border-2 border-black font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-black hover:text-magenta-500 hover:border-magenta-500 transition-all shadow-[6px_6px_0px_#00ffff]"
            >
              <FileText size={18} /> Vacancy Report
            </button>
          )}
        </div>
      </div>

      {viewMode === 'map' ? (
        <SocietyMap 
          buildings={filteredBuildings} 
          registeredUnits={registeredUnits} 
          onBuildingClick={setSelectedBuilding} 
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredBuildings.map((building, index: number) => {
            const wingOccupied = registeredUnits.filter(p => p.flatId.startsWith(building.name)).length;
            return (
              <div 
                key={building.id || index} 
                className="group bg-black border-4 border-magenta-500 overflow-hidden shadow-[8px_8px_0px_#00ffff] flex flex-col cursor-pointer crt-screen"
                onClick={() => setSelectedBuilding(building)}
              >
                <div className={`h-2.5 w-full ${building.type === '1BHK' ? 'bg-cyan-500' : 'bg-magenta-500'}`} />
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <div className="p-4 border-2 border-cyan-500 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-black transition-all duration-300 shadow-[4px_4px_0px_#ff00ff]">
                      <Building2 size={28} />
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono font-black px-3 py-1.5 border-2 border-magenta-500 text-magenta-500 mb-2 uppercase tracking-widest">
                        {building.type}
                      </div>
                      <p className="text-[9px] font-mono font-black text-cyan-500 uppercase tracking-widest">{wingOccupied}/20 Registered</p>
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-black text-cyan-400 mb-6 group-hover:text-magenta-500 transition-colors uppercase font-mono glitch-text">Wing {building.name}</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-black border-2 border-cyan-500/30 p-4 shadow-[4px_4px_0px_#ff00ff33]">
                      <p className="text-[10px] text-cyan-500/50 uppercase font-mono font-black tracking-widest mb-1 flex items-center gap-1"><LayoutGrid size={10} /> Floors</p>
                      <p className="text-xl font-black text-cyan-400 font-mono">5</p>
                    </div>
                    <div className="bg-black border-2 border-cyan-500/30 p-4 shadow-[4px_4px_0px_#ff00ff33]">
                      <p className="text-[10px] text-cyan-500/50 uppercase font-mono font-black tracking-widest mb-1 flex items-center gap-1"><Home size={10} /> Parking</p>
                      <p className="text-xl font-black text-cyan-400 font-mono">{building.parkingSpots || 20}</p>
                    </div>
                  </div>

                  <button className="w-full flex items-center justify-between px-6 py-4 bg-cyan-500 text-black border-2 border-black font-black text-xs uppercase tracking-widest group-hover:bg-black group-hover:text-cyan-500 group-hover:border-cyan-500 transition-all duration-300 shadow-[4px_4px_0px_#ff00ff]">
                    {t('view_wing_mgmt')}
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vacancy Audit Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setShowAuditModal(false)} />
          <div className="relative w-full max-w-4xl bg-black border-4 border-magenta-500 shadow-[12px_12px_0px_#00ffff] overflow-hidden flex flex-col max-h-[85vh] crt-screen">
            <div className="p-10 border-b-2 border-magenta-500 flex flex-col md:flex-row justify-between items-center bg-black sticky top-0 z-10 gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-cyan-500 text-black border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_#ff00ff]">
                  <ClipboardCheck size={32} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-cyan-400 tracking-tighter uppercase glitch-text">Detailed Occupancy Audit</h3>
                  <p className="text-[10px] font-mono font-black uppercase text-magenta-500 tracking-widest">
                    Listing {vacancyReport.totalVacant} Unregistered units across 24 wings
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search Wing..." 
                    className="pl-10 pr-4 py-2 bg-black border-2 border-cyan-500 text-cyan-400 text-xs font-mono font-black outline-none shadow-[4px_4px_0px_#ff00ff]"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                  />
                </div>
                <button onClick={() => setShowAuditModal(false)} className="p-3 text-cyan-500 hover:text-magenta-500 transition-all"><X size={28} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 bg-black">
               <div className="space-y-8">
                  {Object.entries(vacancyReport.report)
                    .filter(([wing]) => wing.toLowerCase().includes(auditSearch.toLowerCase()))
                    .map(([wing, flats]: [string, string[]]) => (
                    <div key={wing} className="bg-black p-8 border-2 border-cyan-500 shadow-[6px_6px_0px_#ff00ff33]">
                       <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <span className="w-10 h-10 border-2 border-magenta-500 flex items-center justify-center font-mono font-black text-magenta-500">
                              {wing}
                            </span>
                            <h4 className="text-xl font-black text-cyan-400 tracking-tight uppercase font-mono">Wing {wing} Vacancies</h4>
                          </div>
                          <span className="text-[10px] font-mono font-black bg-rose-500 text-black px-3 py-1 uppercase tracking-widest shadow-[2px_2px_0px_#00ffff]">
                            {flats.length} Missing Profiles
                          </span>
                       </div>
                       <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                          {flats.map((f: string) => (
                            <div key={f} className="flex flex-col items-center p-3 border-2 border-cyan-500/30 hover:border-magenta-500 transition-all cursor-default">
                               <span className="text-sm font-mono font-black text-cyan-500/50">{f}</span>
                               <Ghost size={12} className="text-cyan-500/30 mt-1" />
                            </div>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-8 bg-black border-t-2 border-magenta-500 flex justify-between items-center">
              <div className="flex items-center gap-3 text-cyan-500/50 text-xs font-mono font-black">
                <AlertCircle size={16} className="text-magenta-500" />
                <span>Units listed here have no entry in the digital profiles table.</span>
              </div>
              <button 
                onClick={() => {
                  api.exportToCSV(
                    Object.entries(vacancyReport.report).flatMap(([wing, flats]: [string, string[]]) => flats.map((f: string) => ({ Wing: wing, Flat: f }))),
                    'Saurashtra_Vacancy_Report'
                  );
                }}
                className="px-6 py-3 bg-cyan-500 text-black border-2 border-black font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0px_#ff00ff] flex items-center gap-2"
              >
                <Download size={14} /> Download List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wing Map Modal */}
      {selectedBuilding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setSelectedBuilding(null)} />
          <div className="relative w-full max-w-6xl bg-black border-4 border-magenta-500 shadow-[12px_12px_0px_#00ffff] overflow-hidden flex flex-col max-h-[90vh] crt-screen">
            <div className="p-10 border-b-2 border-magenta-500 flex justify-between items-center bg-black sticky top-0 z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-cyan-500 text-black border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_#ff00ff]">
                  <Building2 size={32} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-cyan-400 tracking-tighter uppercase glitch-text">Wing {selectedBuilding.name}</h3>
                  <p className="text-xs font-mono font-black uppercase text-magenta-500 tracking-widest">Real-Time Occupancy Map</p>
                </div>
              </div>
              <button onClick={() => setSelectedBuilding(null)} className="p-4 text-cyan-500 hover:text-magenta-500 transition-all"><X size={32} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 bg-black space-y-12">
              <section className="space-y-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <LayoutGrid className="text-cyan-500" size={24} />
                    <h4 className="text-xl font-black text-cyan-400 tracking-tight uppercase tracking-widest text-xs font-mono">Floor Map</h4>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 shadow-[1px_1px_0px_#000]"></div>
                      <span className="text-[9px] font-mono font-black uppercase text-cyan-500/50 tracking-widest">Registered Owner</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-cyan-500 shadow-[1px_1px_0px_#000]"></div>
                      <span className="text-[9px] font-mono font-black uppercase text-cyan-500/50 tracking-widest">Registered Tenant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-dashed border-cyan-900 bg-black"></div>
                      <span className="text-[9px] font-mono font-black uppercase text-cyan-500/50 tracking-widest">Unregistered / Vacant</span>
                    </div>
                  </div>
                </div>

                <div className="bg-black border-2 border-cyan-500/30 p-12 shadow-inner">
                  <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                    {renderFloorGrid(selectedBuilding)}
                    
                    <div className="mt-6 flex items-center gap-8">
                      <div className="w-20" />
                      <div className="flex-1 h-3 bg-cyan-900/30 border border-cyan-500/30 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-magenta-500 text-black px-6 py-1 border border-black text-[8px] font-mono font-black uppercase tracking-widest shadow-[4px_4px_0px_#00ffff]">
                          Lobby Entrance
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Flat & Residents Details Modal */}
      {selectedFlat && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setSelectedFlat(null)} />
          <div className="relative w-full max-w-2xl bg-black border-4 border-magenta-500 shadow-[12px_12px_0px_#00ffff] overflow-hidden flex flex-col max-h-[85vh] crt-screen">
            <div className="p-10 border-b-2 border-magenta-500 flex justify-between items-center bg-black sticky top-0 z-10">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-cyan-500 text-black border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_#ff00ff]">
                  <Home size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-cyan-400 tracking-tighter uppercase glitch-text">{t('unit')} {selectedFlat.unitNumber}</h3>
                  <p className="text-[10px] font-mono font-black uppercase text-magenta-500 tracking-widest">
                    {selectedFlat.profile ? 'Registered Occupant' : 'Unregistered Profile'}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedFlat(null)} className="p-3 text-cyan-500 hover:text-magenta-500 transition-all"><X size={28} /></button>
            </div>

            <div className="p-10 space-y-12 overflow-y-auto flex-1 bg-black">
              {selectedFlat.profile ? (
                <div className="space-y-4">
                  <div className="bg-black p-8 border-2 border-cyan-500 flex items-center justify-between group shadow-[6px_6px_0px_#ff00ff33]">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 border-2 border-magenta-500 overflow-hidden flex items-center justify-center bg-black">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedFlat.profile.name}`} alt="user" />
                      </div>
                      <div>
                        <p className="font-black text-2xl text-cyan-400 tracking-tight uppercase font-mono glitch-text">{selectedFlat.profile.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                           <span className="px-3 py-1 border border-magenta-500 text-[9px] font-mono font-black uppercase text-magenta-500">{selectedFlat.profile.occupancyType}</span>
                           <span className="text-[10px] font-mono font-black text-cyan-500 uppercase tracking-widest">{selectedFlat.profile.status} Member</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <section className="bg-black p-8 border-2 border-magenta-500 shadow-[8px_8px_0px_#00ffff33] relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-cyan-500 text-black border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_#ff00ff]">
                        <CreditCard size={24} />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-cyan-400 tracking-tight uppercase font-mono">{t('maintenance')} Summary</h4>
                        <p className="text-[10px] font-mono font-black uppercase tracking-widest text-magenta-500">Society Dues</p>
                      </div>
                    </div>
                    <div className="pt-6 border-t-2 border-magenta-500/30 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-mono font-black uppercase text-cyan-500/50 tracking-widest mb-1">Standard Maintenance</p>
                        <p className="text-3xl font-black text-cyan-400 tracking-tighter font-mono">₹{totalMaintenance}</p>
                      </div>
                      <button 
                        onClick={() => {}} 
                        className="px-10 py-4 bg-magenta-500 text-black border-2 border-black font-black text-xs uppercase tracking-widest shadow-[6px_6px_0px_#00ffff] hover:bg-black hover:text-magenta-500 hover:border-magenta-500 transition-all flex items-center gap-3"
                      >
                        {t('pay_now')}
                      </button>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="py-20 text-center space-y-6">
                   <div className="w-32 h-32 border-4 border-dashed border-cyan-900 flex items-center justify-center text-cyan-900 mx-auto">
                     <Ghost size={64} />
                   </div>
                   <div>
                      <h4 className="text-2xl font-black text-cyan-900 tracking-tight uppercase font-mono">No Active Registration</h4>
                      <p className="text-cyan-900/70 text-sm max-w-xs mx-auto mt-2 font-mono">This unit has no registered users in the digital portal. Dues are tracked against the property.</p>
                   </div>
                   <button className="px-8 py-3.5 bg-magenta-500 text-black border-2 border-black font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 shadow-[4px_4px_0px_#00ffff]">
                     Initiate Offline Ledger
                   </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Buildings;
