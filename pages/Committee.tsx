import React from 'react';
import { Phone, Mail } from 'lucide-react';
import { COMMITTEE } from '../constants';
import { useLanguage } from '../components/LanguageContext';

const Committee: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="pb-12 animate-fade-in">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h3 className="text-4xl font-bold mb-4 tracking-tight text-slate-900 dark:text-white uppercase">
          {t('meet_committee')}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm uppercase tracking-widest">
          The dedicated team working tirelessly to ensure a safe, clean, and happy environment for all residents of Saurashtra Residency.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        {COMMITTEE.map((member) => (
          <div 
            key={member.id}
            className="group bg-white dark:bg-slate-900 p-8 text-center border border-slate-200 dark:border-slate-800 rounded-3xl hover:shadow-xl transition-all duration-500 relative shadow-sm"
          >
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 bg-brand-500/10 rounded-full rotate-6 transition-transform duration-500 group-hover:rotate-12" />
              <img 
                src={member.imageUrl} 
                alt={member.name}
                className="w-full h-full rounded-full border-4 border-white dark:border-slate-800 shadow-lg object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            
            <h6 className="text-lg font-bold mb-1 text-slate-900 dark:text-white uppercase tracking-tight">{member.name}</h6>
            <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest block mb-6">
              {t(member.position.toLowerCase())}
            </span>
            
            <div className="space-y-3">
              <a 
                href={`tel:${member.phone}`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-brand-600 hover:text-white transition-all shadow-sm"
              >
                <Phone size={14} />
                {member.phone}
              </a>
              <a 
                href={`mailto:${member.email}`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-brand-600 hover:text-white transition-all shadow-sm"
              >
                <Mail size={14} />
                Contact Email
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 dark:bg-slate-800 rounded-[2.5rem] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-500" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h4 className="text-3xl font-bold mb-8 uppercase tracking-tight">Contact the Office</h4>
            <div className="space-y-10">
              <div>
                <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest block mb-3">
                  Primary Address
                </span>
                <h6 className="text-lg font-medium text-slate-300 leading-relaxed">
                  Main Office, Saurashtra Residency, Pasodara, Surat - 395013
                </h6>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <div>
                  <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest block mb-3">
                    Office Hours
                  </span>
                  <p className="text-slate-300 font-medium">Mon - Sat: 9 AM - 6 PM</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest block mb-3">
                    Helpline
                  </span>
                  <h6 className="text-xl font-bold text-white"> +91 261 455 6789</h6>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
              <h6 className="text-lg font-bold mb-6 text-slate-900 dark:text-white uppercase tracking-tight">Quick Complaint Message</h6>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
                <input 
                  type="text"
                  placeholder="Your Name" 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-4 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 font-bold text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                />
                <textarea 
                  rows={3}
                  placeholder="Brief your issue..." 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-4 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 font-bold text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                />
                <button 
                  type="submit"
                  className="w-full bg-brand-600 text-white font-bold uppercase tracking-widest py-4 rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-95"
                >
                  Submit Report
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Committee;
