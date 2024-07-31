import { AlgoDocsIndex, AlgoDocsMenus, MenuKey, findMenuParents } from '@/modules/algo-docs/components/AlgoDocsPages';
import LayoutContext from '@/modules/layout/context/LayoutContext';
import { Col, Menu, Row } from 'antd';
import clsx from 'clsx';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, useNavigate } from 'react-router-dom';
import './AlgoDocs.scss';

const Docs: React.FC = () => {
  // DOCS:
  // 1. Tickers
  // 1.1. Overview (Fixed rate asset)
  // 1.2. Yahoo (Exchanges and data providers)
  // 1.3. Modifiers (Currency, Rate)
  // 1.4. Regional (Brazil - IPCA.SA, SELIC.SA, IMAB.SA, NTN-B/YYYY.SA)
  // 2. Portfolio (Summary, Fields (Tickers (reference 1. Tickers), Balance, Deposits, Date, Rebalance, Download, Percent, Result (reference 4. Results)))
  // 3. Algo Trading (Description, Fields (Tickers (reference 1. Tickers), Balance, Date, Leverage, Init. Margin, Min. Margin, Code, Result (reference 4. Results)), Code (AlgoWorkspace))
  // 4. Results (Metrics (Summary, Performance, Drawdown, Positions, Quantities, Prices), Messages Output)

  // State

  const defaultKey: MenuKey = new URLSearchParams(window.location.search).get('doc') as MenuKey ?? 'platform';

  const layoutContext = useContext(LayoutContext);

  const [menuKey, setMenuKey] = React.useState<MenuKey>(defaultKey);
  const [collapsed, setCollapsed] = useState<boolean>(() => layoutContext.isMobile!);

  // Dependencies

  const location = useLocation();
  const navigate = useNavigate();

  // Effects

  useEffect(() => {
    const doc = new URLSearchParams(location.search).get('doc');
    if (doc && doc in AlgoDocsIndex) setMenuKey(doc as MenuKey);
  }, [location.search]);

  // Values

  const menuItems = useMemo(() => AlgoDocsMenus(collapsed), [collapsed]);

  // Callbacks

  const handleMenu = (key: MenuKey) => {
    if (key === 'collapse') {
      setCollapsed(!collapsed);
    } else {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('doc', key);
      navigate({ search: searchParams.toString() });
    }
  };

  // Render

  return (
    <div className={clsx('docs', { collapsed })}>
      <Helmet>
        <title>InvestTester | Docs</title>
        <link rel='canonical' href='https://InvestTester.com/docs' />
        <meta property="og:description" content="Documentation for the InvestTester backtesting platform" />
      </Helmet>
      <div className='docs-menu'>
        <Menu
          mode='inline'
          items={menuItems}
          inlineCollapsed={collapsed}
          selectedKeys={[menuKey]}
          onClick={(info) => handleMenu(info.key as MenuKey)}
          defaultSelectedKeys={[menuKey]}
          defaultOpenKeys={findMenuParents(menuItems, defaultKey).map(e => e?.key as MenuKey)}
        />
      </div>
      <Row className='docs-content' gutter={[{ xs: 8, sm: 16 }, { xs: 8, sm: 16 }]}>
        <Col xs={24} lg={24}>
          {AlgoDocsIndex[menuKey] ?? null}
        </Col>
      </Row>
    </div>
  );
};

export default Docs;
