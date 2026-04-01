
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Loader2, X, BrainCircuit, Waves } from 'lucide-react';
import { api, audioUtils } from '../services/api';

const VoiceAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcription, setTranscription] = useState('');
  
  const sessionRef = useRef<any>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

  const startSession = async () => {
    setIsConnecting(true);
    try {
      audioContextInRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = api.connectLiveAssistant({
        onopen: () => {
          setIsConnecting(false);
          setIsActive(true);
          const source = audioContextInRef.current!.createMediaStreamSource(stream);
          const scriptProcessor = audioContextInRef.current!.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
            const pcmBlob: any = {
              data: audioUtils.encode(new Uint8Array(int16.buffer)),
              mimeType: 'audio/pcm;rate=16000',
            };
            sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(audioContextInRef.current!.destination);
        },
        onmessage: async (message: any) => {
          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio) {
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextOutRef.current!.currentTime);
            const audioBuffer = await audioUtils.decodeAudioData(
              audioUtils.decode(base64Audio),
              audioContextOutRef.current!,
              24000,
              1
            );
            const source = audioContextOutRef.current!.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextOutRef.current!.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            sourcesRef.current.add(source);
            source.onended = () => sourcesRef.current.delete(source);
          }
          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
          if (message.serverContent?.outputTranscription) {
            setTranscription(prev => prev + message.serverContent.outputTranscription.text);
          }
          if (message.serverContent?.turnComplete) {
            setTranscription('');
          }
        },
        onerror: (e: any) => {
          console.error("Gemini Error:", e);
          stopSession();
        },
        onclose: () => stopSession()
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Could not start session:", err);
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setIsConnecting(false);
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextInRef.current) audioContextInRef.current.close();
    if (audioContextOutRef.current) audioContextOutRef.current.close();
  };

  const toggleAssistant = () => {
    if (isActive) stopSession();
    else startSession();
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="mb-6 w-80 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-8 animate-in slide-in-from-bottom-10 duration-500 overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center text-brand-600 dark:text-brand-400 shadow-sm">
                <BrainCircuit size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white tracking-tight">Voice AI</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Link</span>
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

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-8 min-h-[180px] mb-8 flex flex-col justify-center items-center text-center border border-slate-100 dark:border-slate-800">
            {isConnecting ? (
              <div className="flex flex-col items-center">
                <Loader2 className="animate-spin text-brand-500 mb-3" size={32} />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connecting...</span>
              </div>
            ) : isActive ? (
              <div className="space-y-6 w-full">
                <div className="flex justify-center gap-2 h-12 items-center">
                  {[...Array(8)].map((_, i) => (
                    <motion.div 
                      key={i} 
                      animate={{ height: [10, 40, 10] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                      className="w-1.5 bg-brand-500 rounded-full" 
                    />
                  ))}
                </div>
                <p className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest animate-pulse">Listening...</p>
                {transcription && <p className="text-sm font-medium text-slate-600 dark:text-slate-300 italic leading-relaxed">"{transcription}"</p>}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 leading-relaxed">
                  "What is my balance?" <br />
                  "Where is Wing A-1?"
                </p>
              </div>
            )}
          </div>

          <button 
            onClick={toggleAssistant}
            className={`w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg ${
              isActive 
                ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/20' 
                : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-600/20'
            }`}
          >
            {isConnecting ? <Loader2 className="animate-spin" size={18} /> : isActive ? <MicOff size={18} /> : <Mic size={18} />}
            {isActive ? 'Stop Assistant' : 'Start Assistant'}
          </button>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-xl flex items-center justify-center transition-all duration-500 relative group overflow-hidden active:scale-90 ${
          isOpen ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 border border-slate-200 dark:border-slate-700' : 'bg-brand-600 text-white'
        }`}
      >
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
        {isOpen ? <X size={28} /> : <Waves className="animate-pulse" size={28} />}
      </button>
    </div>
  );
};

export default VoiceAssistant;
