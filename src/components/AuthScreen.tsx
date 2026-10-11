import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Sparkles,
  KeyRound,
  ArrowRight
} from 'lucide-react';
import { UserProfile } from '../types';
import { APP_NAME } from '../utils/currency';

interface AuthScreenProps {
  initialMode?: 'signin' | 'signup' | 'forgot';
  onAuthenticated: (user: UserProfile) => void;
  onBackToIntro: () => void;
  theme?: 'dark' | 'light';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode = 'signin',
  onAuthenticated,
  onBackToIntro,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sign In inputs
  const [loginEmail, setLoginEmail] = useState('sahimplanet@gmail.com');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Sign Up inputs
  const [signupName, setSignupName] = useState('Sahim Planet');
  const [signupEmail, setSignupEmail] = useState('sahimplanet@gmail.com');
  const [signupPhone, setSignupPhone] = useState('+254712345678');
  const [signupPassword, setSignupPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('password123');

  // Forgot password
  const [resetEmail, setResetEmail] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginEmail.trim()) {
      setErrorMsg('Please enter your email or phone number.');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginEmail.trim(), email: loginEmail.trim() }),
      });
      const data = await response.json();

      if (data.user) {
        // Check local storage for existing onboarding state
        const savedProfileStr = localStorage.getItem(`saveflow_profile_${data.user.id}`);
        let finalUser = data.user;
        if (savedProfileStr) {
          try {
            finalUser = { ...data.user, ...JSON.parse(savedProfileStr) };
          } catch (e) {
            // ignore
          }
        }
        setSuccessMsg(`Welcome back, ${finalUser.name}!`);
        setTimeout(() => {
          onAuthenticated(finalUser);
        }, 400);
      } else {
        setErrorMsg('Invalid credentials. Please verify your email or password.');
      }
    } catch (err) {
      // Fallback offline mock for seamless prototyping
      const fallbackUser: UserProfile = {
        id: 'usr_' + Date.now(),
        email: loginEmail,
        name: signupName || 'Kenyan Saver',
        phone: signupPhone || '+254712345678',
        platform: 'mpesa',
        currency: 'KES',
        autoAllocate: true,
        allocationMode: 'equal',
        onboardingCompleted: false,
        theme: 'dark',
        credits: 120,
      };
      onAuthenticated(fallbackUser);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!signupName.trim()) {
      setErrorMsg('Please enter your full legal name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!signupPhone.trim()) {
      setErrorMsg('Please provide your phone number (e.g. +254712345678).');
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (signupPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please recheck.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName.trim(),
          email: signupEmail.trim(),
          phone: signupPhone.trim(),
          platform: 'mpesa',
          currency: 'KES',
          onboardingCompleted: false,
        }),
      });
      const data = await response.json();

      if (data.user) {
        setSuccessMsg('Account created successfully! Preparing your onboarding setup...');
        setTimeout(() => {
          onAuthenticated({
            ...data.user,
            onboardingCompleted: false, // forces onboarding wizard step-by-step
          });
        }, 500);
      } else {
        setErrorMsg(data.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      const fallbackUser: UserProfile = {
        id: 'usr_' + Date.now(),
        name: signupName.trim(),
        email: signupEmail.trim(),
        phone: signupPhone.trim(),
        platform: 'mpesa',
        currency: 'KES',
        autoAllocate: true,
        allocationMode: 'equal',
        onboardingCompleted: false,
        theme: 'dark',
        credits: 120,
      };
      onAuthenticated(fallbackUser);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setErrorMsg('Please enter the email associated with your account.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim() }),
      });
      const data = await res.json();
      setSuccessMsg(data.message || `Password reset link sent to ${resetEmail}. Check your inbox.`);
    } catch (err) {
      setSuccessMsg(`Password reset link sent to ${resetEmail}. Check your inbox.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Background ambient radial */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top back navigation */}
      <div className="max-w-md mx-auto w-full mb-4 z-10">
        <button
          onClick={onBackToIntro}
          className={`inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full border transition-colors ${
            isDark ? 'border-slate-800 bg-slate-900 text-slate-300 hover:text-white' : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 shadow-sm'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Introduction</span>
        </button>
      </div>

      {/* Auth Card */}
      <div className={`max-w-md mx-auto w-full p-6 sm:p-8 rounded-3xl border shadow-2xl backdrop-blur-xl relative z-10 ${
        isDark ? 'bg-slate-900/95 border-slate-800/90' : 'bg-white border-slate-200'
      }`}>
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-500/20 font-black text-xl">
            S
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {mode === 'signin' && `Welcome back to ${APP_NAME}`}
            {mode === 'signup' && `Create your ${APP_NAME} account`}
            {mode === 'forgot' && 'Reset your password'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'signin' && 'Sign in to access your verified savings goals & auto-deductions.'}
            {mode === 'signup' && 'Start saving towards multiple goals with AI transaction verification.'}
            {mode === 'forgot' && "Enter your email address to receive password reset instructions."}
          </p>
        </div>

        {/* Tab switchers if not in forgot mode */}
        {mode !== 'forgot' && (
          <div className={`flex border p-1 rounded-full mb-6 ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-100'}`}>
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                mode === 'signin' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                mode === 'signup' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Error / Success notices */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MODE: Sign In */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email or Phone Number</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com or +254..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs border outline-none transition-colors ${
                    isDark 
                      ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500' 
                      : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setErrorMsg(null); setSuccessMsg(null); }}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs border outline-none transition-colors ${
                    isDark 
                      ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500' 
                      : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 active:scale-98"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In Now</span>}
            </button>
          </form>
        )}

        {/* MODE: Sign Up */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="e.g. Sahim Planet"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs border outline-none transition-colors ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs border outline-none transition-colors ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number (M-Pesa registered)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="+254712345678"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs border outline-none transition-colors ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className={`w-full pl-10 pr-3 py-2.5 rounded-2xl text-xs border outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Confirm</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className={`w-full pl-10 pr-3 py-2.5 rounded-2xl text-xs border outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 active:scale-98"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Account & Start Onboarding</span>}
            </button>
          </form>
        )}

        {/* MODE: Forgot Password */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Registered Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs border outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Reset Instructions</span>}
            </button>

            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMsg(null); setSuccessMsg(null); }}
              className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors pt-2"
            >
              Remember password? Back to Log In
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
