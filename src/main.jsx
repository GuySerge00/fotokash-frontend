import React from 'react'
import ReactDOM from 'react-dom/client'
import FotoKashApp from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <FotoKashApp />
)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
