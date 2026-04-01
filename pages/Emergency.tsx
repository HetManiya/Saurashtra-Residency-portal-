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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider rounded">
              Immediate Response Only
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Emergency Contacts
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Quick access to emergency services and resident directory
          </p>
        </div>
        <button 
          onClick={handleSOS}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-red-600/20 active:scale-95"
        >
          <AlertTriangle size={18} />
          Trigger SOS
        </button>
      </div>

      <div className="mb-8">
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl inline-flex">
          {['Emergency', 'Resident Directory'].map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === idx 
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {emergencySections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-6">
              <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">{section.title}</h4>
              
              <div className="space-y-4">
                {section.contacts.map((contact, cIdx) => (
                  <div 
                    key={cIdx} 
                    className={`group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:-translate-y-1 ${
                      contact.critical ? 'ring-2 ring-red-500/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                        contact.critical 
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                          : 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                      }`}>
                        <contact.icon size={22} />
                      </div>
                      <div className="flex-1">
                        <h5 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                          {contact.name}
                        </h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {contact.desc}
                        </p>
                      </div>
                    </div>
                    
                    <a 
                      href={`tel:${contact.number.replace(/\s+/g, '')}`}
                      className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-bold text-sm transition-all ${
                        contact.critical 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Phone size={14} />
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
          <div className="max-w-md mb-8">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={18} />
              </div>
              <input 
                type="text"
                placeholder="Search by name or unit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 pl-11 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResidents.map(resident => (
              <div 
                key={resident.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:-translate-y-1 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/20 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    <User size={24} />
                  </div>
                  <span className="bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {resident.unit}
                  </span>
                </div>
                
                <div className="mb-6">
                  <h5 className="text-lg font-bold text-slate-900 dark:text-white mb-0.5">{resident.name}</h5>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {resident.role}
                  </p>
                </div>

                <a 
                  href={`tel:${resident.phone}`}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-600/20"
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
