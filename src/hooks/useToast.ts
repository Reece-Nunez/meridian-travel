'use client';

import { useState, useCallback } from 'react';
import { ToastProps } from '@/components/ui/Toast';

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'success', title, message, duration });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'error', title, message, duration });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'warning', title, message, duration });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, duration?: number) => {
    return addToast({ type: 'info', title, message, duration });
  }, [addToast]);

  const confirm = useCallback((
    title: string, 
    message?: string, 
    onConfirm?: () => void, 
    onCancel?: () => void,
    confirmLabel?: string,
    cancelLabel?: string
  ) => {
    const actions = [
      {
        label: cancelLabel || 'Cancel',
        onClick: onCancel || (() => {}),
        style: 'secondary' as const
      },
      {
        label: confirmLabel || 'Confirm',
        onClick: onConfirm || (() => {}),
        style: 'danger' as const
      }
    ];

    return addToast({ 
      type: 'confirm', 
      title, 
      message, 
      duration: 0, // Don't auto-close
      actions 
    });
  }, [addToast]);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    confirm,
    clearAll,
  };
};