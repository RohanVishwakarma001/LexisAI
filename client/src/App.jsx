import React from 'react';
import { AppRouter } from '@/app/routes';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <AppRouter />
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: '!bg-surface-container-high !text-on-surface !border !border-outline-variant/30',
          style: {
            borderRadius: '8px',
          },
        }}
      />
    </>
  );
}

export default App;
