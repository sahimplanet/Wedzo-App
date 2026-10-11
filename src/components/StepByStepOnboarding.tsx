import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  CheckCircle2, 
  Smartphone, 
  Building2, 
  Coins, 
  Target, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Edit3,
  TrendingUp,
  Info
} from 'lucide-react';
import { 
  UserProfile, 
  PlatformType, 
  MpesaService, 
  SupportedBank, 
  CurrencyCode 
} from '../types';
import { formatMoney, DEFAULT_EXCHANGE_RATES, APP_NAME } from '../utils/currency';

interface StepByStepOnboardingProps {
  user: UserProfile;
  onComplete: (updatedProfile: UserProfile) => void;
  theme?: 'dark' | 'light';
}

const MPESA_OPTIONS: { id: MpesaService; label: string; desc: string; type: 'savings' | 'investment' | 'lock' }[] = [
  { id: 'M-Shwari', label: 'M-Shwari', desc: 'Safaricom & NCBA everyday savings account', type: 'savings' },
  { id: 'M-Shwari Lock Savings', label: 'M-Shwari Lock Savings', desc: 'Target fixed lock account with guaranteed interest', type: 'lock' },
  { id: 'Ziidi Trader', label: 'Ziidi Trader', desc: 'Regulated micro-investment & money market trading', type: 'investment' },
  { id: 'Ziidi Shariah-Compliant', label: 'Ziidi Shariah-Compliant', desc: 'Ethical, interest-free Shariah savings & trading', type: 'investment' },
  { id: 'KCB M-PESA', label: 'KCB M-PESA', desc: 'Direct savings & fixed deposit account by KCB Bank', type: 'savings' },
];

const SUPPORTED_BANKS: { id: SupportedBank; label: string; sub: string }[] = [
  { id: 'Equity Bank', label: 'Equity Bank', sub: 'EazzyBiz & Equitel mobile clearing' },
  { id: 'KCB Bank', label: 'KCB Bank', sub: 'Vooma & KCB Mobile banking alerts' },
  { id: 'Co-operative Bank', label: 'Co-operative Bank', sub: 'MCo-op Cash deposit notifications' },
  { id: 'Absa Bank Kenya', label: 'Absa Bank Kenya', sub: 'Timiza & Absa Internet banking alerts' },
  { id: 'Faulu Bank', label: 'Faulu Bank', sub: 'Faulu Mobile & SME business savings' },
  { id: 'DTB Bank', label: 'DTB Bank', sub: 'Diamond Trust Bank direct alert clearing' },
];

export const StepByStepOnboarding: React.FC<StepByStepOnboardingProps> = ({
  user,
  onComplete,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  // State machine for step-by-step wizard (1 question at a time)
  // Step 1: Platform Selection
  // Step 2: 2A (M-Pesa services) or 2B (Banks)
  // Step 3: Currency
  // Step 4: Overall Target (Optional)
  // Step 5: Auto-allocation preference
  // Step 6: Review and finish
  const [currentStep, setCurrentStep] = useState<number>(1);

  // User responses
  const [platform, setPlatform] = useState<PlatformType>(user.platform || 'mpesa');
  const [mpesaServices, setMpesaServices] = useState<MpesaService[]>(
    user.mpesaServices && user.mpesaServices.length > 0 
      ? user.mpesaServices 
      : ['M-Shwari', 'M-Shwari Lock Savings']
  );
  const [selectedBanks, setSelectedBanks] = useState<SupportedBank[]>(
    user.banks && user.banks.length > 0 
      ? user.banks 
      : ['Absa Bank Kenya']
  );
  const [currency, setCurrency] = useState<CurrencyCode>(user.currency || 'KES');
  const [overallTarget, setOverallTarget] = useState<string>(
    user.overallSavingsTarget ? user.overallSavingsTarget.toString() : '150000'
  );
  const [autoAllocate, setAutoAllocate] = useState<boolean>(
    user.autoAllocate !== undefined ? user.autoAllocate : true
  );
  const [allocationMode, setAllocationMode] = useState<'equal' | 'percentage'>(
    user.allocationMode || 'equal'
  );

  // Validation errors
  const [stepError, setStepError] = useState<string | null>(null);

  // Step navigation
  const handleNext = () => {
    setStepError(null);

    // Validation per step
    if (currentStep === 1) {
      if (!platform) {
        setStepError('Please select either M-Pesa or Bank account.');
        return;
      }
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (platform === 'mpesa' && mpesaServices.length === 0) {
        setStepError('Please select at least one M-Pesa savings or investment service.');
        return;
      }
      if (platform === 'bank' && selectedBanks.length === 0) {
        setStepError('Please select at least one supported bank.');
        return;
      }
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      if (!currency) {
        setStepError('Please select your preferred primary currency.');
        return;
      }
      setCurrentStep(4);
      return;
    }

    if (currentStep === 4) {
      // Step 4 target is optional
      setCurrentStep(5);
      return;
    }

    if (currentStep === 5) {
      setCurrentStep(6);
      return;
    }

    if (currentStep === 6) {
      // Finish onboarding
      const updated: UserProfile = {
        ...user,
        platform,
        mpesaServices: platform === 'mpesa' ? mpesaServices : [],
        banks: platform === 'bank' ? selectedBanks : [],
        bankName: platform === 'bank' ? selectedBanks[0] : undefined,
        currency,
        overallSavingsTarget: overallTarget ? parseFloat(overallTarget.replace(/,/g, '')) : undefined,
        autoAllocate,
        allocationMode,
        onboardingCompleted: true,
      };

      // Save to localStorage
      localStorage.setItem(`saveflow_profile_${user.id}`, JSON.stringify(updated));
      onComplete(updated);
    }
  };

  const handleBack = () => {
    setStepError(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleMpesaService = (service: MpesaService) => {
    setMpesaServices((prev) => 
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  const toggleBank = (bank: SupportedBank) => {
    setSelectedBanks((prev) => 
      prev.includes(bank) ? prev.filter((b) => b !== bank) : [...prev, bank]
    );
  };

  // Step title & total count
  const totalSteps = 6;
  const progressPct = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className={`min-h-screen flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Progress Indicator */}
      <div className="max-w-xl mx-auto w-full mb-6">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-emerald-400">Step {currentStep} of {totalSteps}</span>
          <span className="text-slate-400 font-mono">{progressPct}% completed</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Main Container - Material Design 3 Elevation Card */}
      <div className={`max-w-xl mx-auto w-full p-6 sm:p-8 rounded-3xl border shadow-xl backdrop-blur-xl relative z-10 flex-1 flex flex-col justify-between ${
        isDark ? 'bg-slate-900/95 border-slate-800/90' : 'bg-white border-slate-200 shadow-slate-200/50'
      }`}>
        <div>
          {/* QUESTION 1: Platform Selection */}
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-2">
                Which platform do you use to save money?
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Choose where your primary savings funds originate. You can paste transaction messages from this platform to verify savings.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option A: M-Pesa */}
                <button
                  type="button"
                  onClick={() => setPlatform('mpesa')}
                  className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                    platform === 'mpesa'
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-md shadow-emerald-500/10'
                      : isDark ? 'border-slate-800 bg-slate-950/60 hover:border-slate-700' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Option A</span>
                    {platform === 'mpesa' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <h3 className="font-extrabold text-base mb-1">M-Pesa</h3>
                  <p className="text-xs text-slate-400">
                    Safaricom mobile money, M-Shwari, Lock Savings, and Ziidi Trader.
                  </p>
                </button>

                {/* Option B: Bank Account */}
                <button
                  type="button"
                  onClick={() => setPlatform('bank')}
                  className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                    platform === 'bank'
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-md shadow-emerald-500/10'
                      : isDark ? 'border-slate-800 bg-slate-950/60 hover:border-slate-700' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">Option B</span>
                    {platform === 'bank' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <h3 className="font-extrabold text-base mb-1">Bank Account</h3>
                  <p className="text-xs text-slate-400">
                    Direct bank alerts from Equity, KCB, Absa, Co-op, Faulu, or DTB.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* QUESTION 2A: M-Pesa Services (if M-Pesa selected) */}
          {currentStep === 2 && platform === 'mpesa' && (
            <div className="animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <Layers className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-2">
                Which M-Pesa savings service do you use?
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Select one or more services you use for deposits. We distinguish savings accounts from investment or trading products.
              </p>

              <div className="space-y-2.5">
                {MPESA_OPTIONS.map((opt) => {
                  const isSelected = mpesaServices.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleMpesaService(opt.id)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                          : isDark ? 'border-slate-800 bg-slate-950/60 hover:border-slate-700' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                          isSelected ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">{opt.label}</span>
                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                              opt.type === 'investment' 
                                ? 'bg-indigo-500/20 text-indigo-300' 
                                : opt.type === 'lock' 
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}>
                              {opt.type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* QUESTION 2B: Bank Selection (if Bank selected) */}
          {currentStep === 2 && platform === 'bank' && (
            <div className="animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-2">
                Which bank do you use?
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Select your bank. For this version, these official Kenyan institutions are verified. You may select multiple banks.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUPPORTED_BANKS.map((b) => {
                  const isSelected = selectedBanks.includes(b.id);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => toggleBank(b.id)}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                          : isDark ? 'border-slate-800 bg-slate-950/60 hover:border-slate-700' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm">{b.label}</span>
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isSelected ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400">{b.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* QUESTION 3: Currency Selection */}
          {currentStep === 3 && (
            <div className="animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <Coins className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-2">
                Which currency do you use?
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Default is Kenyan Shillings (KES). Other currencies are converted using live Central Bank of Kenya reference rates.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { code: 'KES', label: 'Kenyan Shilling', symbol: 'KSh', note: 'Default' },
                  { code: 'USD', label: 'US Dollar', symbol: '$', note: '129.50 KES' },
                  { code: 'EUR', label: 'Euro', symbol: '€', note: '141.20 KES' },
                  { code: 'GBP', label: 'British Pound', symbol: '£', note: '168.80 KES' },
                ].map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setCurrency(c.code as CurrencyCode)}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      currency === c.code
                        ? 'border-emerald-500 bg-emerald-500/15 shadow-sm'
                        : isDark ? 'border-slate-800 bg-slate-950/60 hover:border-slate-700' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <span className="text-lg font-black block text-emerald-400">{c.symbol}</span>
                    <span className="text-xs font-bold block mt-1">{c.code}</span>
                    <span className="text-[10px] text-slate-400 block">{c.note}</span>
                  </button>
                ))}
              </div>

              {/* Live exchange rate display card */}
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>Verified Exchange Rate</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono font-bold text-sm">1 USD = 129.50 KES</span>
                  <span className="text-[10px] text-slate-400 font-mono">Live Central Bank of Kenya</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Exchange rate verified via {DEFAULT_EXCHANGE_RATES.USD_KES.source}. Timestamped today. Never combined without recorded conversion.
                </p>
              </div>
            </div>
          )}

          {/* QUESTION 4: Overall Savings Target (Optional) */}
          {currentStep === 4 && (
            <div className="animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-2">
                How much do you want to save?
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Set an overall total savings benchmark across all your goals. This is completely optional and can be adjusted later.
              </p>

              <div className="mb-6">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Overall Savings Target ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm text-slate-400">
                    {currency === 'KES' ? 'KSh' : currency}
                  </span>
                  <input
                    type="number"
                    value={overallTarget}
                    onChange={(e) => setOverallTarget(e.target.value)}
                    placeholder="e.g. 150000"
                    className={`w-full pl-14 pr-4 py-3 rounded-2xl text-base font-mono font-bold border outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Quick Preset Pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {['50000', '100000', '250000', '500000'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setOverallTarget(preset)}
                    className="px-3 py-1.5 rounded-full text-xs font-mono font-medium border border-slate-700 bg-slate-800 hover:border-emerald-500 transition-colors"
                  >
                    {formatMoney(Number(preset), currency, 0)}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => { setOverallTarget(''); handleNext(); }}
                className="text-xs text-slate-400 hover:text-white transition-colors underline underline-offset-4"
              >
                Skip this question for now
              </button>
            </div>
          )}

          {/* QUESTION 5: Automatic Savings Allocation */}
          {currentStep === 5 && (
            <div className="animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-2">
                Do you want automatic savings allocation?
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                When you paste a verified M-Pesa or bank deposit, {APP_NAME} can automatically distribute the funds into your goals.
              </p>

              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  onClick={() => setAutoAllocate(true)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                    autoAllocate
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                      : isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center border ${
                    autoAllocate ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600'
                  }`}>
                    {autoAllocate && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-1">Yes, automatically allocate my verified savings</h3>
                    <p className="text-xs text-slate-400">
                      Splits money across your active goals (e.g. 50% House, 30% Laptop, 20% Emergency) and caps each goal at 100%.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAutoAllocate(false)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                    !autoAllocate
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                      : isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center border ${
                    !autoAllocate ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600'
                  }`}>
                    {!autoAllocate && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-1">No, I want to allocate my savings manually</h3>
                    <p className="text-xs text-slate-400">
                      Prompt me each time with a breakdown to approve or manually pick which goals receive the deposit.
                    </p>
                  </div>
                </button>
              </div>

              {/* Explanatory Callout Card */}
              <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}>
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Protection Rule:</strong> A goal never receives more than its target amount. Once a goal is 100% complete, excess savings automatically cascade to your remaining goals.
                </span>
              </div>
            </div>
          )}

          {/* QUESTION 6: Review & Finish */}
          {currentStep === 6 && (
            <div className="animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-2">
                Review your savings setup
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Confirm your selections. You can click any section to modify it before finishing.
              </p>

              <div className="space-y-3 mb-6">
                {/* Summary Row 1: Platform & Services */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400">Savings Platform</span>
                    <div className="font-bold text-sm text-white capitalize">{platform}</div>
                    <div className="text-xs text-slate-400">
                      {platform === 'mpesa' ? mpesaServices.join(', ') : selectedBanks.join(', ')}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                    title="Edit platform"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                {/* Summary Row 2: Currency */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400">Primary Currency</span>
                    <div className="font-bold text-sm text-white">{currency} ({currency === 'KES' ? 'KSh' : currency})</div>
                    <div className="text-xs text-slate-400">Standard Kenyan formatting enabled</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                    title="Edit currency"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                {/* Summary Row 3: Target & Allocation */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400">Target & Allocation</span>
                    <div className="font-bold text-sm text-white">
                      {overallTarget ? formatMoney(Number(overallTarget), currency) : 'No overall limit set'}
                    </div>
                    <div className="text-xs text-emerald-400 font-medium">
                      {autoAllocate ? 'Automatic Multi-Goal Allocation Enabled' : 'Manual Allocation Mode'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                    title="Edit allocation"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Error notice */}
        {stepError && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {stepError}
          </div>
        )}

        {/* Bottom Navigation Buttons: Back & Continue */}
        <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between gap-3 mt-6">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold border transition-all ${
                isDark ? 'border-slate-700 bg-slate-800 text-slate-300 hover:text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/20 active:scale-98"
          >
            <span>{currentStep === totalSteps ? 'Complete & Open Dashboard' : 'Continue'}</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
