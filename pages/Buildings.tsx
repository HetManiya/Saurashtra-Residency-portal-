
import React, { useState, useEffect, useMemo } from 'react';
// Added 'Download' to lucide-react imports to fix the error: Cannot find name 'Download'
import { Search, Building2, ChevronRight, Zap, Droplets, MapPin, LayoutGrid, Home, Loader2, Users, X, User, Phone, Calendar, Briefcase, Info, Edit3, Save, CheckCircle2, Trash2, PlusCircle, Star, ShieldCheck, Wallet, CreditCard, ArrowRight, MessageSquare, AlertCircle, History, Receipt, Ghost, FileText, ClipboardCheck, Filter, Download } from 'lucide-react';
import { api } from '../services/api';
import { SOCIETY_INFO, BUILDINGS as WING_CONSTANTS } from '../constants';
import { FlatType, Building, Flat, FamilyMember, OccupancyType, PaymentStatus, MaintenanceRecord } from '../types';
import { useLanguage } from '../components/LanguageContext';

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
  
  useEffect(() => {
    const stored = localStorage.getItem('sr_user');
    if (stored) setUser(JSON.parse(stored));
    loadBuildingsAndOccupancy();
  }, []);

  const loadBuildingsAndOccupancy = async () => {
    setLoading(true);
    try {
      const [bData, oData] = await Promise.all([
        api.getBuildings(),
        api.getOccupancyData()
      ]);
      setBuildings(bData);
      setRegisteredUnits(oData);
    } catch (e) {
      console.error(e);
    } finally {
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
        <Loader2 className="animate-spin text-brand-600 mb-4" size={40} />
        <p className="font-black uppercase tracking-widest text-xs text-slate-400">Auditing Society Assets...</p>
      </div>
    );
  }

  const { total } = api.calculateMaintenanceWithPenalty(SOCIETY_INFO.maintenanceAmount);

  return (
    <div className="space-y-10 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t('residential_infra')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Real-time occupancy tracking for Pasodara portal</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 items-center">
          <div className="flex gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 px-6 py-3 rounded-2xl text-center">
               <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-1">Registered</p>
               <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 leading-none">{occupiedCount}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-6 py-3 rounded-2xl text-center">
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Vacant</p>
               <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{vacantCount}</p>
            </div>
          </div>
          {isAdmin && (
            <button 
              onClick={() => setShowAuditModal(true)}
              className="px-6 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-3xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-brand-600 transition-all shadow-xl"
            >
              <FileText size={18} /> Vacancy Report
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredBuildings.map((building) => {
          const wingOccupied = registeredUnits.filter(p => p.flatId.startsWith(building.name)).length;
          return (
            <div 
              key={building.id} 
              className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm premium-card flex flex-col cursor-pointer"
              onClick={() => setSelectedBuilding(building)}
            >
              <div className={`h-2.5 w-full transition-colors duration-500 ${building.type === '1BHK' ? 'bg-blue-500' : 'bg-indigo-600'}`} />
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
                    <Building2 size={28} />
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-slate-100 dark:border-slate-800 text-slate-500 mb-2">
                      {building.type}
                    </div>
                    <p className="text-[9px] font-black text-brand-600 uppercase tracking-widest">{wingOccupied}/20 Registered</p>
                  </div>
                </div>
                
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-6 group-hover:text-brand-600 transition-colors">Wing {building.name}</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1 flex items-center gap-1"><LayoutGrid size={10} /> Floors</p>
                    <p className="text-xl font-black">5</p>
                  </div>
                  <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1 flex items-center gap-1"><Home size={10} /> Parking</p>
                    <p className="text-xl font-black">{building.parkingSpots || 20}</p>
                  </div>
                </div>

                <button className="w-full flex items-center justify-between px-6 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest group-hover:bg-brand-600 transition-all duration-300">
                  {t('view_wing_mgmt')}
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vacancy Audit Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowAuditModal(false)} />
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800 flex flex-col max-h-[85vh]">
            <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10 gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-slate-900 dark:bg-brand-600 rounded-3xl flex items-center justify-center text-white shadow-xl">
                  <ClipboardCheck size={32} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Detailed Occupancy Audit</h3>
                  <p className="text-[10px] font-black uppercase text-brand-600 tracking-widest">
                    Listing {vacancyReport.totalVacant} Unregistered units across 24 wings
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search Wing..." 
                    className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                  />
                </div>
                <button onClick={() => setShowAuditModal(false)} className="p-3 text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"><X size={28} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50 dark:bg-slate-900/50">
               <div className="space-y-8">
                  {/* Fixed TypeScript error by adding explicit type annotation for entries to avoid 'unknown' flats array */}
                  {Object.entries(vacancyReport.report)
                    .filter(([wing]) => wing.toLowerCase().includes(auditSearch.toLowerCase()))
                    .map(([wing, flats]: [string, string[]]) => (
                    <div key={wing} className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                       <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <span className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center font-black text-slate-400">
                              {wing}
                            </span>
                            <h4 className="text-xl font-black tracking-tight">Wing {wing} Vacancies</h4>
                          </div>
                          <span className="text-[10px] font-black bg-rose-50 text-rose-600 px-3 py-1 rounded-lg uppercase tracking-widest">
                            {flats.length} Missing Profiles
                          </span>
                       </div>
                       <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                          {flats.map((f: string) => (
                            <div key={f} className="flex flex-col items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-transparent hover:border-brand-600/30 transition-all cursor-default">
                               <span className="text-sm font-black text-slate-400">{f}</span>
                               <Ghost size={12} className="text-slate-300 mt-1" />
                            </div>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3 text-slate-500 text-xs font-bold">
                <AlertCircle size={16} className="text-amber-500" />
                <span>Units listed here have no entry in the digital profiles table.</span>
              </div>
              <button 
                onClick={() => {
                  {/* Fixed TypeScript error by adding explicit type annotation for entries */}
                  api.exportToCSV(
                    Object.entries(vacancyReport.report).flatMap(([wing, flats]: [string, string[]]) => flats.map((f: string) => ({ Wing: wing, Flat: f }))),
                    'Saurashtra_Vacancy_Report'
                  );
                }}
                className="px-6 py-3 bg-brand-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2"
              >
                <Download size={14} /> Download List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wing Map Modal */}
      {selectedBuilding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setSelectedBuilding(null)} />
          <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
            <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-brand-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-brand-500/20">
                  <Building2 size={32} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Wing {selectedBuilding.name}</h3>
                  <p className="text-xs font-black uppercase text-brand-600 tracking-widest">Real-Time Occupancy Map</p>
                </div>
              </div>
              <button onClick={() => setSelectedBuilding(null)} className="p-4 text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-3xl transition-all"><X size={32} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30 dark:bg-slate-900/30 space-y-12">
              <section className="space-y-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <LayoutGrid className="text-brand-600" size={24} />
                    <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-widest text-xs">{t('floor_map')}</h4>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-emerald-500 shadow-sm"></div>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Registered Owner</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-blue-500 shadow-sm"></div>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Registered Tenant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"></div>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Unregistered / Vacant</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800/40 p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800/60 shadow-inner">
                  <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                    {renderFloorGrid(selectedBuilding)}
                    
                    <div className="mt-6 flex items-center gap-8">
                      <div className="w-20" />
                      <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl">
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
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setSelectedFlat(null)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800 flex flex-col max-h-[85vh]">
            <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-slate-900 dark:bg-brand-600 rounded-2xl flex items-center justify-center text-white">
                  <Home size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{t('unit')} {selectedFlat.unitNumber}</h3>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    {selectedFlat.profile ? 'Registered Occupant' : 'Unregistered Profile'}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedFlat(null)} className="p-3 text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"><X size={28} /></button>
            </div>

            <div className="p-10 space-y-12 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-900/50">
              {selectedFlat.profile ? (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-brand-50 dark:bg-brand-900/10 rounded-[2rem] overflow-hidden flex items-center justify-center">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedFlat.profile.name}`} alt="user" />
                      </div>
                      <div>
                        <p className="font-black text-2xl text-slate-900 dark:text-white tracking-tight">{selectedFlat.profile.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                           <span className="px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-lg text-[9px] font-black uppercase text-slate-400 border border-slate-100 dark:border-slate-700">{selectedFlat.profile.occupancyType}</span>
                           <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">{selectedFlat.profile.status} Member</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <section className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-brand-600 text-white rounded-2xl flex items-center justify-center">
                        <CreditCard size={24} />
                      </div>
                      <div>
                        <h4 className="text-lg font-black tracking-tight">{t('maintenance')} Summary</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Society Dues</p>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Standard Maintenance</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">₹{total}</p>
                      </div>
                      <button 
                        onClick={() => {}} 
                        className="px-10 py-4 bg-brand-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-brand-700 transition-all flex items-center gap-3"
                      >
                        {t('pay_now')}
                      </button>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="py-20 text-center space-y-6">
                   <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-[3rem] flex items-center justify-center text-slate-300 dark:text-slate-600 mx-auto border-4 border-dashed border-slate-200 dark:border-slate-700">
                     <Ghost size={64} />
                   </div>
                   <div>
                      <h4 className="text-2xl font-black text-slate-400 dark:text-slate-600 tracking-tight">No Active Registration</h4>
                      <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2">This unit has no registered users in the digital portal. Dues are tracked against the property.</p>
                   </div>
                   <button className="px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105">
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
