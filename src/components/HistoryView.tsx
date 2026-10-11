import React, { useState } from 'react';
import { Search, ShieldCheck, Copy, Check, Filter, Calendar } from 'lucide-react';
import { SavedTransaction } from '../types';

interface HistoryViewProps {
  transactions: SavedTransaction[];
  onOpenSaveModal: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ transactions, onOpenSaveModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = transactions.filter((tx) => {
    const q = searchTerm.toLowerCase();
    return (
      tx.trackingCode.toLowerCase().includes(q) ||
      tx.transactionRef.toLowerCase().includes(q) ||
      tx.bankOrPlatform.toLowerCase().includes(q) ||
      tx.rawMessage.toLowerCase().includes(q)
    );
  });

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/90 border border-slate-800/80">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Verified Reconciled Transaction History
          </h3>
          <p className="text-xs text-slate-400">
            Immutable log of all incoming M-PESA and Bank alert deposits with cryptographic tracking codes.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by code, ref, bank..."
            className="w-full bg-slate-950 border border-slate-800 rounded-full pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-sky-400 font-mono"
          />
        </div>
      </div>

      <div className="divide-y divide-slate-800/70 rounded-3xl bg-slate-900/90 border border-slate-800/80 overflow-hidden shadow-xl">
        {filtered.length === 0 ? (
          <div className="text-center py-12 px-4 text-slate-500 text-xs">
            No verified transactions found matching "{searchTerm}".
          </div>
        ) : (
          filtered.map((tx) => (
            <div key={tx.id} className="p-5 hover:bg-slate-800/40 transition-colors space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-xs font-mono font-bold text-sky-400">
                    <span>{tx.trackingCode}</span>
                    <button
                      onClick={() => handleCopy(tx.trackingCode)}
                      className="text-slate-400 hover:text-white"
                      title="Copy Tracking Key"
                    >
                      {copiedId === tx.trackingCode ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <span className="text-xs font-semibold text-white">{tx.bankOrPlatform}</span>
                  <span className="text-slate-600 text-xs">·</span>
                  <span className="text-xs font-mono text-slate-400">Ref: {tx.transactionRef}</span>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold font-mono text-emerald-400">
                    +{tx.currency} {tx.amount.toLocaleString()}
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {new Date(tx.verifiedAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Deductions applied */}
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/70 space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Deductions Applied ({tx.deductions.length} buckets):
                </div>
                <div className="flex flex-wrap gap-2">
                  {tx.deductions.map((ded, i) => (
                    <div
                      key={i}
                      className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs flex items-center gap-1.5 font-mono"
                    >
                      <span className="text-slate-300">{ded.liabilityTitle}:</span>
                      <span className="text-sky-400 font-bold">
                        +{tx.currency} {ded.amount.toLocaleString()} ({ded.percentage}%)
                      </span>
                    </div>
                  ))}
                  <div className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs flex items-center gap-1.5 font-mono text-slate-400">
                    <span>Liquid Reserve:</span>
                    <span className="text-slate-200">
                      +{tx.currency} {tx.unallocatedToGeneralAssets.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Raw message snippet */}
              <div className="text-[11px] text-slate-400 font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-900 truncate">
                <span className="text-slate-300 font-bold">Signature: </span>
                {tx.rawMessage}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
