import { loadScript } from '@/modules/@utils';
import GlobalContext from '@/modules/core/context/GlobalContext';
import variables from '@/styles/variables';
import { Button, Modal, Switch } from 'antd';
import { useContext } from 'react';

export default function useSettings() {
  const globalContext = useContext(GlobalContext);
  const [modal, modalNode] = Modal.useModal();

  const handleReset = () => {
    const reset = window.confirm('Are you sure you want to reset all inputs?\nIt is recommended to save a copy of the inputs and code before continuing!');
    if (reset) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleDebug = async (on: boolean) => {
    globalContext.setContext({ debug: { $set: on } });

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

  const openModal = () => modal.info({
    title: <div style={{ marginBottom: '15px' }}>Settings</div>,
    content: (<>
      <div style={{ display: 'flex', marginBottom: '15px' }}>
        <span style={{ marginRight: '10px', flex: 1 }}>Reset all inputs and code</span>
        <Button type='primary' onClick={handleReset}>Reset</Button>
      </div>
      <div style={{ display: 'flex', marginBottom: '15px' }}>
        <span style={{ marginRight: '10px', flex: 1 }}>Debug</span>
        <Switch defaultChecked={globalContext.debug} onChange={handleDebug} />
      </div>
    </>),
    icon: null,
    closable: true,
    maskClosable: true,
    width: 350,
    footer: null,
    styles: { content: { border: `1px solid ${variables.borderColorBase}` } },
  });

  return { openModal, modalNode };
}
