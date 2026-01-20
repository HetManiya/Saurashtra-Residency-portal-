
import React from 'react';
import { Phone, Mail, Linkedin, Twitter, MessageSquare } from 'lucide-react';
import { COMMITTEE } from '../constants';
import { useLanguage } from '../components/LanguageContext';

const Committee: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{t('meet_committee')}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
          The dedicated team working tirelessly to ensure a safe, clean, and happy environment for all residents of Saurashtra Residency.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {COMMITTEE.map((member) => (
          <div key={member.id} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 bg-blue-600 rounded-[2rem] rotate-6 group-hover:rotate-12 transition-transform duration-500 opacity-20" />
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-700 shadow-xl">
                <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
            </div>
            
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1">{member.name}</h3>
            <p className="text-blue-600 dark:text-brand-400 font-bold text-sm uppercase tracking-widest mb-6">{t(member.position.toLowerCase())}</p>
            
            <div className="space-y-3">
              <a href={`tel:${member.phone}`} className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-brand-900/20 hover:text-blue-600 transition-colors text-sm font-bold">
                <Phone size={16} />
                {member.phone}
              </a>
              <a href={`mailto:${member.email}`} className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-brand-900/20 hover:text-blue-600 transition-colors text-sm font-bold">
                <Mail size={16} />
                Contact Email
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-black mb-6">Contact the Office</h2>
            <div className="space-y-6">
              <div>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Primary Address</p>
                <p className="text-xl">Main Office, Saurashtra Residency, Pasodara, Surat - 395013</p>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Office Hours</p>
                  <p>Mon - Sat: 9 AM - 6 PM</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Helpline</p>
                  <p className="font-bold text-blue-400">+91 261 455 6789</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
             <h4 className="text-xl font-bold mb-4">Quick Complaint Message</h4>
             <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
               <input type="text" placeholder="Your Name" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-400" />
               <textarea placeholder="Brief your issue..." rows={3} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-400 resize-none"></textarea>
               <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl uppercase tracking-widest transition-colors">Submit Report</button>
             </form>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600" />
      </div>
    </div>
  );
};

export default Committee;
