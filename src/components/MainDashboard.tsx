import React from 'react';
import { 
  Plus, 
  Target, 
  TrendingUp, 
  PiggyBank, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Smartphone, 
  Building2, 
  Sparkles, 
  ChevronRight, 
  Layers,
  ShieldCheck,
  Coins
} from 'lucide-react';
import { 
  UserProfile, 
  SavingsGoal, 
  TransactionRecord 
} from '../types';
import { formatMoney } from '../utils/currency';

interface MainDashboardProps {
  user: UserProfile;
  goals: SavingsGoal[];
  transactions: TransactionRecord[];
  onOpenSaveMoney: () => void;
  onOpenGoals: () => void;
  onOpenTransactions: () => void;
  theme?: 'dark' | 'light';
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  user,
  goals,
  transactions,
  onOpenSaveMoney,
  onOpenGoals,
  onOpenTransactions,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  // Calculate totals
  const totalVerifiedSavings = goals.reduce((sum, g) => sum + g.currentVerifiedSaved, 0);
  const totalTargetAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const amountRemaining = Math.max(0, totalTargetAmount - totalVerifiedSavings);
  const overallProgressPercentage = totalTargetAmount > 0 
    ? Math.min(100, Math.round((totalVerifiedSavings / totalTargetAmount) * 100)) 
    : 0;

  // Active goals list (max 4 for quick dashboard overview)
  const activeGoals = goals.filter((g) => g.status === 'active').slice(0, 4);

  // Recent 3 verified/pending transactions
  const recentTransactions = transactions.slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Personalized Greeting & Hero Card (Material Design 3 Surface) */}
      <section className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden ${
        isDark ? 'bg-slate-900/95 border-slate-800/90' : 'bg-white border-slate-200 shadow-slate-200/60'
      }`}>
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold mb-1.5">
              <span>SAVEFLOW AI</span>
              <span>•</span>
              <span className="capitalize">{user.platform === 'bank' ? user.bankName || 'Kenyan Bank' : 'M-Pesa Verified Ledger'}</span>
              <span>•</span>
              <span>{user.currency}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              Hello, {user.name} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
              Every verified M-Pesa or bank deposit auto-allocates towards your promised goals, protecting your wealth without manual math.
            </p>
          </div>

          {/* TWO PROMINENT PRIMARY ACTIONS: Save Money and My Goals */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={onOpenSaveMoney}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/25 active:scale-98"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Save Money</span>
            </button>

            <button
              onClick={onOpenGoals}
              className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs font-bold border transition-all ${
                isDark 
                  ? 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700 hover:border-slate-600' 
                  : 'border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Target className="w-4 h-4 text-emerald-400" />
              <span>My Goals ({goals.length})</span>
            </button>
          </div>
        </div>

        {/* FINANCIAL SUMMARY METRICS GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-0.5">
              Total Verified Savings
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tabular-nums">
              {formatMoney(totalVerifiedSavings, user.currency)}
            </div>
            <span className="text-[11px] text-slate-400">Strictly verified deposits</span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-0.5">
              Total Target Amount
            </span>
            <div className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums">
              {formatMoney(totalTargetAmount, user.currency)}
            </div>
            <span className="text-[11px] text-slate-400">Combined goal targets</span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-0.5">
              Amount Remaining
            </span>
            <div className="text-xl sm:text-2xl font-black text-teal-300 font-mono tabular-nums">
              {formatMoney(amountRemaining, user.currency)}
            </div>
            <span className="text-[11px] text-slate-400">To reach all targets</span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-0.5">
              Overall Savings Progress
            </span>
            <div className="text-xl sm:text-2xl font-black text-sky-400 font-mono tabular-nums flex items-baseline gap-1.5">
              <span>{overallProgressPercentage}%</span>
              <span className="text-xs text-slate-400 font-sans font-normal">achieved</span>
            </div>
            {/* Mini Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1.5">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                style={{ width: `${overallProgressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* TWO COLUMNS: Active Goals Summary (Left) & Recent Verified Transactions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Goals Summary Card (2 cols) */}
        <div className={`lg:col-span-2 p-6 rounded-3xl border flex flex-col justify-between ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span>Active Savings Goals</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verified deposits automatically split across these goals.
                </p>
              </div>

              <button
                onClick={onOpenGoals}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                <span>View All ({goals.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Goals list */}
            {activeGoals.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800">
                <PiggyBank className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 mb-3">No active goals configured yet.</p>
                <button
                  onClick={onOpenGoals}
                  className="px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-500 text-slate-950"
                >
                  Create Your First Goal
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">{goal.name}</span>
                        <span className="font-mono text-xs text-emerald-400 font-bold">
                          {formatMoney(goal.currentVerifiedSaved, goal.currency)}
                          <span className="text-slate-500 font-normal"> / {formatMoney(goal.targetAmount, goal.currency)}</span>
                        </span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, goal.progressPercentage)}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono text-[11px] text-slate-400">
                      <span>{goal.progressPercentage}% funded</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Allocation Mode: <strong>{user.autoAllocate ? 'Automatic' : 'Manual'}</strong></span>
            <span>Policy: <strong>100% Capping Enforced</strong></span>
          </div>
        </div>

        {/* Recent Transactions Card (1 col) */}
        <div className={`p-6 rounded-3xl border flex flex-col justify-between ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Recent Ledger</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Verified deposit confirmations</p>
              </div>

              <button
                onClick={onOpenTransactions}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                <span>Full Ledger</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800">
                <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 mb-3">No transactions recorded yet.</p>
                <button
                  onClick={onOpenSaveMoney}
                  className="px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-500 text-slate-950"
                >
                  Paste First SMS
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-white">{tx.provider}</div>
                      <div className="font-mono text-[10px] text-slate-500">
                        {tx.transactionRef.slice(0, 4)}••••{tx.transactionRef.slice(-2)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-extrabold text-xs text-emerald-400">
                        +{formatMoney(tx.amount, tx.currency)}
                      </div>
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400">
                        {tx.verificationStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800">
            <button
              onClick={onOpenSaveMoney}
              className="w-full py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Verify New SMS Deposit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
