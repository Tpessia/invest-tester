import { initialCode } from '@/modules/algo-trading/models/AlgoInputs';
import { AlgoService } from '@/modules/algo-trading/services/AlgoService';
import { AssetType } from '@/modules/asset-data/models/AssetType';
import { AssetDataService } from '@/modules/asset-data/services/AssetDataService';
import { testCodeBuySell } from '@/tests/test-data';
import { container } from 'tsyringe';
import { expect, test } from 'vitest';

test('trade-init-code', async () => {
  const assetDataService = container.resolve(AssetDataService);
  const algoService = container.resolve(AlgoService);

  const data = await assetDataService.getFlat(AssetType.Selic, new Date(), new Date());
  const dataArr = Object.values(data);

  const code = initialCode
    .replace(/\smath\./g, 'window.math.')
    .replace(/console\..*/g, '')
    .replace(/this.download.*/g, '');

  const result = await algoService.startEval({
    currency: 'BRL',
    assetCodes: [AssetType.Selic],
    initCash: 3000,
    start: dataArr[0][0].date,
    end: dataArr[dataArr.length - 1][0].date,
    enableLeverage: true,
    initMargin: 0.5,
    minMargin: 0.3,
  }, code);

  const cash = result?.portfolioHist[result.portfolioHist.length - 1].cash;

  expect(cash).toBeGreaterThan(0);
}, { timeout: 5 * 1000 });

test('trade-buy-sell', async () => {
  const assetDataService = container.resolve(AssetDataService);
  const algoService = container.resolve(AlgoService);

  const data = await assetDataService.getFlat(AssetType.Selic, new Date(), new Date());
  const dataArr = Object.values(data);

  const result = await algoService.startEval({
    currency: 'BRL',
    assetCodes: [AssetType.Selic],
    initCash: 3000,
    start: dataArr[0][0].date,
    end: dataArr[dataArr.length - 1][0].date,
    enableLeverage: true,
    initMargin: 0.5,
    minMargin: 0.3,
  }, testCodeBuySell);
  const cash = result?.portfolioHist[result.portfolioHist.length - 1].cash;

  expect(cash).toBe(3004);
}, { timeout: 5 * 1000 });
