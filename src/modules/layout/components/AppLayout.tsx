import GlobalContext from '@/modules/core/context/GlobalContext';
import variables from '@/styles/variables';
import { MenuOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, Drawer, Layout, Select, ThemeConfig, theme } from 'antd';
import React, { PropsWithChildren, useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LayoutContext from '../context/LayoutContext';
import AppBarMenu from './AppBarMenu';
import './AppLayout.scss';
import logo from '/logo/logo.svg';

const customTheme: ThemeConfig = {
  hashed: false,
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: variables.primaryColor,
    colorBorder: variables.borderColorBase,
    colorBgBase: variables.componentBackground,
    colorBgContainer: variables.componentBackground,
    colorBgElevated: variables.bodySecundary,
    colorBgLayout: variables.bodyBackground,
    controlItemBgActive: variables.itemActiveBg,
    colorTextBase: variables.txtColor,
    colorLink: variables.primaryColor3,
  },
  components: {
    Layout: {
      headerBg: variables.componentBackground,
    },
    Menu: {
      darkItemBg: variables.componentBackground,
      itemColor: variables.txtColor,
      itemHoverColor: variables.primaryColor3,
      itemSelectedColor: variables.primaryColor3,
    },
    Drawer: {
      colorBgElevated: variables.componentBackground,
    },
    Tabs: {
      itemColor: variables.txtColor,
      itemHoverColor: variables.primaryColor3,
      itemSelectedColor: variables.primaryColor3,
    },
    Modal: {
      colorBgElevated: variables.componentBackground,
    },
  },
};

const { Header, Content, Footer } = Layout;

interface State {
  width: number,
  height: number,
  visible: boolean
}

const AppLayout: React.FC<PropsWithChildren> = (props)  => {
  const location = useLocation();
  const globalContext = useContext(GlobalContext);

  const [state, setState] = useState<State>({
    width: window.innerWidth,
    height: window.innerHeight,
    visible: false
  });

  useEffect(() => {
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const isMobile = () => state.width < variables.sizeMd;

  const updateDimensions = () => {
    setState({
      width: window.innerWidth,
      height: window.innerHeight,
      visible: !isMobile() && state.visible ? false : state.visible
    })
  };

  const showDrawer = () => {
    setState({
      ...state,
      visible: true,
    })
  };

  const handleClose = () => {
    setState({
      ...state,
      visible: false,
    })
  }

  return (
    <ConfigProvider theme={{ ...customTheme }}>
      <LayoutContext.Provider
        value={{
          screenHeight: state.height,
          screenWidth: state.width,
          isMobile: isMobile(),
        }}
      >
        <Layout className='layout'>
          <Header className='header' style={{ padding: isMobile() ? '0 0 0 15px' : '0 50px' }}>
            <div className='logo'>
              <Link to='/'>
                <img src={logo} alt='Logo' width='64px' height='64px' />
              </Link>
            </div>
            <div className='select'>
              <Select
                value={globalContext.currency.currency}
                onChange={e => globalContext.setCurrency(e)}
                dropdownStyle={{ minWidth: 110 }}
                options={globalContext.currencyOptions.map(e => ({ value: e.currency, label: <span>{e.currency} ({e.symbol})</span> }))}
              />
            </div>
            {isMobile() ? (
              <Button className='mobile-menu' type='text' onClick={showDrawer}>
                <MenuOutlined />
              </Button>
            ) : (
              <AppBarMenu horizontal={true} pathname={location.pathname} />
            )}
          </Header>

          <Drawer
            styles={{
              header: { padding: '16px' },
              body: { padding: 0 },
            }}
            title='InvestTester'
            placement='left'
            closable={false}
            onClose={handleClose}
            open={state.visible}
          >
            <AppBarMenu horizontal={false} pathname={location.pathname} onSelect={handleClose} />
          </Drawer>

          <Content className='content'>
            <div>
              {props.children}
            </div>
          </Content>

          <Footer className='footer'>
            InvestTester | Created by <a style={{ fontWeight: 500 }} href='https://github.com/Tpessia/' target='_blank' rel='noopener noreferrer'>Tpessia</a>
          </Footer>
        </Layout>
      </LayoutContext.Provider>
    </ConfigProvider>
  );
}

export default AppLayout;