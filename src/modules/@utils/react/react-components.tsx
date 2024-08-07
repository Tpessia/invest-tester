import { Suspense } from 'react';
import { Await } from 'react-router-dom';

export interface AsyncComponentProps {
  data: Promise<any> | undefined;
  render: (data: any) => React.ReactNode;
  fallback?: React.ReactNode;
  errorElement?: React.ReactNode;
}

export const AsyncComponent: React.FC<AsyncComponentProps> = (props) => {
  return (
    <Suspense fallback={props.fallback}>
      <Await resolve={props.data} errorElement={props.errorElement}>
        {(data) => props.render(data)}
      </Await>
    </Suspense>
  );
}