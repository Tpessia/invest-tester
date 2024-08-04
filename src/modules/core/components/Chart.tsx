import variables from '@/styles/variables';
import { Theme } from '@nivo/core';
import { DatumValue, Point, PointTooltip, ResponsiveLine, Serie } from '@nivo/line';
import { findBestLogBase, formatCurrency, generateLogScale, pickEvenly } from '@utils/index';
import Color from 'color';
import { sortBy } from 'lodash-es';

export interface ChartProps {
  data: Serie[];
  type?: 'linear' | 'log';
  min?: number | 'auto';
  max?: number | 'auto';
  minOffset?: boolean;
  maxOffset?: boolean;
  labelPrefix?: (p: Point) => React.ReactNode;
  xFormarter?: (x: DatumValue) => string;
  yFormarter?: (y: DatumValue) => string;
}

const Chart: React.FC<ChartProps> = (props) => {
  if (props.type === 'log') {
    // Log cannot have 0 values
    props.data.forEach(e => e.data.forEach(f => f.y = f.y === 0 ? 0.11 : f.y));
  }

  const flatY = sortBy(props.data.flatMap(e => e.data.map(f => f.y as number)))

  const minYRaw = Math.min(...flatY) * 0.95;
  const maxYRaw = Math.max(...flatY) * 1.05;
  const minY = props.minOffset ? minYRaw : props.min ?? 'auto';
  const maxY = props.maxOffset ? maxYRaw : props.max ?? 'auto';

  const chartLegendsX = pickEvenly(props.data[0].data.map(e => e.x), 5);
  let chartLegendsY: any = 10;

  let logBase: number | undefined;
  if (props.type === 'log') {
    logBase = findBestLogBase(flatY);
    chartLegendsY = generateLogScale(minYRaw, maxYRaw, logBase);
  }

  // Values

  const theme: Theme = {
    axis: {
      ticks: { text: { fill: 'white' } },
      domain: { line: { stroke: '#FFFFFF20' } },
    },
    crosshair: {
      line: { stroke: 'white' },
    },
    legends: {
      text: { fill: 'white' },
    },
  };

  const tooltip: PointTooltip = ({ point }) => (
    <div style={{ background: variables.bodySecundary, padding: 5, marginBottom: -5 }}>
      {props.labelPrefix?.(point)}
      x: <b>{props.xFormarter?.(point.data.x) ?? point.data.x.toString()}</b>,
      y: <b>{props.yFormarter?.(point.data.y) ?? point.data.y.toString()}</b>
    </div>
  );

  // Callbacks

  const colorFunc = (d: Serie) => {
    const color = Color(variables.primaryColor);
    const index = props.data.findIndex(e => e.id === d.id);
    const lightenValue = index / ((props.data.length - 1) || 1);
    return color.lighten(lightenValue).toString();
  };

  return (
    <div style={{ height: 'calc(100% - 3.02px)', width: '100%' }}>
      <ResponsiveLine
        data={props.data}
        colors={colorFunc}
        theme={theme}
        margin={{ top: 15, right: 30, bottom: 30, left: 65 }}
        curve='monotoneX'
        xScale={{ type: 'time', min: 'auto', max: 'auto' }}
        yScale={{ type: props.type ?? 'linear', min: minY, max: maxY, base: logBase }}
        axisBottom={{
          tickSize: 5, tickPadding: 5, tickRotation: 0, // tickRotation: 315
          legend: null, tickValues: chartLegendsX, format: '%Y-%m',
        }}
        axisLeft={{
          tickSize: 5, tickPadding: 5, tickRotation: 0,
          legend: null, tickValues: chartLegendsY, format: e => formatCurrency(e, { prefix: '', decimalScale: 2, fixedDecimalScale: false }),
        }}
        enableGridX={false}
        enableGridY={false}
        enableTouchCrosshair={false}
        useMesh={true}
        animate={false}
        tooltip={tooltip}
        pointColor={{ theme: 'background' }}
        lineWidth={2.5}
        legends={props.data.length > 1 ? [{
          anchor: 'top-left',
          direction: 'column',
          justify: false,
          translateX: 10,
          translateY: -10,
          itemsSpacing: 0,
          itemDirection: 'left-to-right',
          itemWidth: 0,
          itemHeight: 15,
          itemOpacity: .9,
          padding: 0,
          symbolSize: 10,
          symbolShape: 'circle',
          symbolSpacing: 5,
        }] : undefined}
        // enableSlices={'x'}
        // pointSize={10}
      />
    </div>
  );
};

export default Chart;