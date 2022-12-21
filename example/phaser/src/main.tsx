import React from 'react';
import ReactDOM from 'react-dom/client';
import { RecoilRoot } from 'recoil';
import './index.css';
import './PhaserGame';
import { RouterConfig } from './RouterConfig';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RecoilRoot>
      <RouterConfig />
    </RecoilRoot>
  </React.StrictMode>
);
