import React, { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Sparkles, Building2, Smartphone, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, Liability, SavedTransaction } from '../types';
import { THREE_BATCH_RECONCILIATION_SAMPLES } from '../utils/sampleMessages';

interface ReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  daysInactive: number;
  onReconciliationComplete: (reconciledTxs: SavedTransaction[], newCredits: number, updatedLiabilities: Liability[]) => void;
}

export const ReconciliationModal: React.FC<ReconciliationModalProps> = ({
  isOpen,
  onClose,
  user,
  daysInactive,
  onReconciliationComplete,
}) => {
  const isBank = user.platform === 'bank';
  const platformName = isBank ? (user.bankName || 'Absa Bank') : 'Safaricom M-PESA';

  const [msg1, setMsg1] = useState('');
  const [msg2, setMsg2] = useState('');
  const [msg3, setMsg3] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successReport, setSuccessReport] = useState<{
    count: number;
    totalAmount: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleLoadSamples = () => {
    setMsg1(THREE_BATCH_RECONCILIATION_SAMPLES[0]);
    setMsg2(THREE_BATCH_RECONCILIATION_SAMPLES[1]);
    setMsg3(THREE_BATCH_RECONCILIATION_SAMPLES[2]);
    setErrorMessage('');
  };

  const handleSubmitReconciliation = async (e: React.FormEvent) => {
    e.preventDefault();
    const messages = [msg1.trim(), msg2.trim(), msg3.trim()].filter(Boolean);

    if (messages.length === 0) {
      setErrorMessage('Please enter at least 1-3 confirmation messages.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/reconcile-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessReport({
          count: data.reconciledCount,
          totalAmount: data.totalReconciledAmount,
        });
        onReconciliationComplete(
          data.reconciledTransactions,
          data.updatedCredits,
          data.liabilities
        );

        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.55 },
          });
        } catch {}
      } else {
        setErrorMessage(data.error || 'Reconciliation failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error processing reconciliation batch.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6 md:p-8 shadow-2xl text-neutral-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Automatic Transaction Reconciliation (3-Message Sync)
              </h2>
              <p className="text-xs text-neutral-400">
                Inactivity rule triggered: Over 2 weeks without a verified deposit.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white text-xs px-2 py-1 rounded transition-colors"
          >
            Close ✕
          </button>
        </div>

        {successReport ? (
          <div className="space-y-5 text-center py-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold">
                Ledger Successfully Reconciled
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                +{successReport.count} Messages Processed (KES {successReport.totalAmount.toLocaleString()})
              </h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                All 3 transactions have been verified, assets updated, liability auto-deductions applied, and fresh discipline credits awarded to your profile.
              </p>
            </div>

            <button
              onClick={onClose}
              className="py-2.5 px-6 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl text-xs transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitReconciliation} className="space-y-4">
            {/* Explanatory callout */}
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-neutral-300 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  {daysInactive} Days Since Last Verified Message
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                As required by Wedzo protocol, when you have not pasted messages for 2 to 3 weeks, the app requests the last <strong>3 messages from {platformName}</strong> to automatically reconcile your transaction history and protect your promised liabilities from falling behind.
              </p>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-neutral-200">
                Paste 3 Confirmation Messages:
              </span>
              <button
                type="button"
                onClick={handleLoadSamples}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Load 3 Authentic Sample Messages</span>
              </button>
            </div>

            {/* Input 1 */}
            <div>
              <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                Message 1 ({platformName} confirmation text):
              </label>
              <textarea
                rows={2}
                value={msg1}
                onChange={(e) => setMsg1(e.target.value)}
                placeholder="e.g. QKA1122AA1 Confirmed. Ksh4,500.00 received..."
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            {/* Input 2 */}
            <div>
              <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                Message 2 ({platformName} confirmation text):
              </label>
              <textarea
                rows={2}
                value={msg2}
                onChange={(e) => setMsg2(e.target.value)}
                placeholder="e.g. QKB3344BB2 Confirmed. Ksh7,000.00 received..."
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            {/* Input 3 */}
            <div>
              <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                Message 3 ({platformName} confirmation text):
              </label>
              <textarea
                rows={2}
                value={msg3}
                onChange={(e) => setMsg3(e.target.value)}
                placeholder="e.g. Absa Alert: KES 15,000 credited to A/C 0304928172..."
                required
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs">
                {errorMessage}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-xl text-xs transition-colors"
              >
                Later
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl text-xs transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Reconciling 3 Messages & Balances...</span>
                  </>
                ) : (
                  <>
                    <span>Auto-Reconcile 3 Messages</span>
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
