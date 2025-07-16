import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div>
      <Toaster
        toastOptions={{
          style: {
            width: 'fit-content',
            fontWeight: 'bold'
          }
        }}
      />
      <App />
    </div>
  </StrictMode>
);
