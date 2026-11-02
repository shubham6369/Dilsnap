'use client';

import React, { createContext, useContext, useState, useCallback, useId } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 4000) => {
      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: useCallback((msg: string, d?: number) => showToast(msg, 'success', d), [showToast]),
    error: useCallback((msg: string, d?: number) => showToast(msg, 'error', d), [showToast]),
    warning: useCallback((msg: string, d?: number) => showToast(msg, 'warning', d), [showToast]),
    info: useCallback((msg: string, d?: number) => showToast(msg, 'info', d), [showToast]),
  };

  return (
    <ToastContext.Provider value={{ showToast, removeToast, toast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        className="fixed top-20 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-200 animate-in slide-in-from-right ${
              item.type === 'success'
                ? 'bg-[#15231E]/95 border-emerald-500/40 text-emerald-300 shadow-emerald-950/40'
                : item.type === 'error'
                ? 'bg-[#29151B]/95 border-rose-500/40 text-rose-300 shadow-rose-950/40'
                : item.type === 'warning'
                ? 'bg-[#2B2313]/95 border-amber-500/40 text-amber-300 shadow-amber-950/40'
                : 'bg-[#181728]/95 border-blue-500/40 text-blue-300 shadow-blue-950/40'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {item.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {item.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {item.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {item.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
            </div>
            <div className="flex-1 text-xs font-semibold leading-relaxed text-white">
              {item.message}
            </div>
            <button
              onClick={() => removeToast(item.id)}
              className="shrink-0 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
