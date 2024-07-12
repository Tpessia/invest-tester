import { AssetData } from '@/modules/asset-data/models/AssetData';

export interface GovBondData extends AssetData {
    assetType: string;
    maturityDate: Date;
    buyRate: number;
    sellRate: number;
    buyPu: number;
    sellPu: number;
    basePu?: number;
}