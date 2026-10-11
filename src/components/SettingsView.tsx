import React, { useState } from 'react';
import { 
  User, 
  Coins, 
  Smartphone, 
  Building2, 
  Layers, 
  ShieldCheck, 
  Moon, 
  Sun, 
  Download, 
  Trash2, 
  LogOut, 
  Check, 
  AlertTriangle,
  Info,
  TrendingUp,
  Save
} from 'lucide-react';
import { 
  UserProfile, 
  PlatformType, 
  CurrencyCode, 
  MpesaService, 
  SupportedBank 
} from '../types';
import { APP_NAME, DEFAULT_EXCHANGE_RATES, formatMoney } from '../utils/currency';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onLogout: () => void;
  onResetData: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateUser,
  onLogout,
  onResetData,
  theme = 'dark',
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const [currency, setCurrency] = useState<CurrencyCode>(user.currency || 'KES');
  const [platform, setPlatform] = useState<PlatformType>(user.platform);
  const [autoAllocate, setAutoAllocate] = useState(user.autoAllocate);
  const [allocationMode, setAllocationMode] = useState(user.allocationMode || 'equal');

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      currency,
      platform,
      autoAllocate,
      allocationMode,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className={`p-6 rounded-3xl border ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h2 className="text-2xl font-black tracking-tight text-white mb-1">
          Settings & Preferences
        </h2>
        <p className="text-xs text-slate-400">
          Customize your profile, financial platform, currency rates, themes, and security controls.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Profile Card */}
        <div className={`p-6 rounded-3xl border space-y-4 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            <span>Profile Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-2xl text-xs border outline-none ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-2xl text-xs border outline-none ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone (M-Pesa registered)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-2xl text-xs border outline-none ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Currency & Exchange Rates Card */}
        <div className={`p-6 rounded-3xl border space-y-4 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span>Currency & Conversion Rates</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['KES', 'USD', 'EUR', 'GBP'] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setCurrency(code)}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  currency === code
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-sm'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                }`}
              >
                <span className="font-extrabold text-sm block">{code}</span>
                <span className="text-[11px] block mt-0.5">{code === 'KES' ? 'KSh (Default)' : `${code} Foreign`}</span>
              </button>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Exchange Rate Engine: 1 USD = 129.50 KES</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Source: {DEFAULT_EXCHANGE_RATES.USD_KES.source}. Timestamped today. Amounts in different currencies are never combined without a recorded conversion.
            </p>
          </div>
        </div>

        {/* Platform Configuration Card */}
        <div className={`p-6 rounded-3xl border space-y-4 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Platform Configuration</span>
          </h3>
          <p className="text-xs text-slate-400">
            You can switch between M-Pesa and Bank workflows anytime without losing past transaction history.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPlatform('mpesa')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                platform === 'mpesa'
                  ? 'border-emerald-500 bg-emerald-500/15 text-white'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400'
              }`}
            >
              <span className="font-bold text-sm block">M-Pesa Workflow</span>
              <span className="text-xs text-slate-400">M-Shwari, Lock, Ziidi</span>
            </button>

            <button
              type="button"
              onClick={() => setPlatform('bank')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                platform === 'bank'
                  ? 'border-emerald-500 bg-emerald-500/15 text-white'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400'
              }`}
            >
              <span className="font-bold text-sm block">Bank Workflow</span>
              <span className="text-xs text-slate-400">Absa, Equity, KCB, DTB</span>
            </button>
          </div>
        </div>

        {/* Theme & Display Mode */}
        <div className={`p-6 rounded-3xl border flex items-center justify-between ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              {isDark ? <Moon className="w-4 h-4 text-sky-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
              <span>Interface Appearance</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Toggle between Dark Navy and Light Clean fintech theme</p>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            className={`px-4 py-2 rounded-full text-xs font-bold border transition-all flex items-center gap-2 ${
              isDark ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-white' : 'border-slate-300 bg-slate-100 text-slate-900'
            }`}
          >
            {isDark ? <span>Switch to Light Mode</span> : <span>Switch to Dark Mode</span>}
          </button>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between">
          <div>
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-fade-in">
                <Check className="w-4 h-4" />
                <span>Settings saved successfully!</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 active:scale-98"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>Save All Settings</span>
          </button>
        </div>
      </form>

      {/* Security & Disclaimer Notice */}
      <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Financial Security & Disclaimer</span>
        </div>
        <p>
          {APP_NAME} is a self-directed personal finance ledger and auto-allocation assistant. It is not a licensed commercial bank or deposit-taking institution. Verified balances represent verified transaction messages pasted by you, not physical custody of cash. We never ask for your M-Pesa PIN or banking passwords.
        </p>
      </div>

      {/* Danger Zone: Reset Data & Logout */}
      <div className="p-6 rounded-3xl border border-rose-500/30 bg-rose-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Account Session & Data Reset</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Reset simulation data or securely log out of your {APP_NAME} session.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onResetData}
            className="px-4 py-2 rounded-full text-xs font-semibold border border-rose-500/40 text-rose-300 hover:bg-rose-500/20 transition-all"
          >
            Reset All Data
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
