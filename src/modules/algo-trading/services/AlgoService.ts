import { AlgoFunction, AlgoInputs } from '@/modules/algo-trading/models/AlgoInputs';
import { AlgoResult, AlgoResultPerformance, AlgoResultSummary } from '@/modules/algo-trading/models/AlgoResult';
import { AlgoState, initAlgoMessages } from '@/modules/algo-trading/models/AlgoState';
import { AlgoWorkspace } from '@/modules/algo-trading/models/AlgoWorkspace';
import { AssetPortfolio } from '@/modules/algo-trading/models/AssetPortfolio';
import { AssetTrade, AssetTradeSide } from '@/modules/algo-trading/models/AssetTrade';
import { AssetDataFlat } from '@/modules/asset-data/models/AssetData';
import { AssetDataService } from '@/modules/asset-data/services/AssetDataService';
import { Globals } from '@/modules/core/modles/Globals';
import { addDate, averageDatesPerYear, dateToIsoStr, getErrorMsg, mutableUpdate, normalizeTimezone } from '@utils/index';
import { Spec } from 'immutability-helper';
import { cloneDeep, groupBy, maxBy, minBy, round, sortBy, uniqBy } from 'lodash-es';
import { inject, injectable } from 'tsyringe';

@injectable()
export class AlgoService {
  state!: AlgoState;
  workspace: AlgoWorkspace = new AlgoWorkspace();
  workspaceListeners: Record<string, Function[]> = {};

  dateRange: Date[] = [];
  assetTimeSeries: Record<string, AssetDataFlat[]>= {};

  result?: AlgoResult;

  constructor(@inject(AssetDataService) private assetDataService: AssetDataService) {}

  onUpdate?: (state: AlgoState) => any;

  init(onUpdate?: (state: AlgoState) => any) {
    this.onUpdate = onUpdate;
    return this;
  }

  async start(inputs: AlgoInputs, algo: AlgoFunction) {
    if (this.state?.status === 'running') return;

    const emitEvent = (event: string, ...args: any[]) =>
      new Promise((next, reject) => this.workspace.emit(event, next, ...args));

    this.onUpdate?.({
      status: 'running',
      messages: initAlgoMessages(),
    } as any);

    // Fetch AssetData

    const assetCodes = inputs.assetCodes.toString();
    this.assetTimeSeries = await this.assetDataService.getFlat(assetCodes, inputs.start, inputs.end);

    if (!Object.values(this.assetTimeSeries).length)
      throw new Error(`No asset data found: ${assetCodes}`);

    // Check Dates

    const firstAsset = this.getFirstAsset();
    const firstAssetDate = firstAsset && new Date(firstAsset.date);
    const lastAsset = this.getLastAsset();
    const lastAssetDate = lastAsset && new Date(lastAsset.date);

    if (firstAssetDate == null || lastAssetDate == null)
      throw new Error(`Invalid asset dates: ${firstAssetDate?.toISOString()} - ${lastAssetDate?.toISOString()}`);

    firstAssetDate.setHours(0, 0, 0, 0);
    lastAssetDate.setHours(23, 59, 59, 999);

    const oldDataMsgs: string[] = [];
    for (let asset of inputs.assetCodes) {
      const lastAsset = this.getLastAsset(asset);
      const lastAssetDate = lastAsset && new Date(lastAsset.date);
      const isOldData = lastAssetDate && (lastAssetDate < addDate(inputs.end, -10));
      if (isOldData) oldDataMsgs.push(`[${asset}] Last date (${dateToIsoStr(lastAssetDate)}) is older then requested date range (${dateToIsoStr(inputs.end)})`);
    }

    // TODO: review? e.g. EURUSD=X 2023-10-22 domingo
    // this.dateRange = businessDaysRange(firstAssetDate, lastAssetDate);
    this.dateRange = sortBy(Object.keys(this.assetTimeSeries).map(e => normalizeTimezone(new Date(e))));

    // Validate Currencies

    const diffCurrencies = uniqBy(Object.values(this.assetTimeSeries).flatMap(e => e).filter(a => a.currency !== inputs.currency), a => a.assetCode);
    const diffCurrenciesMsg = diffCurrencies.length && `Currency mismatch! Continue if you want to ignore the currency, or change the platform currency (${inputs.currency}), or convert "${diffCurrencies.map(a => a.assetCode).join(', ')}" to "${diffCurrencies.map(a => Globals.ticker.changeCurrency(a.assetCode, inputs.currency)).join(', ')}"`;

    // Reset State

    this.state = new AlgoState(firstAssetDate, lastAssetDate, inputs, algo.toString());
    this.workspace = new AlgoWorkspace();
    this.updateState({
      status: { $set: 'running' },
      progress: { $set: 0 },
      messages: { warnings: { $push: [...oldDataMsgs, diffCurrenciesMsg].filter(e => !!e) as string[] } },
    });

    try {
      // Bootstrap Algo

      await algo.call(this.workspace);
      this.workspaceListeners = (this.workspace as any).listeners;

      // Add Error Handling to Listeners
      const listeners = Object.values(this.workspaceListeners);
      listeners.forEach(event => {
        event.forEach((fn, i, arr) => {
          arr[i] = async (...args: any[]) => {
            try {
              return await fn(...args);
            } catch (err: any) {
              this.haltSimulation(err);
            }
          }
        });
      });

      this.workspace.init({
        date: addDate(this.dateRange[0], -1),
        length: this.dateRange.length,
        inputs: inputs,
        injectCash: (cash: number) => this.state.portfolio.injectCash(cash),
      });

      if ('start' in this.workspaceListeners) {
        await emitEvent('start', cloneDeep(this.assetTimeSeries));
        this.updateState({ messages: { messages: { $push: this.workspace.messages } } });
      }

      // Iterate TimeSeries

      for (let i in this.dateRange) {
        const date = this.dateRange[i];
        const dateStr = dateToIsoStr(date);

        const assets = this.assetTimeSeries[dateStr];

        this.refreshPortfolio(date, assets);

        if (this.state.status !== 'running') break;

        if (assets == null) {
          this.updateState({ portfolioHist: { $push: [this.state.portfolio.clone(date)] } });
          continue;
        }

        // Run Algo

        this.workspace.send({
          date,
          assets,
          portfolio: this.state.portfolio,
          index: +i+1,
        });

        const progress = this.workspace.index / this.workspace.length;

        this.updateState({
          progress: { $set: progress },
        });

        await emitEvent('data');

        // Update Portfolio

        if (this.workspace.orders.length > 0) {
          const { portfolio, errors } = this.updatePortfolio(date, this.workspace.orders, assets);

          if (errors?.length && 'error' in this.workspaceListeners)
            await emitEvent('error', cloneDeep(errors));

          this.updateState({
            messages: { messages: { $push: this.workspace.messages } },
            portfolioHist: { $push: [portfolio] },
            tradeHist: { [dateStr]: { $set: this.workspace.orders } },
            errors: { [dateStr]: { $set: errors } },
          });
        } else {
          this.updateState({
            messages: { messages: { $push: this.workspace.messages } },
            portfolioHist: { $push: [this.state.portfolio.clone(date)] },
          });
        }
      }

      // Close Positions

      const closingDate = addDate(lastAssetDate, 1);
      const closingDateStr = dateToIsoStr(closingDate);
      const { orders, portfolio, errors } = this.closePositions(closingDate, this.assetTimeSeries[dateToIsoStr(lastAssetDate)]);
      this.updateState({
        portfolioHist: { $push: [portfolio] },
        tradeHist: { [closingDateStr]: { $set: orders } },
        errors: { [closingDateStr]: { $set: errors } },
      });

      // Results

      if (this.state.status === 'error') return;

      this.result = this.calcResult();

      if ('end' in this.workspaceListeners) {
        this.workspace.messages = [];
        await emitEvent('end', cloneDeep(this.result));
        this.updateState({ messages: { messages: { $push: this.workspace.messages } } });
      }

      this.updateState({ status: { $set: 'stopped' } });

      return this.result;
    } catch (err: any) {
      this.haltSimulation(err);
    } finally {
      this.workspace.unloadScripts();
    }
  }

  async startEval(inputs: AlgoInputs, algoCode: string) {
    this.validateCode(algoCode);

    function evalAsync(str: string) {
      return new Promise(async (start, reject) => {
        try {
          return eval(`(async () => {
            try {
              ${str}
            } catch (err) {
              reject(err);
            }
          })();`);
        } catch (err) {
          reject(err);
        }
      });
    }

    async function algo(this: any) { await evalAsync.bind(this)(algoCode); }

    return await this.start(inputs, algo);
  }

  stop() {
    this.updateState({ status: { $set: 'stopped' } });
  }

  private updateState($spec: Spec<AlgoState>) {
    // this.state = update(this.state, $spec);
    this.state = mutableUpdate(this.state, $spec);
    this.onUpdate?.(this.state);
  }

  private refreshPortfolio(date: Date, assets: AssetDataFlat[]) {
    const portfolio = this.state.portfolio;

    const portAssets = Object.values(portfolio.assets);

    // Enrich asset if has gap
    for (let portAsset of portAssets) {
      const asset = assets?.find(a => a.assetCode === portAsset.assetCode);
      if (asset != null) {
        portAsset.value = asset.value;
        portAsset.currency = asset.currency ?? this.state.inputs.currency;
      }
      else if (portAsset.value == null) {
        const lastestAsset = this.getLatestAsset(portAsset.assetCode, date);
        portAsset.value = lastestAsset.value;
        portAsset.currency = lastestAsset.currency ?? this.state.inputs.currency;

      }
    }

    if (portfolio.remainingMargin < 0)
      this.haltSimulation(`Insufficient Margin (margin: ${portfolio.margin}, min: ${portfolio.minMargin}, remaining: ${portfolio.remainingMargin})`);

    return;
  }

  private updatePortfolio(date: Date, orders: AssetTrade[], assets: AssetDataFlat[]) {
    const portfolio = this.state.portfolio.clone(date);

    const errors: string[] = [];

    for (let order of orders) {
      const asset = assets.find(a => a.assetCode === order.assetCode) || this.getLatestAsset(order.assetCode, date);

      let portAsset = portfolio.assets[order.assetCode];

      if (order.side === AssetTradeSide.Buy) {
        const shortQnt = portAsset.quantity < 0 ? Math.min(order.quantity, -portAsset.quantity) : 0;
        const longQnt = order.quantity - shortQnt;

        // buy to cover

        if (portAsset.quantity < 0) {
          const profit = shortQnt * (portAsset.avgPrice - asset.value);
          portfolio.cash += profit;
          portfolio.profit += profit;
          portAsset.quantity += shortQnt;

          if (portAsset.quantity === 0)
            portAsset = portfolio.resetAsset(order.assetCode);
        }

        // long buy

        if (longQnt > 0) {
          const tradeAmount = longQnt * asset.value;

          if (portfolio.cash < tradeAmount) {
            errors.push(`Not enough cash for ${order.assetCode}:${order.side}:${order.quantity} (${round(portfolio.cash, 2)} < ${round(tradeAmount, 2)})`);
            order.status = 'cancelled';
            continue;
          }

          portfolio.cash -= tradeAmount;
          const totalAmount = portAsset.quantity * portAsset.avgPrice;
          portAsset.value = asset.value;
          portAsset.quantity += longQnt;
          portAsset.avgPrice = (totalAmount + tradeAmount) / portAsset.quantity;
        }
      } else if (order.side === AssetTradeSide.Sell) {
        const longQnt = portAsset.quantity > 0 ? Math.min(order.quantity, portAsset.quantity) : 0;
        const shortQnt = order.quantity - longQnt;

        // long sell

        if (portAsset.quantity > 0) {
          const tradeAmount = longQnt * asset.value;

          portfolio.cash += tradeAmount;
          portfolio.profit += longQnt * (asset.value - portAsset.avgPrice);
          portAsset.quantity -= longQnt;

          if (portAsset.quantity === 0)
            portAsset = portfolio.resetAsset(order.assetCode);
        }

        // short sell

        if (shortQnt > 0) {
          const tradeAmount = shortQnt * asset.value;

          if (portfolio.margin < tradeAmount) {
            errors.push(`Not enough quantity or margin for ${order.assetCode}:${order.side}:${order.quantity} (${portfolio.margin} < ${tradeAmount})`);
            order.status = 'cancelled';
            continue;
          }

          const totalAmount = -portAsset.quantity * portAsset.avgPrice;
          portAsset.value = asset.value;
          portAsset.quantity -= shortQnt;
          portAsset.avgPrice = (totalAmount + tradeAmount) / (-portAsset.quantity);
        }
      }

      order.status = 'filled';
    }

    return {
      portfolio,
      errors,
    };
  }

  private calcResult(): AlgoResult {
    const realTotal = (portfolio: AssetPortfolio) => portfolio.total - portfolio.injectedCash;

    const performance: AlgoResultPerformance[] = [];

    const portfolioHist = this.state.portfolioHist;
    const portfolio = this.state.portfolio;

    // Performance

    const init = portfolioHist[0];
    const initValue = realTotal(init);

    let topMax = initValue;

    // let ytdIndex: number | undefined;
    // let last12Index: number | undefined;

    for (let i = 0; i < portfolioHist.length; i++) {
      const current = portfolioHist[i];
      const prev = i > 0 ? portfolioHist[i - 1] : current;

      // Hist Variation

      const prevValue = realTotal(prev);
      const currentValue = realTotal(current);

      const prevVariation = i > 0 ? (currentValue - prevValue) / prevValue : 0;
      const initVariation = (currentValue - initValue) / initValue;

      if (currentValue > topMax) topMax = currentValue;
      const drawdown = (currentValue - topMax) / topMax;

      // Date Variation

      // const isNewYTD = ytdIndex == null || (current.date.getFullYear() !== portfolioHist[ytdIndex].date.getFullYear());
      // if (isNewYTD) ytdIndex = i;
      // const ytdValue = realTotal(portfolioHist[ytdIndex!]);

      // if (last12Index == null) {
      //   last12Index = i;
      // } else {
      //   const lastYearSameDay = new Date(current.date.getFullYear() - 1, current.date.getMonth(), current.date.getDate());
      //   if (lastYearSameDay > portfolioHist[last12Index].date) last12Index += 1;
      // }
      // const last12Value = realTotal(portfolioHist[last12Index!]);

      // const ytdVariation = (currentValue - ytdValue) / ytdValue;
      // const last12Variation = (currentValue - last12Value) / last12Value;
      
      performance.push({
        date: current.date,
        value: currentValue,
        prevVariation,
        initVariation,
        drawdown,
      });
    }

    // Summary

    const initCash = portfolioHist[0].baseCash;
    const finalCash = portfolio.cash;

    const totalVar = round(performance[performance.length - 1].initVariation, 4);

    const dateRange = portfolioHist.length;
    const avgDaysPerYear = averageDatesPerYear(portfolioHist.map(e => e.date)) || 260;
    const annualVar = round(Math.pow(1 + totalVar, avgDaysPerYear / dateRange) - 1, 4);

    const high = Math.max(...portfolioHist.map(e => e.total));
    const low = Math.min(...portfolioHist.map(e => e.total));

    const nTrades = Object.values(this.state.tradeHist).flatMap(e => e).filter(t => t.status === 'filled').length;

    const summary: AlgoResultSummary = {
      initCash,
      finalCash,
      totalVar,
      annualVar,
      high,
      low,
      nTrades,
    };

    const assetHist = groupBy(
      portfolioHist.flatMap(e => Object.values(e.assets).map(f => ({ ...f, date: e.date })))
    , e => e.assetCode);

    return {
      inputs: this.state.inputs,
      code: this.state.code,
      summary,
      performance,
      portfolio,
      portfolioHist,
      assetHist,
      tradeHist: this.state.tradeHist,
    };
  }

  private getFirstAsset(assetCode?: string) {
    const assets = Object.values(this.assetTimeSeries).filter(e => assetCode == null || e.some(f => f.assetCode === assetCode));
    const firsts = assets[0];
    const first = assetCode != null ? firsts.find(e => e.assetCode === assetCode) : minBy(firsts, e => e.date.getTime());
    return first;
  }

  private getLastAsset(assetCode?: string) {
    const assets = Object.values(this.assetTimeSeries).filter(e => assetCode == null || e.some(f => f.assetCode === assetCode));
    const lasts = assets[assets.length - 1];
    const last = assetCode != null ? lasts.find(e => e.assetCode === assetCode) : maxBy(lasts, e => e.date.getTime());
    return last;
  }

  private getLatestAsset(assetCode: string, date: Date): AssetDataFlat {
    // Find the index of the date in the dateRange array
    let dateIndex = this.dateRange.findIndex(d => dateToIsoStr(d) === dateToIsoStr(date));
    if (dateIndex < 0) dateIndex = this.dateRange.length - 1;

    // Iterate backwards from the date's index to find the latest asset value
    for (let i = dateIndex; i >= 0; i--) {
      const currentDate = this.dateRange[i];
      const asset = this.assetTimeSeries[dateToIsoStr(currentDate)]?.find(a => a.assetCode === assetCode);
      if (asset != null) return asset;
    }

    throw new Error(`Asset value not found for the given date range (${date}:${assetCode})`);
  }

  private closePositions(date: Date, assets: AssetDataFlat[]) {
    const orders: AssetTrade[] = Object.values(this.state.portfolio.assets).map(a => ({
      assetCode: a.assetCode,
      quantity: Math.abs(a.quantity),
      side: a.quantity > 0 ? AssetTradeSide.Sell : AssetTradeSide.Buy,
    })).filter(e => e.quantity !== 0);

    const { portfolio, errors } = this.updatePortfolio(date, orders, assets);

    return {
      orders,
      portfolio,
      errors,
    };
  }

  private haltSimulation(msg: string | Error) {
    console.error(msg);
    this.updateState({ status: { $set: 'error' }, messages: { warnings: { $push: [`[Halting] ${getErrorMsg(msg)}`] } } });
  }

  private validateCode(code: string) {
    const listenerMatches = code.match(/this\s*\.\s*on/g)?.length;
    const nextMatches = code.match(/next\s*\(\s*\)/g)?.length;
    if (listenerMatches !== nextMatches) throw new Error('[Invalid Code] Each listener (this.on) should have a corresponding next() call');

    const dataListenerMatches = code.match(/this\s*\.\s*on\s*\(\s*['"]data/g)?.length;
    if (dataListenerMatches !== 1) throw new Error('[Invalid Code] Should have one data listener: this.on(\'data\')');
  }
}
