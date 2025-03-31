import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { WalletContextProvider } from './components/WalletProvider';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <WalletContextProvider>
        <App />
      </WalletContextProvider>
    </ConfigProvider>
  </React.StrictMode>
);
