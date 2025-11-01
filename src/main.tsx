import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App';
import AntdProvider from './app/providers/AntdProvider';
import { AuthProvider } from './app/providers/AuthProvider';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AntdProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AntdProvider>
    </BrowserRouter>
  </React.StrictMode>
);

