import { useRenderCount } from '@utils/index';
import { DebouncedFunc, ThrottleSettings, debounce } from 'lodash-es';
import { useCallback, useEffect, useRef } from 'react';

export function useDebounce<T extends (...args: any) => any>(callback: T, delay: number, options?: ThrottleSettings): DebouncedFunc<T> {
  const renderCount = useRenderCount();
  const inputsRef = useRef({ callback, delay }); // mutable ref like with useThrottle
  useEffect(() => { inputsRef.current = { callback, delay }; }); //also track cur. delay
  return useCallback(
    debounce((...args: any) => {
        // Debounce is an async callback. Cancel it, if in the meanwhile
        // (1) component has been unmounted (see isMounted in snippet)
        // (2) delay has changed
        if (inputsRef.current.delay === delay && renderCount() !== -1)
          inputsRef.current.callback(...args);
      }, delay, options
    ),
    [delay, debounce]
  );
}
