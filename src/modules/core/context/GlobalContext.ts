import { Spec } from 'immutability-helper';
import React from 'react';

export type UrlMode = 'USD' | 'BRL' | string | null | undefined;
export type CurrencyType = { currency: string, symbol: string };

export interface GlobalContextType {
    debug: boolean;
    isBot: boolean;
    urlMode: UrlMode;
    currency: CurrencyType;
    currencyOptions: CurrencyType[];
    setCurrency: (currency: string) => void;
    setContext: ($spec: Spec<GlobalContextType>) => void;
}

export default React.createContext<GlobalContextType>({} as any);