export type PlatformType = 'mpesa' | 'bank';

export type MpesaService = 
  | 'M-Shwari'
  | 'M-Shwari Lock Savings'
  | 'Ziidi Trader'
  | 'Ziidi Shariah-Compliant'
  | 'KCB M-PESA';

export type SupportedBank = 
  | 'Equity Bank'
  | 'KCB Bank'
  | 'Co-operative Bank'
  | 'Absa Bank Kenya'
  | 'Faulu Bank'
  | 'DTB Bank';

export type CurrencyCode = 'KES' | 'USD' | 'EUR' | 'GBP';

export type GoalStatus = 'active' | 'completed' | 'paused';
export type GoalPriority = 'high' | 'medium' | 'low';

export type VerificationStatus = 
  | 'verified' 
  | 'pending' 
  | 'rejected' 
  | 'duplicate' 
  | 'needs_review';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  dob?: string;
  idOrBirthEntryNo?: string;
  platform: PlatformType;
  mpesaServices?: MpesaService[];
  banks?: SupportedBank[];
  bankName?: string;
  accountNumber?: string;
  subOption?: string;
  currency: CurrencyCode;
  overallSavingsTarget?: number;
  autoAllocate: boolean;
  allocationMode: 'equal' | 'percentage';
  allocationPercentages?: Record<string, number>;
  onboardingCompleted: boolean;
  theme: 'dark' | 'light';
  credits: number;
  subscriptionPlan?: 'free' | 'class' | 'premier';
  subscriptionCost?: number;
  lastMessageDate?: string;
}

export type LiabilityCategory = 
  | 'holiday' 
  | 'debit_card' 
  | 'car' 
  | 'travel' 
  | 'celebration' 
  | 'debt' 
  | 'emergency'
  | 'tech'
  | 'property'
  | 'education'
  | 'career'
  | 'safety'
  | 'mobility'
  | 'housing'
  | 'living'
  | 'custom';

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  title?: string; // legacy alias for name
  category?: string;
  targetAmount: number;
  currentPaid?: number; // legacy alias for currentVerifiedSaved
  currency: CurrencyCode;
  deadline?: string;
  dueDate?: string; // legacy alias for deadline
  description?: string;
  priority: GoalPriority;
  currentVerifiedSaved: number;
  remainingAmount: number;
  progressPercentage: number;
  status: GoalStatus;
  createdAt: string;
  updatedAt?: string;
  iconName?: string;
  bankOrCard?: string; // legacy
  celebrationReason?: string; // legacy
}

export interface DeductionBreakdown {
  liabilityId: string;
  liabilityTitle: string;
  amount: number;
  percentage: number;
  reason?: string;
}

export interface GoalAllocationItem {
  goalId: string;
  goalName: string;
  amount: number;
  percentage: number;
  priorSaved: number;
  newSaved: number;
  isCompletedAfter: boolean;
}

export interface TransactionRecord {
  id: string;
  userId: string;
  trackingCode: string;
  rawMessage: string;
  rawBankMessage?: string;
  rawMpesaMessage?: string;
  amount: number;
  currency: CurrencyCode;
  transactionRef: string;
  senderRecipient?: string;
  provider: string;
  bankOrPlatform?: string; // legacy alias for provider
  accountOrPhone?: string;
  transactionType: 'deposit' | 'savings_lock' | 'investment' | 'transfer' | 'withdrawal';
  transactionDate: string;
  verificationStatus: VerificationStatus;
  verificationExplanation: string;
  verifiedAt: string;
  isDoubleCountPrevented?: boolean;
  allocatedGoals: GoalAllocationItem[];
  deductions?: DeductionBreakdown[]; // legacy alias
  unallocatedAmount: number;
  unallocatedToGeneralAssets?: number; // legacy alias
  creditsAwarded?: number; // legacy alias
  externalVerificationSource?: string;
}

export interface MessageAnalysisResult {
  amount: number;
  currency: string;
  transactionRef: string;
  bankOrPlatform: string;
  accountOrPhone: string;
  senderRecipient: string;
  detectedType: string;
  date?: string;
  isLegitimate: boolean;
  confidence: number;
  accountMatched: boolean;
  nameMatched: boolean;
  summaryExplanation: string;
  suggestedAllocations: DeductionBreakdown[];
  rawMessage?: string;
}

export interface AIAnalysisResult {
  provider: string;
  transactionType: 'deposit' | 'savings_lock' | 'investment' | 'transfer' | 'withdrawal';
  amount: number;
  currency: CurrencyCode;
  transactionDate: string;
  transactionRef: string;
  senderRecipient?: string;
  extractedAccount?: string;
  isDuplicate: boolean;
  duplicateDetails?: string;
  messageValidationPassed: boolean;
  messageValidationNotes: string[];
  externalVerificationStatus: 'confirmed' | 'unconfirmed' | 'unavailable';
  externalVerificationMessage: string;
  verificationStatus: VerificationStatus;
  explanation: string;
  recommendedNextAction: string;
  isBankMpesaMatch?: boolean;
  matchedDetails?: {
    bankRef?: string;
    mpesaRef?: string;
    bankAmount?: number;
    mpesaAmount?: number;
    doubleCountGuarded: boolean;
  };
  suggestedAllocations: {
    goalId: string;
    goalName: string;
    amount: number;
    percentage: number;
  }[];
}

export interface ExchangeRateInfo {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  source: string;
  timestamp: string;
  isUserSupplied: boolean;
}

// Legacy types for compatibility
export interface Liability {
  id: string;
  title: string;
  category: LiabilityCategory;
  targetAmount: number;
  currentPaid: number;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  bankOrCard?: string;
  description?: string;
  celebrationReason?: string;
}

export interface SavedTransaction {
  id: string;
  trackingCode: string;
  rawMessage: string;
  amount: number;
  currency: string;
  transactionRef: string;
  senderRecipient: string;
  bankOrPlatform: string;
  accountOrPhone: string;
  verifiedAt: string;
  deductions: DeductionBreakdown[];
  unallocatedToGeneralAssets: number;
  creditsAwarded: number;
}

export type ReconciliationStatus = {
  requiresReconciliation: boolean;
  daysSinceLastMessage: number;
  defaultPlatform: PlatformType;
  bankName?: string;
  messageNeededCount: number;
  prompt: string | null;
};
