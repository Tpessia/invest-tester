import { AlgoWorkspace } from '@/modules/algo-trading/models/AlgoWorkspace';

export interface AlgoInputs {
  currency: string;
  assetCodes: string[];
  initCash: number;
  start: Date;
  end: Date;
  enableLeverage: boolean;
  initMargin: number;
  minMargin: number;
}

export type AlgoFunction = (this: AlgoWorkspace) => Promise<void>;

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
