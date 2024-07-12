import { DependencyList, useEffect } from 'react';

type EffectAsyncCallback = () => Promise<any>;

// Hook that allows the usage of async methods inside useEffects hook
export default function useEffectAsync(effect: EffectAsyncCallback, deps?: DependencyList) {
  useEffect(() => {
    (async () => effect())();
  }, deps);
}
