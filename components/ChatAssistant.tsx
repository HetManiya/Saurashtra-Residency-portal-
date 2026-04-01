import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Bot, User, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SYSTEM_INSTRUCTION = `
You are the official Smart Assistant for Saurashtra Residency, a premium residential society. 
Your name is 'Saurashtra Bot'. Your goal is to assist residents with society-related queries.

STRICT RULES:
1. Only answer questions about society rules, maintenance dues, amenities (clubhouse, pool, gym), and general society announcements.
2. Be extremely polite and professional.
3. If a user asks about anything unrelated to Saurashtra Residency or residential management, politely decline and state that you are only authorized to assist with society matters.
4. Do not provide legal or financial advice beyond society maintenance information.
5. If you don't know the answer, suggest the resident contact the society office.
6. Keep responses concise and helpful.
`;

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API Key not found");
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages, userMessage].map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        }
      });

      const aiText = response.text || "I'm sorry, I couldn't process that.";
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-brand-600 text-white rounded-full shadow-lg shadow-brand-600/20 flex items-center justify-center hover:bg-brand-700 transition-all z-50 group active:scale-95"
      >
        <Bot size={28} className="group-hover:scale-110 transition-transform" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[400px] h-[600px] bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400 shadow-sm">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white tracking-tight">Saurashtra Bot</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Online Assistant</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-slate-900 custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-center py-20">
                  <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mx-auto mb-6">
                    <Bot size={40} className="text-slate-200 dark:text-slate-700" />
                  </div>
                  <p className="text-sm font-medium text-slate-400 dark:text-slate-500 max-w-[200px] mx-auto leading-relaxed">
                    Hello! I'm your society assistant. How can I help you today?
                  </p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-brand-600 text-white rounded-tr-none' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none border border-slate-100 dark:border-slate-700'
                  }`}>
                    <div className={`flex items-center gap-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider ${
                      msg.role === 'user' ? 'text-white/60' : 'text-slate-400'
                    }`}>
                      {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                      {msg.role === 'user' ? 'You' : 'Assistant'}
                    </div>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 p-4 text-slate-400 flex items-center gap-3 text-xs font-medium">
                    <Loader2 size={14} className="animate-spin text-brand-500" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex gap-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-100 dark:border-slate-700 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a question..."
                  className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-brand-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-brand-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md shadow-brand-600/20"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatAssistant;
