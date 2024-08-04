import AppLayout from '@/modules/layout/components/AppLayout';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

const ErrorPage: React.FC = () => {
  const error = useRouteError();
  console.log('error', error);

  const errorMsg = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : `Error: ${(error as Error)?.message || error?.toString()}`;

  return (
    <AppLayout>{errorMsg}</AppLayout>
  );
};

export default ErrorPage;