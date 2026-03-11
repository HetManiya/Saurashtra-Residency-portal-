import React from 'react';
import { Phone, Mail } from 'lucide-react';
import { COMMITTEE } from '../constants';
import { useLanguage } from '../components/LanguageContext';

const Committee: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="pb-8 animate-fade-in">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h3 className="text-5xl font-black mb-4 tracking-tighter text-cyan-400 uppercase glitch-text">
          {t('meet_committee')}
        </h3>
        <p className="text-lg text-cyan-500/70 leading-relaxed font-mono uppercase text-xs tracking-widest">
          The dedicated team working tirelessly to ensure a safe, clean, and happy environment for all residents of Saurashtra Residency.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {COMMITTEE.map((member) => (
          <div 
            key={member.id}
            className="group bg-black p-8 text-center border-4 border-magenta-500 hover:-translate-y-2 shadow-[8px_8px_0px_#00ffff] transition-all duration-500 relative overflow-visible crt-screen"
          >
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 bg-cyan-500 rotate-6 opacity-20 transition-transform duration-500 group-hover:rotate-12" />
              <img 
                src={member.imageUrl} 
                alt={member.name}
                className="w-full h-full border-4 border-cyan-500 shadow-[4px_4px_0px_#ff00ff] object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            
            <h6 className="text-lg font-black mb-1 text-cyan-400 uppercase font-mono glitch-text">{member.name}</h6>
            <span className="text-xs font-black text-magenta-500 uppercase tracking-[0.15em] block mb-6 font-mono">
              {t(member.position.toLowerCase())}
            </span>
            
            <div className="space-y-3">
              <a 
                href={`tel:${member.phone}`}
                className="flex items-center justify-center gap-2 w-full py-2 border-2 border-cyan-500 bg-black text-cyan-500 font-mono font-black text-xs hover:bg-cyan-500 hover:text-black transition-colors shadow-[2px_2px_0px_#ff00ff]"
              >
                <Phone size={16} />
                {member.phone}
              </a>
              <a 
                href={`mailto:${member.email}`}
                className="flex items-center justify-center gap-2 w-full py-2 border-2 border-magenta-500 bg-black text-magenta-500 font-mono font-black text-xs hover:bg-magenta-500 hover:text-black transition-colors shadow-[2px_2px_0px_#00ffff]"
              >
                <Mail size={16} />
                Contact Email
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-black border-4 border-cyan-500 p-8 md:p-12 text-cyan-400 relative overflow-hidden shadow-[12px_12px_0px_#ff00ff] crt-screen">
        <div className="absolute top-0 left-0 right-0 h-2 bg-magenta-500" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h4 className="text-3xl font-black mb-8 uppercase glitch-text">Contact the Office</h4>
            <div className="space-y-8">
              <div>
                <span className="text-xs font-black text-magenta-500 uppercase tracking-[0.15em] block mb-2 font-mono">
                  Primary Address
                </span>
                <h6 className="text-lg font-mono uppercase text-cyan-500/80">
                  Main Office, Saurashtra Residency, Pasodara, Surat - 395013
                </h6>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <span className="text-xs font-black text-magenta-500 uppercase tracking-[0.15em] block mb-2 font-mono">
                    Office Hours
                  </span>
                  <p className="font-mono text-cyan-500/80">Mon - Sat: 9 AM - 6 PM</p>
                </div>
                <div>
                  <span className="text-xs font-black text-magenta-500 uppercase tracking-[0.15em] block mb-2 font-mono">
                    Helpline
                  </span>
                  <h6 className="text-lg font-black text-cyan-400 font-mono"> +91 261 455 6789</h6>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="p-8 border-4 border-magenta-500 bg-black shadow-[8px_8px_0px_#00ffff]">
              <h6 className="text-lg font-black mb-6 text-cyan-400 uppercase font-mono glitch-text">Quick Complaint Message</h6>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <input 
                  type="text"
                  placeholder="Your Name" 
                  className="w-full bg-black border-2 border-cyan-500 px-4 py-3 text-cyan-400 placeholder-cyan-900 font-mono focus:outline-none focus:border-magenta-500 transition-colors"
                />
                <textarea 
                  rows={3}
                  placeholder="Brief your issue..." 
                  className="w-full bg-black border-2 border-cyan-500 px-4 py-3 text-cyan-400 placeholder-cyan-900 font-mono focus:outline-none focus:border-magenta-500 transition-colors"
                />
                <button 
                  type="submit"
                  className="w-full bg-cyan-500 text-black font-black uppercase tracking-widest py-3 border-2 border-black hover:bg-black hover:text-cyan-500 hover:border-cyan-500 transition-all shadow-[4px_4px_0px_#ff00ff]"
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
