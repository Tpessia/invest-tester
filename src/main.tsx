import 'reflect-metadata';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.scss';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

import { initInstallPWA, registerWorker } from '@utils/index';

initInstallPWA();
registerWorker();