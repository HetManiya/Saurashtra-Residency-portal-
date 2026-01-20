import React, { useState, useEffect } from 'react';
import { Search, Building2, ChevronRight, Zap, Droplets, MapPin, LayoutGrid, Home, Loader2, Users, X, User, Phone, Calendar, Briefcase, Info, Edit3, Save, CheckCircle2, Trash2, PlusCircle, Star, ShieldCheck, Wallet, CreditCard, ArrowRight, MessageSquare, AlertCircle, History, Receipt } from 'lucide-react';
import { api } from '../services/api';
import { SOCIETY_INFO } from '../constants';
import { FlatType, Building, Flat, FamilyMember, OccupancyType, PaymentStatus, MaintenanceRecord } from '../types';
import { useLanguage } from '../components/LanguageContext';

const Buildings: React.FC = () => {
  const { t } = useLanguage();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedFlat, setSelectedFlat] = useState<Flat | null>(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceRecord[]>([]);
  const [user, setUser] = useState<any>(null);
  
  // Member Management State
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<FamilyMember | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberData, setNewMemberData] = useState<Partial<FamilyMember>>({
    relation: 'Other' as any,
    profession: ''
  });
  
  // Payment State
  const [isPaying, setIsPaying] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('sr_user');
    if (stored) setUser(JSON.parse(stored));
    loadBuildings();
  }, []);

  useEffect(() => {
    if (selectedFlat && selectedBuilding) {
      const flatId = `${selectedBuilding.name}-${selectedFlat.unitNumber}`;
      api.getMaintenanceRecords(flatId).then(setMaintenanceHistory);
    } else {
      setMaintenanceHistory([]);
    }
  }, [selectedFlat, selectedBuilding]);

  const loadBuildings = async () => {
    try {
      const data = await api.getBuildings();
      setBuildings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'COMMITTEE';

  const filteredBuildings = buildings.filter(b => {
    const name = b.name || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-brand-600 mb-4" size={40} />
        <p className="font-black uppercase tracking-widest text-xs text-slate-400">Syncing Assets...</p>
      </div>
    );
  }

  const { total, penalty, isOverdue } = api.calculateMaintenanceWithPenalty(SOCIETY_INFO.maintenanceAmount);

  return (
    <div className="space-y-10 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t('residential_infra')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Managing all 24 wings of Saurashtra Residency</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder={t('search_wing')}
              className="pl-12 pr-6 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[18px] focus:outline-none focus:border-brand-600 w-full sm:w-72 transition-all font-medium text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredBuildings.map((building) => (
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
                <div className="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-slate-100 dark:border-slate-800 text-slate-500">
                  {building.type}
                </div>
              </div>
              
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-6 group-hover:text-brand-600 transition-colors">Wing {building.name}</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1 flex items-center gap-1"><LayoutGrid size={10} /> {building.totalFloors} Floors</p>
                  <p className="text-xl font-black">{building.flats?.length || 20} {t('unit')}s</p>
                </div>
                <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1 flex items-center gap-1"><Home size={10} /> Parking</p>
                  <p className="text-xl font-black">{building.parkingSpots}</p>
                </div>
              </div>

              <div className="mt-auto space-y-4">
                <button className="w-full flex items-center justify-between px-6 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest group-hover:bg-brand-600 transition-all duration-300">
                  {t('view_wing_mgmt')}
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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
                  <p className="text-xs font-black uppercase text-brand-600 tracking-widest">{t('leadership')} & {t('infrastructure')}</p>
                </div>
              </div>
              <button onClick={() => setSelectedBuilding(null)} className="p-4 text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-3xl transition-all"><X size={32} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30 dark:bg-slate-900/30 space-y-12">
              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Star className="text-amber-500" size={24} fill="currentColor" />
                  <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-widest text-xs">{t('wing_committee')}</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { role: t('president'), member: selectedBuilding.wingCommittee?.president },
                    { role: t('vp'), member: selectedBuilding.wingCommittee?.vicePresident },
                    { role: t('treasurer'), member: selectedBuilding.wingCommittee?.treasurer }
                  ].map((lead, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-50 dark:border-slate-700 bg-slate-50 shrink-0">
                        <img src={lead.member?.imageUrl} alt={lead.member?.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase text-brand-600 tracking-widest mb-1">{lead.role}</p>
                        <h5 className="font-black text-slate-900 dark:text-white truncate">{lead.member?.name}</h5>
                        <a href={`tel:${lead.member?.phone}`} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-brand-600 transition-colors mt-1">
                          <Phone size={12} /> {lead.member?.phone}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{t('total_units')}</p>
                  <p className="text-3xl font-black">20 {t('unit')}s</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Parking</p>
                  <p className="text-3xl font-black">{selectedBuilding.parkingSpots}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Type</p>
                  <p className="text-3xl font-black">{selectedBuilding.type}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Lifts</p>
                  <p className="text-3xl font-black">1</p>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <LayoutGrid className="text-brand-600" size={24} />
                  <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-widest text-xs">{t('floor_map')}</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
                  {selectedBuilding.flats?.map((flat) => (
                    <button 
                      key={flat.id}
                      onClick={() => setSelectedFlat(flat)}
                      className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-transparent hover:border-brand-600 hover:shadow-xl transition-all group relative overflow-hidden"
                    >
                      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-brand-600 shadow-inner mb-3">
                        <Home size={24} />
                      </div>
                      <span className="font-black text-lg text-slate-900 dark:text-white mb-1">{flat.unitNumber}</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${flat.occupancyType === OccupancyType.OWNER ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/10' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/10'}`}>
                        {flat.occupancyType}
                      </span>
                      <div className="mt-2 text-[8px] font-bold text-slate-400">{flat.members.length} {t('residents')}</div>
                    </button>
                  ))}
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
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('residents')}</p>
                </div>
              </div>
              <button onClick={() => setSelectedFlat(null)} className="p-3 text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"><X size={28} /></button>
            </div>

            <div className="p-10 space-y-12 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="space-y-4">
                {selectedFlat.members.map((member) => (
                  <div key={member.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/10 rounded-2xl flex items-center justify-center text-brand-600">
                        <User size={24} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white">{member.name}</p>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          {t(member.relation)} • {t(member.profession)}
                        </p>
                      </div>
                    </div>
                    <a href={`tel:${member.phone}`} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-400 hover:text-brand-600 transition-all">
                      <Phone size={18} />
                    </a>
                  </div>
                ))}
              </div>

              <section className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-brand-600 text-white rounded-2xl flex items-center justify-center">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black tracking-tight">{t('maintenance')} Due</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Cycle</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Final Payable</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">₹{total}</p>
                  </div>
                  
                  {(isAdmin || (user?.flatId && selectedFlat.id === `flat-${user.flatId}`)) && (
                    <button 
                      onClick={() => {}} // Placeholder for payment
                      className="px-10 py-4 bg-brand-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-brand-700 transition-all flex items-center gap-3"
                    >
                      {t('pay_now')}
                    </button>
                  )}
                </div>
              </section>

              {/* Maintenance History Section */}
              {maintenanceHistory.length > 0 && (
                <section>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 tracking-tight">
                    <History size={20} className="text-brand-600" />
                    Payment History
                  </h4>
                  <div className="space-y-4">
                    {maintenanceHistory.map((record) => (
                      <div key={record.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:border-brand-200 dark:hover:border-slate-600 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                             record.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 
                             record.status === 'Overdue' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20' : 
                             'bg-amber-50 text-amber-600 dark:bg-amber-900/20'
                          }`}>
                            {record.status === 'Paid' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white text-sm">
                              {record.month} {record.year}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                              {record.paidDate ? `Paid: ${new Date(record.paidDate).toLocaleDateString()}` : 'Pending Payment'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900 dark:text-white">₹{record.amount}</p>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${
                            record.status === 'Paid' ? 'text-emerald-500' : 
                            record.status === 'Overdue' ? 'text-rose-500' : 'text-amber-500'
                          }`}>
                            {record.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Buildings;