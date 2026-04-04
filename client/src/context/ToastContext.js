import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import './Toast.css';

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

// ─── Type → icon map ──────────────────────────────────────────────────────────
const ICONS = {
  success: '✅',
  error:   '❌',
  warning: '⚠️',
  info:    'ℹ️',
};

// ─── Default durations (ms) ───────────────────────────────────────────────────
const DEFAULT_DURATION = 4000;

// ─── Single Toast item ────────────────────────────────────────────────────────
const ToastItem = React.memo(({ toast, onRemove }) => {
  const { id, message, title, type, duration } = toast;

  return (
    <div
      className={`toast toast-${type} ${toast.exiting ? 'exiting' : ''}`}
      onClick={() => onRemove(id)}
      role="alert"
      aria-live="polite"
      style={{ '--toast-duration': `${duration}ms` }}
    >
      {/* Icon */}
      <span className="toast-icon" aria-hidden="true">
        {ICONS[type] || ICONS.info}
      </span>

      {/* Content */}
      <div className="toast-content">
        {title
          ? <>
              <div className="toast-title">{title}</div>
              <div className="toast-message">{message}</div>
            </>
          : <div className="toast-message-only">{message}</div>
        }
      </div>

      {/* Close */}
      <button
        className="toast-close"
        onClick={(e) => { e.stopPropagation(); onRemove(id); }}
        aria-label="Dismiss notification"
      >
        ×
      </button>

      {/* Progress bar */}
      <div className="toast-progress" />
    </div>
  );
});

// ─── Toast Container ──────────────────────────────────────────────────────────
const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

// ─── Provider ─────────────────────────────────────────────────────────────────
let _nextId = 1;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts]  = useState([]);
  const timersRef            = useRef({}); // track per-toast timers

  /**
   * showToast(message, type?, options?)
   *
   * @param {string} message        - Main text shown in the toast
   * @param {'success'|'error'|'warning'|'info'} type - Visual style
   * @param {{ title?: string, duration?: number }} options
   */
  const showToast = useCallback((message, type = 'success', options = {}) => {
    const id       = _nextId++;
    const duration = options.duration ?? DEFAULT_DURATION;
    const title    = options.title;

    // Add to list
    setToasts(prev => [...prev, { id, message, title, type, duration, exiting: false }]);

    // Begin exit animation slightly before removal
    timersRef.current[`exit_${id}`] = setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    }, duration);

    // Remove from DOM after animation completes
    timersRef.current[`rm_${id}`] = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      delete timersRef.current[`exit_${id}`];
      delete timersRef.current[`rm_${id}`];
    }, duration + 300);
  }, []);

  // Manual dismiss
  const removeToast = useCallback((id) => {
    // Cancel pending timers
    clearTimeout(timersRef.current[`exit_${id}`]);
    clearTimeout(timersRef.current[`rm_${id}`]);
    // Start exit animation then remove
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
};

export default ToastContext;
