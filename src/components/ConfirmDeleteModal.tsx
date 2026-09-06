import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, LogOut, X, Loader2 } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'logout';
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onClose,
  isLoading = false
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (variant) {
      case 'logout':
        return <LogOut className="w-6 h-6 text-indigo-600" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-amber-600" />;
      case 'primary':
        return <Trash2 className="w-6 h-6 text-indigo-600" />;
      default:
        return <Trash2 className="w-6 h-6 text-rose-600" />;
    }
  };

  const getIconBg = () => {
    switch (variant) {
      case 'logout':
        return 'bg-indigo-50 border-indigo-100';
      case 'warning':
        return 'bg-amber-50 border-amber-100';
      case 'primary':
        return 'bg-indigo-50 border-indigo-100';
      default:
        return 'bg-rose-50 border-rose-100';
    }
  };

  const getConfirmButtonClasses = () => {
    switch (variant) {
      case 'logout':
        return 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200';
      case 'primary':
        return 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200';
      default:
        return 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-100 relative space-y-6"
        >
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${getIconBg()}`}>
              {getIcon()}
            </div>
            <div className="space-y-1 pt-1">
              <h3 className="text-xl font-black text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">{message}</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-6 py-2.5 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2 ${getConfirmButtonClasses()}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{confirmText}</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
