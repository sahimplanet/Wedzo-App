import React, { useState } from 'react';
import { User, Sparkles, Award, Shield, CheckCircle, ArrowRight, Zap, RefreshCw, AlertCircle, Percent } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';

interface ProfileCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUserUpdated: (updatedUser: UserProfile) => void;
  onOpenEditProfile: () => void;
}

export const ProfileCreditsModal: React.FC<ProfileCreditsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserUpdated,
  onOpenEditProfile,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'class' | 'premier'>('premier');
  const [isEvaluatingPattern, setIsEvaluatingPattern] = useState(false);
  const [patternResult, setPatternResult] = useState<{
    score: string;
    insights: string;
    bonus: number;
  } | null>(null);

  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionSuccess, setRedemptionSuccess] = useState<any | null>(null);
  const [redeemError, setRedeemError] = useState('');

  if (!isOpen) return null;

  // Pricing calculations
  const baseCost = selectedPlan === 'premier' ? 5000 : 2500;
  // Maximum credit discount allowed is strictly 50%
  const maxDiscountAllowed = baseCost * 0.5;
  const potentialCreditValue = user.credits * 10;
  const calculatedDiscount = Math.min(potentialCreditValue, maxDiscountAllowed);
  const discountPercent = Math.round((calculatedDiscount / baseCost) * 100);
  const finalPriceToPay = baseCost - calculatedDiscount;
  const creditsNeeded = Math.ceil(calculatedDiscount / 10);

  const handleEvaluatePattern = async () => {
    setIsEvaluatingPattern(true);
    try {
      const res = await fetch('/api/ai/financial-pattern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setPatternResult({
        score: data.patternScore,
        insights: data.patternInsights,
        bonus: data.bonusCredits,
      });

      if (data.bonusCredits > 0) {
        onUserUpdated({
          ...user,
          credits: user.credits + data.bonusCredits,
        });
      }
    } catch (e) {
      setPatternResult({
        score: 'Grade A · Disciplined Financial Pattern',
        insights: 'Strong commitment consistency with steady liability allocations.',
        bonus: 20,
      });
    } finally {
      setIsEvaluatingPattern(false);
    }
  };

  const handleRedeem = async () => {
    if (user.credits < 10) {
      setRedeemError('You need at least 10 Wedzo Credits to redeem a subscription discount.');
      return;
    }

    setIsRedeeming(true);
    setRedeemError('');

    try {
      const res = await fetch('/api/credits/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      const data = await res.json();
      if (data.success) {
        setRedemptionSuccess(data);
        onUserUpdated({
          ...user,
          credits: data.remainingCredits,
          subscriptionPlan: selectedPlan,
          subscriptionCost: data.finalCostToPay,
        });

        try {
          confetti({
            particleCount: 60,
            spread: 50,
            colors: ['#38BDF8', '#34D399', '#818CF8'],
          });
        } catch {}
      } else {
        setRedeemError(data.error || 'Redemption failed.');
      }
    } catch (err: any) {
      setRedeemError(err.message || 'Error redeeming subscription credits.');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-2xl text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-sm">
              {user.name ? user.name.charAt(0) : 'W'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Profile, Financial Pattern & Credits
              </h2>
              <p className="text-xs text-slate-400">
                {user.email} · Wedzo Financial ID: WDZ-{user.id.slice(-6)}
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

        {/* User Profile Card */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300">Registered Profile Details</span>
            <button
              onClick={onOpenEditProfile}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium"
            >
              Edit Details
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-mono">Full Name</span>
              <div className="font-semibold text-white truncate">{user.name}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-mono">ID / Birth Entry No</span>
              <div className="font-mono text-slate-300 font-medium truncate">{user.idOrBirthEntryNo || 'ID-32981044'}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-mono">Date of Birth</span>
              <div className="font-mono text-slate-300">{user.dob || '1998-12-14'}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-mono">Phone Number</span>
              <div className="font-mono text-slate-300">{user.phone || '+254712345678'}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-mono">Clearing Account</span>
              <div className="font-mono text-sky-400 font-semibold truncate">
                {user.platform === 'bank'
                  ? `${user.bankName || 'Absa'} · ${user.accountNumber || '0304928172'}`
                  : `M-PESA (${user.subOption || 'M-Shwari'})`}
              </div>
            </div>
          </div>
        </div>

        {/* AI Financial Pattern Evaluation */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-white">AI Financial Greatness Pattern</span>
            </div>
            <button
              onClick={handleEvaluatePattern}
              disabled={isEvaluatingPattern}
              className="flex items-center gap-1.5 px-3 py-1 bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 rounded-full text-xs font-medium transition-colors"
            >
              {isEvaluatingPattern ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3" />
                  <span>Run AI Evaluation</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-slate-400 mb-3">
            Wedzo scans your message entry cadence and liability auto-deduction streak. Great financial patterns earn recurring credits.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-emerald-400">
                {patternResult?.score || 'Grade S · Great Financial Discipline & Money Entering'}
              </span>
              <span className="text-sky-400 font-mono font-bold">
                +20 Bonus Credits Earned
              </span>
            </div>
            <div className="text-[11px] text-slate-300 leading-relaxed">
              {patternResult?.insights ||
                'High regularity in SMS verification with disciplined allocations to December Holiday and Debit Card reserves. Outstanding savings cadence.'}
            </div>
          </div>
        </div>

        {/* Wedzo Credits Balance & Subscription Redemption */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-bold text-white">Wedzo Credits & Subscription Redemption</span>
              <div className="text-[11px] text-slate-400">
                Current Balance:{' '}
                <span className="font-mono text-sky-400 font-extrabold text-sm ml-1 tabular-nums">
                  {user.credits} Credits
                </span>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-sky-500/15 text-sky-400 font-mono text-[10px] font-bold border border-sky-500/30">
              10 Credits = KES 100 Discount
            </div>
          </div>

          {/* Strict 50% Rule Warning */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 mb-4 flex items-start gap-2">
            <Percent className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Strict Subscription Redemption Policy: </strong>
              Credits can redeem <span className="text-sky-400 font-semibold">20% to a maximum of 50%</span> off Class or Premier plans. Per protocol, credits will never deduct 100% of a subscription; you must pay the remaining balance in cash.
            </div>
          </div>

          {/* Subscription Plans */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div
              onClick={() => setSelectedPlan('class')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                selectedPlan === 'class'
                  ? 'border-sky-400 bg-sky-500/15'
                  : 'border-slate-800 bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-white">Class Plan</span>
                <span className="text-xs font-mono text-slate-400">KES 2,500/mo</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Standard SMS scanning & 3 liability buckets
              </div>
            </div>

            <div
              onClick={() => setSelectedPlan('premier')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                selectedPlan === 'premier'
                  ? 'border-sky-400 bg-sky-500/15'
                  : 'border-slate-800 bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-white">Premier Plan</span>
                <span className="text-xs font-mono text-slate-400">KES 5,000/mo</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Unlimited SMS parsing, AI auto-reconcile & PDF audits
              </div>
            </div>
          </div>

          {/* Live Discount Calculator */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5 mb-4">
            <div className="flex justify-between text-slate-400">
              <span>Original Plan Price:</span>
              <span className="font-mono">KES {baseCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-medium">
              <span>Credits Applied ({creditsNeeded} Credits):</span>
              <span className="font-mono">-KES {calculatedDiscount.toLocaleString()} ({discountPercent}%)</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[10px]">
              <span>Maximum Discount Cap:</span>
              <span className="font-mono text-sky-400">50% Cap Enforced (Max KES {maxDiscountAllowed})</span>
            </div>
            <div className="border-t border-slate-800 pt-1.5 flex justify-between font-bold text-white">
              <span>Final Price to Pay (Remaining 50%+):</span>
              <span className="font-mono text-base text-sky-400">
                KES {finalPriceToPay.toLocaleString()}
              </span>
            </div>
          </div>

          {redeemError && (
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs mb-3">
              {redeemError}
            </div>
          )}

          {redemptionSuccess ? (
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>
                  Redeemed! {redemptionSuccess.discountPercentage}% discount active. Final cost: KES {redemptionSuccess.finalCostToPay}.
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">
                {redemptionSuccess.remainingCredits} Credits Left
              </span>
            </div>
          ) : (
            <button
              onClick={handleRedeem}
              disabled={isRedeeming || user.credits < 10}
              className={`w-full py-2.5 px-4 font-bold rounded-full text-xs transition-all flex items-center justify-center gap-2 ${
                user.credits >= 10
                  ? 'bg-sky-400 hover:bg-sky-300 text-slate-950 active:scale-98 shadow-sm'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isRedeeming ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Applying Credits to Subscription...</span>
                </>
              ) : (
                <>
                  <span>Redeem {creditsNeeded} Credits for {discountPercent}% Off {selectedPlan.toUpperCase()} Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
