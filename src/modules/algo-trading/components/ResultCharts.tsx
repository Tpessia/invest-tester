import { dateToIsoStr, pickEvenly, toPercent } from '@/modules/@utils';
import useFormatCurrency from '@/modules/@utils/hooks/useFormatCurrency';
import { AlgoResult } from '@/modules/algo-trading/models/AlgoResult';
import Chart, { ChartProps } from '@core/components/Chart';
import { round } from 'lodash-es';
import React from 'react';

interface Props {
  result?: AlgoResult;
  chartType?: ChartProps['type'];
}

const Performance: React.FC<Props> = (props) => {
  const formatCurrency = useFormatCurrency();

  const data = pickEvenly(props.result?.portfolioHist.map(e => ({ x: e.date, y: e.total })) || [], 100);

  return (
    <Chart
      data={[{ id: 'result', data }]}
      type={props.chartType}
      maxOffset={true}
      xFormarter={x => dateToIsoStr(x as Date)}
      yFormarter={y => formatCurrency(y as number)}
    />
  );
};

const Drawdown: React.FC<Props> = (props) => {
  const data = pickEvenly(props.result?.performance.map(e => ({ x: e.date, y: toPercent(round(e.drawdown, 4)) })) || [], 100);

  return (
    <Chart
      data={[{ id: 'result', data }]}
      xFormarter={x => dateToIsoStr(x as Date)}
      yFormarter={y => `${y} %`}
    />
  );
};

const Positions: React.FC<Props> = (props) => {
  const formatCurrency = useFormatCurrency();

  const data = Object.entries(props.result?.assetHist ?? {}).map(hist => ({
    id: hist[0],
    data: pickEvenly(hist[1].map(a => ({ x: a.date, y: round(a.quantity * a.value, 2) })), 100),
  }));
  data.forEach(e => { e.data.splice(0, 1); e.data.splice(-1, 1); }); // remove closePositions

  return (
    <Chart
      data={data}
      type={props.chartType}
      minOffset={true}
      maxOffset={true}
      labelPrefix={p => `${p.serieId}: `}
      xFormarter={x => dateToIsoStr(x as Date)}
      yFormarter={y => formatCurrency(y as number)}
    />
  );
};

const Quantities: React.FC<Props> = (props) => {
  const data = Object.entries(props.result?.assetHist ?? {}).map(hist => ({
    id: hist[0],
    data: pickEvenly(hist[1].map(a => ({ x: a.date, y: a.quantity })), 100),
  }));
  data.forEach(e => { e.data.splice(0, 1); e.data.splice(-1, 1); }); // remove closePositions

  return (
    <Chart
      data={data}
      type={props.chartType}
      minOffset={true}
      maxOffset={true}
      labelPrefix={p => `${p.serieId}: `}
      xFormarter={x => dateToIsoStr(x as Date)}
    />
  );
};

const Prices: React.FC<Props> = (props) => {
  const formatCurrency = useFormatCurrency();

  const data = Object.entries(props.result?.assetHist ?? {}).map(hist => ({
    id: hist[0],
    data: pickEvenly(hist[1].map(a => ({ x: a.date, y: round(a.value, 2) })), 100),
  }));
  data.forEach(e => { e.data.splice(0, 1); e.data.splice(-1, 1); }); // remove closePositions

  return (
    <Chart
      data={data}
      type={props.chartType}
      minOffset={true}
      maxOffset={true}
      labelPrefix={p => `${p.serieId}: `}
      xFormarter={x => dateToIsoStr(x as Date)}
      yFormarter={y => formatCurrency(y as number)}
    />
  );
};

const ResultCharts = {
  Performance,
  Drawdown,
  Positions,
  Quantities,
  Prices,
};

export default ResultCharts;
