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
        className="fixed bottom-6 right-6 w-16 h-16 bg-black text-cyan-400 border-4 border-cyan-500 shadow-[4px_4px_0px_#ff00ff] flex items-center justify-center hover:bg-cyan-400 hover:text-black transition-all z-50 group active:scale-95"
      >
        <Bot size={32} className="group-hover:animate-pulse" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 h-[550px] bg-black border-4 border-cyan-500 shadow-[12px_12px_0px_#ff00ff] flex flex-col z-50 overflow-hidden crt-screen"
          >
            {/* Header */}
            <div className="bg-black p-5 border-b-4 border-cyan-500/30 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border-2 border-magenta-500 flex items-center justify-center text-magenta-500 shadow-[2px_2px_0px_#00ffff]">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-black text-sm text-cyan-400 uppercase tracking-tighter glitch-text" data-text="Saurashtra Bot">Saurashtra Bot</h3>
                  <p className="text-[9px] font-black text-cyan-700 uppercase tracking-widest font-mono">v1.0.4 // AI_ASSISTANT</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-cyan-700 hover:text-magenta-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-black custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-center py-20">
                  <Bot size={64} className="mx-auto mb-4 text-cyan-900 opacity-20 animate-pulse" />
                  <p className="text-[10px] font-black text-cyan-900 uppercase tracking-widest leading-relaxed">
                    {`> UPLINK_ESTABLISHED`} <br />
                    {`> AWAITING_QUERY...`}
                  </p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 border-2 font-mono text-xs leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-magenta-500/10 border-magenta-500 text-magenta-500 shadow-[4px_4px_0px_#00ffff]' 
                      : 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[4px_4px_0px_#ff00ff]'
                  }`}>
                    <div className="flex items-center gap-2 mb-2 opacity-50 text-[9px] font-black uppercase tracking-widest">
                      {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                      {msg.role === 'user' ? 'Resident' : 'Saurashtra_Bot'}
                    </div>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-black border-2 border-cyan-900/30 p-4 text-cyan-700 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Processing_Logic...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-5 border-t-4 border-cyan-500/30 bg-black">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="QUERY_SYSTEM..."
                  className="flex-1 bg-black border-2 border-cyan-900/50 px-5 py-3 text-xs font-black text-cyan-400 placeholder:text-cyan-900 outline-none focus:border-magenta-500 transition-all uppercase tracking-widest"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-magenta-500 text-white p-3 border-2 border-black shadow-[4px_4px_0px_#00ffff] hover:bg-black hover:text-magenta-500 hover:border-magenta-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  <Send size={20} />
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
