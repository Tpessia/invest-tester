import { installPWA } from '@utils/index';
import useSettings from '@/modules/layout/hooks/useSettings';
import { DownloadOutlined, GithubOutlined, SettingOutlined } from '@ant-design/icons';
import AppConfig from '@core/services/AppConfig';
import { Menu } from 'antd';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface Props {
  horizontal: boolean,
  pathname: string,
  onSelect?: () => void,
}

const AppBarMenu: React.FC<Props> = (props) => {
  const { openModal, modalNode } = useSettings();

  const navigate = useNavigate();

  const style: React.CSSProperties = props.horizontal
    ? { lineHeight: '64px' }
    : { lineHeight: '64px', width: '100%' };

  return (
    <>
      <Menu
        theme='dark'
        mode={props.horizontal ? 'horizontal' : 'vertical'}
        style={style}
        selectedKeys={[props.pathname]}
        onClick={props.onSelect}
        items={[{
          key: '/',
          label: <Link to='/'>Porfolio</Link>,
        }, {
          key: '/algo-trading',
          label: <Link to='/algo-trading'>Algo Trading</Link>,
        }, {
          key: '/docs',
          label: <Link to='/docs'>Docs</Link>,
        }, {
          key: 'api',
          label: 'API',
          onClick: () => window.open(AppConfig.config.apiUrl, '_blank'),
        }, {
          key: 'settings',
          title: 'Settings',
          label: <span>{!props.horizontal && <span style={{ paddingRight: '8px' }}>Settings</span>}<SettingOutlined style={{ fontSize: '20px' }} /></span>,
          onClick: openModal,
          style: props.horizontal ? { top: '1px', padding: '0px 10px 0px 10px' } : undefined,
        }, {
          key: 'github',
          title: 'GitHub',
          label: <span>{!props.horizontal && <span style={{ paddingRight: '8px' }}>GitHub</span>}<GithubOutlined style={{ fontSize: '20px' }} /></span>,
          onClick: () => window.open('https://github.com/Tpessia/invest-tester', '_blank'),
          style: props.horizontal ? { top: '1px', padding: '0px 10px 0px 10px' } : undefined,
        }, {
          key: 'install',
          title: 'Install PWA',
          label: <span>{!props.horizontal && <span style={{ paddingRight: '8px' }}>Install</span>}<DownloadOutlined style={{ fontSize: '20px' }} /></span>,
          onClick: () => installPWA(),
          style: props.horizontal ? { top: '1px', padding: '0px 10px 0px 10px' } : undefined,
        }]}
      />
      {modalNode}
    </>
  );
};

export default AppBarMenu;