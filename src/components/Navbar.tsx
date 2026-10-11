import React from 'react';
import { 
  TrendingUp, 
  Target, 
  Plus, 
  History, 
  BarChart3, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  LayoutDashboard,
  Smartphone,
  Building2
} from 'lucide-react';
import { UserProfile } from '../types';
import { APP_NAME } from '../utils/currency';

export type ActiveTab = 'dashboard' | 'goals' | 'save' | 'transactions' | 'analytics' | 'settings';

interface NavbarProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  user: UserProfile;
  onLogout: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onLogout,
  theme = 'dark',
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'save', label: 'Save Money', icon: Plus },
    { id: 'transactions', label: 'Transactions', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Top Navbar for Desktop & Tablet */}
      <header className={`sticky top-0 z-30 border-b backdrop-blur-xl transition-colors ${
        isDark ? 'border-slate-800/80 bg-slate-900/95 text-slate-100' : 'border-slate-200 bg-white/95 text-slate-900 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-slate-950 text-lg shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                S
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight">{APP_NAME}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    KENYA
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-none">Automated Savings Ledger</p>
              </div>
            </button>
          </div>

          {/* Desktop Nav Items (hidden on mobile, uses bottom bar instead) */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full border border-slate-800 bg-slate-950/80 text-xs font-semibold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const isSave = item.id === 'save';

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all ${
                    isActive
                      ? isSave 
                        ? 'bg-emerald-400 text-slate-950 font-black shadow-sm'
                        : 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                      : isSave
                      ? 'text-emerald-400 hover:bg-emerald-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Controls & Theme */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-full border transition-colors ${
                isDark ? 'border-slate-800 bg-slate-900 text-slate-300 hover:text-white' : 'border-slate-200 bg-slate-100 text-slate-700'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
            </button>

            {/* Profile Pill */}
            <button
              onClick={() => onSelectTab('settings')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                isDark ? 'border-slate-800 bg-slate-900 text-slate-200 hover:border-slate-700' : 'border-slate-200 bg-slate-100 text-slate-800'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                {user.name ? user.name.charAt(0) : 'S'}
              </div>
              <span className="hidden sm:inline font-mono text-emerald-400 font-bold">{user.currency}</span>
            </button>

            {/* Sign Out Button */}
            <button
              onClick={onLogout}
              className="p-2 rounded-full border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE-FIRST BOTTOM NAVIGATION BAR (Visible on mobile screens) */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-xl transition-colors pb-safe ${
        isDark ? 'border-slate-800 bg-slate-950/95 text-slate-400' : 'border-slate-200 bg-white/95 text-slate-600 shadow-lg'
      }`}>
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const isSave = item.id === 'save';

            if (isSave) {
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab('save')}
                  className="flex flex-col items-center -mt-5"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 border-4 border-slate-950 active:scale-95 transition-transform">
                    <Plus className="w-6 h-6 stroke-[3]" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 mt-0.5">Save</span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
                  isActive ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
