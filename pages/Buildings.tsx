
import React, { useState, useEffect, useMemo } from 'react';
// Added 'Download' to lucide-react imports to fix the error: Cannot find name 'Download'
import { Search, Building2, ChevronRight, Zap, Droplets, MapPin, LayoutGrid, Home, Loader2, Users, X, User, Phone, Calendar, Briefcase, Info, Edit3, Save, CheckCircle2, Trash2, PlusCircle, Star, ShieldCheck, Wallet, CreditCard, ArrowRight, MessageSquare, AlertCircle, History, Receipt, Ghost, FileText, ClipboardCheck, Filter, Download } from 'lucide-react';
import { api } from '../services/api';
import { SOCIETY_INFO, BUILDINGS as WING_CONSTANTS } from '../constants';
import { FlatType, Building, Flat, FamilyMember, OccupancyType, PaymentStatus, MaintenanceRecord } from '../types';
import { useLanguage } from '../components/LanguageContext';
import SocietyMap from '../components/SocietyMap';
import Fuse from 'fuse.js';

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

  const filteredBuildings = useMemo(() => {
    if (!searchTerm.trim()) return buildings;

    // Prepare data for Fuse
    const searchData = buildings.map(b => {
      const residentsInWing = registeredUnits
        .filter(u => u.flatId.startsWith(b.name))
        .map(u => u.name)
        .join(' ');
      
      return {
        ...b,
        residentNames: residentsInWing
      };
    });

    const fuse = new Fuse(searchData, {
      keys: ['name', 'residentNames', 'type'],
      threshold: 0.3,
    });

    return fuse.search(searchTerm).map(result => result.item);
  }, [buildings, registeredUnits, searchTerm]);

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
                aria-label={`Unit ${unitNo}${isOccupied ? `, Occupied by ${profile.name}` : ', Vacant'}`}
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
        <Loader2 className="animate-spin text-brand-600 mb-4" size={40} />
        <p className="font-black uppercase tracking-widest text-xs text-slate-400">Auditing Society Assets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('residential_infra')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Real-time occupancy tracking and wing management
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search wing or resident..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/40 px-4 py-2 rounded-xl text-center">
               <p className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider mb-0.5">Registered</p>
               <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 leading-none">{occupiedCount}</p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-center">
               <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-0.5">Vacant</p>
               <p className="text-xl font-bold text-slate-700 dark:text-slate-300 leading-none">{vacantCount}</p>
            </div>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'map' 
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Map
            </button>
          </div>
          {isAdmin && (
            <button 
              onClick={() => setShowAuditModal(true)}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-brand-600/20 active:scale-95"
            >
              <FileText size={18} /> Report
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBuildings.map((building, index: number) => {
            const wingOccupied = registeredUnits.filter(p => p.flatId.startsWith(building.name)).length;
            return (
              <div 
                key={building.id || index} 
                onClick={() => setSelectedBuilding(building)}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer overflow-hidden"
              >
                <div className={`h-1.5 w-full transition-colors duration-500 ${building.type === '1BHK' ? 'bg-brand-400' : 'bg-brand-600'}`} />
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/20 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-all duration-300">
                      <Building2 size={24} />
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded mb-1 uppercase tracking-wider">
                        {building.type}
                      </div>
                      <p className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">{wingOccupied}/20 Units</p>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">Wing {building.name}</h3>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-0.5 flex items-center gap-1"><LayoutGrid size={12} /> Floors</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">05</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-0.5 flex items-center gap-1"><Home size={12} /> Parking</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{building.parkingSpots || 20}</p>
                    </div>
                  </div>

                  <button className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs rounded-lg group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
                    {t('view_wing_mgmt')}
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vacancy Audit Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowAuditModal(false)} />
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh] border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
                  <ClipboardCheck size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Occupancy Audit</h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Listing {vacancyReport.totalVacant} unregistered units
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search wing..." 
                    className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                  />
                </div>
                <button onClick={() => setShowAuditModal(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"><X size={24} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950/50">
               <div className="space-y-6">
                  {Object.entries(vacancyReport.report)
                    .filter(([wing]) => wing.toLowerCase().includes(auditSearch.toLowerCase()))
                    .map(([wing, flats]: [string, string[]]) => (
                    <div key={wing} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                       <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center font-bold text-brand-600 dark:text-brand-400">
                              {wing}
                            </span>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">Wing {wing} Vacancies</h4>
                          </div>
                          <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded uppercase tracking-wider">
                            {flats.length} Missing Profiles
                          </span>
                       </div>
                       <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                          {flats.map((f: string) => (
                            <div key={f} className="flex flex-col items-center p-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                               <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{f}</span>
                               <Ghost size={12} className="text-slate-300 dark:text-slate-700 mt-1" />
                            </div>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
                <AlertCircle size={16} className="text-amber-500" />
                <span>Units listed have no digital profiles.</span>
              </div>
              <button 
                onClick={() => {
                  api.exportToCSV(
                    Object.entries(vacancyReport.report).flatMap(([wing, flats]: [string, string[]]) => flats.map((f: string) => ({ Wing: wing, Flat: f }))),
                    'Saurashtra_Vacancy_Report'
                  );
                }}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-brand-600/20"
              >
                <Download size={14} /> Download CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wing Map Modal */}
      {selectedBuilding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedBuilding(null)} />
          <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Wing {selectedBuilding.name}</h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Real-time occupancy map</p>
                </div>
              </div>
              <button onClick={() => setSelectedBuilding(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"><X size={28} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950/50 space-y-8">
              <section className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="text-brand-600 dark:text-brand-400" size={20} />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('floor_map')}</h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Owner</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Tenant</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"></div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Vacant</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                    {renderFloorGrid(selectedBuilding)}
                    
                    <div className="mt-6 flex items-center gap-8">
                      <div className="w-20" />
                      <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-500 px-4 py-0.5 border border-slate-200 dark:border-slate-600 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm">
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedFlat(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh] border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
                  <Home size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{t('unit')} {selectedFlat.unitNumber}</h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {selectedFlat.profile ? 'Registered Occupant' : 'Unregistered Profile'}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedFlat(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"><X size={24} /></button>
            </div>

            <div className="p-6 space-y-8 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-950/50">
              {selectedFlat.profile ? (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl border-2 border-slate-100 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-800">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedFlat.profile.name}`} alt="user" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-slate-900 dark:text-white">{selectedFlat.profile.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="px-2 py-0.5 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-[10px] font-bold rounded uppercase tracking-wider">{selectedFlat.profile.occupancyType}</span>
                           <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{selectedFlat.profile.status} Member</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{t('maintenance')} Summary</h4>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Society Dues</p>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Total Balance</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">₹{totalMaintenance}</p>
                      </div>
                      <button 
                        onClick={() => {}} 
                        className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-brand-600/20"
                      >
                        {t('pay_now')}
                      </button>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="py-12 text-center space-y-4">
                   <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700 mx-auto">
                     <Ghost size={40} />
                   </div>
                   <div>
                      <h4 className="text-lg font-bold text-slate-400 dark:text-slate-600 tracking-tight uppercase">No Active Registration</h4>
                      <p className="text-slate-400 dark:text-slate-600 text-xs font-medium max-w-xs mx-auto mt-1">This unit has no registered users in the digital portal.</p>
                   </div>
                   <button className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg font-bold text-xs transition-all hover:bg-slate-200 dark:hover:bg-slate-700">
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
