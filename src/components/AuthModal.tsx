import React, { useState } from 'react';
import { Shield, CheckCircle, AlertTriangle, Building2, Smartphone, ArrowRight, Lock, Mail, User, Calendar, Phone } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (user: UserProfile) => void;
  currentUser?: UserProfile;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
  currentUser,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [step, setStep] = useState<'credentials' | 'profile'>('credentials');
  const [email, setEmail] = useState('sahimplanet@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  
  // Profile fields requested by user
  const [name, setName] = useState(currentUser?.name || 'Sahim Planet');
  const [dob, setDob] = useState(currentUser?.dob || '1998-12-14');
  const [phone, setPhone] = useState(currentUser?.phone || '+254712345678');
  const [idOrBirthEntryNo, setIdOrBirthEntryNo] = useState(currentUser?.idOrBirthEntryNo || 'ID-32981044');
  const [platform, setPlatform] = useState<'mpesa' | 'bank'>(currentUser?.platform || 'bank');
  const [subOption, setSubOption] = useState(currentUser?.subOption || 'mshwari');
  const [bankName, setBankName] = useState(currentUser?.bankName || 'Absa Bank');
  const [accountNumber, setAccountNumber] = useState(currentUser?.accountNumber || '0304928172');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'sahimplanet@gmail.com',
          name: 'Sahim Planet',
          isGoogle: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('profile');
      }
    } catch {
      setStep('profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }
    setStep('profile');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter your full official name.');
      return;
    }
    if (platform === 'bank' && !accountNumber.trim()) {
      setErrorMessage('Please enter your bank account number for automatic SMS matching.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          dob,
          phone,
          idOrBirthEntryNo,
          platform,
          subOption: platform === 'mpesa' ? subOption : undefined,
          bankName: platform === 'bank' ? bankName : undefined,
          accountNumber: platform === 'bank' ? accountNumber : undefined,
        }),
      });

      const data = await response.json();
      if (data.success && data.user) {
        onAuthenticated(data.user);
        onClose();
      } else {
        setErrorMessage('Failed to save profile on backend.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error saving profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-2xl text-slate-100">
        
        {step === 'credentials' ? (
          <div>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-500/15 text-sky-400 mb-3 border border-sky-500/30">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {mode === 'signup' ? 'Create your Wedzo Account' : 'Welcome back to Wedzo'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Kenya’s verified finance engine with tamper-proof SMS message scanning and disciplined savings auto-deduction.
              </p>
            </div>

            {/* Mode switch (M3 Tonal Segmented Pill) */}
            <div className="flex border border-slate-800 bg-slate-950 p-1 rounded-full mb-6">
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all ${
                  mode === 'signup' ? 'bg-sky-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all ${
                  mode === 'signin' ? 'bg-sky-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
            </div>

            {/* Google One-Click Button */}
            <button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white text-slate-900 hover:bg-slate-100 font-semibold rounded-full text-xs transition-all shadow-sm mb-4 active:scale-98"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider font-mono">
                or with email
              </span>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleCredentialsSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-full pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-sky-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-full pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-sky-400 font-mono"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold rounded-full text-xs transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
              >
                <span>{mode === 'signup' ? 'Create Account & Configure Profile' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* Profile & Financial Setup */
          <div>
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-sky-500/15 text-sky-400 mb-2 border border-sky-500/30">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Complete Your Financial Profile
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Saved securely to your backend for automatic SMS verification and name matching.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Legal Name (as registered with Bank/M-Pesa)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sahim Planet"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-full pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Wedzo matches incoming SMS sender/recipient names against this name to approve transactions.
                </p>
              </div>

              {/* Date of Birth & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-full pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-sky-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Mobile Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+254 712 345 678"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-full pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-sky-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* ID / Birth Entry No */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  National ID or Birth Entry Number
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={idOrBirthEntryNo}
                    onChange={(e) => setIdOrBirthEntryNo(e.target.value)}
                    placeholder="e.g. ID-32981044 or Entry No"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-full pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-sky-400 font-mono"
                  />
                </div>
              </div>

              {/* Platform Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Primary Saving & Clearing Platform
                </label>
                <div className="grid grid-cols-2 gap-2.5 mb-2">
                  <button
                    type="button"
                    onClick={() => setPlatform('bank')}
                    className={`flex items-center gap-2 p-3 rounded-2xl border text-left transition-all ${
                      platform === 'bank'
                        ? 'border-sky-400 bg-sky-500/15 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Building2 className={`w-4 h-4 ${platform === 'bank' ? 'text-sky-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="text-xs font-bold">Commercial Bank</div>
                      <div className="text-[10px] text-slate-500">Absa, Equity, KCB, etc.</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlatform('mpesa')}
                    className={`flex items-center gap-2 p-3 rounded-2xl border text-left transition-all ${
                      platform === 'mpesa'
                        ? 'border-emerald-400 bg-emerald-500/15 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Smartphone className={`w-4 h-4 ${platform === 'mpesa' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="text-xs font-bold">Safaricom M-PESA</div>
                      <div className="text-[10px] text-slate-500">M-Shwari, KCB, Personal</div>
                    </div>
                  </button>
                </div>

                {/* Telkom Kenya Blacklisted Notice per user brief */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-300">Carrier Notice: </span>
                    Telkom Kenya (T-Kash) is deprecated & blacklisted in Kenya. Wedzo operates strictly with Safaricom M-PESA and licensed Commercial Banks.
                  </div>
                </div>
              </div>

              {/* Sub-platform details */}
              {platform === 'bank' ? (
                <div className="space-y-3 p-3.5 rounded-2xl border border-slate-800 bg-slate-950">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Select Your Bank
                    </label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400 font-medium"
                    >
                      <option value="Absa Bank">Absa Bank Kenya</option>
                      <option value="Equity Bank">Equity Bank</option>
                      <option value="KCB Bank">KCB Bank Kenya</option>
                      <option value="Standard Chartered">Standard Chartered Kenya</option>
                      <option value="NCBA Bank">NCBA Bank Kenya</option>
                      <option value="Co-operative Bank">Co-operative Bank of Kenya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Bank Account Number (matched in pasted alerts)
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g. 0304928172"
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400 font-mono"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Pasted bank SMS messages will be verified against this exact account number.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-3.5 rounded-2xl border border-slate-800 bg-slate-950">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      M-PESA Savings Sub-Account
                    </label>
                    <select
                      value={subOption}
                      onChange={(e) => setSubOption(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-medium"
                    >
                      <option value="mshwari">M-Shwari Lock Savings Account</option>
                      <option value="kcb_mpesa">KCB M-PESA Target Account</option>
                      <option value="personal">Personal M-PESA Main Wallet</option>
                    </select>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Incoming M-Pesa SMS alerts will match your registered name ({name}) and phone ({phone}).
                  </p>
                </div>
              )}

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold rounded-full text-xs transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
              >
                <span>{isLoading ? 'Saving Profile...' : 'Save Profile & Enter Dashboard'}</span>
                <CheckCircle className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
