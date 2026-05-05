import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Import Bootstrap SCSS with IMTECH customizations
import './styles/imtech-bootstrap.scss';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
