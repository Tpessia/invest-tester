import { formatCurrency } from '@/modules/@utils';
import { AlgoFunction } from '@/modules/algo-trading/models/AlgoInputs';
import { AlgoWorkspace } from '@/modules/algo-trading/models/AlgoWorkspace';
import { Globals } from '@/modules/core/modles/Globals';
import { sum } from 'lodash-es';

export const initialCode =
`// Load Math.js Library

await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/mathjs/12.4.3/math.min.js');
math.config({ randomSeed: 42 });

this.on('start', async (next, timeseries) => {
  this.print(\`Start (size: \${Object.values(timeseries).length})\`);
  this.state.prevDate = this.date;
  next();
});

this.on('data', async (next) => {
  // Print

  const dateStr = this.date.toISOString().split('T')[0];
  this.print(\`------ \${dateStr} (\${this.index}/\${this.length}) ------\`);
  this.print(
    'cash:', this.portfolio.cash.toFixed(2),
    'equity:', this.portfolio.longValue.toFixed(2),
    'profit:', this.portfolio.profit.toFixed(2)
  );

  // Trade Logic

  // use market data directly to make decisions,
  // or complex tools like a neural network with api
  // calls like fetch('http://localhost:1234/my-python-ai')

  const qnt = 100;

  for (let asset of this.assets) {
    const amount = qnt * asset.value;
    const rnd = math.randomInt(0, 3);

    if (rnd === 0) this.buy(asset.assetCode, qnt);
    else if (rnd === 1) this.sell(asset.assetCode, qnt);
    
    if (rnd !== 2)
      this.print(\`[\${asset.assetCode}] \${rnd === 0 ? 'Buy' : 'Sell'}: \${asset.currency} \${amount.toFixed(2)}\`);
  }

  // Monthly Deposits

  const prevDate = this.state.prevDate;
  const nextMonth = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, prevDate.getDate(), 0, 0, 0);
  const isNewMonth = this.date.getTime() > nextMonth.getTime();

  if (isNewMonth) {
    this.state.prevDate = this.date;
    this.injectCash(10000);
  }

  next();
});

this.on('end', async (next, result) => {
  this.print('End');
  console.log(result);
  // this.download(result, 'result'); // uncomment to download results.json
  next();
});

this.on('error', async (next, errors) => {
  this.print('Error:', JSON.stringify(errors));
  next();
});

start();
`;

export interface StrategyBuyHoldProps {
  assets: { assetCode: string, percentual: number }[];
  initCash: number;
  monthlyDeposits: number;
  start: Date;
  end: Date;
  rebalance: boolean;
  download: boolean;
}

export function strategyBuyHold(props: StrategyBuyHoldProps): AlgoFunction {
  return async function (this: AlgoWorkspace): Promise<void> {
    this.on('start', async (next) => {
      this.state.prevDate = this.date;
      this.state.assetDates = props.assets.reduce((acc, val) => ({
        ...acc,
        [val.assetCode]: {
          start: this._algoService!.getFirstAsset(val.assetCode)!.date,
          end: this._algoService!.getLastAsset(val.assetCode)!.date,
        }
      }), {} as Record<string, { start: Date, end: Date }>);
      next();
    });

    this.on('data', async (next) => {
      const nextMonth = new Date(this.state.prevDate.getFullYear(), this.state.prevDate.getMonth() + 1, this.state.prevDate.getDate(), 0, 0, 0);
      const isNewMonth = this.date.getTime() > nextMonth.getTime();

      if (isNewMonth) {
        this.state.prevDate = this.date;
        if (props.monthlyDeposits) {
          this.print(`Depositing: ${formatCurrency(props.monthlyDeposits)}`);
          this.injectCash(props.monthlyDeposits);
        }
      }

      const totalValue = this.portfolio.total;
      let targetAssetValues = props.assets.reduce((acc, val) => ({ ...acc, [val.assetCode]: totalValue * val.percentual }), {} as Record<string, any>);

      if (props.rebalance) {
        const activeAssets = props.assets.filter(e => this.date >= this.state.assetDates[e.assetCode].start && this.state.assetDates[e.assetCode].end >= this.date);
        const activePercent = sum(activeAssets.map(e => e.percentual));
        targetAssetValues = activeAssets.reduce((acc, val) => ({ ...acc, [val.assetCode]: totalValue * (val.percentual + (1 - activePercent) * (val.percentual / activePercent)) }), {} as Record<string, number>);
      }

      let cash = this.portfolio.cash;
      for (let i in this.assets) {
        const asset = this.assets[i];
        const portAsset = this.portfolio.assets[asset.assetCode];

        const targetValue = targetAssetValues[asset.assetCode] ?? 0;
        const currentValue = (portAsset?.value ?? 0) * (portAsset?.quantity ?? 0);

        const diffAmount = targetValue - currentValue;
        const diffAmountMin = Math.min(diffAmount, cash);

        const diffQnt = diffAmountMin > 0 ? Math.floor(diffAmountMin / asset.value) : Math.ceil(diffAmountMin / asset.value);
        const currency = asset.currency && (Globals.countries.currencyMap[asset.currency]?.symbol ?? asset.currency);

        if (diffQnt > 0) {
          cash -= diffAmountMin;
          const canBuy = props.rebalance || currentValue === 0;
          if (canBuy) {
            this.print(`[${asset.assetCode}] Buying ${diffQnt} x ${formatCurrency(asset.value, { prefix: `${currency} ` })}`);
            this.buy(asset.assetCode, diffQnt);
          }
        } else if (diffQnt < 0) {
          const canRebalance = props.rebalance && isNewMonth;
          if (canRebalance) {
            this.print(`[${asset.assetCode}] Rebalancing: ${diffQnt} x ${formatCurrency(asset.value, { prefix: `${currency} ` })}`);
            this.sell(asset.assetCode, -diffQnt);
          }
        }
      }
      next();
    });

    this.on('end', async (next, result) => {
      if (props.download) this.download(result, 'result');
      next();
    });

    this.on('error', async (next, errors) => {
      this.print('Error:', JSON.stringify(errors));
      next();
    });
  }
}