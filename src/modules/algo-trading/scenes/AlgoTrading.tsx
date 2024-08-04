import ResultsBox from '@/modules/algo-trading/components/ResultsBox';
import TickersSelector from '@/modules/algo-trading/components/TickersSelector';
import { AlgoConfig, AlgoInputs } from '@/modules/algo-trading/models/AlgoInputs';
import { AlgoResult } from '@/modules/algo-trading/models/AlgoResult';
import { AlgoMessages, AlgoStatus, initAlgoMessages } from '@/modules/algo-trading/models/AlgoState';
import { initialCode } from '@/modules/algo-trading/models/AlgoStrategies';
import { AlgoService } from '@/modules/algo-trading/services/AlgoService';
import InfoPopover from '@/modules/core/components/InfoPopover';
import LayoutContext from '@/modules/layout/context/LayoutContext';
import CodeEditor from '@core/components/CodeEditor';
import DateRangePicker from '@core/components/DateRangePicker';
import InputAddon from '@core/components/InputAddon';
import InputMask from '@core/components/InputMask';
import GlobalContext, { UrlMode } from '@core/context/GlobalContext';
import { Globals } from '@core/modles/Globals';
import { fromPercent, getErrorMsg, jsonDateReviver, toPercent, tryParseJson, useService, useStateImmutable, useThrottle } from '@utils/index';
import { Button, Checkbox, Col, Row, Space } from 'antd';
import dayjs from 'dayjs';
import { useContext, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import './AlgoTrading.scss';

interface State {
  inputs: AlgoInputs;
  algoCode: string;
  status: AlgoStatus;
  messages: AlgoMessages;
  progress: number;
  result?: AlgoResult;
}

const initState = (urlMode: UrlMode): State => ({
  inputs: tryParseJson(localStorage.getItem(Globals.cache.algoInputs), jsonDateReviver) || {
    currency: undefined as any,
    assetCodes: Globals.inputs.assets[urlMode || Globals.inputs.mode],
    initCash: 1000000,
    start: Globals.inputs.start,
    end: Globals.inputs.end,
    enableLeverage: false,
    initMargin: 0,
    minMargin: 0,
  },
  algoCode: localStorage.getItem(Globals.cache.algoCode) || initialCode,
  status: 'stopped',
  messages: initAlgoMessages(),
  progress: 0,
});

const AlgoTrading: React.FC = () => {
  // State

  const globalContext = useContext(GlobalContext);
  const layoutContext = useContext(LayoutContext);
  const [state, setState] = useStateImmutable(() => initState(globalContext.urlMode));

  // Dependencies

  const algoService = useService(AlgoService);

  // Effects

  useEffect(useThrottle(() => {
    localStorage.setItem(Globals.cache.algoInputs, JSON.stringify(state.inputs));
  }, 1000, { leading: false }), [...Object.values(state.inputs)]);

  useEffect(useThrottle(() => {
    localStorage.setItem(Globals.cache.algoCode, state.algoCode);
  }, 2000, { leading: false }), [state.algoCode]);

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

      if (state.inputs.assetCodes.length === 0) throw new Error('No assets selected');

      const invalidAssetIndexes = state.inputs.assetCodes.reduce((acc, val, i) => val ? acc : [...acc, i], [] as number[]);
      if (invalidAssetIndexes.length) throw new Error('Invalid assetCodes at index ' + invalidAssetIndexes.join(', '));

      // Start algo

      const inputs: AlgoInputs = {
        assetCodes: state.inputs.assetCodes,
        currency: globalContext.currency.currency,
        initCash: state.inputs.initCash,
        start: new Date(state.inputs.start),
        end: new Date(state.inputs.end),
        enableLeverage: state.inputs.enableLeverage,
        initMargin: state.inputs.initMargin,
        minMargin: state.inputs.minMargin,
      };
      const config: AlgoConfig = {
        riskFreeRate: globalContext.settings.riskFreeRate,
        marketBenchmark: globalContext.settings.marketBenchmark,
      };

      const result = await algoService.init(config, s => setState({
        status: { $set: s.status },
        messages: { $set: s.messages },
        // progress: { $set: s.progress },
      })).startEval(inputs, state.algoCode);

      setState({ result: { $set: result } });
    } catch (err: any) {
      setState({ messages: { warnings: { $push: [getErrorMsg(err, globalContext.settings.debug)] } }, status: { $set: 'error' } });
    }
  };

  const handleStop = () => {
    algoService.stop();
  };

  const handleLeverage = (checked: boolean) => {
    setState({ inputs: {
      enableLeverage: { $set: checked },
      ...(checked ? { initMargin: { $set: 0.5 }, minMargin: { $set: 0.3 } } : { initMargin: { $set: 0 }, minMargin: { $set: 0 } }),
    } });
  };

  // Components

  const buttons = (<>
    <Button type='primary' disabled={state.status === 'running'} onClick={handleStart}>Start</Button>
    <Button disabled={state.status !== 'running'} onClick={handleStop}>Stop</Button>
    <Button disabled={!hasResult} onClick={handleReset}>Reset</Button>
  </>);

  // Render

  return (
    <div className='algo'>
      <Helmet>
        <title>InvestTester | Algo Trading</title>
        <link rel="canonical" href="https://InvestTester.com/algo-trading" />
        <meta name="description" content="Create and backtest algo trading strategies and asset allocations using JavaScript" />
      </Helmet>
      <Space.Compact className='algo-inputs'>
        <Row gutter={[{ xs: 8, sm: 16 }, { xs: 8, sm: 16 }]}>
          <Col xs={24} sm={12} xl={9}>
            <InputAddon forceUnround addonBefore={<InfoPopover content='Ticker' width={375} popover={Globals.inputs.tickerPopover} />}>
              <TickersSelector.Multi
                tickers={state.inputs.assetCodes}
                onChange={values => setState({ inputs: { assetCodes: { $set: values } } })}
              />
            </InputAddon>
          </Col>
          <Col xs={24} sm={12} xl={6}>
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
          <Col xs={24} sm={12} xl={6}>
            <InputAddon addonBefore='Date' forceUnround>
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
              />
            </InputAddon>
          </Col>
          <Col xs={24} sm={12} xl={3}>
            <InputAddon addWrapper={true}>
              <Checkbox
                checked={state.inputs.enableLeverage}
                onChange={e => handleLeverage(e.target.checked)}
                style={{ width: '100%' }}
              >
                <InfoPopover content='Leverage' popover='Enable short selling' style={{ whiteSpace: 'nowrap' }} />
              </Checkbox>
            </InputAddon>
          </Col>
          {state.inputs.enableLeverage && (
            <>
              <Col xs={24} sm={12} xl={4}>
                <InputMask
                  type='text'
                  addonBefore={<InfoPopover content='Init. Margin' width={275} popover='Balance needed to open a short trade (Init. Margin > Balance / Short Trade)' />}
                  maskProps={{
                    suffix: '%',
                    value: toPercent(state.inputs.initMargin),
                    onValueChange: (values) => setState({ inputs: { initMargin: { $set: fromPercent(+values.value) } } }),
                  }}
                />
              </Col>
              <Col xs={24} sm={12} xl={4}>
                <InputMask
                  type='text'
                  addonBefore={<InfoPopover content='Min. Margin' width={325} popover='Minimum value needed to keep a short position (Min. Margin > Balance / Short Position)' />}
                  maskProps={{
                    suffix: '%',
                    value: toPercent(state.inputs.minMargin),
                    onValueChange: (values) => setState({ inputs: { minMargin: { $set: fromPercent(+values.value) } } }),
                  }}
                />
              </Col>
            </>
          )}
        </Row>
      </Space.Compact>

      <Row
        className='algo-simulator'
        gutter={[
          { xs: 0, sm: 0, md: 0, lg: 16 },
          { xs: 30, sm: 30, md: 30, lg: 0 }
        ]}
      >
        <Col className='algo-editor' xs={24} lg={12}>
          <Row>
            <Col xs={24}>
              <CodeEditor
                name='code-editor'
                className='code-editor'
                defaultValue={state.algoCode}
                value={state.algoCode}
                onChange={e =>  setState({ algoCode: { $set: e } })}
              />
              {layoutContext.isMobile ? <div className='mobile-btns'>{buttons}</div> : <></>}
            </Col>
          </Row>
        </Col>
        <Col className='algo-output' xs={24} lg={12}>
          <Row gutter={[{ xs: 20, sm: 16 }, { xs: 20, sm: 16 }]}>
            <Col className='algo-results' xs={24}>
              <ResultsBox.Perfomance status={state.status} result={state.result}  />
            </Col>
            <Col className='algo-messages' xs={24}>
              <ResultsBox.Messages show={hasResult} messages={state.messages} />
            </Col>
          </Row>
        </Col>
      </Row>

      {!layoutContext.isMobile ? <div className='desktop-btns'>{buttons}</div> : <></>}
    </div>
  );
};

export default AlgoTrading;
