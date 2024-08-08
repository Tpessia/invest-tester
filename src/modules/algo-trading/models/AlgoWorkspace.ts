import { AlgoInputs } from '@/modules/algo-trading/models/AlgoInputs';
import { AssetPortfolio } from '@/modules/algo-trading/models/AssetPortfolio';
import { AssetTrade, AssetTradeSide } from '@/modules/algo-trading/models/AssetTrade';
import { AlgoService } from '@/modules/algo-trading/services/AlgoService';
import { AssetDataFlat } from '@/modules/asset-data/models/AssetData';
import { dateToIsoStr, downloadObj, hash, loadScript } from '@utils/index';
import EventLite from 'event-lite';
import { cloneDeep } from 'lodash-es';

export interface AlgoWorkspaceInit {
  inputs: AlgoInputs;
  date: Date;
  length: number;
  injectCash: (amount: number) => void;
}

export interface AlgoWorkspaceSend {
  date: Date;
  assets: AssetDataFlat[];
  portfolio: AssetPortfolio;
  index: number;
}

const validateQuantity = (assetCode: string, quantity: number) => {
  if (quantity == null || quantity === 0 || quantity === Infinity || isNaN(quantity))
    throw new Error(`Invalid quantity ${assetCode}:${quantity}`);
}

export class AlgoWorkspace extends EventLite {
  _algoService?: AlgoService;

  // State

  state: any = {};
  scripts: HTMLScriptElement[] = [];

  // Inputs

  inputs!: AlgoInputs;
  date!: Date;
  assets!: AssetDataFlat[];
  portfolio!: AssetPortfolio;
  index!: number;
  length!: number;

  // Outputs

  injectCash!: (amount: number) => void;
  orders: AssetTrade[] = [];
  messages: string[] = [];

  // Workflow

  init({ date, length, inputs, injectCash }: AlgoWorkspaceInit) {
    this.date = new Date(date.getTime());
    this.inputs = cloneDeep(inputs);
    this.length = length;
    this.injectCash = injectCash;
    this.index = 0;
  }

  send({ date, assets, portfolio, index }: AlgoWorkspaceSend) {
    this.date = new Date(date.getTime());
    this.assets = cloneDeep(assets);
    this.portfolio = cloneDeep(portfolio);
    this.index = index;

    this.orders = [];
    this.messages = [];
  }

  // Trade

  buy(assetCode: string, quantity: number) {
    validateQuantity(assetCode, quantity);
    this.orders.push({ assetCode, quantity, side: AssetTradeSide.Buy });
  }

  sell(assetCode: string, quantity: number) {
    validateQuantity(assetCode, quantity);
    this.orders.push({ assetCode, quantity, side: AssetTradeSide.Sell });
  }

  // Utils

  print(...msgs: string[]) {
    this.messages?.push(`[${dateToIsoStr(this.date)}] ${msgs.join(' ')}`);
  }

  loadScript(path: string) {
    return loadScript(path, `algo-import-${hash(path)}`, ['algo-import']).then(s => this.scripts.push(s));
  }

  unloadScript(id: string) {
    this.scripts = this.scripts.filter(script => {
      if (script == null || script.id === id) {
        script?.remove();
        return false;
      }
      return true;
    });
  }

  unloadScripts() {
    this.scripts.forEach(script => this.unloadScript(script.id));
  }

  download(obj: any, name?: string) {
    return downloadObj(obj, name ?? 'invest-tester');
  }
}
