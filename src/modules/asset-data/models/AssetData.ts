import { AssetType } from '@/modules/asset-data/models/AssetType';
import { DataGranularity } from '@/modules/asset-data/models/DataGranularity';

export interface AssetData {
  assetCode: string;
  date: Date;
  value: number;
  currency?: string;
}

export interface AssetHistData<T extends AssetData = AssetData> {
  key: string;
  type: AssetType;
  granularity: DataGranularity;
  metadata: any;
  data: T[];
}

export type AssetDataFlat<T extends AssetData = AssetData> = T & {
  type: AssetType;
  granularity: DataGranularity;
}