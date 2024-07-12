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
