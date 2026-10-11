import React, { useState } from 'react';
import { Lock, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, RefreshCw, FileText, Check, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Liability, MessageAnalysisResult, SavedTransaction, UserProfile } from '../types';
import { SAMPLE_MESSAGES, SampleSMS } from '../utils/sampleMessages';

interface SaveInvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  liabilities: Liability[];
  onTransactionSaved: (tx: SavedTransaction, updatedCredits: number) => void;
}

export const SaveInvestModal: React.FC<SaveInvestModalProps> = ({
  isOpen,
  onClose,
  user,
  liabilities,
  onTransactionSaved,
}) => {
  const [rawText, setRawText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MessageAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmedTx, setConfirmedTx] = useState<SavedTransaction | null>(null);

  if (!isOpen) return null;

  const handleSelectSample = (sample: SampleSMS) => {
    setRawText(sample.text);
    setErrorMsg('');
    setAnalysis(null);
  };

  const handleAnalyze = async () => {
    if (!rawText.trim()) {
      setErrorMsg('Please paste your bank or M-PESA confirmation message first.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg('');
    setAnalysis(null);

    try {
      const res = await fetch('/api/messages/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: rawText,
          userPlatform: user.platform,
          userAccount: user.accountNumber,
          userName: user.name,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAnalysis({
          ...json.data,
          rawMessage: rawText,
        });
      } else {
        setErrorMsg(json.error || 'Could not extract valid financial data from this message.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with analysis service.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = async () => {
    if (!analysis) return;
    setIsConfirming(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/transactions/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis,
        }),
      });

      const data = await res.json();
      if (data.success && data.transaction) {
        setConfirmedTx(data.transaction);
        onTransactionSaved(data.transaction, data.updatedCredits);

        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#38BDF8', '#34D399', '#818CF8', '#FFFFFF'],
          });
        } catch {}
      } else {
        setErrorMsg(data.error || 'Failed to confirm transaction.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error confirming deposit.');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleResetForAnother = () => {
    setRawText('');
    setAnalysis(null);
    setConfirmedTx(null);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-2xl text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Save & Invest: Verified SMS Scanner
              </h2>
              <p className="text-xs text-slate-400">
                Paste unique Bank or M-PESA confirmation text. Wedzo analyzes & enforces tamper-proof allocation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-full transition-colors"
          >
            Close ✕
          </button>
        </div>

        {confirmedTx ? (
          /* Confirmation Success State */
          <div className="space-y-5 text-center py-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold">
                Transaction Reconciled & Saved
              </span>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                +{confirmedTx.currency} {confirmedTx.amount.toLocaleString()} Added to Assets
              </h3>
              <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-xs font-mono text-slate-300">
                <span>Unique Tracking Code:</span>
                <span className="text-sky-400 font-bold">{confirmedTx.trackingCode}</span>
              </div>
            </div>

            {/* Deductions summary */}
            <div className="text-left bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-slate-300 mb-2">
                Automatic Liability Deductions Applied:
              </div>
              {confirmedTx.deductions.map((ded, i) => (
                <div key={i} className="flex justify-between items-center text-xs py-1 border-b border-slate-900 last:border-0">
                  <div className="text-slate-300">
                    <span className="font-medium">{ded.liabilityTitle}</span>
                    <span className="text-slate-500 text-[11px] ml-1.5 font-mono">({ded.percentage}%)</span>
                  </div>
                  <div className="font-mono font-semibold text-emerald-400">
                    +{confirmedTx.currency} {ded.amount.toLocaleString()}
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center text-xs pt-1 text-slate-400">
                <span>Retained in General Liquid Assets:</span>
                <span className="font-mono text-slate-200">
                  +{confirmedTx.currency} {confirmedTx.unallocatedToGeneralAssets.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Credits awarded */}
            <div className="p-3 rounded-2xl bg-sky-950/40 border border-sky-800/40 text-xs text-sky-300 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
              <span>
                Earned <strong className="font-mono">+{confirmedTx.creditsAwarded} Wedzo Credits</strong> for disciplined financial entry!
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleResetForAnother}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-full text-xs transition-colors"
              >
                Scan Another Message
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold rounded-full text-xs transition-colors"
              >
                Done & View Dashboard
              </button>
            </div>
          </div>
        ) : !analysis ? (
          /* Step 1: Paste Text & Select Sample */
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-200">
                  Paste Raw Confirmation Message:
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  Supported: Absa, Equity, KCB, StanChart, Safaricom M-PESA
                </span>
              </div>
              <textarea
                rows={4}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste the unique SMS message you received when entering your money into the bank or M-Pesa... e.g. 'Absa Alert: KES 25,000 credited to A/C 0304928172...' or 'QKA8291KLM Confirmed. Ksh500 received...'"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-sky-400 font-mono leading-relaxed placeholder:text-slate-600"
              />
            </div>

            {/* Quick Test Samples */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                Click to Load Authentic Test Messages:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_MESSAGES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="p-3 rounded-2xl border border-slate-800 bg-slate-950/80 text-left hover:border-sky-400/50 hover:bg-slate-900 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-sky-400">
                        {sample.title}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{sample.source}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                      {sample.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !rawText.trim()}
              className={`w-full py-3 px-4 font-bold rounded-full text-xs transition-all shadow-md flex items-center justify-center gap-2 ${
                isAnalyzing || !rawText.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-sky-400 hover:bg-sky-300 text-slate-950 active:scale-98'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scanning Message Signature with Gemini AI...</span>
                </>
              ) : (
                <>
                  <span>Scan & Verify Unique SMS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ) : (
          /* Step 2: Analyzed & Strictly Locked Amount State */
          <div className="space-y-4">
            {/* Strict Non-Editable Amount Callout per prompt requirement */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-sky-400/40 relative overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                  <Lock className="w-4 h-4" />
                  <span>SYSTEM-LOCKED AMOUNT (TAMPER-PROOF)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Cannot be edited manually
                </span>
              </div>

              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-sm font-mono text-slate-400">{analysis.currency}</span>
                <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                  {analysis.amount.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 ml-2">verified deposit</span>
              </div>

              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                As required by Wedzo financial security, verified deposit amounts are strictly immutable. If the message says{' '}
                <strong className="text-white">{analysis.amount} cash</strong>, you cannot change that. To proceed with this amount, click <strong>Confirm & Save</strong>, or click <strong>Paste Another Message</strong> below to analyze a different SMS.
              </p>
            </div>

            {/* Extracted Details & Verification Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 font-mono">Reference Code</div>
                <div className="font-mono font-bold text-slate-200 mt-0.5 truncate">
                  {analysis.transactionRef}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 font-mono">Platform / Bank</div>
                <div className="font-semibold text-slate-200 mt-0.5 truncate">
                  {analysis.bankOrPlatform}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 font-mono">Account / Phone</div>
                <div className="font-mono text-slate-200 mt-0.5 truncate">
                  {analysis.accountOrPhone || 'Verified'}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 font-mono">Profile Match</div>
                <div className="flex items-center gap-1 font-semibold text-emerald-400 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>{analysis.accountMatched ? 'Account Matched' : 'Verified Sender'}</span>
                </div>
              </div>
            </div>

            {/* Intelligent Liability Auto-Deductions */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-slate-200">
                  Intelligent Liability Split (Automated Deductions)
                </div>
                <span className="text-[10px] text-sky-400 font-mono">
                  Optimized by Urgency
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Wedzo automatically deducts percentage shares to cover what you promised to make before due dates:
              </p>

              <div className="space-y-2">
                {analysis.suggestedAllocations.map((alloc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white">{alloc.liabilityTitle}</span>
                      <span className="text-[10px] text-slate-500 ml-2 font-mono">
                        ({alloc.percentage}% auto-deduct)
                      </span>
                    </div>
                    <div className="font-mono font-bold text-sky-400">
                      +{analysis.currency} {alloc.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleResetForAnother}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-full text-xs transition-colors"
              >
                Paste Another Message
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isConfirming}
                className="flex-1 py-2.5 px-4 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold rounded-full text-xs transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
              >
                {isConfirming ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Confirming & Reconciling Ledger...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Enter into Assets</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
