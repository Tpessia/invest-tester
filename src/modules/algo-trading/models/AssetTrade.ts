export interface AssetTrade {
  assetCode: string;
  quantity: number;
  side: AssetTradeSide;
  status?: 'filled' | 'cancelled';
}

export enum AssetTradeSide {
  Buy = 'Buy',
  Sell = 'Sell',
}

export type AssetTradeHistory = Record<string, AssetTrade[]>;
