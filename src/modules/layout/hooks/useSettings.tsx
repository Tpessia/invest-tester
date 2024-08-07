import { fromPercent, loadScript, toPercent } from '@utils/index';
import TickersSelector from '@/modules/algo-trading/components/TickersSelector';
import { ChartProps } from '@/modules/core/components/Chart';
import InputMask from '@/modules/core/components/InputMask';
import GlobalContext from '@/modules/core/context/GlobalContext';
import { Globals } from '@/modules/core/modles/Globals';
import variables from '@/styles/variables';
import { Button, Modal, Select, Switch } from 'antd';
import { useContext } from 'react';
import './SettingsModal.scss';

const SettingsModal: React.FC = ()  => {
  const globalContext = useContext(GlobalContext);

  const setSettings = (settings: Partial<typeof Globals.settings>) => {
    const newSettings = { ...globalContext.settings, ...settings };
    globalContext.setContext({ settings: { $set: newSettings } });
    localStorage.setItem(Globals.cache.settings, JSON.stringify(newSettings));
  };

  const handleReset = () => {
    const reset = window.confirm('Are you sure you want to reset all inputs?\nIt is recommended to save a copy of the inputs and code before continuing!');
    if (reset) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleDebug = async (on: boolean) => {
    setSettings({ debug: on });

    const oldScripts = document.querySelectorAll('.eruda-script');
    oldScripts.forEach(script => script?.remove());

    const eruda = () => (window as any)?.eruda;

    if (on) {
      await loadScript('https://cdn.jsdelivr.net/npm/eruda@3.0.1', undefined, ['eruda-script']);
      eruda()?.init();
    } else {
      if (eruda()) {
        eruda().destroy();
        delete (window as any).eruda;
      }
    }
  };

  return (
    <div className='settings-modal'>
      <div className='item'>
        <span className='label'>Reset all inputs and code</span>
        <Button type='primary' onClick={handleReset}>Reset</Button>
      </div>
      <div className='item'>
        <span className='label'>Debug</span>
        <Switch defaultChecked={globalContext.settings.debug} onChange={handleDebug} />
      </div>
      <div className='item'>
        <span className='label'>Chart Type</span>
        <Select
          value={globalContext.chartType}
          onChange={e => globalContext.setContext({ chartType: { $set: e as ChartProps['type'] } })}
          dropdownStyle={{ minWidth: 110 }}
          options={[{ value: 'linear', label: <span>Linear</span> }, { value: 'log', label: <span>Log</span> }]}
        />
      </div>
      <div className='item'>
        <span className='label'>Risk Free Rate</span>
        <span style={{ width: '80px' }}>
          <InputMask
            maskProps={{
              suffix: '%',
              value: toPercent(globalContext.settings.riskFreeRate),
              onValueChange: (values) => setSettings({ riskFreeRate: fromPercent(+values.value) }),
            }}
          />
          </span>
      </div>
      <div className='item'>
        <span className='label'>Market Benchmark</span>
        <span style={{ width: '100px' }}>
          <TickersSelector.Single
            ticker={globalContext.settings.marketBenchmark}
            onChange={e => setSettings({ marketBenchmark: e })}
          />
        </span>
      </div>
    </div>
  );
};

export default function useSettings() {
  const [modal, modalNode] = Modal.useModal();

  const openModal = () => modal.info({
    title: <div style={{ marginBottom: '15px' }}>Settings</div>,
    content: <SettingsModal />,
    icon: null,
    closable: true,
    maskClosable: true,
    width: 350,
    footer: null,
    styles: { content: { border: `1px solid ${variables.borderColorBase}` } },
  });

  return { openModal, modalNode };
}
