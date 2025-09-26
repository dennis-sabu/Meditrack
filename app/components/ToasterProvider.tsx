'use client';

import { Toaster } from 'react-hot-toast';

export default function ToasterProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: { background: '#111827', color: '#fff' },
        success: { style: { background: '#065f46' } },
        error: { style: { background: '#7f1d1d' } },
      }}
    />
  );
}
