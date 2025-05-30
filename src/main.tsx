import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { setupIonicReact } from '@ionic/react'; // TAMBAHKAN IMPORT INI

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
// Jika Anda punya file variables.css di theme, pastikan path-nya benar
// Contoh: import './theme/variables.css'; 
// Jika tidak, Anda bisa mengomentari baris di atas untuk sementara.

setupIonicReact(); // PANGGIL FUNGSI INI

const container = document.getElementById('root');
if (container) { // Lebih aman menggunakan if check
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Root container missing in index.html');
}