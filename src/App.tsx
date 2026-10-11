/**
 * Wedzo - Smart Kenya Savings Application
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  UserProfile, 
  SavingsGoal, 
  TransactionRecord, 
  CurrencyCode 
} from './types';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AuthScreen } from './components/AuthScreen';
import { StepByStepOnboarding } from './components/StepByStepOnboarding';
import { Navbar, ActiveTab } from './components/Navbar';
import { MainDashboard } from './components/MainDashboard';
import { GoalsView } from './components/GoalsView';
import { SaveMoneyFlow } from './components/SaveMoneyFlow';
import { TransactionHistoryView } from './components/TransactionHistoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { testFirebaseConnection, syncUserProfileToFirebase, syncTransactionToFirebase } from './firebase';
import { APP_NAME } from './utils/currency';

// Initial seed goals for realistic demonstration of multi-tier allocation
const DEFAULT_INITIAL_GOALS: SavingsGoal[] = [
  {
    id: 'goal-1',
    userId: 'default-user',
    name: 'Buy a House',
    category: 'property',
    targetAmount: 3500000,
    currency: 'KES',
    deadline: '2028-12-31',
    description: 'Long-term home ownership down payment and closing costs in Nairobi.',
    priority: 'high',
    currentVerifiedSaved: 350000,
    remainingAmount: 3150000,
    progressPercentage: 10,
    status: 'active',
    createdAt: '2026-08-01T10:00:00.000Z',
    iconName: 'Home',
  },
  {
    id: 'goal-2',
    userId: 'default-user',
    name: 'Buy a Laptop',
    category: 'tech',
    targetAmount: 65000,
    currency: 'KES',
    deadline: '2026-12-15',
    description: 'High-performance laptop for remote development and analytics work.',
    priority: 'medium',
    currentVerifiedSaved: 32500,
    remainingAmount: 32500,
    progressPercentage: 50,
    status: 'active',
    createdAt: '2026-08-15T12:30:00.000Z',
    iconName: 'Laptop',
  },
  {
    id: 'goal-3',
    userId: 'default-user',
    name: 'Emergency Fund',
    category: 'safety',
    targetAmount: 100000,
    currency: 'KES',
    deadline: '2027-03-31',
    description: '3-6 months liquid safety buffer for peace of mind.',
    priority: 'high',
    currentVerifiedSaved: 45000,
    remainingAmount: 55000,
    progressPercentage: 45,
    status: 'active',
    createdAt: '2026-09-01T09:00:00.000Z',
    iconName: 'ShieldAlert',
  },
  {
    id: 'goal-4',
    userId: 'default-user',
    name: 'Buy a Smartphone',
    category: 'tech',
    targetAmount: 35000,
    currency: 'KES',
    deadline: '2026-11-30',
    description: 'Updated Android smartphone for mobile banking and business apps.',
    priority: 'medium',
    currentVerifiedSaved: 14000,
    remainingAmount: 21000,
    progressPercentage: 40,
    status: 'active',
    createdAt: '2026-09-10T14:15:00.000Z',
    iconName: 'Smartphone',
  },
];

// Seed transactions demonstrating verification
const DEFAULT_INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'tx-seed-1',
    userId: 'default-user',
    trackingCode: 'SF-TX-781920',
    rawMessage: 'SLK89201LK Confirmed. Ksh15,000.00 transferred to your M-Shwari Lock Savings Account on 11/10/26 at 10:15 AM. Lock duration: 6 Months. Interest rate 6.5% p.a. New Lock Balance is Ksh45,000.00.',
    amount: 15000,
    currency: 'KES',
    transactionRef: 'SLK89201LK',
    senderRecipient: 'M-Shwari Lock Deposit',
    provider: 'M-PESA / M-Shwari',
    transactionType: 'savings_lock',
    transactionDate: '2026-10-11T10:15:00.000Z',
    verificationStatus: 'verified',
    verificationExplanation: 'Verified M-Shwari Lock Savings deposit. Tamper-proof transaction format confirmed.',
    verifiedAt: '2026-10-11T10:15:30.000Z',
    allocatedGoals: [
      {
        goalId: 'goal-1',
        goalName: 'Buy a House',
        amount: 7500,
        percentage: 50,
        priorSaved: 342500,
        newSaved: 350000,
        isCompletedAfter: false,
      },
      {
        goalId: 'goal-2',
        goalName: 'Buy a Laptop',
        amount: 4500,
        percentage: 30,
        priorSaved: 28000,
        newSaved: 32500,
        isCompletedAfter: false,
      },
      {
        goalId: 'goal-3',
        goalName: 'Emergency Fund',
        amount: 3000,
        percentage: 20,
        priorSaved: 42000,
        newSaved: 45000,
        isCompletedAfter: false,
      },
    ],
    unallocatedAmount: 0,
    externalVerificationSource: 'Message analyzed. Transaction authenticity has not been independently confirmed.',
  },
  {
    id: 'tx-seed-2',
    userId: 'default-user',
    trackingCode: 'SF-TX-551944',
    rawMessage: 'Absa Alert: KES 20,000.00 credited to A/C 0304928172 on 10/10/2026 14:32:10 via M-PESA Ref MP26101188.',
    amount: 20000,
    currency: 'KES',
    transactionRef: 'MP26101188',
    senderRecipient: 'Sahim Planet -> Absa Bank',
    provider: 'Absa Bank Kenya',
    transactionType: 'deposit',
    transactionDate: '2026-10-10T14:32:10.000Z',
    verificationStatus: 'verified',
    verificationExplanation: 'Cross-matched M-Pesa to Bank transfer verified. Double-counting prevented.',
    verifiedAt: '2026-10-10T14:32:50.000Z',
    isDoubleCountPrevented: true,
    allocatedGoals: [
      {
        goalId: 'goal-1',
        goalName: 'Buy a House',
        amount: 10000,
        percentage: 50,
        priorSaved: 332500,
        newSaved: 342500,
        isCompletedAfter: false,
      },
      {
        goalId: 'goal-2',
        goalName: 'Buy a Laptop',
        amount: 6000,
        percentage: 30,
        priorSaved: 22000,
        newSaved: 28000,
        isCompletedAfter: false,
      },
      {
        goalId: 'goal-4',
        goalName: 'Buy a Smartphone',
        amount: 4000,
        percentage: 20,
        priorSaved: 10000,
        newSaved: 14000,
        isCompletedAfter: false,
      },
    ],
    unallocatedAmount: 0,
  },
];

export default function App() {
  // App Navigation Flow: 'welcome' | 'auth' | 'onboarding' | 'app'
  const [flowState, setFlowState] = useState<'welcome' | 'auth' | 'onboarding' | 'app'>('welcome');
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [currentTab, setCurrentTab] = useState<ActiveTab>('dashboard');

  // Theme support: 'dark' (default navy/emerald) | 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Active User Profile
  const [user, setUser] = useState<UserProfile>({
    id: 'default-user',
    email: 'sahimplanet@gmail.com',
    name: 'Sahim Planet',
    phone: '+254712345678',
    platform: 'mpesa',
    mpesaServices: ['M-Shwari', 'M-Shwari Lock Savings', 'Ziidi Trader'],
    banks: ['Absa Bank Kenya'],
    bankName: 'Absa Bank Kenya',
    currency: 'KES',
    overallSavingsTarget: 3700000,
    autoAllocate: true,
    allocationMode: 'percentage',
    allocationPercentages: {
      'goal-1': 50,
      'goal-2': 30,
      'goal-3': 20,
    },
    onboardingCompleted: true,
    theme: 'dark',
    credits: 120,
  });

  // Goals & Transactions State
  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('saveflow_goals');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEFAULT_INITIAL_GOALS;
  });

  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    const saved = localStorage.getItem('saveflow_transactions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEFAULT_INITIAL_TRANSACTIONS;
  });

  // Background Firebase synchronization
  useEffect(() => {
    async function initFirebase() {
      try {
        const res = await testFirebaseConnection();
        if (res.connected) {
          syncUserProfileToFirebase(user);
        }
      } catch (err) {
        // silent background sync
      }
    }
    initFirebase();
  }, []);

  // Save goals & transactions to localStorage on update
  useEffect(() => {
    localStorage.setItem('saveflow_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('saveflow_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Load backend profile
  useEffect(() => {
    async function loadBackendData() {
      try {
        const res = await fetch('/api/user/profile');
        const data = await res.json();
        if (data.user) {
          setUser((prev) => ({
            ...prev,
            ...data.user,
            currency: data.user.currency || prev.currency,
          }));
        }
      } catch (err) {
        // silent fallback
      }
    }
    loadBackendData();
  }, []);

  // Toggle Theme
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Auth Callbacks
  const handleLoginClick = () => {
    setAuthInitialMode('signin');
    setFlowState('auth');
  };

  const handleSignUpClick = () => {
    setAuthInitialMode('signup');
    setFlowState('auth');
  };

  const handleAuthenticated = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    syncUserProfileToFirebase(authenticatedUser);

    // If onboarding is incomplete, start the onboarding wizard. Otherwise, open dashboard.
    if (!authenticatedUser.onboardingCompleted) {
      setFlowState('onboarding');
    } else {
      setFlowState('app');
      setCurrentTab('dashboard');
    }
  };

  const handleCompleteOnboarding = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    syncUserProfileToFirebase(updatedUser);
    setFlowState('app');
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    setFlowState('welcome');
    setCurrentTab('dashboard');
  };

  const handleResetData = () => {
    setGoals(DEFAULT_INITIAL_GOALS);
    setTransactions(DEFAULT_INITIAL_TRANSACTIONS);
    localStorage.removeItem('saveflow_goals');
    localStorage.removeItem('saveflow_transactions');
    alert('All simulation data has been reset to defaults.');
  };

  // Goal Management Handlers
  const handleAddGoal = (newGoalPartial: Partial<SavingsGoal>) => {
    const newGoal: SavingsGoal = {
      id: 'goal-' + Date.now(),
      userId: user.id,
      name: newGoalPartial.name || 'New Savings Goal',
      targetAmount: newGoalPartial.targetAmount || 10000,
      currency: user.currency || 'KES',
      deadline: newGoalPartial.deadline,
      description: newGoalPartial.description,
      priority: newGoalPartial.priority || 'medium',
      currentVerifiedSaved: 0,
      remainingAmount: newGoalPartial.targetAmount || 10000,
      progressPercentage: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      iconName: newGoalPartial.iconName || 'Target',
    };

    setGoals((prev) => [newGoal, ...prev]);

    // Send to backend
    fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGoal),
    }).catch(() => {});
  };

  const handleUpdateGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g))
    );

    fetch(`/api/goals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    fetch(`/api/goals/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  // Deposit Confirmation Handler
  const handleConfirmDeposit = (newTx: TransactionRecord, updatedGoals: SavingsGoal[]) => {
    setTransactions((prev) => [newTx, ...prev]);
    setGoals(updatedGoals);
    syncTransactionToFirebase(newTx);

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#059669', '#34d399', '#38bdf8'],
      });
    } catch (e) {
      // ignore
    }

    setCurrentTab('dashboard');
  };

  // =========================================================================
  // RENDER FLOW
  // =========================================================================

  // 1. Welcome Screen
  if (flowState === 'welcome') {
    return (
      <WelcomeScreen
        onLoginClick={handleLoginClick}
        onSignUpClick={handleSignUpClick}
        theme={theme}
      />
    );
  }

  // 2. Authentication Screen (Sign In, Sign Up, Forgot Password)
  if (flowState === 'auth') {
    return (
      <AuthScreen
        initialMode={authInitialMode}
        onAuthenticated={handleAuthenticated}
        onBackToIntro={() => setFlowState('welcome')}
        theme={theme}
      />
    );
  }

  // 3. Step-by-Step Onboarding Wizard (ONE question at a time!)
  if (flowState === 'onboarding') {
    return (
      <StepByStepOnboarding
        user={user}
        onComplete={handleCompleteOnboarding}
        theme={theme}
      />
    );
  }

  // 4. Main Application Experience
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col antialiased ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    } transition-colors pb-20 md:pb-8`}>
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        user={user}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB 1: Main Dashboard */}
        {currentTab === 'dashboard' && (
          <MainDashboard
            user={user}
            goals={goals}
            transactions={transactions}
            onOpenSaveMoney={() => setCurrentTab('save')}
            onOpenGoals={() => setCurrentTab('goals')}
            onOpenTransactions={() => setCurrentTab('transactions')}
            theme={theme}
          />
        )}

        {/* TAB 2: Goals Management View */}
        {currentTab === 'goals' && (
          <GoalsView
            goals={goals}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
            theme={theme}
          />
        )}

        {/* TAB 3: Save Money & AI Transaction Verification Flow */}
        {currentTab === 'save' && (
          <SaveMoneyFlow
            user={user}
            goals={goals}
            existingTransactions={transactions}
            onConfirmDeposit={handleConfirmDeposit}
            onCancel={() => setCurrentTab('dashboard')}
            theme={theme}
          />
        )}

        {/* TAB 4: Transaction History Audit View */}
        {currentTab === 'transactions' && (
          <TransactionHistoryView
            transactions={transactions}
            theme={theme}
          />
        )}

        {/* TAB 5: Analytics & Growth Estimates */}
        {currentTab === 'analytics' && (
          <AnalyticsView
            user={user}
            goals={goals}
            transactions={transactions}
            theme={theme}
          />
        )}

        {/* TAB 6: Settings & Preferences */}
        {currentTab === 'settings' && (
          <SettingsView
            user={user}
            onUpdateUser={(updated) => {
              setUser((prev) => ({ ...prev, ...updated }));
              syncUserProfileToFirebase({ ...user, ...updated });
            }}
            onLogout={handleLogout}
            onResetData={handleResetData}
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />
        )}
      </main>
    </div>
  );
}
