
import React, { useState, useRef, useEffect } from 'react';
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
        <div className="mb-6 w-80 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl p-8 animate-in slide-in-from-bottom-10 duration-500 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-600 rounded-2xl flex items-center justify-center text-white">
                <BrainCircuit size={20} />
              </div>
              <div>
                <h4 className="font-black text-sm tracking-tight dark:text-white">Community AI</h4>
                <p className="text-[10px] font-black uppercase text-brand-600 tracking-widest">Pasodara Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-slate-900 dark:hover:text-white"><X size={20} /></button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 min-h-[120px] mb-6 flex flex-col justify-center items-center text-center">
            {isConnecting ? (
              <Loader2 className="animate-spin text-brand-600 mb-2" />
            ) : isActive ? (
              <div className="space-y-4 w-full">
                <div className="flex justify-center gap-1 h-8 items-center">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-1 bg-brand-600 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Listening for commands...</p>
                {transcription && <p className="text-sm font-medium text-slate-700 dark:text-slate-300 italic">"{transcription}"</p>}
              </div>
            ) : (
              <p className="text-sm font-medium text-slate-500 italic">"What is my current balance?"<br/>"Where is Wing A-18?"</p>
            )}
          </div>

          <button 
            onClick={toggleAssistant}
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all ${
              isActive ? 'bg-rose-600 text-white' : 'bg-brand-600 text-white'
            }`}
          >
            {isConnecting ? <Loader2 className="animate-spin" size={16} /> : isActive ? <MicOff size={16} /> : <Mic size={16} />}
            {isActive ? 'Stop Assistant' : 'Start Talking'}
          </button>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center shadow-2xl transition-all duration-500 relative group overflow-hidden ${
          isOpen ? 'bg-slate-900 dark:bg-slate-800' : 'bg-brand-600'
        }`}
      >
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
        {isOpen ? <X className="text-white" size={32} /> : <Waves className="text-white animate-pulse-slow" size={32} />}
      </button>
    </div>
  );
};

export default VoiceAssistant;
