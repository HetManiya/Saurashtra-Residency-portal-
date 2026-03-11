import React, { useState } from 'react';
import { PieChart, Plus, CheckCircle2, Clock, X, Send, Lock } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  status: 'Active' | 'Closed';
  endDate: string;
  userVoted?: string; // ID of the option user voted for
}

const Polls: React.FC = () => {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [polls, setPolls] = useState<Poll[]>([
    {
      id: 'P-101',
      question: 'Should we install solar panels on Wing A & B terrace?',
      options: [
        { id: '1', text: 'Yes, absolutely', votes: 45 },
        { id: '2', text: 'No, too expensive', votes: 12 },
        { id: '3', text: 'Need more info', votes: 8 }
      ],
      totalVotes: 65,
      status: 'Active',
      endDate: '2024-06-15'
    },
    {
      id: 'P-100',
      question: 'Preferred date for Annual Cultural Fest?',
      options: [
        { id: '1', text: 'Dec 24-25', votes: 88 },
        { id: '2', text: 'Dec 30-31', votes: 42 }
      ],
      totalVotes: 130,
      status: 'Closed',
      endDate: '2024-05-10'
    }
  ]);

  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', '']
  });

  const handleVote = (pollId: string, optionId: string) => {
    setPolls(prev => prev.map(poll => {
      if (poll.id === pollId && poll.status === 'Active' && !poll.userVoted) {
        const updatedOptions = poll.options.map(opt => 
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        );
        return {
          ...poll,
          options: updatedOptions,
          totalVotes: poll.totalVotes + 1,
          userVoted: optionId
        };
      }
      return poll;
    }));
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    const poll: Poll = {
      id: `P-${100 + polls.length + 1}`,
      question: newPoll.question,
      options: newPoll.options.filter(o => o.trim()).map((o, i) => ({ id: String(i + 1), text: o, votes: 0 })),
      totalVotes: 0,
      status: 'Active',
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    setPolls([poll, ...polls]);
    setShowModal(false);
    setNewPoll({ question: '', options: ['', ''] });
  };

  return (
    <div className="pb-12 animate-fade-in max-w-4xl mx-auto crt-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-6 border-b-4 border-cyan-500/30">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-cyan-400 mb-2 glitch-text" data-text="Community Polls">
            Community <span className="text-magenta-500">Polls</span>
          </h1>
          <p className="text-cyan-700 font-bold font-mono uppercase text-xs">
            {`> YOUR_VOICE_MATTERS // VOTE_ON_SOCIETY_DECISIONS`}
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-magenta-500 text-white px-6 py-3 border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-black hover:text-magenta-500 hover:border-magenta-500 transition-all shadow-[6px_6px_0px_#00ffff] active:scale-95 transform duration-100"
        >
          <Plus size={18} strokeWidth={3} />
          Create Poll
        </button>
      </div>

      <div className="space-y-8">
        {polls.map((poll) => (
          <div 
            key={poll.id} 
            className={`bg-black p-8 border-4 transition-all duration-300 relative overflow-hidden group ${
              poll.status === 'Closed' 
                ? 'border-cyan-900/30 opacity-60' 
                : 'border-cyan-500/30 hover:border-magenta-500 hover:shadow-[10px_10px_0px_#00ffff]'
            }`}
          >
            {poll.status === 'Closed' && (
              <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1 bg-black border-2 border-cyan-900/30">
                <Lock size={12} className="text-cyan-900" />
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-900">Closed</span>
              </div>
            )}
            
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 border-2 border-cyan-500 flex items-center justify-center text-cyan-400">
                  <PieChart size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-700 font-mono">
                  #{poll.id} • {poll.totalVotes} Votes
                </span>
              </div>
              <h3 className="text-2xl font-black text-cyan-400 leading-tight uppercase tracking-tight group-hover:text-magenta-500 transition-colors">
                {poll.question}
              </h3>
            </div>

            <div className="space-y-4">
              {poll.options.map((option) => {
                const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
                const isSelected = poll.userVoted === option.id;
                
                return (
                  <button
                    key={option.id}
                    disabled={poll.status === 'Closed' || !!poll.userVoted}
                    onClick={() => handleVote(poll.id, option.id)}
                    className={`w-full relative p-0 border-2 overflow-hidden transition-all duration-300 group/btn ${
                      isSelected 
                        ? 'border-magenta-500 bg-magenta-900/10 shadow-[4px_4px_0px_#00ffff]' 
                        : 'border-cyan-900/30 bg-black hover:border-cyan-500'
                    }`}
                  >
                    <div 
                      className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-out ${
                        isSelected ? 'bg-magenta-500/20' : 'bg-cyan-500/10'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                    
                    <div className="relative z-10 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 border-2 flex items-center justify-center transition-colors ${
                          isSelected 
                            ? 'border-black bg-magenta-500 text-white' 
                            : 'border-cyan-900/30 bg-black'
                        }`}>
                          {isSelected && <CheckCircle2 size={14} />}
                        </div>
                        <span className={`text-sm font-black uppercase tracking-tight ${
                          isSelected ? 'text-magenta-500' : 'text-cyan-700'
                        }`}>
                          {option.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black font-mono text-cyan-900">{option.votes}</span>
                        <span className="text-sm font-black text-cyan-400 font-mono">{percentage}%</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t-2 border-cyan-900/30 flex justify-between items-center">
               <div className="flex items-center gap-2 text-[10px] font-black text-cyan-700 uppercase tracking-widest font-mono">
                  <Clock size={14} className="text-magenta-500" />
                  Ends {new Date(poll.endDate).toLocaleDateString()}
               </div>
               <div className="flex -space-x-2">
                  {[1,2,3,4,5].map(i => (
                    <img 
                      key={i} 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + poll.id}`} 
                      alt="User"
                      className="w-8 h-8 rounded-full border-2 border-black bg-cyan-900/20"
                    />
                  ))}
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Poll Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-black w-full max-w-lg border-4 border-magenta-500 shadow-[12px_12px_0px_#00ffff] overflow-hidden crt-screen"
            >
              <div className="p-6 border-b-4 border-cyan-500/30 flex justify-between items-center bg-black">
                <h2 className="text-2xl font-black text-cyan-400 tracking-tight uppercase glitch-text" data-text="New Poll">New Poll</h2>
                <button onClick={() => setShowModal(false)} className="p-2 border-2 border-magenta-500 text-magenta-500 hover:bg-magenta-500 hover:text-white transition-all">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreatePoll} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-2 block ml-1">Question</label>
                  <textarea 
                    rows={3}
                    placeholder="What would you like to ask the community?" 
                    required
                    value={newPoll.question}
                    onChange={(e) => setNewPoll({...newPoll, question: e.target.value})}
                    className="w-full bg-black border-2 border-cyan-500 px-4 py-3 text-cyan-400 placeholder:text-cyan-900 font-bold outline-none focus:border-magenta-500 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-cyan-700 uppercase tracking-widest mb-2 block ml-1">Options</label>
                  <div className="space-y-3">
                    {newPoll.options.map((opt, i) => (
                      <div key={i} className="relative">
                        <input 
                          type="text"
                          placeholder={`Option ${i + 1}`} 
                          required
                          value={opt}
                          onChange={(e) => {
                            const updated = [...newPoll.options];
                            updated[i] = e.target.value;
                            setNewPoll({...newPoll, options: updated});
                          }}
                          className="w-full bg-black border-2 border-cyan-500 px-4 py-3 text-cyan-400 placeholder:text-cyan-900 font-bold outline-none focus:border-magenta-500 transition-all pr-10"
                        />
                        {newPoll.options.length > 2 && (
                          <button 
                            type="button"
                            onClick={() => setNewPoll({...newPoll, options: newPoll.options.filter((_, idx) => idx !== i)})}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-900 hover:text-magenta-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={() => setNewPoll({...newPoll, options: [...newPoll.options, '']})}
                      className="w-full border-2 border-dashed border-cyan-900/30 text-cyan-700 hover:border-cyan-500 hover:text-cyan-500 py-3 font-black text-xs uppercase tracking-widest transition-all"
                    >
                      + Add Option
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-magenta-500 text-white py-4 border-2 border-black font-black text-sm uppercase tracking-widest hover:bg-black hover:text-magenta-500 hover:border-magenta-500 transition-all shadow-[6px_6px_0px_#00ffff] active:scale-95 transform duration-100 flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Launch Community Poll
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Polls;
