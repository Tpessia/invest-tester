export interface PortfolioInputs {
  assets: { assetCode: string, percentual: number }[];
  initCash: number;
  monthlyDeposits: number,
  start: Date;
  end: Date;
  rebalance: boolean;
}
