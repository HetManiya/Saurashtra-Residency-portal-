
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
    <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end crt-screen">
      {isOpen && (
        <div className="mb-6 w-80 bg-black border-4 border-cyan-500 shadow-[12px_12px_0px_#ff00ff] p-8 animate-in slide-in-from-bottom-10 duration-500 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black border-2 border-magenta-500 flex items-center justify-center text-magenta-500 shadow-[2px_2px_0px_#00ffff]">
                <BrainCircuit size={20} />
              </div>
              <div>
                <h4 className="font-black text-sm tracking-tight text-cyan-400 uppercase glitch-text" data-text="Community AI">Community AI</h4>
                <p className="text-[10px] font-black uppercase text-cyan-700 tracking-widest font-mono">v2.0 // VOICE_LINK</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-cyan-700 hover:text-magenta-500 transition-colors"><X size={24} /></button>
          </div>

          <div className="bg-black border-2 border-cyan-900/30 p-6 min-h-[140px] mb-6 flex flex-col justify-center items-center text-center">
            {isConnecting ? (
              <div className="flex flex-col items-center">
                <Loader2 className="animate-spin text-cyan-400 mb-2" />
                <span className="text-[9px] font-black text-cyan-700 uppercase tracking-[0.2em]">Establishing_Link...</span>
              </div>
            ) : isActive ? (
              <div className="space-y-4 w-full">
                <div className="flex justify-center gap-1.5 h-10 items-center">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-1 bg-magenta-500 shadow-[0_0_8px_#ff00ff] animate-pulse" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.05}s` }} />
                  ))}
                </div>
                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest animate-pulse">System_Listening...</p>
                {transcription && <p className="text-xs font-bold text-magenta-500 font-mono italic leading-relaxed">"{transcription}"</p>}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] font-black text-cyan-900 uppercase tracking-widest leading-relaxed">
                  {`> "What is my balance?"`} <br />
                  {`> "Where is Wing A-1?"`}
                </p>
              </div>
            )}
          </div>

          <button 
            onClick={toggleAssistant}
            className={`w-full py-4 border-2 font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[4px_4px_0px_#00ffff] ${
              isActive 
                ? 'bg-magenta-500 text-white border-black hover:bg-black hover:text-magenta-500 hover:border-magenta-500' 
                : 'bg-cyan-400 text-black border-black hover:bg-black hover:text-cyan-400 hover:border-cyan-400'
            }`}
          >
            {isConnecting ? <Loader2 className="animate-spin" size={16} /> : isActive ? <MicOff size={16} /> : <Mic size={16} />}
            {isActive ? 'Terminate Link' : 'Initialize Uplink'}
          </button>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-20 h-20 border-4 shadow-[8px_8px_0px_#ff00ff] flex items-center justify-center transition-all duration-500 relative group overflow-hidden active:scale-90 ${
          isOpen ? 'bg-black border-magenta-500 text-magenta-500' : 'bg-black border-cyan-500 text-cyan-400'
        }`}
      >
        <div className="absolute inset-0 bg-cyan-400 opacity-0 group-hover:opacity-10 transition-opacity" />
        {isOpen ? <X size={32} /> : <Waves className="animate-pulse" size={32} />}
      </button>
    </div>
  );
};

export default VoiceAssistant;
