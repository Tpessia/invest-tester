import Decimal from 'decimal.js';
import { uniqBy } from 'lodash-es';
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

export function findBestLogBase(values: number[], round: boolean = true) {
  const min = Math.min(...values.filter(v => v > 0));
  const max = Math.max(...values);

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

  return round ? roundLogBase(bestBase, 10) : bestBase;
}

export function roundLogBase(value: number, base: number = 10): number {
  return Math.pow(base, Math.ceil(Math.log(value) / Math.log(base)));
}

export function generateLogScale(minValue: number, maxValue: number, base: number = 10, steps: number = 5): number[] {
  const start = Math.floor(Math.log(minValue) / Math.log(base));
  const end = Math.ceil(Math.log(maxValue) / Math.log(base));
  const range = end - start;
  const scale = Array.from({length: steps}, (_, i) => {
    const exp = start + (i * range / (steps - 1));
    return Math.pow(base, Math.round(exp));
  });
  return uniqBy(scale, v => v);
}