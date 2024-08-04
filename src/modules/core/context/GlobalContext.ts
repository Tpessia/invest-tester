import { ChartProps } from '@/modules/core/components/Chart';
import { Globals } from '@/modules/core/modles/Globals';
import { Spec } from 'immutability-helper';
import React from 'react';

export type UrlMode = 'USD' | 'BRL' | string | null | undefined;
export type CurrencyType = { currency: string, symbol: string };

export interface GlobalContextType {
    isBot: boolean;
    urlMode: UrlMode;
    currency: CurrencyType;
    currencyOptions: CurrencyType[];
    setCurrency: (currency: string) => void;
    setContext: ($spec: Spec<GlobalContextType>) => void;
    chartType: ChartProps['type'];
    settings: typeof Globals.settings;
}

export default React.createContext<GlobalContextType>({} as any);