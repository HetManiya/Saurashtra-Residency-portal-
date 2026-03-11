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
    <div className="pb-8 animate-fade-in crt-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-6 border-b-4 border-cyan-500/30">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="px-2 py-1 border-2 border-magenta-500 bg-black flex items-center gap-2">
              <ShieldAlert size={14} className="text-magenta-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-magenta-500">
                Immediate Response Only
              </span>
            </div>
          </div>
          <h3 className="text-4xl font-black tracking-tighter text-cyan-400 glitch-text" data-text="Digital Intercom">
            Digital <span className="text-magenta-500">Intercom</span>
          </h3>
          <p className="text-cyan-700 font-bold font-mono uppercase text-xs mt-2">
            {`> ACCESSING_EMERGENCY_PROTOCOLS_v2.4`}
          </p>
        </div>
        <button 
          onClick={handleSOS}
          className="flex items-center gap-2 bg-magenta-500 text-white px-8 py-3 border-2 border-black font-black text-sm uppercase tracking-widest hover:bg-black hover:text-magenta-500 hover:border-magenta-500 transition-all shadow-[6px_6px_0px_#00ffff] active:scale-95 transform duration-100"
        >
          <AlertTriangle size={20} fill="currentColor" />
          Trigger SOS
        </button>
      </div>

      <div className="mb-8">
        <div className="bg-black border-2 border-cyan-900/30 p-1 inline-flex">
          {['Emergency', 'Resident Directory'].map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === idx 
                  ? 'bg-cyan-400 text-black shadow-[2px_2px_0px_#ff00ff]' 
                  : 'text-cyan-700 hover:text-cyan-400'
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
                <div className="w-1.5 h-6 bg-magenta-500 shadow-[2px_0px_0px_#00ffff]" />
                <h4 className="text-xl font-black text-cyan-400 uppercase tracking-tight">{section.title}</h4>
              </div>
              
              <div className="space-y-4">
                {section.contacts.map((contact, cIdx) => (
                  <div 
                    key={cIdx} 
                    className={`group bg-black p-5 border-4 transition-all duration-300 hover:shadow-[8px_8px_0px_#00ffff] flex items-center justify-between ${
                      contact.critical 
                        ? 'border-magenta-500' 
                        : 'border-cyan-500/30 hover:border-cyan-500'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 border-2 border-current bg-black flex items-center justify-center transition-transform group-hover:scale-110 ${contact.color}`}>
                        <contact.icon size={24} />
                      </div>
                      <div>
                        <h5 className="text-base font-black text-cyan-400 leading-tight mb-1 uppercase">
                          {contact.name}
                        </h5>
                        <p className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider font-mono">
                          {`> ${contact.desc}`}
                        </p>
                      </div>
                    </div>
                    
                    <a 
                      href={`tel:${contact.number.replace(/\s+/g, '')}`}
                      className={`flex items-center gap-2 px-4 py-2 border-2 border-black font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0px_#00ffff] transition-all active:scale-95 ${
                        contact.critical 
                          ? 'bg-magenta-500 text-white hover:bg-black hover:text-magenta-500 hover:border-magenta-500' 
                          : 'bg-cyan-400 text-black hover:bg-black hover:text-cyan-400 hover:border-cyan-400'
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
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700">
                <Search size={20} />
              </div>
              <input 
                type="text"
                placeholder="Search by name or unit number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border-4 border-cyan-500 pl-12 pr-4 py-4 text-cyan-400 placeholder:text-cyan-900 font-bold outline-none focus:border-magenta-500 transition-all shadow-[6px_6px_0px_#ff00ff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResidents.map(resident => (
              <div 
                key={resident.id}
                className="bg-black p-6 border-4 border-cyan-500/30 transition-all duration-300 hover:border-magenta-500 hover:shadow-[10px_10px_0px_#00ffff] group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 border-2 border-cyan-900/30 bg-black flex items-center justify-center text-cyan-700 group-hover:border-magenta-500 group-hover:text-magenta-500 transition-colors">
                    <User size={28} />
                  </div>
                  <span className="bg-cyan-900/20 border border-cyan-500 text-cyan-400 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                    {resident.unit}
                  </span>
                </div>
                
                <div className="mb-6">
                  <h5 className="text-lg font-black text-cyan-400 mb-1 uppercase tracking-tight">{resident.name}</h5>
                  <p className="text-[10px] font-black text-magenta-500 uppercase tracking-widest font-mono">
                    {`// ${resident.role}`}
                  </p>
                </div>

                <a 
                  href={`tel:${resident.phone}`}
                  className="w-full bg-black border-2 border-cyan-900/30 text-cyan-700 hover:bg-cyan-400 hover:text-black hover:border-black py-3 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[4px_4px_0px_#ff00ff] active:scale-95"
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
