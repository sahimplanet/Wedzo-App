import React from 'react';
import { TrendingUp, ShieldCheck, ArrowUpRight, DollarSign, Wallet, PiggyBank, Plus } from 'lucide-react';
import { SavedTransaction, Liability } from '../types';

interface AssetsOverviewProps {
  totalAssets: number;
  transactions: SavedTransaction[];
  liabilities: Liability[];
  onOpenSaveModal: () => void;
}

export const AssetsOverview: React.FC<AssetsOverviewProps> = ({
  totalAssets,
  transactions,
  liabilities,
  onOpenSaveModal,
}) => {
  const totalAllocatedToLiabilities = liabilities.reduce((sum, l) => sum + l.currentPaid, 0);
  const liquidReserve = Math.max(0, totalAssets - totalAllocatedToLiabilities);

  return (
    <div className="space-y-6">
      {/* Top Banner with M3 Elevation and Glass Studio Editorial Artwork */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-900 shadow-2xl">
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src="/src/assets/images/wedzo_hero_banner_1790511589322.jpg"
            alt="Wedzo digital wealth assets architecture"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent" />
        </div>

        <div className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-sky-400 font-semibold mb-2">
                <span>TOTAL ACCUMULATED SAVINGS & ASSETS</span>
                <span aria-hidden="true">·</span>
                <span>VERIFIED LEDGER</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-mono text-slate-400">KES</span>
                <span className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight tabular-nums">
                  {totalAssets.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-3">
                <span className="text-emerald-400 font-semibold flex items-center gap-1 font-mono">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +18.4% monthly growth
                </span>
                <span aria-hidden="true">·</span>
                <span>{transactions.length} verified SMS deposits</span>
                <span aria-hidden="true">·</span>
                <span>Tamper-proof storage</span>
              </div>
            </div>

            <button
              onClick={onOpenSaveModal}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold rounded-full text-xs transition-all shadow-md shadow-sky-500/20 active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Deposit & Scan Message</span>
            </button>
          </div>
        </div>
      </div>

      {/* Asset Partition Grid (M3 Tonal Surface Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Liquid */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Unallocated Liquid Reserve</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            KES {liquidReserve.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Freely accessible capital not committed to specific liability deadlines.
          </p>
        </div>

        {/* Committed to Liabilities */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Paid into Promise Buckets</span>
            <PiggyBank className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-sky-400 tabular-nums">
            KES {totalAllocatedToLiabilities.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Automatically deducted and reserved for December Holiday, Debit Card & Car funds.
          </p>
        </div>

        {/* Protection Health */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">USSD & Impulse Shield</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">
            Active · 100%
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Impulse quick-dial USSD codes locked; bank apps decoupled to guard asset growth.
          </p>
        </div>
      </div>

      {/* Recent Inflow Transactions */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Recent Verified Inflow History
            </h3>
            <p className="text-xs text-slate-400">
              Transactions parsed directly from M-PESA & Bank messages with tracking keys.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {transactions.length} Records
          </span>
        </div>

        <div className="divide-y divide-slate-800/70">
          {transactions.slice(0, 5).map((tx) => (
            <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-sky-400">
                    {tx.trackingCode}
                  </span>
                  <span className="text-slate-600 text-xs">·</span>
                  <span className="text-xs font-semibold text-white">
                    {tx.bankOrPlatform}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
                  <span>Ref: {tx.transactionRef}</span>
                  <span aria-hidden="true">·</span>
                  <span>{new Date(tx.verifiedAt).toLocaleDateString()}</span>
                  <span aria-hidden="true">·</span>
                  <span>{tx.accountOrPhone}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-mono font-bold text-emerald-400">
                  +{tx.currency} {tx.amount.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">
                  {tx.deductions.length} liabilities funded
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
