
import React from 'react';
import { KioskLocation } from '../types';

interface KioskInfoProps {
  kiosk: KioskLocation;
  userPos: [number, number];
}

const KioskInfo: React.FC<KioskInfoProps> = ({ kiosk, userPos }) => {
  return (
    <div className="bg-white border-4 border-slate-100 rounded-[3rem] overflow-hidden shadow-2xl">
      <div className="bg-blue-600 px-8 py-6 text-white flex justify-between items-center">
        <div>
          <h3 className="font-black tracking-tight text-2xl uppercase leading-none">GPS Pulse</h3>
          <p className="text-[10px] text-blue-200 font-bold tracking-widest uppercase mt-2">Active Tracking Mode</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black leading-none">28°C</div>
          <div className="text-[10px] font-bold opacity-60">Sunny</div>
        </div>
      </div>
      
      <div className="p-8 space-y-8">
        <div className="bg-blue-50/50 p-6 rounded-[2rem] border-2 border-blue-100">
          <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-2">Neighborhood Scan</label>
          <div className="text-2xl font-black text-slate-900 leading-tight uppercase line-clamp-2">{kiosk.name}</div>
          <div className="flex items-center gap-3 text-blue-600 font-black text-[10px] mt-4">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
            LAT {userPos[0].toFixed(4)} / LNG {userPos[1].toFixed(4)}
          </div>
        </div>

        <div className="h-40 bg-slate-900 rounded-[2rem] overflow-hidden relative shadow-inner">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=600')] bg-cover bg-center opacity-40"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-10 h-10 bg-blue-600 rounded-full border-4 border-white shadow-[0_0_30px_rgba(37,99,235,1)]"></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl text-center">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">KIOSK</div>
            <div className="text-lg text-slate-900 font-black">NDLS-01</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-2xl text-center">
            <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">NETWORK</div>
            <div className="text-lg text-blue-900 font-black">5G CORE</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KioskInfo;
