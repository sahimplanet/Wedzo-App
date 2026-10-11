import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CreditCard, 
  PiggyBank, 
  TrendingUp, 
  Smartphone,
  Zap,
  Users
} from 'lucide-react';

interface IntroductionPageProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onQuickDemoClick?: () => void;
  firebaseConnected?: boolean;
}

export const IntroductionPage: React.FC<IntroductionPageProps> = ({
  onLoginClick,
  onSignUpClick,
  onQuickDemoClick,
  firebaseConnected,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-slate-950">
      {/* Top Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center font-black text-slate-950 text-lg shadow-md shadow-sky-500/20">
              W
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">Wedzo</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
                Verified Finance
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-[350px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Pill Banner */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold mb-6 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Next-Gen M-PESA & Bank Financial Ledger</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
              Grow Your Wealth With <br />
              <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-sky-200 bg-clip-text text-transparent">
                Disciplined Auto-Deductions
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Wedzo connects directly to your verified SMS confirmations. Turn incoming deposits into automated holiday savings, car deposit pledges, and loan clearance while earning valuable Discipline Credits.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                onClick={onLoginClick}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-full transition-all shadow-lg shadow-sky-500/25 active:scale-95"
              >
                <span>Login Now</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                onClick={onSignUpClick}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium text-slate-200 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-full hover:border-slate-600 transition-all active:scale-95"
              >
                <span>Create New Account</span>
              </button>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid (Material Design 3 Surface Hierarchy) */}
        <section className="py-12 border-t border-slate-800/60 bg-slate-900/40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-white tracking-tight">Why Kenyans Choose Wedzo</h2>
              <p className="text-sm text-slate-400 mt-1">
                A disciplined savings platform engineered for everyday bank and mobile money habits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="rounded-3xl p-6 bg-slate-900/90 border border-slate-800/90 hover:border-sky-500/40 transition-all shadow-md group">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Automated SMS Verification</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Paste incoming messages from Absa, Equity, KCB, or M-PESA. Our system extracts amounts, sender details, and verifies bank references without manual bookkeeping.
                </p>
              </div>

              {/* Card 2 */}
              <div className="rounded-3xl p-6 bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/40 transition-all shadow-md group">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <PiggyBank className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Liability & Goal Auto-Split</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every deposit automatically deducts agreed percentages toward your high-priority goals—like your December Holiday Getaway, AI Debit Card, or Car Pledge.
                </p>
              </div>

              {/* Card 3 */}
              <div className="rounded-3xl p-6 bg-slate-900/90 border border-slate-800/90 hover:border-emerald-500/40 transition-all shadow-md group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Discipline Credits & Rewards</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Earn discipline credits every time you consistently deposit and reconcile. Redeem credits for up to a 50% discount on Premier and Class subscription plans.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Step-by-Step */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs uppercase font-mono tracking-widest text-sky-400">Simple Onboarding</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">Get Started in 3 Easy Steps</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-sm mb-4">
                  1
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">Create Your Profile</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Provide your Phone Number, Full Name, ID / Birth Entry No, Date of Birth, and Email for Firestore sync.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm mb-4">
                  2
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">Set Savings Promises</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Choose your targets: December vacation, emergency reserve, or debt settlement promises with auto-deduction rules.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm mb-4">
                  3
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">Save & Invest</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Paste incoming SMS deposit notifications or reconcile 3 messages to keep your financial ledger in perfect balance.
                </p>
              </div>
            </div>

            {/* Bottom Call to Action Card */}
            <div className="mt-14 rounded-3xl p-8 bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/60 border border-sky-500/20 text-center relative overflow-hidden">
              <h3 className="text-xl font-bold text-white mb-2">Ready to take control of your financial destiny?</h3>
              <p className="text-xs text-slate-300 max-w-lg mx-auto mb-6">
                Join thousands of disciplined savers in Kenya using Wedzo's automated reconciliation engine.
              </p>
              <button
                onClick={onLoginClick}
                className="inline-flex items-center gap-2 px-8 py-3 text-sm font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-full transition-all shadow-md shadow-sky-500/20 active:scale-95"
              >
                <span>Login Now</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Wedzo. All rights reserved. Registered financial tracking platform.</p>
          <div className="flex items-center gap-4 text-xs">
            <span>M-PESA / Absa / Equity / KCB Reconciler</span>
            <span>•</span>
            <span>Google Firestore Database</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
