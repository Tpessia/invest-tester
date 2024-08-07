import ResultsBox from '@/modules/algo-trading/components/ResultsBox';
import TickersSelector from '@/modules/algo-trading/components/TickersSelector';
import { AlgoConfig, AlgoInputs } from '@/modules/algo-trading/models/AlgoInputs';
import { AlgoResult } from '@/modules/algo-trading/models/AlgoResult';
import { AlgoMessages, AlgoStatus, initAlgoMessages } from '@/modules/algo-trading/models/AlgoState';
import { strategyBuyHold, StrategyBuyHoldProps } from '@/modules/algo-trading/models/AlgoStrategies';
import { AlgoService } from '@/modules/algo-trading/services/AlgoService';
import { MinusOutlined, PlusOutlined, ShareAltOutlined } from '@ant-design/icons';
import DateRangePicker from '@core/components/DateRangePicker';
import InfoPopover from '@core/components/InfoPopover';
import InputAddon from '@core/components/InputAddon';
import InputMask from '@core/components/InputMask';
import GlobalContext, { UrlMode } from '@core/context/GlobalContext';
import { Globals } from '@core/modles/Globals';
import { decodeUrlObj, encodeUrlObj, fromPercent, getErrorMsg, jsonDateReviver, toPercent, tryParseJson, useService, useStateImmutable, useThrottle } from '@utils/index';
import { Button, Checkbox, Col, notification, Row, Space } from 'antd';
import dayjs from 'dayjs';
import { round, uniqBy } from 'lodash-es';
import { useContext, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import './Portfolio.scss';

interface State {
  inputs: StrategyBuyHoldProps & {
    initCash: number;
    start: Date;
    end: Date;
  };
  status: AlgoStatus;
  messages: AlgoMessages;
  progress: number;
  result?: AlgoResult;
}

const initState = (urlMode: UrlMode): State => ({
  inputs: tryParseJson(localStorage.getItem(Globals.cache.portfolioInputs), jsonDateReviver) || {
    initCash: 1000000,
    start: Globals.inputs.start,
    end: Globals.inputs.end,
    assets: (Globals.inputs.assets[urlMode || Globals.inputs.mode]).map((a, i, arr) => ({ assetCode: a, percentual: i === arr.length - 1 ? 1 - (arr.length - 1) * +(1 / arr.length).toFixed(2) : +(1 / arr.length).toFixed(2) })),
    monthlyDeposits: 0,
    rebalance: false,
    download: false,
  },
  status: 'stopped',
  messages: initAlgoMessages(),
  progress: 0,
});

const shareLinkParam = 'data';

const Portfolio: React.FC = () => {
  // Dependencies
  
  const location = useLocation();
  const globalContext = useContext(GlobalContext);

  const [nApi, nContext] = notification.useNotification();

  const algoService = useService(AlgoService);

  // State

  const [state, setState] = useStateImmutable(() => initState(globalContext.urlMode));

  // Effects

  useEffect(() => {
    if (location.search) {
      const inputs = new URLSearchParams(location.search).get(shareLinkParam);
      if (inputs) {
        const { assets, initCash, monthlyDeposits, start, end, rebalance, download } = decodeUrlObj(inputs) as State['inputs'];
        setState({ inputs: { $set: { assets, initCash, monthlyDeposits, start, end, rebalance, download } } });
      }
    }
  }, [location.search]);

  useEffect(useThrottle(() => {
    localStorage.setItem(Globals.cache.portfolioInputs, JSON.stringify(state.inputs));
  }, 1000, { leading: false }), [...Object.values(state.inputs)]);

  // Values

  const hasResult = state.result != null || state.messages.warnings.concat(state.messages.warnings).length > 0;

  // Callbacks

  const handleReset = () => {
    setState({ result: { $set: undefined }, messages: { $set: initAlgoMessages() } });
  };

  const handleStart = async () => {
    handleReset();

    try {
      // Validate inputs

      if (state.inputs.assets.length === 0) throw new Error('No assets selected');

      const invalidAssetIndexes = state.inputs.assets.reduce((acc, val, i) => val.assetCode ? acc : [...acc, +i+1], [] as number[]);
      if (invalidAssetIndexes.length) throw new Error('Invalid assets at index: ' + invalidAssetIndexes.join(', '));

      const duplicateAssets = uniqBy(state.inputs.assets.map(e => e.assetCode).filter((e, i, a) => a.indexOf(e) !== i), e => e);
      if (duplicateAssets.length) throw new Error('Duplicate assets: ' + duplicateAssets.join(', '));

      const invalidPercents = state.inputs.assets.reduce((acc, val, i) => !!val.percentual ? acc : [...acc, val.assetCode], [] as string[]);
      if (invalidPercents.length) throw new Error('Invalid percentages: ' + invalidPercents.join(', '));

      const totalPercent = state.inputs.assets.reduce((acc, val) => acc + val.percentual, 0);
      if (round(totalPercent - 1, 4) !== 0) throw new Error(`Total percentage sum is ${round(toPercent(totalPercent), 2)}%, but must be 100%`);

      // Start algo

      const inputs: AlgoInputs = {
        currency: globalContext.currency.currency,
        assetCodes: state.inputs.assets.map(e => e.assetCode),
        initCash: state.inputs.initCash,
        start: state.inputs.start,
        end: state.inputs.end,
        enableLeverage: false,
        initMargin: 0,
        minMargin: 0,
      };
      const config: AlgoConfig = {
        riskFreeRate: globalContext.settings.riskFreeRate,
        marketBenchmark: globalContext.settings.marketBenchmark,
      };

      const result = await algoService.init(config, s => setState({
        status: { $set: s.status },
        messages: { $set: s.messages },
        // progress: { $set: s.progress },
      })).start(inputs, strategyBuyHold(state.inputs));

      console.log('result', result);
      setState({ result: { $set: result } });
    } catch (err: any) {
      setState({ messages: { warnings: { $push: [getErrorMsg(err, globalContext.settings.debug)] } }, status: { $set: 'error' } });
    }
  };

  const handleStop = () => {
    algoService.stop();
  };

  const handleShare = () => {
    const urlParams = encodeUrlObj(state.inputs);
    const shareLink = new URL(window.location.href);
    shareLink.searchParams.append(shareLinkParam, urlParams);
    navigator.clipboard.writeText(shareLink.toString()).then(
      () => nApi.open({ message: 'Share link copied to clipboard!', duration: 5 }), // description: shareLink
      (err) => nApi.open({ message: 'Error copying share link: ' + err, duration: 5 })
    );
  };

  // Render

  return (
    <Row
      className='portfolio' 
      gutter={[
        { xs: 0, sm: 0, md: 0, lg: 16 },
        { xs: 30, sm: 30, md: 30, lg: 0 }
      ]}
    >
      {nContext}
      <Helmet>
        <title>InvestTester | Backtest Your Portfolio</title>
        <link rel="canonical" href="https://InvestTester.com/" />
        <meta name="description" content="Simulate asset allocations, optimize investment portfolios and backtest algo trading strategies" />
      </Helmet>
      <Col className='portfolio-inputs' xs={24} lg={12}>
        <Space.Compact>
          <Row gutter={[{ xs: 8, sm: 16 }, { xs: 8, sm: 16 }]}>
            <Col xs={24} sm={24} xl={24}>
              <div style={{ textAlign: 'center', fontSize: '1rem', marginTop: '10px' }}>
                Backtest your investment portfolio by defining your initial balance, date range and asset allocations, then press <b>Start</b>
              </div>
            </Col>
            <Col xs={24} sm={24} xl={24}>
              <hr style={{ width: 0 }} />
            </Col>
            <Col xs={24} sm={24} xl={12}>
              <InputMask
                type='text'
                addonBefore='Balance'
                maskProps={{
                  prefix: `${globalContext.currency.symbol} `,
                  allowNegative: false,
                  value: state.inputs.initCash,
                  onValueChange: (values) => setState({ inputs: { initCash: { $set: +values.value } } }),
                }}
              />
            </Col>
            <Col xs={24} sm={24} xl={12}>
              <InputMask
                type='text'
                addonBefore={<InfoPopover content='Deposits' popover='Monthly Deposits' />}
                maskProps={{
                  prefix: `${globalContext.currency.symbol} `,
                  allowNegative: false,
                  value: state.inputs.monthlyDeposits,
                  onValueChange: (values) => setState({ inputs: { monthlyDeposits: { $set: +values.value } } }),
                }}
              />
            </Col>
            <Col xs={24} sm={24} xl={12}>
              <InputAddon addonBefore='Date'>
                <DateRangePicker
                  suffixIcon={null}
                  allowClear={false}
                  value={[
                    dayjs(state.inputs.start),
                    dayjs(state.inputs.end),
                  ]}
                  onChange={(dates, dateStrs) => setState({ inputs: {
                    start: { $set: dates?.[0]?.toDate() ?? state.inputs.start },
                    end: { $set: dates?.[1]?.toDate() ?? state.inputs.end },
                  } })}
                  style={{
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                  }}
                />
              </InputAddon>
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <InputAddon addWrapper={true}>
                <Checkbox
                  checked={state.inputs.rebalance}
                  onChange={e => setState({ inputs: { rebalance: { $set: e.target.checked } } })}
                  style={{ width: '100%' }}
                >
                  <InfoPopover content='Rebalance' popover='Monthly Rebalance' style={{ whiteSpace: 'nowrap' }} />
                </Checkbox>
              </InputAddon>
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <InputAddon addWrapper={true}>
                <Checkbox
                  checked={state.inputs.download}
                  onChange={e => setState({ inputs: { download: { $set: e.target.checked } } })}
                  style={{ width: '100%' }}
                >
                  <InfoPopover content='Download' popover='Download Results' style={{ whiteSpace: 'nowrap' }} />
                </Checkbox>
              </InputAddon>
            </Col>
            <Col xs={24} sm={24} xl={24}>
              <hr style={{ width: 0 }} />
            </Col>
            <Col xs={24} sm={24} xl={24}>
              {state.inputs.assets.map((asset, i) => (
                <Row gutter={[{ xs: 5, sm: 10 }, { xs: 5, sm: 10 }]} key={i} style={{ marginBottom: i === state.inputs.assets.length - 1 ? 0 : '12px' }}>
                  <Col xs={24} sm={24} xl={10}>
                    <InputAddon forceUnround addonBefore={<InfoPopover content='Ticker' width={375} popover={Globals.inputs.tickerPopover} />}>
                      <TickersSelector.Single
                        ticker={asset.assetCode}
                        onChange={e => setState({ inputs: { assets: { [i]: { assetCode: { $set: e ?? '' } } } } })}
                      />
                    </InputAddon>
                  </Col>
                  <Col xs={16} sm={16} xl={9}>
                    <InputMask
                      type='text'
                      addonBefore='Percent'
                      maskProps={{
                        suffix: '%',
                        value: toPercent(asset.percentual),
                        onValueChange: (values) => setState({ inputs: { assets: { [i]: { percentual: { $set: fromPercent(+values.value) } } } } }),
                      }}
                    />
                  </Col>
                  <Col xs={8} sm={8} xl={5} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      disabled={state.inputs.assets.length === 1}
                      style={{ flex: 1, marginRight: '5px' }}
                      onClick={() => setState({ inputs: { assets: { $splice: [[i, 1]] } } })}
                    ><MinusOutlined /></Button>
                    <Button
                      disabled={state.inputs.assets.length >= 10}
                      style={{ flex: 1 }}
                      onClick={() => setState({ inputs: { assets: { $splice: [[i+1, 0, { assetCode: '', percentual: 0 }]] } } })}
                    ><PlusOutlined /></Button>
                  </Col>
                </Row>
              ))}
            </Col>
          </Row>
        </Space.Compact>
        <div className='btn-box'>
          <Button type='primary' disabled={state.status === 'running'} onClick={handleStart}>Start</Button>
          <Button disabled={state.status !== 'running'} onClick={handleStop}>Stop</Button>
          <Button disabled={!hasResult} onClick={handleReset}>Reset</Button>
          <Button onClick={handleShare}><ShareAltOutlined title='Share' /></Button>
        </div>
      </Col>
      <Col className='portfolio-output' xs={24} lg={12}>
        <Row gutter={[{ xs: 20, sm: 16 }, { xs: 20, sm: 16 }]}>
          <Col className='portfolio-results' xs={24}>
            <ResultsBox.Perfomance status={state.status} result={state.result}  />
          </Col>
          <Col className='portfolio-messages' xs={24}>
            <ResultsBox.Messages show={hasResult} messages={state.messages} />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default Portfolio;