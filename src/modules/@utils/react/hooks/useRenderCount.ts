import { useEffect, useRef } from 'react';

// Hook that counts the number of renders (-1 when unmounted)
// Is impacted by React.StrictMode
export function useRenderCount(...deps: any[]) {
  const renderRef = useRef(0);

  useEffect(() => {
    renderRef.current = renderRef.current + 1;
    return () => {
      renderRef.current = -1;
    };
  }, deps);

  return () => renderRef.current;
}
