
import { GoogleGenAI } from "@google/genai";
import React, { useCallback, useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import VoiceInterface from './components/VoiceInterface';
import ConversationLog from './components/ConversationLog';
import KioskInfo from './components/KioskInfo';
import MapDirectionsModal from './components/MapDirectionsModal';
import AuthPage from './components/AuthPage';
import { CURRENT_KIOSK, LANGUAGES, SYSTEM_INSTRUCTION } from './constants';
import { AppMode, EmergencyInfo, InteractionState, Message, Place } from './types';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [state, setState] = useState<InteractionState>(InteractionState.IDLE);
  const [mode, setMode] = useState<AppMode>(AppMode.KIOSK);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].code);
  const [targetLanguage, setTargetLanguage] = useState(LANGUAGES[1].code);
  const [activePlace, setActivePlace] = useState<EmergencyInfo | null>(null);
  const [userPos, setUserPos] = useState<[number, number]>([CURRENT_KIOSK.lat, CURRENT_KIOSK.lng]);
  const [currentAddress, setCurrentAddress] = useState<string>("Locating...");
  const [isFindingPlaces, setIsFindingPlaces] = useState(false);
  const [discoveryResults, setDiscoveryResults] = useState<{ type: string; list: Place[] } | null>(null);
  
  const [cache, setCache] = useState<Record<string, Place[]>>({});
  const lastPrefetchPos = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserPos([lat, lng]);
          reverseGeocode(lat, lng);
          prefetchAllCategories(lat, lng);
        },
        (err) => console.warn("Initial location failed:", err),
        { enableHighAccuracy: true }
      );

      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserPos(newPos);
          if (lastPrefetchPos.current) {
            const dist = Math.sqrt(Math.pow(newPos[0] - lastPrefetchPos.current[0], 2) + Math.pow(newPos[1] - lastPrefetchPos.current[1], 2));
            if (dist > 0.005) prefetchAllCategories(newPos[0], newPos[1]);
          }
        },
        (err) => console.warn("Watch error:", err),
        { enableHighAccuracy: true, timeout: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isLoggedIn]);

  const prefetchAllCategories = async (lat: number, lng: number) => {
    lastPrefetchPos.current = [lat, lng];
    const categories: ('medical' | 'police' | 'restaurant')[] = ['medical', 'police', 'restaurant'];
    categories.forEach(cat => fetchToCache(cat, lat, lng));
  };

  const fetchToCache = async (type: 'medical' | 'police' | 'restaurant', lat: number, lng: number) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const query = type === 'medical' ? "hospitals" : type === 'police' ? "police stations" : "restaurants";
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Find 4 real ${query} near ${lat}, ${lng}. Format: Name | Address | Lat | Lng`,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } }
        },
      });

      const results: Place[] = [];
      const lines = response.text?.split('\n').filter(l => l.includes('|')) || [];
      lines.forEach((line, i) => {
        const parts = line.split('|').map(p => p.trim().replace(/[*#-]/g, ''));
        if (parts.length >= 4) {
          const pLat = parseFloat(parts[2]);
          const pLng = parseFloat(parts[3]);
          if (!isNaN(pLat) && !isNaN(pLng)) {
            results.push({
              id: `${type}-${i}`,
              name: parts[0],
              address: parts[1],
              coords: [pLat, pLng],
              type,
              rating: 4.2 + (Math.random() * 0.7)
            });
          }
        }
      });
      if (results.length > 0) {
        setCache(prev => ({ ...prev, [type]: results }));
      }
    } catch (e) {
      console.error(`Prefetch failed for ${type}`, e);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Location: ${lat}, ${lng}. Name the neighborhood or station sector. max 2 words.`,
        config: { tools: [{ googleMaps: {} }] }
      });
      setCurrentAddress(response.text?.trim() || "Station Sector");
    } catch (e) {
      setCurrentAddress("Railway Hub");
    }
  };
  
  const handleStartInteraction = () => {
    setError(null);
    setState(InteractionState.RECORDING);
  };

  const handleReset = useCallback(() => {
    setMessages([]);
    setError(null);
    setState(InteractionState.IDLE);
    setDiscoveryResults(null);
  }, []);

  const openCategoryPage = async (type: 'medical' | 'police' | 'restaurant') => {
    if (cache[type]) {
      setDiscoveryResults({ type, list: cache[type] });
      return;
    }
    setIsFindingPlaces(true);
    setError(null);
    try {
      await fetchToCache(type, userPos[0], userPos[1]);
      if (cache[type]) {
        setDiscoveryResults({ type, list: cache[type] });
      }
    } catch (err) {
      setError("AI scan slow.");
    } finally {
      setIsFindingPlaces(false);
    }
  };

  const handleStopRecording = async (transcript: string) => {
    if (!transcript.trim()) { setState(InteractionState.IDLE); return; }
    setState(InteractionState.PROCESSING);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const isLoc = /near|nearby|where|hospital|pharmacy|police|food|locate|find/.test(transcript.toLowerCase());
      const prompt = mode === AppMode.KIOSK 
        ? `${SYSTEM_INSTRUCTION}\nCurrent Area: ${currentAddress}\nRequest: "${transcript}"`
        : `Translate to ${LANGUAGES.find(l => l.code === targetLanguage)?.name}: "${transcript}"`;

      const response = await ai.models.generateContent({
        model: isLoc ? 'gemini-2.5-flash' : 'gemini-3-flash-preview',
        contents: transcript,
        config: { 
          systemInstruction: prompt,
          tools: isLoc ? [{ googleMaps: {} }] : undefined,
          toolConfig: isLoc ? { retrievalConfig: { latLng: { latitude: userPos[0], longitude: userPos[1] } } } : undefined
        },
      });
      setMessages(prev => [...prev, { role: 'user', text: transcript }, { role: 'assistant', text: response.text || "Scanning..." }]);
      setState(InteractionState.RESPONDING);
      setTimeout(() => setState(InteractionState.IDLE), 5000);
    } catch (err: any) {
      setState(InteractionState.ERROR);
    }
  };

  const handlePlaceSelect = (place: Place) => {
    setActivePlace({
      ...place,
      title: place.name,
      icon: place.type === 'medical' ? '🏥' : place.type === 'police' ? '🚔' : '🍽️',
      description: `GPS tracking active to ${place.name}.`
    });
  };

  if (!isLoggedIn) {
    return <AuthPage onLogin={(name) => { setUserName(name); setIsLoggedIn(true); }} />;
  }

  if (discoveryResults) {
    const categoryIcon = discoveryResults.type === 'medical' ? '🏥' : discoveryResults.type === 'police' ? '🚔' : '🍽️';
    return (
      <div className="fixed inset-0 bg-slate-50 z-[200] flex flex-col animate-in slide-in-from-bottom duration-300">
        <header className="bg-white border-b-4 border-blue-600 p-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => setDiscoveryResults(null)} className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-3xl hover:bg-red-600 hover:text-white transition-all shadow-md">←</button>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{discoveryResults.type} FINDER</h2>
          </div>
          <div className="text-blue-600 font-black flex items-center gap-3 bg-blue-50 px-6 py-3 rounded-2xl">
            <span className="animate-ping w-3 h-3 bg-blue-600 rounded-full"></span>
            SYNCED
          </div>
        </header>
        <main className="flex-1 max-w-7xl mx-auto w-full p-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
            {discoveryResults.list.map((place, idx) => (
              <div key={place.id} className="bg-white rounded-[3rem] border-4 border-white shadow-2xl p-10 flex flex-col animate-in zoom-in-95 duration-300" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="flex justify-between items-start mb-8">
                  <span className="text-6xl">{categoryIcon}</span>
                  <div className="text-2xl font-black bg-slate-50 px-4 py-2 rounded-xl">⭐ {place.rating?.toFixed(1)}</div>
                </div>
                <h4 className="text-3xl font-black text-slate-900 mb-2 leading-none">{place.name}</h4>
                <p className="text-lg font-bold text-slate-400 mb-10 flex-1">{place.address}</p>
                <div className="flex gap-4">
                  <button onClick={() => handlePlaceSelect(place)} className="flex-1 py-6 bg-blue-600 text-white rounded-[1.8rem] font-black text-xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all">MAP ROUTE</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-x-hidden">
      <Header userName={userName} onLogout={() => setIsLoggedIn(false)} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 flex flex-col gap-8">
          <div className="bg-slate-200/50 p-2 rounded-3xl flex gap-2 self-center border-2 border-slate-200">
            <button onClick={() => setMode(AppMode.KIOSK)} className={`px-12 py-4 rounded-2xl font-black text-xl transition-all ${mode === AppMode.KIOSK ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>ASSISTANCE</button>
            <button onClick={() => setMode(AppMode.CONVERSATION)} className={`px-12 py-4 rounded-2xl font-black text-xl transition-all ${mode === AppMode.CONVERSATION ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>TRANSLATOR</button>
          </div>
          <div className={`bg-white border-4 border-slate-100 rounded-[4rem] p-12 flex-1 flex flex-col shadow-2xl relative transition-all duration-700 ${mode === AppMode.CONVERSATION ? 'bg-slate-50' : ''}`}>
            <VoiceInterface 
              state={state} 
              mode={mode}
              onStart={handleStartInteraction} 
              onStop={handleStopRecording}
              error={error}
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              targetLanguage={targetLanguage}
              onTargetLanguageChange={setTargetLanguage}
            />
          </div>
          <ConversationLog messages={messages} onReset={handleReset} />
        </div>

        <div className="flex flex-col gap-8">
          <KioskInfo kiosk={{...CURRENT_KIOSK, name: currentAddress}} userPos={userPos} />
          <div className="bg-blue-600 rounded-[3rem] p-10 shadow-2xl text-white">
            <h3 className="font-black mb-8 text-2xl tracking-tighter uppercase">Quick Discover</h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { type: 'medical' as const, icon: '🏥', label: 'Hospitals' },
                { type: 'police' as const, icon: '🚔', label: 'Safety' },
                { type: 'restaurant' as const, icon: '🍽️', label: 'Dining' }
              ].map(cat => (
                <button 
                  key={cat.type} 
                  onClick={() => openCategoryPage(cat.type)} 
                  className="group flex items-center gap-6 bg-white/10 hover:bg-white p-5 rounded-[2rem] border-2 border-white/20 transition-all active:scale-95 text-left"
                >
                  <span className={`w-16 h-16 bg-white/20 group-hover:bg-blue-50 rounded-2xl flex items-center justify-center text-4xl transition-colors ${cache[cat.type] ? 'border-2 border-white/50 animate-pulse' : ''}`}>{cat.icon}</span>
                  <div>
                    <div className="font-black text-xl group-hover:text-blue-900 leading-none">{cat.label}</div>
                    <div className="text-[10px] font-black group-hover:text-blue-400 uppercase tracking-widest mt-1">
                      {cache[cat.type] ? 'Ready to View' : 'Syncing...'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
      {activePlace && <MapDirectionsModal info={activePlace} onClose={() => setActivePlace(null)} userLocation={userPos} />}
    </div>
  );
};

export default App;
