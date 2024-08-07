import { sum } from 'lodash-es';

// Measures excess return relative to the benchmark, adjusted for risk
export function calculateAlpha(portfolioReturn: number, beta: number, riskFreeRate: number = 0.02, marketReturn: number = 0.08): number {
  return portfolioReturn - (riskFreeRate + beta * (marketReturn - riskFreeRate));
}

// Measures portfolio volatility relative to the market
export function calculateBeta(portfolioReturns: number[], marketReturns: number[]): number {
  return covariance(portfolioReturns, marketReturns) / variance(marketReturns);
}

// Measures risk-adjusted performance using total risk
export function calculateSharpeRatio(portfolioReturn: number, portfolioStdDev: number, riskFreeRate: number = 0.02): number {
  return (portfolioReturn - riskFreeRate) / portfolioStdDev;
}

// Similar to Sharpe Ratio but only considers downside risk
export function calculateSortinoRatio(portfolioReturn: number, negativeReturns: number[], riskFreeRate: number = 0.02): number {
  const downSideDeviation = standardDeviation(negativeReturns);
  return (portfolioReturn - riskFreeRate) / downSideDeviation;
}

// Measures excess return per unit of market risk (beta)
export function calculateTreynorRatio(portfolioReturn: number, beta: number): number {
  const riskFreeRate = 0.02;
  return (portfolioReturn - riskFreeRate) / beta;
}

// Measures risk-adjusted excess return relative to a benchmark
export function calculateInformationRatio(portfolioReturns: number[], benchmarkReturns: number[]): number {
  const excessReturns = portfolioReturns.map((r, i) => r - benchmarkReturns[i]);
  const averageExcessReturn = excessReturns.reduce((sum, val) => sum + val, 0) / excessReturns.length;
  const trackingError = standardDeviation(excessReturns);
  return averageExcessReturn / trackingError;
}

// Measures how much of a portfolio's performance is explained by the benchmark
export function calculateRSquared(portfolioReturns: number[], marketReturns: number[]): number {
  const correlation = covariance(portfolioReturns, marketReturns) / (standardDeviation(portfolioReturns) * standardDeviation(marketReturns));
  return Math.pow(correlation, 2);
}

// Measures how closely a portfolio follows its benchmark
export function calculateTrackingError(portfolioReturns: number[], benchmarkReturns: number[]): number {
  const excessReturns = portfolioReturns.map((r, i) => r - benchmarkReturns[i]);
  return standardDeviation(excessReturns);
}

// The largest peak-to-trough decline over a specific period
export function calculateMaxDrawdown(values: number[]): number {
  let maxDrawdown = 0;
  let peak = values[0];
  for (const value of values) {
    if (value > peak) {
      peak = value;
    }
    const drawdown = (peak - value) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  return maxDrawdown;
}

// Measures how well a portfolio performs in up and down markets relative to its benchmark
export function calculateUpsideDownsideCapture(portfolioReturns: number[], benchmarkReturns: number[]): { upsideCapture: number; downsideCapture: number } {
  if (portfolioReturns.length !== benchmarkReturns.length)
    throw new Error('Portfolio and benchmark return arrays must be of equal length');

  let upFundSum = 0, upBenchmarkSum = 0, downFundSum = 0, downBenchmarkSum = 0;
  let upCount = 0, downCount = 0;

  for (let i = 0; i < portfolioReturns.length; i++) {
    if (benchmarkReturns[i] > 0) {
      upFundSum += portfolioReturns[i];
      upBenchmarkSum += benchmarkReturns[i];
      upCount++;
    } else {
      downFundSum += portfolioReturns[i];
      downBenchmarkSum += benchmarkReturns[i];
      downCount++;
    }
  }

  const upsideCapture = upCount > 0 ? (upFundSum / upCount) / (upBenchmarkSum / upCount) * 100 : 0;
  const downsideCapture = downCount > 0 ? (downFundSum / downCount) / (downBenchmarkSum / downCount) * 100 : 0;

  return { upsideCapture, downsideCapture };
}

export function covariance(x: number[], y: number[]): number {
  if (x.length !== y.length) throw new Error('Covariance arrays must be of equal length');
  const xMean = x.reduce((sum, val) => sum + val, 0) / x.length;
  const yMean = y.reduce((sum, val) => sum + val, 0) / y.length;
  return x.reduce((sum, xi, i) => sum + (xi - xMean) * (y[i] - yMean), 0) / (x.length - 1);
}

export function variance(x: number[]): number {
  const mean = x.reduce((sum, val) => sum + val, 0) / x.length;
  return x.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (x.length - 1);
}

// Measures the total risk or volatility of returns
export function standardDeviation(x: number[]): number {
  return Math.sqrt(variance(x));
}

export function annualizedStdDev(stdDev: number, dayBase: number = 252): number {
  return stdDev * Math.sqrt(dayBase);
}

export function groupReturns(returns: number[], groupBy: number = 252): number[] {
  const groupedReturns: number[] = [];
  for (let i = 0; i < returns.length; i += groupBy) {
    const group = returns.slice(i, i + groupBy);
    groupedReturns.push(sum(group) / group.length);
  }
  return groupedReturns;
}

export function annualizeReturns(dailyReturns: number[], dayBase: number = 252): number {
  const meanDailyReturn = sum(dailyReturns) / dailyReturns.length;
  return Math.pow(1 + meanDailyReturn, dayBase) - 1;
}