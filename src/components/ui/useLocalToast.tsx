'use client';

import { useState, useCallback } from 'react';
import Toast from './Toast';

type ToastVariant = 'success' | 'error';

export function useLocalToast() {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastVariant;
    id: number;
  } | null>(null);

  const showToast = useCallback((message: string, type: ToastVariant = 'success') => {
    setToast({ message, type, id: Date.now() });

    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  const ToastComponent = toast ? (
    <Toast
      key={toast.id}
      message={toast.message}
      type={toast.type}
      onClose={() => setToast(null)}
    />
  ) : null;

  return { showToast, ToastComponent };
}