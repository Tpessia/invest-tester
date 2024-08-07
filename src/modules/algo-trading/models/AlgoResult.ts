import { AlgoInputs } from '@/modules/algo-trading/models/AlgoInputs';
import { AssetPortfolio, AssetPortfolioHist, AssetPortfolioItem } from '@/modules/algo-trading/models/AssetPortfolio';
import { AssetTradeHistory } from '@/modules/algo-trading/models/AssetTrade';

export interface AlgoResult {
  inputs: AlgoInputs;
  code: string;
  summary: AlgoResultSummary,
  performance: AlgoResultPerformance[];
  portfolio: AssetPortfolio;
  portfolioHist: AssetPortfolioHist;
  assetHist: Record<string, ({ date: Date } & AssetPortfolioItem)[]>;
  tradeHist: AssetTradeHistory;
}

export interface AlgoResultSummary {
  initCash: number;
  finalCash: number;
  totalVar: number;
  annualVar: number;
  high: number;
  low: number;
  nTrades: number;
  annualStdDev: number;
  maxDrawdown: number;
  sharpe: number;
  alpha?: number;
  beta?: number;
}

export interface AlgoResultPerformance {
  date: Date;
  value: number;
  prevVariation: number;
  initVariation: number;
  drawdown: number;
}
