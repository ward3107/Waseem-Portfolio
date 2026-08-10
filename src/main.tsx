import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { captureAttribution } from '@/lib/attribution';
import './index.css';

// Snapshot UTM params on first paint so the eventual contact-form submit
// can attribute the lead (esp. GBP-sourced traffic via /from-gbp).
captureAttribution();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);