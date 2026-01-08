
import React from 'react';

interface HeaderProps {
  userName?: string;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ userName, onLogout }) => {
  return (
    <header className="bg-white border-b-2 border-blue-50 py-6 px-10 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-6">
        <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl">S</div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 leading-none">Strikers</h1>
          <p className="text-[10px] text-blue-600 font-black tracking-[0.2em] uppercase mt-1">Smart Public Hub</p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated User</span>
          <span className="text-lg font-black text-slate-900 leading-none">{userName || 'Guest User'}</span>
        </div>
        
        <div className="h-14 w-px bg-slate-100 mx-2"></div>

        <button 
          onClick={onLogout}
          className="group flex items-center gap-4 bg-slate-50 hover:bg-red-50 px-6 py-3 rounded-2xl border-2 border-slate-100 hover:border-red-100 transition-all"
        >
          <span className="text-xl group-hover:scale-110 transition-transform">👤</span>
          <span className="font-black text-sm text-slate-400 group-hover:text-red-600 uppercase tracking-widest">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
