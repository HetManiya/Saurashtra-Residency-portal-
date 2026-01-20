
import React from 'react';
import { 
  Siren, 
  Flame, 
  Stethoscope, 
  PhoneCall, 
  Zap, 
  Droplets, 
  ShieldAlert, 
  ArrowUpCircle, 
  Phone, 
  MessageSquare,
  AlertTriangle,
  HeartPulse,
  Wrench,
  Construction
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

const Emergency: React.FC = () => {
  const { t } = useLanguage();
  const sections = [
    {
      title: "Public Safety",
      contacts: [
        { name: "Police Emergency", number: "100", icon: Siren, color: "text-blue-600", critical: true, desc: "Pasodara Police Station Dispatch" },
        { name: "Fire Department", number: "101", icon: Flame, color: "text-rose-600", critical: true, desc: "Kamrej Fire Brigade Services" },
        { name: "Child Helpline", number: "1098", icon: HeartPulse, color: "text-emerald-600", desc: "National Child Protection Services" },
      ]
    },
    {
      title: "Medical & Hospitals",
      contacts: [
        { name: "Ambulance", number: "108", icon: PhoneCall, color: "text-rose-500", critical: true, desc: "24/7 Medical Emergency Response" },
        { name: "Suncity Hospital", number: "+91 261 270 8000", icon: Stethoscope, color: "text-brand-600", desc: "Nearest Multi-speciality Hospital" },
        { name: "Lifeline Clinic", number: "+91 99044 12345", icon: Stethoscope, color: "text-brand-500", desc: "Primary Care near Residency" },
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

  return (
    <div className="space-y-10 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-full w-fit">
            <ShieldAlert size={14} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Immediate Response Only</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tighter">{t('emergency_contacts')}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Verified local help for Saurashtra Residency residents</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-8">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <span className="w-1.5 h-6 bg-brand-600 rounded-full"></span>
              {section.title}
            </h2>
            
            <div className="space-y-4">
              {section.contacts.map((contact, cIdx) => (
                <div 
                  key={cIdx} 
                  className={`group bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 premium-card premium-shadow flex items-center justify-between transition-all ${contact.critical ? 'border-l-4 border-l-rose-500' : ''}`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl ${contact.color} transition-transform group-hover:scale-110`}>
                      <contact.icon size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-lg leading-none mb-1">{contact.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{contact.desc}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <a 
                      href={`tel:${contact.number.replace(/\s+/g, '')}`}
                      className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${
                        contact.critical 
                        ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-500/20' 
                        : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-500/20'
                      }`}
                    >
                      <Phone size={14} fill="currentColor" />
                      {contact.number}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Emergency;
