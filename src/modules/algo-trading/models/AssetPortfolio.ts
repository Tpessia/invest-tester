import { cloneDeep, round } from 'lodash-es';

export interface AssetPortfolioItem {
  assetCode: string;
  quantity: number;
  avgPrice: number;
  value: number;
  currency: string;
}

export class AssetPortfolio {
  cash: number;

  constructor(
    public date: Date,
    public assets: Record<string, AssetPortfolioItem>,
    public baseCash: number,
    public injectedCash: number,
    public initMarginPerc: number,
    public minMarginPerc: number,
    public profit: number
  ) {
    this.cash = baseCash;
  }

  get total() {
    return round(this.cash + this.longValue + (this.shortValue - this.shortAvgPrice), 2);
  }

  get longEquities() {
    return Object.values(this.assets).filter(a => a.quantity > 0);
  }

  get longValue() {
    return round(this.longEquities.reduce((acc, val) => {
      if (val.value == null) throw new Error('No asset value');
      return acc + (val.quantity * val.value);
    }, 0), 2);
  }

  get longAvgPrice() {
    return round(this.longEquities.reduce((acc, val) => {
      return acc + (-val.quantity * val.avgPrice);
    }, 0), 2);
  }

  get shortEquities() {
    return Object.values(this.assets).filter(a => a.quantity < 0);
  }

  get shortValue() {
    return round(this.shortEquities.reduce((acc, val) => {
      if (val.value == null) throw new Error('No asset value');
      return acc + (-val.quantity * val.value);
    }, 0), 2);
  }

  get shortAvgPrice() {
    return round(this.shortEquities.reduce((acc, val) => {
      return acc + (-val.quantity * val.avgPrice);
    }, 0), 2);
  }

  get initMargin() {
    return this.initMarginPerc > 0 ? round((this.cash + this.longValue) / this.initMarginPerc, 2) : 0;
  }

  get minMargin() {
    return this.minMarginPerc > 0 ? round(this.shortValue * this.minMarginPerc, 2) : 0;
  }

  get margin() {
    return round(this.initMargin - this.shortValue, 2);
  }

  get remainingMargin() {
    return round(this.margin - this.minMargin, 2);
  }

  clone(date: Date) {
    return new AssetPortfolio(date, cloneDeep(this.assets), this.cash, this.injectedCash, this.initMarginPerc, this.minMarginPerc, this.profit);
  }

  resetAsset(assetCode: string) {
    Object.assign(this.assets[assetCode], { assetCode, quantity: 0, avgPrice: 0 });
    return this.assets[assetCode];
  }

  injectCash(cash: number) {
    this.cash += cash;
    this.injectedCash += cash;
  }
}

export type AssetPortfolioHist = AssetPortfolio[];
