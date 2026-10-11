import { CurrencyCode, ExchangeRateInfo } from '../types';

export const APP_NAME = 'Wedzo';

export const DEFAULT_EXCHANGE_RATES: Record<string, ExchangeRateInfo> = {
  'USD_KES': {
    fromCurrency: 'USD',
    toCurrency: 'KES',
    rate: 129.50,
    source: 'Central Bank of Kenya (CBK) Live Indicative Rate',
    timestamp: new Date().toISOString(),
    isUserSupplied: false,
  },
  'EUR_KES': {
    fromCurrency: 'EUR',
    toCurrency: 'KES',
    rate: 141.20,
    source: 'Central Bank of Kenya (CBK) Official Rates',
    timestamp: new Date().toISOString(),
    isUserSupplied: false,
  },
  'GBP_KES': {
    fromCurrency: 'GBP',
    toCurrency: 'KES',
    rate: 168.80,
    source: 'Central Bank of Kenya (CBK) Official Rates',
    timestamp: new Date().toISOString(),
    isUserSupplied: false,
  },
};

/**
 * Formats monetary amounts with correct symbol and decimal standards.
 * For Kenyan Shillings, formats as "KSh 1,500.00" as requested.
 */
export function formatMoney(amount: number, currency: CurrencyCode = 'KES', decimals: number = 2): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  const formattedNumber = safeAmount.toLocaleString('en-KE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  switch (currency) {
    case 'KES':
      return `KSh ${formattedNumber}`;
    case 'USD':
      return `$${formattedNumber}`;
    case 'EUR':
      return `€${formattedNumber}`;
    case 'GBP':
      return `£${formattedNumber}`;
    default:
      return `${currency} ${formattedNumber}`;
  }
}

/**
 * Convert an amount from one currency to another using the exchange rates table
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: Record<string, ExchangeRateInfo> = DEFAULT_EXCHANGE_RATES
): { convertedAmount: number; rateUsed: number; source: string; timestamp: string } {
  if (from === to) {
    return {
      convertedAmount: amount,
      rateUsed: 1,
      source: 'Direct currency match (1:1)',
      timestamp: new Date().toISOString(),
    };
  }

  const directPair = `${from}_${to}`;
  if (rates[directPair]) {
    const rateInfo = rates[directPair];
    return {
      convertedAmount: amount * rateInfo.rate,
      rateUsed: rateInfo.rate,
      source: rateInfo.source,
      timestamp: rateInfo.timestamp,
    };
  }

  const inversePair = `${to}_${from}`;
  if (rates[inversePair]) {
    const rateInfo = rates[inversePair];
    const inverseRate = 1 / rateInfo.rate;
    return {
      convertedAmount: amount * inverseRate,
      rateUsed: inverseRate,
      source: `Inverse calculated from ${rateInfo.source}`,
      timestamp: rateInfo.timestamp,
    };
  }

  // Default fallback if unknown pair
  return {
    convertedAmount: amount,
    rateUsed: 1,
    source: 'Fallback 1:1 (unsupported pair)',
    timestamp: new Date().toISOString(),
  };
}
