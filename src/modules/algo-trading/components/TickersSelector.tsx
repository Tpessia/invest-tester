import { AssetDataService } from '@/modules/asset-data/services/AssetDataService';
import { Loading3QuartersOutlined } from '@ant-design/icons';
import { useService, useThrottle } from '@utils/index';
import { AutoComplete, Select, Spin } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { uniq } from 'lodash-es';
import React, { useState } from 'react';
import './TickersSelector.scss';

const minTextLength = 2;

const loadingOption: DefaultOptionType = {
  value: 'NULL',
  disabled: true,
  label: (
    <div className='loading-option'>
      <Spin indicator={<Loading3QuartersOutlined spin />} size="large" />
    </div>
  ),
};

interface MultiProps {
  tickers: string[];
  onChange: (tickers: string[]) => void;
}

function useOptions(onLoad?: Function) {
  const [options, setOptions] = useState<string[]>([]);

  const assetService = useService(AssetDataService);

  const baseOptions: string[] = ['FIXED','SELIC.SA','IMAB.SA','IPCA.SA','LFT/YYYY.SA','LTN/YYYY.SA','NTN-F/YYYY.SA','NTN-B-P/YYYY.SA','NTN-B/YYYY.SA','NTN-C/YYYY.SA','NTN-R/YYYY.SA','NTN-E/YYYY.SA'];

  const handleSearch = useThrottle(async (text: string) => {
    // HttpServiceAbort();

    const data = text.length >= minTextLength ? await assetService.search(text).catch(err => { console.error(err); return []; }) : [];
    onLoad?.();

    const options = baseOptions.concat(data.map(e => e.symbol));
    const filtered = uniq(options.filter(e => text && e.toLowerCase().includes(text.toLowerCase())));
    setOptions(filtered);
  }, 1000, { leading: true });

  return {
    options,
    setOptions,
    handleSearch,
  };
}

const Multi: React.FC<MultiProps> = (props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { options, setOptions, handleSearch } = useOptions(() => setLoading(false));

  return (
    <Select
      mode='tags'
      className='autocomplete'
      value={props.tickers}
      notFoundContent={null}
      // loading={loading}
      allowClear={true}
      options={loading ? [loadingOption] : options.map(e => ({ value: e, label: e }))}
      filterOption={(text, option) => !props.tickers.includes(option?.value as string)}
      onFocus={() => setOptions([])}
      onSelect={(text, option) => setOptions([])}
      onDeselect={(text, option) => setOptions([])}
      onSearch={(text) => { text.length >= minTextLength && setLoading(true); handleSearch(text); }}
      onChange={values => props.onChange(values.map(e => e?.trim()?.toUpperCase()))}
      maxTagCount='responsive'
      // filterSort={}
      // open={options.length !== 0}
    />
  );
};

interface SingleProps {
  ticker: string;
  onChange: (ticker?: string) => void;
}

const Single: React.FC<SingleProps> = (props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { options, setOptions, handleSearch } = useOptions(() => setLoading(false));

  return (
    <AutoComplete
      className='autocomplete'
      value={props.ticker}
      notFoundContent={null}
      allowClear={true}
      options={loading ? [loadingOption] : options.map(e => ({ value: e, label: e }))}
      onFocus={() => setOptions([])}
      onSelect={(text, option) => setOptions([])}
      onDeselect={(text, option) => setOptions([])}
      onSearch={(text) => { text.length >= minTextLength && setLoading(true); handleSearch(text); }}
      onChange={value => props.onChange(value?.trim()?.toUpperCase())}
      maxTagCount='responsive'
    />
  );
};

const TickersSelector = {
  Multi,
  Single,
};

export default TickersSelector;
