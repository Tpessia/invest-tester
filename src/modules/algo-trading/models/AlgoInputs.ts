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

export interface AlgoConfig {
  debug?: boolean;
  algoStr?: string;
  isBenchmark?: boolean;
  riskFreeRate?: number;
  marketBenchmark?: string;
}

export type AlgoFunction = (this: AlgoWorkspace) => Promise<void>;