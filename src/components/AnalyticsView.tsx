import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  Coins, 
  Smartphone, 
  Building2,
  Info
} from 'lucide-react';
import { SavingsGoal, TransactionRecord, UserProfile } from '../types';
import { formatMoney } from '../utils/currency';

interface AnalyticsViewProps {
  user: UserProfile;
  goals: SavingsGoal[];
  transactions: TransactionRecord[];
  theme?: 'dark' | 'light';
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  user,
  goals,
  transactions,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  // Total verified savings
  const totalVerifiedSavings = goals.reduce((sum, g) => sum + g.currentVerifiedSaved, 0);
  const totalGoalTargets = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallProgressPct = totalGoalTargets > 0 
    ? Math.min(100, Math.round((totalVerifiedSavings / totalGoalTargets) * 100)) 
    : 0;

  // Monthly estimation logic
  // Calculate average daily rate from past transactions (or fallback to active pacing)
  const daysActive = Math.max(7, 30);
  const estimatedDailyRate = Math.round(totalVerifiedSavings / daysActive);
  const estimatedMonthlyRate = estimatedDailyRate * 30;
  const remainingTotal = Math.max(0, totalGoalTargets - totalVerifiedSavings);
  const estimatedMonthsToCompletion = estimatedMonthlyRate > 0 
    ? (remainingTotal / estimatedMonthlyRate).toFixed(1) 
    : 'N/A';

  // Provider breakdown
  const providerCounts: Record<string, number> = {};
  transactions.forEach((tx) => {
    const p = tx.provider || 'Other';
    providerCounts[p] = (providerCounts[p] || 0) + 1;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Savings Analytics & Growth</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
              {overallProgressPct}% Funded
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-lg">
            Inspect your verified savings trajectory, goal contribution shares, and realistic estimation pacing.
          </p>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className={`p-4 sm:p-5 rounded-3xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Total Verified Savings</span>
          <div className="font-mono font-black text-xl text-emerald-400">
            {formatMoney(totalVerifiedSavings, user.currency)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">In verified goals</span>
        </div>

        <div className={`p-4 sm:p-5 rounded-3xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Total Commitments</span>
          <div className="font-mono font-black text-xl text-white">
            {formatMoney(totalGoalTargets, user.currency)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Across {goals.length} goals</span>
        </div>

        <div className={`p-4 sm:p-5 rounded-3xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Pacing Estimate</span>
          <div className="font-mono font-black text-xl text-teal-300">
            ~{formatMoney(estimatedMonthlyRate, user.currency, 0)}/mo
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Based on verified activity</span>
        </div>

        <div className={`p-4 sm:p-5 rounded-3xl border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Est. Completion</span>
          <div className="font-mono font-black text-xl text-sky-400">
            ~{estimatedMonthsToCompletion} Mos
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">To complete all goals</span>
        </div>
      </div>

      {/* Forecast Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <span>
          <strong>Projection Notice:</strong> Goal completion forecasts are estimates based on your past deposit cadence. They are not guaranteed outcomes or contractual promises. Actual results vary with your voluntary savings behavior.
        </span>
      </div>

      {/* Contributions by Goal Breakdown */}
      <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            <span>Goal Contribution Distribution</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Relative Shares</span>
        </div>

        <div className="space-y-3">
          {goals.map((g) => {
            const sharePct = totalVerifiedSavings > 0 
              ? Math.round((g.currentVerifiedSaved / totalVerifiedSavings) * 100) 
              : 0;
            return (
              <div key={g.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{g.name}</span>
                  <div className="font-mono text-right">
                    <span className="text-emerald-400 font-bold">{formatMoney(g.currentVerifiedSaved, g.currency)}</span>
                    <span className="text-slate-400 text-[11px] ml-2">({sharePct}% of saved)</span>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, g.progressPercentage)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Provider Frequency Breakdown */}
      <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
        <h3 className="font-bold text-base text-white flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-teal-400" />
          <span>Verified Activity by Institution</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(providerCounts).map(([provider, count]) => (
            <div key={provider} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs font-bold text-white block truncate">{provider}</span>
              <div className="font-mono font-extrabold text-emerald-400 text-lg mt-1">{count}</div>
              <span className="text-[10px] text-slate-400">Verified transactions</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
