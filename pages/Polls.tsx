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
    <div className="pb-12 animate-fade-in max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-2">
            Community <span className="text-brand-600">Polls</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Your voice matters. Vote on society decisions.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/20 active:scale-95 transform duration-100"
        >
          <Plus size={18} strokeWidth={3} />
          Create Poll
        </button>
      </div>

      <div className="space-y-8">
        {polls.map((poll) => (
          <div 
            key={poll.id} 
            className={`bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border transition-all duration-300 relative overflow-hidden group ${
              poll.status === 'Closed' 
                ? 'border-slate-200 dark:border-slate-800 opacity-70' 
                : 'border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:shadow-xl'
            }`}
          >
            {poll.status === 'Closed' && (
              <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                <Lock size={12} className="text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Closed</span>
              </div>
            )}
            
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
                  <PieChart size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  #{poll.id} • {poll.totalVotes} Votes
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
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
                    className={`w-full relative p-0 rounded-2xl border-2 overflow-hidden transition-all duration-300 group/btn ${
                      isSelected 
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10' 
                        : 'border-slate-200 dark:border-slate-800 bg-transparent hover:border-brand-300 dark:hover:border-brand-700'
                    }`}
                  >
                    <div 
                      className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-out ${
                        isSelected ? 'bg-brand-200/50 dark:bg-brand-900/30' : 'bg-slate-100/50 dark:bg-slate-800/50'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                    
                    <div className="relative z-10 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected 
                            ? 'border-brand-500 bg-brand-500 text-white' 
                            : 'border-slate-300 dark:border-slate-600 bg-transparent'
                        }`}>
                          {isSelected && <CheckCircle2 size={14} />}
                        </div>
                        <span className={`text-sm font-black ${
                          isSelected ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {option.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400">{option.votes}</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">{percentage}%</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Clock size={14} />
                  Ends {new Date(poll.endDate).toLocaleDateString()}
               </div>
               <div className="flex -space-x-2">
                  {[1,2,3,4,5].map(i => (
                    <img 
                      key={i} 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + poll.id}`} 
                      alt="User"
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">New Poll</h2>
                <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreatePoll} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Question</label>
                  <textarea 
                    rows={3}
                    placeholder="What would you like to ask the community?" 
                    required
                    value={newPoll.question}
                    onChange={(e) => setNewPoll({...newPoll, question: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Options</label>
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
                          className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none pr-10"
                        />
                        {newPoll.options.length > 2 && (
                          <button 
                            type="button"
                            onClick={() => setNewPoll({...newPoll, options: newPoll.options.filter((_, idx) => idx !== i)})}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={() => setNewPoll({...newPoll, options: [...newPoll.options, '']})}
                      className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 hover:border-brand-500 hover:text-brand-500 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-colors"
                    >
                      + Add Option
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-brand-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-700 transition-colors shadow-xl shadow-brand-600/20 active:scale-95 transform duration-100 flex items-center justify-center gap-2"
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
