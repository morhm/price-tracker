'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import Toast, { ToastProps } from './Toast';

type ToastItem = Omit<ToastProps, 'onRemove'>;

interface ToastContextType {
  showToast: (message: string, type?: ToastItem['type'], duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export default function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showToast = (message: string, type: ToastItem['type'] = 'info', duration = 4000) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: ToastItem = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
  };

  const showSuccess = (message: string, duration = 4000) => {
    showToast(message, 'success', duration);
  };

  const showError = (message: string, duration = 4000) => {
    showToast(message, 'error', duration);
  };

  const showWarning = (message: string, duration = 4000) => {
    showToast(message, 'warning', duration);
  };

  const showInfo = (message: string, duration = 4000) => {
    showToast(message, 'info', duration);
  };

  const contextValue: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed inset-0 pointer-events-none z-[9999]">
        <div className="relative h-full">
          {toasts.map((toast, index) => (
            <div
              key={toast.id}
              className="absolute pointer-events-auto"
              style={{
                bottom: `${4 + index * 80}px`,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <Toast
                id={toast.id}
                message={toast.message}
                type={toast.type}
                duration={toast.duration}
                onRemove={removeToast}
              />
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}