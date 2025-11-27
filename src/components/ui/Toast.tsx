'use client';

import { useEffect } from 'react';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { MdErrorOutline } from 'react-icons/md';

type ToastType = 'success' | 'error';

type ToastProps = {
  message: string;
  type?: ToastType;
  onClose: () => void;
  durationMs?: number;
};

export default function Toast({
  message,
  type = 'success',
  onClose,
  durationMs = 4000,
}: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, durationMs);
    return () => clearTimeout(t);
  }, [onClose, durationMs]);

  const base =
    'pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg shadow-black/40 text-sm border';
  const variant =
    type === 'success'
      ? 'bg-emerald-600/95 border-emerald-300/50 text-white'
      : 'bg-red-600/95 border-red-300/50 text-white';

  const Icon = type === 'success' ? IoMdCheckmarkCircleOutline : MdErrorOutline;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-9999">
      <div className={`${base} ${variant}`}>
        <Icon className="w-5 h-5 shrink-0" />
        <span className="whitespace-pre-line">{message}</span>
      </div>
    </div>
  );
}