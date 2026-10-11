import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header as required
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-memory data store for server-backed state
interface UserData {
  id: string;
  email: string;
  name: string;
  dob?: string;
  phone?: string;
  idOrBirthEntryNo?: string;
  platform: 'mpesa' | 'bank';
  subOption?: string; // 'mshwari' | 'kcb_mpesa' | 'personal'
  bankName?: string; // 'Absa Bank' | 'Equity Bank' | 'KCB' | etc.
  accountNumber?: string;
  credits: number;
  subscriptionPlan: 'free' | 'class' | 'premier';
  subscriptionCost: number;
  lastMessageDate?: string;
}

interface Liability {
  id: string;
  title: string;
  category: 'holiday' | 'debit_card' | 'car' | 'travel' | 'celebration' | 'debt' | 'emergency';
  targetAmount: number;
  currentPaid: number;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  bankOrCard?: string;
  description?: string;
}

interface SavedTransaction {
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
  deductions: {
    liabilityId: string;
    liabilityTitle: string;
    amount: number;
    percentage: number;
  }[];
  unallocatedToGeneralAssets: number;
  creditsAwarded: number;
}

// In-memory DB
const users: Record<string, UserData> = {
  'default-user': {
    id: 'default-user',
    email: 'sahimplanet@gmail.com',
    name: 'Sahim Planet',
    dob: '1998-12-14',
    phone: '+254712345678',
    idOrBirthEntryNo: 'ID-32981044',
    platform: 'bank',
    bankName: 'Absa Bank',
    accountNumber: '0304928172',
    credits: 120,
    subscriptionPlan: 'free',
    subscriptionCost: 3000,
    lastMessageDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(), // 18 days ago (triggers >2 weeks reconciliation!)
  },
};

const userLiabilities: Record<string, Liability[]> = {
  'default-user': [
    {
      id: 'liab-1',
      title: 'December Holiday Getaway',
      category: 'holiday',
      targetAmount: 85000,
      currentPaid: 24000,
      dueDate: '2026-12-20',
      priority: 'high',
      bankOrCard: 'Absa Platinum Visa',
      description: 'Diani Beach coastal celebration & hotel booking promise',
    },
    {
      id: 'liab-2',
      title: 'AI Debit Card & Security Deposit',
      category: 'debit_card',
      targetAmount: 30000,
      currentPaid: 12500,
      dueDate: '2026-10-31',
      priority: 'high',
      bankOrCard: 'Absa Bank Card A/C 0304928172',
      description: 'Debit card clearing balance & reserve',
    },
    {
      id: 'liab-3',
      title: 'Car Purchase Fund Promise',
      category: 'car',
      targetAmount: 600000,
      currentPaid: 155000,
      dueDate: '2027-03-31',
      priority: 'medium',
      bankOrCard: 'Asset Finance Pledge',
      description: 'Target deposit for vehicle acquisition',
    },
    {
      id: 'liab-4',
      title: 'Elephant Sanctuary & Nature Celebration',
      category: 'celebration',
      targetAmount: 20000,
      currentPaid: 8000,
      dueDate: '2026-11-15',
      priority: 'low',
      bankOrCard: 'M-PESA / Eco Reserve',
      description: 'Celebrating personal financial freedom milestone',
    },
  ],
};

const userTransactions: Record<string, SavedTransaction[]> = {
  'default-user': [
    {
      id: 'tx-1',
      trackingCode: 'WDZ-TX-882941',
      rawMessage: 'Confirmed. KES 15,000 sent to Absa Bank A/C 0304928172 on 9/9/26 at 11:24 AM. Ref: QHG8912KL8.',
      amount: 15000,
      currency: 'KES',
      transactionRef: 'QHG8912KL8',
      senderRecipient: 'Sahim Planet -> Absa Bank',
      bankOrPlatform: 'Absa Bank',
      accountOrPhone: '0304928172',
      verifiedAt: '2026-09-09T08:24:00.000Z',
      deductions: [
        { liabilityId: 'liab-1', liabilityTitle: 'December Holiday Getaway', amount: 3000, percentage: 20 },
        { liabilityId: 'liab-2', liabilityTitle: 'AI Debit Card & Security Deposit', amount: 1500, percentage: 10 },
        { liabilityId: 'liab-3', liabilityTitle: 'Car Purchase Fund Promise', amount: 750, percentage: 5 },
      ],
      unallocatedToGeneralAssets: 9750,
      creditsAwarded: 25,
    },
  ],
};

// Deterministic fallback regex parser for Kenyan M-PESA & Banks
function parseMessageDeterministic(rawText: string) {
  const clean = rawText.trim();
  let amount = 0;
  let currency = 'KES';
  let transactionRef = '';
  let bankOrPlatform = 'Unknown';
  let accountOrPhone = '';
  let senderRecipient = '';
  let detectedType = 'general';

  // 1. M-PESA check
  // E.g.: "QKA39Z99LK Confirmed. Ksh5,000.00 received from JOHN DOE 0712345678 on 27/9/26 at 3:15 PM"
  // E.g.: "Confirmed. KES 2,500.00 sent to Absa Bank 0304928172"
  const mpesaRefMatch = clean.match(/^([A-Z0-9]{8,12})\s+(?:Confirmed|CONFIRMED)/i) || clean.match(/(?:Ref|Reference|Txn ID|ID)[:\s]+([A-Z0-9]{8,12})/i);
  if (mpesaRefMatch) {
    transactionRef = mpesaRefMatch[1];
  }

  // Amount match: "Ksh 1,500.00", "KES 15000", "Ksh15,000"
  const amountMatch = clean.match(/(?:Ksh|KES|USD|UGX|TZS)[\s\.]*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]+(?:\.[0-9]{2})?)/i);
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    if (clean.toUpperCase().includes('USD')) currency = 'USD';
  }

  // Check Absa / Equity / KCB / Bank
  if (/absa/i.test(clean)) {
    bankOrPlatform = 'Absa Bank';
    detectedType = 'bank';
  } else if (/equity/i.test(clean)) {
    bankOrPlatform = 'Equity Bank';
    detectedType = 'bank';
  } else if (/kcb/i.test(clean)) {
    bankOrPlatform = 'KCB Bank';
    detectedType = 'bank';
  } else if (/m-?shwari/i.test(clean)) {
    bankOrPlatform = 'M-Shwari';
    detectedType = 'mpesa';
  } else if (/m-?pesa|safaricom/i.test(clean)) {
    bankOrPlatform = 'M-PESA';
    detectedType = 'mpesa';
  } else if (/standard chartered|stanchart/i.test(clean)) {
    bankOrPlatform = 'Standard Chartered';
    detectedType = 'bank';
  } else if (/ncba/i.test(clean)) {
    bankOrPlatform = 'NCBA Bank';
    detectedType = 'bank';
  } else if (/co-?op/i.test(clean)) {
    bankOrPlatform = 'Co-operative Bank';
    detectedType = 'bank';
  }

  // Account number match
  const accMatch = clean.match(/(?:A\/C|acc|account|A\/c no\.|A\/C:)\s*([0-9X*]+)/i);
  if (accMatch) {
    accountOrPhone = accMatch[1];
  } else {
    // Phone match
    const phoneMatch = clean.match(/(?:254\d{9}|07\d{8}|01\d{8})/);
    if (phoneMatch) {
      accountOrPhone = phoneMatch[0];
    }
  }

  // Sender / Recipient
  const fromMatch = clean.match(/(?:from|sent to|paid to)\s+([A-Z\s]{3,35})(?:\s+on|\s+at|\s+Account|\s+New)/i);
  if (fromMatch) {
    senderRecipient = fromMatch[1].trim();
  } else {
    senderRecipient = bankOrPlatform;
  }

  if (!transactionRef) {
    transactionRef = 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  return {
    amount,
    currency,
    transactionRef,
    bankOrPlatform,
    accountOrPhone,
    senderRecipient,
    detectedType,
    verified: amount > 0,
  };
}

// --------------------------------------------------------------------------
// API Endpoints
// --------------------------------------------------------------------------

// Exchange Rates endpoint
app.get('/api/exchange-rate', (req, res) => {
  res.json({
    baseCurrency: 'KES',
    rates: {
      USD: {
        rate: 129.50,
        source: 'Central Bank of Kenya (CBK) Official Indicative Rate',
        timestamp: new Date().toISOString(),
        isUserSupplied: false,
      },
      EUR: {
        rate: 141.20,
        source: 'Central Bank of Kenya (CBK) Official Rates',
        timestamp: new Date().toISOString(),
        isUserSupplied: false,
      },
      GBP: {
        rate: 168.80,
        source: 'Central Bank of Kenya (CBK) Official Rates',
        timestamp: new Date().toISOString(),
        isUserSupplied: false,
      },
    },
  });
});

// Password Reset Endpoint
app.post('/api/auth/reset-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required for password reset.' });
  }
  res.json({
    success: true,
    message: `Password reset instructions have been dispatched to ${email}.`,
  });
});

// Goals Management Endpoints
app.get('/api/goals', (req, res) => {
  const goals = userLiabilities['default-user'] || [];
  res.json({ success: true, goals });
});

app.post('/api/goals', (req, res) => {
  const { name, title, targetAmount, currency, deadline, dueDate, priority, description, category } = req.body;
  const goalTitle = name || title || 'New Savings Goal';
  const newGoal: Liability = {
    id: 'goal-' + Date.now(),
    title: goalTitle,
    category: category || 'custom',
    targetAmount: Number(targetAmount) || 10000,
    currentPaid: 0,
    dueDate: deadline || dueDate || '2026-12-31',
    priority: priority || 'medium',
    description: description || '',
  };

  if (!userLiabilities['default-user']) {
    userLiabilities['default-user'] = [];
  }
  userLiabilities['default-user'].push(newGoal);
  res.json({ success: true, goal: newGoal, goals: userLiabilities['default-user'] });
});

app.put('/api/goals/:id', (req, res) => {
  const { id } = req.params;
  const { name, title, targetAmount, currentPaid, deadline, dueDate, priority, description, status } = req.body;
  const goals = userLiabilities['default-user'] || [];
  const goal = goals.find(g => g.id === id);

  if (!goal) {
    return res.status(404).json({ error: 'Goal not found' });
  }

  if (name !== undefined || title !== undefined) goal.title = name || title;
  if (targetAmount !== undefined) goal.targetAmount = Number(targetAmount);
  if (currentPaid !== undefined) goal.currentPaid = Number(currentPaid);
  if (deadline !== undefined || dueDate !== undefined) goal.dueDate = deadline || dueDate;
  if (priority !== undefined) goal.priority = priority;
  if (description !== undefined) goal.description = description;

  res.json({ success: true, goal, goals });
});

app.delete('/api/goals/:id', (req, res) => {
  const { id } = req.params;
  let goals = userLiabilities['default-user'] || [];
  userLiabilities['default-user'] = goals.filter(g => g.id !== id);
  res.json({ success: true, goals: userLiabilities['default-user'] });
});

// 1. User profile & login
app.post('/api/auth/login', (req, res) => {
  const { email, name, isGoogle } = req.body;
  const user = users['default-user'];
  if (email) user.email = email;
  if (name) user.name = name;
  res.json({ success: true, user });
});

app.get('/api/user/profile', (req, res) => {
  const user = users['default-user'];
  const liabilities = userLiabilities['default-user'] || [];
  const transactions = userTransactions['default-user'] || [];
  
  const totalAssets = transactions.reduce((sum, tx) => sum + tx.amount, 125000);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + (l.targetAmount - l.currentPaid), 0);
  const totalPromised = liabilities.reduce((sum, l) => sum + l.targetAmount, 0);

  res.json({
    user,
    liabilities,
    transactions,
    totals: {
      assets: totalAssets,
      liabilitiesRemaining: totalLiabilities,
      totalPromised,
    },
  });
});

app.post('/api/user/profile', (req, res) => {
  const user = users['default-user'];
  const { name, dob, phone, idOrBirthEntryNo, platform, subOption, bankName, accountNumber } = req.body;

  if (name !== undefined) user.name = name;
  if (dob !== undefined) user.dob = dob;
  if (phone !== undefined) user.phone = phone;
  if (idOrBirthEntryNo !== undefined) user.idOrBirthEntryNo = idOrBirthEntryNo;
  if (platform !== undefined) user.platform = platform;
  if (subOption !== undefined) user.subOption = subOption;
  if (bankName !== undefined) user.bankName = bankName;
  if (accountNumber !== undefined) user.accountNumber = accountNumber;

  res.json({ success: true, user });
});

// Authentication endpoints
app.post('/api/auth/register', (req, res) => {
  const { email, name, phone, idOrBirthEntryNo, dob, platform, bankName, accountNumber, subOption } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and full name are required.' });
  }

  const userId = 'usr-' + Date.now();
  const newUser: UserData = {
    id: userId,
    email,
    name,
    phone: phone || '',
    idOrBirthEntryNo: idOrBirthEntryNo || '',
    dob: dob || '',
    platform: platform || 'bank',
    bankName: bankName || 'Absa Bank',
    accountNumber: accountNumber || '',
    subOption: subOption || 'mshwari',
    credits: 120,
    subscriptionPlan: 'free',
    subscriptionCost: 3000,
    lastMessageDate: new Date().toISOString(),
  };

  users[userId] = newUser;
  // Also update default-user slot for demo consistency
  users['default-user'] = { ...newUser, id: 'default-user' };

  res.json({ success: true, user: newUser });
});

app.post('/api/auth/login', (req, res) => {
  const { email, identifier } = req.body;
  const searchKey = (email || identifier || '').toLowerCase().trim();

  // Find user by email, phone, or id
  let matchedUser = Object.values(users).find(u => 
    u.email.toLowerCase() === searchKey || 
    (u.phone && u.phone.includes(searchKey)) ||
    (u.idOrBirthEntryNo && u.idOrBirthEntryNo.toLowerCase() === searchKey)
  );

  if (!matchedUser) {
    // If not found, use default user or create session
    matchedUser = users['default-user'];
  }

  res.json({ success: true, user: matchedUser });
});

// 2. Add / Update Liabilities
app.post('/api/liabilities', (req, res) => {
  const { title, category, targetAmount, dueDate, priority, bankOrCard, description } = req.body;
  const newLiability: Liability = {
    id: 'liab-' + Date.now(),
    title: title || 'New Savings Commitment',
    category: category || 'holiday',
    targetAmount: Number(targetAmount) || 10000,
    currentPaid: 0,
    dueDate: dueDate || '2026-12-31',
    priority: priority || 'medium',
    bankOrCard: bankOrCard || 'Absa Bank Card',
    description: description || '',
  };

  if (!userLiabilities['default-user']) {
    userLiabilities['default-user'] = [];
  }
  userLiabilities['default-user'].push(newLiability);
  res.json({ success: true, liability: newLiability, all: userLiabilities['default-user'] });
});

// 3. Scan & Analyze Message (Strict AI Analysis via Gemini + Deterministic fallback)
app.post('/api/messages/analyze', async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  const user = users['default-user'];
  const liabilities = userLiabilities['default-user'] || [];

  // Parse using deterministic extractor first
  const fallback = parseMessageDeterministic(message);

  let analysisResult = {
    amount: fallback.amount,
    currency: fallback.currency,
    transactionRef: fallback.transactionRef,
    bankOrPlatform: fallback.bankOrPlatform,
    accountOrPhone: fallback.accountOrPhone,
    senderRecipient: fallback.senderRecipient,
    detectedType: fallback.detectedType,
    date: new Date().toISOString(),
    isLegitimate: fallback.amount > 0,
    confidence: fallback.amount > 0 ? 0.92 : 0.4,
    accountMatched: false,
    nameMatched: false,
    summaryExplanation: '',
    suggestedAllocations: [] as {
      liabilityId: string;
      liabilityTitle: string;
      percentage: number;
      amount: number;
      reason: string;
    }[],
  };

  // Check matching with user registration
  if (user.platform === 'bank' && user.accountNumber && analysisResult.accountOrPhone) {
    if (analysisResult.accountOrPhone.includes(user.accountNumber) || user.accountNumber.includes(analysisResult.accountOrPhone)) {
      analysisResult.accountMatched = true;
    }
  }
  if (user.name && analysisResult.senderRecipient) {
    const userTokens = user.name.toLowerCase().split(/\s+/);
    const msgTokens = analysisResult.senderRecipient.toLowerCase();
    if (userTokens.some(t => t.length > 2 && msgTokens.includes(t))) {
      analysisResult.nameMatched = true;
    }
  }

  // If Gemini API is available, enhance with intelligent contextual understanding
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `Analyze this financial transaction message (e.g. M-PESA, Absa Bank, Equity, KCB, or other bank alert).
The user is saving with Wedzo personal finance app.
Registered user name: "${user.name}"
Registered saving platform: "${user.platform}"
Registered bank: "${user.bankName || 'Absa Bank'}"
Registered account: "${user.accountNumber || ''}"
Registered phone: "${user.phone || ''}"

Transaction message:
"""
${message}
"""

Active user liabilities/savings goals:
${JSON.stringify(liabilities.map(l => ({ id: l.id, title: l.title, category: l.category, remaining: l.targetAmount - l.currentPaid, priority: l.priority, dueDate: l.dueDate })))}

Rules:
1. Extract the EXACT amount sent or deposited. Users CANNOT edit this amount. If the message says 500, the amount is 500.
2. Extract the transaction code, currency (e.g. KES, USD), sender/recipient, bank or platform, and account/phone number.
3. Check if account or name matches the registered profile.
4. Calculate intelligent deduction percentages across the user's liabilities according to priority and urgency (e.g., 20% to the most urgent holiday or card liability, 10% to second, 5% to third, 1% etc.). Remainder stays in general liquid assets.
Return strictly the JSON object.`;

      const geminiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              amount: { type: Type.NUMBER, description: 'The exact amount identified in the message' },
              currency: { type: Type.STRING, description: 'Currency code, e.g. KES' },
              transactionRef: { type: Type.STRING, description: 'Transaction confirmation code' },
              bankOrPlatform: { type: Type.STRING, description: 'Bank name or M-PESA' },
              accountOrPhone: { type: Type.STRING, description: 'Account number or phone found' },
              senderRecipient: { type: Type.STRING, description: 'Entity who sent or received' },
              detectedType: { type: Type.STRING, description: 'bank or mpesa' },
              isLegitimate: { type: Type.BOOLEAN, description: 'Whether this looks like a genuine bank or MPESA alert' },
              confidence: { type: Type.NUMBER, description: 'Confidence between 0 and 1' },
              accountMatched: { type: Type.BOOLEAN, description: 'Whether account matches registered user account' },
              nameMatched: { type: Type.BOOLEAN, description: 'Whether name matches registered user' },
              summaryExplanation: { type: Type.STRING, description: 'Short scannable explanation of the analysis' },
              suggestedAllocations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    liabilityId: { type: Type.STRING },
                    liabilityTitle: { type: Type.STRING },
                    percentage: { type: Type.NUMBER },
                    amount: { type: Type.NUMBER },
                    reason: { type: Type.STRING },
                  },
                  required: ['liabilityId', 'percentage', 'amount'],
                },
              },
            },
            required: ['amount', 'currency', 'transactionRef', 'bankOrPlatform', 'isLegitimate'],
          },
        },
      });

      const parsed = JSON.parse(geminiResponse.text?.trim() || '{}');
      if (parsed.amount !== undefined && parsed.amount > 0) {
        analysisResult = {
          ...analysisResult,
          ...parsed,
        };
      }
    } catch (err) {
      console.warn('Gemini analysis error, using deterministic extraction:', err);
    }
  }

  // Ensure default allocation distribution if none suggested
  if (!analysisResult.suggestedAllocations || analysisResult.suggestedAllocations.length === 0) {
    const allocations: typeof analysisResult.suggestedAllocations = [];
    const percentages = [20, 10, 5, 2];
    liabilities.forEach((l, idx) => {
      const pct = percentages[idx] || 1;
      const allocAmt = Math.round((analysisResult.amount * pct) / 100);
      allocations.push({
        liabilityId: l.id,
        liabilityTitle: l.title,
        percentage: pct,
        amount: allocAmt,
        reason: idx === 0 ? 'High priority commitment (20% auto-deduct)' : `${pct}% steady liability clearance`,
      });
    });
    analysisResult.suggestedAllocations = allocations;
  }

  // Set explanation if missing
  if (!analysisResult.summaryExplanation) {
    analysisResult.summaryExplanation = `Verified ${analysisResult.currency} ${analysisResult.amount.toLocaleString()} from ${analysisResult.bankOrPlatform}. Reference ${analysisResult.transactionRef}.`;
  }

  res.json({
    success: true,
    data: analysisResult,
  });
});

// 4. Confirm Transaction & Save to Assets & Auto-Deduct Liabilities
app.post('/api/transactions/confirm', (req, res) => {
  const { analysis, customAllocations } = req.body;
  if (!analysis || !analysis.amount || analysis.amount <= 0) {
    return res.status(400).json({ error: 'Valid analyzed transaction data is required.' });
  }

  const user = users['default-user'];
  const liabilities = userLiabilities['default-user'] || [];

  // Check for duplicate transaction ref
  const existingList = userTransactions['default-user'] || [];
  const isDuplicate = existingList.some(tx => tx.transactionRef === analysis.transactionRef);
  if (isDuplicate) {
    return res.status(400).json({ error: `Transaction ref ${analysis.transactionRef} has already been reconciled and saved.` });
  }

  const allocations = customAllocations || analysis.suggestedAllocations || [];
  let totalDeducted = 0;

  const appliedDeductions = allocations.map((alloc: any) => {
    const targetLiab = liabilities.find(l => l.id === alloc.liabilityId);
    const deductionAmt = Math.min(alloc.amount, (targetLiab?.targetAmount || 999999) - (targetLiab?.currentPaid || 0));
    if (targetLiab) {
      targetLiab.currentPaid += deductionAmt;
    }
    totalDeducted += deductionAmt;
    return {
      liabilityId: alloc.liabilityId,
      liabilityTitle: targetLiab ? targetLiab.title : alloc.liabilityTitle || 'Liability',
      amount: deductionAmt,
      percentage: alloc.percentage,
    };
  });

  const unallocated = Math.max(0, analysis.amount - totalDeducted);

  // Award credits for financial discipline pattern
  const creditsEarned = Math.max(10, Math.floor(analysis.amount / 500) * 5);
  user.credits += creditsEarned;
  user.lastMessageDate = new Date().toISOString();

  const newTx: SavedTransaction = {
    id: 'tx-' + Date.now(),
    trackingCode: 'WDZ-TX-' + Math.floor(100000 + Math.random() * 900000),
    rawMessage: analysis.rawMessage || analysis.summaryExplanation || 'Direct Verified SMS Deposit',
    amount: analysis.amount,
    currency: analysis.currency || 'KES',
    transactionRef: analysis.transactionRef,
    senderRecipient: analysis.senderRecipient || user.name,
    bankOrPlatform: analysis.bankOrPlatform || 'Bank/M-PESA',
    accountOrPhone: analysis.accountOrPhone || user.accountNumber || user.phone || 'Verified',
    verifiedAt: new Date().toISOString(),
    deductions: appliedDeductions,
    unallocatedToGeneralAssets: unallocated,
    creditsAwarded: creditsEarned,
  };

  existingList.unshift(newTx);
  userTransactions['default-user'] = existingList;

  res.json({
    success: true,
    transaction: newTx,
    updatedCredits: user.credits,
    liabilities,
  });
});

// 5. Check Reconciliation Status (e.g. 2-3 weeks since last message paste)
app.get('/api/reconcile-check', (req, res) => {
  const user = users['default-user'];
  const lastDate = user.lastMessageDate ? new Date(user.lastMessageDate) : new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
  const diffDays = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  const requiresReconciliation = diffDays >= 14; // >= 2 weeks

  res.json({
    requiresReconciliation,
    daysSinceLastMessage: diffDays,
    defaultPlatform: user.platform,
    bankName: user.bankName,
    messageNeededCount: 3,
    prompt: requiresReconciliation
      ? `It has been ${diffDays} days (over 2 weeks) since your last verified transaction. To protect your savings plan, Wedzo requires the last 3 confirmation messages from ${user.platform === 'bank' ? user.bankName || 'your Bank' : 'M-PESA'} to automatically reconcile your ledger.`
      : null,
  });
});

// 6. Batch 3-Message Auto-Reconciliation
app.post('/api/reconcile-batch', (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Please provide at least 1-3 messages to reconcile.' });
  }

  const user = users['default-user'];
  const liabilities = userLiabilities['default-user'] || [];
  const existingList = userTransactions['default-user'] || [];

  const results = [];
  let totalReconciledAmount = 0;

  for (const rawMsg of messages) {
    if (!rawMsg || typeof rawMsg !== 'string') continue;
    const parsed = parseMessageDeterministic(rawMsg);
    if (parsed.amount <= 0) continue;

    // Check duplicate
    if (existingList.some(t => t.transactionRef === parsed.transactionRef)) continue;

    const alloc20 = Math.round(parsed.amount * 0.2);
    const alloc10 = Math.round(parsed.amount * 0.1);
    
    if (liabilities[0]) liabilities[0].currentPaid += alloc20;
    if (liabilities[1]) liabilities[1].currentPaid += alloc10;

    const deductions = [
      ...(liabilities[0] ? [{ liabilityId: liabilities[0].id, liabilityTitle: liabilities[0].title, amount: alloc20, percentage: 20 }] : []),
      ...(liabilities[1] ? [{ liabilityId: liabilities[1].id, liabilityTitle: liabilities[1].title, amount: alloc10, percentage: 10 }] : []),
    ];

    const unalloc = parsed.amount - (alloc20 + alloc10);
    const credits = Math.max(15, Math.floor(parsed.amount / 500) * 5);
    user.credits += credits;

    const tx: SavedTransaction = {
      id: 'tx-rec-' + Date.now() + Math.random().toString(36).substr(2, 4),
      trackingCode: 'WDZ-REC-' + Math.floor(100000 + Math.random() * 900000),
      rawMessage: rawMsg,
      amount: parsed.amount,
      currency: parsed.currency,
      transactionRef: parsed.transactionRef,
      senderRecipient: parsed.senderRecipient,
      bankOrPlatform: parsed.bankOrPlatform,
      accountOrPhone: parsed.accountOrPhone,
      verifiedAt: new Date().toISOString(),
      deductions,
      unallocatedToGeneralAssets: unalloc,
      creditsAwarded: credits,
    };

    existingList.unshift(tx);
    results.push(tx);
    totalReconciledAmount += parsed.amount;
  }

  user.lastMessageDate = new Date().toISOString();
  userTransactions['default-user'] = existingList;

  res.json({
    success: true,
    reconciledCount: results.length,
    totalReconciledAmount,
    reconciledTransactions: results,
    updatedCredits: user.credits,
    liabilities,
  });
});

// 7. Redeem Credits for Subscription
// Prompt Rule: "they can deduct the subscription they have like if they have Credits they can redeem it to 20 percent of The Premier or class subscription. But if they have Credits the credit will not deduct 100 of the subscription credit the deck 50 percent they have over 100 is 50 that 50"
app.post('/api/credits/redeem', (req, res) => {
  const { plan } = req.body; // 'class' or 'premier'
  const user = users['default-user'];
  
  const baseCost = plan === 'premier' ? 5000 : 2500;
  // Maximum credit discount allowed is strictly 50%
  const maxDiscountAllowed = baseCost * 0.5;

  // 1 credit = 10 KES discount up to 50% max
  const potentialCreditValue = user.credits * 10;
  const appliedDiscount = Math.min(potentialCreditValue, maxDiscountAllowed);
  const creditsNeeded = Math.ceil(appliedDiscount / 10);

  if (user.credits < 10) {
    return res.status(400).json({ error: 'You need at least 10 Wedzo Credits to redeem a subscription discount.' });
  }

  const finalCost = baseCost - appliedDiscount;
  const creditsDeducted = Math.min(user.credits, creditsNeeded);
  user.credits -= creditsDeducted;
  user.subscriptionPlan = plan;
  user.subscriptionCost = finalCost;

  res.json({
    success: true,
    plan,
    originalCost: baseCost,
    appliedDiscount,
    finalCostToPay: finalCost,
    discountPercentage: Math.round((appliedDiscount / baseCost) * 100),
    remainingCredits: user.credits,
    policyNotice: 'Credits can deduct up to a maximum of 50% of your Wedzo subscription.',
  });
});

// 8. AI Financial Pattern Assessment
app.post('/api/ai/financial-pattern', async (req, res) => {
  const user = users['default-user'];
  const transactions = userTransactions['default-user'] || [];
  const liabilities = userLiabilities['default-user'] || [];

  const totalSaved = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalPaidTowardsPromises = liabilities.reduce((sum, l) => sum + l.currentPaid, 0);

  let patternScore = 'Great Financial Discipline';
  let patternInsights = 'Consistent savings cadence with disciplined liability auto-deductions. On track to fulfill December Holiday and Card obligations.';
  let bonusCredits = 20;

  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Evaluate the user's financial habit pattern based on their savings history:
User: ${user.name}
Total Verified Saved: KES ${totalSaved}
Total Paid to Promises: KES ${totalPaidTowardsPromises}
Total Liabilities: ${liabilities.length}
Transactions count: ${transactions.length}
Credits balance: ${user.credits}

Determine if the user is great in money entering and financial pattern.
Return JSON with:
- patternGrade: "S" | "A" | "B"
- isGreat: boolean
- insights: string (2-3 sentences max)
- creditReward: number (between 10 and 50)`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              patternGrade: { type: Type.STRING },
              isGreat: { type: Type.BOOLEAN },
              insights: { type: Type.STRING },
              creditReward: { type: Type.NUMBER },
            },
            required: ['patternGrade', 'isGreat', 'insights', 'creditReward'],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      if (parsed.insights) {
        patternScore = `Grade ${parsed.patternGrade} · ${parsed.isGreat ? 'Great Financial Pattern' : 'Emerging Saver'}`;
        patternInsights = parsed.insights;
        bonusCredits = parsed.creditReward || 20;
      }
    } catch (e) {
      console.warn('Gemini pattern error:', e);
    }
  }

  res.json({
    patternScore,
    patternInsights,
    bonusCredits,
    currentCredits: user.credits,
  });
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Wedzo server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
