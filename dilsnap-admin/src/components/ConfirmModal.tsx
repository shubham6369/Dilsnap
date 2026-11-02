'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AlertTriangle, AlertCircle, HelpCircle, X } from 'lucide-react';

export type ConfirmVariant = 'danger' | 'warning' | 'primary';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | undefined>(undefined);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ message: '' });
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions | string): Promise<boolean> => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      if (typeof opts === 'string') {
        setOptions({ message: opts, variant: 'primary' });
      } else {
        setOptions(opts);
      }
      setIsOpen(true);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  };

  const variant = options.variant || 'primary';
  const title = options.title || (variant === 'danger' ? 'Confirm Dangerous Action' : variant === 'warning' ? 'Warning' : 'Confirmation');
  const confirmText = options.confirmText || (variant === 'danger' ? 'Proceed / Delete' : 'Confirm');
  const cancelText = options.cancelText || 'Cancel';

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#1C1A2D] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    variant === 'danger'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : variant === 'warning'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-[#FF2D55]/20 text-[#FF2D55] border border-[#FF2D55]/30'
                  }`}
                >
                  {variant === 'danger' && <AlertCircle className="w-5 h-5" />}
                  {variant === 'warning' && <AlertTriangle className="w-5 h-5" />}
                  {variant === 'primary' && <HelpCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">{title}</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Please review before continuing</p>
                </div>
              </div>
              <button
                onClick={handleCancel}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed bg-black/30 p-3.5 rounded-2xl border border-white/5">
              {options.message}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition ${
                  variant === 'danger'
                    ? 'bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 shadow-rose-900/30'
                    : variant === 'warning'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 shadow-amber-900/30 text-white'
                    : 'bg-gradient-to-r from-[#FF2D55] to-[#FF7A00] hover:opacity-95 shadow-[#FF2D55]/30'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}

export interface ControlledConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
}: ControlledConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#1C1A2D] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                variant === 'danger'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : variant === 'warning'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-[#FF2D55]/20 text-[#FF2D55] border border-[#FF2D55]/30'
              }`}
            >
              {variant === 'danger' && <AlertCircle className="w-5 h-5" />}
              {variant === 'warning' && <AlertTriangle className="w-5 h-5" />}
              {variant === 'primary' && <HelpCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">{title || 'Confirm Action'}</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Please review before continuing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed bg-black/30 p-3.5 rounded-2xl border border-white/5">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition ${
              variant === 'danger'
                ? 'bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 shadow-rose-900/30'
                : variant === 'warning'
                ? 'bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 shadow-amber-900/30 text-white'
                : 'bg-gradient-to-r from-[#FF2D55] to-[#FF7A00] hover:opacity-95 shadow-[#FF2D55]/30'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
