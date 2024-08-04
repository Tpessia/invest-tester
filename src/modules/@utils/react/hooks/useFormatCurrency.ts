import GlobalContext from '@core/context/GlobalContext';
import { formatCurrency } from '@utils/index';
import { useContext } from 'react';
import { NumericFormatProps } from 'react-number-format';

export function useFormatCurrency() {
  const globalContext = useContext(GlobalContext);
  return (value: number, config?: NumericFormatProps) => formatCurrency(value, { prefix: `${globalContext.currency.symbol} `, ...config });
}
