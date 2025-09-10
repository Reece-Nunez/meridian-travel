'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ToastAction {
  label: string;
  onClick: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface ToastProps {
  id?: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'confirm';
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  actions?: ToastAction[];
}

interface ToastComponentProps extends ToastProps {
  onClose: () => void;
}

const Toast = ({ type, title, message, duration = 5000, onClose, actions }: ToastComponentProps) => {
  useEffect(() => {
    // Don't auto-close confirmation toasts
    if (duration > 0 && type !== 'confirm') {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose, type]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'confirm':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'confirm':
        return 'bg-orange-50 border-orange-200 text-orange-800';
    }
  };

  const getIconStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-600';
      case 'error':
        return 'bg-red-100 text-red-600';
      case 'warning':
        return 'bg-yellow-100 text-yellow-600';
      case 'info':
        return 'bg-blue-100 text-blue-600';
      case 'confirm':
        return 'bg-orange-100 text-orange-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -100, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`w-[28rem] shadow-2xl rounded-lg pointer-events-auto border-2 ${getStyles()}`}
    >
      <div className="p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconStyles()}`}>
              {getIcon()}
            </div>
          </div>
          <div className="ml-4 flex-1 min-w-0">
            <p className="text-base font-semibold truncate">{title}</p>
            {message && (
              <p className="mt-1 text-sm opacity-80 leading-relaxed overflow-hidden" style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical'
              }}>{message}</p>
            )}
          </div>
          {!actions && (
            <div className="ml-2 flex-shrink-0">
              <button
                type="button"
                className="inline-flex w-6 h-6 items-center justify-center text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300 rounded"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
        {actions && actions.length > 0 && (
          <div className="px-4 pb-4 pt-2">
            <div className="flex gap-3 justify-end">
              {actions.map((action, index) => {
                const getButtonStyles = () => {
                  switch (action.style) {
                    case 'danger':
                      return 'bg-red-600 hover:bg-red-700 text-white border-red-600';
                    case 'primary':
                      return 'bg-[#B8860B] hover:bg-[#DAA520] text-white border-[#B8860B]';
                    case 'secondary':
                    default:
                      return 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300';
                  }
                };

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      action.onClick();
                      onClose();
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${getButtonStyles()}`}
                  >
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Toast Container
export const ToastContainer = ({ toasts, removeToast }: { 
  toasts: ToastProps[], 
  removeToast: (id: string) => void 
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-start pt-20 pointer-events-none">
      <div className="space-y-3 pointer-events-auto">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              {...toast}
              onClose={() => removeToast(toast.id!)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Toast;