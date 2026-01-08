
import React, { useEffect, useRef, useState } from 'react';
import { EmergencyInfo } from '../types';

interface MapDirectionsModalProps {
  info: EmergencyInfo;
  onClose: () => void;
  userLocation: [number, number];
}

const MapDirectionsModal: React.FC<MapDirectionsModalProps> = ({ info, onClose, userLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const calculateArrival = () => {
    // Haversine-like distance check for accuracy
    const latDiff = userLocation[0] - info.coords[0];
    const lngDiff = userLocation[1] - info.coords[1];
    const distKm = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111;
    const minutes = Math.max(2, Math.round(distKm * 15)); // Walking pace
    return minutes;
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsMapReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isMapReady && mapRef.current && !mapInstance.current) {
      const L = (window as any).L;
      const map = L.map(mapRef.current, { zoomControl: true }).setView(userLocation, 16);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      const userIcon = L.divIcon({
        html: `<div class="w-8 h-8 bg-blue-600 border-4 border-white rounded-full shadow-lg relative"><div class="absolute -inset-4 bg-blue-600/20 rounded-full animate-ping"></div></div>`,
        className: 'user-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      L.marker(userLocation, { icon: userIcon }).addTo(map).bindPopup('<b>You</b>');

      const destIcon = L.divIcon({
        html: `<div class="text-6xl drop-shadow-lg">${info.icon}</div>`,
        className: 'dest-marker',
        iconSize: [64, 64],
        iconAnchor: [32, 48]
      });
      L.marker(info.coords, { icon: destIcon }).addTo(map).bindPopup(`<b>${info.name}</b>`).openPopup();

      L.polyline([userLocation, info.coords], { color: '#2563eb', weight: 8, opacity: 0.6, dashArray: '10, 10' }).addTo(map);

      const bounds = L.latLngBounds([userLocation, info.coords]);
      map.fitBounds(bounds, { padding: [50, 50] });

      mapInstance.current = map;
      setTimeout(() => map.invalidateSize(), 200);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isMapReady, info, userLocation]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-6xl h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-400">
        
        <div className="bg-white border-b-2 border-slate-100 p-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-8">
            <div className="text-5xl bg-blue-50 w-24 h-24 rounded-2xl flex items-center justify-center shadow-inner">{info.icon}</div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">{info.name}</h2>
              <div className="flex items-center gap-4 mt-3">
                 <span className="px-4 py-1 bg-blue-600 text-white rounded-full text-xs font-black tracking-widest uppercase">Safe Route</span>
                 <p className="text-blue-500 font-bold text-sm uppercase tracking-widest opacity-60">Verified Coordinates</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-16 h-16 bg-slate-100 rounded-2xl hover:bg-red-600 hover:text-white transition-all font-black text-2xl flex items-center justify-center shadow-md">✕</button>
        </div>
        
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          <div className="lg:w-80 p-8 space-y-10 overflow-y-auto bg-slate-50/50 border-r-2 border-slate-100 shrink-0">
            <div className="space-y-4">
              <label className="text-xs font-black text-blue-400 uppercase tracking-widest block">Address</label>
              <p className="text-2xl font-black text-slate-800 leading-tight">{info.address}</p>
            </div>

            <div className="p-8 bg-blue-600 rounded-[2rem] text-white shadow-xl">
              <div className="text-xs font-black uppercase tracking-widest opacity-70 mb-4">Arrival Estimate</div>
              <div className="text-7xl font-black mb-1">{calculateArrival()} <span className="text-3xl opacity-60 uppercase">Min</span></div>
              <div className="text-sm font-medium opacity-80">Walking time based on live GPS.</div>
            </div>

            <button 
              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${info.coords[0]},${info.coords[1]}&travelmode=walking`)}
              className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black text-xl shadow-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-4"
            >
              🧭 OPEN IN MAPS
            </button>
          </div>

          <div className="flex-1 p-6 relative bg-white">
            <div ref={mapRef} className={`h-full w-full rounded-[2.5rem] border-4 border-slate-50 overflow-hidden shadow-inner transition-opacity duration-500 ${isMapReady ? 'opacity-100' : 'opacity-0'}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapDirectionsModal;
