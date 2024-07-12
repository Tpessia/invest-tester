import { AssetHistData } from '@/modules/asset-data/models/AssetData';
import { AssetType } from '@/modules/asset-data/models/AssetType';
import { DataGranularity } from '@/modules/asset-data/models/DataGranularity';
import { addDate, normalizeTimezone } from '@utils/index';

export const assetData = (): AssetHistData[] => [{
  data: [
    { assetCode: AssetType.Selic, date: addDate(normalizeTimezone(new Date('2024-01-06')), -5), value: 1000, currency: 'BRL' },
    { assetCode: AssetType.Selic, date: addDate(normalizeTimezone(new Date('2024-01-06')), -4), value: 1001, currency: 'BRL' },
    { assetCode: AssetType.Selic, date: addDate(normalizeTimezone(new Date('2024-01-06')), -3), value: 1002, currency: 'BRL' },
    { assetCode: AssetType.Selic, date: addDate(normalizeTimezone(new Date('2024-01-06')), -2), value: 1003, currency: 'BRL' },
    { assetCode: AssetType.Selic, date: addDate(normalizeTimezone(new Date('2024-01-06')), -1), value: 1004, currency: 'BRL' },
  ],
  key: AssetType.Selic,
  type: AssetType.Selic,
  granularity: DataGranularity.Day,
  metadata: {},
}];

export const testCodeBuySell = 
`await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/mathjs/6.6.0/math.min.js');

this.on('start', async (next) => {
  const rnd = window.math.randomInt(1, 10); // test loadScript
  next();
});

this.on('data', async (next) => {
  if (this.index === 1)
    this.buy(this.assets[0].assetCode, 1);
  else if (this.index === 2)
    this.sell(this.assets[0].assetCode, 1);
  else
    this.buy(this.assets[0].assetCode, 1);
  next();
});

this.on('error', async (next, errors) => {
  next();
});

this.on('end', async (next, result) => {
  next();
});

start();`;
