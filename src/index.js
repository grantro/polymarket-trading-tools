import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { AppProvider } from './context/AppContext';

const root = document.getElementById('root');
root.setAttribute('data-csp', 'script-src \'self\' \'unsafe-eval\'');

ReactDOM.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>,
  root
);