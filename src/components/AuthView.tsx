import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, User, Github, Sparkles, RefreshCw, AlertCircle, Chrome } from 'lucide-react';

interface AuthViewProps {
  onAuthSuccess: (token: string, user: any) => void;
}

export function AuthView({ onAuthSuccess }: AuthViewProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Simulated OAuth Modal state
  const [showOAuthModal, setShowOAuthModal] = useState<any | null>(null); // 'google' | 'github' | null
  const [oauthName, setOauthName] = useState('');
  const [oauthEmail, setOauthEmail] = useState('');

  // Handle standard Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validations
    if (!email || !password) {
      setError('Please provide all credentials.');
      return;
    }
    if (activeTab === 'signup' && !name) {
      setError('Please provide your name.');
      return;
    }
    if (activeTab === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = activeTab === 'signin' ? '/api/auth/login' : '/api/auth/register';
      const body = activeTab === 'signin' 
        ? { email, password } 
        : { email, password, name };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed. Please check credentials.');
      }

      // Success
      localStorage.setItem('auth_token', data.token);
      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger Simulated OAuth login
  const handleSimulatedOAuthSubmit = async () => {
    if (!oauthEmail || !oauthName) {
      setError('Please provide both email and name for simulated connection.');
      return;
    }
    setLoading(true);
    setShowOAuthModal(null);
    try {
      const response = await fetch('/api/auth/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: showOAuthModal,
          email: oauthEmail,
          name: oauthName
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Simulated OAuth failed.');
      }

      localStorage.setItem('auth_token', data.token);
      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Simulated OAuth error.');
    } finally {
      setLoading(false);
    }
  };

  const openOAuthSimulator = (provider: 'google' | 'github') => {
    setError(null);
    setOauthName(provider === 'google' ? 'Alexander Google Mercer' : 'Alex Git Mercer');
    setOauthEmail(provider === 'google' ? 'alex.mercer@gmail.com' : 'alex-mercer-dev@github.com');
    setShowOAuthModal(provider);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-panel p-8 border-2 border-[#F8F7F4]/10 relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#FFD700]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Title and Badge */}
        <div className="text-center font-mono">
          <div className="flex justify-center mb-4">
            <div className="p-3 border border-[#F8F7F4] text-[#FFD700] bg-white/5 animate-pulse">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>
          <h2 className="font-display font-extrabold text-[#F8F7F4] text-3xl tracking-tighter uppercase">
            Platform Gateway
          </h2>
          <p className="text-[10px] text-[#F8F7F4]/60 tracking-widest mt-2 block uppercase">
            SECURE SCHOLAR GATEWAY // ACCESS RESTRICTED
          </p>
        </div>

        {/* Custom Tab Selector */}
        <div className="flex border-b-2 border-[#F8F7F4]/10 font-mono text-xs font-bold pt-4">
          <button
            onClick={() => { setActiveTab('signin'); setError(null); }}
            className={`flex-1 pb-3 text-center transition-all ${
              activeTab === 'signin' 
                ? 'border-b-2 border-[#FFD700] text-[#FFD700]' 
                : 'text-[#F8F7F4]/40 hover:text-[#F8F7F4]'
            }`}
          >
            [ SIGN IN ]
          </button>
          <button
            onClick={() => { setActiveTab('signup'); setError(null); }}
            className={`flex-1 pb-3 text-center transition-all ${
              activeTab === 'signup' 
                ? 'border-b-2 border-[#FFD700] text-[#FFD700]' 
                : 'text-[#F8F7F4]/40 hover:text-[#F8F7F4]'
            }`}
          >
            [ SIGN UP ]
          </button>
        </div>

        {/* Warning / Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 flex items-start gap-3 text-xs text-red-400 font-mono">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
            <div>
              <p className="font-bold uppercase">SECURITY EXCEPTION</p>
              <p className="mt-1 text-red-400/80 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-6 font-mono text-xs">
          {activeTab === 'signup' && (
            <div>
              <label className="block text-[10px] font-bold text-[#F8F7F4]/60 uppercase mb-2">Display Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#F8F7F4]/30">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 bg-[#111113] border border-[#F8F7F4]/20 py-3 px-4 focus:border-[#FFD700] focus:outline-none text-[#F8F7F4] uppercase font-bold"
                  placeholder="e.g. John Doe"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-[#F8F7F4]/60 uppercase mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#F8F7F4]/30">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 bg-[#111113] border border-[#F8F7F4]/20 py-3 px-4 focus:border-[#FFD700] focus:outline-none text-[#F8F7F4]"
                placeholder="e.g. scholar@ecourse.ai"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#F8F7F4]/60 uppercase mb-2">Password Credentials</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#F8F7F4]/30">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 bg-[#111113] border border-[#F8F7F4]/20 py-3 px-4 focus:border-[#FFD700] focus:outline-none text-[#F8F7F4]"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          {activeTab === 'signup' && (
            <div>
              <label className="block text-[10px] font-bold text-[#F8F7F4]/60 uppercase mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#F8F7F4]/30">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 bg-[#111113] border border-[#F8F7F4]/20 py-3 px-4 focus:border-[#FFD700] focus:outline-none text-[#F8F7F4]"
                  placeholder="••••••••••••"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#FFD700] hover:bg-amber-400 text-[#111113] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#FFD700]"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{activeTab === 'signin' ? 'Verify Credentials' : 'Enroll Account'}</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-2 items-center font-mono">
          <div className="flex-grow border-t border-[#F8F7F4]/10"></div>
          <span className="flex-shrink mx-4 text-[9px] text-[#F8F7F4]/40 uppercase tracking-widest">or integrate federated</span>
          <div className="flex-grow border-t border-[#F8F7F4]/10"></div>
        </div>

        {/* OAuth Federation Simulation Buttons */}
        <div className="grid grid-cols-2 gap-4 font-mono text-xs">
          <button
            type="button"
            onClick={() => openOAuthSimulator('google')}
            className="flex items-center justify-center gap-2 py-3 border border-[#F8F7F4]/20 hover:border-[#F8F7F4] text-[#F8F7F4]/80 hover:text-[#F8F7F4] bg-white/5 transition uppercase font-bold cursor-pointer"
          >
            <Chrome className="w-4 h-4 text-amber-500" />
            <span>Google ID</span>
          </button>
          
          <button
            type="button"
            onClick={() => openOAuthSimulator('github')}
            className="flex items-center justify-center gap-2 py-3 border border-[#F8F7F4]/20 hover:border-[#F8F7F4] text-[#F8F7F4]/80 hover:text-[#F8F7F4] bg-white/5 transition uppercase font-bold cursor-pointer"
          >
            <Github className="w-4 h-4" />
            <span>GitHub ID</span>
          </button>
        </div>
      </div>

      {/* Interactive OAuth Simulator Modal */}
      {showOAuthModal && (
        <div className="fixed inset-0 bg-[#111113]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181b] p-8 max-w-md w-full border-2 border-[#FFD700] shadow-2xl relative">
            <div className="flex items-center gap-2 mb-4 border-b border-[#F8F7F4]/20 pb-3 font-mono">
              {showOAuthModal === 'google' ? (
                <Chrome className="w-5 h-5 text-amber-500 animate-spin" />
              ) : (
                <Github className="w-5 h-5 text-white animate-spin" />
              )}
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#FFD700]">
                {showOAuthModal === 'google' ? 'GOOGLE ACCOUNT AUTHORIZATION' : 'GITHUB APP AUTHORIZATION'}
              </span>
            </div>

            <h3 className="text-xl font-display font-extrabold text-[#F8F7F4] uppercase leading-tight tracking-tight">
              Authorize E-Course AI
            </h3>
            <p className="text-xs text-[#F8F7F4]/60 mt-2 font-mono leading-relaxed">
              This simulated sandbox OAuth screen allows logging in with standard Google or GitHub credentials instantly.
            </p>

            <div className="mt-6 space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[10px] font-bold text-[#F8F7F4]/60 uppercase mb-2">Simulated Profile Name</label>
                <input
                  type="text"
                  value={oauthName}
                  onChange={(e) => setOauthName(e.target.value)}
                  className="w-full bg-[#111113] border border-[#F8F7F4]/20 py-3 px-4 text-[#F8F7F4] focus:border-[#FFD700] focus:outline-none font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#F8F7F4]/60 uppercase mb-2">Simulated Login Email</label>
                <input
                  type="email"
                  value={oauthEmail}
                  onChange={(e) => setOauthEmail(e.target.value)}
                  className="w-full bg-[#111113] border border-[#F8F7F4]/20 py-3 px-4 text-[#F8F7F4] focus:border-[#FFD700] focus:outline-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowOAuthModal(null)}
                  className="flex-1 py-3 text-xs font-bold text-[#F8F7F4]/60 border border-[#F8F7F4]/20 hover:border-[#F8F7F4] hover:text-[#F8F7F4] transition uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSimulatedOAuthSubmit}
                  className="flex-1 py-3 text-xs font-bold bg-[#FFD700] text-[#111113] border border-[#FFD700] hover:bg-amber-400 transition uppercase cursor-pointer flex items-center justify-center gap-1"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Grant Access</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
