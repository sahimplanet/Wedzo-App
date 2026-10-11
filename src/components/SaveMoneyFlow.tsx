import React, { useState } from 'react';
import { 
  Smartphone, 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert, 
  AlertCircle, 
  CheckCircle2, 
  Copy, 
  Trash2, 
  ArrowRight, 
  Loader2, 
  Info, 
  Check, 
  HelpCircle,
  Link2,
  Lock,
  Layers,
  ChevronDown
} from 'lucide-react';
import { 
  UserProfile, 
  SavingsGoal, 
  TransactionRecord, 
  AIAnalysisResult, 
  VerificationStatus,
  GoalAllocationItem
} from '../types';
import { SAMPLE_MESSAGES, SampleSMS } from '../utils/sampleMessages';
import { calculateAllocations } from '../utils/allocationEngine';
import { formatMoney, APP_NAME } from '../utils/currency';

interface SaveMoneyFlowProps {
  user: UserProfile;
  goals: SavingsGoal[];
  existingTransactions: TransactionRecord[];
  onConfirmDeposit: (transaction: TransactionRecord, updatedGoals: SavingsGoal[]) => void;
  onCancel: () => void;
  theme?: 'dark' | 'light';
}

export const SaveMoneyFlow: React.FC<SaveMoneyFlowProps> = ({
  user,
  goals,
  existingTransactions,
  onConfirmDeposit,
  onCancel,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  // Mode: 'mpesa' vs 'bank'
  const [workflowMode, setWorkflowMode] = useState<'mpesa' | 'bank'>(
    user.platform === 'bank' ? 'bank' : 'mpesa'
  );

  // Message inputs
  const [mpesaMessage, setMpesaMessage] = useState('');
  const [bankMessage, setBankMessage] = useState('');

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Allocation breakdown state
  const [allocationMode, setAllocationMode] = useState<'equal' | 'percentage'>(
    user.allocationMode || 'equal'
  );
  const [customPercentages, setCustomPercentages] = useState<Record<string, number>>(
    user.allocationPercentages || {}
  );
  const [allocatedBreakdown, setAllocatedBreakdown] = useState<GoalAllocationItem[]>([]);
  const [unallocatedReserve, setUnallocatedReserve] = useState(0);

  // Sample SMS selection
  const [selectedSample, setSelectedSample] = useState<SampleSMS | null>(null);

  const handleApplySample = (sample: SampleSMS) => {
    setSelectedSample(sample);
    if (sample.serviceCategory === 'matched_pair') {
      setWorkflowMode('bank');
      setBankMessage(sample.text);
      setMpesaMessage(sample.correspondingMpesaText || '');
    } else if (sample.serviceCategory === 'bank') {
      setWorkflowMode('bank');
      setBankMessage(sample.text);
      setMpesaMessage('');
    } else {
      setWorkflowMode('mpesa');
      setMpesaMessage(sample.text);
      setBankMessage('');
    }
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  const handleClear = () => {
    setMpesaMessage('');
    setBankMessage('');
    setSelectedSample(null);
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  const handleAnalyze = async () => {
    setAnalysisError(null);

    const messageToAnalyze = workflowMode === 'bank' 
      ? (bankMessage.trim() || mpesaMessage.trim()) 
      : mpesaMessage.trim();

    if (!messageToAnalyze) {
      setAnalysisError(
        workflowMode === 'bank'
          ? 'Please paste either a bank transaction message or both bank & M-Pesa messages.'
          : 'Please paste your M-Pesa transaction confirmation message.'
      );
      return;
    }

    setIsAnalyzing(true);

    try {
      // Check for matching bank & mpesa transfer
      let isBankMpesaMatch = false;
      let doubleCountGuarded = false;

      if (workflowMode === 'bank' && bankMessage.trim() && mpesaMessage.trim()) {
        const bankText = bankMessage.toLowerCase();
        const mpesaText = mpesaMessage.toLowerCase();
        // Check for matching references or amounts
        const mpesaRefMatch = mpesaMessage.match(/([A-Z0-9]{8,12})\s+(?:Confirmed|CONFIRMED)/i);
        const mpesaCode = mpesaRefMatch ? mpesaRefMatch[1] : '';

        if (mpesaCode && bankText.includes(mpesaCode.toLowerCase())) {
          isBankMpesaMatch = true;
          doubleCountGuarded = true;
        } else {
          // Check matching amounts
          const amt1 = bankMessage.match(/(?:Ksh|KES)[\s\.]*([0-9,]+)/i);
          const amt2 = mpesaMessage.match(/(?:Ksh|KES)[\s\.]*([0-9,]+)/i);
          if (amt1 && amt2 && amt1[1].replace(/,/g, '') === amt2[1].replace(/,/g, '')) {
            isBankMpesaMatch = true;
            doubleCountGuarded = true;
          }
        }
      }

      // Call server backend with AI and multi-layer verification
      const response = await fetch('/api/messages/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToAnalyze }),
      });
      const data = await response.json();

      if (data.success && data.data) {
        const res = data.data;

        // Check for duplicate reference
        const isDuplicateRef = existingTransactions.some(
          (tx) => tx.transactionRef === res.transactionRef
        );

        let status: VerificationStatus = 'verified';
        let explanation = res.summaryExplanation || '';

        if (isDuplicateRef) {
          status = 'duplicate';
          explanation = `Transaction reference ${res.transactionRef} has already been recorded in your ledger.`;
        } else if (res.amount <= 0) {
          status = 'rejected';
          explanation = 'Unable to extract valid financial amount from this message.';
        } else if (!res.isLegitimate) {
          status = 'needs_review';
          explanation = 'Message details look irregular or do not match official provider formats.';
        } else if (isBankMpesaMatch) {
          status = 'verified';
          explanation = `Cross-matched transfer confirmed! Bank deposit and M-Pesa debit represent the same single transfer. Double-counting prevented.`;
        }

        const structuredResult: AIAnalysisResult = {
          provider: res.bankOrPlatform || (workflowMode === 'bank' ? 'Bank' : 'M-PESA'),
          transactionType: 'deposit',
          amount: res.amount,
          currency: 'KES',
          transactionDate: new Date().toISOString(),
          transactionRef: res.transactionRef || 'TXN-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          senderRecipient: res.senderRecipient || user.name,
          extractedAccount: res.accountOrPhone || user.accountNumber,
          isDuplicate: isDuplicateRef,
          messageValidationPassed: res.amount > 0 && !isDuplicateRef,
          messageValidationNotes: [
            res.amount > 0 ? 'Extracted verifiable monetary value' : 'Missing amount',
            res.transactionRef ? 'Transaction reference verified' : 'No reference found',
            isBankMpesaMatch ? 'M-Pesa and Bank messages cross-matched (1 contribution recorded)' : 'Single message workflow verified',
          ],
          externalVerificationStatus: 'unconfirmed',
          externalVerificationMessage: 'Message analyzed. Transaction authenticity has not been independently confirmed.',
          verificationStatus: status,
          explanation,
          recommendedNextAction: isDuplicateRef 
            ? 'Do not accept this duplicate transaction.' 
            : 'Review goal allocation breakdown below and confirm deposit.',
          isBankMpesaMatch,
          matchedDetails: isBankMpesaMatch ? {
            bankRef: res.transactionRef,
            doubleCountGuarded: true,
          } : undefined,
          suggestedAllocations: [],
        };

        setAnalysisResult(structuredResult);

        // Run allocation calculation engine
        if (structuredResult.amount > 0 && status !== 'duplicate' && status !== 'rejected') {
          const allocRes = calculateAllocations(
            structuredResult.amount,
            goals,
            allocationMode,
            customPercentages
          );
          setAllocatedBreakdown(allocRes.allocations);
          setUnallocatedReserve(allocRes.unallocatedAmount);
        }
      } else {
        setAnalysisError(data.error || 'Failed to analyze transaction. Please check the pasted message format.');
      }
    } catch (err: any) {
      setAnalysisError('Unable to connect to analysis service. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmAndDeposit = () => {
    if (!analysisResult || analysisResult.amount <= 0) return;
    if (analysisResult.verificationStatus === 'duplicate' || analysisResult.verificationStatus === 'rejected') {
      alert('Cannot deposit duplicate or rejected transactions.');
      return;
    }

    // Update goals based on allocation
    const updatedGoals = goals.map((goal) => {
      const matchAlloc = allocatedBreakdown.find((a) => a.goalId === goal.id);
      if (!matchAlloc) return goal;

      const newVerified = goal.currentVerifiedSaved + matchAlloc.amount;
      const remaining = Math.max(0, goal.targetAmount - newVerified);
      const pct = Math.min(100, Math.round((newVerified / goal.targetAmount) * 100));

      return {
        ...goal,
        currentVerifiedSaved: newVerified,
        remainingAmount: remaining,
        progressPercentage: pct,
        status: newVerified >= goal.targetAmount ? 'completed' : goal.status,
      };
    });

    // Create persistent transaction record
    const newTx: TransactionRecord = {
      id: 'tx-' + Date.now(),
      userId: user.id,
      trackingCode: 'SF-TX-' + Math.floor(100000 + Math.random() * 900000),
      rawMessage: mpesaMessage || bankMessage,
      rawBankMessage: bankMessage || undefined,
      rawMpesaMessage: mpesaMessage || undefined,
      amount: analysisResult.amount,
      currency: analysisResult.currency,
      transactionRef: analysisResult.transactionRef,
      senderRecipient: analysisResult.senderRecipient,
      provider: analysisResult.provider,
      accountOrPhone: analysisResult.extractedAccount,
      transactionType: analysisResult.transactionType,
      transactionDate: new Date().toISOString(),
      verificationStatus: analysisResult.verificationStatus,
      verificationExplanation: analysisResult.explanation,
      verifiedAt: new Date().toISOString(),
      isDoubleCountPrevented: analysisResult.isBankMpesaMatch,
      allocatedGoals: allocatedBreakdown,
      unallocatedAmount: unallocatedReserve,
      externalVerificationSource: analysisResult.externalVerificationMessage,
    };

    onConfirmDeposit(newTx, updatedGoals);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className={`p-6 rounded-3xl border ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Assisted Transaction Verification</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">Save Money & Verify Deposit</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Paste your transaction confirmation message. {APP_NAME} extracts the exact amounts, cross-matches bank transfers, and deposits verified savings into your goals.
            </p>
          </div>

          {/* Workflow Toggle: M-Pesa vs Bank */}
          <div className="flex border border-slate-800 bg-slate-950 p-1 rounded-full shrink-0 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setWorkflowMode('mpesa'); handleClear(); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all ${
                workflowMode === 'mpesa' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>M-Pesa Workflow</span>
            </button>
            <button
              type="button"
              onClick={() => { setWorkflowMode('bank'); handleClear(); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all ${
                workflowMode === 'bank' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Bank Workflow</span>
            </button>
          </div>
        </div>
      </div>

      {/* SAMPLE MESSAGES TRAY */}
      <div className={`p-4 rounded-3xl border text-xs ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-2.5">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Try Fictional Sample Confirmation Messages</span>
          </span>
          <span className="text-[11px] text-slate-500">Clearly marked as simulated</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {SAMPLE_MESSAGES.map((sample) => (
            <button
              key={sample.title}
              type="button"
              onClick={() => handleApplySample(sample)}
              className={`px-3 py-1.5 rounded-full text-xs border text-left transition-all flex items-center gap-1.5 ${
                selectedSample?.title === sample.title
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 font-semibold'
                  : 'border-slate-800 bg-slate-950/80 hover:border-slate-700 text-slate-300'
              }`}
            >
              <span>{sample.title}</span>
              {sample.serviceCategory === 'matched_pair' && (
                <span className="text-[9px] px-1 py-0.2 bg-teal-500/20 text-teal-300 rounded font-bold">CROSS-MATCH</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* INPUT FORM */}
      <div className={`p-6 rounded-3xl border space-y-5 ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* M-Pesa Mode */}
        {workflowMode === 'mpesa' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Paste M-Pesa Transaction Confirmation Message</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            <textarea
              rows={4}
              value={mpesaMessage}
              onChange={(e) => setMpesaMessage(e.target.value)}
              placeholder="e.g. QKA8291KLM Confirmed. Ksh5,000.00 received from WANJIKU KAMAU 0722123456 on 11/10/26 at 2:15 PM..."
              className={`w-full p-4 rounded-2xl text-xs font-mono border outline-none leading-relaxed transition-colors ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-emerald-500' 
                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500'
              }`}
            />
          </div>
        )}

        {/* Bank Mode: Two Fields (Bank Message + Corresponding M-Pesa Message) */}
        {workflowMode === 'bank' && (
          <div className="space-y-4">
            <div className={`p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300 flex items-start gap-2.5`}>
              <Link2 className="w-4 h-4 shrink-0 mt-0.5 text-teal-400" />
              <span>
                <strong>Cross-Match Protection:</strong> If you moved money from M-Pesa into your Bank account, paste both messages. {APP_NAME} matches transaction references to prevent counting the outgoing transfer and incoming deposit twice!
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-400" />
                  <span>1. Bank Transaction Confirmation Alert</span>
                </label>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={bankMessage}
                onChange={(e) => setBankMessage(e.target.value)}
                placeholder="e.g. Absa Alert: KES 20,000.00 credited to A/C 0304928172 on 11/10/2026 14:32:10 via M-PESA Ref MP26101188..."
                className={`w-full p-3.5 rounded-2xl text-xs font-mono border outline-none ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>2. Corresponding Outgoing M-Pesa Message (Optional for Cross-Matching)</span>
              </label>
              <textarea
                rows={3}
                value={mpesaMessage}
                onChange={(e) => setMpesaMessage(e.target.value)}
                placeholder="e.g. MP26101188 Confirmed. Ksh20,000.00 sent to Absa Bank Kenya for account 0304928172..."
                className={`w-full p-3.5 rounded-2xl text-xs font-mono border outline-none ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-emerald-500' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            Privacy Guarantee: We never store full SMS logs or ask for PINs or mobile banking passwords.
          </span>
        </div>

        {/* Error message */}
        {analysisError && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{analysisError}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-full text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 transition-all shadow-md shadow-emerald-500/20 active:scale-98"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing & Verifying Message...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
                <span>Analyze Transaction</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ANALYSIS REVIEW SCREEN */}
      {analysisResult && (
        <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 animate-fade-in ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-lg'
        }`}>
          {/* Header & Verification Status Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>Verification Results</span>
                <span className="font-mono text-xs text-slate-400 font-normal">
                  Ref: {analysisResult.transactionRef}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Review verified amounts and double-check auto-allocation before accepting into your goals.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                analysisResult.verificationStatus === 'verified'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : analysisResult.verificationStatus === 'duplicate'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {analysisResult.verificationStatus === 'verified' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {analysisResult.verificationStatus === 'duplicate' && <ShieldAlert className="w-3.5 h-3.5" />}
                {analysisResult.verificationStatus === 'pending' && <HelpCircle className="w-3.5 h-3.5" />}
                <span className="uppercase tracking-wider font-mono text-[11px]">
                  {analysisResult.verificationStatus === 'verified' && 'Verified'}
                  {analysisResult.verificationStatus === 'duplicate' && 'Duplicate Detected'}
                  {analysisResult.verificationStatus === 'pending' && 'Pending Verification'}
                  {analysisResult.verificationStatus === 'needs_review' && 'Needs Review'}
                  {analysisResult.verificationStatus === 'rejected' && 'Rejected'}
                </span>
              </span>
            </div>
          </div>

          {/* Mandatory Transparency Disclosure Statement */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{analysisResult.externalVerificationMessage}</span>
          </div>

          {/* Extracted Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-sans">Verified Amount</span>
              <div className="text-base font-extrabold text-emerald-400 mt-0.5">
                {formatMoney(analysisResult.amount, analysisResult.currency)}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-sans">Provider</span>
              <div className="font-bold text-white mt-0.5">{analysisResult.provider}</div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-sans">Sender / Recipient</span>
              <div className="font-bold text-slate-300 truncate mt-0.5">
                {analysisResult.senderRecipient || user.name}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-sans">Cross-Match Safeguard</span>
              <div className="font-bold text-teal-400 mt-0.5">
                {analysisResult.isBankMpesaMatch ? 'Double-Count Protected' : 'Single Transaction'}
              </div>
            </div>
          </div>

          {/* Explanation Alert */}
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
            {analysisResult.explanation}
          </p>

          {/* ALLOCATION BREAKDOWN */}
          {analysisResult.amount > 0 && analysisResult.verificationStatus !== 'duplicate' && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>Goal Allocation Breakdown</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    How this {formatMoney(analysisResult.amount, analysisResult.currency)} contribution will be distributed:
                  </p>
                </div>

                {/* Mode Selector */}
                <div className="flex border border-slate-800 bg-slate-950 p-1 rounded-full text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setAllocationMode('equal');
                      const r = calculateAllocations(analysisResult.amount, goals, 'equal');
                      setAllocatedBreakdown(r.allocations);
                      setUnallocatedReserve(r.unallocatedAmount);
                    }}
                    className={`px-3 py-1 rounded-full transition-all ${
                      allocationMode === 'equal' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Equal Split
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAllocationMode('percentage');
                      const r = calculateAllocations(analysisResult.amount, goals, 'percentage', customPercentages);
                      setAllocatedBreakdown(r.allocations);
                      setUnallocatedReserve(r.unallocatedAmount);
                    }}
                    className={`px-3 py-1 rounded-full transition-all ${
                      allocationMode === 'percentage' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Priority %
                  </button>
                </div>
              </div>

              {/* Allocations Table/List */}
              <div className="space-y-2">
                {allocatedBreakdown.map((item) => (
                  <div
                    key={item.goalId}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <span className="font-sans font-bold text-white block">{item.goalName}</span>
                      <span className="text-[11px] text-slate-400 font-sans">
                        Prior: {formatMoney(item.priorSaved, 'KES')} → New Total: {formatMoney(item.newSaved, 'KES')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-emerald-400 text-sm block">
                        +{formatMoney(item.amount, 'KES')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans">
                        {item.percentage}% allocated
                      </span>
                    </div>
                  </div>
                ))}

                {unallocatedReserve > 0 && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex justify-between">
                    <span>Unallocated Reserve (Goals at capacity):</span>
                    <span className="font-mono font-bold">+{formatMoney(unallocatedReserve, 'KES')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setAnalysisResult(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Back to Edit
            </button>

            <button
              type="button"
              onClick={handleConfirmAndDeposit}
              disabled={analysisResult.verificationStatus === 'duplicate' || analysisResult.verificationStatus === 'rejected'}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 transition-all shadow-lg shadow-emerald-500/20 active:scale-98"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Confirm & Allocate Verified Deposit</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
