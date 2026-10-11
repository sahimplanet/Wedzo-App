export interface SampleSMS {
  title: string;
  source: string;
  serviceCategory: 'mpesa' | 'bank' | 'matched_pair';
  description: string;
  text: string;
  correspondingMpesaText?: string;
  referenceCode: string;
}

export const SAMPLE_MESSAGES: SampleSMS[] = [
  {
    title: 'M-Shwari Lock Savings Deposit (KSh 15,000)',
    source: 'M-PESA / M-Shwari',
    serviceCategory: 'mpesa',
    description: 'Direct deposit into M-Shwari Lock Savings for goal lock-in',
    referenceCode: 'SLK89201LK',
    text: 'SLK89201LK Confirmed. Ksh15,000.00 transferred to your M-Shwari Lock Savings Account on 11/10/26 at 10:15 AM. Lock duration: 6 Months. Interest rate 6.5% p.a. New Lock Balance is Ksh45,000.00.',
  },
  {
    title: 'M-PESA Cash Received (KSh 5,000)',
    source: 'M-PESA',
    serviceCategory: 'mpesa',
    description: 'Standard peer deposit for savings allocation',
    referenceCode: 'QKA8291KLM',
    text: 'QKA8291KLM Confirmed. Ksh5,000.00 received from WANJIKU KAMAU 0722123456 on 11/10/26 at 2:15 PM. New M-PESA balance is Ksh19,500.00. Transaction cost, Ksh0.00.',
  },
  {
    title: 'Ziidi Trader Investment Deposit (KSh 25,000)',
    source: 'Ziidi Trader',
    serviceCategory: 'mpesa',
    description: 'Verified investment deposit into Ziidi Trader platform',
    referenceCode: 'ZDT90214TR',
    text: 'ZDT90214TR Confirmed. Ksh25,000.00 allocated to Ziidi Trader Portfolio Account 889102 on 11/10/26 at 11:42 AM. Portfolio value Ksh72,400.00.',
  },
  {
    title: 'KCB M-PESA Savings (KSh 10,000)',
    source: 'KCB M-PESA',
    serviceCategory: 'mpesa',
    description: 'KCB M-PESA fixed target savings contribution',
    referenceCode: 'KCB77412QP',
    text: 'KCB77412QP Confirmed. Ksh10,000.00 deposited into KCB M-PESA Fixed Savings Account 1198234812 on 11/10/26 at 4:20 PM. Available Savings Ksh60,000.00.',
  },
  {
    title: 'Equity Bank Alert (KSh 30,000)',
    source: 'Equity Bank',
    serviceCategory: 'bank',
    description: 'Equity Bank deposit from mobile money clearing',
    referenceCode: 'EQ82736192',
    text: 'Dear Customer, your Equity Bank A/C 01802938172 has been credited with KES 30,000.00 on 11-OCT-2026 09:30 AM. Ref: EQ82736192. Available Balance KES 145,200.00.',
  },
  {
    title: 'Matched Transfer: M-Pesa to Absa Bank (KSh 20,000)',
    source: 'Matched Pair (M-Pesa + Absa Bank)',
    serviceCategory: 'matched_pair',
    description: 'Demonstrates cross-matching to prevent double-counting of outgoing M-Pesa and incoming Bank deposit!',
    referenceCode: 'MP26101188',
    text: 'Absa Alert: KES 20,000.00 credited to A/C 0304928172 on 11/10/2026 14:32:10 via M-PESA Ref MP26101188. Available balance KES 180,000.00.',
    correspondingMpesaText: 'MP26101188 Confirmed. Ksh20,000.00 sent to Absa Bank Kenya for account 0304928172 on 11/10/26 at 2:31 PM. Fee Ksh65.00. New M-PESA balance Ksh12,300.00.',
  },
];

export const THREE_BATCH_RECONCILIATION_SAMPLES = [
  'QKA1122AA1 Confirmed. Ksh4,500.00 received from DAVID OTIENO 0711223344 on 15/9/26 at 10:00 AM. New M-PESA balance is Ksh18,000.00.',
  'QKB3344BB2 Confirmed. Ksh7,000.00 received from TECH CONTRACT 0722334455 on 18/9/26 at 1:30 PM. New M-PESA balance is Ksh25,000.00.',
  'Absa Alert: KES 15,000.00 credited to A/C 0304928172 on 22/09/2026 09:15:00. Ref: FT2609228811. Available balance KES 160,200.00.',
];

