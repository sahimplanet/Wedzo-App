import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  ShieldAlert, 
  HelpCircle, 
  X, 
  Eye, 
  Layers, 
  FileText, 
  Calendar, 
  Building2, 
  Smartphone,
  Info
} from 'lucide-react';
import { TransactionRecord, VerificationStatus } from '../types';
import { formatMoney, APP_NAME } from '../utils/currency';

interface TransactionHistoryViewProps {
  transactions: TransactionRecord[];
  theme?: 'dark' | 'light';
}

export const TransactionHistoryView: React.FC<TransactionHistoryViewProps> = ({
  transactions,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);

  // Mask reference code for privacy: e.g. "QKA8291KLM" -> "QK****LM"
  const maskRef = (ref: string) => {
    if (!ref || ref.length <= 4) return ref;
    const start = ref.slice(0, 2);
    const end = ref.slice(-2);
    return `${start}••••${end}`;
  };

  // Filter transactions
  const filtered = transactions.filter((tx) => {
    if (statusFilter !== 'all' && tx.verificationStatus !== statusFilter) return false;
    if (providerFilter !== 'all' && !tx.provider.toLowerCase().includes(providerFilter.toLowerCase())) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = tx.transactionRef.toLowerCase().includes(q);
      const matchProvider = tx.provider.toLowerCase().includes(q);
      const matchSender = (tx.senderRecipient || '').toLowerCase().includes(q);
      if (!matchRef && !matchProvider && !matchSender) return false;
    }
    return true;
  });

  const exportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ['Tracking Code', 'Reference', 'Provider', 'Amount', 'Currency', 'Status', 'Date'];
    const rows = filtered.map((t) => [
      t.trackingCode,
      t.transactionRef,
      t.provider,
      t.amount,
      t.currency,
      t.verificationStatus,
      t.transactionDate,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${APP_NAME}_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Transaction History</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
              {transactions.length} Total
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-lg">
            Complete audit trail of verified SMS messages, duplicate check records, and goal auto-allocations.
          </p>
        </div>

        <button
          type="button"
          onClick={exportCSV}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
            isDark ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200' : 'border-slate-300 bg-slate-100 text-slate-800'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by reference, provider, or sender..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs border outline-none ${
              isDark ? 'bg-slate-900 border-slate-800 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-900'
            }`}
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`px-3 py-2.5 rounded-2xl text-xs border outline-none font-semibold ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-300'
          }`}
        >
          <option value="all">All Statuses</option>
          <option value="verified">Verified Only</option>
          <option value="pending">Pending</option>
          <option value="duplicate">Duplicates</option>
          <option value="needs_review">Needs Review</option>
        </select>

        {/* Provider Filter */}
        <select
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value)}
          className={`px-3 py-2.5 rounded-2xl text-xs border outline-none font-semibold ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-300'
          }`}
        >
          <option value="all">All Providers</option>
          <option value="m-pesa">M-PESA / M-Shwari</option>
          <option value="absa">Absa Bank</option>
          <option value="equity">Equity Bank</option>
          <option value="kcb">KCB Bank</option>
        </select>
      </div>

      {/* Transaction Records List */}
      {filtered.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
          <History className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-base text-white mb-1">No transactions match your search</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try resetting your filters or paste an SMS message in the Save Money section.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((tx) => (
            <div
              key={tx.id}
              onClick={() => setSelectedTx(tx)}
              className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDark ? 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/50' : 'bg-white border-slate-200 hover:border-emerald-500 shadow-sm'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  {tx.provider.toLowerCase().includes('bank') ? (
                    <Building2 className="w-5 h-5" />
                  ) : (
                    <Smartphone className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-extrabold text-sm text-white">{tx.provider}</span>
                    <span className="font-mono text-xs text-slate-400">
                      {maskRef(tx.transactionRef)}
                    </span>
                    {tx.isDoubleCountPrevented && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300">
                        CROSS-MATCHED
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-3">
                    <span>{new Date(tx.transactionDate).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="truncate max-w-xs">{tx.senderRecipient || 'Deposit'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                <div className="text-right">
                  <span className="font-mono font-black text-sm text-emerald-400 block">
                    +{formatMoney(tx.amount, tx.currency)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans">
                    {tx.allocatedGoals.length} Goals Allocated
                  </span>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono ${
                  tx.verificationStatus === 'verified'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : tx.verificationStatus === 'duplicate'
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {tx.verificationStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TRANSACTION DETAILS MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className={`max-w-lg w-full p-6 sm:p-8 rounded-3xl border shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-black text-white">Transaction Audit Record</h3>
                <span className="font-mono text-xs text-slate-400">{selectedTx.trackingCode}</span>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Amounts & Status */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-sans">Verified Amount</span>
                  <div className="text-lg font-black text-emerald-400">
                    {formatMoney(selectedTx.amount, selectedTx.currency)}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-sans">Audit Status</span>
                  <div className="font-bold text-white capitalize">{selectedTx.verificationStatus}</div>
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Full Reference Code:</span>
                  <span className="font-mono text-white font-bold">{selectedTx.transactionRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Financial Provider:</span>
                  <span className="text-white font-bold">{selectedTx.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Timestamp:</span>
                  <span className="font-mono text-slate-300">{selectedTx.transactionDate}</span>
                </div>
                {selectedTx.isDoubleCountPrevented && (
                  <div className="flex justify-between text-teal-400">
                    <span>Double-Count Protection:</span>
                    <span className="font-bold">Active & Enforced</span>
                  </div>
                )}
              </div>

              {/* Allocations breakdown */}
              <div>
                <span className="font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Goals Distributed</span>
                </span>
                <div className="space-y-1.5">
                  {selectedTx.allocatedGoals.map((g) => (
                    <div
                      key={g.goalId}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between font-mono"
                    >
                      <span className="font-sans text-slate-200">{g.goalName}</span>
                      <span className="font-bold text-emerald-400">+{formatMoney(g.amount, 'KES')}</span>
                    </div>
                  ))}
                  {selectedTx.unallocatedAmount > 0 && (
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between font-mono text-amber-300">
                      <span className="font-sans">Unallocated General Reserve</span>
                      <span className="font-bold">+{formatMoney(selectedTx.unallocatedAmount, 'KES')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Raw message preview */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400 break-words">
                <span className="text-[10px] text-slate-500 uppercase block mb-1 font-sans">Raw SMS Content</span>
                <p>{selectedTx.rawMessage}</p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
