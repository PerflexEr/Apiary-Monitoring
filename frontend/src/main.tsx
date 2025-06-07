import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline } from '@mui/material';
import App from './App';
import { StoreProvider } from './context/StoreContext';
import './index.css';
import axios from 'axios';

// Configure axios defaults
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreProvider>
      <CssBaseline />
      <App />
    </StoreProvider>
  </React.StrictMode>
);
