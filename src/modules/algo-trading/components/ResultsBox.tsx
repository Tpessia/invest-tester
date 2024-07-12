import { toPercent } from '@/modules/@utils';
import useFormatCurrency from '@/modules/@utils/hooks/useFormatCurrency';
import ResultCharts from '@/modules/algo-trading/components/ResultCharts';
import { AlgoResult } from '@/modules/algo-trading/models/AlgoResult';
import { AlgoMessages, AlgoStatus } from '@/modules/algo-trading/models/AlgoState';
import LayoutContext from '@/modules/layout/context/LayoutContext';
import { Loading3QuartersOutlined } from '@ant-design/icons';
import { Input, Spin, Tabs, Typography } from 'antd';
import { keyBy } from 'lodash-es';
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ResultsBox.scss';

interface PerformanceProps {
  status: AlgoStatus;
  result?: AlgoResult;
}

const Perfomance: React.FC<PerformanceProps> = (props) => {
  type TabKey = 'summary' | 'performanceChart' | 'drawdownChart' | 'positionsChart' | 'quantitiesChart' | 'pricesChart';
  type TabType = { label: string; key: TabKey; component: () => JSX.Element };

  const [activeTab, setActiveTab] = useState<TabKey>('summary');
  const layoutContext = useContext(LayoutContext);
  const formatCurrency = useFormatCurrency();

  let tabs: TabType[] = [{
    label: 'Summary',
    key: 'summary',
    component: () => {
      if (props.result == null) return <></>;

      const formatVar = (v: number) => (<Typography.Text type={v >= 0 ? 'success' : 'danger'}>{v > 0 ? '+' : ''}{toPercent(v)}%</Typography.Text>);

      return (
        <div className='algo-summary'>
          <div>
            <div>Init</div>
            <div>{formatCurrency(props.result.summary.initCash)}</div>
          </div>
          <div>
            <div>Final</div>
            <div>{formatCurrency(props.result.summary.finalCash)}</div>
          </div>
          <div>
            <div>Var</div>
            <div>{formatVar(props.result.summary.totalVar)}</div>
          </div>
          <div>
            <div>Lowest</div>
            <div>{formatCurrency(props.result.summary.low)}</div>
          </div>
          <div>
            <div>Highest</div>
            <div>{formatCurrency(props.result.summary.high)}</div>
          </div>
          <div>
            <div>Annual Var</div>
            <div>{formatVar(props.result.summary.annualVar)}</div>
          </div>
          {/* <div>
            <div>#Trades</div>
            <div>{props.result.summary.nTrades}</div>
          </div> */}
        </div>
      );
    },
  },
  {
    label: 'Performance',
    key: 'performanceChart',
    component: () => <ResultCharts.Performance result={props.result} />,
  },
  {
    label: 'Drawdown',
    key: 'drawdownChart',
    component: () => <ResultCharts.Drawdown result={props.result} />,
  },
  {
    label: 'Positions',
    key: 'positionsChart',
    component: () => <ResultCharts.Positions result={props.result} />,
  },
  {
    label: 'Quantities',
    key: 'quantitiesChart',
    component: () => <ResultCharts.Quantities result={props.result} />,
  },
  {
    label: 'Prices',
    key: 'pricesChart',
    component: () => <ResultCharts.Prices result={props.result} />,
  }];

  if (props.result && Object.values(props.result.assetHist).length <= 1)
    tabs = tabs.filter(e => e.key !== 'positionsChart');

  const tabsDict = keyBy(tabs, e => e.key);

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
            activeKey={activeTab} items={tabs} centered={!layoutContext.isMobile}
            onChange={t => setActiveTab(t as TabKey)}
          />
          {activeTab === 'summary' ? (
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

  const [activeTab, setActiveTab] = useState<TabKey>('messages');

  useEffect(() => {
    if (props.messages.warnings.length > 0) setActiveTab('warnings');
    else setActiveTab('messages');
  }, [props.messages]);

  let msgs = activeTab === 'messages' ? props.messages.messages : props.messages.warnings.map(e => `[Warning] ${e}`);
  msgs = props.show ? msgs : ['Backtest Output'];

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
