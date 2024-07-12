import { tryParseJson } from '@/modules/@utils';
import useStateImmutable from '@/modules/@utils/hooks/useStateImmutable';
import AlgoDocs from '@/modules/algo-docs/scenes/AlgoDocs';
import AlgoTrading from '@/modules/algo-trading/scenes/AlgoTrading';
import AppLayout from '@/modules/layout/components/AppLayout';
import Portfolio from '@/modules/portfolio/scenes/Portfolio';
import GlobalContext, { GlobalContextType } from '@core/context/GlobalContext';
import { Globals } from '@core/modles/Globals';
import { orderBy } from 'lodash-es';
import { useEffect, useMemo } from 'react';
import { Outlet, Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<AppLayout><Outlet/></AppLayout>} errorElement={<AppLayout>404 Route not found</AppLayout>}>
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

  const [globalContext, setGlobalContext] = useStateImmutable<GlobalContextType>(() => ({
    debug: false,
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
  }));

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
