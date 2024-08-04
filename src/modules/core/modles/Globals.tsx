import { addDate, getFirstOfYear, normalizeTimezone } from '@utils/index';

const countries = [
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED', symbol: 'د.إ' },
  { code: 'AR', name: 'Argentina', currency: 'ARS', symbol: '$' },
  { code: 'AU', name: 'Australia', currency: 'AUD', symbol: '$' },
  { code: 'AZ', name: 'Azerbaijan', currency: 'AZN', symbol: '₼' },
  { code: 'BG', name: 'Bulgaria', currency: 'BGN', symbol: 'лв' },
  { code: 'BH', name: 'Bahrain', currency: 'BHD', symbol: '.د.ب' },
  { code: 'BN', name: 'Brunei', currency: 'BND', symbol: '$' },
  { code: 'BR', name: 'Brazil', currency: 'BRL', symbol: 'R$' },
  { code: 'CA', name: 'Canada', currency: 'CAD', symbol: '$' },
  { code: 'CH', name: 'Switzerland', currency: 'CHF', symbol: 'Fr.' },
  { code: 'CL', name: 'Chile', currency: 'CLP', symbol: '$' },
  { code: 'CN', name: 'China', currency: 'CNY', symbol: '¥' },
  { code: 'CZ', name: 'Czech Republic', currency: 'CZK', symbol: 'Kč' },
  { code: 'DK', name: 'Denmark', currency: 'DKK', symbol: 'kr' },
  { code: 'EG', name: 'Egypt', currency: 'EGP', symbol: '£' },
  { code: 'EU', name: 'European Union', currency: 'EUR', symbol: '€' },
  { code: 'FJ', name: 'Fiji', currency: 'FJD', symbol: '$' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£' },
  { code: 'HK', name: 'Hong Kong', currency: 'HKD', symbol: '$' },
  { code: 'HU', name: 'Hungary', currency: 'HUF', symbol: 'Ft' },
  { code: 'ID', name: 'Indonesia', currency: 'IDR', symbol: 'Rp' },
  { code: 'IL', name: 'Israel', currency: 'ILS', symbol: '₪' },
  { code: 'IN', name: 'India', currency: 'INR', symbol: '₹' },
  { code: 'JP', name: 'Japan', currency: 'JPY', symbol: '¥' },
  { code: 'KR', name: 'South Korea', currency: 'KRW', symbol: '₩' },
  { code: 'KW', name: 'Kuwait', currency: 'KWD', symbol: 'د.ك' },
  { code: 'LK', name: 'Sri Lanka', currency: 'LKR', symbol: '₨' },
  { code: 'MA', name: 'Morocco', currency: 'MAD', symbol: 'د.م.' },
  { code: 'MG', name: 'Madagascar', currency: 'MGA', symbol: 'Ar' },
  { code: 'MX', name: 'Mexico', currency: 'MXN', symbol: '$' },
  { code: 'MY', name: 'Malaysia', currency: 'MYR', symbol: 'RM' },
  { code: 'NO', name: 'Norway', currency: 'NOK', symbol: 'kr' },
  { code: 'NZ', name: 'New Zealand', currency: 'NZD', symbol: '$' },
  { code: 'OM', name: 'Oman', currency: 'OMR', symbol: 'ر.ع.' },
  { code: 'PE', name: 'Peru', currency: 'PEN', symbol: 'S/' },
  { code: 'PG', name: 'Papua New Guinea', currency: 'PGK', symbol: 'K' },
  { code: 'PH', name: 'Philippines', currency: 'PHP', symbol: '₱' },
  { code: 'PK', name: 'Pakistan', currency: 'PKR', symbol: '₨' },
  { code: 'PL', name: 'Poland', currency: 'PLN', symbol: 'zł' },
  { code: 'RU', name: 'Russia', currency: 'RUB', symbol: '₽' },
  { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', symbol: 'ر.س' },
  { code: 'SB', name: 'Solomon Islands', currency: 'SBD', symbol: '$' },
  { code: 'SC', name: 'Seychelles', currency: 'SCR', symbol: '₨' },
  { code: 'SE', name: 'Sweden', currency: 'SEK', symbol: 'kr' },
  { code: 'SG', name: 'Singapore', currency: 'SGD', symbol: '$' },
  { code: 'TH', name: 'Thailand', currency: 'THB', symbol: '฿' },
  { code: 'TO', name: 'Tonga', currency: 'TOP', symbol: 'T$' },
  { code: 'TR', name: 'Turkey', currency: 'TRY', symbol: '₺' },
  { code: 'TW', name: 'Taiwan', currency: 'TWD', symbol: 'NT$' },
  { code: 'TZ', name: 'Tanzania', currency: 'TZS', symbol: 'TSh' },
  { code: 'US', name: 'United States', currency: 'USD', symbol: '$' },
  { code: 'VE', name: 'Venezuela', currency: 'VEF', symbol: 'Bs' },
  { code: 'VN', name: 'Vietnam', currency: 'VND', symbol: '₫' },
  { code: 'VU', name: 'Vanuatu', currency: 'VUV', symbol: 'VT' },
  { code: 'WS', name: 'Samoa', currency: 'WST', symbol: 'WS$' },
  { code: 'XO', name: 'West African CFA franc', currency: 'XOF', symbol: 'CFA' },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', symbol: 'R' },
];

function getCurrencyPairs(symbols: string[]) {
  const pairs: string[] = [];

  for (let i = 0; i < symbols.length; i++) {
    for (let j = i + 1; j < symbols.length; j++) {
      pairs.push(`${symbols[i]}${symbols[j]}`);
      pairs.push(`${symbols[j]}${symbols[i]}`);
    }
  }

  return pairs;
}

export const Globals = {
  cache: {
    currency: 'global:currency',
    settings: 'global:settings',
    algoCode: 'algo:code',
    algoInputs: 'algo:inputs',
    portfolioInputs: 'portfolio:inputs',
  },
  countries: {
    countries,
    currencyPairs: getCurrencyPairs(countries.map(e => e.currency)),
    currencyMap: countries.reduce((acc, c) => ({ ...acc, [c.currency]: c }), {} as Record<string, any>),
  },
  inputs: {
    mode: 'USD',
    start: normalizeTimezone(getFirstOfYear(addDate(new Date(), -365))),
    end: normalizeTimezone(addDate(getFirstOfYear(new Date()), -1)),
    assets: {
      'BRL': ['BOVA11.SA', 'SELIC.SA','TSLA:BRL'],
      'USD': ['TSLA','SAP.DE:USD'],
    } as Record<string, string[]>,
    currencyOrder: ['USD','BRL','EUR','GBP','JPY','CAD','AUD'],
    tickerPopover: (<div style={{ textAlign: 'justify' }}>
      <div>e.g. AAPL, PETR4.SA, EURUSD=X, IPCA.SA, SELIC.SA, IMAB.SA, NTN-B/YYYY.SA, FIXED*0.1, etc.</div>
      <div>*You may also add modifiers: Currency &#40;<b>AAPL:EUR</b>&#41;, Leverage &#40;<b>AAPL*2</b>&#41;</div>
    </div>)
  },
  ticker: {
    currencyOp: ':',
    rateOp: '*',
    regex: function () { return new RegExp(`^([^\\${this.currencyOp}\\${this.rateOp}]+)(?:\\${this.currencyOp}(\\w+))?(?:\\${this.rateOp}([\\w\\.]+))?`) }, // TSLA:BRL*1.5, USDBRL=X
    changeCurrency: function (ticker: string, toCurrency: string) {
      let [_, code, currency, rate] = ticker.match(Globals.ticker.regex())!;
      return `${code}:${toCurrency}${rate != null ? `*${rate}` : ''}`;
    },
  },
  settings: {
    debug: false,
    riskFreeRate: 0.02,
    marketBenchmark: '^SPX',
  },
};
