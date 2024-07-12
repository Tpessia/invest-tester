import { formatCurrency } from '@/modules/@utils/data/number';
import GlobalContext from '@core/context/GlobalContext';
import { useContext } from 'react';
import { NumericFormatProps } from 'react-number-format';

export default function useFormatCurrency() {
  const globalContext = useContext(GlobalContext);
  return (value: number, config?: NumericFormatProps) => formatCurrency(value, { prefix: `${globalContext.currency.symbol} `, ...config });
}
