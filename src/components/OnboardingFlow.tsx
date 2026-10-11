import React, { useState } from 'react';
import { Palmtree, CreditCard, Car, Compass, Sparkles, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { LiabilityCategory, Liability } from '../types';

interface OnboardingFlowProps {
  isOpen: boolean;
  onComplete: (liability: Partial<Liability>) => void;
  defaultBank?: string;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  isOpen,
  onComplete,
  defaultBank = 'Absa Bank',
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedGoal, setSelectedGoal] = useState<LiabilityCategory>('holiday');
  const [celebrationDetails, setCelebrationDetails] = useState('');
  
  // Step 2 details
  const [targetAmount, setTargetAmount] = useState('85000');
  const [cardOrCommitment, setCardOrCommitment] = useState('Absa Platinum Debit Card');
  const [bankRequested, setBankRequested] = useState(defaultBank);
  const [dueDate, setDueDate] = useState('2026-12-24');

  // Step 3: Discipline commitment
  const [acceptedDisciplineContract, setAcceptedDisciplineContract] = useState(false);

  if (!isOpen) return null;

  const goalOptions: {
    id: LiabilityCategory;
    title: string;
    description: string;
    icon: React.ReactNode;
    defaultTarget: string;
    defaultCard: string;
  }[] = [
    {
      id: 'holiday',
      title: 'December Holiday Getaway',
      description: 'Coastal retreat, festive family gathering, or December holiday trip',
      icon: <Palmtree className="w-5 h-5 text-sky-400" />,
      defaultTarget: '85000',
      defaultCard: 'Absa Platinum Holiday Visa',
    },
    {
      id: 'debit_card',
      title: 'AI Debit Card & Balance Reserve',
      description: 'Card settlement balance, security cushion & credit maintenance',
      icon: <CreditCard className="w-5 h-5 text-indigo-400" />,
      defaultTarget: '30000',
      defaultCard: 'Absa Visa Debit Card Concern',
    },
    {
      id: 'car',
      title: 'Buy a Car / Vehicle Deposit',
      description: 'Capital accumulation fund to buy a car or down payment pledge',
      icon: <Car className="w-5 h-5 text-emerald-400" />,
      defaultTarget: '600000',
      defaultCard: 'Asset Finance Pledge',
    },
    {
      id: 'travel',
      title: 'Travel Abroad',
      description: 'International travel flight tickets, visa reserve & hotel stay',
      icon: <Compass className="w-5 h-5 text-teal-400" />,
      defaultTarget: '220000',
      defaultCard: 'International Travel Card',
    },
    {
      id: 'celebration',
      title: 'Elephant Sanctuary / Milestone Celebration',
      description: 'Visiting Tsavo/Sheldrick wildlife sanctuary or personal celebration',
      icon: <Sparkles className="w-5 h-5 text-rose-400" />,
      defaultTarget: '25000',
      defaultCard: 'Eco Heritage Celebration Account',
    },
  ];

  const handleSelectGoal = (goal: LiabilityCategory) => {
    setSelectedGoal(goal);
    const chosen = goalOptions.find((g) => g.id === goal);
    if (chosen) {
      setTargetAmount(chosen.defaultTarget);
      setCardOrCommitment(chosen.defaultCard);
    }
  };

  const handleFinish = () => {
    let title = 'December Holiday Getaway';
    if (selectedGoal === 'holiday') title = 'December Holiday Fund';
    if (selectedGoal === 'debit_card') title = 'AI Debit Card & Security Deposit';
    if (selectedGoal === 'car') title = 'Buy a Car Deposit Fund';
    if (selectedGoal === 'travel') title = 'Travel Abroad Fund';
    if (selectedGoal === 'celebration') {
      title = celebrationDetails ? `Celebrating: ${celebrationDetails}` : 'Elephant Sanctuary & Celebration';
    }

    onComplete({
      title,
      category: selectedGoal,
      targetAmount: Number(targetAmount) || 50000,
      currentPaid: 0,
      dueDate,
      priority: 'high',
      bankOrCard: `${cardOrCommitment} (${bankRequested})`,
      description: celebrationDetails || `Commitment promised for ${title}`,
      celebrationReason: celebrationDetails,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-2xl text-slate-100">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-sky-400">Step {step} of 3</span>
            <span className="text-slate-500 text-xs">·</span>
            <span className="text-xs text-slate-300 font-medium">
              {step === 1 && 'Choose What You Want to Save For'}
              {step === 2 && 'Set Financial Target & Card/Bank'}
              {step === 3 && 'Discipline & USSD Blocking Protocol'}
            </span>
          </div>
          <div className="flex gap-1.5">
            <div className={`h-1.5 w-6 rounded-full ${step >= 1 ? 'bg-sky-400' : 'bg-slate-800'}`} />
            <div className={`h-1.5 w-6 rounded-full ${step >= 2 ? 'bg-sky-400' : 'bg-slate-800'}`} />
            <div className={`h-1.5 w-6 rounded-full ${step === 3 ? 'bg-sky-400' : 'bg-slate-800'}`} />
          </div>
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white mb-1">
              Before entering Wedzo, what is your primary saving commitment?
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              Wedzo initializes this as your primary liability so every verified deposit automatically routes money into fulfilling it.
            </p>

            <div className="space-y-2.5 mb-6">
              {goalOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => handleSelectGoal(opt.id)}
                  className={`flex items-start gap-3.5 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedGoal === opt.id
                      ? 'border-sky-400 bg-sky-500/15 shadow-sm'
                      : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                    {opt.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-white">{opt.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{opt.description}</div>
                  </div>
                  <div className="mt-1">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedGoal === opt.id
                          ? 'border-sky-400 bg-sky-400'
                          : 'border-slate-700'
                      }`}
                    >
                      {selectedGoal === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedGoal === 'celebration' && (
              <div className="mb-6 p-3.5 rounded-2xl border border-slate-800 bg-slate-950">
                <label className="block text-xs font-medium text-sky-300 mb-1">
                  What are you celebrating? (Prompt requirement)
                </label>
                <input
                  type="text"
                  value={celebrationDetails}
                  onChange={(e) => setCelebrationDetails(e.target.value)}
                  placeholder="e.g. Tsavo Elephant Sanctuary excursion, graduation milestone, or wedding"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
                />
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              className="w-full py-2.5 px-4 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold rounded-full text-xs transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
            >
              <span>Continue to Target Amount & Bank</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white mb-1">
              Set Your Liability Target & Bank Card
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              Enter the target money you promised to make, the card you are requesting for, and the bank holding the pledge.
            </p>

            <div className="space-y-4 mb-6">
              {/* Target Amount */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target Amount Promised (KES)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-mono font-bold text-sky-400">
                    KES
                  </span>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-full pl-14 pr-4 py-2.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              {/* Card / Commitment requested for */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Card / Commitment Title You Want to Enter
                </label>
                <input
                  type="text"
                  value={cardOrCommitment}
                  onChange={(e) => setCardOrCommitment(e.target.value)}
                  placeholder="e.g. Absa Platinum Debit Card or Holiday Reserve"
                  className="w-full bg-slate-950 border border-slate-800 rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              {/* Bank Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Bank the Card is Requesting For
                  </label>
                  <select
                    value={bankRequested}
                    onChange={(e) => setBankRequested(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
                  >
                    <option value="Absa Bank">Absa Bank Kenya</option>
                    <option value="Equity Bank">Equity Bank</option>
                    <option value="KCB Bank">KCB Bank Kenya</option>
                    <option value="Standard Chartered">Standard Chartered</option>
                    <option value="NCBA Bank">NCBA Bank</option>
                    <option value="Co-operative Bank">Co-operative Bank</option>
                    <option value="M-PESA Savings">M-PESA / M-Shwari</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Target Completion Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-full text-xs transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-2.5 px-4 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold rounded-full text-xs transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
              >
                <span>Continue to Financial Discipline Protocol</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <ShieldAlert className="w-6 h-6 text-sky-400 shrink-0" />
              <h2 className="text-xl font-bold tracking-tight text-white">
                Discipline Contract: Uninstall Apps & Block USSD
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              As specified in Wedzo protocol, safeguarding your savings requires eliminating impulsive spending triggers before entering the app.
            </p>

            <div className="space-y-3 p-4 rounded-2xl border border-sky-900/40 bg-sky-950/20 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-white">Uninstall High-Friction Bank & Shopping Apps: </span>
                  We advise uninstalling secondary banking and shopping apps that tempt spontaneous balance depletion.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-white">Block USSD Quick-Loan / Spending Codes: </span>
                  Save USSD quick-dial codes (e.g. *334#, *247#) with security locks or contract blocks in your phone app to prevent friction-free withdrawals.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-white">Carrier Check: </span>
                  Confirmed: Safaricom M-PESA and {bankRequested} active. (Telkom Kenya blacklisted and excluded).
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-800 bg-slate-950 cursor-pointer mb-6 hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={acceptedDisciplineContract}
                onChange={(e) => setAcceptedDisciplineContract(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-sky-400 focus:ring-sky-400"
              />
              <span className="text-xs text-slate-300 leading-normal">
                I accept the Wedzo Discipline Contract. I have blocked impulse USSD shortcuts and agree that incoming verified money will strictly auto-deduct toward my <span className="text-sky-400 font-semibold">{cardOrCommitment}</span> promise.
              </span>
            </label>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(2)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-full text-xs transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={!acceptedDisciplineContract}
                className={`flex-1 py-2.5 px-4 font-bold rounded-full text-xs transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 ${
                  acceptedDisciplineContract
                    ? 'bg-sky-400 hover:bg-sky-300 text-slate-950'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>Commit Liability & Enter Wedzo Dashboard</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
