import { fromPercent, getErrorMsg, jsonDateReviver, decodeUrlParams, toPercent, tryParseJson, encodeUrlParams } from '@/modules/@utils';
import useFormatCurrency from '@/modules/@utils/hooks/useFormatCurrency';
import useService from '@/modules/@utils/hooks/useService';
import useStateImmutable from '@/modules/@utils/hooks/useStateImmutable';
import useThrottle from '@/modules/@utils/hooks/useThrottle';
import ResultsBox from '@/modules/algo-trading/components/ResultsBox';
import TickersSelector from '@/modules/algo-trading/components/TickersSelector';
import { AlgoInputs } from '@/modules/algo-trading/models/AlgoInputs';
import { AlgoResult } from '@/modules/algo-trading/models/AlgoResult';
import { AlgoMessages, AlgoStatus, initAlgoMessages } from '@/modules/algo-trading/models/AlgoState';
import { AlgoService } from '@/modules/algo-trading/services/AlgoService';
import { MinusOutlined, PlusOutlined, ShareAltOutlined } from '@ant-design/icons';
import DateRangePicker from '@core/components/DateRangePicker';
import InfoPopover from '@core/components/InfoPopover';
import InputAddon from '@core/components/InputAddon';
import InputMask from '@core/components/InputMask';
import GlobalContext, { UrlMode } from '@core/context/GlobalContext';
import { Globals } from '@core/modles/Globals';
import { Button, Checkbox, Col, notification, Row, Space } from 'antd';
import dayjs from 'dayjs';
import { round, sum, uniqBy } from 'lodash-es';
import { useContext, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { NumericFormatProps } from 'react-number-format';
import { useLocation } from 'react-router-dom';
import './Portfolio.scss';

interface State {
  inputs: {
    assets: { assetCode: string, percentual: number }[];
    initCash: number;
    monthlyDeposits: number,
    start: Date;
    end: Date;
    rebalance: boolean;
    download: boolean;
  };
  status: AlgoStatus;
  messages: AlgoMessages;
  progress: number;
  result?: AlgoResult;
}

const initState = (urlMode: UrlMode): State => ({
  inputs: tryParseJson(localStorage.getItem(Globals.cache.portfolioInputs), jsonDateReviver) || {
    assets: (Globals.inputs.assets[urlMode || Globals.inputs.mode]).map((a, i, arr) => ({ assetCode: a, percentual: i === arr.length - 1 ? 1 - (arr.length - 1) * +(1 / arr.length).toFixed(2) : +(1 / arr.length).toFixed(2) })),
    initCash: 1000000,
    monthlyDeposits: 0,
    start: Globals.inputs.start,
    end: Globals.inputs.end,
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
  const formatCurrency = useFormatCurrency();

  const [nApi, nContext] = notification.useNotification();

  const algoService = useService(AlgoService, svc => svc.init(s => setState({
    status: { $set: s.status },
    messages: { $set: s.messages },
    // progress: { $set: s.progress },
  })));

  // State

  const [state, setState] = useStateImmutable(() => initState(globalContext.urlMode));

  // Effects

  useEffect(() => {
    if (location.search) {
      const inputs = new URLSearchParams(location.search).get(shareLinkParam);
      if (inputs) {
        const { assets, initCash, monthlyDeposits, start, end, rebalance, download } = decodeUrlParams(inputs) as State['inputs'];
        setState({ inputs: { $set: { assets, initCash, monthlyDeposits, start, end, rebalance, download } } });
      }
    }
  }, [location.search]);

  useEffect(useThrottle(() => {
    localStorage.setItem(Globals.cache.portfolioInputs, JSON.stringify(state.inputs));
  }, 1000, { leading: false }), [...Object.values(state.inputs)]);

  // Values

  const maskProps: NumericFormatProps = {
    thousandSeparator: '.',
    decimalSeparator: ',',
    allowNegative: false,
    fixedDecimalScale: true,
    decimalScale: 2,
  };

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
      const result = await algoService.init(s => setState({
        status: { $set: s.status },
        messages: { $set: s.messages },
        // progress: { $set: s.progress },
      })).start(inputs, async function () {
        this.on('start', async (next) => {
          this.state.prevDate = this.date;
          this.state.assetDates = state.inputs.assets.reduce((acc, val) => ({
            ...acc,
            [val.assetCode]: {
              start: algoService.getFirstAsset(val.assetCode)!.date,
              end: algoService.getLastAsset(val.assetCode)!.date,
            }
          }), {} as Record<string, { start: Date, end: Date }>);
          next();
        });

        this.on('data', async (next) => {
          const nextMonth = new Date(this.state.prevDate.getFullYear(), this.state.prevDate.getMonth() + 1, this.state.prevDate.getDate(), 0, 0, 0);
          const isNewMonth = this.date.getTime() > nextMonth.getTime();

          if (isNewMonth) {
            this.state.prevDate = this.date;
            if (state.inputs.monthlyDeposits) {
              this.print(`Depositing: ${formatCurrency(state.inputs.monthlyDeposits)}`);
              this.injectCash(state.inputs.monthlyDeposits);
            }
          }

          const totalValue = this.portfolio.total;
          let targetAssetValues = state.inputs.assets.reduce((acc, val) => ({ ...acc, [val.assetCode]: totalValue * val.percentual }), {} as Record<string, any>);

          if (state.inputs.rebalance) {
            const activeAssets = state.inputs.assets.filter(e => this.date >= this.state.assetDates[e.assetCode].start && this.state.assetDates[e.assetCode].end >= this.date);
            const activePercent = sum(activeAssets.map(e => e.percentual));
            targetAssetValues = activeAssets.reduce((acc, val) => ({ ...acc, [val.assetCode]: totalValue * (val.percentual + (1 - activePercent) * (val.percentual / activePercent)) }), {} as Record<string, number>);
          }

          let cash = this.portfolio.cash;
          for (let i in this.assets) {
            const asset = this.assets[i];
            const portAsset = this.portfolio.assets[asset.assetCode];

            const targetValue = targetAssetValues[asset.assetCode] ?? 0;
            const currentValue = (portAsset?.value ?? 0) * (portAsset?.quantity ?? 0);

            const diffAmount = targetValue - currentValue;
            const diffAmountMin = Math.min(diffAmount, cash);

            const diffQnt = diffAmountMin > 0 ? Math.floor(diffAmountMin / asset.value) : Math.ceil(diffAmountMin / asset.value);
            const currency = globalContext.currencyOptions.find(e => e.currency === asset.currency)?.symbol ?? asset.currency ?? globalContext.currency.symbol;

            if (diffQnt > 0) {
              cash -= diffAmountMin;
              const canBuy = state.inputs.rebalance || currentValue === 0;
              if (canBuy) {
                this.print(`[${asset.assetCode}] Buying ${diffQnt} x ${formatCurrency(asset.value, { prefix: `${currency} ` })}`);
                this.buy(asset.assetCode, diffQnt);
              }
            } else if (diffQnt < 0) {
              const canRebalance = state.inputs.rebalance && isNewMonth;
              if (canRebalance) {
                this.print(`[${asset.assetCode}] Rebalancing: ${diffQnt} x ${formatCurrency(asset.value, { prefix: `${currency} ` })}`);
                this.sell(asset.assetCode, -diffQnt);
              }
            }
          }
          next();
        });

        this.on('end', async (next, result) => {
          if (state.inputs.download) this.download(result, 'result');
          next();
        });

        this.on('error', async (next, errors) => {
          this.print('Error:', JSON.stringify(errors));
          next();
        });
      });

      console.log('result', result);
      setState({ result: { $set: result } });
    } catch (err: any) {
      setState({ messages: { warnings: { $push: [getErrorMsg(err, globalContext.debug)] } }, status: { $set: 'error' } });
    }
  };

  const handleStop = () => {
    algoService.stop();
  };

  const handleShare = () => {
    const urlParams = encodeUrlParams(state.inputs);
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
                  ...maskProps,
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
                  ...maskProps,
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
                        onChange={e => setState({ inputs: { assets: { [i]: { assetCode: { $set: e?.trim() ?? '' } } } } })}
                      />
                    </InputAddon>
                  </Col>
                  <Col xs={16} sm={16} xl={9}>
                    <InputMask
                      type='text'
                      addonBefore='Percent'
                      maskProps={{
                        ...maskProps,
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
        <Row gutter={[{ xs: 8, sm: 16 }, { xs: 8, sm: 16 }]}>
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