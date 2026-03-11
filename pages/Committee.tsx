import React from 'react';
import { Phone, Mail } from 'lucide-react';
import { COMMITTEE } from '../constants';
import { useLanguage } from '../components/LanguageContext';

const Committee: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="pb-8 animate-fade-in">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h3 className="text-4xl font-black mb-4 tracking-tighter text-slate-900 dark:text-white">
          {t('meet_committee')}
        </h3>
        <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
          The dedicated team working tirelessly to ensure a safe, clean, and happy environment for all residents of Saurashtra Residency.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {COMMITTEE.map((member) => (
          <div 
            key={member.id}
            className="group bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 text-center border border-slate-200 dark:border-slate-800 hover:-translate-y-2 hover:shadow-xl transition-all duration-500 relative overflow-visible"
          >
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 bg-brand-600 rounded-2xl rotate-6 opacity-10 transition-transform duration-500 group-hover:rotate-12" />
              <img 
                src={member.imageUrl} 
                alt={member.name}
                className="w-full h-full rounded-2xl border-4 border-white dark:border-slate-900 shadow-lg object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            
            <h6 className="text-lg font-black mb-1 text-slate-900 dark:text-white">{member.name}</h6>
            <span className="text-xs font-black text-brand-600 uppercase tracking-[0.15em] block mb-6">
              {t(member.position.toLowerCase())}
            </span>
            
            <div className="space-y-3">
              <a 
                href={`tel:${member.phone}`}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs hover:bg-brand-50 dark:hover:bg-slate-700 hover:text-brand-600 transition-colors"
              >
                <Phone size={16} />
                {member.phone}
              </a>
              <a 
                href={`mailto:${member.email}`}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs hover:bg-brand-50 dark:hover:bg-slate-700 hover:text-brand-600 transition-colors"
              >
                <Mail size={16} />
                Contact Email
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h4 className="text-3xl font-black mb-8">Contact the Office</h4>
            <div className="space-y-8">
              <div>
                <span className="text-xs font-black text-slate-500 uppercase tracking-[0.15em] block mb-2">
                  Primary Address
                </span>
                <h6 className="text-lg font-medium">
                  Main Office, Saurashtra Residency, Pasodara, Surat - 395013
                </h6>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-[0.15em] block mb-2">
                    Office Hours
                  </span>
                  <p>Mon - Sat: 9 AM - 6 PM</p>
                </div>
                <div>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-[0.15em] block mb-2">
                    Helpline
                  </span>
                  <h6 className="text-lg font-black text-brand-400">+91 261 455 6789</h6>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <h6 className="text-lg font-bold mb-6 text-white">Quick Complaint Message</h6>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <input 
                  type="text"
                  placeholder="Your Name" 
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-brand-500 transition-colors"
                />
                <textarea 
                  rows={3}
                  placeholder="Brief your issue..." 
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-brand-500 transition-colors"
                />
                <button 
                  type="submit"
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black uppercase tracking-widest py-3 rounded-xl transition-colors"
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
