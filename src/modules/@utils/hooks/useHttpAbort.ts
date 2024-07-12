import { HttpServiceAbort } from '@core/services/HttpService';
import { useEffect } from 'react';

// Hook to abort pending http requests
export default function useHttpAbort() {
  useEffect(() => () => {
    HttpServiceAbort(); 
  }, []);
}
