import { DebouncedFunc, ThrottleSettings, throttle } from 'lodash-es';
import { useCallback, useEffect, useRef } from 'react';

export default function useThrottle<T extends (...args: any) => any>(callback: T, delay: number, options?: ThrottleSettings): DebouncedFunc<T> {
  // const options = { leading: true, trailing: false }; // add custom lodash options
  const cbRef = useRef(callback);
  // use mutable ref to make useCallback/throttle not depend on `cb` dep
  useEffect(() => { cbRef.current = callback; });
  return useCallback(
    throttle((...args: any) => cbRef.current(...args), delay, options),
    [delay]
  );
}
