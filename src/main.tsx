import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from '@/App';
import '@/theme/global.css';

function applyWpaModeClass() {
  const standaloneMedia = window.matchMedia('(display-mode: standalone)');
  const isStandalone = standaloneMedia.matches || ((window.navigator as Navigator & { standalone?: boolean }).standalone ?? false);

  document.documentElement.classList.toggle('wpa-mode', isStandalone);
  document.body.classList.toggle('wpa-mode', isStandalone);
}

function registerWpaModeListener() {
  const standaloneMedia = window.matchMedia('(display-mode: standalone)');
  const handleModeChange = () => applyWpaModeClass();

  if (typeof standaloneMedia.addEventListener === 'function') {
    standaloneMedia.addEventListener('change', handleModeChange);
    return;
  }

  standaloneMedia.addListener(handleModeChange);
}

applyWpaModeClass();
registerWpaModeListener();
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
