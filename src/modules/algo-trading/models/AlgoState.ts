import { AlgoInputs } from '@/modules/algo-trading/models/AlgoInputs';
import { AssetPortfolio, AssetPortfolioHist, AssetPortfolioItem } from '@/modules/algo-trading/models/AssetPortfolio';
import { AssetTradeHistory } from '@/modules/algo-trading/models/AssetTrade';

export type AlgoStatus = 'stopped' | 'running' | 'error';

export type AlgoMessages = { messages: string[], warnings: string[] };

export const initAlgoMessages = (): AlgoMessages => ({ messages: [], warnings: [] });

export class AlgoState {
  status: AlgoStatus = 'stopped';
  messages: AlgoMessages = initAlgoMessages();
  portfolioHist: AssetPortfolioHist = [];
  tradeHist: AssetTradeHistory = {};
  errors: Record<string, string[]> = {};
  progress: number = 0;

  constructor(public start: Date, public end: Date, public inputs: AlgoInputs, public code: string) {
    const assets = inputs.assetCodes.reduce((acc, assetCode) => ({ ...acc, [assetCode]: { assetCode, quantity: 0, avgPrice: 0, value: 0, currency: '' } }), {} as Record<string, AssetPortfolioItem>);
    this.portfolioHist.push(new AssetPortfolio(start, assets, inputs.initCash, 0, inputs.initMargin, inputs.minMargin, 0));
  }

  get portfolio(): AssetPortfolio {
    return this.portfolioHist[this.portfolioHist.length - 1];
  }
}
