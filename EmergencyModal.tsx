
import React, { useEffect, useRef } from 'react';
import { EmergencyInfo } from '../types';

interface EmergencyModalProps {
  info: EmergencyInfo;
  onClose: () => void;
  userLocation: [number, number];
}

// Major Pan-India Facilities
const INDIAN_FACILITIES = [
  { name: "AIIMS New Delhi", coords: [28.5672, 77.2100], type: "medical" },
  { name: "Apollo Hospital Mumbai", coords: [19.0176, 73.0189], type: "medical" },
  { name: "NIMHANS Bangalore", coords: [12.9392, 77.5910], type: "medical" },
  { name: "Rajiv Gandhi Hospital Chennai", coords: [13.0818, 80.2748], type: "medical" },
  { name: "Police HQ Delhi", coords: [28.6186, 77.2345], type: "police" },
  { name: "Mumbai Police HQ", coords: [18.9439, 72.8335], type: "police" },
  { name: "Kolkata Police HQ", coords: [22.5735, 88.3533], type: "police" },
];

const EmergencyModal: React.FC<EmergencyModalProps> = ({ info, onClose, userLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      const L = (window as any).L;
      const map = L.map(mapRef.current).setView(userLocation, 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      // User Icon
      const userIcon = L.divIcon({
        html: `<div class="w-8 h-8 bg-blue-600 border-4 border-white rounded-full shadow-2xl pulse"></div>`,
        className: 'custom-div-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      L.marker(userLocation, { icon: userIcon }).addTo(map).bindPopup('<b>Current Location</b>').openPopup();

      // Facility Icons
      const type = info.title.toLowerCase().includes('medical') ? 'medical' : 'police';
      const facilityIcon = L.divIcon({
        html: `<div class="text-4xl filter drop-shadow-lg scale-125">${type === 'medical' ? '🏥' : '🚔'}</div>`,
        className: 'service-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      INDIAN_FACILITIES.filter(f => f.type === type).forEach(f => {
        L.marker(f.coords as any, { icon: facilityIcon }).addTo(map).bindPopup(`<b>${f.name}</b>`);
      });

      mapInstance.current = map;
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [info, userLocation]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-5xl h-[95vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
        <div className="bg-red-600 p-10 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-8">
            <div className="text-7xl">{info.icon}</div>
            <div>
              <h2 className="text-5xl font-black leading-tight tracking-tighter uppercase">{info.title}</h2>
              <p className="text-red-100 font-black text-2xl mt-2 tracking-widest">NATIONAL HELPLINE: {info.phone}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-16 h-16 bg-white/20 rounded-2xl hover:bg-white/30 transition-all font-black text-3xl flex items-center justify-center">✕</button>
        </div>
        
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          <div className="lg:w-2/5 p-10 space-y-8 overflow-y-auto bg-slate-50/50">
            <div className="p-8 bg-red-100 rounded-[2.5rem] border-2 border-red-200">
              <label className="text-sm font-black text-red-500 uppercase tracking-widest block mb-3">Facility Guidance</label>
              <p className="text-2xl font-bold text-red-950 leading-snug">{info.description}</p>
            </div>
            
            <div className="flex items-center gap-6 p-8 bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-sm">
              <div className="text-5xl">📍</div>
              <div>
                <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Status</div>
                <div className="text-3xl font-black text-slate-800 tracking-tight">Searching Nearby...</div>
              </div>
            </div>

            <button onClick={() => window.location.href = `tel:${info.phone}`} className="w-full py-8 bg-red-600 text-white rounded-[2.5rem] font-black text-3xl shadow-xl shadow-red-200 hover:bg-red-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-4">
               📞 DIAL {info.phone} NOW
            </button>
          </div>

          <div className="lg:w-3/5 p-8 relative">
            <div ref={mapRef} className="h-full w-full rounded-[3rem] border-8 border-slate-50 overflow-hidden shadow-2xl"></div>
            <div className="absolute top-12 left-12 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl text-sm font-black text-slate-900 border-2 border-slate-100 shadow-xl uppercase tracking-widest z-[1000]">
              Pan-India Live Tracking
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 25px rgba(37, 99, 235, 0); }
          100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }
        .pulse { animation: pulse 2s infinite; }
      `}</style>
    </div>
  );
};

export default EmergencyModal;
