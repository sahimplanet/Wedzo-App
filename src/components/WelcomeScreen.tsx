import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  PiggyBank, 
  CheckCircle2, 
  TrendingUp, 
  Lock, 
  Smartphone, 
  Building2,
  Layers,
  Zap
} from 'lucide-react';
import { APP_NAME } from '../utils/currency';

interface WelcomeScreenProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
  theme?: 'dark' | 'light';
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onLoginClick,
  onSignUpClick,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col justify-between ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors`}>
      {/* Top Brand Bar */}
      <header className={`border-b ${isDark ? 'border-slate-800/80 bg-slate-900/80' : 'border-slate-200 bg-white/80'} backdrop-blur-md sticky top-0 z-20`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-slate-950 text-xl shadow-md shadow-emerald-600/20">
              S
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{APP_NAME}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">KENYA</span>
              </div>
              <p className="text-[11px] text-slate-400">Smart Automated Savings & Ledger</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLoginClick}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Log In
            </button>
            <button
              onClick={onSignUpClick}
              className="px-4 py-1.5 text-xs font-bold rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-sm shadow-emerald-500/20"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero */}
      <main className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-10 max-w-4xl mx-auto w-full text-center">
        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mx-auto mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Mobile-First Savings for M-Pesa & Kenyan Banks</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.12] mb-4">
          Save Money With <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
            AI-Verified Transaction Proof
          </span>
        </h1>

        <p className={`text-sm sm:text-base ${isDark ? 'text-slate-300' : 'text-slate-600'} max-w-2xl mx-auto leading-relaxed mb-8`}>
          Paste your incoming M-Pesa or bank confirmation messages. {APP_NAME} extracts verified deposits, matches cross-bank transfers, and automatically allocates money across all your goals.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto w-full mb-12">
          <button
            onClick={onSignUpClick}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/25 active:scale-98"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            onClick={onLoginClick}
            className={`w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm border transition-all ${
              isDark 
                ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600' 
                : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 hover:border-slate-400'
            }`}
          >
            <span>Sign In to Dashboard</span>
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2.5">
              <Smartphone className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm mb-1">M-Pesa & Bank Verified</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Works with M-Shwari, Ziidi Trader, KCB M-PESA, Equity, Absa, DTB, and more without manual math.
            </p>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-2.5">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm mb-1">Auto-Allocation Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Splits incoming savings equally or by percentage across your house, laptop, emergency, and school goals.
            </p>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-2.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm mb-1">Duplicate Protection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cryptographic reference tracking guards against double counting of M-Pesa to bank cross-transfers.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t py-6 text-center text-xs ${isDark ? 'border-slate-800/80 text-slate-500 bg-slate-950' : 'border-slate-200 text-slate-500 bg-white'}`}>
        <p>© 2026 {APP_NAME} Kenya. Engineered for disciplined personal savings. Not a bank.</p>
      </footer>
    </div>
  );
};
