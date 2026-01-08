
import React, { useState, useEffect } from 'react';

interface AuthPageProps {
  onLogin: (name: string) => void;
}

type AuthView = 'SIGN_IN' | 'SIGN_UP' | 'FORGOT' | 'OTP' | 'RESET';

const STORAGE_KEY = 'STRIKERS_USERS';

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('SIGN_IN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Clear alerts on view change
  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [view]);

  const getUsers = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  };

  const saveUser = (userData: any) => {
    const users = getUsers();
    users.push(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getUsers();
    if (users.find((u: any) => u.email === email)) {
      setError("Account already exists. Please Sign In.");
      return;
    }
    saveUser({ name, email, password });
    setSuccess("Account created successfully!");
    setTimeout(() => setView('SIGN_IN'), 1500);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getUsers();
    const user = users.find((u: any) => u.email === email && u.password === password);
    if (!user) {
      setError("Invalid email or password. Please sign up first.");
      return;
    }
    onLogin(user.name);
  };

  const handleForgotRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getUsers();
    if (!users.find((u: any) => u.email === email)) {
      setError("Email not registered in system.");
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setView('OTP');
    // Simulated system notification
    console.log(`STRIKERS SECURE OTP: ${code}`);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join('') === generatedOtp) {
      setView('RESET');
    } else {
      setError("Incorrect OTP code. Try again.");
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const users = getUsers();
    const updatedUsers = users.map((u: any) => 
      u.email === email ? { ...u, password: password } : u
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
    setSuccess("Password updated!");
    setTimeout(() => setView('SIGN_IN'), 1500);
  };

  const renderAlerts = () => (
    <>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-100 rounded-2xl text-red-600 font-black text-sm flex items-center gap-3 animate-bounce">
          <span>⚠️</span> {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border-2 border-green-100 rounded-2xl text-green-600 font-black text-sm flex items-center gap-3">
          <span>✅</span> {success}
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>

      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl border-4 border-white shadow-[0_32px_64px_-15px_rgba(37,99,235,0.2)] rounded-[4rem] p-12 relative z-10 transition-all duration-500">
        
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white text-5xl shadow-2xl mb-6">
            🚉
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight text-center uppercase">
            {view === 'SIGN_IN' && 'Member Login'}
            {view === 'SIGN_UP' && 'Secure Registration'}
            {view === 'FORGOT' && 'Access Recovery'}
            {view === 'OTP' && 'Identity Verification'}
            {view === 'RESET' && 'New Credentials'}
          </h1>
          {view === 'OTP' && (
            <div className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-xs animate-pulse">
              DEBUG OTP: {generatedOtp}
            </div>
          )}
        </div>

        {renderAlerts()}

        {view === 'SIGN_IN' && (
          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="relative group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl">📧</span>
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required 
                className="w-full pl-20 pr-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold text-xl focus:border-blue-600 focus:bg-white outline-none transition-all shadow-sm" />
            </div>
            <div className="relative group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl">🔒</span>
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required 
                className="w-full pl-20 pr-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold text-xl focus:border-blue-600 focus:bg-white outline-none transition-all shadow-sm" />
            </div>
            <div className="text-right">
              <button type="button" onClick={() => setView('FORGOT')} className="text-blue-600 font-black text-sm hover:underline">Forgot password?</button>
            </div>
            <button type="submit" className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black text-2xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-4 uppercase tracking-widest">
              SIGN IN <span className="text-4xl">➜</span>
            </button>
            <p className="text-center font-bold text-slate-400">
              New here? <button type="button" onClick={() => setView('SIGN_UP')} className="text-blue-600">Join Strikers</button>
            </p>
          </form>
        )}

        {view === 'SIGN_UP' && (
          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl">👤</span>
              <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required 
                className="w-full pl-20 pr-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold text-xl focus:border-blue-600 outline-none transition-all" />
            </div>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl">📧</span>
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required 
                className="w-full pl-20 pr-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold text-xl focus:border-blue-600 outline-none transition-all" />
            </div>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl">🔒</span>
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required 
                className="w-full pl-20 pr-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold text-xl focus:border-blue-600 outline-none transition-all" />
            </div>
            <button type="submit" className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black text-2xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-widest">
              CREATE ACCOUNT
            </button>
            <p className="text-center font-bold text-slate-400">
              Already a member? <button type="button" onClick={() => setView('SIGN_IN')} className="text-blue-600">Sign In</button>
            </p>
          </form>
        )}

        {view === 'FORGOT' && (
          <form onSubmit={handleForgotRequest} className="space-y-6">
            <p className="text-slate-500 font-bold text-center px-8 mb-8 leading-relaxed">Enter your registered email. We'll send a 6-digit secure pulse code (OTP) to your device.</p>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl">📧</span>
              <input type="email" placeholder="Registered Email" value={email} onChange={e => setEmail(e.target.value)} required 
                className="w-full pl-20 pr-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold text-xl focus:border-blue-600 outline-none transition-all" />
            </div>
            <button type="submit" className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black text-2xl shadow-xl hover:bg-black active:scale-95 transition-all uppercase tracking-widest">
              SEND SECURE CODE
            </button>
            <button type="button" onClick={() => setView('SIGN_IN')} className="w-full text-slate-400 font-black uppercase text-sm">Cancel</button>
          </form>
        )}

        {view === 'OTP' && (
          <form onSubmit={handleOtpSubmit} className="space-y-10">
            <p className="text-slate-500 font-bold text-center mb-8">Verification code sent to {email}</p>
            <div className="flex justify-between gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const newOtp = [...otp];
                    newOtp[idx] = e.target.value;
                    setOtp(newOtp);
                    if (e.target.value && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
                  }}
                  className="w-14 h-20 bg-slate-50 border-4 border-slate-100 rounded-2xl text-center font-black text-3xl focus:border-blue-600 focus:bg-white outline-none transition-all shadow-sm"
                />
              ))}
            </div>
            <button type="submit" className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black text-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest">
              VERIFY IDENTITY
            </button>
          </form>
        )}

        {view === 'RESET' && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl">🔒</span>
              <input type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} required 
                className="w-full pl-20 pr-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold text-xl focus:border-blue-600 outline-none transition-all" />
            </div>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl">🔄</span>
              <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required 
                className="w-full pl-20 pr-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold text-xl focus:border-blue-600 outline-none transition-all" />
            </div>
            <button type="submit" className="w-full py-8 bg-green-600 text-white rounded-[2.5rem] font-black text-2xl shadow-xl hover:bg-green-700 active:scale-95 transition-all uppercase tracking-widest">
              SAVE NEW PASSWORD
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
