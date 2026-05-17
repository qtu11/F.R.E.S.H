'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useGlobal } from '@/app/providers';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger' | 'warning';
}

export function ConfirmationDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel, cancelLabel, variant = 'default' }: ConfirmationDialogProps) {
  const { t } = useGlobal();
  const variants = {
    default: { icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600', btn: 'bg-[#057A42] hover:bg-[#046034]' },
    danger: { icon: 'bg-red-100 dark:bg-red-900/30 text-red-600', btn: 'bg-red-500 hover:bg-red-600' },
    warning: { icon: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600', btn: 'bg-yellow-500 hover:bg-yellow-600' },
  };

  const v = variants[variant];
  const cLabel = confirmLabel || t('confirm_label');
  const xLabel = cancelLabel || t('cancel_label');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full ${v.icon} flex items-center justify-center mb-4`}>
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">{message}</p>
              <div className="flex gap-3 w-full">
                <button onClick={onClose} className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                  {xLabel}
                </button>
                <button onClick={() => { onConfirm(); onClose(); }} className={`flex-1 py-3 ${v.btn} text-white rounded-xl font-bold text-sm transition-colors`}>
                  {cLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
