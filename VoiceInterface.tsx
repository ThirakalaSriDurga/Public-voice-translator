
import React, { useState, useEffect, useRef } from 'react';
import { InteractionState, AppMode } from '../types';
import { LANGUAGES } from '../constants';

interface VoiceInterfaceProps {
  state: InteractionState;
  mode: AppMode;
  onStart: () => void;
  onStop: (transcript: string) => void;
  error: string | null;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  targetLanguage: string;
  onTargetLanguageChange: (lang: string) => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ 
  state, 
  mode,
  onStart, 
  onStop, 
  error, 
  selectedLanguage, 
  onLanguageChange,
  targetLanguage,
  onTargetLanguageChange
}) => {
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef('');

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; ++i) { transcript += event.results[i][0].transcript; }
        setInterimTranscript(transcript);
        transcriptRef.current = transcript;
      };
      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    if (recognitionRef.current) { recognitionRef.current.lang = selectedLanguage; }
  }, [selectedLanguage]);

  const handleStart = () => {
    try {
      if (recognitionRef.current) {
        setInterimTranscript('');
        transcriptRef.current = '';
        recognitionRef.current.start();
        onStart();
      }
    } catch (e) {
      recognitionRef.current.stop();
      setTimeout(() => { recognitionRef.current.start(); onStart(); }, 100);
    }
  };

  const handleStopManual = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      onStop(transcriptRef.current);
      setInterimTranscript('');
      transcriptRef.current = '';
    }
  };

  if (state === InteractionState.RECORDING) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-12">
        <div className="flex gap-4 h-24 items-end">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="w-2.5 bg-blue-600 rounded-full animate-bounce" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.05}s` }} />
          ))}
        </div>
        <div className="bg-slate-50 p-12 rounded-[3.5rem] border-4 border-slate-100 shadow-inner w-full max-w-4xl text-center min-h-[250px] flex items-center justify-center">
          <p className="text-4xl font-black text-slate-900 italic leading-tight">"{interimTranscript || 'Listening to your voice...'}"</p>
        </div>
        <button onClick={handleStopManual} className="px-16 py-8 bg-red-600 text-white rounded-3xl font-black text-2xl shadow-2xl hover:bg-red-700 transition-all active:scale-95 uppercase tracking-widest">STOP RECORDING</button>
      </div>
    );
  }

  if (state === InteractionState.PROCESSING) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-10">
        <div className="w-40 h-40 border-[16px] border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Accessing AI Cloud...</h3>
      </div>
    );
  }

  if (mode === AppMode.KIOSK) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-16 animate-in fade-in duration-700">
        <div className="text-center">
          <h2 className="text-7xl font-black text-slate-900 tracking-tighter mb-4">How can I assist?</h2>
          <p className="text-xl font-bold text-slate-400 uppercase tracking-[0.4em]">Tap the button and ask a question</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-[2.5rem] border-2 border-blue-100 w-full max-w-md">
           <select value={selectedLanguage} onChange={(e) => onLanguageChange(e.target.value)} className="w-full p-4 bg-white rounded-2xl font-black text-xl text-blue-900 outline-none shadow-sm cursor-pointer">
             {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
           </select>
        </div>

        <button onClick={handleStart} className="group relative">
          <div className="absolute inset-0 bg-blue-400 rounded-full blur-3xl opacity-0 group-hover:opacity-20 animate-pulse transition-all"></div>
          <div className="relative w-72 h-72 bg-blue-600 rounded-full border-[20px] border-slate-50 flex items-center justify-center shadow-[0_30px_60px_-15px_rgba(37,99,235,0.4)] transition-all group-hover:scale-105 group-hover:shadow-blue-200 active:scale-95">
             <svg className="w-32 h-32 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 013 3v8a3 3 0 01-3 33 3 0 01-3-3V5a3 3 0 013-3z"></path></svg>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 w-full animate-in zoom-in-95 duration-500">
      <div className="bg-blue-50 p-10 rounded-[3rem] border-4 border-white shadow-xl flex flex-col items-center gap-8 group">
        <div className="w-full">
          <label className="text-xs font-black text-blue-400 uppercase tracking-widest ml-4 mb-2 block">Source Language</label>
          <select value={selectedLanguage} onChange={(e) => onLanguageChange(e.target.value)} className="w-full p-6 bg-white border-2 border-blue-100 rounded-3xl font-black text-xl text-blue-900">
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
        </div>
        <button onClick={handleStart} className="w-56 h-56 bg-blue-600 rounded-[3rem] flex items-center justify-center text-white shadow-2xl hover:scale-105 active:scale-95 transition-all border-[12px] border-white">
          <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 013 3v8a3 3 0 01-3 33 3 0 01-3-3V5a3 3 0 013-3z"></path></svg>
        </button>
        <span className="font-black text-2xl text-blue-600 uppercase tracking-tighter">SPEAKER A</span>
      </div>

      <div className="bg-slate-100 p-10 rounded-[3rem] border-4 border-white shadow-xl flex flex-col items-center gap-8 group">
        <div className="w-full">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Target Language</label>
          <select value={targetLanguage} onChange={(e) => onTargetLanguageChange(e.target.value)} className="w-full p-6 bg-white border-2 border-slate-200 rounded-3xl font-black text-xl text-slate-800">
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
        </div>
        <button onClick={handleStart} className="w-56 h-56 bg-slate-800 rounded-[3rem] flex items-center justify-center text-white shadow-2xl hover:scale-105 active:scale-95 transition-all border-[12px] border-white">
          <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 013 3v8a3 3 0 01-3 33 3 0 01-3-3V5a3 3 0 013-3z"></path></svg>
        </button>
        <span className="font-black text-2xl text-slate-700 uppercase tracking-tighter">SPEAKER B</span>
      </div>
    </div>
  );
};

export default VoiceInterface;
