import React, { useState } from 'react';
import { CreditCard, Calendar, AlertCircle, Plus, CheckCircle, Clock, Shield, Sparkles } from 'lucide-react';
import { Liability, LiabilityCategory } from '../types';

interface LiabilitiesViewProps {
  liabilities: Liability[];
  onAddLiability: (newLiability: Omit<Liability, 'id' | 'currentPaid'>) => void;
  onOpenSaveModal: () => void;
}

export const LiabilitiesView: React.FC<LiabilitiesViewProps> = ({
  liabilities,
  onAddLiability,
  onOpenSaveModal,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<LiabilityCategory>('holiday');
  const [targetAmount, setTargetAmount] = useState('');
  const [dueDate, setDueDate] = useState('2026-12-31');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [bankOrCard, setBankOrCard] = useState('Absa Bank Debit Card');
  const [description, setDescription] = useState('');

  const totalPromised = liabilities.reduce((sum, l) => sum + l.targetAmount, 0);
  const totalPaid = liabilities.reduce((sum, l) => sum + l.currentPaid, 0);
  const totalRemaining = Math.max(0, totalPromised - totalPaid);
  const overallProgress = totalPromised > 0 ? Math.round((totalPaid / totalPromised) * 100) : 0;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount) return;

    onAddLiability({
      title: title.trim(),
      category,
      targetAmount: Number(targetAmount),
      dueDate,
      priority,
      bankOrCard,
      description,
    });

    setTitle('');
    setTargetAmount('');
    setDescription('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Liabilities Overview Hero (M3 Surface Card) */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400 font-semibold mb-2">
              <span>TOTAL PROMISES & REMAINING OBLIGATIONS</span>
              <span aria-hidden="true">·</span>
              <span>AUTO-DEDUCTION ENGINE</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-xl font-mono text-slate-400">KES</span>
              <span className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight tabular-nums">
                {totalRemaining.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">remains to complete</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
              <span>Total Promised: KES {totalPromised.toLocaleString()}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-semibold">
                KES {totalPaid.toLocaleString()} ({overallProgress}%) Paid
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-full text-xs transition-colors border border-slate-700/60"
            >
              <Plus className="w-4 h-4" />
              <span>Add Promise</span>
            </button>
            <button
              onClick={onOpenSaveModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold rounded-full text-xs transition-all shadow-md shadow-sky-500/20 active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Save & Deduct</span>
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono">
            <span>Aggregated Promise Settlement Progress</span>
            <span className="text-sky-400 font-bold">{overallProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, overallProgress)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Featured AI Debit Card & Concerns Asset Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center rounded-3xl bg-slate-900/90 border border-slate-800/80 p-6">
        <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
          <img
            src="/src/assets/images/bank_security_card_1790511614973.jpg"
            alt="AI Debit Card titanium security visual"
            className="w-full h-44 object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 font-bold">
            <CreditCard className="w-4 h-4" />
            <span>AI DEBIT CARD & CLEARING CONCERN</span>
          </div>
          <h3 className="text-base font-bold text-white">
            Smart Priority Allocation for Card Liabilities
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Wedzo prioritizes debit card balances and time-sensitive goals (such as December Holiday reservations). Each incoming verified message has 10% to 20% routed to clear your debit card reserve first to maintain flawless financial standing.
          </p>
        </div>
      </div>

      {/* List of Active Liabilities */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono uppercase tracking-wider px-1">
          <span>Active Liabilities & Promise Buckets ({liabilities.length})</span>
          <span>Auto-Deduction Priority</span>
        </div>

        {liabilities.map((liab) => {
          const remaining = Math.max(0, liab.targetAmount - liab.currentPaid);
          const percent = Math.min(100, Math.round((liab.currentPaid / liab.targetAmount) * 100));

          return (
            <div
              key={liab.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-sm font-bold text-white tracking-tight">{liab.title}</h4>
                    <span
                      className={`text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full ${
                        liab.priority === 'high'
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-800/50'
                          : liab.priority === 'medium'
                          ? 'bg-sky-950/60 text-sky-300 border border-sky-800/50'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {liab.priority} Priority
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="font-mono text-slate-300">{liab.bankOrCard}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 font-mono text-slate-400">
                      <Clock className="w-3 h-3" />
                      Due {liab.dueDate}
                    </span>
                    {liab.celebrationReason && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-sky-300">{liab.celebrationReason}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-extrabold text-white font-mono tabular-nums">
                    KES {remaining.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    of KES {liab.targetAmount.toLocaleString()} target
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Paid: KES {liab.currentPaid.toLocaleString()}</span>
                  <span className="text-sky-400 font-bold">{percent}% Completed</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percent >= 100
                        ? 'bg-emerald-400'
                        : liab.priority === 'high'
                        ? 'bg-sky-400'
                        : 'bg-indigo-400'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Liability Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create New Saving Promise / Liability</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
              >
                Close ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Promise Title / Goal Name
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. December Holiday Beach Trip, Car Purchase Deposit"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as LiabilityCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
                  >
                    <option value="holiday">December Holiday</option>
                    <option value="debit_card">AI Debit Card Concern</option>
                    <option value="car">Buy a Car</option>
                    <option value="travel">Travel Abroad</option>
                    <option value="celebration">Milestone / Celebration</option>
                    <option value="emergency">Emergency Fund</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Target Amount (KES)
                  </label>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="50000"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Bank / Card Requested
                  </label>
                  <input
                    type="text"
                    value={bankOrCard}
                    onChange={(e) => setBankOrCard(e.target.value)}
                    placeholder="Absa Platinum Visa"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
                  >
                    <option value="high">High (20% auto-deduct)</option>
                    <option value="medium">Medium (10% auto-deduct)</option>
                    <option value="low">Low (5% auto-deduct)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400 font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-full text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold rounded-full text-xs transition-all shadow-md active:scale-98"
                >
                  Save Promise Bucket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
