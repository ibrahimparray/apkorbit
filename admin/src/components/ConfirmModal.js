import { X, AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ open, title, message, confirmLabel, onConfirm, onCancel, danger }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-white dark:bg-surface-800 rounded-3xl p-6 shadow-2xl border border-surface-200 dark:border-surface-700">
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1.5 rounded-xl text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition-all"
        >
          <X size={16} />
        </button>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 mx-auto ${danger ? 'bg-red-50 dark:bg-red-500/10' : 'bg-amber-50 dark:bg-amber-500/10'}`}>
          <AlertTriangle size={22} className={danger ? 'text-red-500' : 'text-amber-500'} />
        </div>
        <h3 className="text-lg font-bold text-surface-900 dark:text-surface-50 text-center mb-1">{title}</h3>
        {message && <p className="text-sm text-surface-500 dark:text-surface-400 text-center mb-6">{message}</p>}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 font-semibold text-sm hover:bg-surface-200 dark:hover:bg-surface-600 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-xl text-white font-semibold text-sm transition-all active:scale-95 shadow-lg ${
              danger ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
            }`}
          >
            {confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
