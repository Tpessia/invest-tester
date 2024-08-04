import AlgoDocs from '@/modules/algo-docs/scenes/AlgoDocs';
import AlgoTrading from '@/modules/algo-trading/scenes/AlgoTrading';
import AppLayout from '@/modules/layout/components/AppLayout';
import ErrorPage from '@/modules/layout/scenes/ErrorPage';
import Portfolio from '@/modules/portfolio/scenes/Portfolio';
import GlobalContext, { GlobalContextType } from '@core/context/GlobalContext';
import { Globals } from '@core/modles/Globals';
import { tryParseJson, useStateImmutable } from '@utils/index';
import { orderBy } from 'lodash-es';
import { useEffect, useMemo } from 'react';
import { Outlet, Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<AppLayout><Outlet/></AppLayout>} errorElement={<ErrorPage />}>
      <Route index element={<Portfolio/>} />
      <Route path="algo-trading" element={<AlgoTrading/>} />
      <Route path="docs" element={<AlgoDocs/>} />
    </Route>
  )
);

const App: React.FC = () => {
  const currencyOptions = useMemo(() => orderBy(Globals.countries.countries, [
    e => [...Globals.inputs.currencyOrder].reverse().indexOf(e.currency) * -1,
    'currency',
  ]), []);

  const [globalContext, setGlobalContext] = useStateImmutable<GlobalContextType>(() => {
    const settings: typeof Globals.settings = tryParseJson(localStorage.getItem(Globals.cache.settings)) ?? Globals.settings;
    const context: GlobalContextType = {
      isBot: new URLSearchParams(window.location.search).get('headless')?.toLowerCase() == 'true',
      urlMode: new URLSearchParams(window.location.search).get('m')?.toUpperCase(),
      currencyOptions,
      currency: tryParseJson(localStorage.getItem(Globals.cache.currency)) || currencyOptions[0],
      setCurrency: c => {
        const currency = currencyOptions.find(e => e.currency === c);
        if (currency == null) throw new Error('Invalid currency');
        setGlobalContext({ currency: { $set: currency } });
        localStorage.setItem(Globals.cache.currency, JSON.stringify(currency));
      },
      setContext: undefined as any,
      chartType: 'linear',
      settings,
    };
    return context;
  });

  useEffect(() => {
    if (globalContext.urlMode && !localStorage.getItem(Globals.cache.currency))
      globalContext.setCurrency(globalContext.urlMode as string);
  }, []);

  return (
    <GlobalContext.Provider value={{ ...globalContext, setContext: setGlobalContext }}>
      <RouterProvider router={router}/>
    </GlobalContext.Provider>
  )
}

export default App;
