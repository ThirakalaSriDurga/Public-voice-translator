
import React from 'react';
import { Message } from '../types';

interface ConversationLogProps {
  messages: Message[];
  onReset: () => void;
}

const ConversationLog: React.FC<ConversationLogProps> = ({ messages, onReset }) => {
  if (messages.length === 0) return null;

  return (
    <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-xl animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-slate-50 border-b-2 border-slate-100 px-10 py-6 flex items-center justify-between">
        <div>
          <h3 className="font-black text-slate-800 text-xl tracking-tight uppercase">Recent Exchange</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Session History Active</p>
        </div>
        <button 
          onClick={onReset}
          className="px-6 py-2 bg-white text-slate-400 hover:text-red-600 hover:border-red-100 border-2 border-transparent rounded-xl font-black text-xs transition-all uppercase tracking-widest shadow-sm"
        >
          Clear
        </button>
      </div>
      
      <div className="p-10 max-h-[500px] overflow-y-auto space-y-10 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col ${msg.role === 'user' ? 'items-start' : 'items-end'}`}
          >
            <div 
              className={`max-w-[90%] md:max-w-[75%] rounded-[2rem] p-8 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-50 text-slate-900 border-2 border-blue-100 rounded-bl-none' 
                  : 'bg-white text-slate-800 border-2 border-slate-100 rounded-br-none shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`text-[10px] font-black uppercase tracking-widest ${msg.role === 'user' ? 'text-blue-400' : 'text-slate-400'}`}>
                  {msg.role === 'user' ? 'Voice Input' : 'Kiosk Response'}
                </div>
                {msg.role === 'assistant' && (
                  <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Verified AI</div>
                )}
              </div>
              
              <p className="text-2xl font-black leading-tight tracking-tight">{msg.text}</p>
              
              {msg.translatedText && (
                <div className="mt-6 pt-6 border-t-2 border-slate-50 text-xl font-bold text-blue-600 italic">
                  {msg.translatedText}
                </div>
              )}

              {msg.role === 'assistant' && msg.text.toLowerCase().includes('located at') && (
                <div className="mt-6 flex gap-4">
                  <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Live GPS Info
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationLog;
