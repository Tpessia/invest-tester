import Decimal from 'decimal.js';
import { NumericFormatProps, numericFormatter } from 'react-number-format';

// Fix Floating-point arithmetic (https://0.30000000000000004.com/)

export const toPercent = (num: number) => {
  return Decimal.mul(num, 100).toNumber();
};

export const fromPercent = (num: number) => {
  return Decimal.div(num, 100).toNumber();
};

export const toCents = (num: number) => {
  return Decimal.mul(num, 100).toNumber();
};

export const fromCents = (num: number) => {
  return Decimal.div(num, 100).toNumber();
};

// https://0.30000000000000004.com/
export const castPercent = (num: number) => {
  const precision = num.toString().replace('.','').length;
  const result = num / 100;
  return +result.toPrecision(precision);
};

export const formatCurrency = (value: number, config?: NumericFormatProps) => numericFormatter(value.toString(), {
  thousandSeparator: '.',
  decimalSeparator: ',',
  // allowNegative: false,
  fixedDecimalScale: true,
  decimalScale: 2,
  ...config,
});

export function findBestLogBase(values: number[]) {
  const min = Math.min(...values.filter(v => v > 0));
  const max = Math.max(...values);

  // Default to natural log if all values are the same
  if (min === max) return Math.E;

  const bases = [2, Math.E, 10];
  let bestBase = 2;
  let bestSpread = 0;

  for (const base of bases) {
    const minLog = Math.log(min) / Math.log(base);
    const maxLog = Math.log(max) / Math.log(base);
    const spread = maxLog - minLog;

    if (spread > bestSpread) {
      bestSpread = spread;
      bestBase = base;
    }
  }

  return bestBase;
}