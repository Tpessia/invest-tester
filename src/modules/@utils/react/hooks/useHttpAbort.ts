import { HttpServiceAbort } from '@core/services/HttpService';
import { useEffect } from 'react';

// Hook to abort pending http requests
export function useHttpAbort() {
  useEffect(() => () => {
    HttpServiceAbort(); 
  }, []);
}
