import ResultCharts from '@/modules/algo-trading/components/ResultCharts';
import { AlgoResult } from '@/modules/algo-trading/models/AlgoResult';
import { AlgoMessages, AlgoStatus } from '@/modules/algo-trading/models/AlgoState';
import InfoPopover from '@/modules/core/components/InfoPopover';
import GlobalContext from '@/modules/core/context/GlobalContext';
import LayoutContext from '@/modules/layout/context/LayoutContext';
import variables from '@/styles/variables';
import { DownloadOutlined, Loading3QuartersOutlined } from '@ant-design/icons';
import { AsyncComponent, dateToIsoStr, downloadObj, toPercent, useFormatCurrency } from '@utils/index';
import { Input, Spin, Table, Tabs, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { keyBy, round } from 'lodash-es';
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ResultsBox.scss';

interface PerformanceProps {
  status: AlgoStatus;
  result?: AlgoResult;
}

const Perfomance: React.FC<PerformanceProps> = (props) => {
  type TabKey = 'summary' | 'performanceChart' | 'drawdownChart' | 'positionsChart' | 'quantitiesChart' | 'pricesChart' | 'timeseries';
  type TabType = { label: string; key: TabKey; component: () => JSX.Element };

  // State

  const [activeTab, setActiveTab] = useState<TabKey>('summary');
  const globalContext = useContext(GlobalContext);
  const layoutContext = useContext(LayoutContext);

  // Dependencies

  const formatCurrency = useFormatCurrency();

  // Values

  let tabs: TabType[] = [{
    label: 'Summary',
    key: 'summary',
    component: () => {
      if (props.result == null) return <></>;

      const formatRound = (v: number | undefined) => v != null ? round(v, 4) : 'N/A';
      const formatPercent = (v: number | undefined) => v != null ? `${toPercent(round(v, 4))}%` : 'N/A';
      const formatVar = (v: number) => (<Typography.Text type={v >= 0 ? 'success' : 'danger'}>{v > 0 ? '+' : ''}{toPercent(v)}%</Typography.Text>);

      return (
        <div className='algo-summary'>
          <div>
            <div>Init</div>
            <div>{formatCurrency(props.result.summary.initCash)}</div>
          </div>
          <div>
            <div>Var</div>
            <div>{formatVar(props.result.summary.totalVar)}</div>
          </div>
          <div>
            <div>Max Drawdown</div>
            <div>{formatPercent(props.result.summary.maxDrawdown)}</div>
          </div>
          <div>
            <div>Final</div>
            <div>{formatCurrency(props.result.summary.finalCash)}</div>
          </div>
          <div>
            <div>Annual Var</div>
            <div>{formatVar(props.result.summary.annualVar)}</div>
          </div>
          <div>
            <div>
              <InfoPopover content='Alpha (α)' popover={(<div>
                Excess return relative to benchmark, adjusted for risk<br/>
                Positive α: Outperformed benchmark<br/>
                Negative α: Underperformed benchmark<br/>
                Zero α: Matched benchmark
              </div>)} />
            </div>
            <div>
              {<AsyncComponent
                data={props.result.summary.alpha} render={data => formatPercent(data)}
                fallback='Loading' errorElement='N/A'
              />}
            </div>
          </div>
          <div>
            <div>Lowest</div>
            <div>{formatCurrency(props.result.summary.low)}</div>
          </div>
          <div>
            <div>Volatility</div>
            <div>{formatPercent(props.result.summary.annualStdDev)}</div>
          </div>
          <div>
            <div>
              <InfoPopover content='Beta (β)' popover={(<div>
                Measures portfolio volatility relative to the benchmark<br/>
                β = 1: Moves perfectly with the benchmark<br/>
                β {'>'} 1: More volatile {'('}e.g. 1.5 = 50% more volatile{')'}<br/>
                β {'>'} 0 and {'<'} 1: Less volatile {'('}e.g. 0.5 = 50% lest volatile{')'}<br/>
                β {'<'} 0: Inverse correlation {'('}e.g. -1 = 1:1 oposite direction{')'}
              </div>)} />
            </div>
            <div>
              {<AsyncComponent
                data={props.result.summary.beta} render={data => formatRound(data)}
                fallback='Loading' errorElement='N/A'
              />}
            </div>
          </div>
          <div>
            <div>Highest</div>
            <div>{formatCurrency(props.result.summary.high)}</div>
          </div>
          <div>
            <div>#Trades</div>
            <div>{props.result.summary.nTrades}</div>
          </div>
          <div>
            <div><InfoPopover content='Sharpe' popover={(<div>
              Measures risk-adjusted performance<br/>
              Sharpe {'<'} 0: Low risk-adjusted performance<br/>
              Sharpe {'>'} 0: Good risk-adjusted performance<br/>
              Sharpe {'>'} 1: Great risk-adjusted performance
            </div>)} /></div>
            <div>{formatRound(props.result.summary.sharpe)}</div>
          </div>
        </div>
      );
    },
  },
  {
    label: 'Performance',
    key: 'performanceChart',
    component: () => <ResultCharts.Performance result={props.result} chartType={globalContext.chartType} />,
  },
  {
    label: 'Drawdown',
    key: 'drawdownChart',
    component: () => <ResultCharts.Drawdown result={props.result} chartType={globalContext.chartType} />,
  },
  {
    label: 'Positions',
    key: 'positionsChart',
    component: () => <ResultCharts.Positions result={props.result} chartType={globalContext.chartType} />,
  },
  {
    label: 'Quantities',
    key: 'quantitiesChart',
    component: () => <ResultCharts.Quantities result={props.result} chartType={globalContext.chartType} />,
  },
  {
    label: 'Prices',
    key: 'pricesChart',
    component: () => <ResultCharts.Prices result={props.result} chartType={globalContext.chartType} />,
  }, {
    label: 'TimeSeries',
    key: 'timeseries',
    component: () => {
      if (props.result == null) return <></>;

      const dataSource = Object.entries(props.result.assetHist).flatMap(a => a[1].map(asset => {
        const dateStr = dateToIsoStr(asset.date);
        const currency = globalContext.currencyOptions.find(e => e.currency === asset.currency)?.symbol ?? asset.currency ?? globalContext.currency.symbol;
        return {
          key: `${asset.assetCode}-${asset.date}`,
          date: dateStr,
          assetCode: asset.assetCode,
          value: `${formatCurrency(asset.value, { prefix: `${currency} ` })}`,
          valueRaw: asset.value,
        };
      }));

      const columns: ColumnsType<typeof dataSource[0]> = [
        {
          title: 'Date', dataIndex: 'date', key: 'date',
          sorter: { compare: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() },
        },
        {
          title: 'Asset', dataIndex: 'assetCode', key: 'assetCode',
          sorter: { compare: (a, b) => a.assetCode.localeCompare(b.assetCode) },
        },
        {
          title: 'Value', dataIndex: 'value', key: 'value',
          sorter: { compare: (a, b) => a.valueRaw - b.valueRaw },
        },
      ];

      let pageSize = layoutContext.isMobile ? 6 : (((layoutContext.screenHeight - 168) / 2) - 128) / 33;
      if (pageSize < 6) pageSize = 6;

      return (
        <div className='algo-timeseries'>
          <DownloadOutlined className='timeseries-download'
            onClick={() => downloadObj(props.result!.assetHist, 'asset-timeseries.invest-tester')} />
          <Table
            dataSource={dataSource}
            columns={columns} size='small'
            pagination={{ simple: true, pageSize, showSizeChanger: false }}
          />
        </div>
      );
    },
  }];

  if (props.result && Object.values(props.result.assetHist).length <= 1)
    tabs = tabs.filter(e => e.key !== 'positionsChart');

  const tabsDict = keyBy(tabs, e => e.key);

  // Render

  return (
    <div className='output-box box-dark'>
      {props.status === 'running' ? (
        <div className='processing' style={{ margin: '7px 10px' }}>
          <div className='processing-text'><b>Processing...</b><br/><small>may take some seconds</small>{/* {toPercent(round(props.progress, 4))}% */}</div>
          <div className='processing-icon'>
            <Spin indicator={<Loading3QuartersOutlined spin />} />
          </div>
        </div>
      ) : props.status === 'error' ? (
        <b style={{ margin: '7px 10px' }}>Error! Check the warning logs below, console logs or the error event</b>
      ) : props.status === 'stopped' && props.result != null ? (
        <>
          <Tabs
            className='tabs'
            activeKey={activeTab} items={tabs} centered={layoutContext.screenWidth > variables.sizeLg}
            onChange={t => setActiveTab(t as TabKey)}
          />
          {['summary','timeseries'].includes(activeTab) ? (
            tabsDict[activeTab].component()
          ) : (
            <div className='algo-chart'>
              {tabsDict[activeTab].component()}
            </div>
          )}
        </>
      ) : (<div style={{ margin: '7px 10px' }}>Backtest Results | <Link to={'/docs'}>Check the Docs</Link></div>)}
    </div>
  );
};

interface MessagesProps {
  show: boolean;
  messages: AlgoMessages;
}

const Messages: React.FC<MessagesProps> = (props) => {
  type TabKey = 'messages' | 'warnings';

  // State

  const [activeTab, setActiveTab] = useState<TabKey>('messages');

  // Effects

  useEffect(() => {
    if (props.messages.warnings.length > 0) setActiveTab('warnings');
    else setActiveTab('messages');
  }, [props.messages]);

  // Values

  let msgs = activeTab === 'messages' ? props.messages.messages : props.messages.warnings.map(e => `[Warning] ${e}`);
  msgs = props.show ? msgs : ['Backtest Output'];

  // Render

  return (
    <div className='output-box box-dark'>
      {props.show ? (
        <>
          <Tabs
            className='tabs'
            activeKey={activeTab} items={[{ key: 'messages', label: 'Messages' }, { key: 'warnings', label: 'Warnings' }]}
            centered={true}
            onChange={t => setActiveTab(t as TabKey)}
          />
          <Input.TextArea className='algo-output box-dark' value={msgs.join('\n')} placeholder='No messages' />
        </>
      ) : (<div style={{ margin: '7px 10px' }}>Backtest Output</div>)}
    </div>
  );
};

const ResultsBox = {
  Perfomance,
  Messages,
};

export default ResultsBox;
