import { AssetData } from '@/modules/asset-data/models/AssetData';

export interface StockData extends AssetData {
    volume: number;
    open: number;
    high: number;
    low: number;
    close: number;
    adjRatio: number;
    adjOpen: number;
    adjHigh: number;
    adjLow: number;
    adjClose: number;
    dividendAmount?: number;
    splitCoefficient?: number;
}
