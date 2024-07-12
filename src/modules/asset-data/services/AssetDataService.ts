import { AssetData, AssetDataFlat, AssetHistData } from '@/modules/asset-data/models/AssetData';
import { AssetSearchData } from '@/modules/asset-data/models/AssetSearchData';
import AppConfig from '@core/services/AppConfig';
import { HttpService } from '@core/services/HttpService';
import { Dictionary, dateToIsoStr, jsonDateReviver, normalizeTimezone } from '@utils/index';
import { groupBy, sortBy } from 'lodash-es';
import { singleton } from 'tsyringe';

@singleton()
export class AssetDataService {
    async get(assetCodes: string, start: Date, end: Date): Promise<AssetHistData<AssetData>[]> {
        if (!assetCodes) throw new Error('Invalid params: assetCodes');
        if (!start || !end) throw new Error('Invalid params: date');
        if (start > end) throw new Error('Invalid params: start > end');
        if (start > new Date() || end > new Date()) throw new Error('Invalid params: date in the future');

        const data: AssetHistData<AssetData>[] = await HttpService
            .get(`${AppConfig.config.apiUrl}/search`, {
                params: { assetCodes, minDate: dateToIsoStr(start), maxDate: dateToIsoStr(end) },
                responseType: 'text',
            })
            .then(r => JSON.parse(r.data, jsonDateReviver))
            .catch(err => { throw new Error(err?.response?.data ?? err.toString()); });
        data.forEach(e => e.data.forEach(d => d.date = normalizeTimezone(d.date)));

        return data;
    }

    async getFlat(assetCodes: string, start: Date, end: Date): Promise<Dictionary<AssetDataFlat[]>> {
        const assetDataList = await this.get(assetCodes, start, end);
        const assetsFlat: AssetDataFlat[] = assetDataList.flatMap(e => e.data.map(f => ({ ...f, type: e.type, granularity: e.granularity, assetCode: e.key })));
        const assetsFlatSorted = sortBy(assetsFlat, e => e.date);
        const assetTimeSeries = groupBy(assetsFlatSorted, a => dateToIsoStr(a.date));
        return assetTimeSeries;
    }

    async search(ticker: string): Promise<AssetSearchData[]> {
        const modifiersRegex = /[:\*]/;
        if (modifiersRegex.test(ticker)) return [];

        const data: AssetSearchData[] = await HttpService
            .get(`${AppConfig.config.apiUrl}/acao/search?ticker=${ticker}`, { responseType: 'json', timeout: 2000 })
            .catch(err => { throw new Error(err?.response?.data ?? err.toString()); })
            .then(r => r.data);
        return data;
    }
}
