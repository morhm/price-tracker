'use client';

import { useEffect, useState } from 'react';

export interface ToastProps {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onRemove: (id: string) => void;
}

export default function Toast({ id, message, type = 'info', duration = 4000, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(id);
    }, 300); // Match animation duration
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 text-white';
      case 'error':
        return 'bg-red-600 text-white';
      case 'warning':
        return 'bg-yellow-600 text-white';
      case 'info':
      default:
        return 'bg-blue-600 text-white';
    }
  };

  return (
    <div
      className={`
        fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[9999]
        px-6 py-4 rounded-lg shadow-lg mx-4
        transition-all duration-300 ease-in-out
        min-w-[400px] max-w-md w-auto
        ${getTypeStyles()}
        ${isVisible && !isExiting ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
        
      `}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={handleClose}
          className="ml-3 text-white/80 hover:text-white focus:outline-none"
          aria-label="Close toast"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}