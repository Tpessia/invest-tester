import { AlgoResult } from '@/modules/algo-trading/models/AlgoResult';
import Chart, { ChartProps } from '@core/components/Chart';
import { dateToIsoStr, pickEvenly, toPercent, useFormatCurrency } from '@utils/index';
import { round } from 'lodash-es';
import React from 'react';

interface Props {
  result?: AlgoResult;
  chartType?: ChartProps['type'];
}

const pickEvenlyAmount = (amount: number, max: number = 150) => amount > max ? Math.min(max, amount * 0.2) : amount;

const Performance: React.FC<Props> = (props) => {
  const formatCurrency = useFormatCurrency();

  const allData = props.result?.portfolioHist.map(e => ({ x: e.date, y: e.total })) || [];
  const data = pickEvenly(allData, pickEvenlyAmount(allData.length, 100));

  return (
    <Chart
      data={[{ id: 'result', data }]}
      type={props.chartType}
      minOffset={true}
      maxOffset={true}
      xFormarter={x => dateToIsoStr(x as Date)}
      yFormarter={y => formatCurrency(y as number)}
    />
  );
};

const Drawdown: React.FC<Props> = (props) => {
  const allData = props.result?.performance.map(e => ({ x: e.date, y: toPercent(round(e.drawdown, 4)) })) || [];
  const data = pickEvenly(allData, pickEvenlyAmount(allData.length, 250));

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

  const data = Object.entries(props.result?.assetHist ?? {}).map((hist, i, arr) => {
    const allData = hist[1].map(a => ({ x: a.date, y: round(a.quantity * a.value, 2) }));
    return { id: hist[0], data: pickEvenly(allData, pickEvenlyAmount(allData.length * arr.length) / arr.length) };
  });
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
  const data = Object.entries(props.result?.assetHist ?? {}).map((hist, i, arr) => {
    const allData = hist[1].map(a => ({ x: a.date, y: a.quantity }));
    return { id: hist[0], data: pickEvenly(allData, pickEvenlyAmount(allData.length * arr.length) / arr.length) };
  });
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

  const data = Object.entries(props.result?.assetHist ?? {}).map((hist, i, arr) => {
    const allData = hist[1].map(a => ({ x: a.date, y: round(a.value, 2) }));
    return { id: hist[0], data: pickEvenly(allData, pickEvenlyAmount(allData.length * arr.length) / arr.length) };
  });
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
