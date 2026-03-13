import React, { useState } from 'react';
import { 
  Siren, 
  Flame, 
  Stethoscope, 
  PhoneCall, 
  ShieldAlert, 
  Phone, 
  AlertTriangle,
  HeartPulse,
  Search,
  User,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';

interface Contact {
  name: string;
  number: string;
  icon: React.ElementType;
  color: string;
  desc?: string;
  critical?: boolean;
}

interface Resident {
  id: string;
  name: string;
  unit: string;
  phone: string;
  role: string;
}

const Emergency: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const emergencySections = [
    {
      title: "Public Safety",
      contacts: [
        { name: "Police Emergency", number: "100", icon: Siren, color: "text-blue-500", critical: true, desc: "Pasodara Police Station Dispatch" },
        { name: "Fire Department", number: "101", icon: Flame, color: "text-red-500", critical: true, desc: "Kamrej Fire Brigade Services" },
        { name: "Child Helpline", number: "1098", icon: HeartPulse, color: "text-green-500", desc: "National Child Protection Services" },
      ]
    },
    {
      title: "Medical & Hospitals",
      contacts: [
        { name: "Ambulance", number: "108", icon: PhoneCall, color: "text-red-400", critical: true, desc: "24/7 Medical Emergency Response" },
        { name: "Suncity Hospital", number: "+91 261 270 8000", icon: Stethoscope, color: "text-brand-600", desc: "Nearest Multi-speciality Hospital" },
        { name: "Lifeline Clinic", number: "+91 99044 12345", icon: Stethoscope, color: "text-brand-400", desc: "Primary Care near Residency" },
      ]
    },
    {
      title: "Society Support",
      contacts: [
        { name: "Main Security (Gate 1)", number: "0261-4040-1", icon: ShieldAlert, color: "text-slate-900 dark:text-white", desc: "Visitor entry & Security Head" },
        { name: "Security (Gate 2)", number: "0261-4040-2", icon: ShieldAlert, color: "text-slate-900 dark:text-white", desc: "Canal road gate monitoring" },
        { name: "Society Manager", number: "+91 98765 43210", icon: Phone, color: "text-brand-600", desc: "Admin & Office complaints" },
      ]
    }
  ];

  const residents: Resident[] = [
    { id: '1', name: 'Rajesh Patel', unit: 'A-101', phone: '+91 98765 43210', role: 'Chairman' },
    { id: '2', name: 'Amit Shah', unit: 'A-102', phone: '+91 98765 43211', role: 'Secretary' },
    { id: '3', name: 'Suresh Mehta', unit: 'B-201', phone: '+91 98765 43212', role: 'Resident' },
    { id: '4', name: 'Vijay Kumar', unit: 'C-305', phone: '+91 98765 43213', role: 'Resident' },
    { id: '5', name: 'Deepak Jha', unit: 'D-402', phone: '+91 98765 43214', role: 'Resident' },
  ];

  const filteredResidents = residents.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.unit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSOS = () => {
    if (confirm("Trigger SOS Alert? This will notify security and emergency contacts immediately.")) {
      alert("SOS Alert Sent! Security is on the way.");
    }
  };

  return (
    <div className="pb-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="px-2 py-1 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 flex items-center gap-2">
              <ShieldAlert size={14} className="text-red-600 dark:text-red-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400">
                Immediate Response Only
              </span>
            </div>
          </div>
          <h3 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
            Digital Intercom
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Quick access to emergency services and resident directory
          </p>
        </div>
        <button 
          onClick={handleSOS}
          aria-label="Trigger SOS Emergency Alert"
          className="flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 active:scale-95 transform duration-100"
        >
          <AlertTriangle size={20} fill="currentColor" />
          Trigger SOS
        </button>
      </div>

      <div className="mb-8">
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl inline-flex">
          {['Emergency', 'Resident Directory'].map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              aria-label={`Switch to ${tab} tab`}
              aria-selected={activeTab === idx}
              role="tab"
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === idx 
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {emergencySections.map((section, sIdx) => (
            <div key={sIdx}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-brand-600 rounded-full" />
                <h4 className="text-xl font-black text-slate-900 dark:text-white">{section.title}</h4>
              </div>
              
              <div className="space-y-4">
                {section.contacts.map((contact, cIdx) => (
                  <div 
                    key={cIdx} 
                    className={`group bg-white dark:bg-slate-900 p-5 rounded-[2rem] border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-center justify-between ${
                      contact.critical 
                        ? 'border-l-4 border-l-red-500 border-slate-200 dark:border-slate-800' 
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 bg-slate-50 dark:bg-slate-800 ${contact.color}`}>
                        <contact.icon size={24} />
                      </div>
                      <div>
                        <h5 className="text-base font-black text-slate-900 dark:text-white leading-tight mb-1">
                          {contact.name}
                        </h5>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {contact.desc}
                        </p>
                      </div>
                    </div>
                    
                    <a 
                      href={`tel:${contact.number.replace(/\s+/g, '')}`}
                      aria-label={`Call ${contact.name} at ${contact.number}`}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md transition-colors ${
                        contact.critical 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-brand-600 hover:bg-brand-700 text-white'
                      }`}
                    >
                      <Phone size={14} fill="currentColor" />
                      {contact.number}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="max-w-xl mb-8">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={20} />
              </div>
              <input 
                type="text"
                placeholder="Search by name or unit number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] pl-12 pr-4 py-4 text-slate-900 dark:text-white placeholder-slate-400 font-bold focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResidents.map(resident => (
              <div 
                key={resident.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:border-brand-500 hover:shadow-lg group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    <User size={28} />
                  </div>
                  <span className="bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                    {resident.unit}
                  </span>
                </div>
                
                <div className="mb-6">
                  <h5 className="text-lg font-black text-slate-900 dark:text-white mb-1">{resident.name}</h5>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {resident.role}
                  </p>
                </div>

                <a 
                  href={`tel:${resident.phone}`}
                  aria-label={`Call ${resident.name} at ${resident.phone}`}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-brand-600 hover:text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone size={14} />
                  Call Resident
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Emergency;
