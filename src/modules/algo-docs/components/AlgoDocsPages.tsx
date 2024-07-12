import DocsAlgoTrading from '@/modules/algo-docs/components/DocsAlgoTrading';
import DocsPlatform from '@/modules/algo-docs/components/DocsPlatform';
import DocsPortfolio from '@/modules/algo-docs/components/DocsPortfolio';
import DocsResults from '@/modules/algo-docs/components/DocsResults';
import DocsTickerModifiers from '@/modules/algo-docs/components/DocsTickerModifiers';
import DocsTickerOverview from '@/modules/algo-docs/components/DocsTickerOverview';
import DocsTickerRegional from '@/modules/algo-docs/components/DocsTickerRegional';
import DocsTickerYahoo from '@/modules/algo-docs/components/DocsTickerYahoo';
import { AccountBookOutlined, AppstoreOutlined, AreaChartOutlined, CalculatorOutlined, MenuFoldOutlined, MenuUnfoldOutlined, RobotOutlined } from '@ant-design/icons';
import { ItemType, MenuItemType } from 'antd/es/menu/interface';

export type MenuKey = 'collapse' | 'platform' |
  'ticker-overview' | 'ticker-yahoo' | 'ticker-modifiers' | 'ticker-regional' |
  'portfolio' | 'algo-trading' | 'results';

export type MenuTypeItem = MenuItemType & { key: MenuKey };
export type MenuType = ItemType<MenuTypeItem>;

export const AlgoDocsIndex: Record<MenuKey, React.ReactNode> = {
  'collapse': <></>,
  'platform': <DocsPlatform />,
  'ticker-overview': <DocsTickerOverview />,
  'ticker-yahoo': <DocsTickerYahoo />,
  'ticker-modifiers': <DocsTickerModifiers />,
  'ticker-regional': <DocsTickerRegional />,
  'portfolio': <DocsPortfolio />,
  'algo-trading': <DocsAlgoTrading />,
  'results': <DocsResults />,
};

export const AlgoDocsMenus = (collapsed: boolean): MenuType[] => ([
  {
    key: 'collapse',
    label: <i>Collapse</i>,
    icon: collapsed ? <MenuUnfoldOutlined className='doc-icon' /> : <MenuFoldOutlined className='doc-icon' />,
  },
  {
    key: 'platform',
    label: 'Platform',
    icon: <AppstoreOutlined className='doc-icon' />,
  },
  {
    key: 'tickers',
    label: 'Tickers',
    icon: <AccountBookOutlined className='doc-icon' />,
    children: [
      ...wrapGroup([
        { key: 'ticker-overview', label: 'Overview' },
        { key: 'ticker-yahoo', label: 'Yahoo' },
        { key: 'ticker-modifiers', label: 'Modifiers' },
      ], { key: 'g-tickers', label: 'Tickers', type: 'group' }, collapsed),
      {
        key: 'regional',
        label: 'Regional',
        type: 'group',
        children: [
          { key: 'ticker-regional', label: 'Brazil' },
        ],
      },
    ],
  },
  {
    key: 'portfolio',
    label: 'Portfolio',
    icon: <CalculatorOutlined className='doc-icon' />,
  },
  {
    key: 'algo-trading',
    label: 'Algo Trading',
    icon: <RobotOutlined className='doc-icon' />,
  },
  {
    key: 'results',
    label: 'Results',
    icon: <AreaChartOutlined className='doc-icon' />,
  },
]);

export const findMenuParents = (menuItems: MenuType[], key: MenuKey) => {
  return menuItems.filter(e => e?.key === key || ((e as any)?.children as MenuType[])?.some(f => f?.key === key)) as MenuTypeItem[];
}

export const findMenuItems = (menuItems: MenuType[], key: MenuKey) => {
  return menuItems.flatMap(e => [e, ...((e as any)?.children as MenuType[] ?? [])]).filter(e => e?.key === key) as MenuTypeItem[];
}

// Workaround to show title when collapsed
function wrapGroup(menuItems: MenuType[], group: MenuType, condition: boolean): MenuType[] {
  if (condition) {
    return [{ ...group, children: menuItems }] as MenuType[];
  } else {
    return menuItems;
  }
}
